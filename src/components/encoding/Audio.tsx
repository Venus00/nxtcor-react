"use client"

import type React from "react"

export interface AudioData {
  audioEnabled: boolean;
  channelNumber: number;
  audioCodec: 'AAC' | 'MPEG2-Layer2';
  samplingFrequency: '8K' | '16K';
  audioInType: 'LineIn' | 'Mic';
  noiseFilter: boolean;
  microphoneVolume: number; // 0-100
  speakerVolume: number; // 0-100
}

interface AudioProps {
  settings: AudioData;
  onSettingsChange: (settings: AudioData) => void;
}

const Audio: React.FC<AudioProps> = ({ settings, onSettingsChange }) => {
  const updateSettings = (key: keyof AudioData, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const getVolumeColor = (volume: number) => {
    if (volume === 0) return 'text-gray-400';
    if (volume <= 30) return 'text-yellow-400';
    if (volume <= 70) return 'text-green-400';
    return 'text-red-400';
  };

  const getVolumeIcon = (volume: number) => {
    if (volume === 0) {
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      );
    }
    if (volume <= 30) {
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      );
    }
    if (volume <= 70) {
      return (
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
      );
    }
    return (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Audio Configuration</h2>
        <p className="text-gray-400 text-sm">
          Configure audio codec, sampling, input type, and volume settings for audio streaming
        </p>
      </div>

      {/* Audio Enable */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072m2.828-9.9a9 9 0 010 12.728M5.586 15H4a1 1 0 01-1-1v-4a1 1 0 011-1h1.586l4.707-4.707C10.923 3.663 12 4.109 12 5v14c0 .891-1.077 1.337-1.707.707L5.586 15z" />
              </svg>
              Audio Enable
            </h3>
            <p className="text-sm text-gray-400">
              Enable audio channel to transmit composite audio and video stream
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.audioEnabled}
              onChange={(e) => updateSettings('audioEnabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>

        {settings.audioEnabled && (
          <div className="mt-4 p-4 bg-green-900/20 border border-green-600/50 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-green-200">
                <strong>Audio Enabled:</strong> Network stream will include both audio and video data
              </p>
            </div>
          </div>
        )}

        {!settings.audioEnabled && (
          <div className="mt-4 p-4 bg-gray-900/50 border border-gray-700 rounded-lg">
            <div className="flex items-center gap-2">
              <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-sm text-gray-400">
                Audio disabled - Only video images will be transmitted
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Channel Number */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
            </svg>
            Audio Channel Number
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Select the audio channel to be enabled for streaming
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[1, 2, 3, 4].map((channel) => (
              <button
                key={channel}
                onClick={() => updateSettings('channelNumber', channel)}
                className={`p-4 rounded-lg border-2 transition-all ${
                  settings.channelNumber === channel
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                }`}
              >
                <div className="text-center">
                  <div className={`text-2xl font-bold mb-1 ${
                    settings.channelNumber === channel ? 'text-red-400' : 'text-white'
                  }`}>
                    {channel}
                  </div>
                  <div className="text-xs text-gray-400">Channel {channel}</div>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Audio Codec */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
            </svg>
            Audio Codec
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Select the audio compression codec (AAC recommended for better quality)
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings('audioCodec', 'AAC')}
              className={`p-5 rounded-lg border-2 transition-all ${
                settings.audioCodec === 'AAC'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  settings.audioCodec === 'AAC'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {settings.audioCodec === 'AAC' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-white mb-1">AAC</h4>
                  <p className="text-xs text-gray-400">
                    Advanced Audio Coding - Better quality, default option
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded font-semibold">
                  Default
                </span>
              </div>
            </button>

            <button
              onClick={() => updateSettings('audioCodec', 'MPEG2-Layer2')}
              className={`p-5 rounded-lg border-2 transition-all ${
                settings.audioCodec === 'MPEG2-Layer2'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  settings.audioCodec === 'MPEG2-Layer2'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {settings.audioCodec === 'MPEG2-Layer2' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-white mb-1">MPEG2-Layer2</h4>
                  <p className="text-xs text-gray-400">
                    Legacy codec - Compatible with older systems
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Sampling Frequency */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
            </svg>
            Sampling Frequency
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Higher sampling frequency provides better audio quality but increases bandwidth
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings('samplingFrequency', '8K')}
              className={`p-5 rounded-lg border-2 transition-all ${
                settings.samplingFrequency === '8K'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  settings.samplingFrequency === '8K'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {settings.samplingFrequency === '8K' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-white mb-1">8 kHz</h4>
                  <p className="text-xs text-gray-400">
                    Lower quality - Reduced bandwidth usage
                  </p>
                </div>
              </div>
            </button>

            <button
              onClick={() => updateSettings('samplingFrequency', '16K')}
              className={`p-5 rounded-lg border-2 transition-all ${
                settings.samplingFrequency === '16K'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  settings.samplingFrequency === '16K'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {settings.samplingFrequency === '16K' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-white mb-1">16 kHz</h4>
                  <p className="text-xs text-gray-400">
                    Standard quality - Recommended setting
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded font-semibold">
                  Default
                </span>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Audio In Type */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
            </svg>
            Audio Input Type
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Select the audio input source type
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <button
              onClick={() => updateSettings('audioInType', 'LineIn')}
              className={`p-5 rounded-lg border-2 transition-all ${
                settings.audioInType === 'LineIn'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  settings.audioInType === 'LineIn'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {settings.audioInType === 'LineIn' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-white mb-1">Line In</h4>
                  <p className="text-xs text-gray-400">
                    External audio source - Better quality, less noise
                  </p>
                </div>
                <span className="px-2 py-1 bg-green-600/20 text-green-400 text-xs rounded font-semibold">
                  Default
                </span>
              </div>
            </button>

            <button
              onClick={() => updateSettings('audioInType', 'Mic')}
              className={`p-5 rounded-lg border-2 transition-all ${
                settings.audioInType === 'Mic'
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center gap-3">
                <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                  settings.audioInType === 'Mic'
                    ? 'border-red-500 bg-red-500'
                    : 'border-gray-500'
                }`}>
                  {settings.audioInType === 'Mic' && (
                    <div className="w-2 h-2 bg-white rounded-full"></div>
                  )}
                </div>
                <div className="flex-1 text-left">
                  <h4 className="font-semibold text-white mb-1">Microphone</h4>
                  <p className="text-xs text-gray-400">
                    Built-in or external microphone input
                  </p>
                </div>
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Noise Filter */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                </svg>
                Noise Filter
              </h3>
              <p className="text-sm text-gray-400">
                Enable to reduce background noise and improve audio clarity
              </p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={settings.noiseFilter}
                onChange={(e) => updateSettings('noiseFilter', e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
            </label>
          </div>

          {settings.noiseFilter && (
            <div className="mt-4 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
              <div className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p className="text-sm text-blue-200">
                  Noise filter active - Background noise will be automatically reduced
                </p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Volume Controls */}
      {settings.audioEnabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              {getVolumeIcon(50)}
            </svg>
            Volume Controls
          </h3>
          <p className="text-sm text-gray-400 mb-6">
            Adjust microphone and speaker volume levels (0-100)
          </p>

          <div className="space-y-6">
            {/* Microphone Volume */}
            <div className="p-5 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <svg className={`w-6 h-6 ${getVolumeColor(settings.microphoneVolume)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white">Microphone Volume</h4>
                    <p className="text-xs text-gray-400">Input audio level control</p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${getVolumeColor(settings.microphoneVolume)}`}>
                  {settings.microphoneVolume}%
                </span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.microphoneVolume}
                  onChange={(e) => updateSettings('microphoneVolume', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${settings.microphoneVolume}%, #374151 ${settings.microphoneVolume}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Muted</span>
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span>Max</span>
                </div>
              </div>

              {/* Volume Visual Bars */}
              <div className="flex gap-1 mt-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-6 rounded transition-colors ${
                      i < settings.microphoneVolume / 5
                        ? settings.microphoneVolume === 0
                          ? 'bg-gray-600'
                          : settings.microphoneVolume <= 30
                          ? 'bg-yellow-500'
                          : settings.microphoneVolume <= 70
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Speaker Volume */}
            <div className="p-5 bg-gray-900/50 rounded-lg border border-gray-700">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <svg className={`w-6 h-6 ${getVolumeColor(settings.speakerVolume)}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {getVolumeIcon(settings.speakerVolume)}
                  </svg>
                  <div>
                    <h4 className="font-semibold text-white">Speaker Volume</h4>
                    <p className="text-xs text-gray-400">Output audio level control</p>
                  </div>
                </div>
                <span className={`text-2xl font-bold ${getVolumeColor(settings.speakerVolume)}`}>
                  {settings.speakerVolume}%
                </span>
              </div>

              <div className="relative">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={settings.speakerVolume}
                  onChange={(e) => updateSettings('speakerVolume', parseInt(e.target.value))}
                  className="w-full h-3 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                  style={{
                    background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${settings.speakerVolume}%, #374151 ${settings.speakerVolume}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-2">
                  <span>Muted</span>
                  <span>Low</span>
                  <span>Medium</span>
                  <span>High</span>
                  <span>Max</span>
                </div>
              </div>

              {/* Volume Visual Bars */}
              <div className="flex gap-1 mt-4">
                {Array.from({ length: 20 }).map((_, i) => (
                  <div
                    key={i}
                    className={`flex-1 h-6 rounded transition-colors ${
                      i < settings.speakerVolume / 5
                        ? settings.speakerVolume === 0
                          ? 'bg-gray-600'
                          : settings.speakerVolume <= 30
                          ? 'bg-yellow-500'
                          : settings.speakerVolume <= 70
                          ? 'bg-green-500'
                          : 'bg-red-500'
                        : 'bg-gray-700'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Configuration Summary */}
      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Audio Configuration Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className={`p-4 rounded border ${
            settings.audioEnabled ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${settings.audioEnabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm font-semibold text-gray-300">Audio Status</span>
            </div>
            <p className={`text-lg font-bold ${settings.audioEnabled ? 'text-green-400' : 'text-gray-500'}`}>
              {settings.audioEnabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          {settings.audioEnabled && (
            <>
              <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-300">Channel</span>
                </div>
                <p className="text-lg font-bold text-white">Channel {settings.channelNumber}</p>
              </div>

              <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-4 h-4 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-300">Codec</span>
                </div>
                <p className="text-lg font-bold text-white">{settings.audioCodec}</p>
              </div>

              <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-300">Sampling</span>
                </div>
                <p className="text-lg font-bold text-white">{settings.samplingFrequency === '8K' ? '8 kHz' : '16 kHz'}</p>
              </div>

              <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-4 h-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-300">Input Type</span>
                </div>
                <p className="text-lg font-bold text-white">{settings.audioInType === 'LineIn' ? 'Line In' : 'Microphone'}</p>
              </div>

              <div className={`p-4 rounded border ${
                settings.noiseFilter ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'
              }`}>
                <div className="flex items-center gap-3 mb-2">
                  <div className={`w-3 h-3 rounded-full ${settings.noiseFilter ? 'bg-green-500' : 'bg-gray-600'}`}></div>
                  <span className="text-sm font-semibold text-gray-300">Noise Filter</span>
                </div>
                <p className={`text-lg font-bold ${settings.noiseFilter ? 'text-green-400' : 'text-gray-500'}`}>
                  {settings.noiseFilter ? 'Enabled' : 'Disabled'}
                </p>
              </div>

              <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                  </svg>
                  <span className="text-sm font-semibold text-gray-300">Mic Volume</span>
                </div>
                <p className={`text-lg font-bold ${getVolumeColor(settings.microphoneVolume)}`}>
                  {settings.microphoneVolume}%
                </p>
              </div>

              <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                <div className="flex items-center gap-3 mb-2">
                  <svg className="w-4 h-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    {getVolumeIcon(settings.speakerVolume)}
                  </svg>
                  <span className="text-sm font-semibold text-gray-300">Speaker Volume</span>
                </div>
                <p className={`text-lg font-bold ${getVolumeColor(settings.speakerVolume)}`}>
                  {settings.speakerVolume}%
                </p>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Audio;
