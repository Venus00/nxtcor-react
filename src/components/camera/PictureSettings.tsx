import type React from "react"
import { useState } from "react"
import SliderControl from "./SliderControl"

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
  settings: PictureSettingsData;
  onSettingsChange: (settings: PictureSettingsData) => void;
}

const PictureSettings: React.FC<PictureSettingsProps> = ({ settings, onSettingsChange }) => {
  const [activeProfile, setActiveProfile] = useState<'normal' | 'daytime' | 'nighttime'>(settings.profile);

  const handleSliderChange = (key: keyof PictureSettingsData, value: number) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  const handleProfileChange = (profile: 'normal' | 'daytime' | 'nighttime') => {
    setActiveProfile(profile);
    onSettingsChange({ ...settings, profile });
  };

  const handleFlipChange = (flip: 'normal' | 'inverted') => {
    onSettingsChange({ ...settings, flip });
  };

  const handleEISToggle = () => {
    onSettingsChange({ ...settings, eis: !settings.eis });
  };

  return (
    <div className="space-y-6">
      {/* Profile Selection */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Profil</h2>
        <p className="text-gray-400 text-sm mb-4">
          Sélectionnez le mode normal, jour ou nuit. La configuration et l'effet correspondants peuvent être définis et visualisés.
        </p>
        <div className="flex gap-4">
          <button
            onClick={() => handleProfileChange('normal')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeProfile === 'normal'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Mode Normal
          </button>
          <button
            onClick={() => handleProfileChange('daytime')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeProfile === 'daytime'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Mode Jour
          </button>
          <button
            onClick={() => handleProfileChange('nighttime')}
            className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
              activeProfile === 'nighttime'
                ? 'bg-red-600 text-white shadow-lg'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            }`}
          >
            Mode Nuit
          </button>
        </div>
      </div>

      {/* Image Quality Settings */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Qualité d'Image</h2>
        <div className="space-y-4">
          <SliderControl
            label="Luminosité (Brightness)"
            description="Réglez la teinte de l'image, plus la valeur est élevée, plus l'image est colorée."
            value={settings.brightness}
            onChange={(value) => handleSliderChange('brightness', value)}
          />
          
          <SliderControl
            label="Contraste (Contrast)"
            description="Définir le contraste de l'image, plus la valeur est élevée, plus le contraste de luminosité est grand."
            value={settings.contrast}
            onChange={(value) => handleSliderChange('contrast', value)}
          />
          
          <SliderControl
            label="Saturation (Saturability)"
            description="Définir la saturation des couleurs de l'image. Plus la saturation est élevée, plus l'image est vive."
            value={settings.saturability}
            onChange={(value) => handleSliderChange('saturability', value)}
          />
          
          <SliderControl
            label="Chroma CNT"
            description="Réglez le degré de suppression de la couleur de l'image, plus la valeur est élevée, plus la suppression est évidente."
            value={settings.chromaCNT}
            onChange={(value) => handleSliderChange('chromaCNT', value)}
          />
        </div>
      </div>

      {/* Sharpness Settings */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Netteté</h2>
        <div className="space-y-4">
          <SliderControl
            label="Netteté (Sharpness)"
            description="Ajustez la netteté du bord de l'image, plus la valeur est élevée, plus le bord est évident."
            value={settings.sharpness}
            onChange={(value) => handleSliderChange('sharpness', value)}
          />
          
          <SliderControl
            label="Sharpness CNT"
            description="Ajustez le degré de suppression de la netteté de l'image, plus la valeur est élevée, plus le degré est élevé."
            value={settings.sharpnessCNT}
            onChange={(value) => handleSliderChange('sharpnessCNT', value)}
          />
        </div>
      </div>

      {/* Advanced Settings */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Paramètres Avancés</h2>
        <div className="space-y-4">
          <SliderControl
            label="Gamma"
            description="Modifie la luminosité de l'image par ajustement non linéaire et améliore la plage dynamique de l'image."
            value={settings.gamma}
            onChange={(value) => handleSliderChange('gamma', value)}
          />
          
          <SliderControl
            label="2D NR (Réduction de Bruit 2D)"
            description="Utilisé pour contrôler le bruit, plus le degré est élevé, plus le bruit est faible."
            value={settings.nr2D}
            onChange={(value) => handleSliderChange('nr2D', value)}
          />
          
          <SliderControl
            label="3D NR (Réduction de Bruit 3D)"
            description="Utilisé pour contrôler le bruit, plus le degré est élevé, plus le bruit est faible."
            value={settings.nr3D}
            onChange={(value) => handleSliderChange('nr3D', value)}
          />
          
          <SliderControl
            label="Grade (Niveau de Réduction de Bruit)"
            description="Définir le degré de réduction du bruit, plus la valeur est élevée, plus le degré est élevé."
            value={settings.grade}
            onChange={(value) => handleSliderChange('grade', value)}
          />
        </div>
      </div>

      {/* Image Orientation & Stabilization */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-6">Orientation et Stabilisation</h2>
        
        {/* Flip Setting */}
        <div className="mb-6">
          <label className="text-white font-medium text-sm block mb-2">
            Retournement (Flip)
          </label>
          <p className="text-gray-400 text-xs mb-3">
            Cette fonction peut être utilisée pour changer la direction de l'image.
          </p>
          <div className="flex gap-4">
            <button
              onClick={() => handleFlipChange('normal')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                settings.flip === 'normal'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Normal
            </button>
            <button
              onClick={() => handleFlipChange('inverted')}
              className={`flex-1 py-3 px-6 rounded-lg font-medium transition-all ${
                settings.flip === 'inverted'
                  ? 'bg-red-600 text-white shadow-lg'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              Inversé
            </button>
          </div>
        </div>

        {/* EIS Setting */}
        <div>
          <label className="text-white font-medium text-sm block mb-2">
            EIS (Stabilisation Électronique d'Image)
          </label>
          <p className="text-gray-400 text-xs mb-3">
            Réalise une fonction anti-vibration électronique grâce à un algorithme de comparaison de différence d'image, 
            résout efficacement le problème de tremblement d'image pendant l'utilisation.
          </p>
          <button
            onClick={handleEISToggle}
            className={`relative inline-flex items-center h-10 rounded-full w-20 transition-colors focus:outline-none ${
              settings.eis ? 'bg-red-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block w-8 h-8 transform rounded-full bg-white transition-transform ${
                settings.eis ? 'translate-x-11' : 'translate-x-1'
              }`}
            />
          </button>
          <span className="ml-3 text-gray-300">
            {settings.eis ? 'Activé' : 'Désactivé'}
          </span>
        </div>
      </div>
    </div>
  );
};

export default PictureSettings;
