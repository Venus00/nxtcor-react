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
  return {
    x: (x1 / API_MAX_COORD) * 100,
    y: (y1 / API_MAX_COORD) * 100,
    width: ((safeX2 - x1) / API_MAX_COORD) * 100,
    height: ((safeY2 - y1) / API_MAX_COORD) * 100
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
 *
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
    
    // Show if enabled OR has non-zero size (implies it was drawn)
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
      // Using PTZCoordinates status as proxy for general OSD enable, though individual toggles exist
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
      enabled: false // Placeholder if not found in specific config
    }
  };
};

/**
 * BUILD API PAYLOAD (SET)
 * Uses keys starting with "VideoWidget[0]." (No "table." prefix)
 *
 */
const uiToApi = (ui: VideoOverlayData) => {
  const prefix = "VideoWidget[0]."; // SET uses prefix without 'table.'
  const payload: any = {};

  // Helper to set rect
  // Default W/H provided for titles where UI might only control X/Y
  const setRect = (keyBase: string, x: number, y: number, w: number = 0, h: number = 0) => {
    const [x1, y1, x2, y2] = percentToRect(x, y, w || 20, h || 5); 
    payload[`${keyBase}.Rect[0]`] = x1;
    payload[`${keyBase}.Rect[1]`] = y1;
    payload[`${keyBase}.Rect[2]`] = x2;
    payload[`${keyBase}.Rect[3]`] = y2;
  };

  // --- Channel Title ---
  payload[`ChannelTitle.EncodeBlend`] = ui.channelTitle.enabled;
  payload[`ChannelTitle.Name`] = ui.channelTitle.text;
  setRect("ChannelTitle", ui.channelTitle.x, ui.channelTitle.y);

  // --- Time Title ---
  payload[`TimeTitle.EncodeBlend`] = ui.timeTitle.enabled;
  payload[`TimeTitle.ShowWeek`] = ui.timeTitle.showWeek;
  setRect("TimeTitle", ui.timeTitle.x, ui.timeTitle.y);

  // --- OSD Elements ---
  payload[`PTZPreset.EncodeBlend`] = ui.osdInfo.showPresetPoint;
  payload[`PTZCoordinates.EncodeBlend`] = ui.osdInfo.showPTZCoordinates;
  payload[`PtzPattern.EncodeBlend`] = ui.osdInfo.showPattern;
  payload[`PTZZoom.EncodeBlend`] = ui.osdInfo.showZoom;
  
  // Sync positions for all OSD elements to the main OSD coordinates
  setRect("PTZCoordinates", ui.osdInfo.x, ui.osdInfo.y);
  setRect("PTZPreset", ui.osdInfo.x, ui.osdInfo.y);
  setRect("PtzPattern", ui.osdInfo.x, ui.osdInfo.y);
  setRect("PTZZoom", ui.osdInfo.x, ui.osdInfo.y);

  // --- Text Overlay (CustomTitle[0]) ---
  payload[`CustomTitle[0].EncodeBlend`] = ui.textOverlay.enabled;
  payload[`CustomTitle[0].Text`] = ui.textOverlay.text;
  setRect("CustomTitle[0]", ui.textOverlay.x, ui.textOverlay.y);

  // --- Font Size ---
  const scale = ui.fontSize === 'small' ? 0.7 : ui.fontSize === 'large' ? 1.2 : 1;
  payload[`FontSizeScale`] = scale;

  // --- Picture Overlay ---
  payload[`PictureTitle.EncodeBlend`] = ui.overlayPicture.enabled;
  setRect("PictureTitle", ui.overlayPicture.x, ui.overlayPicture.y);

  // --- Privacy Masks (Covers) ---
  for (let i = 0; i < 4; i++) {
    const mask = ui.privacyMasks.find(m => m.index === i);
    if (mask) {
      payload[`Covers[${i}].EncodeBlend`] = true;
      payload[`Covers[${i}].PreviewBlend`] = true;
      const [x1, y1, x2, y2] = percentToRect(mask.x, mask.y, mask.width, mask.height);
      payload[`Covers[${i}].Rect[0]`] = x1;
      payload[`Covers[${i}].Rect[1]`] = y1;
      payload[`Covers[${i}].Rect[2]`] = x2;
      payload[`Covers[${i}].Rect[3]`] = y2;
    } else {
      payload[`Covers[${i}].EncodeBlend`] = false;
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
      // Preserve local privacy masks state if editing to avoid jitter, or fully sync
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

  // --- Mask Logic ---
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
      
      {/* Header & Actions */}
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

      {/* --- PRIVACY MASK --- */}
      {activeSection === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Masques de Confidentialité</h3>
            <p className="text-sm text-gray-400 mb-4">
              Masquez des zones sensibles (Max 4).
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <button 
                onClick={handleAddMask} 
                disabled={settings.privacyMasks.length >= 4}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
              >
                + Ajouter Masque
              </button>
              <button 
                onClick={handleClearMasks} 
                disabled={settings.privacyMasks.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50"
              >
                Tout Effacer
              </button>
            </div>

            {/* Visual Editor Placeholder */}
            <div className="relative bg-gray-900 rounded-lg border-2 border-gray-600 aspect-video overflow-hidden">
               {settings.privacyMasks.map((mask) => (
                  <div 
                    key={mask.id} 
                    className="absolute bg-black/90 border border-red-500 flex items-center justify-center group"
                    style={{ left: `${mask.x}%`, top: `${mask.y}%`, width: `${mask.width}%`, height: `${mask.height}%` }}
                  >
                    <span className="text-xs text-white opacity-50 font-bold">#{mask.index + 1}</span>
                    <button 
                        onClick={() => handleDeleteMask(mask.id)}
                        className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100"
                    >
                        ×
                    </button>
                  </div>
               ))}
               <div className="absolute inset-0 flex items-center justify-center text-gray-600 pointer-events-none">
                  Zone de Prévisualisation
               </div>
            </div>
            
            {/* List */}
            <div className="mt-4 grid grid-cols-2 gap-4">
               {settings.privacyMasks.map(mask => (
                   <div key={mask.id} className="p-2 bg-gray-900/50 border border-gray-700 rounded flex justify-between items-center">
                       <span className="text-white text-sm">Masque {mask.index + 1}</span>
                       <button 
                         onClick={() => handleDeleteMask(mask.id)}
                         className="text-red-400 hover:text-red-300 text-xs"
                       >
                         Supprimer
                       </button>
                   </div>
               ))}
            </div>
          </div>
        </div>
      )}

      {/* --- TITLES (Channel & Time) --- */}
      {activeSection === 'titles' && (
        <div className="space-y-4">
          {/* Channel Title */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Titre du Canal</h3>
              <input
                type="checkbox"
                checked={settings.channelTitle.enabled}
                onChange={(e) => updateNestedSettings('channelTitle', 'enabled', e.target.checked)}
                className="w-5 h-5 accent-red-600"
              />
            </div>
            
            {settings.channelTitle.enabled && (
              <div className="space-y-3">
                <input
                  type="text"
                  value={settings.channelTitle.text}
                  onChange={(e) => updateNestedSettings('channelTitle', 'text', e.target.value)}
                  className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white"
                />
                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="text-xs text-gray-400">X (%)</label>
                        <input type="range" min="0" max="100" value={settings.channelTitle.x} onChange={(e) => updateNestedSettings('channelTitle', 'x', parseInt(e.target.value))} className="w-full" />
                    </div>
                    <div>
                        <label className="text-xs text-gray-400">Y (%)</label>
                        <input type="range" min="0" max="100" value={settings.channelTitle.y} onChange={(e) => updateNestedSettings('channelTitle', 'y', parseInt(e.target.value))} className="w-full" />
                    </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Title */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white">Affichage Heure</h3>
              <input
                type="checkbox"
                checked={settings.timeTitle.enabled}
                onChange={(e) => updateNestedSettings('timeTitle', 'enabled', e.target.checked)}
                className="w-5 h-5 accent-red-600"
              />
            </div>
             
             {settings.timeTitle.enabled && (
                <div className="space-y-3">
                     <label className="flex items-center gap-2 text-gray-300 text-sm">
                        <input type="checkbox" checked={settings.timeTitle.showWeek} onChange={(e) => updateNestedSettings('timeTitle', 'showWeek', e.target.checked)} />
                        Afficher Semaine
                     </label>
                     <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-gray-400">X (%)</label>
                            <input type="range" min="0" max="100" value={settings.timeTitle.x} onChange={(e) => updateNestedSettings('timeTitle', 'x', parseInt(e.target.value))} className="w-full" />
                        </div>
                        <div>
                            <label className="text-xs text-gray-400">Y (%)</label>
                            <input type="range" min="0" max="100" value={settings.timeTitle.y} onChange={(e) => updateNestedSettings('timeTitle', 'y', parseInt(e.target.value))} className="w-full" />
                        </div>
                    </div>
                </div>
             )}
          </div>
        </div>
      )}

      {/* --- OVERLAY (OSD Info & Text) --- */}
      {activeSection === 'overlay' && (
        <div className="space-y-4">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Infos OSD</h3>
            <div className="space-y-2 mb-4">
               <label className="flex items-center gap-2 text-gray-300">
                 <input type="checkbox" checked={settings.osdInfo.showPresetPoint} onChange={(e) => updateNestedSettings('osdInfo', 'showPresetPoint', e.target.checked)} />
                 Nom Préréglage (Preset)
               </label>
               <label className="flex items-center gap-2 text-gray-300">
                 <input type="checkbox" checked={settings.osdInfo.showPTZCoordinates} onChange={(e) => updateNestedSettings('osdInfo', 'showPTZCoordinates', e.target.checked)} />
                 Coordonnées PTZ
               </label>
               <label className="flex items-center gap-2 text-gray-300">
                 <input type="checkbox" checked={settings.osdInfo.showZoom} onChange={(e) => updateNestedSettings('osdInfo', 'showZoom', e.target.checked)} />
                 Zoom
               </label>
            </div>
            
            <label className="text-xs text-gray-400 block mb-1">Position OSD (Groupe)</label>
            <div className="grid grid-cols-2 gap-3">
                <input type="range" min="0" max="100" value={settings.osdInfo.x} onChange={(e) => updateNestedSettings('osdInfo', 'x', parseInt(e.target.value))} className="w-full" />
                <input type="range" min="0" max="100" value={settings.osdInfo.y} onChange={(e) => updateNestedSettings('osdInfo', 'y', parseInt(e.target.value))} className="w-full" />
            </div>
          </div>

          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
               <h3 className="text-lg font-semibold text-white">Texte Personnalisé</h3>
               <input type="checkbox" checked={settings.textOverlay.enabled} onChange={(e) => updateNestedSettings('textOverlay', 'enabled', e.target.checked)} className="w-5 h-5 accent-red-600"/>
            </div>
            {settings.textOverlay.enabled && (
               <div className="space-y-3">
                 <input type="text" value={settings.textOverlay.text} onChange={(e) => updateNestedSettings('textOverlay', 'text', e.target.value)} className="w-full bg-gray-800 text-white p-2 rounded" placeholder="Texte" />
                 <div className="grid grid-cols-2 gap-3">
                    <input type="range" min="0" max="100" value={settings.textOverlay.x} onChange={(e) => updateNestedSettings('textOverlay', 'x', parseInt(e.target.value))} className="w-full" />
                    <input type="range" min="0" max="100" value={settings.textOverlay.y} onChange={(e) => updateNestedSettings('textOverlay', 'y', parseInt(e.target.value))} className="w-full" />
                 </div>
               </div>
            )}
          </div>
        </div>
      )}

      {/* --- ADVANCED --- */}
      {activeSection === 'advanced' && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Avancé</h3>
            
            <div className="mb-6">
                <label className="text-sm text-gray-300 block mb-2">Taille de Police</label>
                <div className="flex gap-4">
                    {['small', 'medium', 'large'].map(size => (
                        <button key={size} onClick={() => handleUpdate({ ...settings, fontSize: size as any })} className={`px-4 py-2 rounded border ${settings.fontSize === size ? 'bg-red-600 border-red-600 text-white' : 'bg-transparent border-gray-600 text-gray-400'}`}>
                            {size === 'small' ? 'Petite' : size === 'medium' ? 'Moyenne' : 'Grande'}
                        </button>
                    ))}
                </div>
            </div>

            <div className="mb-6">
                <div className="flex justify-between items-center mb-2">
                    <span className="text-gray-300">Image Overlay</span>
                    <input type="checkbox" checked={settings.overlayPicture.enabled} onChange={(e) => updateNestedSettings('overlayPicture', 'enabled', e.target.checked)} className="w-5 h-5 accent-red-600"/>
                </div>
                {settings.overlayPicture.enabled && (
                    <div className="grid grid-cols-2 gap-3">
                        <input type="range" min="0" max="100" value={settings.overlayPicture.x} onChange={(e) => updateNestedSettings('overlayPicture', 'x', parseInt(e.target.value))} className="w-full" />
                        <input type="range" min="0" max="100" value={settings.overlayPicture.y} onChange={(e) => updateNestedSettings('overlayPicture', 'y', parseInt(e.target.value))} className="w-full" />
                    </div>
                )}
            </div>
        </div>
      )}
    </div>
  );
};

export default VideoOverlay;