// components/camera/VideoOverlay.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useOSD as useVideoWidget } from "../../hooks/useCameraQueries";
import { useSetOSD as useSetVideoWidget } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface PrivacyMaskArea {
  id: number;
  index: number; // API Index (0-3)
  enabled: boolean;
  x: number; // %
  y: number; // %
  width: number; // %
  height: number; // %
}

export interface VideoOverlayData {
  privacyMasks: PrivacyMaskArea[];
  
  channelTitle: {
    enabled: boolean;
    text: string;     // Not always present in Get, but needed for Set
    x: number;        
    y: number;        
  };
  timeTitle: {
    enabled: boolean;
    showWeek: boolean;
    x: number;
    y: number;
  };
  osdInfo: {
    enabled: boolean; // General toggle (mapped to PTZCoordinates)
    showPresetPoint: boolean;
    showPTZCoordinates: boolean;
    showPattern: boolean;
    alignment: 'left' | 'right';
    x: number;
    y: number;
  };
  textOverlay: {
    enabled: boolean;
    text: string;
    alignment: 'left' | 'right';
    x: number;
    y: number;
  };
  fontSize: 'small' | 'medium' | 'large';
  overlayPicture: {
    enabled: boolean;
    x: number;
    y: number;
  };
  // Add specific fields found in JSON if needed (e.g., Lighting, Defog overlay)
}

const defaultState: VideoOverlayData = {
  privacyMasks: [],
  channelTitle: { enabled: true, text: "Camera 1", x: 5, y: 5 },
  timeTitle: { enabled: true, showWeek: true, x: 80, y: 5 },
  osdInfo: { enabled: false, showPresetPoint: false, showPTZCoordinates: false, showPattern: false, alignment: 'left', x: 5, y: 90 },
  textOverlay: { enabled: false, text: "", alignment: 'left', x: 50, y: 50 },
  fontSize: 'medium',
  overlayPicture: { enabled: false, x: 10, y: 10 },
};

const API_MAX_COORD = 8192;

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Helper to convert API [x1, y1, x2, y2] (0-8192) to UI [x, y, w, h] (0-100%)
 */
const rectToPercent = (x1: number, y1: number, x2: number, y2: number) => {
  // Sanity check for invalid rects (e.g. x2 < x1)
  const safeX2 = Math.max(x1, x2);
  const safeY2 = Math.max(y1, y2);
  
  return {
    x: (x1 / API_MAX_COORD) * 100,
    y: (y1 / API_MAX_COORD) * 100,
    width: ((safeX2 - x1) / API_MAX_COORD) * 100,
    height: ((safeY2 - y1) / API_MAX_COORD) * 100
  };
};

/**
 * Helper to convert UI [x, y, w, h] (0-100%) to API [x1, y1, x2, y2] (0-8192)
 */
const percentToRect = (x: number, y: number, w: number, h: number) => {
  const x1 = Math.round((x / 100) * API_MAX_COORD);
  const y1 = Math.round((y / 100) * API_MAX_COORD);
  const x2 = Math.round(((x + w) / 100) * API_MAX_COORD);
  const y2 = Math.round(((y + h) / 100) * API_MAX_COORD);
  return [x1, y1, x2, y2];
};

