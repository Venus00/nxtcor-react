// components/camera/PictureSettings.tsx
import React, { useEffect, useState } from "react";
import SliderControl from "./SliderControl";
import { useCamId } from "../../contexts/CameraContext";
import {
  useVideoColor,
  useVideoSharpness,
  useVideoInDenoise, // Assumed hook based on API 2.1.3
  useVideoImageControl // Assumed hook based on API 3.1.4
} from "../../hooks/useCameraQueries";
import {
  useSetVideoColor,
  useSetVideoSharpness,
  useSetVideoInDenoise, // Assumed mutation
  useSetVideoImageControl // Assumed mutation
} from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface PictureSettingsData {
  profile: "normal" | "daytime" | "nighttime";
  // Color
  brightness: number;
  contrast: number;
  saturability: number;
  chromaCNT: number; // API: ChromaSuppress
  gamma: number;
  // Sharpness
  sharpness: number;
  sharpnessCNT: number; // API: Level
  // Denoise
  nr2D: number; // API: 2DLevel
  nr3D: number; // API: 3DAutoType.AutoLevel
  grade: number; // Mapped to general denoise level if specific 2D/3D not available
  // Image Control
  flip: "normal" | "inverted";
  eis: boolean; // API: Stable
  // Thermal Camera Specific
  pseudoColor?: string;
  directZoom?: number;
  ffcMode?: "auto" | "manual";
}

const DEFAULTS: PictureSettingsData = {
  profile: "normal",
  brightness: 50,
  contrast: 50,
  saturability: 50,
  chromaCNT: 50,
  sharpness: 50,
  sharpnessCNT: 50,
  gamma: 50,
  nr2D: 50,
  nr3D: 50,
  grade: 50,
  flip: "normal",
  eis: false,
  pseudoColor: "Iron Red",
  directZoom: 10,
  ffcMode: "auto",
};

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Aggregates data from multiple API endpoints into a single UI state object
 * based on the selected profile.
 */
const apiToUI = (
  profile: "normal" | "daytime" | "nighttime",
  colorData: any,
  sharpData: any,
  denoiseData: any,
  imgCtrlData: any
): PictureSettingsData => {
  const profileIdx = profile === "daytime" ? 0 : profile === "nighttime" ? 1 : 2; //

  const getColor = (key: string, def: number) =>
    colorData?.config?.[`table.VideoColor[0][${profileIdx}].${key}`] ?? def;

  const getSharp = (key: string, def: number) =>
    sharpData?.config?.[`table.VideoInSharpness[0][${profileIdx}].${key}`] ?? def;

  const getDenoise = (key: string, def: number) =>
    denoiseData?.config?.[`table.VideoInDenoise[0][${profileIdx}].${key}`] ?? def;

  // Image Control is usually Global (Index 0 only), not per profile
  const getImgCtrl = (key: string, def: any) =>
    imgCtrlData?.config?.[`table.VideoImageControl[0].${key}`] ?? def;

  return {
    profile,
    // VideoColor
    brightness: Number(getColor("Brightness", 50)),
    contrast: Number(getColor("Contrast", 50)),
    saturability: Number(getColor("Saturation", 50)),
    chromaCNT: Number(getColor("ChromaSuppress", 50)),
    gamma: Number(getColor("Gamma", 50)),

    // VideoInSharpness
    sharpness: Number(getSharp("Sharpness", 50)),
    sharpnessCNT: Number(getSharp("Level", 50)),

    // VideoInDenoise
    nr2D: Number(getDenoise("2DLevel", 50)),
    nr3D: Number(getDenoise("3DAutoType.AutoLevel", 50)), // Specific 3D mapping
    grade: 50, // Legacy/Placeholder if not in API

    // VideoImageControl (Global)
    flip: String(getImgCtrl("Flip", "false")) === "true" ? "inverted" : "normal",
    eis: Number(getImgCtrl("Stable", 0)) !== 0, // 0=Off, 1=Elec, 2=Optical
  };
};

/**
 * Splits UI state into specific API payloads
 */
