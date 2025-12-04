"use client"

import type React from "react"
import { useState } from "react"

export interface PrivacyMaskArea {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface VideoOverlayData {
  privacyMasks: PrivacyMaskArea[];
  channelTitle: {
    enabled: boolean;
    text: string;
    x: number;
    y: number;
  };
  timeTitle: {
    enabled: boolean;
    showWeek: boolean;
    x: number;
    y: number;
  };
  osdInfo: {
    enabled: boolean;
    showPresetPoint: boolean;
    showPTZCoordinates: boolean;
    showPattern: boolean;
    alignment: 'left' | 'right';
    x: number;
    y: number;
  };
  textOverlay: {
    enabled: boolean;
    text: string;
    alignment: 'left' | 'right';
    x: number;
    y: number;
  };
  fontSize: 'small' | 'medium' | 'large';
  overlayPicture: {
    enabled: boolean;
    imageUrl: string | null;
    x: number;
    y: number;
    width: number;
    height: number;
  };
  osdWarning: {
    enabled: boolean;
  };
  gpsCoordinates: {
    enabled: boolean;
    latitude: string;
    longitude: string;
  };
}

interface VideoOverlayProps {
  settings: VideoOverlayData;
  onSettingsChange: (settings: VideoOverlayData) => void;
}

const VideoOverlay: React.FC<VideoOverlayProps> = ({ settings, onSettingsChange }) => {
  const [activeSection, setActiveSection] = useState<string>('privacy');

  const updateSettings = (key: keyof VideoOverlayData, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const updateNestedSettings = (parentKey: keyof VideoOverlayData, childKey: string, value: any) => {
    onSettingsChange({
      ...settings,
      [parentKey]: {
        ...(settings[parentKey] as any),
        [childKey]: value,
      },
    });
  };

  const handleDrawMask = () => {
    // Add a new mask with default position
    const newMask: PrivacyMaskArea = {
      id: Date.now(),
      x: 20,
      y: 20,
      width: 100,
      height: 80,
    };
    updateSettings('privacyMasks', [...settings.privacyMasks, newMask]);
  };

  const handleDeleteMask = (id: number) => {
    updateSettings('privacyMasks', settings.privacyMasks.filter(mask => mask.id !== id));
  };

  const handleClearMasks = () => {
    updateSettings('privacyMasks', []);
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updateNestedSettings('overlayPicture', 'imageUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const sections = [
    { id: 'privacy', name: 'Privacy Mask', icon: '🔒' },
    { id: 'titles', name: 'Titles', icon: '📝' },
    { id: 'overlay', name: 'Overlay', icon: '🎨' },
    { id: 'advanced', name: 'Advanced', icon: '⚙️' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white mb-2">Video Overlay Configuration</h2>
        <p className="text-gray-400 text-sm">
          Configure on-screen display elements, privacy masks, and overlay settings
        </p>
      </div>

      {/* Section Navigation */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {sections.map((section) => (
          <button
            key={section.id}
            onClick={() => setActiveSection(section.id)}
            className={`p-4 rounded-lg border-2 transition-all ${
              activeSection === section.id
                ? 'border-red-500 bg-red-500/10'
                : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
            }`}
          >
            <div className="text-2xl mb-2">{section.icon}</div>
            <div className={`font-semibold text-sm ${
              activeSection === section.id ? 'text-red-400' : 'text-white'
            }`}>
              {section.name}
            </div>
          </button>
        ))}
      </div>

      {/* Privacy Mask Section */}
      {activeSection === 'privacy' && (
        <div className="space-y-4">
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
              </svg>
              Privacy Mask
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Set shielding areas within the monitoring screen for privacy protection
            </p>

            <div className="flex flex-wrap gap-3 mb-4">
              <button
                onClick={handleDrawMask}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Draw Mask
              </button>
              <button
                onClick={handleClearMasks}
                disabled={settings.privacyMasks.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>

            {/* Preview Area */}
            <div className="relative bg-gray-900 rounded-lg border-2 border-gray-600 aspect-video overflow-hidden">
              <div className="absolute inset-0 flex items-center justify-center text-gray-500">
                <div className="text-center">
                  <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  <p className="text-sm">Video Preview Area</p>
                </div>
              </div>
              
              {/* Privacy Masks */}
              {settings.privacyMasks.map((mask) => (
                <div
                  key={mask.id}
                  className="absolute bg-black/80 border-2 border-red-500 group cursor-move"
                  style={{
                    left: `${mask.x}%`,
                    top: `${mask.y}%`,
                    width: `${mask.width}px`,
                    height: `${mask.height}px`,
                  }}
                >
                  <button
                    onClick={() => handleDeleteMask(mask.id)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    ×
                  </button>
                  <div className="absolute inset-0 flex items-center justify-center text-white text-xs">
                    Privacy Area
                  </div>
                </div>
              ))}
            </div>

            {/* Mask List */}
            {settings.privacyMasks.length > 0 && (
              <div className="mt-4 space-y-2">
                <h4 className="text-sm font-semibold text-gray-300">Active Privacy Masks ({settings.privacyMasks.length})</h4>
                {settings.privacyMasks.map((mask, index) => (
                  <div key={mask.id} className="flex items-center justify-between p-3 bg-gray-900/50 rounded border border-gray-700">
                    <span className="text-sm text-gray-400">
                      Mask #{index + 1} - Position: ({mask.x}%, {mask.y}%) - Size: {mask.width}×{mask.height}px
                    </span>
                    <button
                      onClick={() => handleDeleteMask(mask.id)}
                      className="px-3 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Titles Section */}
      {activeSection === 'titles' && (
        <div className="space-y-4">
          {/* Channel Title */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
                </svg>
                Channel Title
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.channelTitle.enabled}
                  onChange={(e) => updateNestedSettings('channelTitle', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Enable or disable channel title in the monitoring screen and adjust its position
            </p>
            
            {settings.channelTitle.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Channel Name</label>
                  <input
                    type="text"
                    value={settings.channelTitle.text}
                    onChange={(e) => updateNestedSettings('channelTitle', 'text', e.target.value)}
                    placeholder="Enter channel name"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">X Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.channelTitle.x}
                      onChange={(e) => updateNestedSettings('channelTitle', 'x', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.channelTitle.x}%</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Y Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.channelTitle.y}
                      onChange={(e) => updateNestedSettings('channelTitle', 'y', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.channelTitle.y}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Time Title */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Time Title
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.timeTitle.enabled}
                  onChange={(e) => updateNestedSettings('timeTitle', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Enable or disable time display in the monitoring screen
            </p>
            
            {settings.timeTitle.enabled && (
              <div className="space-y-3">
                <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                  <input
                    type="checkbox"
                    id="showWeek"
                    checked={settings.timeTitle.showWeek}
                    onChange={(e) => updateNestedSettings('timeTitle', 'showWeek', e.target.checked)}
                    className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                  />
                  <label htmlFor="showWeek" className="text-sm text-gray-300">Show Week Day</label>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">X Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.timeTitle.x}
                      onChange={(e) => updateNestedSettings('timeTitle', 'x', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.timeTitle.x}%</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Y Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.timeTitle.y}
                      onChange={(e) => updateNestedSettings('timeTitle', 'y', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.timeTitle.y}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Overlay Section */}
      {activeSection === 'overlay' && (
        <div className="space-y-4">
          {/* OSD Info */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                OSD Info
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.osdInfo.enabled}
                  onChange={(e) => updateNestedSettings('osdInfo', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Display preset point, PTZ coordinates, and pattern information
            </p>
            
            {settings.osdInfo.enabled && (
              <div className="space-y-3">
                <div className="space-y-2">
                  <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                    <input
                      type="checkbox"
                      id="showPreset"
                      checked={settings.osdInfo.showPresetPoint}
                      onChange={(e) => updateNestedSettings('osdInfo', 'showPresetPoint', e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="showPreset" className="text-sm text-gray-300">Show Preset Point</label>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                    <input
                      type="checkbox"
                      id="showPTZ"
                      checked={settings.osdInfo.showPTZCoordinates}
                      onChange={(e) => updateNestedSettings('osdInfo', 'showPTZCoordinates', e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="showPTZ" className="text-sm text-gray-300">Show PTZ Coordinates</label>
                  </div>
                  <div className="flex items-center gap-3 p-3 bg-gray-900/50 rounded border border-gray-700">
                    <input
                      type="checkbox"
                      id="showPattern"
                      checked={settings.osdInfo.showPattern}
                      onChange={(e) => updateNestedSettings('osdInfo', 'showPattern', e.target.checked)}
                      className="w-4 h-4 text-red-600 bg-gray-700 border-gray-600 rounded focus:ring-red-500"
                    />
                    <label htmlFor="showPattern" className="text-sm text-gray-300">Show Pattern</label>
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alignment</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateNestedSettings('osdInfo', 'alignment', 'left')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.osdInfo.alignment === 'left'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      <span className={settings.osdInfo.alignment === 'left' ? 'text-red-400' : 'text-white'}>Left Align</span>
                    </button>
                    <button
                      onClick={() => updateNestedSettings('osdInfo', 'alignment', 'right')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.osdInfo.alignment === 'right'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      <span className={settings.osdInfo.alignment === 'right' ? 'text-red-400' : 'text-white'}>Right Align</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">X Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.osdInfo.x}
                      onChange={(e) => updateNestedSettings('osdInfo', 'x', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.osdInfo.x}%</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Y Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.osdInfo.y}
                      onChange={(e) => updateNestedSettings('osdInfo', 'y', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.osdInfo.y}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Text Overlay */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
                Text Overlay
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.textOverlay.enabled}
                  onChange={(e) => updateNestedSettings('textOverlay', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Add custom text overlay to the monitoring screen
            </p>
            
            {settings.textOverlay.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Overlay Text</label>
                  <input
                    type="text"
                    value={settings.textOverlay.text}
                    onChange={(e) => updateNestedSettings('textOverlay', 'text', e.target.value)}
                    placeholder="Enter overlay text"
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white focus:outline-none focus:border-red-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Alignment</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      onClick={() => updateNestedSettings('textOverlay', 'alignment', 'left')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.textOverlay.alignment === 'left'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      <span className={settings.textOverlay.alignment === 'left' ? 'text-red-400' : 'text-white'}>Left Align</span>
                    </button>
                    <button
                      onClick={() => updateNestedSettings('textOverlay', 'alignment', 'right')}
                      className={`p-3 rounded-lg border-2 transition-all ${
                        settings.textOverlay.alignment === 'right'
                          ? 'border-red-500 bg-red-500/10'
                          : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                      }`}
                    >
                      <span className={settings.textOverlay.alignment === 'right' ? 'text-red-400' : 'text-white'}>Right Align</span>
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">X Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.textOverlay.x}
                      onChange={(e) => updateNestedSettings('textOverlay', 'x', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.textOverlay.x}%</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Y Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.textOverlay.y}
                      onChange={(e) => updateNestedSettings('textOverlay', 'y', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.textOverlay.y}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Font Size */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Font Size
            </h3>
            <p className="text-sm text-gray-400 mb-4">
              Set the font size for all video overlay elements
            </p>
            
            <div className="grid grid-cols-3 gap-3">
              {(['small', 'medium', 'large'] as const).map((size) => (
                <button
                  key={size}
                  onClick={() => updateSettings('fontSize', size)}
                  className={`p-4 rounded-lg border-2 transition-all ${
                    settings.fontSize === size
                      ? 'border-red-500 bg-red-500/10'
                      : 'border-gray-600 bg-gray-800/50 hover:border-gray-500'
                  }`}
                >
                  <div className={`font-semibold capitalize ${
                    settings.fontSize === size ? 'text-red-400' : 'text-white'
                  } ${size === 'small' ? 'text-sm' : size === 'large' ? 'text-xl' : 'text-base'}`}>
                    {size}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Picture Overlay */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                Picture Overlay
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.overlayPicture.enabled}
                  onChange={(e) => updateNestedSettings('overlayPicture', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Upload and superimpose a picture on the video surveillance window
            </p>
            
            <div className="p-4 bg-yellow-900/20 border border-yellow-600/50 rounded-lg mb-4">
              <div className="flex items-start gap-2">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p className="text-sm text-yellow-200">
                  <strong>Note:</strong> Geographic/road information in OSD Info and Picture Overlay cannot be enabled at the same time
                </p>
              </div>
            </div>
            
            {settings.overlayPicture.enabled && (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Upload Picture</label>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="w-full px-4 py-2 bg-gray-800 border border-gray-600 rounded-lg text-white file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-red-600 file:text-white hover:file:bg-red-700"
                  />
                </div>
                
                {settings.overlayPicture.imageUrl && (
                  <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
                    <img src={settings.overlayPicture.imageUrl} alt="Overlay" className="max-h-32 mx-auto mb-2" />
                    <p className="text-xs text-gray-400 text-center">Preview of overlay picture</p>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">X Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.overlayPicture.x}
                      onChange={(e) => updateNestedSettings('overlayPicture', 'x', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.overlayPicture.x}%</span>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">Y Position (%)</label>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={settings.overlayPicture.y}
                      onChange={(e) => updateNestedSettings('overlayPicture', 'y', parseInt(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-xs text-gray-400">{settings.overlayPicture.y}%</span>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Advanced Section */}
      {activeSection === 'advanced' && (
        <div className="space-y-4">
          {/* OSD Warning */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                OSD Warning
              </h3>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.osdWarning.enabled}
                  onChange={(e) => updateNestedSettings('osdWarning', 'enabled', e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-red-600"></div>
              </label>
            </div>
            <p className="text-sm text-gray-400">
              Enable or disable OSD warning messages in the monitoring screen
            </p>
          </div>

          {/* GPS Coordinates */}
          <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700 opacity-60">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                GPS Coordinates
                <span className="text-xs bg-gray-700 text-gray-400 px-2 py-1 rounded">Unavailable</span>
              </h3>
              <label className="relative inline-flex items-center opacity-50 cursor-not-allowed">
                <input
                  type="checkbox"
                  checked={settings.gpsCoordinates.enabled}
                  disabled
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-700 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all"></div>
              </label>
            </div>
            <p className="text-sm text-gray-400 mb-4">
              Display latitude and longitude in the monitoring screen
            </p>
            <div className="p-4 bg-gray-900/50 border border-gray-700 rounded">
              <p className="text-sm text-gray-500 text-center italic">
                This function is currently unavailable
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Summary */}
      <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-6 border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          Active Overlay Elements
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          <div className={`p-4 rounded border ${settings.channelTitle.enabled ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${settings.channelTitle.enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm text-gray-300">Channel Title</span>
            </div>
          </div>

          <div className={`p-4 rounded border ${settings.timeTitle.enabled ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${settings.timeTitle.enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm text-gray-300">Time Title</span>
            </div>
          </div>

          <div className={`p-4 rounded border ${settings.osdInfo.enabled ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${settings.osdInfo.enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm text-gray-300">OSD Info</span>
            </div>
          </div>

          <div className={`p-4 rounded border ${settings.textOverlay.enabled ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${settings.textOverlay.enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm text-gray-300">Text Overlay</span>
            </div>
          </div>

          <div className={`p-4 rounded border ${settings.overlayPicture.enabled ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${settings.overlayPicture.enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm text-gray-300">Picture Overlay</span>
            </div>
          </div>

          <div className={`p-4 rounded border ${settings.osdWarning.enabled ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'}`}>
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${settings.osdWarning.enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm text-gray-300">OSD Warning</span>
            </div>
          </div>
        </div>

        <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-700">
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-gray-400">Privacy Masks:</span>
              <span className="ml-2 text-white font-semibold">{settings.privacyMasks.length}</span>
            </div>
            <div>
              <span className="text-gray-400">Font Size:</span>
              <span className="ml-2 text-white font-semibold capitalize">{settings.fontSize}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default VideoOverlay;
