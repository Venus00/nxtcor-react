// components/camera/WhiteBalanceSettings.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useWhiteBalance } from "../../hooks/useCameraQueries";
import { useSetWhiteBalance } from "../../hooks/useCameraMutations"; // Assuming this hook exists

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface WhiteBalanceSettingsData {
  mode: 'auto' | 'indoor' | 'outdoor' | 'tracking' | 'manual' | 'sodium-lamp' | 'natural-light' | 'street-light';
  gainRed?: number;   // API: GainRed (0-100) - Stored for logic, even if no slider in UI yet
  gainBlue?: number;  // API: GainBlue (0-100)
  gainGreen?: number; // API: GainGreen (0-100)
}

interface WhiteBalanceSettingsProps {
  // Component is now self-contained via Context
}

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Mapping between UI Keys and API String Values
 * API Values based on doc: Auto, Indoor, Outdoor, ATW, Manual, Sodium, Natural, StreetLamp
 */
const MODE_MAP_TO_UI: Record<string, WhiteBalanceSettingsData['mode']> = {
  'Auto': 'auto',
  'Indoor': 'indoor',
  'Outdoor': 'outdoor',
  'ATW': 'tracking', // ATW = Auto Tracking White Balance
  'Manual': 'manual',
  'Sodium': 'sodium-lamp',
  'Natural': 'natural-light',
  'StreetLamp': 'street-light'
};

const MODE_MAP_TO_API: Record<WhiteBalanceSettingsData['mode'], string> = {
  'auto': 'Auto',
  'indoor': 'Indoor',
  'outdoor': 'Outdoor',
  'tracking': 'ATW',
  'manual': 'Manual',
  'sodium-lamp': 'Sodium',
  'natural-light': 'Natural',
  'street-light': 'StreetLamp'
};

const defaultState: WhiteBalanceSettingsData = {
  mode: 'auto',
  gainRed: 50,
  gainBlue: 50,
  gainGreen: 50
};

/**
 * Parses the flat API response keys into a structured UI object.
 * Fixed to Index [0][0]
 */
const apiToUI = (data: any): WhiteBalanceSettingsData => {
  if (!data) return defaultState;
  
  const config = data.config || data;
  const prefix = "table.VideoInWhiteBalance[0][0].";

  const getVal = (key: string, def: any) => {
    const fullKey = prefix + key;
    return config[fullKey] !== undefined ? config[fullKey] : def;
  };

  const apiMode = getVal("Mode", "Auto");
  
  return {
    mode: MODE_MAP_TO_UI[apiMode] || 'auto',
    gainRed: Number(getVal("GainRed", 50)),
    gainBlue: Number(getVal("GainBlue", 50)),
    gainGreen: Number(getVal("GainGreen", 50)),
  };
};

/**
 * Converts UI state back to API payload
 */
