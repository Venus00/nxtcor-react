// components/camera/DefogSettings.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useDefog } from "../../hooks/useCameraQueries";
import { useSetDefog } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface DefogSettingsData {
  mode: 'off' | 'auto' | 'manual';
  intensity: 'low' | 'middle' | 'high';
}

interface DefogSettingsProps {
  // Component manages data internally now
}

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

const defaultState: DefogSettingsData = {
  mode: 'off',
  intensity: 'middle',
};

/**
 * Parses the flat API response keys into a structured UI object.
 * Fixed to Index [0][0] per request.
 * API Ref: Mode (Off, Auto, Manul), Intensity (0:Low, 1:Middle, 2:High)
 */
const apiToUI = (data: any): DefogSettingsData => {
  if (!data) return defaultState;

  const config = data.config || data;
  const prefix = "table.VideoInDefog[0][0].";

  const getVal = (key: string, def: any) => {
    const fullKey = prefix + key;
    return config[fullKey] !== undefined ? config[fullKey] : def;
  };

  // Map Mode
  const apiMode = getVal("Mode", "Off");
  let mode: DefogSettingsData['mode'] = 'off';
  if (apiMode === "Auto") mode = 'auto';
  else if (apiMode === "Manul") mode = 'manual'; // Note API spelling "Manul"

  // Map Intensity
  const apiIntensity = Number(getVal("Intensity", 1));
  let intensity: DefogSettingsData['intensity'] = 'middle';
  if (apiIntensity === 0) intensity = 'low';
  else if (apiIntensity === 2) intensity = 'high';

  return { mode, intensity };
};

/**
 * Converts UI state back to API payload.
 */
