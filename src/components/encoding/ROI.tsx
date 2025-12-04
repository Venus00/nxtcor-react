"use client"

import type React from "react"
import { useState } from "react"

export interface ROIRegion {
  id: number;
  x: number;
  y: number;
  width: number;
  height: number;
  quality: number; // 1-10
}

export interface ROIData {
  enabled: boolean;
  regions: ROIRegion[];
}

interface ROIProps {
  settings: ROIData;
  onSettingsChange: (settings: ROIData) => void;
}

const ROI: React.FC<ROIProps> = ({ settings, onSettingsChange }) => {
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{ x: number; y: number; width: number; height: number } | null>(null);

  const MAX_REGIONS = 4;

  const updateSettings = (key: keyof ROIData, value: any) => {
    onSettingsChange({
      ...settings,
      [key]: value,
    });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!settings.enabled || settings.regions.length >= MAX_REGIONS) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentDraw({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const width = Math.abs(currentX - drawStart.x);
    const height = Math.abs(currentY - drawStart.y);
    const x = Math.min(currentX, drawStart.x);
    const y = Math.min(currentY, drawStart.y);

    setCurrentDraw({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDraw || currentDraw.width < 2 || currentDraw.height < 2) {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDraw(null);
      return;
    }

    const newRegion: ROIRegion = {
      id: Date.now(),
      x: currentDraw.x,
      y: currentDraw.y,
      width: currentDraw.width,
      height: currentDraw.height,
      quality: 5, // Default quality
    };

    updateSettings('regions', [...settings.regions, newRegion]);
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraw(null);
    setSelectedRegionId(newRegion.id);
  };

  const handleDeleteRegion = (id: number) => {
    updateSettings('regions', settings.regions.filter(region => region.id !== id));
    if (selectedRegionId === id) {
      setSelectedRegionId(null);
    }
  };

  const handleClearAll = () => {
    updateSettings('regions', []);
    setSelectedRegionId(null);
  };

  const handleQualityChange = (id: number, quality: number) => {
    updateSettings('regions', settings.regions.map(region =>
      region.id === id ? { ...region, quality } : region
    ));
  };

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    handleDeleteRegion(id);
  };

  const getQualityColor = (quality: number) => {
    if (quality <= 3) return 'text-red-400';
    if (quality <= 6) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getQualityLabel = (quality: number) => {
    if (quality <= 2) return 'Very Low';
    if (quality <= 4) return 'Low';
    if (quality <= 6) return 'Medium';
    if (quality <= 8) return 'High';
    return 'Very High';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4">
        <h2 className="text-2xl font-bold text-white mb-2">ROI (Region of Interest) Configuration</h2>
        <p className="text-gray-400 text-sm">
          Define up to 4 regions with different encoding quality levels to optimize bandwidth and storage
        </p>
      </div>

      {/* Enable ROI */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Enable ROI Function
            </h3>
            <p className="text-sm text-gray-400">
              Activate region-based encoding to prioritize important areas with higher quality
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>

      {/* Drawing Area */}
      {settings.enabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
              Region Selection
              <span className="text-sm text-gray-400 font-normal">
                ({settings.regions.length}/{MAX_REGIONS} regions)
              </span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                disabled={settings.regions.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-200 space-y-1">
                <p><strong>How to use:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Press and hold left mouse button to draw a region (up to {MAX_REGIONS} regions)</li>
                  <li>Click the "Delete" button or right-click on a region to remove it</li>
                  <li>Click "Clear All" to remove all regions at once</li>
                  <li>Adjust image quality for each region using the sliders below</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Video Preview Area with ROI Drawing */}
          <div 
            className={`relative bg-gray-900 rounded-lg border-2 aspect-video overflow-hidden ${
              settings.regions.length >= MAX_REGIONS 
                ? 'border-orange-600 cursor-not-allowed' 
                : 'border-gray-600 cursor-crosshair'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDrawing) {
                handleMouseUp();
              }
            }}
          >
            {/* Background placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">
                  {settings.regions.length >= MAX_REGIONS 
                    ? 'Maximum regions reached' 
                    : 'Click and drag to draw ROI regions'}
                </p>
              </div>
            </div>

            {/* Existing ROI Regions */}
            {settings.regions.map((region, index) => (
              <div
                key={region.id}
                onClick={() => setSelectedRegionId(region.id)}
                onContextMenu={(e) => handleContextMenu(e, region.id)}
                className={`absolute border-3 group cursor-pointer transition-all ${
                  selectedRegionId === region.id
                    ? 'border-red-500 bg-red-500/20 z-10'
                    : 'border-green-500 bg-green-500/10 hover:bg-green-500/20'
                }`}
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`,
                }}
              >
                {/* Region Label */}
                <div className={`absolute -top-6 left-0 px-2 py-1 rounded text-xs font-semibold ${
                  selectedRegionId === region.id ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  ROI {index + 1}
                </div>

                {/* Quality Badge */}
                <div className={`absolute -bottom-6 left-0 px-2 py-1 rounded text-xs font-semibold ${
                  selectedRegionId === region.id ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  Q: {region.quality}/10
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRegion(region.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>

                {/* Resize Handles */}
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity">
                  <div className="absolute top-0 left-0 w-2 h-2 bg-white border border-gray-800 rounded-full -translate-x-1 -translate-y-1"></div>
                  <div className="absolute top-0 right-0 w-2 h-2 bg-white border border-gray-800 rounded-full translate-x-1 -translate-y-1"></div>
                  <div className="absolute bottom-0 left-0 w-2 h-2 bg-white border border-gray-800 rounded-full -translate-x-1 translate-y-1"></div>
                  <div className="absolute bottom-0 right-0 w-2 h-2 bg-white border border-gray-800 rounded-full translate-x-1 translate-y-1"></div>
                </div>
              </div>
            ))}

            {/* Current Drawing Region */}
            {isDrawing && currentDraw && currentDraw.width > 0 && currentDraw.height > 0 && (
              <div
                className="absolute border-2 border-dashed border-blue-400 bg-blue-400/10"
                style={{
                  left: `${currentDraw.x}%`,
                  top: `${currentDraw.y}%`,
                  width: `${currentDraw.width}%`,
                  height: `${currentDraw.height}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-blue-400 text-white px-2 py-1 rounded text-xs font-semibold">
                  Drawing...
                </div>
              </div>
            )}

            {/* Max Regions Warning Overlay */}
            {settings.regions.length >= MAX_REGIONS && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <div className="bg-orange-600 text-white px-6 py-3 rounded-lg shadow-lg">
                  <p className="font-semibold">Maximum of {MAX_REGIONS} regions reached</p>
                  <p className="text-sm mt-1">Delete a region to add a new one</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Region Quality Settings */}
      {settings.enabled && settings.regions.length > 0 && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Region Image Quality Settings
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Adjust encoding quality for each ROI region (higher quality = better image but larger file size)
          </p>

          <div className="space-y-4">
            {settings.regions.map((region, index) => (
              <div
                key={region.id}
                onClick={() => setSelectedRegionId(region.id)}
                className={`p-5 rounded-lg border-2 transition-all cursor-pointer ${
                  selectedRegionId === region.id
                    ? 'border-red-500 bg-red-500/10'
                    : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                }`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white ${
                      selectedRegionId === region.id ? 'bg-red-500' : 'bg-green-500'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <h4 className="font-semibold text-white">ROI Region {index + 1}</h4>
                      <p className="text-xs text-gray-400">
                        Position: ({region.x.toFixed(1)}%, {region.y.toFixed(1)}%) • 
                        Size: {region.width.toFixed(1)}% × {region.height.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteRegion(region.id);
                    }}
                    className="px-3 py-1.5 bg-red-600 text-white text-sm rounded-lg hover:bg-red-700 transition-colors flex items-center gap-2"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                    Delete
                  </button>
                </div>

                {/* Quality Slider */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Image Quality</label>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getQualityColor(region.quality)}`}>
                        {getQualityLabel(region.quality)}
                      </span>
                      <span className="text-sm text-gray-400">({region.quality}/10)</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="10"
                      value={region.quality}
                      onChange={(e) => handleQualityChange(region.id, parseInt(e.target.value))}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${(region.quality - 1) * 11.11}%, #374151 ${(region.quality - 1) * 11.11}%, #374151 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>Medium</span>
                      <span>High</span>
                    </div>
                  </div>

                  {/* Quality Visual Indicator */}
                  <div className="flex gap-1">
                    {Array.from({ length: 10 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded ${
                          i < region.quality
                            ? region.quality <= 3
                              ? 'bg-red-500'
                              : region.quality <= 6
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Information & Tips */}
      {settings.enabled && (
        <div className="bg-gradient-to-br from-gray-800/40 to-gray-900/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            ROI Configuration Tips
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-green-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Best Practices</h4>
                  <p className="text-xs text-gray-400">
                    Define ROI regions for critical areas (entrances, cash registers, faces) with higher quality, 
                    while background areas use standard encoding to save bandwidth.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Performance Impact</h4>
                  <p className="text-xs text-gray-400">
                    Higher quality settings increase bitrate and storage requirements. 
                    Use quality 7-10 only for regions requiring detailed analysis.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Region Overlap</h4>
                  <p className="text-xs text-gray-400">
                    Avoid overlapping regions when possible. If regions overlap, 
                    the higher quality setting will be applied to the overlapped area.
                  </p>
                </div>
              </div>
            </div>

            <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
              <div className="flex items-start gap-3">
                <svg className="w-5 h-5 text-purple-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                </svg>
                <div>
                  <h4 className="text-sm font-semibold text-white mb-1">Dynamic Adjustment</h4>
                  <p className="text-xs text-gray-400">
                    You can modify ROI regions and quality settings at any time. 
                    Changes take effect immediately after saving.
                  </p>
                </div>
              </div>
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
          Configuration Summary
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className={`p-4 rounded border ${
            settings.enabled ? 'bg-green-900/20 border-green-600/50' : 'bg-gray-900/50 border-gray-700'
          }`}>
            <div className="flex items-center gap-3 mb-2">
              <div className={`w-3 h-3 rounded-full ${settings.enabled ? 'bg-green-500' : 'bg-gray-600'}`}></div>
              <span className="text-sm font-semibold text-gray-300">ROI Status</span>
            </div>
            <p className={`text-lg font-bold ${settings.enabled ? 'text-green-400' : 'text-gray-500'}`}>
              {settings.enabled ? 'Enabled' : 'Disabled'}
            </p>
          </div>

          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5z" />
              </svg>
              <span className="text-sm font-semibold text-gray-300">Active Regions</span>
            </div>
            <p className="text-lg font-bold text-white">
              {settings.regions.length} / {MAX_REGIONS}
            </p>
          </div>

          <div className="p-4 bg-gray-900/50 rounded border border-gray-700">
            <div className="flex items-center gap-3 mb-2">
              <svg className="w-4 h-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
              <span className="text-sm font-semibold text-gray-300">Avg. Quality</span>
            </div>
            <p className="text-lg font-bold text-white">
              {settings.regions.length > 0
                ? (settings.regions.reduce((sum, r) => sum + r.quality, 0) / settings.regions.length).toFixed(1)
                : '0'} / 10
            </p>
          </div>
        </div>

        {settings.enabled && settings.regions.length > 0 && (
          <div className="mt-4 p-4 bg-gray-900/50 rounded border border-gray-700">
            <h4 className="text-sm font-semibold text-gray-300 mb-2">Region Details</h4>
            <div className="space-y-2">
              {settings.regions.map((region, index) => (
                <div key={region.id} className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">
                    ROI {index + 1}: {region.width.toFixed(0)}% × {region.height.toFixed(0)}%
                  </span>
                  <span className={`font-semibold ${getQualityColor(region.quality)}`}>
                    Quality {region.quality}/10
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ROI;
