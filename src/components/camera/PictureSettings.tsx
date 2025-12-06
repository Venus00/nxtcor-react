import type React from "react";
import { useEffect, useState } from "react";
import SliderControl from "./SliderControl";
import { useCamId } from "../../contexts/CameraContext";
import { useVideoColor } from "../../hooks/useCameraQueries";
import { useSetVideoColor } from "../../hooks/useCameraMutations";

/**
 * Picture settings UI that:
 *  - loads from backend when available
 *  - if not fetched yet OR on error, shows the UI populated with DEFAULTS
 *  - still allows Save (mutation) so user can apply values even when device not reachable
 */

export interface PictureSettingsData {
  profile: 'normal' | 'daytime' | 'nighttime';
  brightness: number;
  contrast: number;
  saturability: number;
  chromaCNT: number;
  sharpness: number;
  sharpnessCNT: number;
  gamma: number;
  nr2D: number;
  nr3D: number;
  grade: number;
  flip: 'normal' | 'inverted';
  eis: boolean;
}

interface PictureSettingsProps {
  settings?: PictureSettingsData;
  onSettingsChange?: (settings: PictureSettingsData) => void;
}

const DEFAULTS: PictureSettingsData = {
  profile: 'normal',
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
  flip: 'normal',
  eis: false,
};


function parseVideoColorApi(api: any, channel = 0) {
  if (!api) return null;

  // helper to pick value with fallbacks
  const getVal = (obj: any, cfgIndex: number, key: string, fallback = DEFAULTS[key as keyof typeof DEFAULTS]) => {
    // possible api shapes:
    // - parsed map: api['table.VideoColor[0][0].Brightness'] = "25"
    // - nested: api.table?.VideoColor?.[0]?.[0]?.Brightness
    const dotted = `table.VideoColor[${channel}][${cfgIndex}].${key}`;
    if (obj && typeof obj === 'object') {
      if (dotted in obj) return Number(obj[dotted]);
      // try nested structure
      try {
        const nested = obj.table?.VideoColor?.[channel]?.[cfgIndex]?.[key];
        if (nested !== undefined) return Number(nested);
      } catch { /* ignore */ }
    }
    return Number(fallback);
  };

  const keysMap: Array<[keyof PictureSettingsData, string]> = [
    ['brightness','Brightness'],
    ['contrast','Contrast'],
    ['saturability','Saturation'],
    ['chromaCNT','ChromaSuppress'],
    ['gamma','Gamma'],
    // you can add mappings for other parameters if the API exposes them
  ];

  const buildProfile = (cfgIndex: number): PictureSettingsData => {
    const out: any = { ...DEFAULTS };

    // keep profile field consistent (we'll override after)
    for (const [uiKey, apiKey] of keysMap) {
      out[uiKey] = getVal(api, cfgIndex, apiKey, DEFAULTS[uiKey]);
    }

    // maintain other UI fields as defaults (or extend keysMap to include them)
    out.profile = cfgIndex === 2 ? 'normal' : cfgIndex === 0 ? 'daytime' : 'nighttime';
    return out as PictureSettingsData;
  };

  return {
    daytime: buildProfile(0),
    nighttime: buildProfile(1),
    normal: buildProfile(2),
  };
}

// defensive mapper from API -> UI shape (adjust keys if your backend uses different naming)
function apiToUIColor(data: any): PictureSettingsData {
  if (!data) return { ...DEFAULTS };
  return {
    profile: (data.profile as any) || 'normal',
    brightness: Number(data.brightness ?? data.Brightness ?? DEFAULTS.brightness),
    contrast: Number(data.contrast ?? data.Contrast ?? DEFAULTS.contrast),
    saturability: Number(data.saturability ?? data.Saturability ?? DEFAULTS.saturability),
    chromaCNT: Number(data.chromaCNT ?? data.ChromaCNT ?? DEFAULTS.chromaCNT),
    sharpness: Number(data.sharpness ?? data.Sharpness ?? DEFAULTS.sharpness),
    sharpnessCNT: Number(data.sharpnessCNT ?? data.SharpnessCNT ?? DEFAULTS.sharpnessCNT),
    gamma: Number(data.gamma ?? data.Gamma ?? DEFAULTS.gamma),
    nr2D: Number(data.nr2D ?? data.NR2D ?? DEFAULTS.nr2D),
    nr3D: Number(data.nr3D ?? data.NR3D ?? DEFAULTS.nr3D),
    grade: Number(data.grade ?? data.Grade ?? DEFAULTS.grade),
    flip: (data.flip === 'inverted' || data.Flip === 'inverted') ? 'inverted' : 'normal',
    eis: Boolean(data.eis ?? data.EIS ?? false),
  };
}

