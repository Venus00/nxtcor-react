// components/camera/VideoEncoding.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useEncode as useVideoEncode } from "../../hooks/useCameraQueries";
import { useSetEncode as useSetVideoEncode } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface VideoEncodingData {
  videoCodec: 'H.264' | 'H.264H' | 'H.264B' | 'H.265' | 'MJPEG'; // API: Compression
  resolution: string; // API: resolution
  frameRate: number; // API: FPS
  bitRateType: 'fixed' | 'variable'; // API: BitRateControl (CBR/VBR)
  pictureQuality?: number; // API: Quality (1-6)
  referenceBitRate: number; // calculated locally based on resolution
  bitRate: number; // API: BitRate
  iFrameInterval: number; // API: GOP
  watermarkEnabled: boolean; // Not in provided JSON, kept as local state
  watermarkText: string; // Not in provided JSON, kept as local state
  subStreamEnabled: boolean; // API: table.Encode[0].ExtraFormat[0].VideoEnable
}

// Default state matching your UI defaults
const defaultState: VideoEncodingData = {
  videoCodec: 'H.264',
  resolution: '1920x1080',
  frameRate: 25,
  bitRateType: 'fixed',
  referenceBitRate: 4096,
  bitRate: 4096,
  iFrameInterval: 50,
  watermarkEnabled: false,
  watermarkText: "DigitalCCTV",
  subStreamEnabled: true
};

const resolutionOptionsOptical = [
  { value: '2688x1520', label: '2688x1520', minBitrate: 6144, maxBitrate: 10240 },
  { value: '1920x1080', label: 'Full HD (1920x1080)', minBitrate: 2048, maxBitrate: 6144 },
  { value: '1280x720', label: 'HD (1280x720)', minBitrate: 1024, maxBitrate: 3072 },
];

const resolutionOptionsThermal = [
  { value: '1280x1024', label: '1280x1024', minBitrate: 1536, maxBitrate: 4096 },
  { value: '1280x720', label: 'HD (1280x720)', minBitrate: 1024, maxBitrate: 3072 },
  { value: '640x512', label: '640x512', minBitrate: 512, maxBitrate: 2048 },
];

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Parses the API response.
 * Uses table.Encode[0].MainFormat[0] for main video settings.
 * Uses table.Encode[0].ExtraFormat[0] for sub-stream enable status.
 */
const apiToUI = (data: any, camId: string): VideoEncodingData => {
  if (!data) return defaultState;

  const config = data.config || data;
  const mainPrefix = "table.Encode[0].MainFormat[0].Video.";
  const subPrefix = "table.Encode[0].ExtraFormat[0].";

  const getVal = (key: string, def: any) => config[key] ?? def;

  // Codec
  let codec = getVal(mainPrefix + "Compression", "H.264");
   const codecpROFILE = getVal(mainPrefix + "Profile", "");
   console.log("Codec Profile:", codecpROFILE);
  // Map specific H.264 profiles if needed, otherwise pass through
  if (!['H.264', 'H.264H', 'H.264B', 'H.265', 'MJPEG'].includes(codec)) {
    if (codec === 'MJPG') codec = 'MJPEG'; // Handle potential API variance
  }
if (codec === 'H.264') {
    if (codecpROFILE === 'High') {
      codec = 'H.264H';
    } else if (codecpROFILE === 'Baseline') {
      codec = 'H.264B';
    } 
    else {
      codec = 'H.264'; // Default to standard H.264
    }
  }
  // BitRate Control
  const brControl = getVal(mainPrefix + "BitRateControl", "CBR");

  // Resolution
  const resolution = getVal(mainPrefix + "resolution", "1920x1080");

  // Calculate reference bitrate for UI display
  const resolutionOptions = camId === 'cam2' ? resolutionOptionsThermal : resolutionOptionsOptical;
  const resOption = resolutionOptions.find(r => r.value === resolution);
  const refBitRate = resOption ? Math.floor((resOption.minBitrate + resOption.maxBitrate) / 2) : 4096;

  return {
    videoCodec: codec as VideoEncodingData['videoCodec'],
    resolution: resolution,
    frameRate: Number(getVal(mainPrefix + "FPS", 25)),
    bitRateType: brControl === "VBR" ? 'variable' : 'fixed',
    pictureQuality: Number(getVal(mainPrefix + "Quality", 4)),
    referenceBitRate: refBitRate,
    bitRate: Number(getVal(mainPrefix + "BitRate", 4096)),
    iFrameInterval: Number(getVal(mainPrefix + "GOP", 50)),

    // Substream (ExtraFormat[0])
    subStreamEnabled: String(getVal(subPrefix + "VideoEnable", "false")) === "true",

    // Watermark (Local state as it's not in the provided JSON segment)
    watermarkEnabled: false,
    watermarkText: "DigitalCCTV"
  };
};

