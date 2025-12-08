// components/camera/ZoomFocusSettings.tsx
import React, { useEffect, useState } from "react";
import SliderControl from "./SliderControl";
import { useCamId } from "../../contexts/CameraContext";
import { useZoom, useFocus } from "../../hooks/useCameraQueries";
import { useSetZoom, useSetFocus } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ZoomFocusSettingsData {
  digitalZoom: boolean;
  zoomSpeed: number; // 0-100
  mode: 'semi-automatic' | 'automatic' | 'manual' | 'fast-semi-automatic' | 'fast-automatic';
  focusLimit: 'auto' | '1m' | '2m' | '5m' | '10m';
  sensitivity: number; // 0-100 (Mapped from 0-2 in API)
  afTracking: boolean;
}

interface ZoomFocusSettingsProps {
  // Component manages its own data fetching now
}

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

const defaultState: ZoomFocusSettingsData = {
  digitalZoom: false,
  zoomSpeed: 50,
  mode: 'semi-automatic',
  focusLimit: 'auto',
  sensitivity: 50,
  afTracking: true,
};

/**
 * Mappings for Focus Mode
 * 2: Auto, 3: Semi-Auto, 4: Manual, 5: Fast Semi-Auto, 6: Fast Auto
 */
const FOCUS_MODE_MAP_TO_UI: Record<number, ZoomFocusSettingsData['mode']> = {
  3: 'semi-automatic',
  2: 'automatic',
  4: 'manual',
  5: 'fast-semi-automatic',
  6: 'fast-automatic'
};

const FOCUS_MODE_MAP_TO_API: Record<ZoomFocusSettingsData['mode'], number> = {
  'semi-automatic': 3,
  'automatic': 2,
  'manual': 4,
  'fast-semi-automatic': 5,
  'fast-automatic': 6
};

/**
 * Mappings for Focus Limit (Values roughly based on documentation examples)
 * API sends raw integer distance values (e.g. 1000 for 1m).
 * Special handling: FocusLimitSelectMode="Auto" overrides specific limit.
 */
const mapApiLimitToUI = (limit: number, mode: string): ZoomFocusSettingsData['focusLimit'] => {
  if (mode === "Auto") return 'auto';
  if (limit <= 1000) return '1m';
  if (limit <= 2000) return '2m';
  if (limit <= 5000) return '5m';
  return '10m';
};

const mapUILimitToApi = (uiLimit: ZoomFocusSettingsData['focusLimit']): { val: number, mode: string } => {
  if (uiLimit === 'auto') return { val: 50, mode: "Auto" }; // Default val doesn't matter if mode is Auto
  if (uiLimit === '1m') return { val: 1000, mode: "Manual" };
  if (uiLimit === '2m') return { val: 2000, mode: "Manual" };
  if (uiLimit === '5m') return { val: 5000, mode: "Manual" };
  return { val: 10000, mode: "Manual" }; // 10m
};

/**
 * Mappings for Sensitivity
 * API: 0=High, 1=Middle, 2=Low
 * UI: 0-100 Slider
 */
const mapApiSensitivityToUI = (val: number): number => {
  if (val === 0) return 100; // High
  if (val === 1) return 50;  // Middle
  return 0;                 // Low
};

const mapUISensitivityToApi = (val: number): number => {
  if (val > 66) return 0; // High
  if (val > 33) return 1; // Middle
  return 2;              // Low
};

/**
 * Combines data from two separate API calls (Zoom and Focus) into one UI state
 */
