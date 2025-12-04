import type React from "react"
import { useState } from "react"

export interface VideoEncodingData {
  videoCodec: 'H.264' | 'H.264H' | 'H.264B' | 'H.265' | 'MJPEG';
  resolution: string;
  frameRate: number; // 1-25 FPS
  bitRateType: 'fixed' | 'variable';
  pictureQuality?: number; // Only for variable bitrate, 1-10
  referenceBitRate: number; // kbps
  bitRate: number; // kbps
  iFrameInterval: number; // 1-150
  watermarkEnabled: boolean;
  watermarkText: string;
  subStreamEnabled: boolean;
}

interface VideoEncodingProps {
  settings: VideoEncodingData;
  onSettingsChange: (settings: VideoEncodingData) => void;
}

const VideoEncoding: React.FC<VideoEncodingProps> = ({ settings, onSettingsChange }) => {
  const [watermarkInput, setWatermarkInput] = useState(settings.watermarkText);

  // Resolution options with recommended bitrates
  const resolutionOptions = [
    { value: '3840x2160', label: '4K (3840x2160)', minBitrate: 8192, maxBitrate: 16384 },
    { value: '2560x1440', label: '2K (2560x1440)', minBitrate: 4096, maxBitrate: 8192 },
    { value: '1920x1080', label: 'Full HD (1920x1080)', minBitrate: 2048, maxBitrate: 6144 },
    { value: '1280x720', label: 'HD (1280x720)', minBitrate: 1024, maxBitrate: 3072 },
    { value: '704x576', label: 'D1 (704x576)', minBitrate: 512, maxBitrate: 2048 },
    { value: '640x480', label: 'VGA (640x480)', minBitrate: 384, maxBitrate: 1536 },
    { value: '352x288', label: 'CIF (352x288)', minBitrate: 256, maxBitrate: 1024 },
  ];

  const currentResolution = resolutionOptions.find(r => r.value === settings.resolution) || resolutionOptions[2];

  const handleCodecChange = (codec: VideoEncodingData['videoCodec']) => {
    const newSettings = { ...settings, videoCodec: codec };
    // MJPEG only supports fixed bitrate
    if (codec === 'MJPEG') {
      newSettings.bitRateType = 'fixed';
      delete newSettings.pictureQuality;
    }
    onSettingsChange(newSettings);
  };

  const handleResolutionChange = (resolution: string) => {
    const selectedRes = resolutionOptions.find(r => r.value === resolution);
    if (selectedRes) {
      const recommendedBitrate = Math.floor((selectedRes.minBitrate + selectedRes.maxBitrate) / 2);
      onSettingsChange({
        ...settings,
        resolution,
        referenceBitRate: recommendedBitrate,
        bitRate: recommendedBitrate
      });
    }
  };

  const handleBitRateTypeChange = (type: 'fixed' | 'variable') => {
    const newSettings = { ...settings, bitRateType: type };
    if (type === 'variable') {
      newSettings.pictureQuality = 5; // Default medium quality
    } else {
      delete newSettings.pictureQuality;
    }
    onSettingsChange(newSettings);
  };

  const handleWatermarkToggle = () => {
    onSettingsChange({ ...settings, watermarkEnabled: !settings.watermarkEnabled });
  };

  const handleWatermarkTextChange = () => {
    // Validate: only numbers, letters, underscores, and hyphens, max 128 chars
    const sanitized = watermarkInput.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
    onSettingsChange({ ...settings, watermarkText: sanitized });
  };

  const handleSubStreamToggle = () => {
    onSettingsChange({ ...settings, subStreamEnabled: !settings.subStreamEnabled });
  };

  return (
    <div className="space-y-6">
      {/* Video Codec */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Codec Vidéo</h2>
        <p className="text-gray-400 text-sm mb-6">
          Sélectionnez le codec de compression vidéo. H.265 offre une meilleure compression, MJPEG offre une qualité maximale.
        </p>

        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(['H.264', 'H.264H', 'H.264B', 'H.265', 'MJPEG'] as const).map((codec) => (
            <button
              key={codec}
              onClick={() => handleCodecChange(codec)}
              className={`py-4 px-4 rounded-lg font-medium transition-all ${
                settings.videoCodec === codec
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="text-center">
                <div className="font-bold text-lg">{codec}</div>
                <div className="text-xs mt-1 opacity-75">
                  {codec === 'H.265' ? 'HEVC' : 
                   codec === 'MJPEG' ? 'Motion JPEG' : 
                   codec === 'H.264H' ? 'High Profile' :
                   codec === 'H.264B' ? 'Baseline' : 'Standard'}
                </div>
              </div>
              {settings.videoCodec === codec && (
                <div className="absolute top-2 right-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                </div>
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Résolution</h2>
        <p className="text-gray-400 text-sm mb-6">
          Sélectionnez la résolution de l'encodage vidéo. Des résolutions plus élevées nécessitent des débits binaires plus élevés.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resolutionOptions.map((res) => (
            <button
              key={res.value}
              onClick={() => handleResolutionChange(res.value)}
              className={`py-4 px-5 rounded-lg font-medium transition-all text-left ${
                settings.resolution === res.value
                  ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{res.label}</div>
                  <div className="text-xs mt-1 opacity-75">
                    Débit recommandé: {res.minBitrate}-{res.maxBitrate} kbps
                  </div>
                </div>
                {settings.resolution === res.value && (
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                )}
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Rate */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Fréquence d'Images (FPS)</h2>
        <p className="text-gray-400 text-sm mb-6">
          Définissez le nombre d'images par seconde. Des valeurs plus élevées offrent un mouvement plus fluide mais nécessitent plus de bande passante.
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Images par seconde: {settings.frameRate} FPS</label>
            <span className="text-gray-400 text-sm">
              {settings.frameRate >= 20 ? 'Très fluide' : 
               settings.frameRate >= 15 ? 'Fluide' : 
               settings.frameRate >= 10 ? 'Standard' : 'Économie'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={settings.frameRate}
            onChange={(e) => onSettingsChange({ ...settings, frameRate: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1 FPS</span>
            <span>25 FPS</span>
          </div>
        </div>
      </div>

      {/* Bit Rate Type */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Type de Débit Binaire</h2>
        <p className="text-gray-400 text-sm mb-6">
          Choisissez entre débit fixe (constant) ou variable (adaptatif). Le mode MJPEG ne prend en charge que le débit fixe.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleBitRateTypeChange('fixed')}
            disabled={settings.videoCodec === 'MJPEG'}
            className={`py-6 px-6 rounded-lg font-medium transition-all text-left ${
              settings.bitRateType === 'fixed'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${settings.videoCodec === 'MJPEG' ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.bitRateType === 'fixed' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg">Débit Fixe (CBR)</div>
                <div className="text-sm mt-1 opacity-90">Débit binaire constant</div>
              </div>
            </div>
          </button>

          <button
            onClick={() => handleBitRateTypeChange('variable')}
            disabled={settings.videoCodec === 'MJPEG'}
            className={`py-6 px-6 rounded-lg font-medium transition-all text-left ${
              settings.bitRateType === 'variable'
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
            } ${settings.videoCodec === 'MJPEG' ? 'cursor-not-allowed opacity-50' : ''}`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center flex-shrink-0 ${
                settings.bitRateType === 'variable' ? 'bg-white/20' : 'bg-gray-600'
              }`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
                </svg>
              </div>
              <div>
                <div className="font-bold text-lg">Débit Variable (VBR)</div>
                <div className="text-sm mt-1 opacity-90">Adapte selon le contenu</div>
              </div>
            </div>
          </button>
        </div>

        {/* Picture Quality - Only for Variable Bitrate */}
        {settings.bitRateType === 'variable' && (
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
            <h3 className="text-white font-medium mb-4">Qualité d'Image</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Niveau: {settings.pictureQuality}/10</label>
                <span className="text-sm text-gray-400">
                  {(settings.pictureQuality || 5) >= 8 ? 'Excellente' : 
                   (settings.pictureQuality || 5) >= 6 ? 'Bonne' : 
                   (settings.pictureQuality || 5) >= 4 ? 'Moyenne' : 'Économique'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="10"
                value={settings.pictureQuality || 5}
                onChange={(e) => onSettingsChange({ ...settings, pictureQuality: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>Faible</span>
                <span>Élevée</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bit Rate Configuration */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Configuration du Débit Binaire</h2>
        <p className="text-gray-400 text-sm mb-6">
          {settings.bitRateType === 'variable' 
            ? "En mode débit variable, cette valeur est la limite supérieure du débit."
            : "En mode débit fixe, cette valeur est constante."}
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference Bit Rate */}
          <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="flex items-center gap-2 mb-3">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <h3 className="text-white font-medium">Débit Référence</h3>
            </div>
            <div className="text-2xl font-bold text-blue-400">{settings.referenceBitRate} kbps</div>
            <div className="text-xs text-blue-300 mt-2">
              Recommandé: {currentResolution.minBitrate}-{currentResolution.maxBitrate} kbps
            </div>
          </div>

          {/* Actual Bit Rate */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
            <h3 className="text-white font-medium mb-3">Débit Binaire (kbps)</h3>
            <input
              type="number"
              min={currentResolution.minBitrate}
              max={currentResolution.maxBitrate}
              value={settings.bitRate}
              onChange={(e) => onSettingsChange({ ...settings, bitRate: parseInt(e.target.value) || 0 })}
              className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
            />
            <div className="text-xs text-gray-400 mt-2">
              {settings.bitRate < currentResolution.minBitrate ? '⚠️ Trop faible' :
               settings.bitRate > currentResolution.maxBitrate ? '⚠️ Trop élevé' :
               '✓ Dans la plage recommandée'}
            </div>
          </div>
        </div>
      </div>

      {/* I Frame Interval */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Intervalle d'Image I</h2>
        <p className="text-gray-400 text-sm mb-6">
          Nombre d'images P entre deux images I. Recommandé: 2× la fréquence d'images (actuellement {settings.frameRate * 2}).
        </p>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">Intervalle: {settings.iFrameInterval} images</label>
            <span className={`text-sm px-3 py-1 rounded ${
              settings.iFrameInterval === settings.frameRate * 2 
                ? 'bg-green-900/30 text-green-400' 
                : 'bg-yellow-900/30 text-yellow-400'
            }`}>
              {settings.iFrameInterval === settings.frameRate * 2 ? 'Recommandé' : 'Personnalisé'}
            </span>
          </div>
          <input
            type="range"
            min="1"
            max="150"
            value={settings.iFrameInterval}
            onChange={(e) => onSettingsChange({ ...settings, iFrameInterval: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span className="text-green-400">{settings.frameRate * 2} (Recommandé)</span>
            <span>150</span>
          </div>
        </div>
      </div>

      {/* Watermark Settings */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Filigrane Vidéo</h2>
        <p className="text-gray-400 text-sm mb-6">
          Ajoutez un filigrane pour vérifier l'intégrité de la vidéo. Caractères autorisés: lettres, chiffres, tirets et underscores (max 128).
        </p>

        <div className="space-y-4">
          {/* Enable Toggle */}
          <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg">
            <div>
              <div className="text-white font-medium">Activer le Filigrane</div>
              <div className="text-gray-400 text-sm mt-1">
                {settings.watermarkEnabled ? 'Filigrane actif sur la vidéo' : 'Filigrane désactivé'}
              </div>
            </div>
            <button
              onClick={handleWatermarkToggle}
              className={`relative inline-flex items-center h-10 rounded-full w-20 transition-colors focus:outline-none ${
                settings.watermarkEnabled ? 'bg-red-600' : 'bg-gray-700'
              }`}
            >
              <span
                className={`inline-block w-8 h-8 transform rounded-full bg-white transition-transform ${
                  settings.watermarkEnabled ? 'translate-x-11' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {/* Watermark Text Input */}
          {settings.watermarkEnabled && (
            <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
              <label className="block text-white font-medium mb-3">Texte du Filigrane</label>
              <input
                type="text"
                value={watermarkInput}
                onChange={(e) => setWatermarkInput(e.target.value)}
                onBlur={handleWatermarkTextChange}
                placeholder="DigitalCCTV"
                maxLength={128}
                className="w-full px-4 py-3 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500 transition-colors"
              />
              <div className="text-xs text-gray-400 mt-2">
                {watermarkInput.length}/128 caractères | Uniquement: a-z, A-Z, 0-9, - et _
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Sub Stream Enable */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Flux Secondaire (Sub Stream)</h2>
        <p className="text-gray-400 text-sm mb-6">
          Activez le flux secondaire pour la prévisualisation à faible résolution et l'enregistrement simultané. Activé par défaut.
        </p>

        <div className="flex items-center justify-between p-4 bg-gray-900/30 rounded-lg">
          <div>
            <div className="text-white font-medium">Activer le Flux Secondaire</div>
            <div className="text-gray-400 text-sm mt-1">
              {settings.subStreamEnabled 
                ? 'Flux principal et secondaire actifs' 
                : 'Uniquement le flux principal actif'}
            </div>
          </div>
          <button
            onClick={handleSubStreamToggle}
            className={`relative inline-flex items-center h-10 rounded-full w-20 transition-colors focus:outline-none ${
              settings.subStreamEnabled ? 'bg-red-600' : 'bg-gray-700'
            }`}
          >
            <span
              className={`inline-block w-8 h-8 transform rounded-full bg-white transition-transform ${
                settings.subStreamEnabled ? 'translate-x-11' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Résumé de la Configuration</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Codec</div>
            <div className="text-white font-semibold">{settings.videoCodec}</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Résolution</div>
            <div className="text-white font-semibold text-xs">{settings.resolution}</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">FPS</div>
            <div className="text-white font-semibold">{settings.frameRate}</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Débit</div>
            <div className="text-white font-semibold text-xs">{settings.bitRate} kbps</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Type</div>
            <div className="text-white font-semibold text-xs">{settings.bitRateType === 'fixed' ? 'Fixe' : 'Variable'}</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">I-Frame</div>
            <div className="text-white font-semibold">{settings.iFrameInterval}</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Filigrane</div>
            <div className="text-white font-semibold">{settings.watermarkEnabled ? 'ON' : 'OFF'}</div>
          </div>
          <div className="p-3 bg-gray-900/50 rounded-lg">
            <div className="text-gray-400 text-xs mb-1">Sub Stream</div>
            <div className="text-white font-semibold">{settings.subStreamEnabled ? 'ON' : 'OFF'}</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoEncoding;