const apiToUI = (data: any): VideoOverlayData => {
  if (!data) return defaultState;
  
  const config = data.config || data;
  const prefix = "table.VideoWidget[0].";

  const getVal = (key: string, def: any) => config[prefix + key] ?? def;
  const getBool = (key: string) => String(getVal(key, "false")) === "true";
  const getInt = (key: string) => Number(getVal(key, 0));

  // --- Channel Title ---
  const chRect = rectToPercent(
    getInt("ChannelTitle.Rect[0]"), getInt("ChannelTitle.Rect[1]"),
    getInt("ChannelTitle.Rect[2]"), getInt("ChannelTitle.Rect[3]")
  );

  // --- Time Title ---
  const timeRect = rectToPercent(
    getInt("TimeTitle.Rect[0]"), getInt("TimeTitle.Rect[1]"),
    getInt("TimeTitle.Rect[2]"), getInt("TimeTitle.Rect[3]")
  );

  // --- OSD Info (PTZ) ---
  const ptzRect = rectToPercent(
    getInt("PTZCoordinates.Rect[0]"), getInt("PTZCoordinates.Rect[1]"),
    getInt("PTZCoordinates.Rect[2]"), getInt("PTZCoordinates.Rect[3]")
  );

  // --- Text Overlay (CustomTitle[0]) ---
  // JSON shows CustomTitle[1] has text "||||", assuming CustomTitle[0] is the main one for this UI
  const textRect = rectToPercent(
    getInt("CustomTitle[0].Rect[0]"), getInt("CustomTitle[0].Rect[1]"),
    getInt("CustomTitle[0].Rect[2]"), getInt("CustomTitle[0].Rect[3]")
  );

  // --- Privacy Masks (Covers) ---
  const privacyMasks: PrivacyMaskArea[] = [];
  for (let i = 0; i < 4; i++) {
    const enabled = getBool(`Covers[${i}].EncodeBlend`); // Assuming EncodeBlend controls visibility
    const x1 = getInt(`Covers[${i}].Rect[0]`);
    const y1 = getInt(`Covers[${i}].Rect[1]`);
    const x2 = getInt(`Covers[${i}].Rect[2]`);
    const y2 = getInt(`Covers[${i}].Rect[3]`);
    
    // Only add if enabled or has dimensions (filter out unused slots if necessary, though UI usually shows all or manages list)
    // Here we map all valid ones.
    const rect = rectToPercent(x1, y1, x2, y2);
    if (enabled || (rect.width > 0 && rect.height > 0)) {
        privacyMasks.push({
            id: i,
            index: i,
            enabled,
            ...rect
        });
    }
  }

  // --- Font Size ---
  const fontScale = getInt("FontSizeScale"); // 1 usually
  const fontSize = fontScale < 1 ? 'small' : fontScale > 1 ? 'large' : 'medium';

  // --- Picture ---
  const picRect = rectToPercent(
    getInt("PictureTitle.Rect[0]"), getInt("PictureTitle.Rect[1]"),
    getInt("PictureTitle.Rect[2]"), getInt("PictureTitle.Rect[3]")
  );

  return {
    privacyMasks,
    channelTitle: {
      enabled: getBool("ChannelTitle.EncodeBlend"),
      text: getVal("ChannelTitle.Name", "Camera 1"), // Note: Field might not be in GET, but used in SET
      x: chRect.x,
      y: chRect.y
    },
    timeTitle: {
      enabled: getBool("TimeTitle.EncodeBlend"),
      showWeek: getBool("TimeTitle.ShowWeek"),
      x: timeRect.x,
      y: timeRect.y
    },
    osdInfo: {
      enabled: getBool("PTZCoordinates.EncodeBlend"),
      showPresetPoint: getBool("PTZPreset.EncodeBlend"),
      showPTZCoordinates: getBool("PTZCoordinates.EncodeBlend"),
      showPattern: getBool("PtzPattern.EncodeBlend"),
      alignment: 'left', // Not explicitly in JSON, sticking to default
      x: ptzRect.x,
      y: ptzRect.y
    },
    textOverlay: {
      enabled: getBool("CustomTitle[0].EncodeBlend"),
      text: getVal("CustomTitle[0].Text", ""),
      alignment: 'left',
      x: textRect.x,
      y: textRect.y
    },
    fontSize,
    overlayPicture: {
      enabled: getBool("PictureTitle.EncodeBlend"),
      imageUrl: null, // Cannot fetch image data from config
      x: picRect.x,
      y: picRect.y,
      width: picRect.width,
      height: picRect.height
    },
    osdWarning: { enabled: false }, // Not found in JSON
    gpsCoordinates: { enabled: false, latitude: "", longitude: "" } // Not found
  };
};