const uiToApi = (ui: DefogSettingsData) => {
  // const prefix = "table.VideoInDefog[0][0].";

  // Map Mode
  let apiMode = "Off";
  if (ui.mode === 'auto') apiMode = "Auto";
  else if (ui.mode === 'manual') apiMode = "Manul"; // API specific spelling

  // Map Intensity
  let apiIntensity = 1;
  if (ui.intensity === 'low') apiIntensity = 0;
  else if (ui.intensity === 'high') apiIntensity = 2;

  return {
    [`Mode`]: apiMode,
    // Only send intensity if manual mode is active or being activated, 
    // though sending it always is safer for state consistency
    [`Intensity`]: apiIntensity,
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

const DefogSettings: React.FC<DefogSettingsProps> = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error, refetch } = useDefog(camId);
  const mutation = useSetDefog(camId);

  // Local State
  const [settings, setSettings] = useState<DefogSettingsData>(defaultState);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      setSettings(parsed);
    }
  }, [apiData]);

  // Handlers
  const handleUpdate = (newSettings: DefogSettingsData) => {
    setSettings(newSettings);
    mutation.mutate(uiToApi(newSettings));
  };

  const handleModeChange = (mode: DefogSettingsData['mode']) => {
    handleUpdate({ ...settings, mode });
  };

  const handleIntensityChange = (intensity: DefogSettingsData['intensity']) => {
    handleUpdate({ ...settings, intensity });
  };

  const getModeDescription = (mode: DefogSettingsData['mode']) => {
    const descriptions = {
      'off': "Le mode de débrouillage est désactivé. Aucun traitement anti-brouillard ne sera appliqué à l'image.",
      'auto': "Le système détecte automatiquement les conditions de brouillard et ajuste l'intensité du débrouillage en conséquence.",
      'manual': "Vous contrôlez manuellement l'intensité du débrouillage. Utile pour des conditions spécifiques ou des préférences personnalisées."
    };
    return descriptions[mode];
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement du Débrouillage...</p>
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

      {/* Mode Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Mode de Débrouillage</h2>
        <p className="text-gray-400 text-sm mb-6">
          Sélectionnez le mode de fonctionnement du système anti-brouillard. Le mode "OFF" est défini par défaut.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {/* OFF Mode */}
          <button
            onClick={() => handleModeChange('off')}
            className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
              settings.mode === 'off'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.mode === 'off' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">OFF</div>
                <div className="text-xs mt-1 opacity-90">Désactivé</div>
              </div>
            </div>
            {settings.mode === 'off' && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </button>

          {/* Auto Mode */}
          <button
            onClick={() => handleModeChange('auto')}
            className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
              settings.mode === 'auto'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.mode === 'auto' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">Auto</div>
                <div className="text-xs mt-1 opacity-90">Automatique</div>
              </div>
            </div>
            {settings.mode === 'auto' && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </button>

          {/* Manual Mode */}
          <button
            onClick={() => handleModeChange('manual')}
            className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
              settings.mode === 'manual'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.mode === 'manual' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-bold text-lg">Manuel</div>
                <div className="text-xs mt-1 opacity-90">Contrôle manuel</div>
              </div>
            </div>
            {settings.mode === 'manual' && (
              <div className="absolute top-2 right-2">
                <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
              </div>
            )}
          </button>
        </div>

        {/* Mode Description */}
        <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <div className="flex items-start gap-3">
            <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <p className="text-gray-300 text-sm leading-relaxed">
              {getModeDescription(settings.mode)}
            </p>
          </div>
        </div>
      </div>

      {/* Intensity Selection - Only shown when mode is manual */}
      {settings.mode === 'manual' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Intensité de Débrouillage</h2>
          <p className="text-gray-400 text-sm mb-6">
            Définissez le niveau d'intensité du traitement anti-brouillard. L'intensité moyenne est définie par défaut.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Low Intensity */}
            <button
              onClick={() => handleIntensityChange('low')}
              className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
                settings.intensity === 'low'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                  settings.intensity === 'low' ? 'bg-white/20' : 'bg-gray-600'
                }`}>
                  <div className="flex gap-1 items-end h-8">
                    <div className={`w-2 h-3 rounded-sm ${settings.intensity === 'low' ? 'bg-white' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-2 rounded-sm ${settings.intensity === 'low' ? 'bg-white/40' : 'bg-gray-500/40'}`}></div>
                    <div className={`w-2 h-2 rounded-sm ${settings.intensity === 'low' ? 'bg-white/20' : 'bg-gray-500/20'}`}></div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg">Faible</div>
                  <div className="text-xs mt-1 opacity-90">Débrouillage léger (API: 0)</div>
                </div>
              </div>
              {settings.intensity === 'low' && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>

            {/* Middle Intensity */}
            <button
              onClick={() => handleIntensityChange('middle')}
              className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
                settings.intensity === 'middle'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                  settings.intensity === 'middle' ? 'bg-white/20' : 'bg-gray-600'
                }`}>
                  <div className="flex gap-1 items-end h-8">
                    <div className={`w-2 h-5 rounded-sm ${settings.intensity === 'middle' ? 'bg-white' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-5 rounded-sm ${settings.intensity === 'middle' ? 'bg-white' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-2 rounded-sm ${settings.intensity === 'middle' ? 'bg-white/40' : 'bg-gray-500/40'}`}></div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg">Moyen</div>
                  <div className="text-xs mt-1 opacity-90">Débrouillage équilibré (API: 1)</div>
                </div>
              </div>
              {settings.intensity === 'middle' && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>

            {/* High Intensity */}
            <button
              onClick={() => handleIntensityChange('high')}
              className={`group relative py-6 px-5 rounded-lg font-medium transition-all text-left ${
                settings.intensity === 'high'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex flex-col items-center text-center gap-2">
                <div className={`w-14 h-14 rounded-lg flex items-center justify-center ${
                  settings.intensity === 'high' ? 'bg-white/20' : 'bg-gray-600'
                }`}>
                  <div className="flex gap-1 items-end h-8">
                    <div className={`w-2 h-7 rounded-sm ${settings.intensity === 'high' ? 'bg-white' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-7 rounded-sm ${settings.intensity === 'high' ? 'bg-white' : 'bg-gray-400'}`}></div>
                    <div className={`w-2 h-7 rounded-sm ${settings.intensity === 'high' ? 'bg-white' : 'bg-gray-400'}`}></div>
                  </div>
                </div>
                <div>
                  <div className="font-bold text-lg">Élevé</div>
                  <div className="text-xs mt-1 opacity-90">Débrouillage maximal (API: 2)</div>
                </div>
              </div>
              {settings.intensity === 'high' && (
                <div className="absolute top-2 right-2">
                  <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          </div>

          {/* Intensity Guide */}
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="font-semibold mb-1">Guide d'utilisation :</p>
                <ul className="space-y-1 text-xs">
                  <li>• <strong>Faible</strong> : Pour un léger brouillard ou brume matinale</li>
                  <li>• <strong>Moyen</strong> : Pour des conditions de brouillard standard (recommandé)</li>
                  <li>• <strong>Élevé</strong> : Pour un brouillard dense ou des conditions extrêmes</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Status Summary */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">État Actuel</h2>
        <div className="grid grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-2">Mode de Débrouillage</div>
            <div className="text-white font-bold text-lg">
              {settings.mode === 'off' ? 'Désactivé' : 
               settings.mode === 'auto' ? 'Automatique' : 
               'Manuel'}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                settings.mode === 'off' ? 'bg-gray-500' : 'bg-green-400 animate-pulse'
              }`}></div>
              <span className="text-xs text-gray-400">
                {settings.mode === 'off' ? 'Inactif' : 'Actif'}
              </span>
            </div>
          </div>
          
          <div className={`p-4 bg-gray-900/30 rounded-lg ${settings.mode !== 'manual' ? 'opacity-50' : ''}`}>
            <div className="text-gray-400 text-xs mb-2">Intensité</div>
            <div className="text-white font-bold text-lg">
              {settings.intensity === 'low' ? 'Faible' : 
               settings.intensity === 'middle' ? 'Moyen' : 
               'Élevé'}
            </div>
            <div className="mt-2 flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${
                settings.mode === 'manual' ? 'bg-blue-400' : 'bg-gray-500'
              }`}></div>
              <span className="text-xs text-gray-400">
                {settings.mode === 'manual' ? 'Configurable' : 'Non disponible'}
              </span>
            </div>
          </div>
        </div>

        {settings.mode === 'off' && (
          <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-700/30 rounded-lg">
            <p className="text-yellow-300 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              Le débrouillage est actuellement désactivé. Activez le mode Auto ou Manuel pour améliorer la visibilité dans le brouillard.
            </p>
          </div>
        )}

        {settings.mode === 'auto' && (
          <div className="mt-4 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
            <p className="text-green-300 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Le mode automatique est actif. Le système ajustera l'intensité du débrouillage selon les conditions détectées.
            </p>
          </div>
        )}

        {settings.mode === 'manual' && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-blue-300 text-sm flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              Le mode manuel est actif. L'intensité est réglée sur <strong>{settings.intensity === 'low' ? 'Faible' : settings.intensity === 'middle' ? 'Moyen' : 'Élevé'}</strong>.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default DefogSettings;