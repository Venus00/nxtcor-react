// components/camera/ExposureSettings.tsx
import React, { useEffect, useState } from "react";
import SliderControl from "./SliderControl"; 
import { useExposure } from "../../hooks/useCameraQueries";
import { useSetExposure } from "../../hooks/useCameraMutations"; 
import { useCamId } from "../../contexts/CameraContext";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ExposureUIState {
  mode: number; // 0, 4, 5, 7, 8
  gainMax: number;
  gainMin: number;
  shutterMin: number; // Mapped from Value1
  shutterMax: number; // Mapped from Value2
  iris: number; 
  compensation: number;
  recoveryTime: number; // 0, 300, 900, 3600
}

interface ExposureSettingsProps {
  // Props not strictly needed if using context, but keeping interface for consistency
}

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

const defaultState: ExposureUIState = {
  mode: 0,
  gainMax: 50,
  gainMin: 0,
  shutterMin: 0,
  shutterMax: 40,
  iris: 50,
  compensation: 50,
  recoveryTime: 900
};

/**
 * Parses the flat API response keys into a structured UI object.
 * HARDCODED to Index [0][0] per request.
 */
const apiToUI = (data: any): ExposureUIState => {
  console.log("API Data for Exposure:", data);
  if (!data) return defaultState;
  
  // Handle both raw config object or wrapped response
  const config = data.config || data;
  
  // Fixed prefix for Index 0
  // const prefix = "table.VideoInExposure[0][0].";

  const getVal = (key: string, def: number) => {
    const fullKey =  key;
    // Check if key exists in the flat map, otherwise return default
    return config[fullKey] !== undefined ? Number(config[fullKey]) : def;
  };

  return {
    mode: getVal("Mode", 0),
    gainMax: getVal("GainMax", 50),
    gainMin: getVal("GainMin", 0),
    shutterMin: getVal("Value1", 0), // Value1 = Min Shutter Speed
    shutterMax: getVal("Value2", 40), // Value2 = Max Shutter Speed
    iris: getVal("Iris", 50),
    compensation: getVal("Compensation", 50),
    recoveryTime: getVal("RecoveryTime", 0),
  };
};

/**
 * Converts UI state back to the specific API keys.
 * HARDCODED to Index [0][0] per request.
 */