const apiToUI = (zoomData: any, focusData: any): ZoomFocusSettingsData => {
  const zoomConfig = zoomData?.config || zoomData;
  const focusConfig = focusData?.config || focusData;

  // Prefixes
  const zPfx = "table.VideoInZoom[0][0].";
  const fPfx = "table.VideoInFocus[0][0].";

  // Helpers
  const getZ = (k: string, def: any) => (zoomConfig?.[zPfx + k] !== undefined ? zoomConfig[zPfx + k] : def);
  const getF = (k: string, def: any) => (focusConfig?.[fPfx + k] !== undefined ? focusConfig[fPfx + k] : def);

  // Zoom Parsing
  const digitalZoom = String(getZ("DigitalZoom", "false")) === "true";
  const zoomSpeed = Number(getZ("Speed", 50));

  // Focus Parsing
  const focusModeRaw = Number(getF("Mode", 2));
  const focusMode = FOCUS_MODE_MAP_TO_UI[focusModeRaw] || 'automatic';

  const focusLimitVal = Number(getF("FocusLimit", 100));
  const focusLimitMode = String(getF("FocusLimitSelectMode", "Auto"));
  const focusLimit = mapApiLimitToUI(focusLimitVal, focusLimitMode);

  const sensitivityRaw = Number(getF("Sensitivity", 1));
  const sensitivity = mapApiSensitivityToUI(sensitivityRaw);

  const afTracking = Number(getF("AutoFocusTrace", 1)) === 1;

  return {
    digitalZoom,
    zoomSpeed,
    mode: focusMode,
    focusLimit,
    sensitivity,
    afTracking
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

const ZoomFocusSettings: React.FC<ZoomFocusSettingsProps> = () => {
  const camId = useCamId();

  // 1. Hooks for Data
  // We need two separate queries because parameters are split between Zoom and Focus APIs
  const { data: zoomData, isLoading: zLoading, refetch: refetchZoom } = useZoom(camId);
  const { data: focusData, isLoading: fLoading, refetch: refetchFocus } = useFocus(camId);

  // 2. Hooks for Mutations
  const setZoomMutation = useSetZoom(camId);
  const setFocusMutation = useSetFocus(camId);

  // 3. Local State
  const [settings, setSettings] = useState<ZoomFocusSettingsData>(defaultState);
  const [isInitializing, setIsInitializing] = useState(false);

  // 4. Sync API -> UI
  useEffect(() => {
    if (zoomData && focusData) {
      const parsed = apiToUI(zoomData, focusData);
      setSettings(parsed);
    }
  }, [zoomData, focusData]);

  // 5. Handlers
  const handleDigitalZoomToggle = () => {
    const newVal = !settings.digitalZoom;
    setSettings(prev => ({ ...prev, digitalZoom: newVal }));
    setZoomMutation.mutate({ "DigitalZoom": newVal });
  };

  const handleZoomSpeedChange = (value: number) => {
    setSettings(prev => ({ ...prev, zoomSpeed: value }));
    setZoomMutation.mutate({ "Speed": value });
  };

  const handleModeChange = (mode: ZoomFocusSettingsData['mode']) => {
    setSettings(prev => ({ ...prev, mode }));
    setFocusMutation.mutate({ "Mode": FOCUS_MODE_MAP_TO_API[mode] });
  };

  const handleFocusLimitChange = (focusLimit: ZoomFocusSettingsData['focusLimit']) => {
    setSettings(prev => ({ ...prev, focusLimit }));
    const { val, mode } = mapUILimitToApi(focusLimit);
    setFocusMutation.mutate({
      "FocusLimit": val,
      "FocusLimitSelectMode": mode
    });
  };

  const handleSensitivityChange = (value: number) => {
    setSettings(prev => ({ ...prev, sensitivity: value }));
    const apiVal = mapUISensitivityToApi(value);
    setFocusMutation.mutate({ "Sensitivity": apiVal });
  };

  const handleAFTrackingToggle = () => {
    const newVal = !settings.afTracking;
    setSettings(prev => ({ ...prev, afTracking: newVal }));
    // API uses 1/0 for integer boolean here
    setFocusMutation.mutate({ "AutoFocusTrace": newVal ? 1 : 0 });
  };

  const handleLensInit = async () => {
    setIsInitializing(true);
    // Lens Initialization is often a separate command or a special focus mode reset.
    // Based on doc 3.1.11, there isn't a direct "Init" command listed in the config table,
    // but usually setting mode to Auto triggers a re-eval. 
    // However, if your API has a specific 'LensInit' command (e.g. via ptz.cgi or magicBox), call it here.
    // Assuming purely config based on provided context: we might just refresh.
    // If there is a specific command (like `ptz.cgi?action=start&code=Reset`), it would go here.
    // For now, simulating the delay as requested in UI.

    // Simulating API call delay
    setTimeout(() => {
      setIsInitializing(false);
      refetchZoom();
      refetchFocus();
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

  const isPending = setZoomMutation.isPending || setFocusMutation.isPending;
  const isLoading = zLoading || fLoading;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement Zoom/Focus...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Feedback Messages */}
      {isPending && (
        <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300 flex items-center gap-2 text-sm">
          <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-300"></div>
          Enregistrement en cours...
        </div>
      )}

      {/* Digital Zoom Toggle - Optical Camera Only */}
      {camId === 'cam1' && (
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
              className={`relative inline-flex items-center h-10 rounded-full w-20 transition-colors focus:outline-none ${settings.digitalZoom ? 'bg-red-600' : 'bg-gray-700'
                }`}
            >
              <span
                className={`inline-block w-8 h-8 transform rounded-full bg-white transition-transform ${settings.digitalZoom ? 'translate-x-11' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Zoom Speed */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Vitesse de Zoom</h2>
        <p className="text-gray-400 text-sm mb-6">
          Définit la vitesse de zoom de la caméra (0-100). Une valeur plus élevée réalise une vitesse de zoom plus rapide.
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

      {/* Focus Mode - Optical Camera Only */}
      {camId === 'cam1' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Mode de Mise au Point</h2>
          <p className="text-gray-400 text-sm mb-6">
            Mode de déclenchement du contrôle de mise au point. Différentes options offrent différents niveaux d'automatisation et de vitesse.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
            <button
              onClick={() => handleModeChange('semi-automatic')}
              className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left ${settings.mode === 'semi-automatic'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${settings.mode === 'semi-automatic' ? 'bg-white/20' : 'bg-gray-600'
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
              className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left ${settings.mode === 'automatic'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${settings.mode === 'automatic' ? 'bg-white/20' : 'bg-gray-600'
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
              className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left ${settings.mode === 'manual'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${settings.mode === 'manual' ? 'bg-white/20' : 'bg-gray-600'
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
              className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left ${settings.mode === 'fast-semi-automatic'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${settings.mode === 'fast-semi-automatic' ? 'bg-white/20' : 'bg-gray-600'
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
              className={`group relative py-5 px-5 rounded-lg font-medium transition-all text-left col-span-1 md:col-span-2 ${settings.mode === 'fast-automatic'
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="flex items-start gap-3">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${settings.mode === 'fast-automatic' ? 'bg-white/20' : 'bg-gray-600'
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
      )}

      {/* Focus Limit - Optical Camera Only */}
      {camId === 'cam1' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Limite de Mise au Point</h2>
          <p className="text-gray-400 text-sm mb-6">
            Définit la distance minimale de mise au point. En mode Auto, la caméra sélectionne la distance appropriée selon le zoom.
          </p>

          <div className="grid grid-cols-3 md:grid-cols-5 gap-3">
            {(['auto', '1m', '2m', '5m', '10m'] as const).map((limit) => (
              <button
                key={limit}
                onClick={() => handleFocusLimitChange(limit)}
                className={`py-4 px-4 rounded-lg font-medium transition-all ${settings.focusLimit === limit
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
      )}

      {/* Sensitivity - Optical Camera Only */}
      {camId === 'cam1' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-6">Sensibilité de Mise au Point</h2>
          <p className="text-gray-400 text-sm mb-6">
            0=Haute Sensibilité (Rapide), 2=Basse Sensibilité (Stable). Le curseur mappe 0-100 à ces niveaux discrets.
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
              <div className="text-gray-400">0-33 (API 2)</div>
              <div className="text-white font-semibold mt-1">Stable (Low)</div>
            </div>
            <div className="p-2 bg-gray-900/30 rounded">
              <div className="text-gray-400">34-66 (API 1)</div>
              <div className="text-white font-semibold mt-1">Moyen</div>
            </div>
            <div className="p-2 bg-gray-900/30 rounded">
              <div className="text-gray-400">67-100 (API 0)</div>
              <div className="text-white font-semibold mt-1">Rapide (High)</div>
            </div>
          </div>
        </div>
      )}

      {/* AF Tracking - Optical Camera Only */}
      {camId === 'cam1' && (
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <h2 className="text-xl font-semibold text-white mb-4">Suivi Autofocus (AF Tracking)</h2>
          <p className="text-gray-400 text-sm mb-6">
            Permet de garder l'image claire pendant le zoom. Si désactivé, le zoom est plus rapide mais flou pendant le mouvement.
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
              className={`relative inline-flex items-center h-10 rounded-full w-20 transition-colors focus:outline-none ${settings.afTracking ? 'bg-red-600' : 'bg-gray-700'
                }`}
            >
              <span
                className={`inline-block w-8 h-8 transform rounded-full bg-white transition-transform ${settings.afTracking ? 'translate-x-11' : 'translate-x-1'
                  }`}
              />
            </button>
          </div>
        </div>
      )}

      {/* Lens Initialization - Optical Camera Only */}
      {camId === 'cam1' && (
        <div className="bg-gradient-to-br from-blue-900/20 to-blue-800/10 rounded-lg p-6 border border-blue-700/30">
          <h2 className="text-xl font-semibold text-white mb-4">Initialisation de l'Objectif</h2>
          <p className="text-gray-400 text-sm mb-6">
            Cliquez sur ce bouton pour effectuer une initialisation automatique de l'objectif (Lens Init).
          </p>

          <button
            onClick={handleLensInit}
            disabled={isInitializing}
            className={`w-full py-4 px-6 rounded-lg font-semibold text-white transition-all ${isInitializing
                ? 'bg-gray-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700 shadow-lg hover:shadow-blue-500/25'
              }`}
          >
            {isInitializing ? (
              <div className="flex items-center justify-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
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
      )}
    </div>
  );
};

export default ZoomFocusSettings;