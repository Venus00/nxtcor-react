import type React from "react"
import { useState } from "react"
import SliderControl from "./SliderControl"

export interface ZoomFocusSettingsData {
  digitalZoom: boolean;
  zoomSpeed: number; // 0-100
  mode: 'semi-automatic' | 'automatic' | 'manual' | 'fast-semi-automatic' | 'fast-automatic';
  focusLimit: 'auto' | '1m' | '2m' | '5m' | '10m';
  sensitivity: number; // 0-100
  afTracking: boolean;
}

interface ZoomFocusSettingsProps {
  settings: ZoomFocusSettingsData;
  onSettingsChange: (settings: ZoomFocusSettingsData) => void;
}

const ZoomFocusSettings: React.FC<ZoomFocusSettingsProps> = ({ settings, onSettingsChange }) => {
  const [isInitializing, setIsInitializing] = useState(false);

  const handleDigitalZoomToggle = () => {
    onSettingsChange({ ...settings, digitalZoom: !settings.digitalZoom });
  };

  const handleZoomSpeedChange = (value: number) => {
    onSettingsChange({ ...settings, zoomSpeed: value });
  };

  const handleModeChange = (mode: ZoomFocusSettingsData['mode']) => {
    onSettingsChange({ ...settings, mode });
  };

  const handleFocusLimitChange = (focusLimit: ZoomFocusSettingsData['focusLimit']) => {
    onSettingsChange({ ...settings, focusLimit });
  };

  const handleSensitivityChange = (value: number) => {
    onSettingsChange({ ...settings, sensitivity: value });
  };

  const handleAFTrackingToggle = () => {
    onSettingsChange({ ...settings, afTracking: !settings.afTracking });
  };

  const handleLensInit = () => {
    setIsInitializing(true);
    // TODO: Implement actual lens initialization API call
    setTimeout(() => {
      setIsInitializing(false);
      alert('Initialisation de l\'objectif terminée avec succès!');
    }, 3000);
  };

  const getModeDescription = (mode: ZoomFocusSettingsData['mode']) => {
    const descriptions = {
      'semi-automatic': "La détection d'opérations telles que le zoom et la commutation ICR déclenchera automatiquement la mise au point.",
      'automatic': "La détection d'opérations telles que le changement de scène, le zoom et la commutation ICR déclenchera automatiquement la mise au point.",
      'manual': "La position de mise au point est activement ajustée par l'utilisateur sans déclenchement automatique par aucun appareil.",
      'fast-semi-automatic': "La détection d'opérations telles que le zoom et la commutation ICR déclenchera automatiquement la mise au point, et la vitesse de mise au point sera plus rapide.",
      'fast-automatic': "La détection d'opérations telles que le changement de scène, le zoom et la commutation ICR déclenchera automatiquement la mise au point, et la vitesse de mise au point sera plus rapide."
    };
    return descriptions[mode];
  };

  return (
    <div className="space-y-6">
      {/* Digital Zoom Toggle */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Zoom Numérique</h2>
        <p className="text-gray-400 text-sm mb-6">
          Active ou désactive la fonction de zoom numérique. "OFF" est défini par défaut.
        </p>

        <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg">
          <div>
            <div className="text-white font-medium">Zoom Numérique</div>
            <div className="text-gray-400 text-sm mt-1">
              {settings.digitalZoom ? 'Activé - Zoom numérique disponible' : 'Désactivé - Zoom optique uniquement'}
            </div>
          </div>
          <button
            onClick={handleDigitalZoomToggle}
            className={`relative inline-flex items-center h-10 rounded-full w-20 transition-colors focus:outline-none ${
              settings.digitalZoom ? 'bg-red-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block w-8 h-8 transform rounded-full bg-white transition-transform ${
                settings.digitalZoom ? 'translate-x-11' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Zoom Speed */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Vitesse de Zoom</h2>
        <p className="text-gray-400 text-sm mb-6">
          Définit la vitesse de zoom de la caméra. Une valeur plus élevée réalise une vitesse de zoom plus rapide. Valeur par défaut: 100.
        </p>

        <SliderControl
          label={`Vitesse de Zoom: ${settings.zoomSpeed}`}
          description="Plus la valeur est élevée, plus le zoom est rapide."
          value={settings.zoomSpeed}
          onChange={handleZoomSpeedChange}
          min={0}
          max={100}
        />
      </div>

      {/* Focus Mode */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Mode de Mise au Point</h2>
        <p className="text-gray-400 text-sm mb-6">
          Mode de déclenchement du contrôle de mise au point. Différentes options offrent différents niveaux d'automatisation et de vitesse.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
          <button
            onClick={() => handleModeChange('semi-automatic')}
            className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left ${
              settings.mode === 'semi-automatic'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.mode === 'semi-automatic' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">Semi-Automatique</div>
                <div className="text-xs mt-1 opacity-90">Zoom et ICR déclenchent la mise au point</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('automatic')}
            className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left ${
              settings.mode === 'automatic'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.mode === 'automatic' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">Automatique</div>
                <div className="text-xs mt-1 opacity-90">Changement de scène, zoom et ICR</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('manual')}
            className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left ${
              settings.mode === 'manual'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.mode === 'manual' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">Manuel</div>
                <div className="text-xs mt-1 opacity-90">Ajustement utilisateur uniquement</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('fast-semi-automatic')}
            className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left ${
              settings.mode === 'fast-semi-automatic'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.mode === 'fast-semi-automatic' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">Semi-Auto Rapide</div>
                <div className="text-xs mt-1 opacity-90">Semi-auto avec vitesse accrue</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleModeChange('fast-automatic')}
            className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left col-span-1 md:col-span-2 ${
              settings.mode === 'fast-automatic'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.mode === 'fast-automatic' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 9l3 3m0 0l-3 3m3-3H8m13 0a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-base">Automatique Rapide</div>
                <div className="text-xs mt-1 opacity-90">Automatique complet avec vitesse maximale</div>
              </div>
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

      {/* Focus Limit */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Limite de Mise au Point</h2>
        <p className="text-gray-400 text-sm mb-6">
          Définit la longueur la plus proche de la mise au point pour se concentrer sur la scène au-delà de la longueur. 
          L'option automatique sélectionnera automatiquement la longueur la plus proche appropriée selon les différentes valeurs de zoom.
        </p>

        <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
          {(['auto', '1m', '2m', '5m', '10m'] as const).map((limit) => (
            <button
              key={limit}
              onClick={() => handleFocusLimitChange(limit)}
              className={`py-4 px-4 rounded-lg font-medium transition-all ${
                settings.focusLimit === limit
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="text-lg font-bold">{limit === 'auto' ? '🔄' : '📏'}</div>
                <div className="text-sm mt-1">{limit === 'auto' ? 'Auto' : limit}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Sensitivity */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Sensibilité de Mise au Point</h2>
        <p className="text-gray-400 text-sm mb-6">
          Définit la stabilité ou la capacité anti-interférence de la mise au point. 
          Une valeur inférieure réalise une stabilité plus élevée, et une valeur supérieure réalise une capacité anti-interférence plus élevée.
        </p>

        <SliderControl
          label={`Sensibilité: ${settings.sensitivity}`}
          description="Faible = Stable | Élevé = Anti-interférence"
          value={settings.sensitivity}
          onChange={handleSensitivityChange}
          min={0}
          max={100}
        />

        <div className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
          <div className="p-2 bg-gray-900/30 rounded">
            <div className="text-gray-400">0-33</div>
            <div className="text-white font-semibold mt-1">Très Stable</div>
          </div>
          <div className="p-2 bg-gray-900/30 rounded">
            <div className="text-gray-400">34-66</div>
            <div className="text-white font-semibold mt-1">Équilibré</div>
          </div>
          <div className="p-2 bg-gray-900/30 rounded">
            <div className="text-gray-400">67-100</div>
            <div className="text-white font-semibold mt-1">Anti-Interférence</div>
          </div>
        </div>
      </div>

      {/* AF Tracking */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Suivi Autofocus (AF Tracking)</h2>
        <p className="text-gray-400 text-sm mb-6">
          Cette fonction permet à l'image d'être relativement claire pendant le processus de zoom. 
          Si la fonction est désactivée, la vitesse de zoom sera plus élevée pendant le processus de zoom.
        </p>

        <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg">
          <div>
            <div className="text-white font-medium">Suivi AF</div>
            <div className="text-gray-400 text-sm mt-1">
              {settings.afTracking 
                ? 'Activé - Image claire pendant le zoom (plus lent)' 
                : 'Désactivé - Zoom plus rapide (image moins claire)'}
            </div>
          </div>
          <button
            onClick={handleAFTrackingToggle}
            className={`relative inline-flex items-center h-10 rounded-full w-20 transition-colors focus:outline-none ${
              settings.afTracking ? 'bg-red-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block w-8 h-8 transform rounded-full bg-white transition-transform ${
                settings.afTracking ? 'translate-x-11' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Lens Initialization */}
      <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg p-6 border border-blue-700/30">
        <h2 className="text-xl font-semibold text-white mb-4">Initialisation de l'Objectif</h2>
        <p className="text-gray-400 text-sm mb-6">
          Cliquez sur ce bouton pour effectuer une initialisation automatique de l'objectif. 
          L'objectif de l'appareil effectuera une action d'étirement pour calibrer le zoom et la mise au point de l'objectif.
        </p>

        <button
          onClick={handleLensInit}
          disabled={isInitializing}
          className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${
            isInitializing
              ? 'bg-gray-600 cursor-not-allowed'
              : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
          }`}
        >
          {isInitializing ? (
            <div className="flex items-center justify-center gap-3">
              <svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Initialisation en cours...</span>
            </div>
          ) : (
            <div className="flex items-center justify-center gap-3">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Initialiser l'Objectif</span>
            </div>
          )}
        </button>

        {isInitializing && (
          <div className="mt-4 p-3 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <p className="text-blue-300 text-sm text-center">
              L'objectif est en cours de calibration. Veuillez ne pas interrompre le processus...
            </p>
          </div>
        )}
      </div>

      {/* Status Summary */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Résumé des Paramètres</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Zoom Numérique</div>
            <div className="text-white font-semibold">{settings.digitalZoom ? 'ON' : 'OFF'}</div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Vitesse de Zoom</div>
            <div className="text-white font-semibold">{settings.zoomSpeed}</div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Mode</div>
            <div className="text-white font-semibold text-xs">
              {settings.mode === 'semi-automatic' ? 'Semi-Auto' :
               settings.mode === 'automatic' ? 'Auto' :
               settings.mode === 'manual' ? 'Manuel' :
               settings.mode === 'fast-semi-automatic' ? 'Semi-Auto Rapide' :
               'Auto Rapide'}
            </div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Limite Focus</div>
            <div className="text-white font-semibold">{settings.focusLimit === 'auto' ? 'Auto' : settings.focusLimit}</div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Sensibilité</div>
            <div className="text-white font-semibold">{settings.sensitivity}</div>
          </div>
          <div className="p-3 bg-gray-900/30 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Suivi AF</div>
            <div className="text-white font-semibold">{settings.afTracking ? 'ON' : 'OFF'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ZoomFocusSettings;
