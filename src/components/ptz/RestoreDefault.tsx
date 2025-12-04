"use client"

import React, { useState } from 'react';

interface RestoreDefaultProps {
  onRestoreDefault: () => void;
}

const RestoreDefault: React.FC<RestoreDefaultProps> = ({ onRestoreDefault }) => {
  const [isRestoring, setIsRestoring] = useState<boolean>(false);
  const [countdown, setCountdown] = useState<number>(0);

  const handleRestoreDefault = () => {
    if (confirm('Are you sure you want to restore PTZ default settings?\n\nThis will reset ALL PTZ configurations including:\n- All saved presets\n- All tours\n- All auto scans\n- All patterns\n- PTZ limits\n- Scheduled tasks\n- Idle actions\n- Speed settings\n\nThis action cannot be undone!')) {
      setIsRestoring(true);
      setCountdown(10);
      
      // Countdown timer
      const interval = setInterval(() => {
        setCountdown(prev => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsRestoring(false);
            alert('PTZ Default Settings Restored!\n\nAll PTZ configurations have been reset to factory defaults.');
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      // Call the restore handler
      onRestoreDefault();
      
      // Show initial confirmation
      alert('Restoring PTZ Default Settings...\n\nPlease wait while the system resets all PTZ configurations.');
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
          Restore Default
        </h3>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p><strong>Restore Default Function:</strong></p>
            <p className="text-blue-200/90 mt-1">
              This function will restore all PTZ settings to factory defaults. All custom configurations will be permanently deleted.
            </p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
        {!isRestoring ? (
          <div className="space-y-6">
            {/* Warning Banner */}
            <div className="bg-red-500/10 border-2 border-red-500/50 rounded-lg p-4">
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center">
                    <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                    </svg>
                  </div>
                </div>
                <div className="flex-1">
                  <h4 className="text-red-300 font-bold text-sm">⚠️ CRITICAL WARNING</h4>
                  <p className="text-red-200/80 text-xs mt-1">
                    This action will permanently delete ALL custom PTZ configurations and cannot be undone!
                  </p>
                </div>
              </div>
            </div>

            {/* What Will Be Reset */}
            <div className="bg-gray-900/50 rounded-lg p-5 border border-gray-700">
              <h5 className="text-white font-medium text-sm mb-4 flex items-center gap-2">
                <svg className="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                The following settings will be reset to factory defaults:
              </h5>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">All Preset Points</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">All Tours</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">All Auto Scans</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">All Patterns</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Auto Pan Settings</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">Idle Action Configuration</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">PTZ Limits & Boundaries</span>
                </div>
                
                <div className="flex items-start gap-2 text-sm">
                  <svg className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span className="text-gray-300">All Scheduled Tasks</span>
                </div>
              </div>
            </div>

            {/* Additional Warnings */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-yellow-300">
                    <strong>No Backup:</strong>
                    <p className="text-yellow-200/90 mt-1">
                      There is no automatic backup. Make note of important settings before proceeding.
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-orange-500/10 border border-orange-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg className="w-5 h-5 text-orange-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="text-sm text-orange-300">
                    <strong>Cannot Undo:</strong>
                    <p className="text-orange-200/90 mt-1">
                      This action is permanent and cannot be reversed once completed.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* When to Use This Function */}
            <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
              <h5 className="text-white font-medium text-sm mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                When to Restore Defaults:
              </h5>
              <ul className="text-gray-400 text-xs space-y-1.5 ml-6">
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>PTZ configuration is corrupted or behaving unexpectedly</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Starting fresh with a new installation or setup</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Troubleshooting persistent PTZ issues</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Before transferring camera to a different location</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-500 mt-0.5">•</span>
                  <span>Clearing all test configurations before deployment</span>
                </li>
              </ul>
            </div>

            {/* Step 2: Restore Default Button */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm">
                Step 2: Restore Default Settings
              </label>
              
              <button
                onClick={handleRestoreDefault}
                className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white py-4 px-6 rounded-lg border-2 border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-3 font-bold text-lg group"
              >
                <svg className="w-6 h-6 group-hover:rotate-180 transition-transform duration-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Restore PTZ Default Settings
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </button>
              
              <p className="text-red-400 text-xs text-center mt-3 font-medium">
                ⚠️ This action will permanently delete all PTZ configurations
              </p>
            </div>
          </div>
        ) : (
          // Restoring State
          <div className="py-8">
            <div className="text-center space-y-6">
              {/* Restore Animation */}
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
                <h4 className="text-white text-xl font-bold mb-2">Restoring Default Settings...</h4>
                <p className="text-gray-400 text-sm">Resetting all PTZ configurations to factory defaults</p>
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
                    style={{ width: `${((10 - countdown) / 10) * 100}%` }}
                  ></div>
                </div>
              </div>

              {/* Deleting Items List */}
              <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700 max-w-md mx-auto">
                <p className="text-gray-400 text-sm mb-3">Clearing configurations:</p>
                <div className="space-y-1 text-xs text-gray-500">
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse"></div>
                    <span>Deleting presets, tours, scans...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                    <span>Clearing patterns and limits...</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
                    <span>Resetting scheduled tasks...</span>
                  </div>
                </div>
              </div>

              {/* Warning */}
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4 max-w-md mx-auto">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-sm text-yellow-300">
                    Please do not navigate away or close this page during the restore process.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bottom Notice */}
      {!isRestoring && (
        <div className="bg-red-500/5 border border-red-500/20 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-red-300">
              <p className="font-medium mb-1">IMPORTANT REMINDER:</p>
              <p className="text-red-200/90 text-xs">
                After restoring defaults, you will need to reconfigure all PTZ settings manually. Consider documenting your current settings before proceeding if you may need to recreate them later.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RestoreDefault;