const uiToApi = (ui: VideoOverlayData) => {
  const prefix = "table.VideoWidget[0].";
  const payload: any = {};

  // Helper to set rect
  const setRect = (keyBase: string, x: number, y: number, w: number = 0, h: number = 0) => {
    // If w/h are 0 (e.g. titles), we might just set x/y (Rect[0]/Rect[1]) and keep existing width/height or use defaults?
    // The API seems to use full rects. For titles, we usually just update position (0,1). 
    // But to be safe, we calculate x2/y2. If UI doesn't track width for titles, we might assume a default width or read back.
    // *Strategy*: For titles (Channel, Time), UI usually only moves x/y. 
    // We will construct x2/y2 assuming a fixed relative size if we don't have it, OR just send x1/y1 if the API allows partial updates.
    // However, `Set` usually replaces. Let's assume standard widths or use what we parsed if we stored it.
    // Since we don't store width/height for titles in the UI state (only x/y), we have to be careful.
    // *Improved*: For this demo, we'll calculate x2/y2 assuming a standard box size (e.g. 20% width) to ensure valid rects.
    
    const [x1, y1, x2, y2] = percentToRect(x, y, w || 20, h || 5); 
    payload[`${prefix}${keyBase}.Rect[0]`] = x1;
    payload[`${prefix}${keyBase}.Rect[1]`] = y1;
    // Only send x2/y2 if we are confident, or if it's a resizable region like Privacy Mask.
    // For Titles, often x2/y2 are auto-calculated by firmware based on text length, 
    // but sending them helps define the "box".
    payload[`${prefix}${keyBase}.Rect[2]`] = x2;
    payload[`${prefix}${keyBase}.Rect[3]`] = y2;
  };

  // Channel Title
  payload[`${prefix}ChannelTitle.EncodeBlend`] = ui.channelTitle.enabled;
  if (ui.channelTitle.text) payload[`${prefix}ChannelTitle.Name`] = ui.channelTitle.text; // Only send if we have text
  setRect("ChannelTitle", ui.channelTitle.x, ui.channelTitle.y);

  // Time Title
  payload[`${prefix}TimeTitle.EncodeBlend`] = ui.timeTitle.enabled;
  payload[`${prefix}TimeTitle.ShowWeek`] = ui.timeTitle.showWeek;
  setRect("TimeTitle", ui.timeTitle.x, ui.timeTitle.y);

  // OSD Info (PTZ)
  payload[`${prefix}PTZCoordinates.EncodeBlend`] = ui.osdInfo.showPTZCoordinates;
  payload[`${prefix}PTZPreset.EncodeBlend`] = ui.osdInfo.showPresetPoint;
  payload[`${prefix}PtzPattern.EncodeBlend`] = ui.osdInfo.showPattern;
  setRect("PTZCoordinates", ui.osdInfo.x, ui.osdInfo.y);
  // Often these share a position or are relative. We update Coordinates as the anchor.

  // Text Overlay
  payload[`${prefix}CustomTitle[0].EncodeBlend`] = ui.textOverlay.enabled;
  payload[`${prefix}CustomTitle[0].Text`] = ui.textOverlay.text;
  setRect("CustomTitle[0]", ui.textOverlay.x, ui.textOverlay.y);

  // Font Size
  const scale = ui.fontSize === 'small' ? 0.7 : ui.fontSize === 'large' ? 1.2 : 1;
  payload[`${prefix}FontSizeScale`] = scale;

  // Picture
  payload[`${prefix}PictureTitle.EncodeBlend`] = ui.overlayPicture.enabled;
  setRect("PictureTitle", ui.overlayPicture.x, ui.overlayPicture.y);

  // Privacy Masks (Covers)
  // We need to update all 4 slots. If a mask exists in UI at that index, update it. If not, disable it.
  // Note: The UI `privacyMasks` array might have variable length. We map them to fixed indices 0-3.
  for (let i = 0; i < 4; i++) {
    const mask = ui.privacyMasks.find(m => m.index === i);
    if (mask) {
      payload[`${prefix}Covers[${i}].EncodeBlend`] = true; // Use EncodeBlend for enable
      payload[`${prefix}Covers[${i}].PreviewBlend`] = true; // Often paired
      const [x1, y1, x2, y2] = percentToRect(mask.x, mask.y, mask.width, mask.height);
      payload[`${prefix}Covers[${i}].Rect[0]`] = x1;
      payload[`${prefix}Covers[${i}].Rect[1]`] = y1;
      payload[`${prefix}Covers[${i}].Rect[2]`] = x2;
      payload[`${prefix}Covers[${i}].Rect[3]`] = y2;
    } else {
      // Disable unused
      payload[`${prefix}Covers[${i}].EncodeBlend`] = false;
      payload[`${prefix}Covers[${i}].PreviewBlend`] = false;
    }
  }

  return payload;
};