/**
 * Converts UI state to API payload.
 */
const uiToApi = (ui: VideoEncodingData) => {
  const mainPrefix = "Encode[0].MainFormat[0].Video.";
  const subPrefix = "Encode[0].ExtraFormat[0].";

  let codec = ui.videoCodec === 'MJPEG' ? 'MJPG' : ui.videoCodec; // API often uses MJPG

  return {
    [`${mainPrefix}Compression`]: codec,
    [`${mainPrefix}resolution`]: ui.resolution,
    [`${mainPrefix}FPS`]: ui.frameRate,
    [`${mainPrefix}BitRateControl`]: ui.bitRateType === 'variable' ? "VBR" : "CBR",
    [`${mainPrefix}BitRate`]: ui.bitRate,
    [`${mainPrefix}GOP`]: ui.iFrameInterval,
    [`${mainPrefix}Quality`]: ui.pictureQuality ?? 4,
    [`${subPrefix}VideoEnable`]: ui.subStreamEnabled ? "true" : "false"
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

const VideoEncoding: React.FC = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error, refetch } = useVideoEncode(camId);
  const mutation = useSetVideoEncode(camId);

  // Get resolution options based on camera type
  const resolutionOptions = camId === 'cam2' ? resolutionOptionsThermal : resolutionOptionsOptical;

  // Local State
  const [settings, setSettings] = useState<VideoEncodingData>(defaultState);
  const [watermarkInput, setWatermarkInput] = useState("");
  const [isDirty, setIsDirty] = useState(false);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData, camId);
      setSettings(parsed);
      setWatermarkInput(parsed.watermarkText);
      setIsDirty(false);
    }
  }, [apiData, camId]);

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

  const handleResolutionChange = (resolution: string) => {
    const selectedRes = resolutionOptions.find(r => r.value === resolution);
    const newRefBitRate = selectedRes
      ? Math.floor((selectedRes.minBitrate + selectedRes.maxBitrate) / 2)
      : settings.referenceBitRate;

    handleUpdate({
      resolution,
      referenceBitRate: newRefBitRate,
      bitRate: newRefBitRate // Auto-set bitrate to recommended when resolution changes
    });
  };

  const handleCodecChange = (codec: VideoEncodingData['videoCodec']) => {
    const updates: Partial<VideoEncodingData> = { videoCodec: codec };
    if (codec === 'MJPEG') {
      updates.bitRateType = 'fixed'; // MJPEG typically CBR in these systems
    }
    handleUpdate(updates);
  };

  const currentResolution = resolutionOptions.find(r => r.value === settings.resolution) || resolutionOptions[2];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de l'encodage...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Feedback */}
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
          ✓ Configuration sauvegardée!
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Encodage Vidéo</h2>
          <p className="text-gray-400 text-sm">
            Configuration du flux principal (MainFormat) et activation du flux secondaire.
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || mutation.isPending}
          className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-lg transition-colors"
        >
          {mutation.isPending ? '...' : 'Sauvegarder'}
        </button>
      </div>

      {/* Video Codec */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Codec Vidéo</h2>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          {(['H.264', 'H.264H', 'H.264B', 'H.265', 'MJPEG'] as const).map((codec) => (
            <button
              key={codec}
              onClick={() => handleCodecChange(codec)}
              className={`py-4 px-4 rounded-lg font-medium transition-all ${settings.videoCodec === codec
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="text-center">
                <div className="font-bold text-lg">{codec}</div>
                <div className="text-xs mt-1 opacity-75">
                  {codec === 'H.265' ? 'HEVC' :
                    codec === 'MJPEG' ? 'Motion JPEG' : 'Standard'}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Resolution */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Résolution</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {resolutionOptions.map((res) => (
            <button
              key={res.value}
              onClick={() => handleResolutionChange(res.value)}
              className={`py-4 px-5 rounded-lg font-medium transition-all text-left ${settings.resolution === res.value
                ? 'bg-red-600 text-white shadow-lg shadow-red-500/25'
                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
              <div className="flex items-center justify-between">
                <div>
                  <div className="font-bold">{res.label}</div>
                  <div className="text-xs mt-1 opacity-75">
                    Cible: ~{Math.floor(res.minBitrate / 1024)} Mbps
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Frame Rate */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Fréquence (FPS)</h2>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-white font-medium">{settings.frameRate} FPS</label>
            <span className="text-gray-400 text-sm">Fluide</span>
          </div>
          <input
            type="range"
            min="1"
            max="25"
            value={settings.frameRate}
            onChange={(e) => handleUpdate({ frameRate: parseInt(e.target.value) })}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
          />
        </div>
      </div>

      {/* Bit Rate */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <h2 className="text-xl font-semibold text-white mb-4">Contrôle du Débit</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <button
            onClick={() => handleUpdate({ bitRateType: 'fixed' })}
            disabled={settings.videoCodec === 'MJPEG'}
            className={`py-4 px-6 rounded-lg font-medium transition-all ${settings.bitRateType === 'fixed'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            Débit Fixe (CBR)
          </button>
          <button
            onClick={() => handleUpdate({ bitRateType: 'variable' })}
            disabled={settings.videoCodec === 'MJPEG'}
            className={`py-4 px-6 rounded-lg font-medium transition-all ${settings.bitRateType === 'variable'
              ? 'bg-red-600 text-white shadow-lg'
              : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
          >
            Débit Variable (VBR)
          </button>
        </div>

        {/* Picture Quality (Only VBR) */}
        {settings.bitRateType === 'variable' && (
          <div className="mb-6 p-4 bg-gray-900/50 rounded border border-gray-600">
            <div className="flex justify-between mb-2">
              <label className="text-white">Qualité d'Image</label>
              <span className="text-gray-400">{settings.pictureQuality}/6</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              value={settings.pictureQuality || 4}
              onChange={(e) => handleUpdate({ pictureQuality: parseInt(e.target.value) })}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
            />
            <div className="flex justify-between text-xs text-gray-500 mt-1">
              <span>Faible (1)</span>
              <span>Haute (6)</span>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Reference */}
          <div className="p-4 bg-blue-900/20 border border-blue-700/30 rounded-lg">
            <div className="text-sm text-blue-300 mb-1">Recommandé</div>
            <div className="text-2xl font-bold text-blue-400">{currentResolution.minBitrate} - {currentResolution.maxBitrate} kbps</div>
          </div>

          {/* Input */}
          <div className="p-4 bg-gray-900/50 rounded-lg border border-gray-600">
            <div className="text-sm text-gray-300 mb-1">Débit Actuel (kbps)</div>
            <input
              type="number"
              value={settings.bitRate}
              onChange={(e) => handleUpdate({ bitRate: parseInt(e.target.value) || 0 })}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-600 rounded text-white focus:border-red-500 outline-none"
            />
          </div>
        </div>
      </div>

      {/* I Frame Interval */}
      <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold text-white">Intervalle I-Frame (GOP)</h2>
          <span className="text-gray-400 text-sm">{settings.iFrameInterval} images</span>
        </div>
        <input
          type="range"
          min="1"
          max="150"
          value={settings.iFrameInterval}
          onChange={(e) => handleUpdate({ iFrameInterval: parseInt(e.target.value) })}
          className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
        />
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>1</span>
          <span>150</span>
        </div>
      </div>

      {/* Other Settings */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Watermark (Local UI only) */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-white font-medium">Filigrane</h3>
            <button
              onClick={() => handleUpdate({ watermarkEnabled: !settings.watermarkEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.watermarkEnabled ? 'bg-red-600' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.watermarkEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
          {settings.watermarkEnabled && (
            <input
              type="text"
              value={watermarkInput}
              onChange={(e) => setWatermarkInput(e.target.value)}
              onBlur={() => handleUpdate({ watermarkText: watermarkInput })}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-600 rounded text-white"
              placeholder="Texte du filigrane"
            />
          )}
        </div>

        {/* Sub Stream Toggle */}
        <div className="bg-gray-800/50 rounded-lg p-6 border border-gray-700">
          <div className="flex justify-between items-center">
            <div>
              <h3 className="text-white font-medium">Flux Secondaire</h3>
              <p className="text-xs text-gray-400">Activer le flux ExtraFormat[0]</p>
            </div>
            <button
              onClick={() => handleUpdate({ subStreamEnabled: !settings.subStreamEnabled })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.subStreamEnabled ? 'bg-red-600' : 'bg-gray-600'}`}
            >
              <div className={`w-4 h-4 bg-white rounded-full absolute top-1 transition-all ${settings.subStreamEnabled ? 'left-7' : 'left-1'}`}></div>
            </button>
          </div>
        </div>
      </div>

    </div>
  );
};

export default VideoEncoding;