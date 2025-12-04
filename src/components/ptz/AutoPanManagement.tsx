"use client"

import React, { useState } from 'react';

export interface AutoPan {
  speed: number; // 1-100
  direction: 'clockwise' | 'counterclockwise';
  isActive: boolean;
}

interface AutoPanManagementProps {
  autoPan: AutoPan;
  onAutoPanChange: (autoPan: AutoPan) => void;
  onStartAutoPan: () => void;
  onStopAutoPan: () => void;
}

const AutoPanManagement: React.FC<AutoPanManagementProps> = ({
  autoPan,
  onAutoPanChange,
  onStartAutoPan,
  onStopAutoPan,
}) => {
  const [speed, setSpeed] = useState<number>(autoPan.speed);
  const [direction, setDirection] = useState<'clockwise' | 'counterclockwise'>(autoPan.direction);

  const getSpeedLabel = (speed: number): string => {
    if (speed <= 20) return 'Very Slow';
    if (speed <= 40) return 'Slow';
    if (speed <= 60) return 'Medium';
    if (speed <= 80) return 'Fast';
    return 'Very Fast';
  };

  const getSpeedColor = (speed: number): string => {
    if (speed <= 40) return 'text-green-400';
    if (speed <= 70) return 'text-yellow-400';
    return 'text-red-400';
  };

  const handleSpeedChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSpeed = parseInt(e.target.value);
    setSpeed(newSpeed);
    onAutoPanChange({ ...autoPan, speed: newSpeed });
  };

  const handleDirectionChange = (newDirection: 'clockwise' | 'counterclockwise') => {
    setDirection(newDirection);
    onAutoPanChange({ ...autoPan, direction: newDirection });
  };

  const handleStart = () => {
    onStartAutoPan();
  };

  const handleStop = () => {
    onStopAutoPan();
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          Horizontal Rotation (Auto Pan)
        </h3>
        {autoPan.isActive && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Active</span>
          </div>
        )}
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p><strong>Horizontal Rotation:</strong></p>
            <p className="text-blue-200/90 mt-1">
              Camera makes a continuous 360° horizontal rotation at the set speed and direction.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-5">
        {/* Step 2: PTZ Speed */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 2: Set PTZ Speed
          </label>
          
          <div className="space-y-3">
            {/* Speed Slider */}
            <div className="relative">
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={handleSpeedChange}
                disabled={autoPan.isActive}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600 disabled:opacity-50 disabled:cursor-not-allowed"
                style={{
                  background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${speed}%, #374151 ${speed}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>1</span>
                <span>25</span>
                <span>50</span>
                <span>75</span>
                <span>100</span>
              </div>
            </div>

            {/* Speed Display */}
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Speed:</span>
                <div className="flex items-center gap-2">
                  <span className="text-white font-mono font-bold text-lg">{speed}</span>
                  <span className={`font-medium text-sm ${getSpeedColor(speed)}`}>
                    ({getSpeedLabel(speed)})
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 3: Direction */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 3: Select Direction
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Clockwise */}
            <button
              onClick={() => handleDirectionChange('clockwise')}
              disabled={autoPan.isActive}
              className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                direction === 'clockwise'
                  ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
              } ${autoPan.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Clockwise</span>
                <span className="text-xs text-gray-400">→</span>
              </div>
              {direction === 'clockwise' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </button>

            {/* Counter Clockwise */}
            <button
              onClick={() => handleDirectionChange('counterclockwise')}
              disabled={autoPan.isActive}
              className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                direction === 'counterclockwise'
                  ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
              } ${autoPan.isActive ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <div className="flex flex-col items-center gap-2">
                <svg className="w-8 h-8 transform scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Counter Clockwise</span>
                <span className="text-xs text-gray-400">←</span>
              </div>
              {direction === 'counterclockwise' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </button>
          </div>
        </div>

        {/* Step 4-5: Start/Stop Controls */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 4-5: Control Auto Pan
          </label>
          
          {!autoPan.isActive ? (
            <button
              onClick={handleStart}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Auto Pan
            </button>
          ) : (
            <button
              onClick={handleStop}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-lg border border-orange-500 transition-all duration-200 shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Auto Pan
            </button>
          )}
        </div>

        {/* Current Configuration Display */}
        {!autoPan.isActive && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Rotation Speed:</span>
                <span className={`font-medium ${getSpeedColor(speed)}`}>
                  {speed} ({getSpeedLabel(speed)})
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Direction:</span>
                <span className="text-white font-medium capitalize flex items-center gap-2">
                  {direction === 'clockwise' ? (
                    <>
                      Clockwise
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </>
                  ) : (
                    <>
                      Counter Clockwise
                      <svg className="w-4 h-4 transform scale-x-[-1]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </>
                  )}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Active Auto Pan Status */}
      {autoPan.isActive && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
            <div className="text-sm text-green-300">
              <div className="flex items-center gap-2">
                <strong>Auto Pan is Active</strong>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-green-200/90 mt-1">
                Camera is rotating {direction === 'clockwise' ? 'clockwise' : 'counter-clockwise'} at speed {speed} ({getSpeedLabel(speed)})
              </p>
              <p className="text-yellow-300 text-xs mt-2 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                Manual PTZ operation will stop the auto pan
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoPanManagement;