const uiToApi = (ui: ExposureUIState) => {
  // const prefix = "table.VideoInExposure[0][0].";
  
  return {
    [`Mode`]: ui.mode,
    [`GainMax`]: ui.gainMax,
    [`GainMin`]: ui.gainMin,
    [`Value1`]: ui.shutterMin,
    [`Value2`]: ui.shutterMax,
    [`Iris`]: ui.iris,
    [`Compensation`]: ui.compensation,
    [`RecoveryTime`]: ui.recoveryTime,
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

const ExposureSettings: React.FC<ExposureSettingsProps> = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error, refetch } = useExposure(camId);
  const mutation = useSetExposure(camId);

  // Local State (No profile state needed anymore)
  const [settings, setSettings] = useState<ExposureUIState>(defaultState);

  // Sync API Data to Local State
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      setSettings(parsed);
    }
  }, [apiData]);

  // Handlers
  const handleSettingChange = (key: keyof ExposureUIState, value: number) => {
    setSettings((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = () => {
    const payload = uiToApi(settings);
    mutation.mutate(payload);
  };

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement VideoInExposure...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Error & Success Feedback */}
      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300">
          Erreur: {(error as Error).message}
          <button onClick={() => refetch()} className="ml-4 underline hover:no-underline">Réessayer</button>
        </div>
      )}
      {mutation.isSuccess && (
        <div className="p-4 rounded-lg bg-green-900/50 border border-green-700 text-green-300">
          ✓ Configuration enregistrée!
        </div>
      )}

      {/* 1. MODE SELECTION */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Mode d'Exposition</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {[
            { val: 0, label: "Auto" },
            { val: 4, label: "Manuel" },
            { val: 5, label: "Prio. Iris" },
            { val: 7, label: "Prio. Gain" },
            { val: 8, label: "Prio. Obturateur" }
          ].map((m) => (
            <button
              key={m.val}
              onClick={() => handleSettingChange('mode', m.val)}
              className={`py-3 px-2 rounded-lg text-sm font-medium transition-all ${
                settings.mode === m.val
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-500/25 border border-blue-500"
                  : "bg-gray-700 text-gray-300 hover:bg-gray-600 border border-transparent"
              }`}
            >
              {m.label}
            </button>
          ))}
        </div>
        
        {/* Contextual Help based on Mode */}
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600 flex items-start gap-3">
           <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
           <p className="text-gray-300 text-sm">
             {settings.mode === 0 && "Mode Auto: Tous les paramètres (Gain, Iris, Obturateur) sont ajustés automatiquement par la caméra."}
             {settings.mode === 4 && "Mode Manuel: Vous contrôlez manuellement le Gain, l'Iris et l'Obturateur."}
             {settings.mode === 5 && "Priorité Iris: L'ouverture est fixe selon la valeur définie, la caméra ajuste le reste."}
             {settings.mode === 7 && "Priorité Gain: Le gain est fixe, la caméra ajuste l'obturateur et l'iris."}
             {settings.mode === 8 && "Priorité Obturateur: La vitesse d'obturation est fixe, la caméra ajuste le reste."}
           </p>
        </div>
      </div>

      {/* 2. PARAMETERS SLIDERS */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700 space-y-8">
        <h2 className="text-xl font-semibold text-white mb-6">Configuration Fine</h2>

        {/* Shutter Speed Group */}
        <div className="space-y-6 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Obturateur (Shutter)</h3>
          <SliderControl
            label="Vitesse Min (ms)"
            description="API: Value1 [0-1000]. Temps d'exposition minimum."
            value={settings.shutterMin}
            min={0} max={1000}
            onChange={(v) => handleSettingChange('shutterMin', v)}
          />
          <SliderControl
            label="Vitesse Max (ms)"
            description="API: Value2 [0-1000]. Temps d'exposition maximum."
            value={settings.shutterMax}
            min={0} max={1000}
            onChange={(v) => handleSettingChange('shutterMax', v)}
          />
        </div>

        {/* Gain Group */}
        <div className="space-y-6 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Gain</h3>
          <SliderControl
            label="Gain Min"
            description="API: GainMin [0-100]. Amplification minimale du signal."
            value={settings.gainMin}
            min={0} max={100}
            onChange={(v) => handleSettingChange('gainMin', v)}
          />
          <SliderControl
            label="Gain Max"
            description="API: GainMax [0-100]. Amplification maximale du signal."
            value={settings.gainMax}
            min={0} max={100}
            onChange={(v) => handleSettingChange('gainMax', v)}
          />
        </div>

        {/* Iris & Compensation Group */}
        <div className="space-y-6 p-4 bg-gray-900/30 rounded-lg border border-gray-700/50">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Optique & Image</h3>
          <SliderControl
            label="Iris (Ouverture)"
            description="API: Iris [0-100]. Contrôle l'ouverture du diaphragme."
            value={settings.iris}
            min={0} max={100}
            onChange={(v) => handleSettingChange('iris', v)}
          />
          <SliderControl
            label="Compensation d'Exposition"
            description="API: Compensation [0-100]. Ajustement de la luminosité cible."
            value={settings.compensation}
            min={0} max={100}
            onChange={(v) => handleSettingChange('compensation', v)}
          />
        </div>
      </div>

      {/* 3. AUTO RECOVERY */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Récupération Automatique</h2>
        <p className="text-gray-400 text-sm mb-6">
          Délai avant le retour automatique au mode Auto après une modification manuelle (RecoveryTime).
        </p>
        <div className="grid grid-cols-4 gap-4">
          {[0, 300, 900, 3600].map((t) => (
             <button
             key={t}
             onClick={() => handleSettingChange('recoveryTime', t)}
             className={`py-3 rounded-lg text-sm font-medium transition-all ${
               settings.recoveryTime === t
                 ? "bg-green-600 text-white shadow-lg shadow-green-500/25"
                 : "bg-gray-700 text-gray-300 hover:bg-gray-600"
             }`}
           >
             {t === 0 ? "Désactivé" : t === 300 ? "5 min" : t === 900 ? "15 min" : "1 heure"}
           </button>
          ))}
        </div>
      </div>

      {/* 4. APPLY BUTTON */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={mutation.isPending}
          className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-red-900/20"
        >
          {mutation.isPending ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              <span>Enregistrement...</span>
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
              <span>Appliquer les Paramètres</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ExposureSettings;