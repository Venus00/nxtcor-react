// components/camera/VideoOverlay.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import {useOSD as  useVideoWidget } from "../../hooks/useCameraQueries";
import { useSetOSD as useSetVideoWidget } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface PrivacyMaskArea {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VideoOverlayData {
  // Note: Privacy Masks are usually part of a separate API (e.g. VideoEncodeROI or a dedicated Mask API),
  // but VideoWidget handles OSD overlays.
  // For this component scope based on "VideoOverlay" name and "GetVideoWidget" usage, 
  // we will focus on the widget elements. 
  // *Adaptation*: I will keep PrivacyMasks in local state/mock if not in VideoWidget, 
  // or use VideoEncodeROI if your system combines them. 
  // Based on your previous ROI component, Privacy Masks might be separate. 
  // Assuming local for now unless specific API provided for Masks in VideoWidget.
  privacyMasks: PrivacyMaskArea[]; 
  
  channelTitle: {
    enabled: boolean; // API: ChannelTitle.EncodeBlend
    text: string;     // API: ChannelTitle.Name
    x: number;        // API: ChannelTitle.Rect[0] / 8192 * 100
    y: number;        // API: ChannelTitle.Rect[1] / 8192 * 100
  };
  timeTitle: {
    enabled: boolean; // API: TimeTitle.EncodeBlend
    showWeek: boolean; // API: TimeTitle.WeekDisplay (if available, else inferred)
    x: number;
    y: number;
  };
  osdInfo: {
    enabled: boolean; // General toggle, or mapped to specific OSD elements like PTZCoordinates
    showPresetPoint: boolean; // API: PTZPreset.EncodeBlend
    showPTZCoordinates: boolean; // API: PTZCoordinates.EncodeBlend
    showPattern: boolean; // API: Pattern.EncodeBlend (if exists) or generic OSD
    alignment: 'left' | 'right'; // API: often inferred from coords or specific key
    x: number;
    y: number;
  };
  textOverlay: {
    enabled: boolean; // API: CustomTitle[0].EncodeBlend
    text: string;     // API: CustomTitle[0].Text
    alignment: 'left' | 'right';
    x: number;
    y: number;
  };
  fontSize: 'small' | 'medium' | 'large'; // API: FontSizeScale
  overlayPicture: {
    enabled: boolean; // API: PictureTitle.EncodeBlend
    imageUrl: string | null;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  osdWarning: {
    enabled: boolean; // API: OSDWarning.EncodeBlend (if exists)
  };
  gpsCoordinates: {
    enabled: boolean; // API: GPSTitle.EncodeBlend
    latitude: string;
    longitude: string;
  };
}

const defaultState: VideoOverlayData = {
  privacyMasks: [],
  channelTitle: { enabled: true, text: "Camera 1", x: 5, y: 5 },
  timeTitle: { enabled: true, showWeek: true, x: 80, y: 5 },
  osdInfo: { enabled: false, showPresetPoint: false, showPTZCoordinates: false, showPattern: false, alignment: 'left', x: 5, y: 90 },
  textOverlay: { enabled: false, text: "", alignment: 'left', x: 50, y: 50 },
  fontSize: 'medium',
  overlayPicture: { enabled: false, imageUrl: null, x: 10, y: 10, width: 20, height: 20 },
  osdWarning: { enabled: false },
  gpsCoordinates: { enabled: false, latitude: "0.00", longitude: "0.00" }
};

const API_MAX_COORD = 8192;

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Parses API response to UI state.
 * API Ref: table.VideoWidget[0]...
 */
const apiToUI = (data: any): VideoOverlayData => {
  if (!data) return defaultState;
  
  const config = data.config || data;
  const prefix = "table.VideoWidget[0].";

  const getVal = (key: string, def: any) => config[prefix + key] ?? def;
  const getBool = (key: string) => String(getVal(key, "false")) === "true";
  const getCoord = (key: string) => Math.round((Number(getVal(key, 0)) / API_MAX_COORD) * 100);

  return {
    privacyMasks: [], // Not typically in VideoWidget, handled separately or local only here
    channelTitle: {
      enabled: getBool("ChannelTitle.EncodeBlend"),
      text: getVal("ChannelTitle.Name", "Camera 1"),
      x: getCoord("ChannelTitle.Rect[0]"),
      y: getCoord("ChannelTitle.Rect[1]")
    },
    timeTitle: {
      enabled: getBool("TimeTitle.EncodeBlend"),
      showWeek: true, // Often inherent in TimeTitle, keeping default
      x: getCoord("TimeTitle.Rect[0]"),
      y: getCoord("TimeTitle.Rect[1]")
    },
    osdInfo: {
      enabled: getBool("PTZCoordinates.EncodeBlend"), // Using Coordinates as proxy for "OSD Info" group
      showPresetPoint: getBool("PTZPreset.EncodeBlend"),
      showPTZCoordinates: getBool("PTZCoordinates.EncodeBlend"),
      showPattern: false, // Not explicitly in provided snippet, default false
      alignment: 'left',
      x: getCoord("PTZCoordinates.Rect[0]"),
      y: getCoord("PTZCoordinates.Rect[1]")
    },
    textOverlay: {
      enabled: getBool("CustomTitle[0].EncodeBlend"),
      text: getVal("CustomTitle[0].Text", ""),
      alignment: 'left',
      x: getCoord("CustomTitle[0].Rect[0]"),
      y: getCoord("CustomTitle[0].Rect[1]")
    },
    fontSize: (Number(getVal("FontSizeScale", 1)) === 1 ? 'medium' : Number(getVal("FontSizeScale", 1)) > 1 ? 'large' : 'small'),
    overlayPicture: {
      enabled: getBool("PictureTitle.EncodeBlend"),
      imageUrl: null, // API doesn't return image data here usually
      x: getCoord("PictureTitle.Rect[0]"),
      y: getCoord("PictureTitle.Rect[1]"),
      width: 20, // Rect usually x1,y1,x2,y2 - calculating width requires full rect parsing, simplified here
      height: 20
    },
    osdWarning: {
      enabled: false // Placeholder
    },
    gpsCoordinates: {
      enabled: getBool("GPSTitle.EncodeBlend"),
      latitude: "0.00",
      longitude: "0.00"
    }
  };
};

/**
 * Converts UI state to API payload.
 */
const uiToApi = (ui: VideoOverlayData) => {
  // const prefix = "table.VideoWidget[0].";
  
  const toApiCoord = (percent: number) => Math.round((percent / 100) * API_MAX_COORD);

  const payload: any = {
    // Channel Title
    [`ChannelTitle.EncodeBlend`]: ui.channelTitle.enabled,
    [`ChannelTitle.Name`]: ui.channelTitle.text,
    [`ChannelTitle.Rect[0]`]: toApiCoord(ui.channelTitle.x),
    [`ChannelTitle.Rect[1]`]: toApiCoord(ui.channelTitle.y),
    
    // Time Title
    [`TimeTitle.EncodeBlend`]: ui.timeTitle.enabled,
    [`TimeTitle.Rect[0]`]: toApiCoord(ui.timeTitle.x),
    [`TimeTitle.Rect[1]`]: toApiCoord(ui.timeTitle.y),

    // OSD Elements
    [`PTZPreset.EncodeBlend`]: ui.osdInfo.showPresetPoint,
    [`PTZCoordinates.EncodeBlend`]: ui.osdInfo.showPTZCoordinates,
    // Note: PTZ Coords Rect typically used for OSD Info position
    [`PTZCoordinates.Rect[0]`]: toApiCoord(ui.osdInfo.x),
    [`PTZCoordinates.Rect[1]`]: toApiCoord(ui.osdInfo.y),

    // Text Overlay (Custom Title 0)
    [`CustomTitle[0].EncodeBlend`]: ui.textOverlay.enabled,
    [`CustomTitle[0].Text`]: ui.textOverlay.text,
    [`CustomTitle[0].Rect[0]`]: toApiCoord(ui.textOverlay.x),
    [`CustomTitle[0].Rect[1]`]: toApiCoord(ui.textOverlay.y),

    // Font Size
    [`FontSizeScale`]: ui.fontSize === 'small' ? 0.7 : ui.fontSize === 'large' ? 1.2 : 1,

    // Picture Overlay
    [`PictureTitle.EncodeBlend`]: ui.overlayPicture.enabled,
    [`PictureTitle.Rect[0]`]: toApiCoord(ui.overlayPicture.x),
    [`PictureTitle.Rect[1]`]: toApiCoord(ui.overlayPicture.y),

    // GPS
    [`GPSTitle.EncodeBlend`]: ui.gpsCoordinates.enabled,
  };

  return payload;
};

// =============================================================================
// COMPONENT
// =============================================================================

const VideoOverlay: React.FC = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error, refetch } = useVideoWidget(camId);
  const mutation = useSetVideoWidget(camId);

  // Local State
  const [settings, setSettings] = useState<VideoOverlayData>(defaultState);
  const [activeSection, setActiveSection] = useState<string>('titles'); // Default to titles as it's main API function
  const [isDirty, setIsDirty] = useState(false);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      // Merge with local privacy masks if needed, as they aren't in this API
      setSettings(prev => ({ ...parsed, privacyMasks: prev.privacyMasks }));
      setIsDirty(false);
    }
  }, [apiData]);

  // Handlers
  const handleUpdate = (newSettings: VideoOverlayData) => {
    setSettings(newSettings);
    setIsDirty(true);
  };

  const handleSave = () => {
    const payload = uiToApi(settings);
    mutation.mutate(payload);
    setIsDirty(false);
  };

  const updateSettings = (key: keyof VideoOverlayData, value: any) => {
    handleUpdate({
      ...settings,
      [key]: value,
    });
  };

  const updateNestedSettings = (parentKey: keyof VideoOverlayData, childKey: string, value: any) => {
    handleUpdate({
      ...settings,
      [parentKey]: {
        ...(settings[parentKey] as any),
        [childKey]: value,
      },
    });
  };

  // ... (Privacy mask handlers kept local for UI demo) ...
  const handleDrawMask = () => {
    const newMask: PrivacyMaskArea = {
      id: Date.now(),
      x: 20, y: 20, width: 100, height: 80,
    };
    updateSettings('privacyMasks', [...settings.privacyMasks, newMask]);
  };

  const handleDeleteMask = (id: number) => {
    updateSettings('privacyMasks', settings.privacyMasks.filter(mask => mask.id !== id));
  };

  const handleClearMasks = () => {
    updateSettings('privacyMasks', []);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateNestedSettings('overlayPicture', 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sections = [
    { id: 'privacy', name: 'Privacy Mask', icon: '🔒' },
    { id: 'titles', name: 'Titles', icon: '📝' },
    { id: 'overlay', name: 'Overlay', icon: '🎨' },
    { id: 'advanced', name: 'Advanced', icon: '⚙️' },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading Overlay Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Feedback & Header */}
      <div className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Video Overlay Configuration</h2>
          <p className="text-gray-400 text-sm">
            Configure on-screen display elements and overlays
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || mutation.isPending}
          className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-lg transition-colors"
        >
          {mutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300">
          Error: {(error as Error).message}
        </div>
      )}

      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeSection === section.id
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            <div className="text-2xl mb-2">{section.icon}</div>
            <div className={`font-semibold text-sm ${
              activeSection === section.id ? 'text-red-400' : 'text-white'
            }`}>
              {section.name}
            </div>
          </button>
        ))}
      </div>

      {/* Privacy Mask Section (Local UI Only for now) */}
      {activeSection === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy Mask (Local Mock)
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Set shielding areas within the monitoring screen (Visual Demo Only)
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <button onClick={handleDrawMask} className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2">
                Draw Mask
              </button>
              <button onClick={handleClearMasks} disabled={settings.privacyMasks.length === 0} className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50">
                Clear All
              </button>
            </div>

            {/* Preview Area */}
            <div className="relative bg-gray-900 rounded-lg border-2 border-gray-600 aspect-video overflow-hidden">
               {/* Mask rendering logic... */}
               <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Video Preview
               </div>
               {settings.privacyMasks.map((mask) => (
                  <div key={mask.id} className="absolute bg-black/80 border-2 border-red-500" style={{ left: `${mask.x}%`, top: `${mask.y}%`, width: mask.width, height: mask.height }}>
                    <button onClick={() => handleDeleteMask(mask.id)} className="absolute -top-2 -right-2 w-4 h-4 bg-red-500 text-white rounded-full flex items-center justify-center text-xs">x</button>
                  </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Titles Section */}
      {activeSection === 'titles' && (
        <div className="space-y-4">
          {/* Channel Title */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Channel Title</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.channelTitle.enabled}
                  onChange={(e) => updateNestedSettings('channelTitle', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            {settings.channelTitle.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Name</label>
                  <input
                    type="text"
                    value={settings.channelTitle.text}
                    onChange={(e) => updateNestedSettings('channelTitle', 'text', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">X (%)</label>
                    <input type="range" min="0" max="100" value={settings.channelTitle.x} onChange={(e) => updateNestedSettings('channelTitle', 'x', parseInt(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Y (%)</label>
                    <input type="range" min="0" max="100" value={settings.channelTitle.y} onChange={(e) => updateNestedSettings('channelTitle', 'y', parseInt(e.target.value))} className="w-full" />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Title */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Time Title</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.timeTitle.enabled}
                  onChange={(e) => updateNestedSettings('timeTitle', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            {settings.timeTitle.enabled && (
              <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300">X (%)</label>
                    <input type="range" min="0" max="100" value={settings.timeTitle.x} onChange={(e) => updateNestedSettings('timeTitle', 'x', parseInt(e.target.value))} className="w-full" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300">Y (%)</label>
                    <input type="range" min="0" max="100" value={settings.timeTitle.y} onChange={(e) => updateNestedSettings('timeTitle', 'y', parseInt(e.target.value))} className="w-full" />
                  </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay Section */}
      {activeSection === 'overlay' && (
        <div className="space-y-4">
          {/* OSD Info */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">OSD Info</h3>
            <div className="space-y-2">
               <label className="flex items-center gap-2 text-gray-300">
                 <input type="checkbox" checked={settings.osdInfo.showPresetPoint} onChange={(e) => updateNestedSettings('osdInfo', 'showPresetPoint', e.target.checked)} />
                 Show Preset Point
               </label>
               <label className="flex items-center gap-2 text-gray-300">
                 <input type="checkbox" checked={settings.osdInfo.showPTZCoordinates} onChange={(e) => updateNestedSettings('osdInfo', 'showPTZCoordinates', e.target.checked)} />
                 Show PTZ Coordinates
               </label>
            </div>
            {(settings.osdInfo.showPresetPoint || settings.osdInfo.showPTZCoordinates) && (
              <div className="mt-4 grid grid-cols-2 gap-3">
                 <input type="range" min="0" max="100" value={settings.osdInfo.x} onChange={(e) => updateNestedSettings('osdInfo', 'x', parseInt(e.target.value))} className="w-full" />
                 <input type="range" min="0" max="100" value={settings.osdInfo.y} onChange={(e) => updateNestedSettings('osdInfo', 'y', parseInt(e.target.value))} className="w-full" />
              </div>
            )}
          </div>

          {/* Text Overlay */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-white">Text Overlay</h3>
               <input type="checkbox" checked={settings.textOverlay.enabled} onChange={(e) => updateNestedSettings('textOverlay', 'enabled', e.target.checked)} />
            </div>
            {settings.textOverlay.enabled && (
               <div className="space-y-3">
                 <input type="text" value={settings.textOverlay.text} onChange={(e) => updateNestedSettings('textOverlay', 'text', e.target.value)} className="w-full bg-gray-800 text-white p-2 rounded" placeholder="Custom Text" />
                 <div className="grid grid-cols-2 gap-3">
                    <input type="range" min="0" max="100" value={settings.textOverlay.x} onChange={(e) => updateNestedSettings('textOverlay', 'x', parseInt(e.target.value))} className="w-full" />
                    <input type="range" min="0" max="100" value={settings.textOverlay.y} onChange={(e) => updateNestedSettings('textOverlay', 'y', parseInt(e.target.value))} className="w-full" />
                 </div>
               </div>
            )}
          </div>

          {/* Font Size */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
             <h3 className="text-lg font-semibold text-white mb-2">Font Size</h3>
             <div className="flex gap-4">
               {['small', 'medium', 'large'].map(size => (
                 <button 
                   key={size} 
                   onClick={() => updateSettings('fontSize', size)}
                   className={`px-4 py-2 rounded ${settings.fontSize === size ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}
                 >
                   {size.charAt(0).toUpperCase() + size.slice(1)}
                 </button>
               ))}
             </div>
          </div>
        </div>
      )}

      {/* Advanced */}
      {activeSection === 'advanced' && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
           <h3 className="text-lg font-semibold text-white mb-4">Advanced Overlay</h3>
           
           {/* Picture Overlay */}
           <div className="mb-6">
             <div className="flex items-center justify-between mb-2">
               <h4 className="text-white">Picture Overlay</h4>
               <input type="checkbox" checked={settings.overlayPicture.enabled} onChange={(e) => updateNestedSettings('overlayPicture', 'enabled', e.target.checked)} />
             </div>
             {settings.overlayPicture.enabled && (
               <div className="grid grid-cols-2 gap-3">
                  <input type="range" min="0" max="100" value={settings.overlayPicture.x} onChange={(e) => updateNestedSettings('overlayPicture', 'x', parseInt(e.target.value))} className="w-full" />
                  <input type="range" min="0" max="100" value={settings.overlayPicture.y} onChange={(e) => updateNestedSettings('overlayPicture', 'y', parseInt(e.target.value))} className="w-full" />
               </div>
             )}
           </div>

           {/* GPS */}
           <div>
             <div className="flex items-center justify-between mb-2">
               <h4 className="text-white">GPS Coordinates</h4>
               <input type="checkbox" checked={settings.gpsCoordinates.enabled} onChange={(e) => updateNestedSettings('gpsCoordinates', 'enabled', e.target.checked)} />
             </div>
           </div>
        </div>
      )}

    </div>
  );
};

export default VideoOverlay;