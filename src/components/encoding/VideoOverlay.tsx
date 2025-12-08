// components/camera/VideoOverlay.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import {useOSD as useVideoWidget } from "../../hooks/useCameraQueries";
import {useSetOSD as useSetVideoWidget } from "../../hooks/useCameraMutations";

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
    text: string;
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
    enabled: boolean; // General toggle
    showPresetPoint: boolean;
    showPTZCoordinates: boolean;
    showPattern: boolean;
    showZoom: boolean;
    x: number;
    y: number;
  };
  textOverlay: {
    enabled: boolean;
    text: string;
    x: number;
    y: number;
  };
  fontSize: 'small' | 'medium' | 'large';
  overlayPicture: {
    enabled: boolean;
    x: number;
    y: number;
  };
  osdWarning: {
    enabled: boolean;
  };
}

const defaultState: VideoOverlayData = {
  privacyMasks: [],
  channelTitle: { enabled: true, text: "Camera 1", x: 5, y: 5 },
  timeTitle: { enabled: true, showWeek: true, x: 80, y: 5 },
  osdInfo: { enabled: false, showPresetPoint: false, showPTZCoordinates: false, showPattern: false, showZoom: false, x: 5, y: 90 },
  textOverlay: { enabled: false, text: "", x: 50, y: 50 },
  fontSize: 'medium',
  overlayPicture: { enabled: false, x: 10, y: 10 },
  osdWarning: { enabled: false },
};

const API_MAX_COORD = 8192;

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Helper: Convert API Rect [0-8192] to UI Percent [0-100]
 */
const rectToPercent = (x1: number, y1: number, x2: number, y2: number) => {
  const safeX2 = Math.max(x1, x2);
  const safeY2 = Math.max(y1, y2);
  
  // Avoid division by zero or NaN
  const width = safeX2 - x1;
  const height = safeY2 - y1;

  return {
    x: Math.min(100, Math.max(0, (x1 / API_MAX_COORD) * 100)),
    y: Math.min(100, Math.max(0, (y1 / API_MAX_COORD) * 100)),
    width: Math.min(100, (width / API_MAX_COORD) * 100),
    height: Math.min(100, (height / API_MAX_COORD) * 100)
  };
};

/**
 * Helper: Convert UI Percent [0-100] to API Rect [0-8192]
 */
const percentToRect = (x: number, y: number, w: number, h: number) => {
  const x1 = Math.round((x / 100) * API_MAX_COORD);
  const y1 = Math.round((y / 100) * API_MAX_COORD);
  const x2 = Math.round(((x + w) / 100) * API_MAX_COORD);
  const y2 = Math.round(((y + h) / 100) * API_MAX_COORD);
  return [x1, y1, x2, y2];
};

/**
 * PARSE API RESPONSE (GET)
 * Reads keys starting with "table.VideoWidget[0]."
 */
