// components/camera/DayNightSettings.tsx
import React, { useEffect, useState } from "react";
import SliderControl from "./SliderControl";
import { useCamId } from "../../contexts/CameraContext";
import { useDayNight } from "../../hooks/useCameraQueries";
import { useSetDayNight } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface DayNightSettingsData {
  type: 'icr' | 'electronic';
  mode: 'color' | 'black-white' | 'auto' | 'photoresistor';
  sensitivity: 'low' | 'medium' | 'high';
  latency: number; // 2-10 seconds
}

interface DayNightSettingsProps {
  // Component manages its own data fetching now
}

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

const defaultState: DayNightSettingsData = {
  type: 'icr',
  mode: 'auto',
  sensitivity: 'medium',
  latency: 10,
};

/**
 * Parses the flat API response keys into a structured UI object.
 * Hardcoded to [0][0] per request.
 * * API References:
 * Mode: Brightness(Auto), Color, BlackWhite, PhotoresistorExt
 * Type: ICR, Electron
 * Sensitivity: 1(High), 2(Middle), 3(Low)
 */
const apiToUI = (data: any): DayNightSettingsData => {
  if (!data) return defaultState;

  const config = data.config || data;
  const prefix = "table.VideoInDayNight[0][0].";

  const getVal = (key: string, def: any) => {
    const fullKey = prefix + key;
    return config[fullKey] !== undefined ? config[fullKey] : def;
  };

  // 1. Map Type
  const apiType = getVal("Type", "ICR");
  const type = apiType === "Electron" ? 'electronic' : 'icr';

  // 2. Map Mode
  const apiMode = getVal("Mode", "Brightness");
  let mode: DayNightSettingsData['mode'] = 'auto';
  if (apiMode === "Color") mode = 'color';
  else if (apiMode === "BlackWhite") mode = 'black-white';
  else if (apiMode === "PhotoresistorExt") mode = 'photoresistor';
  else mode = 'auto'; // "Brightness" in API = Auto

  // 3. Map Sensitivity (API: 1=High, 3=Low)
  const apiSens = Number(getVal("Sensitivity", 2));
  let sensitivity: DayNightSettingsData['sensitivity'] = 'medium';
  if (apiSens === 3) sensitivity = 'low';
  else if (apiSens === 1) sensitivity = 'high';

  // 4. Map Latency (Delay)
  const latency = Number(getVal("Delay", 10));

  return { type, mode, sensitivity, latency };
};

/**
 * Converts UI state back to API payload.
 */