const uiToApi = (ui: WhiteBalanceSettingsData) => {
  const prefix = "table.VideoInWhiteBalance[0][0].";
  
  // We mainly update the Mode here based on the UI
  return {
    [`${prefix}Mode`]: MODE_MAP_TO_API[ui.mode],
    // We include gains in the payload to ensure state consistency, 
    // though they are only effective in 'Manual' mode.
    [`${prefix}GainRed`]: ui.gainRed,
    [`${prefix}GainBlue`]: ui.gainBlue,
    [`${prefix}GainGreen`]: ui.gainGreen,
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

const WhiteBalanceSettings: React.FC<WhiteBalanceSettingsProps> = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error, refetch } = useWhiteBalance(camId);
  const mutation = useSetWhiteBalance(camId);

  // Local State
  const [settings, setSettings] = useState<WhiteBalanceSettingsData>(defaultState);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      setSettings(parsed);
    }
  }, [apiData]);

  // Handlers
  const handleModeChange = (mode: WhiteBalanceSettingsData['mode']) => {
    const newSettings = { ...settings, mode };
    setSettings(newSettings); // Optimistic update
    mutation.mutate(uiToApi(newSettings));
  };

  const getModeDescription = (mode: WhiteBalanceSettingsData['mode']) => {
    const descriptions = {
      'auto': "Le mode automatique ajuste automatiquement la balance des blancs en fonction des conditions d'éclairage détectées.",
      'indoor': "Optimisé pour l'éclairage intérieur typique avec des ampoules incandescentes ou fluorescentes.",
      'outdoor': "Conçu pour les conditions d'éclairage extérieur avec lumière naturelle du soleil.",
      'tracking': "Suit et ajuste continuellement la balance des blancs en fonction des changements d'éclairage (ATW).",
      'manual': "Permet un contrôle manuel complet de la balance des blancs pour des ajustements précis.",
      'sodium-lamp': "Optimisé pour l'éclairage aux lampes à sodium, couramment utilisé dans l'éclairage public.",
      'natural-light': "Réglé pour la lumière naturelle, idéal pour les environnements extérieurs pendant la journée.",
      'street-light': "Adapté aux conditions d'éclairage urbain et aux lampadaires."
    };
    return descriptions[mode];
  };

  const modes: Array<{ value: WhiteBalanceSettingsData['mode']; label: string; icon: string }> = [
    { value: 'auto', label: 'Automatique', icon: '🔄' },
    { value: 'indoor', label: 'Intérieur', icon: '🏠' },
    { value: 'outdoor', label: 'Extérieur', icon: '🌤️' },
    { value: 'tracking', label: 'Suivi', icon: '🎯' },
    { value: 'manual', label: 'Manuel', icon: '⚙️' },
    { value: 'sodium-lamp', label: 'Lampe Sodium', icon: '💡' },
    { value: 'natural-light', label: 'Lumière Naturelle', icon: '☀️' },
    { value: 'street-light', label: 'Éclairage Public', icon: '🌃' },
  ];

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de la Balance des Blancs...</p>
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
      {mutation.isPending && (
         <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300 flex items-center gap-2 text-sm">
           <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-300"></div>
           Enregistrement en cours...
         </div>
      )}

      {/* White Balance Mode Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Mode de Balance des Blancs</h2>
        <p className="text-gray-400 text-sm mb-6">
          Sélectionnez le mode de balance des blancs approprié pour vos conditions d'éclairage. 
          Le mode "Automatique" est défini par défaut.
        </p>

        {/* Mode Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          {modes.map((mode) => (
            <button
              key={mode.value}
              onClick={() => handleModeChange(mode.value)}
              disabled={mutation.isPending}
              className={`group relative py-4 px-4 rounded-lg font-medium transition-all ${
                settings.mode === mode.value
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25 scale-105'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600 hover:scale-102'
              }`}
            >
              <div className="flex flex-col items-center gap-2">
                <span className="text-2xl">{mode.icon}</span>
                <span className="text-sm text-center leading-tight">{mode.label}</span>
              </div>
              
              {/* Active indicator */}
              {settings.mode === mode.value && (
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 animate-pulse"></div>
              )}
            </button>
          ))}
        </div>

        {/* Mode Description */}
        <div className="mt-6 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <div className="flex items-start gap-3">
            <div className="flex-shrink-0 w-8 h-8 bg-red-600/20 rounded-lg flex items-center justify-center mt-0.5">
              <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-white font-semibold text-sm mb-1">
                {modes.find(m => m.value === settings.mode)?.label}
              </h3>
              <p className="text-gray-300 text-sm leading-relaxed">
                {getModeDescription(settings.mode)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Visual Preview Section */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Informations sur la Balance des Blancs</h2>
        <div className="space-y-3">
          <div className="flex justify-between items-center p-3 bg-gray-900/30 rounded-lg">
            <span className="text-gray-400 text-sm">Mode Actuel:</span>
            <span className="text-white font-semibold">
              {modes.find(m => m.value === settings.mode)?.label}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-900/30 rounded-lg">
            <span className="text-gray-400 text-sm">Type d'Éclairage:</span>
            <span className="text-white font-semibold">
              {settings.mode === 'auto' ? 'Détection Automatique' :
               settings.mode === 'indoor' ? 'Intérieur (3200K)' :
               settings.mode === 'outdoor' ? 'Extérieur (5600K)' :
               settings.mode === 'sodium-lamp' ? 'Sodium (2100K)' :
               settings.mode === 'natural-light' ? 'Naturel (6500K)' :
               settings.mode === 'street-light' ? 'Public (4000K)' :
               settings.mode === 'tracking' ? 'Suivi Dynamique' :
               'Personnalisé'}
            </span>
          </div>
          <div className="flex justify-between items-center p-3 bg-gray-900/30 rounded-lg">
            <span className="text-gray-400 text-sm">Ajustement:</span>
            <span className="text-white font-semibold">
              {settings.mode === 'auto' || settings.mode === 'tracking' ? 'Automatique' : 'Fixe'}
            </span>
          </div>
        </div>
      </div>

      {/* Tips Section */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg p-6 border border-blue-700/30">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0">
            <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-blue-300 font-semibold text-sm mb-2">💡 Conseils d'Utilisation</h3>
            <ul className="space-y-1.5 text-gray-300 text-xs">
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Utilisez <strong>Automatique</strong> pour des conditions d'éclairage variables</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Choisissez <strong>Intérieur</strong> ou <strong>Extérieur</strong> pour des environnements constants</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Le mode <strong>Suivi</strong> est idéal pour les scènes avec changements d'éclairage fréquents</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-blue-400 mt-0.5">•</span>
                <span>Utilisez <strong>Manuel</strong> pour un contrôle précis dans des situations spécifiques</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WhiteBalanceSettings;