const apiToUI = (data: any): VideoOverlayData => {
  if (!data) return defaultState;
  
  const config = data.config || data;
  const prefix = "table.VideoWidget[0]."; // GET uses table. prefix

  const getVal = (key: string, def: any) => config[prefix + key] ?? def;
  const getBool = (key: string) => String(getVal(key, "false")) === "true";
  const getInt = (key: string) => Number(getVal(key, 0));

  // --- Coordinates & Rects ---
  const chRect = rectToPercent(getInt("ChannelTitle.Rect[0]"), getInt("ChannelTitle.Rect[1]"), getInt("ChannelTitle.Rect[2]"), getInt("ChannelTitle.Rect[3]"));
  const timeRect = rectToPercent(getInt("TimeTitle.Rect[0]"), getInt("TimeTitle.Rect[1]"), getInt("TimeTitle.Rect[2]"), getInt("TimeTitle.Rect[3]"));
  // Use PTZCoordinates as anchor for OSD Info group
  const ptzRect = rectToPercent(getInt("PTZCoordinates.Rect[0]"), getInt("PTZCoordinates.Rect[1]"), getInt("PTZCoordinates.Rect[2]"), getInt("PTZCoordinates.Rect[3]"));
  const textRect = rectToPercent(getInt("CustomTitle[0].Rect[0]"), getInt("CustomTitle[0].Rect[1]"), getInt("CustomTitle[0].Rect[2]"), getInt("CustomTitle[0].Rect[3]"));
  const picRect = rectToPercent(getInt("PictureTitle.Rect[0]"), getInt("PictureTitle.Rect[1]"), getInt("PictureTitle.Rect[2]"), getInt("PictureTitle.Rect[3]"));

  // --- Privacy Masks (Covers) ---
  const privacyMasks: PrivacyMaskArea[] = [];
  for (let i = 0; i < 4; i++) {
    const enabled = getBool(`Covers[${i}].EncodeBlend`);
    const rect = rectToPercent(getInt(`Covers[${i}].Rect[0]`), getInt(`Covers[${i}].Rect[1]`), getInt(`Covers[${i}].Rect[2]`), getInt(`Covers[${i}].Rect[3]`));
    
    // Show if enabled OR has non-zero size
    if (enabled || (rect.width > 0 && rect.height > 0)) {
        privacyMasks.push({ id: i, index: i, enabled, ...rect });
    }
  }

  // --- Font Size ---
  const fontScale = getInt("FontSizeScale");
  const fontSize = fontScale < 1 ? 'small' : fontScale > 1 ? 'large' : 'medium';

  return {
    privacyMasks,
    channelTitle: {
      enabled: getBool("ChannelTitle.EncodeBlend"),
      text: getVal("ChannelTitle.Name", "Camera 1"),
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
      // Logic: enabled if any sub-component is enabled
      enabled: getBool("PTZCoordinates.EncodeBlend") || getBool("PTZPreset.EncodeBlend"), 
      showPresetPoint: getBool("PTZPreset.EncodeBlend"),
      showPTZCoordinates: getBool("PTZCoordinates.EncodeBlend"),
      showPattern: getBool("PtzPattern.EncodeBlend"),
      showZoom: getBool("PTZZoom.EncodeBlend"),
      x: ptzRect.x,
      y: ptzRect.y
    },
    textOverlay: {
      enabled: getBool("CustomTitle[0].EncodeBlend"),
      text: getVal("CustomTitle[0].Text", ""),
      x: textRect.x,
      y: textRect.y
    },
    fontSize,
    overlayPicture: {
      enabled: getBool("PictureTitle.EncodeBlend"),
      x: picRect.x,
      y: picRect.y,
    },
    osdWarning: {
      enabled: false
    }
  };
};

/**
 * BUILD API PAYLOAD (SET)
 * Uses keys starting with "VideoWidget[0]." (NO "table." prefix)
 */
