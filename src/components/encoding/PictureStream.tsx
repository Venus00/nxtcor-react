"use client"

import type React from "react"

export interface PictureStreamData {
  snapshotType: 'normal' | 'triggered';
  imageSize: '4K' | '5M' | '3M' | '1080P' | '720P' | 'D1' | 'CIF';
  quality: 'worst' | 'worse' | 'poor' | 'good' | 'better' | 'best';
  interval: number; // in seconds, 1-7 or custom
  customInterval: number; // for custom interval
}

interface PictureStreamProps {
  settings: PictureStreamData;
  onSettingsChange: (settings: PictureStreamData) => void;
}

const PictureStream: React.FC<PictureStreamProps> = ({ settings, onSettingsChange }) => {
  const updateSettings = (key: keyof PictureStreamData, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const imageSizeOptions = [
    { value: '4K', label: '4K (3840×2160)', description: 'Ultra High Definition' },
    { value: '5M', label: '5M (2592×1944)', description: '5 Megapixel' },
    { value: '3M', label: '3M (2048×1536)', description: '3 Megapixel' },
    { value: '1080P', label: '1080P (1920×1080)', description: 'Full HD' },
    { value: '720P', label: '720P (1280×720)', description: 'HD' },
    { value: 'D1', label: 'D1 (704×576)', description: 'Standard Definition' },
    { value: 'CIF', label: 'CIF (352×288)', description: 'Low Resolution' },
  ];

  const qualityLevels = [
    { value: 'worst', label: 'Worst', color: 'text-red-400', description: 'Minimum quality, smallest file size' },
    { value: 'worse', label: 'Worse', color: 'text-orange-400', description: 'Very low quality' },
    { value: 'poor', label: 'Poor', color: 'text-yellow-400', description: 'Low quality' },
    { value: 'good', label: 'Good', color: 'text-lime-400', description: 'Standard quality' },
    { value: 'better', label: 'Better', color: 'text-green-400', description: 'High quality' },
    { value: 'best', label: 'Best', color: 'text-emerald-400', description: 'Maximum quality, largest file size' },
  ];

  const intervalOptions = [1, 2, 3, 4, 5, 6, 7];

  const getQualityColor = (quality: string) => {
    const level = qualityLevels.find(q => q.value === quality);
    return level?.color || 'text-gray-400';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Picture Stream Configuration</h2>
        <p className="text-gray-400 text-sm">
          Configure snapshot settings for image capture operations
        </p>
      </div>

      {/* Snapshot Type */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Snapshot Type
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Normal Snapshot */}
          <button
            onClick={() => updateSettings('snapshotType', 'normal')}
            className={`p-5 rounded-lg border-2 transition-all ${
              settings.snapshotType === 'normal'
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                settings.snapshotType === 'normal'
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-500'
              }`}>
                {settings.snapshotType === 'normal' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-white mb-1">Normal Image Capture</h4>
                <p className="text-sm text-gray-400">
                  Capture images within the scope set in the timetable
                </p>
              </div>
            </div>
          </button>

          {/* Triggered Snapshot */}
          <button
            onClick={() => updateSettings('snapshotType', 'triggered')}
            className={`p-5 rounded-lg border-2 transition-all ${
              settings.snapshotType === 'triggered'
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            <div className="flex items-start gap-3">
              <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-1 ${
                settings.snapshotType === 'triggered'
                  ? 'border-red-500 bg-red-500'
                  : 'border-gray-500'
              }`}>
                {settings.snapshotType === 'triggered' && (
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                )}
              </div>
              <div className="flex-1 text-left">
                <h4 className="font-semibold text-white mb-1">Triggered Image Capture</h4>
                <p className="text-sm text-gray-400">
                  Capture after triggering motion detection, video mask, or local alarm
                </p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Image Size */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Image Size
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Select resolution (same as main stream or sub stream)
        </p>
        
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
          {imageSizeOptions.map((option) => (
            <button
              key={option.value}
              onClick={() => updateSettings('imageSize', option.value)}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.imageSize === option.value
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className={`font-semibold mb-1 ${
                  settings.imageSize === option.value ? 'text-red-400' : 'text-white'
                }`}>
                  {option.label.split(' ')[0]}
                </div>
                <div className="text-xs text-gray-400">
                  {option.label.split(' ')[1]}
                </div>
                <div className="text-xs text-gray-500 mt-1">
                  {option.description}
                </div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Quality */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          Image Quality
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Set the quality of captured images (affects file size)
        </p>

        <div className="space-y-3">
          {qualityLevels.map((level) => (
            <button
              key={level.value}
              onClick={() => updateSettings('quality', level.value)}
              className={`w-full p-4 rounded-lg border-2 transition-all ${
                settings.quality === level.value
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${
                    settings.quality === level.value
                      ? 'border-red-500 bg-red-500'
                      : 'border-gray-500'
                  }`}>
                    {settings.quality === level.value && (
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    )}
                  </div>
                  <div className="text-left">
                    <div className={`font-semibold ${level.color}`}>{level.label}</div>
                    <div className="text-xs text-gray-400">{level.description}</div>
                  </div>
                </div>
                <div className="flex gap-1">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-2 h-6 rounded ${
                        i <= qualityLevels.findIndex(q => q.value === level.value)
                          ? level.color.replace('text-', 'bg-')
                          : 'bg-gray-700'
                      }`}
                    />
                  ))}
                </div>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-700">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-blue-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">Current Quality:</span>{' '}
              <span className={getQualityColor(settings.quality)}>
                {qualityLevels.find(q => q.value === settings.quality)?.label}
              </span>
              {' '}- {qualityLevels.find(q => q.value === settings.quality)?.description}
            </div>
          </div>
        </div>
      </div>

      {/* Interval */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Capture Interval
        </h3>
        <p className="text-sm text-gray-400 mb-4">
          Set the frequency of image capture (1-7 seconds or custom)
        </p>

        <div className="grid grid-cols-4 md:grid-cols-8 gap-3 mb-4">
          {intervalOptions.map((interval) => (
            <button
              key={interval}
              onClick={() => {
                updateSettings('interval', interval);
                updateSettings('customInterval', interval);
              }}
              className={`p-4 rounded-lg border-2 transition-all ${
                settings.interval === interval && settings.interval <= 7
                  ? 'border-red-500 bg-red-500/10'
                  : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
              }`}
            >
              <div className="text-center">
                <div className={`text-2xl font-bold mb-1 ${
                  settings.interval === interval && settings.interval <= 7
                    ? 'text-red-400'
                    : 'text-white'
                }`}>
                  {interval}
                </div>
                <div className="text-xs text-gray-400">sec</div>
              </div>
            </button>
          ))}
          
          {/* Custom Interval */}
          <button
            onClick={() => updateSettings('interval', settings.customInterval > 7 ? settings.customInterval : 10)}
            className={`p-4 rounded-lg border-2 transition-all ${
              settings.interval > 7
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            <div className="text-center">
              <div className={`text-lg font-bold mb-1 ${
                settings.interval > 7 ? 'text-red-400' : 'text-white'
              }`}>
                Custom
              </div>
              <div className="text-xs text-gray-400">Other</div>
            </div>
          </button>
        </div>

        {/* Custom Interval Input */}
        {settings.interval > 7 && (
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Custom Interval (seconds)
            </label>
            <input
              type="number"
              min="8"
              max="3600"
              value={settings.customInterval}
              onChange={(e) => {
                const value = parseInt(e.target.value) || 8;
                updateSettings('customInterval', value);
                updateSettings('interval', value);
              }}
              className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
            />
            <p className="text-xs text-gray-400 mt-2">
              Enter custom interval between 8 and 3600 seconds
            </p>
          </div>
        )}

        {/* Interval Info */}
        <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-700">
          <div className="flex items-start gap-2">
            <svg className="w-5 h-5 text-green-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-gray-400">
              <span className="text-white font-medium">Current Setting:</span>{' '}
              Capture one image every <span className="text-red-400 font-semibold">{settings.interval}</span> second{settings.interval > 1 ? 's' : ''}
              {' '}({Math.floor(3600 / settings.interval)} images per hour)
            </div>
          </div>
        </div>
      </div>

      {/* Configuration Summary */}
      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Configuration Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Snapshot Type</div>
            <div className="text-white font-semibold">
              {settings.snapshotType === 'normal' ? 'Normal Image Capture' : 'Triggered Image Capture'}
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Image Size</div>
            <div className="text-white font-semibold">
              {imageSizeOptions.find(o => o.value === settings.imageSize)?.label}
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Quality Level</div>
            <div className={`font-semibold ${getQualityColor(settings.quality)}`}>
              {qualityLevels.find(q => q.value === settings.quality)?.label}
            </div>
          </div>

          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="text-xs text-gray-400 mb-1">Capture Interval</div>
            <div className="text-white font-semibold">
              {settings.interval} second{settings.interval > 1 ? 's' : ''} / image
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PictureStream;