const uiToApi = (ui: DayNightSettingsData) => {
  const prefix = "table.VideoInDayNight[0][0].";
  
  // Map Type
  const apiType = ui.type === 'electronic' ? "Electron" : "ICR";

  // Map Mode
  let apiMode = "Brightness";
  if (ui.mode === 'color') apiMode = "Color";
  else if (ui.mode === 'black-white') apiMode = "BlackWhite";
  else if (ui.mode === 'photoresistor') apiMode = "PhotoresistorExt";

  // Map Sensitivity (UI Low -> API 3, UI High -> API 1)
  let apiSens = 2;
  if (ui.sensitivity === 'low') apiSens = 3;
  else if (ui.sensitivity === 'high') apiSens = 1;

  return {
    [`${prefix}Type`]: apiType,
    [`${prefix}Mode`]: apiMode,
    [`${prefix}Sensitivity`]: apiSens,
    [`${prefix}Delay`]: ui.latency,
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

const DayNightSettings: React.FC<DayNightSettingsProps> = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error, refetch } = useDayNight(camId);
  const mutation = useSetDayNight(camId);

  // Local State
  const [settings, setSettings] = useState<DayNightSettingsData>(defaultState);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      setSettings(parsed);
    }
  }, [apiData]);

  // Handlers (Optimistic Updates + API Call)
  const handleUpdate = (newSettings: DayNightSettingsData) => {
    setSettings(newSettings);
    mutation.mutate(uiToApi(newSettings));
  };

  const handleTypeChange = (type: DayNightSettingsData['type']) => {
    handleUpdate({ ...settings, type });
  };

  const handleModeChange = (mode: DayNightSettingsData['mode']) => {
    handleUpdate({ ...settings, mode });
  };

  const handleSensitivityChange = (sensitivity: DayNightSettingsData['sensitivity']) => {
    handleUpdate({ ...settings, sensitivity });
  };

  const handleLatencyChange = (latency: number) => {
    handleUpdate({ ...settings, latency });
  };

  const getTypeDescription = (type: DayNightSettingsData['type']) => {
    if (type === 'icr') {
      return "Commutation mécanique de la couleur au noir et blanc, et réalisation de la commutation jour/nuit avec un filtre lumineux.";
    }
    return "Réalisation de la commutation jour/nuit au moyen du traitement d'image électronique.";
  };

  const getModeDescription = (mode: DayNightSettingsData['mode']) => {
    const descriptions = {
      'color': "Active la caméra pour ne produire que des images en couleur.",
      'black-white': "Active la caméra pour ne produire que des images en noir et blanc.",
      'auto': "Sortie d'images en couleur ou en noir et blanc selon l'adaptation automatique à l'environnement (Mode=Brightness).",
      'photoresistor': "Active la caméra pour produire des images en couleur ou en noir et blanc selon la luminosité ambiante détectée par photorésistance."
    };
    return descriptions[mode];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement DayNight...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Feedback Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300">
          Erreur: {(error as Error).message}
          <button onClick={() => refetch()} className="ml-4 underline hover:no-underline">Réessayer</button>
        </div>
      )}
      {mutation.isPending && (
         <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300 flex items-center gap-2 text-sm">
           <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-300"></div>
           Enregistrement en cours...
         </div>
      )}

      {/* Switching Type Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Type de Commutation Jour/Nuit</h2>
        <p className="text-gray-400 text-sm mb-6">
          Le mode de commutation jour/nuit contient les options électronique et ICR. ICR est défini par défaut.
        </p>

        <div className="grid grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleTypeChange('icr')}
            className={`group relative py-6 px-6 rounded-lg font-medium transition-all ${
              settings.type === 'icr'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                settings.type === 'icr' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">ICR (Mécanique)</div>
                <div className="text-xs mt-1 opacity-80">Filtre Lumineux</div>
              </div>
            </div>
            {settings.type === 'icr' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>

          <button
            onClick={() => handleTypeChange('electronic')}
            className={`group relative py-6 px-6 rounded-lg font-medium transition-all ${
              settings.type === 'electronic'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex flex-col items-center gap-3">
              <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                settings.type === 'electronic' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <div className="text-center">
                <div className="font-semibold text-base">Électronique</div>
                <div className="text-xs mt-1 opacity-80">Traitement d'Image</div>
              </div>
            </div>
            {settings.type === 'electronic' && (
              <div className="absolute -top-2 -right-2 w-6 h-6 bg-green-500 rounded-full border-2 border-gray-900 flex items-center justify-center">
                <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </div>
            )}
          </button>
        </div>

        {/* Type Description */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <p className="text-gray-300 text-sm leading-relaxed">
            {getTypeDescription(settings.type)}
          </p>
        </div>
      </div>

      {/* Day/Night Mode Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Mode Jour/Nuit</h2>
        <p className="text-gray-400 text-sm mb-6">
          Définir l'image en mode couleur ou en mode noir et blanc. Le mode "Automatique" est défini par défaut.
        </p>

        <div className="grid grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleModeChange('color')}
            className={`py-4 px-4 rounded-lg font-medium transition-all ${
              settings.mode === 'color'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-red-500 via-yellow-500 to-blue-500"></div>
              <span>Couleur</span>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('black-white')}
            className={`py-4 px-4 rounded-lg font-medium transition-all ${
              settings.mode === 'black-white'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-gray-800 to-gray-400"></div>
              <span>Noir et Blanc</span>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('auto')}
            className={`py-4 px-4 rounded-lg font-medium transition-all ${
              settings.mode === 'auto'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Automatique</span>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('photoresistor')}
            className={`py-4 px-4 rounded-lg font-medium transition-all ${
              settings.mode === 'photoresistor'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-center gap-3">
              <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <span>Photorésistance</span>
            </div>
          </button>
        </div>

        {/* Mode Description */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <p className="text-gray-300 text-sm leading-relaxed">
            {getModeDescription(settings.mode)}
          </p>
        </div>
      </div>

      {/* Sensitivity Settings (only for Auto mode) */}
      {settings.mode === 'auto' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Sensibilité</h2>
          <p className="text-gray-400 text-sm mb-6">
            Ajustez la sensibilité de commutation couleur/noir et blanc. Le niveau moyen est défini par défaut.
          </p>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={() => handleSensitivityChange('low')}
              className={`py-4 px-6 rounded-lg font-medium transition-all ${
                settings.sensitivity === 'low'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🐢</div>
                <div>Faible</div>
                <div className="text-[10px] text-gray-300 mt-1">API: 3</div>
              </div>
            </button>

            <button
              onClick={() => handleSensitivityChange('medium')}
              className={`py-4 px-6 rounded-lg font-medium transition-all ${
                settings.sensitivity === 'medium'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">🚶</div>
                <div>Moyen</div>
                <div className="text-[10px] text-gray-300 mt-1">API: 2</div>
              </div>
            </button>

            <button
              onClick={() => handleSensitivityChange('high')}
              className={`py-4 px-6 rounded-lg font-medium transition-all ${
                settings.sensitivity === 'high'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-2xl mb-2">⚡</div>
                <div>Élevé</div>
                <div className="text-[10px] text-gray-300 mt-1">API: 1</div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Latency Settings (only for Auto mode) */}
      {settings.mode === 'auto' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">Latence de Commutation</h2>
          <p className="text-gray-400 text-sm mb-6">
            Ajustez la valeur de retard de commutation couleur/noir et blanc dans une plage de 2 à 10 secondes.
          </p>

          <SliderControl
            label={`Latence: ${settings.latency} secondes`}
            description="Délai avant la commutation entre les modes couleur et noir et blanc."
            value={settings.latency}
            onChange={handleLatencyChange}
            min={2}
            max={10}
          />
        </div>
      )}

      {/* Status Information */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">État Actuel</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Type de Commutation</div>
            <div className="text-white font-semibold">
              {settings.type === 'icr' ? 'ICR (Mécanique)' : 'Électronique'}
            </div>
          </div>

          <div className="p-4 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Mode</div>
            <div className="text-white font-semibold">
              {settings.mode === 'color' ? 'Couleur' :
               settings.mode === 'black-white' ? 'Noir et Blanc' :
               settings.mode === 'auto' ? 'Automatique' :
               'Photorésistance'}
            </div>
          </div>

          {settings.mode === 'auto' && (
            <>
              <div className="p-4 bg-gray-900/30 rounded-lg">
                <div className="text-gray-400 text-xs mb-1">Sensibilité</div>
                <div className="text-white font-semibold capitalize">
                  {settings.sensitivity === 'low' ? 'Faible (3)' :
                   settings.sensitivity === 'medium' ? 'Moyen (2)' :
                   'Élevé (1)'}
                </div>
              </div>

              <div className="p-4 bg-gray-900/30 rounded-lg">
                <div className="text-gray-400 text-xs mb-1">Latence</div>
                <div className="text-white font-semibold">{settings.latency}s</div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default DayNightSettings;