const uiToApi = (ui: VideoOverlayData) => {
  const prefix = ""; // SET uses prefix without 'table.'
  const payload: any = {};

  // Helper to set rect
  const setRect = (keyBase: string, x: number, y: number, w: number = 0, h: number = 0) => {
    const [x1, y1, x2, y2] = percentToRect(x, y, w || 20, h || 5); 
    payload[`${prefix}${keyBase}.Rect[0]`] = x1;
    payload[`${prefix}${keyBase}.Rect[1]`] = y1;
    payload[`${prefix}${keyBase}.Rect[2]`] = x2;
    payload[`${prefix}${keyBase}.Rect[3]`] = y2;
  };

  // --- Channel Title ---
  payload[`${prefix}ChannelTitle.EncodeBlend`] = ui.channelTitle.enabled;
  payload[`${prefix}ChannelTitle.Name`] = ui.channelTitle.text;
  setRect("ChannelTitle", ui.channelTitle.x, ui.channelTitle.y);

  // --- Time Title ---
  payload[`${prefix}TimeTitle.EncodeBlend`] = ui.timeTitle.enabled;
  payload[`${prefix}TimeTitle.ShowWeek`] = ui.timeTitle.showWeek;
  setRect("TimeTitle", ui.timeTitle.x, ui.timeTitle.y);

  // --- OSD Elements ---
  payload[`${prefix}PTZPreset.EncodeBlend`] = ui.osdInfo.showPresetPoint;
  payload[`${prefix}PTZCoordinates.EncodeBlend`] = ui.osdInfo.showPTZCoordinates;
  payload[`${prefix}PtzPattern.EncodeBlend`] = ui.osdInfo.showPattern;
  payload[`${prefix}PTZZoom.EncodeBlend`] = ui.osdInfo.showZoom;
  
  // Sync positions for all OSD elements to the main OSD coordinates group
  setRect("PTZCoordinates", ui.osdInfo.x, ui.osdInfo.y);
  setRect("PTZPreset", ui.osdInfo.x, ui.osdInfo.y);
  setRect("PtzPattern", ui.osdInfo.x, ui.osdInfo.y);
  setRect("PTZZoom", ui.osdInfo.x, ui.osdInfo.y);

  // --- Text Overlay (CustomTitle[0]) ---
  payload[`${prefix}CustomTitle[0].EncodeBlend`] = ui.textOverlay.enabled;
  payload[`${prefix}CustomTitle[0].Text`] = ui.textOverlay.text;
  setRect("CustomTitle[0]", ui.textOverlay.x, ui.textOverlay.y);

  // --- Font Size ---
  const scale = ui.fontSize === 'small' ? 0.7 : ui.fontSize === 'large' ? 1.2 : 1;
  payload[`${prefix}FontSizeScale`] = scale;

  // --- Picture Overlay ---
  payload[`${prefix}PictureTitle.EncodeBlend`] = ui.overlayPicture.enabled;
  setRect("PictureTitle", ui.overlayPicture.x, ui.overlayPicture.y);

  // --- Privacy Masks (Covers) ---
  for (let i = 0; i < 4; i++) {
    const mask = ui.privacyMasks.find(m => m.index === i);
    if (mask) {
      payload[`${prefix}Covers[${i}].EncodeBlend`] = true;
      payload[`${prefix}Covers[${i}].PreviewBlend`] = true;
      const [x1, y1, x2, y2] = percentToRect(mask.x, mask.y, mask.width, mask.height);
      payload[`${prefix}Covers[${i}].Rect[0]`] = x1;
      payload[`${prefix}Covers[${i}].Rect[1]`] = y1;
      payload[`${prefix}Covers[${i}].Rect[2]`] = x2;
      payload[`${prefix}Covers[${i}].Rect[3]`] = y2;
    } else {
      payload[`${prefix}Covers[${i}].EncodeBlend`] = false;
      // It's good practice to send EncodeBlend=false to disable
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

  // --- Mask Handlers ---
  const handleAddMask = () => {
    if (settings.privacyMasks.length >= 4) return;
    
    const usedIndices = settings.privacyMasks.map(m => m.index);
    let newIndex = 0;
    while (usedIndices.includes(newIndex)) newIndex++;

    const newMask: PrivacyMaskArea = {
      id: Date.now(),
      index: newIndex,
      enabled: true,
      x: 20 + (newIndex * 5),
      y: 20 + (newIndex * 5),
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
          <p className="text-gray-400">Chargement des paramètres OSD...</p>
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
            Titres, date, masques de confidentialité et informations superposées
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

      {/* Tabs */}
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

      {/* --- PRIVACY MASK TAB --- */}
      {activeSection === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Masques de Confidentialité (Covers)</h3>
            <p className="text-sm text-gray-400 mb-4">
              Définissez jusqu'à 4 zones de masquage pour protéger la vie privée.
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <button 
                onClick={handleAddMask} 
                disabled={settings.privacyMasks.length >= 4}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Ajouter Masque
              </button>
              <button 
                onClick={handleClearMasks} 
                disabled={settings.privacyMasks.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Tout Effacer
              </button>
            </div>

            {/* Visual Editor */}
            <div className="relative bg-gray-900 rounded-lg border-2 border-gray-600 aspect-video overflow-hidden group/editor">
                <div className="absolute inset-0 flex items-center justify-center text-gray-500 pointer-events-none">
                  Zone de Prévisualisation (1920x1080)
                </div>
                {settings.privacyMasks.map((mask) => (
                  <div 
                    key={mask.id} 
                    className="absolute bg-black/90 border border-red-500 flex items-center justify-center group"
                    style={{ left: `${mask.x}%`, top: `${mask.y}%`, width: `${mask.width}%`, height: `${mask.height}%` }}
                  >
                    <span className="text-xs text-white opacity-50 font-bold select-none">#{mask.index + 1}</span>
                    <button 
                        onClick={() => handleDeleteMask(mask.id)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hover:scale-110"
                        title="Supprimer"
                    >
                        ×
                    </button>
                  </div>
                ))}
            </div>
            
            {/* List View */}
            {settings.privacyMasks.length > 0 && (
              <div className="mt-4 grid grid-cols-2 gap-4">
                  {settings.privacyMasks.map(mask => (
                      <div key={mask.id} className="p-2 bg-gray-900/50 border border-gray-700 rounded flex justify-between items-center">
                          <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                            <span className="text-white text-sm">Masque {mask.index + 1}</span>
                          </div>
                          <span className="text-xs text-gray-400">Pos: {Math.round(mask.x)}%, {Math.round(mask.y)}%</span>
                      </div>
                  ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* --- TITLES TAB --- */}
      {activeSection === 'titles' && (
        <div className="space-y-4">
          {/* Channel Title */}
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
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            
            {settings.channelTitle.enabled && (
              <div className="space-y-4 animate-fadeIn">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Nom</label>
                  <input
                    type="text"
                    value={settings.channelTitle.text}
                    onChange={(e) => updateNestedSettings('channelTitle', 'text', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-900 border border-gray-600 rounded-lg text-white focus:border-red-500 outline-none"
                    placeholder="Nom de la caméra"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Position X ({settings.channelTitle.x}%)</label>
                        <input type="range" min="0" max="100" value={settings.channelTitle.x} onChange={(e) => updateNestedSettings('channelTitle', 'x', parseInt(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400 mb-1 block">Position Y ({settings.channelTitle.y}%)</label>
                        <input type="range" min="0" max="100" value={settings.channelTitle.y} onChange={(e) => updateNestedSettings('channelTitle', 'y', parseInt(e.target.value))} className="w-full accent-red-600" />
                    </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Title */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Affichage Heure</h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.timeTitle.enabled}
                  onChange={(e) => updateNestedSettings('timeTitle', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
             
             {settings.timeTitle.enabled && (
                <div className="space-y-4 animate-fadeIn">
                     <label className="flex items-center gap-2 text-gray-300 text-sm cursor-pointer hover:text-white">
                        <input type="checkbox" checked={settings.timeTitle.showWeek} onChange={(e) => updateNestedSettings('timeTitle', 'showWeek', e.target.checked)} className="rounded border-gray-600 text-red-600 focus:ring-red-500" />
                        Afficher le jour de la semaine
                     </label>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Position X ({settings.timeTitle.x}%)</label>
                            <input type="range" min="0" max="100" value={settings.timeTitle.x} onChange={(e) => updateNestedSettings('timeTitle', 'x', parseInt(e.target.value))} className="w-full accent-red-600" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400 mb-1 block">Position Y ({settings.timeTitle.y}%)</label>
                            <input type="range" min="0" max="100" value={settings.timeTitle.y} onChange={(e) => updateNestedSettings('timeTitle', 'y', parseInt(e.target.value))} className="w-full accent-red-600" />
                        </div>
                    </div>
                </div>
             )}
          </div>
        </div>
      )}

      {/* --- OVERLAY TAB --- */}
      {activeSection === 'overlay' && (
        <div className="space-y-4">
          {/* OSD Info Group */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Informations OSD</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
               <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700 cursor-pointer hover:border-gray-600">
                 <input type="checkbox" checked={settings.osdInfo.showPresetPoint} onChange={(e) => updateNestedSettings('osdInfo', 'showPresetPoint', e.target.checked)} className="w-4 h-4 text-red-600 rounded bg-gray-800 border-gray-600" />
                 <span className="text-gray-300 text-sm">Nom du Préréglage (Preset)</span>
               </label>
               <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700 cursor-pointer hover:border-gray-600">
                 <input type="checkbox" checked={settings.osdInfo.showPTZCoordinates} onChange={(e) => updateNestedSettings('osdInfo', 'showPTZCoordinates', e.target.checked)} className="w-4 h-4 text-red-600 rounded bg-gray-800 border-gray-600" />
                 <span className="text-gray-300 text-sm">Coordonnées PTZ</span>
               </label>
               <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700 cursor-pointer hover:border-gray-600">
                 <input type="checkbox" checked={settings.osdInfo.showZoom} onChange={(e) => updateNestedSettings('osdInfo', 'showZoom', e.target.checked)} className="w-4 h-4 text-red-600 rounded bg-gray-800 border-gray-600" />
                 <span className="text-gray-300 text-sm">Taux de Zoom</span>
               </label>
               <label className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700 cursor-pointer hover:border-gray-600">
                 <input type="checkbox" checked={settings.osdInfo.showPattern} onChange={(e) => updateNestedSettings('osdInfo', 'showPattern', e.target.checked)} className="w-4 h-4 text-red-600 rounded bg-gray-800 border-gray-600" />
                 <span className="text-gray-300 text-sm">Pattern / Tour Info</span>
               </label>
            </div>
            
            {/* Global Position for OSD Elements */}
            <div className="p-4 bg-gray-900/30 rounded-lg">
              <label className="text-xs text-gray-400 block mb-2 font-medium uppercase tracking-wider">Position du Groupe OSD</label>
              <div className="grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Axe X ({settings.osdInfo.x}%)</span>
                    <input type="range" min="0" max="100" value={settings.osdInfo.x} onChange={(e) => updateNestedSettings('osdInfo', 'x', parseInt(e.target.value))} className="w-full accent-blue-500" />
                  </div>
                  <div>
                    <span className="text-xs text-gray-500 mb-1 block">Axe Y ({settings.osdInfo.y}%)</span>
                    <input type="range" min="0" max="100" value={settings.osdInfo.y} onChange={(e) => updateNestedSettings('osdInfo', 'y', parseInt(e.target.value))} className="w-full accent-blue-500" />
                  </div>
              </div>
            </div>
          </div>

          {/* Custom Text Overlay */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-white">Texte Personnalisé</h3>
               <label className="relative inline-flex items-center cursor-pointer">
                 <input
                   type="checkbox"
                   checked={settings.textOverlay.enabled}
                   onChange={(e) => updateNestedSettings('textOverlay', 'enabled', e.target.checked)}
                   className="sr-only peer"
                 />
                 <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
               </label>
            </div>
            {settings.textOverlay.enabled && (
               <div className="space-y-4 animate-fadeIn">
                 <input 
                    type="text" 
                    value={settings.textOverlay.text} 
                    onChange={(e) => updateNestedSettings('textOverlay', 'text', e.target.value)}
                    className="w-full bg-gray-900 border border-gray-600 rounded-lg text-white p-2 focus:border-red-500 outline-none"
                    placeholder="Entrez le texte à afficher (Ex: Zone Nord)"
                 />
                 <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">X (%)</label>
                      <input type="range" min="0" max="100" value={settings.textOverlay.x} onChange={(e) => updateNestedSettings('textOverlay', 'x', parseInt(e.target.value))} className="w-full accent-red-600" />
                    </div>
                    <div>
                      <label className="text-xs text-gray-400 mb-1 block">Y (%)</label>
                      <input type="range" min="0" max="100" value={settings.textOverlay.y} onChange={(e) => updateNestedSettings('textOverlay', 'y', parseInt(e.target.value))} className="w-full accent-red-600" />
                    </div>
                 </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADVANCED TAB --- */}
      {activeSection === 'advanced' && (
        <div className="space-y-6">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
              <h3 className="text-lg font-semibold text-white mb-4">Apparence</h3>
              
              {/* Font Size */}
              <div className="mb-6">
                  <label className="text-sm text-gray-300 block mb-3">Taille de Police OSD</label>
                  <div className="flex gap-4">
                      {['small', 'medium', 'large'].map(size => (
                          <button
                              key={size}
                              onClick={() => handleUpdate({ ...settings, fontSize: size as any })}
                              className={`flex-1 px-4 py-3 rounded-lg border transition-all ${
                                settings.fontSize === size 
                                  ? 'bg-red-600 border-red-600 text-white shadow-lg shadow-red-900/30' 
                                  : 'bg-transparent border-gray-600 text-gray-400 hover:border-gray-500 hover:text-white'
                              }`}
                          >
                              {size === 'small' ? 'Petite' : size === 'medium' ? 'Moyenne' : 'Grande'}
                          </button>
                      ))}
                  </div>
              </div>

              <div className="border-t border-gray-700 my-4"></div>

              {/* Picture Overlay */}
              <div className="mt-6">
                  <div className="flex justify-between items-center mb-4">
                      <div>
                        <span className="text-white font-medium block">Image Overlay (Logo)</span>
                        <span className="text-xs text-gray-400">Superposer une image (ex: logo) sur le flux</span>
                      </div>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={settings.overlayPicture.enabled}
                          onChange={(e) => updateNestedSettings('overlayPicture', 'enabled', e.target.checked)}
                          className="sr-only peer"
                        />
                        <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
                      </label>
                  </div>
                  
                  {settings.overlayPicture.enabled && (
                      <div className="p-4 bg-gray-900/50 rounded-lg animate-fadeIn">
                          <p className="text-xs text-yellow-500 mb-3">
                            ⚠️ Note: L'image doit être uploadée via l'outil de gestion de fichiers avant d'être activée ici.
                          </p>
                          <div className="grid grid-cols-2 gap-4">
                              <div>
                                 <label className="text-xs text-gray-400 mb-1 block">Position X</label>
                                 <input type="range" min="0" max="100" value={settings.overlayPicture.x} onChange={(e) => updateNestedSettings('overlayPicture', 'x', parseInt(e.target.value))} className="w-full accent-green-500" />
                              </div>
                              <div>
                                 <label className="text-xs text-gray-400 mb-1 block">Position Y</label>
                                 <input type="range" min="0" max="100" value={settings.overlayPicture.y} onChange={(e) => updateNestedSettings('overlayPicture', 'y', parseInt(e.target.value))} className="w-full accent-green-500" />
                              </div>
                          </div>
                      </div>
                  )}
              </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default VideoOverlay;