import React, { useEffect } from "react";
import SliderControl from "./SliderControl";
import { useExposure } from "../../hooks/useCameraQueries";

export interface ExposureSettingsData {
  mode: 'auto' | 'manual' | 'aperture-priority' | 'shutter-priority' | 'gain-priority';
  gainRange: number;
  shutter: number;
  shutterRange: number;
  aperture: number;
  exposureCompensation: number;
  autoExposureRecovery: 'off' | '5min' | '15min' | '1hour';
}

interface ExposureSettingsProps {
  settings: ExposureSettingsData;
  onSettingsChange: (settings: ExposureSettingsData) => void;
  // optional: if camId provided the component will auto-fetch VideoInExposure and call onSettingsChange
  camId?: string;
}

const ExposureSettings: React.FC<ExposureSettingsProps> = ({ settings, onSettingsChange, camId }) => {
  // If camId is provided, the hook will GET the camera config automatically.
  const { data: exposureRaw, isLoading } = useExposure(camId ?? "", Boolean(camId));

  // parse mapping from camera config -> ExposureSettingsData
  const parseVideoInExposure = (cfgRaw: any): ExposureSettingsData | null => {
    if (!cfgRaw) return null;
    // Default fallsbacks match original defaults in your UI
    const get = (key: string, fallback: any = undefined) => {
      if (!cfgRaw) return fallback;
      return cfgRaw[key] !== undefined ? cfgRaw[key] : fallback;
    };

    // We assume the display uses channel 0 and profile index 0 for exposure (table.VideoInExposure[0][0].*)
    // Many devices store exposures per [channel][profile] but your sample shows [0][0].
    // If you need profile index switching add it later as we did for picture settings.
    const prefix = "table.VideoInExposure[0][0].";

    const antiFlicker = Number(get(prefix + "AntiFlicker", 0));
    const compensation = Number(get(prefix + "Compensation", 50));
    const gainMax = Number(get(prefix + "GainMax", 50));
    const gainMin = Number(get(prefix + "GainMin", 0));
    const irisMax = Number(get(prefix + "IrisMax", 50));
    const irisMin = Number(get(prefix + "IrisMin", 10));
    const modeRaw = Number(get(prefix + "Mode", 0));
    const recoveryTime = Number(get(prefix + "RecoveryTime", 900));
    const value1 = Number(get(prefix + "Value1", 70));
    const value2 = Number(get(prefix + "Value2", 70));

    // Map numeric Mode to your mode enum (adjust if your camera uses different codes)
    // Example mapping (common):
    // 0 -> auto, 1 -> manual, 2 -> aperture-priority, 3 -> shutter-priority, 4 -> gain-priority
    let mode: ExposureSettingsData['mode'] = 'auto';
    switch (modeRaw) {
      case 1: mode = 'manual'; break;
      case 2: mode = 'aperture-priority'; break;
      case 3: mode = 'shutter-priority'; break;
      case 4: mode = 'gain-priority'; break;
      default: mode = 'auto';
    }

    // Map recoveryTime to your autoExposureRecovery enum
    let autoExposureRecovery: ExposureSettingsData['autoExposureRecovery'] = 'off';
    if (recoveryTime === 300) autoExposureRecovery = '5min';
    else if (recoveryTime === 900) autoExposureRecovery = '15min';
    else if (recoveryTime === 3600) autoExposureRecovery = '1hour';
    else autoExposureRecovery = 'off';

    return {
      mode,
      gainRange: Math.round((gainMax + gainMin) / 2) || 50,
      shutter: value1 || 0,              // mapping choice: Value1 maps to shutter (device-specific)
      shutterRange: value2 || 0,         // using Value2 as second shutter-related value
      aperture: Math.round((irisMax + irisMin) / 2) || 50,
      exposureCompensation: compensation,
      autoExposureRecovery,
    };
  };

  // When camera config arrives, send unified settings up via onSettingsChange (parent handles save)
  useEffect(() => {
    if (exposureRaw) {
      const parsed = parseVideoInExposure(exposureRaw);
      if (parsed) onSettingsChange(parsed);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [exposureRaw, camId]);

  // internal handlers still call onSettingsChange so parent keeps control for saving
  const handleSliderChange = (key: keyof ExposureSettingsData, value: number) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleExposureModeChange = (mode: ExposureSettingsData['mode']) => {
    onSettingsChange({ ...settings, mode });
  };

  const handleAutoExposureRecoveryChange = (recovery: ExposureSettingsData['autoExposureRecovery']) => {
    onSettingsChange({ ...settings, autoExposureRecovery: recovery });
  };

  const getModeDescription = () => {
    switch (settings.mode) {
      case 'auto':
        return "En mode exposition automatique, la luminosité globale d'une image est automatiquement ajustée en fonction de différentes scènes dans la plage d'exposition normale.";
      case 'aperture-priority':
        return "En mode priorité d'ouverture, l'ouverture fixe est la valeur définie, et il est préférable d'atteindre automatiquement la valeur de luminosité en fonction de la priorité du temps d'exposition avant le gain.";
      case 'shutter-priority':
        return "En mode priorité d'obturateur, l'utilisateur peut personnaliser la plage d'obturateur, et le système ajuste automatiquement la taille de l'ouverture et le gain en fonction de la luminosité.";
      case 'gain-priority':
        return "En mode priorité de gain, la valeur de gain et la valeur de compensation d'exposition peuvent être ajustées manuellement.";
      case 'manual':
        return "En mode exposition manuelle, la valeur de gain, la valeur d'obturateur et la valeur d'ouverture peuvent être ajustées manuellement, et l'exposition longue est prise en charge.";
      default:
        return "";
    }
  };

  // show loading indicator when fetching from device
  if (camId && isLoading) {
    return <div>Loading exposure settings from camera...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Exposure Mode Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Mode d'Exposition</h2>
        <p className="text-gray-400 text-sm mb-4">
          Définir les modes d'exposition de la caméra : automatique, manuel, priorité d'ouverture, priorité d'obturateur et priorité de gain.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleExposureModeChange('auto')}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${settings.mode === 'auto' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Automatique
          </button>
          <button
            onClick={() => handleExposureModeChange('manual')}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${settings.mode === 'manual' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Manuel
          </button>
          <button
            onClick={() => handleExposureModeChange('aperture-priority')}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${settings.mode === 'aperture-priority' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Priorité d'Ouverture
          </button>
          <button
            onClick={() => handleExposureModeChange('shutter-priority')}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${settings.mode === 'shutter-priority' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Priorité d'Obturateur
          </button>
          <button
            onClick={() => handleExposureModeChange('gain-priority')}
            className={`py-3 px-6 rounded-lg font-medium transition-all col-span-2 ${settings.mode === 'gain-priority' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Priorité de Gain
          </button>
        </div>

        {/* Mode Description */}
        <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-600">
          <p className="text-gray-300 text-sm">{getModeDescription()}</p>
        </div>
      </div>

      {/* Exposure Parameters */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Paramètres d'Exposition</h2>
        <div className="space-y-4">
          <SliderControl
            label="Plage de Gain (Gain Range)"
            description="Définir la valeur de gain de l'exposition dans une plage de 0 à 100."
            value={settings.gainRange}
            onChange={(value) => handleSliderChange('gainRange', value)}
          />

          <SliderControl
            label="Obturateur (Shutter)"
            description="Ajuster le temps d'exposition de la caméra. Une valeur d'obturateur plus élevée produit une image plus sombre, sinon plus claire."
            value={settings.shutter}
            onChange={(value) => handleSliderChange('shutter', value)}
          />

          <SliderControl
            label="Plage d'Obturateur (Shutter Range)"
            description="Définir le temps d'exposition de la caméra dans une plage de 0 à 1000 ms."
            value={settings.shutterRange}
            onChange={(value) => handleSliderChange('shutterRange', value)}
            min={0}
            max={1000}
          />

          <SliderControl
            label="Ouverture (Aperture)"
            description="Définir le flux lumineux de la caméra. Une valeur d'ouverture plus élevée produit une image plus claire, sinon plus sombre."
            value={settings.aperture}
            onChange={(value) => handleSliderChange('aperture', value)}
          />

          <SliderControl
            label="Compensation d'Exposition (Exposure Compensation)"
            description="Définir la valeur de compensation de l'exposition dans une plage de 0 à 100."
            value={settings.exposureCompensation}
            onChange={(value) => handleSliderChange('exposureCompensation', value)}
          />
        </div>
      </div>

      {/* Auto Exposure Recovery */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Récupération Automatique de l'Exposition</h2>
        <p className="text-gray-400 text-sm mb-4">
          Cette fonction permet de reprendre le mode d'exposition automatique après la période définie en mode d'exposition non automatique.
        </p>
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleAutoExposureRecoveryChange('off')}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${settings.autoExposureRecovery === 'off' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            Désactivé
          </button>
          <button
            onClick={() => handleAutoExposureRecoveryChange('5min')}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${settings.autoExposureRecovery === '5min' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            5 Minutes
          </button>
          <button
            onClick={() => handleAutoExposureRecoveryChange('15min')}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${settings.autoExposureRecovery === '15min' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            15 Minutes
          </button>
          <button
            onClick={() => handleAutoExposureRecoveryChange('1hour')}
            className={`py-3 px-6 rounded-lg font-medium transition-all ${settings.autoExposureRecovery === '1hour' ? 'bg-red-600 text-white shadow-lg' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'}`}
          >
            1 Heure
          </button>
        </div>
      </div>
    </div>
  );
};

export default ExposureSettings;
