// components/camera/Audio.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useEncode as useVideoEncode } from "../../hooks/useCameraQueries"; // Audio settings are part of Encode config
import { useSetEncode as useSetVideoEncode } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface AudioData {
  audioEnabled: boolean;           // API: table.Encode[0].MainFormat[0].AudioEnable
  channelNumber: number;           // UI Only (usually fixed to 1 for config)
  audioCodec: 'AAC' | 'MPEG2-Layer2' | 'G.711A'; // API: ...Audio.Compression
  samplingFrequency: '8K' | '16K'; // API: ...Audio.Frequency
  audioInType: 'LineIn' | 'Mic';   // API: table.Encode[0].Attribute.AudioInType
  noiseFilter: boolean;            // API: table.Encode[0].Attribute.NoiseFilter
  microphoneVolume: number;        // API: table.Encode[0].Attribute.MicrophoneVolume
  speakerVolume: number;           // API: table.Encode[0].Attribute.SpeakerVolume
}

const defaultState: AudioData = {
  audioEnabled: false,
  channelNumber: 1,
  audioCodec: 'AAC',
  samplingFrequency: '16K',
  audioInType: 'LineIn',
  noiseFilter: true,
  microphoneVolume: 50,
  speakerVolume: 50
};

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Parses API response to UI state.
 * Maps MainFormat Audio settings and global Attribute settings.
 *
 */
const apiToUI = (data: any): AudioData => {
  if (!data) return defaultState;
  
  const config = data.config || data;
  const mainPfx = "table.Encode[0].MainFormat[0]."; 
  const attrPfx = "table.Encode[0].Attribute."; 

  const getVal = (key: string, def: any) => config[key] ?? def;

  // Main Stream Audio Config
  const audioEnabled = String(getVal(`${mainPfx}AudioEnable`, "false")) === "true";
  const comp = getVal(`${mainPfx}Audio.Compression`, "AAC");
  const freq = getVal(`${mainPfx}Audio.Frequency`, "16000");

  // Attributes (Volume/Input)
  // Note: If these keys are missing in the specific JSON snippet but present in the full device state,
  // we default them to safe values to keep the UI functional.
  const audioInType = getVal(`${attrPfx}AudioInType`, "LineIn");
  const noiseFilter = getVal(`${attrPfx}NoiseFilter`, "Enable") === "Enable";
  const micVol = Number(getVal(`${attrPfx}MicrophoneVolume`, 50));
  const spkVol = Number(getVal(`${attrPfx}SpeakerVolume`, 50));

  return {
    audioEnabled,
    channelNumber: 1,
    audioCodec: (comp === 'MPEG2' || comp === 'Layer2') ? 'MPEG2-Layer2' : 'AAC',
    samplingFrequency: freq === "8000" ? '8K' : '16K',
    audioInType: audioInType as AudioData['audioInType'],
    noiseFilter,
    microphoneVolume: micVol,
    speakerVolume: spkVol
  };
};

/**
 * Converts UI state to API payload.
 */
const uiToApi = (ui: AudioData) => {
  const mainPfx = "Encode[0].MainFormat[0].";
  const attrPfx = "Encode[0].Attribute.";

  return {
    // Main Stream Audio
    [`${mainPfx}AudioEnable`]: ui.audioEnabled,
    [`${mainPfx}Audio.Compression`]: ui.audioCodec === 'MPEG2-Layer2' ? 'MPEG2' : 'AAC',
    [`${mainPfx}Audio.Frequency`]: ui.samplingFrequency === '8K' ? 8000 : 16000,
    
    // Attributes
    [`${attrPfx}AudioInType`]: ui.audioInType,
    [`${attrPfx}NoiseFilter`]: ui.noiseFilter ? "Enable" : "Disable",
    [`${attrPfx}MicrophoneVolume`]: ui.microphoneVolume,
    [`${attrPfx}SpeakerVolume`]: ui.speakerVolume
  };
};

// =============================================================================
// COMPONENT
// =============================================================================

