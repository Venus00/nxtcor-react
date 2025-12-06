// components/camera/VideoEncoding.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useEncode as useVideoEncode } from "../../hooks/useCameraQueries";
import { useSetEncode as  useSetVideoEncode } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface VideoEncodingData {
  videoCodec: 'H.264' | 'H.264H' | 'H.264B' | 'H.265' | 'MJPEG'; // API: Compression
  resolution: string; // API: resolution (e.g. 1920x1080)
  frameRate: number; // API: FPS (1-25)
  bitRateType: 'fixed' | 'variable'; // API: BitRateControl (CBR=fixed, VBR=variable)
  pictureQuality?: number; // API: Quality (1-6) - Only for VBR
  bitRate: number; // API: BitRate (kbps)
  iFrameInterval: number; // API: GOP (1-150)
  // These are handled separately or part of global config in some APIs, 
  // but sticking to your UI request, we assume they are part of this flow or global.
  // Note: Watermark is usually in VideoWidget/OSD, but kept here if part of your specific UI flow.
  // API Ref 3.1.2.1 doesn't explicitly link Watermark to Encode struct, but UI often groups them.
  watermarkEnabled: boolean; 
  watermarkText: string;
  subStreamEnabled: boolean; // API: ExtraFormat[0].VideoEnable
}

// Default state structure
const defaultState: VideoEncodingData = {
  videoCodec: 'H.264',
  resolution: '1920x1080',
  frameRate: 25,
  bitRateType: 'fixed',
  bitRate: 4096,
  iFrameInterval: 50,
  watermarkEnabled: false,
  watermarkText: "DigitalCCTV",
  subStreamEnabled: true
};

// Resolution mapping for bitrate recommendations
const RESOLUTION_OPTIONS = [
  { value: '3840x2160', label: '4K (3840x2160)', minBitrate: 8192, maxBitrate: 16384 },
  { value: '2560x1440', label: '2K (2560x1440)', minBitrate: 4096, maxBitrate: 8192 },
  { value: '1920x1080', label: 'Full HD (1920x1080)', minBitrate: 2048, maxBitrate: 6144 },
  { value: '1280x720', label: 'HD (1280x720)', minBitrate: 1024, maxBitrate: 3072 },
  { value: '1280x960', label: '1.3M (1280x960)', minBitrate: 1024, maxBitrate: 4096 }, // API specific
  { value: '704x576', label: 'D1 (704x576)', minBitrate: 512, maxBitrate: 2048 },
  { value: '640x480', label: 'VGA (640x480)', minBitrate: 384, maxBitrate: 1536 },
  { value: '352x288', label: 'CIF (352x288)', minBitrate: 256, maxBitrate: 1024 },
];

/**
 * Parses API response to UI state.
 * Fixed to Index 0 (Main Stream) for primary settings, but checks ExtraFormat[0] for Sub Stream enabled status.
 * API Ref: table.Encode[0].MainFormat[0].Video...
 */
const apiToUI = (data: any): VideoEncodingData => {
  if (!data) return defaultState;
  
  const config = data.config || data;
  
  // Helpers
  const getMain = (k: string, def: any) => config[`table.Encode[0].MainFormat[0].Video.${k}`] ?? def;
  const getSub = (k: string, def: any) => config[`table.Encode[0].ExtraFormat[0].${k}`] ?? def;
  
  // Codec Mapping
  let codec = getMain("Compression", "H.264");
  if (codec === "H.264H") codec = "H.264H";
  else if (codec === "H.264B") codec = "H.264B";
  else if (codec === "H.265") codec = "H.265";
  else if (codec === "MJPG") codec = "MJPEG";

  return {
    videoCodec: codec as VideoEncodingData['videoCodec'],
    resolution: getMain("resolution", "1920x1080"),
    frameRate: Number(getMain("FPS", 25)),
    bitRateType: getMain("BitRateControl", "CBR") === "VBR" ? 'variable' : 'fixed',
    pictureQuality: Number(getMain("Quality", 5)), // API range 1-6
    bitRate: Number(getMain("BitRate", 4096)),
    iFrameInterval: Number(getMain("GOP", 50)),
    
    // Substream status
    subStreamEnabled: String(getSub("VideoEnable", "true")) === "true",

    // Watermark is usually in a different struct (VideoWidget), but we'll keep local state/placeholder if API doesn't provide in this specific call
    watermarkEnabled: false, 
    watermarkText: "DigitalCCTV"
  };
};