const uiToApi = (ui: PictureSettingsData) => {
  return {
    color: {
      [`Brightness`]: ui.brightness,
      [`Contrast`]: ui.contrast,
      [`Saturation`]: ui.saturability,
      [`ChromaSuppress`]: ui.chromaCNT,
      [`Gamma`]: ui.gamma,
    },
    sharpness: {
      [`Sharpness`]: ui.sharpness,
      [`Level`]: ui.sharpnessCNT,
    },
    denoise: {
      [`2DLevel`]: ui.nr2D,
      [`3DAutoType.AutoLevel`]: ui.nr3D,
    },
    imageControl: {
      [`Flip`]: ui.flip === "inverted",
      [`Stable`]: ui.eis ? 1 : 0,
    }
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

const PictureSettings: React.FC = () => {
  const camId = useCamId();

  // 1. Queries
  const colorQ = useVideoColor(camId);
  const sharpQ = useVideoSharpness(camId);
  const denoiseQ = useVideoInDenoise(camId);
  const imgCtrlQ = useVideoImageControl(camId);

  // 2. Mutations
  const setColor = useSetVideoColor(camId);
  const setSharp = useSetVideoSharpness(camId);
  const setDenoise = useSetVideoInDenoise(camId);
  const setImgCtrl = useSetVideoImageControl(camId);

  // 3. Local State
  const [activeProfile] = useState<PictureSettingsData['profile']>("normal");
  const [settings, setSettings] = useState<PictureSettingsData>(DEFAULTS);
  const [isDirty, setIsDirty] = useState(false);

  const isLoading = colorQ.isLoading || sharpQ.isLoading;
  const isPending = setColor.isPending || setSharp.isPending || setDenoise.isPending || setImgCtrl.isPending;

  // 4. Sync API -> Local State
  useEffect(() => {
    if (colorQ.data && sharpQ.data) {
      const parsed = apiToUI(activeProfile, colorQ.data, sharpQ.data, denoiseQ.data, imgCtrlQ.data);
      setSettings(parsed);
      setIsDirty(false);
    }
  }, [activeProfile, colorQ.data, sharpQ.data, denoiseQ.data, imgCtrlQ.data]);

  // 5. Handlers
  const updateSetting = <K extends keyof PictureSettingsData>(key: K, value: PictureSettingsData[K]) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = async () => {
    const payloads = uiToApi(settings);

    // Execute all mutations in parallel
    await Promise.all([
      setColor.mutateAsync(payloads.color),
      setSharp.mutateAsync(payloads.sharpness),
      setDenoise.mutateAsync(payloads.denoise),
  return (
      <div className="space-y-6">

        {/* Messages */}
        {isPending && (
          <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300 flex items-center gap-2 text-sm">
            <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-300"></div>
            Enregistrement en cours...
          </div>
        )}

        {/* Save/Revert Action Bar */}
        {isDirty && (
          <div className="sticky top-0 z-10 bg-gradient-to-r from-blue-600 to-blue-700 rounded-lg p-4 shadow-lg border border-blue-500">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-blue-300 rounded-full animate-pulse"></div>
                <span className="text-white font-medium">Modifications non enregistrées</span>
              </div>
              <div className="flex gap-3">
                <button
                  onClick={handleRevert}
                  disabled={isPending}
                  className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSave}
                  disabled={isPending}
                  className="px-6 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      Enregistrement...
                    </>
                  ) : (
                    <>
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                      </svg>
                      Enregistrer
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}handleRevert = () => {
    if (colorQ.data && sharpQ.data) {
      const parsed = apiToUI(activeProfile, colorQ.data, sharpQ.data, denoiseQ.data, imgCtrlQ.data);
        setSettings(parsed);
        setIsDirty(false);
    }
  };

        if (isLoading) {
    return (
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
            <p className="text-gray-400">Chargement des paramètres d'image...</p>
          </div>
        </div>
        );
  }

        return (
        <div className="space-y-6">

          {/* Messages */}
          {isPending && (
            <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300 flex items-center gap-2 text-sm">
              <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-300"></div>
              Enregistrement en cours...
            </div>
          )}

          {/* Image Quality - Optical Camera Only */}
          {camId === 'cam1' && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Qualité d'Image</h2>
              <div className="space-y-4">
                <SliderControl
                  label="Luminosité (Brightness)"
                  description="Ajuste la clarté globale de l'image."
                  value={settings.brightness}
                  onChange={(v) => updateSetting("brightness", v)}
                />
                <SliderControl
                  label="Contraste (Contrast)"
                  description="Différence entre les zones claires et sombres."
                  value={settings.contrast}
                  onChange={(v) => updateSetting("contrast", v)}
                />
                <SliderControl
                  label="Saturation (Saturability)"
                  description="Intensité des couleurs."
                  value={settings.saturability}
                  onChange={(v) => updateSetting("saturability", v)}
                />
                <SliderControl
                  label="Chroma CNT"
                  description="Suppression de couleur (utile en faible luminosité)."
                  value={settings.chromaCNT}
                  onChange={(v) => updateSetting("chromaCNT", v)}
                />
                <SliderControl
                  label="Gamma"
                  description="Correction non-linéaire de la luminosité."
                  value={settings.gamma}
                  onChange={(v) => updateSetting("gamma", v)}
                />
              </div>
            </div>
          )}

          {/* Sharpness - Optical Camera Only */}
          {camId === 'cam1' && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Netteté</h2>
              <div className="space-y-4">
                <SliderControl
                  label="Netteté (Sharpness)"
                  description="Clarté des bords de l'image."
                  value={settings.sharpness}
                  onChange={(v) => updateSetting("sharpness", v)}
                />
                <SliderControl
                  label="Sharpness CNT (Level)"
                  description="Suppression de la netteté pour réduire le bruit."
                  value={settings.sharpnessCNT}
                  onChange={(v) => updateSetting("sharpnessCNT", v)}
                />
              </div>
            </div>
          )}

          {/* Advanced / Denoise - Optical Camera Only */}
          {camId === 'cam1' && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Paramètres Avancés</h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                <SliderControl
                  label="2D NR (Réduction Bruit Spatial)"
                  description="Réduit le bruit dans une image unique."
                  value={settings.nr2D}
                  onChange={(v) => updateSetting("nr2D", v)}
                />
                <SliderControl
                  label="3D NR (Réduction Bruit Temporel)"
                  description="Réduit le bruit entre les images consécutives."
                  value={settings.nr3D}
                  onChange={(v) => updateSetting("nr3D", v)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-gray-700">
                {/* Flip Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Flip (Retournement)</label>
                  <div className="flex bg-gray-900/50 p-1 rounded-lg">
                    <button
                      onClick={() => updateSetting("flip", "normal")}
                      className={`flex-1 py-2 rounded text-sm ${settings.flip === "normal" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                    >
                      Normal
                    </button>
                    <button
                      onClick={() => updateSetting("flip", "inverted")}
                      className={`flex-1 py-2 rounded text-sm ${settings.flip === "inverted" ? "bg-blue-600 text-white" : "text-gray-400 hover:text-white"}`}
                    >
                      Inversé
                    </button>
                  </div>
                </div>

                {/* EIS Control */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">EIS (Stabilisation)</label>
                  <div className="flex bg-gray-900/50 p-1 rounded-lg">
                    <button
                      onClick={() => updateSetting("eis", true)}
                      className={`flex-1 py-2 rounded text-sm ${settings.eis ? "bg-green-600 text-white" : "text-gray-400 hover:text-white"}`}
                    >
                      Activé
                    </button>
                    <button
                      onClick={() => updateSetting("eis", false)}
                      className={`flex-1 py-2 rounded text-sm ${!settings.eis ? "bg-red-600 text-white" : "text-gray-400 hover:text-white"}`}
                    >
                      Désactivé
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Thermal Camera Settings - cam2 only */}
          {camId === 'cam2' && (
            <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
              <h2 className="text-xl font-semibold text-white mb-6">Paramètres Caméra Thermique</h2>

              <div className="space-y-6">
                {/* Pseudo Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Pseudo Color
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Sélectionnez la palette de couleurs pour la visualisation thermique.
                  </p>
                  <select
                    value={settings.pseudoColor}
                    onChange={(e) => updateSetting("pseudoColor", e.target.value)}
                    className="w-full px-4 py-3 bg-gray-900/50 border border-gray-600 rounded-lg text-white focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none transition-all"
                  >
                    <option value="Purple">Purple</option>
                    <option value="Orange">Orange</option>
                    <option value="Black Hot">Black Hot</option>
                    <option value="Iron Red">Iron Red</option>
                    <option value="Rainbow 1">Rainbow 1</option>
                    <option value="Fulgurite">Fulgurite</option>
                    <option value="Rainbow 2">Rainbow 2</option>
                    <option value="Sky">Sky</option>
                    <option value="Mid Gray">Mid Gray</option>
                    <option value="Gray Red">Gray Red</option>
                    <option value="Purple Orange">Purple Orange</option>
                    <option value="Special Warning Red">Special Warning Red</option>
                    <option value="Ice Fire">Ice Fire</option>
                    <option value="Cyan Red">Cyan Red</option>
                    <option value="Special2">Special2</option>
                    <option value="Gradient Red">Gradient Red</option>
                    <option value="Gradient Green">Gradient Green</option>
                    <option value="Gradient Blue">Gradient Blue</option>
                    <option value="Green">Green</option>
                    <option value="Warning Blue">Warning Blue</option>
                  </select>
                </div>

                {/* DirectZoom */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    DirectZoom
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Niveau de zoom numérique (10-80).
                  </p>
                  <div className="flex items-center gap-4">
                    <input
                      type="range"
                      min="10"
                      max="80"
                      value={settings.directZoom}
                      onChange={(e) => updateSetting("directZoom", Number(e.target.value))}
                      className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                    />
                    <span className="text-white font-medium w-12 text-center">
                      {settings.directZoom}
                    </span>
                  </div>
                </div>

                {/* FFC Mode */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    FFC Mode (Flat Field Correction)
                  </label>
                  <p className="text-xs text-gray-400 mb-3">
                    Mode de correction automatique ou manuelle.
                  </p>
                  <div className="flex bg-gray-900/50 p-1 rounded-lg">
                    <button
                      onClick={() => updateSetting("ffcMode", "auto")}
                      className={`flex-1 py-2 rounded text-sm font-medium transition-all ${settings.ffcMode === "auto"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                    >
                      Auto
                    </button>
                    <button
                      onClick={() => updateSetting("ffcMode", "manual")}
                      className={`flex-1 py-2 rounded text-sm font-medium transition-all ${settings.ffcMode === "manual"
                        ? "bg-blue-600 text-white shadow-lg"
                        : "text-gray-400 hover:text-white hover:bg-gray-700/50"
                        }`}
                    >
                      Manual
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        );
};

        export default PictureSettings;