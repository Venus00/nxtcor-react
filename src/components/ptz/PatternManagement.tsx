"use client"

import React, { useState } from 'react';

export interface Pattern {
  id: number;
  patternNo: number;
  isRecorded: boolean;
  recordingStartTime: Date | null;
  recordingDuration: number; // in seconds
  movements: string[]; // Array of recorded movements
  isActive: boolean;
}

interface PatternManagementProps {
  patterns: Pattern[];
  onPatternsChange: (patterns: Pattern[]) => void;
  onStartPattern: (pattern: Pattern) => void;
  onStopPattern: () => void;
  activePatternId: number | null;
  isRecording: boolean;
  onStartRecording: (patternNo: number) => void;
  onStopRecording: () => void;
  recordingPatternNo: number | null;
}

const PatternManagement: React.FC<PatternManagementProps> = ({
  patterns,
  onPatternsChange,
  onStartPattern,
  onStopPattern,
  activePatternId,
  isRecording,
  onStartRecording,
  onStopRecording,
  recordingPatternNo,
}) => {
  const [selectedPatternNo, setSelectedPatternNo] = useState<number>(1);

  const currentPattern = patterns.find(p => p.patternNo === selectedPatternNo) || null;
  const activePattern = patterns.find(p => p.id === activePatternId);

  const handlePatternNoChange = (patternNo: number) => {
    setSelectedPatternNo(patternNo);
  };

  const handleStartRecording = () => {
    onStartRecording(selectedPatternNo);
  };

  const handleStopRecording = () => {
    onStopRecording();
  };

  const handleStartPattern = () => {
    if (!currentPattern || !currentPattern.isRecorded) {
      alert('Please record a pattern first!');
      return;
    }
    
    onStartPattern(currentPattern);
  };

  const handleDeletePattern = (patternNo: number) => {
    const pattern = patterns.find(p => p.patternNo === patternNo);
    if (pattern && activePatternId === pattern.id) {
      onStopPattern();
    }
    onPatternsChange(patterns.filter(p => p.patternNo !== patternNo));
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
          </svg>
          Pattern
        </h3>
        <span className="text-sm text-gray-400">
          {patterns.length} pattern{patterns.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300 space-y-1">
            <p><strong>Pattern records your PTZ movements:</strong></p>
            <ul className="list-disc list-inside space-y-1 text-blue-200/90">
              <li>Horizontal/Vertical movements</li>
              <li>Zoom operations</li>
              <li>Preset point calling</li>
              <li>All camera operations during recording</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Pattern Configuration */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-4">
        {/* Pattern Number Selection */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 2: Select Pattern No.
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((no) => {
              const pattern = patterns.find(p => p.patternNo === no);
              const isActive = pattern && activePatternId === pattern.id;
              const isCurrentlyRecording = recordingPatternNo === no;
              
              return (
                <button
                  key={no}
                  onClick={() => handlePatternNoChange(no)}
                  disabled={isRecording && recordingPatternNo !== no}
                  className={`relative py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                    selectedPatternNo === no
                      ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                      : pattern
                      ? 'bg-gray-700/50 border-gray-600 text-white hover:border-gray-500'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  } ${isRecording && recordingPatternNo !== no ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Pattern {no}</span>
                    {pattern?.isRecorded && (
                      <div className="flex items-center gap-1">
                        <svg className="w-3 h-3 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="text-xs text-green-400">Recorded</span>
                      </div>
                    )}
                    {isCurrentlyRecording && (
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                        <span className="text-xs text-red-400">Recording</span>
                      </div>
                    )}
                    {isActive && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full animate-pulse border-2 border-gray-800"></div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Pattern Info */}
        {currentPattern && currentPattern.isRecorded && (
          <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Status:</span>
                <span className="text-green-400 font-medium text-sm flex items-center gap-1">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Recorded
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Duration:</span>
                <span className="text-white font-mono font-medium">{formatDuration(currentPattern.recordingDuration)}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Movements:</span>
                <span className="text-white font-mono font-medium">{currentPattern.movements.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* Recording Controls */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 3-4: Record Pattern
          </label>
          
          {!isRecording ? (
            <button
              onClick={handleStartRecording}
              className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 px-4 rounded-lg border border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
              </svg>
              Start Recording
            </button>
          ) : (
            <div className="space-y-3">
              <div className="bg-red-500/20 border-2 border-red-500 rounded-lg p-4">
                <div className="flex items-center justify-center gap-3">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                  <span className="text-red-400 font-medium">RECORDING IN PROGRESS</span>
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse"></div>
                </div>
                <p className="text-center text-red-300 text-sm mt-2">
                  Operate the camera as required. All movements are being recorded.
                </p>
              </div>
              
              <button
                onClick={handleStopRecording}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-lg border border-orange-500 transition-all duration-200 shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop Recording
              </button>
            </div>
          )}
        </div>

        {/* Pattern Playback Controls */}
        {!isRecording && (
          <div>
            <label className="block text-white font-medium mb-3 text-sm">
              Step 5-6: Pattern Playback
            </label>
            
            {activePatternId && activePattern?.patternNo === selectedPatternNo ? (
              <button
                onClick={onStopPattern}
                className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-lg border border-orange-500 transition-all duration-200 shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2 font-medium"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
                </svg>
                Stop Pattern
              </button>
            ) : (
              <button
                onClick={handleStartPattern}
                className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={!currentPattern || !currentPattern.isRecorded}
              >
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                </svg>
                Start Pattern
              </button>
            )}
          </div>
        )}

        {/* Delete Pattern */}
        {currentPattern && currentPattern.isRecorded && !isRecording && (
          <button
            onClick={() => handleDeletePattern(selectedPatternNo)}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 text-gray-400 hover:text-white py-2 px-4 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Pattern {selectedPatternNo}
          </button>
        )}
      </div>

      {/* Recording Instructions */}
      {isRecording && (
        <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-blue-300 space-y-1">
              <p><strong>Recording your movements:</strong></p>
              <ul className="list-disc list-inside space-y-1 text-blue-200/90">
                <li>Use directional arrows to move camera</li>
                <li>Adjust zoom, focus, and aperture</li>
                <li>Call preset points</li>
                <li>All operations will be saved in sequence</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Active Pattern Status */}
      {activePatternId && activePattern && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-300">
              <div className="flex items-center gap-2">
                <strong>Pattern {activePattern.patternNo} is playing</strong>
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
              <p className="text-green-200/90 mt-1">
                Camera is executing recorded movements ({activePattern.movements.length} operations, {formatDuration(activePattern.recordingDuration)} duration)
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PatternManagement;