/**
 * Converts UI state to API payload.
 * Maps back to table.Encode[0].MainFormat[0]...
 */
const uiToApi = (ui: VideoEncodingData) => {
  const mainPfx = "Encode[0].MainFormat[0].Video.";
  const subPfx = "Encode[0].ExtraFormat[0]."; // For enable toggle

  // Map Codec
  let apiCodec = ui.videoCodec;
  if (ui.videoCodec === 'MJPEG') apiCodec = 'MJPG' as any; // API uses MJPG

  const payload: any = {
    [`${mainPfx}Compression`]: apiCodec,
    [`${mainPfx}resolution`]: ui.resolution,
    [`${mainPfx}FPS`]: ui.frameRate,
    [`${mainPfx}BitRateControl`]: ui.bitRateType === 'variable' ? "VBR" : "CBR",
    [`${mainPfx}BitRate`]: ui.bitRate,
    [`${mainPfx}GOP`]: ui.iFrameInterval,
    [`${subPfx}VideoEnable`]: ui.subStreamEnabled
  };

  // Only send Quality if VBR
  if (ui.bitRateType === 'variable') {
    payload[`${mainPfx}Quality`] = ui.pictureQuality;
  }

  // Width/Height often required separately in some older APIs, but `resolution` string is standard in recent ones.
  // If API requires discrete Width/Height, we'd split the resolution string here. 
  // Based on your doc 3.2.1.3 Example, it uses Height/Width separately in the URL example?
  // "Encode[0].MainFormat[0].Video.Height=1024&Encode[0].MainFormat[0].Video.Width=1280"
  // Let's safe-guard by sending both if resolution string parsing is easy.
  const [w, h] = ui.resolution.toLowerCase().split('x');
  if (w && h) {
    payload[`${mainPfx}Width`] = parseInt(w);
    payload[`${mainPfx}Height`] = parseInt(h);
  }

  return payload;
};

// =============================================================================
// COMPONENT
// =============================================================================

