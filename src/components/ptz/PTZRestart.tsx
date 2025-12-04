"use client"

import React, { useState } from 'react';

interface PTZRestartProps {
  onRestart: () => void;
}

const PTZRestart: React.FC<PTZRestartProps> = ({ onRestart }) => {
  const [isRestarting, setIsRestarting] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const handleRestart = () => {
    if (confirm('Are you sure you want to restart the PTZ?\n\nThe PTZ will be unavailable during the restart process (approximately 30 seconds).')) {
      setIsRestarting(true);
      setCountdown(30);
      
      // Countdown timer
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRestarting(false);
            alert('PTZ Restart Complete!\n\nThe PTZ has been successfully restarted and is now operational.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Call the restart handler
      onRestart();
      
      // Show initial confirmation
      alert('PTZ Restart Initiated!\n\nThe PTZ is now restarting. Please wait approximately 30 seconds.');
    }
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
          </svg>
          PTZ Restart
        </h3>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p><strong>PTZ Restart Function:</strong></p>
            <p className="text-blue-200/90 mt-1">
              This function will restart the PTZ system. The PTZ will be temporarily unavailable during the restart process (approximately 30 seconds).
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
        {!isRestarting ? (
          <div className="space-y-6">
            {/* PTZ Status */}
            <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-green-300 font-medium text-sm">PTZ Status: Operational</h4>
                  <p className="text-green-200/80 text-xs mt-1">
                    The PTZ system is currently running normally.
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>

            {/* Restart Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <h5 className="text-white font-medium text-sm">Restart Duration</h5>
                    <p className="text-gray-400 text-xs mt-1">
                      Approximately 30 seconds
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
                <div className="flex items-start gap-3">
                  <svg className="w-5 h-5 text-orange-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <h5 className="text-white font-medium text-sm">Service Interruption</h5>
                    <p className="text-gray-400 text-xs mt-1">
                      PTZ will be temporarily unavailable
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Warning Notice */}
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
              <div className="flex gap-3">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-300">
                  <strong>Important Notice:</strong>
                  <ul className="list-disc list-inside text-yellow-200/90 mt-2 space-y-1">
                    <li>PTZ control will be disabled during restart</li>
                    <li>Live video feed may be interrupted</li>
                    <li>Any active PTZ operations will be stopped</li>
                    <li>Wait for restart to complete before using PTZ</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* When to Restart */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h5 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                When to Restart PTZ:
              </h5>
              <ul className="text-gray-400 text-xs space-y-1.5 ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>PTZ is not responding to commands</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>Movement is erratic or inconsistent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>After firmware updates or configuration changes</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-red-500 mt-0.5">•</span>
                  <span>To resolve temporary PTZ malfunctions</span>
                </li>
              </ul>
            </div>

            {/* Step 2: Restart Button */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm">
                Step 2: PTZ Restart
              </label>
              
              <button
                onClick={handleRestart}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-4 px-6 rounded-lg border border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-3 font-medium text-lg group"
              >
                <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restart PTZ System
              </button>
              
              <p className="text-gray-400 text-xs text-center mt-3">
                Click the button above to restart the PTZ system
              </p>
            </div>
          </div>
        ) : (
          // Restarting State
          <div className="py-8">
            <div className="text-center space-y-6">
              {/* Restart Animation */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="w-24 h-24 bg-red-500/20 rounded-full flex items-center justify-center animate-pulse">
                    <svg className="w-12 h-12 text-red-400 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </div>
                  <div className="absolute inset-0 border-4 border-red-500/30 rounded-full animate-ping"></div>
                </div>
              </div>

              {/* Status Text */}
              <div>
                <h4 className="text-white text-xl font-bold mb-2">PTZ Restarting...</h4>
                <p className="text-gray-400 text-sm">Please wait while the PTZ system restarts</p>
              </div>

              {/* Countdown */}
              <div className="bg-gray-900/50 rounded-lg p-6 border border-gray-700 inline-block mx-auto">
                <div className="flex items-center gap-4">
                  <svg className="w-6 h-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <p className="text-gray-400 text-xs mb-1">Time Remaining</p>
                    <div className="text-4xl font-bold text-red-500 font-mono tabular-nums">
                      {countdown}s
                    </div>
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="max-w-md mx-auto">
                <div className="bg-gray-700 rounded-full h-2 overflow-hidden">
                  <div 
                    className="bg-gradient-to-r from-red-500 to-red-600 h-full transition-all duration-1000 ease-linear"
                    style={{ width: `${((30 - countdown) / 30) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-yellow-300">
                    Do not turn off the power or disconnect the camera during restart.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Additional Information */}
      {!isRestarting && (
        <div className="bg-gray-800/30 border border-gray-700 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-gray-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
            </svg>
            <div className="text-sm text-gray-400">
              <p className="mb-2"><strong className="text-gray-300">Tip:</strong></p>
              <p className="text-gray-500">
                If PTZ problems persist after restart, check the camera settings, network connection, and power supply. Contact technical support if issues continue.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PTZRestart;