const PictureSettings: React.FC<PictureSettingsProps> = ({ settings: propSettings, onSettingsChange }) => {
  const camId = useCamId();

  // fetch current picture settings; we intentionally keep the UI rendering even when loading/error
  const {
    data: apiData,
    isLoading,
    isError,
    refetch,
  } = useVideoColor(camId, true);

  const setVideoColor = useSetVideoColor(camId);

  // local editor state (always present)
  const [local, setLocal] = useState<PictureSettingsData>(() => propSettings ?? DEFAULTS);
  const [activeProfile, setActiveProfile] = useState<'normal' | 'daytime' | 'nighttime'>(local.profile);
  const [dirty, setDirty] = useState(false);

  // Flag: using defaults (no apiData yet OR query errored)
  const usingDefaults = !apiData || isError;

  // When apiData arrives (or propSettings provided), populate local; otherwise keep defaults
useEffect(() => {
  if (apiData) {
    // parse into separate profiles
    const profiles = parseVideoColorApi(apiData, 0); // channel 0 for visible
    if (profiles) {
      // set the entire profiles object into a ref/local (optional) or pick current profile
      // We'll pick the currently active profile (or default).
      const pick = activeProfile === 'daytime' ? profiles.daytime
                 : activeProfile === 'nighttime' ? profiles.nighttime
                 : profiles.normal;

      setLocal(pick);
      setDirty(false);
    } else {
      // fallback to previous mapping function if you want:
      const mapped = apiToUIColor(apiData);
      setLocal(mapped);
      setActiveProfile(mapped.profile);
      setDirty(false);
    }
  } else if (propSettings && !apiData) {
    setLocal(propSettings);
    setActiveProfile(propSettings.profile);
    setDirty(false);
  } else {
    setLocal(DEFAULTS);
    setActiveProfile(DEFAULTS.profile);
    setDirty(false);
  }
// keep the same deps but include activeProfile so if user switches tab and apiData arrives it will pick correctly
}, [apiData, propSettings, activeProfile]);

// --- modify handleProfileChange so switching tabs loads that profile values ---
const handleProfileChange = (profile: 'normal' | 'daytime' | 'nighttime') => {
  setActiveProfile(profile);

  // If we have apiData, replace local with the selected profile values.
  if (apiData) {
    const profiles = parseVideoColorApi(apiData, 0);
    if (profiles) {
      const pick = profile === 'daytime' ? profiles.daytime
                 : profile === 'nighttime' ? profiles.nighttime
                 : profiles.normal;
      setLocal(pick);
      setDirty(false); // switching profile should show saved API values (no dirty)
      return;
    }
  }

  // fallback: just update profile in local state (keeps current sliders)
  updateLocal('profile', profile);
};
  // update local helper
  const updateLocal = <K extends keyof PictureSettingsData>(key: K, value: PictureSettingsData[K]) => {
    setLocal(prev => {
      const next = { ...prev, [key]: value };
      setDirty(true);
      return next;
    });
  };

  // Save: call mutation (works even if we used defaults)
  const handleSave = () => {
    const payload = {
      profile: local.profile,
      brightness: local.brightness,
      contrast: local.contrast,
      saturability: local.saturability,
      chromaCNT: local.chromaCNT,
      sharpness: local.sharpness,
      sharpnessCNT: local.sharpnessCNT,
      gamma: local.gamma,
      nr2D: local.nr2D,
      nr3D: local.nr3D,
      grade: local.grade,
      flip: local.flip,
      eis: local.eis,
    };

    setVideoColor.mutate(payload, {
      onSuccess: () => {
        setDirty(false);
        // try to refresh from server to reflect actual saved state
        refetch();
        if (onSettingsChange) onSettingsChange(local);
      },
    });
  };

  const handleRevert = () => {
    if (apiData) {
      const mapped = apiToUIColor(apiData);
      setLocal(mapped);
      setActiveProfile(mapped.profile);
      setDirty(false);
    } else if (propSettings) {
      setLocal(propSettings);
      setActiveProfile(propSettings.profile);
      setDirty(false);
    } else {
      setLocal(DEFAULTS);
      setActiveProfile(DEFAULTS.profile);
      setDirty(false);
    }
  };

  // const handleProfileChange = (profile: 'normal' | 'daytime' | 'nighttime') => {
  //   setActiveProfile(profile);
  //   updateLocal('profile', profile);
  // };

  const handleFlipChange = (flip: 'normal' | 'inverted') => updateLocal('flip', flip);
  const handleEISToggle = () => updateLocal('eis', !local.eis);

  return (
    <div className="space-y-6">
      {/* Informational banner when we don't have server data */}
      {usingDefaults && (
        <div className="rounded-lg p-3 bg-yellow-900/40 border border-yellow-700 text-yellow-200">
          <div className="flex items-center gap-3">
            <svg className="w-5 h-5 text-yellow-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M12 8v4m0 4h.01M12 2a10 10 0 100 20 10 10 0 000-20z" />
            </svg>
            <div>
              <div className="font-medium">Using default values</div>
              <div className="text-sm text-yellow-200">
                Could not load settings from the camera (not fetched yet or error). You may edit and Save — values will be pushed when you click Save.
              </div>
            </div>
            <div className="ml-auto">
              {isLoading && <span className="text-sm text-gray-300">Loading from device...</span>}
              {isError && <button onClick={() => refetch()} className="underline text-sm">Retry</button>}
            </div>
          </div>
        </div>
      )}

      {/* Profile Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Profil</h2>
        <p className="text-gray-400 text-sm mb-4">Sélectionnez le mode normal, jour ou nuit. La configuration correspondante est affichée ci-dessous.</p>
        <div className="flex gap-4">
          <button onClick={() => handleProfileChange('normal')} className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${activeProfile === 'normal' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Mode Normal</button>
          <button onClick={() => handleProfileChange('daytime')} className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${activeProfile === 'daytime' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Mode Jour</button>
          <button onClick={() => handleProfileChange('nighttime')} className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${activeProfile === 'nighttime' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}>Mode Nuit</button>
        </div>

        {/* Save / Revert */}
        <div className="mt-4 flex gap-3">
          <button onClick={handleSave} disabled={!dirty || setVideoColor.isLoading} className={`px-4 py-2 rounded-lg font-medium transition-all ${dirty ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
            {setVideoColor.isLoading ? 'Saving...' : 'Save'}
          </button>
          <button onClick={handleRevert} disabled={!dirty} className={`px-4 py-2 rounded-lg font-medium transition-all ${dirty ? 'bg-yellow-600 text-white hover:bg-yellow-700' : 'bg-gray-700 text-gray-400 cursor-not-allowed'}`}>
            Revert
          </button>
          <div className="ml-auto text-sm text-gray-400 self-center">{dirty ? 'Unsaved changes' : 'Saved'}</div>
        </div>

        {setVideoColor.isError && (
          <div className="mt-3 text-sm text-red-300">
            Save error: {(setVideoColor.error as any)?.message ?? 'Unknown'}
          </div>
        )}
        {setVideoColor.isSuccess && (
          <div className="mt-3 text-sm text-green-300">Saved successfully.</div>
        )}
      </div>

      {/* Image Quality */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Qualité d'Image</h2>
        <div className="space-y-4">
          <SliderControl label="Luminosité (Brightness)" description="Réglez la teinte de l'image, plus la valeur est élevée, plus l'image est colorée." value={local.brightness} onChange={(v) => updateLocal('brightness', v)} />
          <SliderControl label="Contraste (Contrast)" description="Définir le contraste de l'image, plus la valeur est élevée, plus le contraste de luminosité est grand." value={local.contrast} onChange={(v) => updateLocal('contrast', v)} />
          <SliderControl label="Saturation (Saturability)" description="Définir la saturation des couleurs de l'image. Plus la saturation est élevée, plus l'image est vive." value={local.saturability} onChange={(v) => updateLocal('saturability', v)} />
          <SliderControl label="Chroma CNT" description="Réglez le degré de suppression de la couleur de l'image, plus la valeur est élevée, plus la suppression est évidente." value={local.chromaCNT} onChange={(v) => updateLocal('chromaCNT', v)} />
        </div>
      </div>

      {/* Sharpness */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Netteté</h2>
        <div className="space-y-4">
          <SliderControl label="Netteté (Sharpness)" description="Ajustez la netteté du bord de l'image, plus la valeur est élevée, plus le bord est évident." value={local.sharpness} onChange={(v) => updateLocal('sharpness', v)} />
          <SliderControl label="Sharpness CNT" description="Ajustez le degré de suppression de la netteté de l'image, plus la valeur est élevée, plus le degré est élevé." value={local.sharpnessCNT} onChange={(v) => updateLocal('sharpnessCNT', v)} />
        </div>
      </div>

      {/* Advanced */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Paramètres Avancés</h2>
        <div className="space-y-4">
          <SliderControl label="Gamma" description="Modifie la luminosité de l'image par ajustement non linéaire et améliore la plage dynamique de l'image." value={local.gamma} onChange={(v) => updateLocal('gamma', v)} />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <SliderControl label="2D NR (Réduction de Bruit 2D)" description="Utilisé pour contrôler le bruit, plus le degré est élevé, plus le bruit est faible." value={local.nr2D} onChange={(v) => updateLocal('nr2D', v)} />
            <SliderControl label="3D NR (Réduction de Bruit 3D)" description="Utilisé pour contrôler le bruit temporel. Augmentez pour des scènes sombres et statiques." value={local.nr3D} onChange={(v) => updateLocal('nr3D', v)} />
            <SliderControl label="Grade (Noise Grade)" description="Contrôle le niveau de réduction du bruit global." value={local.grade} onChange={(v) => updateLocal('grade', v)} />
          </div>

          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Flip</label>
              <div className="flex gap-3">
                <button onClick={() => handleFlipChange('normal')} className={`py-2 px-4 rounded-lg ${local.flip === 'normal' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Normal</button>
                <button onClick={() => handleFlipChange('inverted')} className={`py-2 px-4 rounded-lg ${local.flip === 'inverted' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>Inversé</button>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">EIS</label>
              <div className="flex items-center gap-3">
                <button onClick={handleEISToggle} className={`py-2 px-4 rounded-lg ${local.eis ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300'}`}>{local.eis ? 'Enabled' : 'Disabled'}</button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PictureSettings;