const VideoEncoding: React.FC = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error, refetch } = useVideoEncode(camId);
  const mutation = useSetVideoEncode(camId);

  // Local State
  const [settings, setSettings] = useState<VideoEncodingData>(defaultState);
  const [watermarkInput, setWatermarkInput] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      setSettings(parsed);
      setWatermarkInput(parsed.watermarkText);
      setIsDirty(false);
    }
  }, [apiData]);

  // Handlers
  const handleUpdate = (updates: Partial<VideoEncodingData>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSave = () => {
    const payload = uiToApi(settings);
    mutation.mutate(payload);
    setIsDirty(false);
  };

  const handleCodecChange = (codec: VideoEncodingData['videoCodec']) => {
    const updates: Partial<VideoEncodingData> = { videoCodec: codec };
    // MJPEG only supports fixed bitrate usually, forcing logic
    if (codec === 'MJPEG') {
      updates.bitRateType = 'fixed';
      updates.pictureQuality = undefined;
    }
    handleUpdate(updates);
  };

  const handleResolutionChange = (resolution: string) => {
    const selectedRes = RESOLUTION_OPTIONS.find(r => r.value === resolution);
    if (selectedRes) {
      const recommendedBitrate = Math.floor((selectedRes.minBitrate + selectedRes.maxBitrate) / 2);
      handleUpdate({
        resolution,
        bitRate: recommendedBitrate
      });
    }
  };

  const handleBitRateTypeChange = (type: 'fixed' | 'variable') => {
    const updates: Partial<VideoEncodingData> = { bitRateType: type };
    if (type === 'variable') {
      updates.pictureQuality = 5; // Default medium quality
    } else {
      updates.pictureQuality = undefined;
    }
    handleUpdate(updates);
  };

  const handleWatermarkToggle = () => {
    handleUpdate({ watermarkEnabled: !settings.watermarkEnabled });
  };

  const handleWatermarkTextChange = () => {
    const sanitized = watermarkInput.replace(/[^a-zA-Z0-9_-]/g, '').slice(0, 128);
    handleUpdate({ watermarkText: sanitized });
  };

  const handleSubStreamToggle = () => {
    handleUpdate({ subStreamEnabled: !settings.subStreamEnabled });
  };

  const currentResolution = RESOLUTION_OPTIONS.find(r => r.value === settings.resolution) || RESOLUTION_OPTIONS[2];

  // Loading State
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de l'encodage vidéo...</p>
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
      {mutation.isSuccess && (
        <div className="p-3 rounded-lg bg-green-900/30 border border-green-700 text-green-300 text-sm">
          ✓ Configuration sauvegardée avec succès!
        </div>
      )}

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
          {RESOLUTION_OPTIONS.map((res) => (
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
            onChange={(e) => handleUpdate({ frameRate: parseInt(e.target.value) })}
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
          Choisissez entre débit fixe (CBR) ou variable (VBR). Le mode MJPEG ne prend en charge que le débit fixe.
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
            <h3 className="text-white font-medium mb-4">Qualité d'Image (VBR)</h3>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-gray-300">Niveau: {settings.pictureQuality}/6</label>
                <span className="text-sm text-gray-400">
                  {(settings.pictureQuality || 5) >= 5 ? 'Excellente' : 
                   (settings.pictureQuality || 5) >= 3 ? 'Bonne' : 'Moyenne'}
                </span>
              </div>
              <input
                type="range"
                min="1"
                max="6"
                value={settings.pictureQuality || 5}
                onChange={(e) => handleUpdate({ pictureQuality: parseInt(e.target.value) })}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
              <div className="flex justify-between text-xs text-gray-500">
                <span>1 (Faible)</span>
                <span>6 (Élevée)</span>
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
              <h3 className="text-white font-medium">Plage Recommandée</h3>
            </div>
            <div className="text-2xl font-bold text-blue-400">
              {currentResolution.minBitrate} - {currentResolution.maxBitrate} kbps
            </div>
            <div className="text-xs text-blue-300 mt-2">
              Basé sur la résolution {settings.resolution}
            </div>
          </div>

          {/* Actual Bit Rate */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
            <h3 className="text-white font-medium mb-3">Débit Binaire (kbps)</h3>
            <input
              type="number"
              min={256}
              max={16384}
              value={settings.bitRate}
              onChange={(e) => handleUpdate({ bitRate: parseInt(e.target.value) || 0 })}
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
        <h2 className="text-xl font-semibold text-white mb-4">Intervalle d'Image I (GOP)</h2>
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
            onChange={(e) => handleUpdate({ iFrameInterval: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
          <div className="flex justify-between text-xs text-gray-500">
            <span>1</span>
            <span className="text-green-400">{settings.frameRate * 2} (Recommandé)</span>
            <span>150</span>
          </div>
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

      {/* Save Button */}
      <div className="flex justify-end pt-2">
        <button
          onClick={handleSave}
          disabled={!isDirty || mutation.isPending}
          className="px-8 py-4 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700 transition-colors disabled:opacity-50 flex items-center gap-3 shadow-lg shadow-red-900/20"
        >
          {mutation.isPending ? 'Enregistrement...' : 'Appliquer la Configuration'}
        </button>
      </div>

    </div>
  );
};

export default VideoEncoding;