// =============================================================================
// COMPONENT
// =============================================================================

const VideoOverlay: React.FC = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error } = useVideoWidget(camId);
  const mutation = useSetVideoWidget(camId);

  // Local State
  const [settings, setSettings] = useState<VideoOverlayData>(defaultState);
  const [activeSection, setActiveSection] = useState<string>('titles');
  const [isDirty, setIsDirty] = useState(false);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      setSettings(parsed);
      setIsDirty(false);
    }
  }, [apiData]);

  // Handlers
  const handleUpdate = (newSettings: VideoOverlayData) => {
    setSettings(newSettings);
    setIsDirty(true);
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

  const handleSave = () => {
    const payload = uiToApi(settings);
    mutation.mutate(payload);
    setIsDirty(false);
  };

  // Privacy Mask Handlers
  const handleAddMask = () => {
    if (settings.privacyMasks.length >= 4) return; // Max 4 supported by API structure
    
    // Find first available index
    const usedIndices = settings.privacyMasks.map(m => m.index);
    let newIndex = 0;
    while (usedIndices.includes(newIndex)) newIndex++;

    const newMask: PrivacyMaskArea = {
      id: Date.now(),
      index: newIndex,
      enabled: true,
      x: 25 + (newIndex * 5), // Offset slightly
      y: 25 + (newIndex * 5),
      width: 20,
      height: 15,
    };
    handleUpdate({ ...settings, privacyMasks: [...settings.privacyMasks, newMask] });
  };

  const handleDeleteMask = (id: number) => {
    handleUpdate({ ...settings, privacyMasks: settings.privacyMasks.filter(m => m.id !== id) });
  };

  const handleClearMasks = () => {
    handleUpdate({ ...settings, privacyMasks: [] });
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
          <p className="text-gray-400">Chargement des Overlays...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Header & Feedback */}
      <div className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Configuration OSD</h2>
          <p className="text-gray-400 text-sm">
            Gérez les titres, masques de confidentialité et informations à l'écran.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || mutation.isPending}
          className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-lg transition-colors"
        >
          {mutation.isPending ? 'Enregistrement...' : 'Sauvegarder'}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300">
          Erreur: {(error as Error).message}
        </div>
      )}

      {/* Navigation */}
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

      {/* Privacy Mask Section */}
      {activeSection === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Masques de Confidentialité (Covers)
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Définissez jusqu'à 4 zones de masquage.
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <button 
                onClick={handleAddMask} 
                disabled={settings.privacyMasks.length >= 4}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50"
              >
                + Ajouter Masque
              </button>
              <button 
                onClick={handleClearMasks} 
                disabled={settings.privacyMasks.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50"
              >
                Tout Effacer
              </button>
            </div>

            {/* Visual Editor (Simplified) */}
            <div className="relative bg-gray-900 rounded-lg border-2 border-gray-600 aspect-video overflow-hidden">
               <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                  Zone de Prévisualisation
               </div>
               {settings.privacyMasks.map((mask) => (
                  <div 
                    key={mask.id} 
                    className="absolute bg-black/80 border-2 border-red-500 flex items-center justify-center group"
                    style={{ left: `${mask.x}%`, top: `${mask.y}%`, width: `${mask.width}%`, height: `${mask.height}%` }}
                  >
                    <span className="text-xs text-white font-bold opacity-0 group-hover:opacity-100">#{mask.index + 1}</span>
                    <button 
                        onClick={() => handleDeleteMask(mask.id)}
                        className="absolute -top-3 -right-3 bg-red-600 text-white rounded-full w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 hover:scale-110 transition-all"
                    >
                        ×
                    </button>
                  </div>
               ))}
            </div>
            
            <div className="mt-4 grid grid-cols-2 gap-4">
               {settings.privacyMasks.map(mask => (
                   <div key={mask.id} className="p-3 bg-gray-900/50 border border-gray-700 rounded flex justify-between items-center">
                       <span className="text-white text-sm">Masque {mask.index + 1}</span>
                       <span className="text-xs text-gray-400">Pos: {Math.round(mask.x)}%, {Math.round(mask.y)}%</span>
                   </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* Titles Section */}
      {activeSection === 'titles' && (
        <div className="space-y-4">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Titre du Canal</h3>
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
                <input
                  type="text"
                  value={settings.channelTitle.text}
                  onChange={(e) => updateNestedSettings('channelTitle', 'text', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                  placeholder="Nom de la caméra"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-400">Position X</label>
                        <input type="range" min="0" max="100" value={settings.channelTitle.x} onChange={(e) => updateNestedSettings('channelTitle', 'x', parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Position Y</label>
                        <input type="range" min="0" max="100" value={settings.channelTitle.y} onChange={(e) => updateNestedSettings('channelTitle', 'y', parseInt(e.target.value))} className="w-full" />
                    </div>
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Affichage de l'Heure</h3>
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
                <div className="space-y-3">
                     <label className="flex items-center gap-2 text-gray-300 text-sm">
                        <input type="checkbox" checked={settings.timeTitle.showWeek} onChange={(e) => updateNestedSettings('timeTitle', 'showWeek', e.target.checked)} />
                        Afficher le jour de la semaine
                     </label>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400">Position X</label>
                            <input type="range" min="0" max="100" value={settings.timeTitle.x} onChange={(e) => updateNestedSettings('timeTitle', 'x', parseInt(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Position Y</label>
                            <input type="range" min="0" max="100" value={settings.timeTitle.y} onChange={(e) => updateNestedSettings('timeTitle', 'y', parseInt(e.target.value))} className="w-full" />
                        </div>
                    </div>
                </div>
             )}
          </div>
        </div>
      )}

      {/* Overlay & Advanced (Simplified for length) */}
      {(activeSection === 'overlay' || activeSection === 'advanced') && (
        <div className="space-y-4">
            <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Texte Personnalisé (Overlay)</h3>
                <div className="flex items-center gap-4 mb-4">
                     <label className="flex items-center gap-2 text-white">
                        <input type="checkbox" checked={settings.textOverlay.enabled} onChange={(e) => updateNestedSettings('textOverlay', 'enabled', e.target.checked)} />
                        Activer
                     </label>
                </div>
                {settings.textOverlay.enabled && (
                    <input 
                        type="text" 
                        value={settings.textOverlay.text} 
                        onChange={(e) => updateNestedSettings('textOverlay', 'text', e.target.value)}
                        className="w-full bg-gray-800 border-gray-600 rounded text-white p-2"
                        placeholder="Texte à afficher"
                    />
                )}
            </div>

            <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-4">Taille de Police</h3>
                <div className="flex gap-4">
                    {['small', 'medium', 'large'].map(size => (
                        <button
                            key={size}
                            onClick={() => handleUpdate({ ...settings, fontSize: size as any })}
                            className={`px-4 py-2 rounded border ${settings.fontSize === size ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}
                        >
                            {size === 'small' ? 'Petite' : size === 'medium' ? 'Moyenne' : 'Grande'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
      )}

    </div>
  );
};

export default VideoOverlay;