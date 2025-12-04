"use client"

import React, { useState } from 'react';

export interface PTZLimit {
  verticalLimit: {
    enabled: boolean;
    upLimit: number | null;
    downLimit: number | null;
  };
  horizontalLimit: {
    enabled: boolean;
    leftLimit: number | null;
    rightLimit: number | null;
  };
  zeroPointCalibration: 'off' | 'everyday';
}

interface PTZLimitManagementProps {
  ptzLimit: PTZLimit;
  onPTZLimitChange: (ptzLimit: PTZLimit) => void;
  currentPosition: {
    pan: number;
    tilt: number;
  };
  onSetPosition: () => void;
}

const PTZLimitManagement: React.FC<PTZLimitManagementProps> = ({
  ptzLimit,
  onPTZLimitChange,
  currentPosition,
  onSetPosition,
}) => {
  const [verticalEnabled, setVerticalEnabled] = useState<boolean>(ptzLimit.verticalLimit.enabled);
  const [horizontalEnabled, setHorizontalEnabled] = useState<boolean>(ptzLimit.horizontalLimit.enabled);
  const [zeroPointCalibration, setZeroPointCalibration] = useState<'off' | 'everyday'>(ptzLimit.zeroPointCalibration);

  const handleSetUpLimit = () => {
    onSetPosition();
    const newPtzLimit = {
      ...ptzLimit,
      verticalLimit: {
        ...ptzLimit.verticalLimit,
        upLimit: currentPosition.tilt,
      },
    };
    onPTZLimitChange(newPtzLimit);
    alert(`Up Limit Set!\nTilt Position: ${currentPosition.tilt}°`);
  };

  const handleSetDownLimit = () => {
    onSetPosition();
    const newPtzLimit = {
      ...ptzLimit,
      verticalLimit: {
        ...ptzLimit.verticalLimit,
        downLimit: currentPosition.tilt,
      },
    };
    onPTZLimitChange(newPtzLimit);
    alert(`Down Limit Set!\nTilt Position: ${currentPosition.tilt}°`);
  };

  const handleSetLeftLimit = () => {
    onSetPosition();
    const newPtzLimit = {
      ...ptzLimit,
      horizontalLimit: {
        ...ptzLimit.horizontalLimit,
        leftLimit: currentPosition.pan,
      },
    };
    onPTZLimitChange(newPtzLimit);
    alert(`Left Limit Set!\nPan Position: ${currentPosition.pan}°`);
  };

  const handleSetRightLimit = () => {
    onSetPosition();
    const newPtzLimit = {
      ...ptzLimit,
      horizontalLimit: {
        ...ptzLimit.horizontalLimit,
        rightLimit: currentPosition.pan,
      },
    };
    onPTZLimitChange(newPtzLimit);
    alert(`Right Limit Set!\nPan Position: ${currentPosition.pan}°`);
  };

  const handleVerticalLimitToggle = (enabled: boolean) => {
    setVerticalEnabled(enabled);
    const newPtzLimit = {
      ...ptzLimit,
      verticalLimit: {
        ...ptzLimit.verticalLimit,
        enabled,
      },
    };
    onPTZLimitChange(newPtzLimit);
  };

  const handleHorizontalLimitToggle = (enabled: boolean) => {
    setHorizontalEnabled(enabled);
    const newPtzLimit = {
      ...ptzLimit,
      horizontalLimit: {
        ...ptzLimit.horizontalLimit,
        enabled,
      },
    };
    onPTZLimitChange(newPtzLimit);
  };

  const handleZeroPointCalibrationChange = (value: 'off' | 'everyday') => {
    setZeroPointCalibration(value);
    const newPtzLimit = {
      ...ptzLimit,
      zeroPointCalibration: value,
    };
    onPTZLimitChange(newPtzLimit);
  };

  const getVerticalRange = (): string | null => {
    const { upLimit, downLimit } = ptzLimit.verticalLimit;
    if (upLimit !== null && downLimit !== null) {
      return `${downLimit}° to ${upLimit}° (${Math.abs(upLimit - downLimit)}° range)`;
    }
    return null;
  };

  const getHorizontalRange = (): string | null => {
    const { leftLimit, rightLimit } = ptzLimit.horizontalLimit;
    if (leftLimit !== null && rightLimit !== null) {
      return `${leftLimit}° to ${rightLimit}° (${Math.abs(rightLimit - leftLimit)}° range)`;
    }
    return null;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          PTZ Orientation Limit
        </h3>
        {(verticalEnabled || horizontalEnabled) && (
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
            <p><strong>PTZ Orientation Limit:</strong></p>
            <p className="text-blue-200/90 mt-1">
              Set movement boundaries to restrict camera rotation within a defined area. Camera will only move within the set vertical and horizontal limits.
            </p>
          </div>
        </div>
      </div>

      {/* Current Position Display */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4">
        <h4 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
          <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Step 2: Current Camera Position
        </h4>
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Pan (Left/Right):</span>
              <span className="text-white font-mono font-bold">{currentPosition.pan}°</span>
            </div>
          </div>
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <div className="flex items-center justify-between">
              <span className="text-gray-400 text-sm">Tilt (Up/Down):</span>
              <span className="text-white font-mono font-bold">{currentPosition.tilt}°</span>
            </div>
          </div>
        </div>
        <p className="text-gray-400 text-xs mt-2">
          Use PTZ controls to adjust camera position, then set the limits below.
        </p>
      </div>

      {/* Configuration */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-5">
        {/* Step 3: Vertical Limits (Up/Down Line) */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 3: Set Up/Down Line (Vertical Borders)
          </label>
          
          <div className="space-y-3">
            {/* Up Limit */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSetUpLimit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg border border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                </svg>
                Set Up Limit
                {ptzLimit.verticalLimit.upLimit !== null && (
                  <span className="ml-2 bg-blue-800/50 px-2 py-0.5 rounded text-xs">
                    {ptzLimit.verticalLimit.upLimit}°
                  </span>
                )}
              </button>
              {ptzLimit.verticalLimit.upLimit !== null && (
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-blue-300"></div>
              )}
            </div>

            {/* Down Limit */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSetDownLimit}
                className="flex-1 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg border border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
                Set Down Limit
                {ptzLimit.verticalLimit.downLimit !== null && (
                  <span className="ml-2 bg-blue-800/50 px-2 py-0.5 rounded text-xs">
                    {ptzLimit.verticalLimit.downLimit}°
                  </span>
                )}
              </button>
              {ptzLimit.verticalLimit.downLimit !== null && (
                <div className="w-3 h-3 bg-blue-500 rounded-full border-2 border-blue-300"></div>
              )}
            </div>

            {/* Vertical Range Display */}
            {getVerticalRange() && (
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-blue-300 text-sm font-medium">Vertical Range:</span>
                  <span className="text-blue-200 font-mono text-sm">{getVerticalRange()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Left/Right Limits */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 3: Set Left/Right (Horizontal Borders)
          </label>
          
          <div className="space-y-3">
            {/* Left Limit */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSetLeftLimit}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Set Left Limit
                {ptzLimit.horizontalLimit.leftLimit !== null && (
                  <span className="ml-2 bg-green-800/50 px-2 py-0.5 rounded text-xs">
                    {ptzLimit.horizontalLimit.leftLimit}°
                  </span>
                )}
              </button>
              {ptzLimit.horizontalLimit.leftLimit !== null && (
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-300"></div>
              )}
            </div>

            {/* Right Limit */}
            <div className="flex items-center gap-3">
              <button
                onClick={handleSetRightLimit}
                className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
                Set Right Limit
                {ptzLimit.horizontalLimit.rightLimit !== null && (
                  <span className="ml-2 bg-green-800/50 px-2 py-0.5 rounded text-xs">
                    {ptzLimit.horizontalLimit.rightLimit}°
                  </span>
                )}
              </button>
              {ptzLimit.horizontalLimit.rightLimit !== null && (
                <div className="w-3 h-3 bg-green-500 rounded-full border-2 border-green-300"></div>
              )}
            </div>

            {/* Horizontal Range Display */}
            {getHorizontalRange() && (
              <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <span className="text-green-300 text-sm font-medium">Horizontal Range:</span>
                  <span className="text-green-200 font-mono text-sm">{getHorizontalRange()}</span>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Step 4: Enable Limits */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 4: Enable Orientation Limits
          </label>
          
          <div className="space-y-3">
            {/* Vertical Limit Toggle */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                  </svg>
                  <span className="text-white font-medium">Vertical Limit</span>
                </div>
                <button
                  onClick={() => handleVerticalLimitToggle(!verticalEnabled)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    verticalEnabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      verticalEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {verticalEnabled && (
                <div className="text-sm text-green-300 flex items-center gap-1 mt-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">
                    Vertical movement restricted
                    {getVerticalRange() && `: ${getVerticalRange()}`}
                  </span>
                </div>
              )}
            </div>

            {/* Horizontal Limit Toggle */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span className="text-white font-medium">Horizontal Limit</span>
                </div>
                <button
                  onClick={() => handleHorizontalLimitToggle(!horizontalEnabled)}
                  className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors ${
                    horizontalEnabled ? 'bg-green-600' : 'bg-gray-600'
                  }`}
                >
                  <span
                    className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${
                      horizontalEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
              {horizontalEnabled && (
                <div className="text-sm text-green-300 flex items-center gap-1 mt-2">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-xs">
                    Horizontal movement restricted
                    {getHorizontalRange() && `: ${getHorizontalRange()}`}
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Zero Point Auto Calibration */}
        <div>
          <label className="flex items-center gap-2 text-white font-medium mb-3 text-sm">
            <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            Zero Point Auto Calibration
          </label>
          
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 mb-3">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-yellow-300">
                <strong>Note:</strong>
                <p className="text-yellow-200/90 mt-1">
                  The PTZ will perform automatic calibration of the original point. Choose Off (default) or Everyday.
                </p>
              </div>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => handleZeroPointCalibrationChange('off')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                zeroPointCalibration === 'off'
                  ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Off
              </div>
            </button>
            <button
              onClick={() => handleZeroPointCalibrationChange('everyday')}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                zeroPointCalibration === 'everyday'
                  ? 'bg-gradient-to-br from-green-600 to-green-700 border-green-500 text-white shadow-lg'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z" clipRule="evenodd" />
                </svg>
                Everyday
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Active Limits Summary */}
      {(verticalEnabled || horizontalEnabled) && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <div className="text-sm text-green-300">
              <strong>PTZ Limits Active</strong>
              <div className="space-y-1 mt-2 text-green-200/90">
                {verticalEnabled && (
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Vertical Limit: {getVerticalRange() || 'Set both up and down limits'}
                  </p>
                )}
                {horizontalEnabled && (
                  <p className="flex items-center gap-2">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                    Horizontal Limit: {getHorizontalRange() || 'Set both left and right limits'}
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTZLimitManagement;