const Audio: React.FC = () => {
  const camId = useCamId();
  // We use the Encode API because Audio settings are part of the Encode configuration
  const { data: apiData, isLoading, error, refetch } = useVideoEncode(camId); 
  const mutation = useSetVideoEncode(camId);

  // Local State
  const [settings, setSettings] = useState<AudioData>(defaultState);
  const [isDirty, setIsDirty] = useState(false);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      setSettings(parsed);
      setIsDirty(false);
    }
  }, [apiData]);

  // Handlers
  const handleUpdate = (key: keyof AudioData, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
    setIsDirty(true);
  };

  const handleSave = () => {
    const payload = uiToApi(settings);
    mutation.mutate(payload);
    setIsDirty(false);
  };

  // Helper for UI visuals
  const getVolumeColor = (volume: number) => {
    if (volume === 0) return 'text-gray-400';
    if (volume <= 30) return 'text-yellow-400';
    if (volume <= 70) return 'text-green-400';
    return 'text-red-400';
  };

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />;
    if (volume <= 30) return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />;
    if (volume <= 70) return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />;
    return <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Chargement de la configuration audio...</p>
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
          ✓ Configuration audio enregistrée!
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">Configuration Audio</h2>
          <p className="text-gray-400 text-sm">
            Configuration du codec, de l'échantillonnage, des entrées et du volume
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

      {/* Audio Enable */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Activer l'Audio
            </h3>
            <p className="text-sm text-gray-400">
              Activer le canal audio pour transmettre le flux composite (Audio + Vidéo)
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.audioEnabled}
              onChange={(e) => handleUpdate('audioEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {settings.audioEnabled ? (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-200">
                <strong>Audio Activé:</strong> Le flux réseau inclura les données audio et vidéo.
              </p>
            </div>
          </div>
        ) : (
          <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-400">
                Audio désactivé - Seules les images vidéo seront transmises.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Codec & Sampling */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Format Audio
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             {/* Codec Selection */}
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Codec</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdate('audioCodec', 'AAC')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      settings.audioCodec === 'AAC' 
                        ? 'border-red-500 bg-red-500/10 text-white' 
                        : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    AAC
                  </button>
                  <button
                    onClick={() => handleUpdate('audioCodec', 'MPEG2-Layer2')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      settings.audioCodec === 'MPEG2-Layer2'
                        ? 'border-red-500 bg-red-500/10 text-white'
                        : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    MPEG2
                  </button>
                </div>
             </div>

             {/* Frequency Selection */}
             <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Fréquence d'Échantillonnage</label>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => handleUpdate('samplingFrequency', '8K')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      settings.samplingFrequency === '8K'
                        ? 'border-red-500 bg-red-500/10 text-white'
                        : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    8 kHz (Low)
                  </button>
                  <button
                    onClick={() => handleUpdate('samplingFrequency', '16K')}
                    className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                      settings.samplingFrequency === '16K'
                        ? 'border-red-500 bg-red-500/10 text-white'
                        : 'border-gray-600 bg-gray-800/50 text-gray-400 hover:border-gray-500'
                    }`}
                  >
                    16 kHz (Std)
                  </button>
                </div>
             </div>
          </div>
        </div>
      )}

      {/* Input & Noise Filter */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
           <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Entrée Audio & Traitement
          </h3>

          <div className="flex flex-col md:flex-row gap-6">
            {/* Input Type */}
            <div className="flex-1">
               <label className="block text-sm font-medium text-gray-300 mb-2">Source d'Entrée</label>
               <div className="flex bg-gray-900/50 p-1 rounded-lg">
                 <button
                   onClick={() => handleUpdate('audioInType', 'LineIn')}
                   className={`flex-1 py-2 rounded text-sm ${settings.audioInType === 'LineIn' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                   Line In
                 </button>
                 <button
                   onClick={() => handleUpdate('audioInType', 'Mic')}
                   className={`flex-1 py-2 rounded text-sm ${settings.audioInType === 'Mic' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                 >
                   Microphone
                 </button>
               </div>
            </div>

            {/* Noise Filter */}
            <div className="flex-1 flex items-center justify-between bg-gray-900/30 p-3 rounded-lg border border-gray-700">
               <div>
                 <span className="block text-white font-medium">Filtre de Bruit</span>
                 <span className="text-xs text-gray-400">Réduction de bruit ambiant</span>
               </div>
               <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.noiseFilter}
                  onChange={(e) => handleUpdate('noiseFilter', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>
          </div>
        </div>
      )}

      {/* Volume Controls */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {getVolumeIcon(50)}
            </svg>
            Contrôle du Volume
          </h3>

          <div className="space-y-6">
            {/* Microphone Volume */}
            <div className="p-5 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <svg className={`w-6 h-6 ${getVolumeColor(settings.microphoneVolume)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white">Microphone (Entrée)</h4>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${getVolumeColor(settings.microphoneVolume)}`}>
                  {settings.microphoneVolume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.microphoneVolume}
                onChange={(e) => handleUpdate('microphoneVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>

            {/* Speaker Volume */}
            <div className="p-5 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <svg className={`w-6 h-6 ${getVolumeColor(settings.speakerVolume)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {getVolumeIcon(settings.speakerVolume)}
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white">Haut-parleur (Sortie)</h4>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${getVolumeColor(settings.speakerVolume)}`}>
                  {settings.speakerVolume}%
                </span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                value={settings.speakerVolume}
                onChange={(e) => handleUpdate('speakerVolume', parseInt(e.target.value))}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Audio;