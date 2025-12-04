"use client"

import React, { useState } from 'react';

export interface AutoScan {
  id: number;
  scanNo: number;
  speed: number; // 1-100
  leftBoundary: number | null; // pan position
  rightBoundary: number | null; // pan position
  isActive: boolean;
}

interface AutoScanManagementProps {
  autoScans: AutoScan[];
  onAutoScansChange: (scans: AutoScan[]) => void;
  onStartScan: (scan: AutoScan) => void;
  onStopScan: () => void;
  activeScanId: number | null;
  currentPanPosition: number;
  onSetPosition: () => void;
}

const AutoScanManagement: React.FC<AutoScanManagementProps> = ({
  autoScans,
  onAutoScansChange,
  onStartScan,
  onStopScan,
  activeScanId,
  currentPanPosition,
  onSetPosition,
}) => {
  const [selectedScanNo, setSelectedScanNo] = useState<number>(1);
  const [speed, setSpeed] = useState<number>(50);

  const currentScan = autoScans.find(s => s.scanNo === selectedScanNo) || null;

  const handleScanNoChange = (scanNo: number) => {
    setSelectedScanNo(scanNo);
    const scan = autoScans.find(s => s.scanNo === scanNo);
    if (scan) {
      setSpeed(scan.speed);
    } else {
      setSpeed(50);
    }
  };

  const handleSpeedChange = (newSpeed: number) => {
    setSpeed(newSpeed);
    
    // Update or create scan
    const existingScanIndex = autoScans.findIndex(s => s.scanNo === selectedScanNo);
    
    if (existingScanIndex >= 0) {
      const updatedScans = [...autoScans];
      updatedScans[existingScanIndex] = {
        ...updatedScans[existingScanIndex],
        speed: newSpeed,
      };
      onAutoScansChange(updatedScans);
    } else {
      const newScan: AutoScan = {
        id: Date.now(),
        scanNo: selectedScanNo,
        speed: newSpeed,
        leftBoundary: null,
        rightBoundary: null,
        isActive: false,
      };
      onAutoScansChange([...autoScans, newScan]);
    }
  };

  const handleSetLeftBoundary = () => {
    onSetPosition();
    
    const existingScanIndex = autoScans.findIndex(s => s.scanNo === selectedScanNo);
    
    if (existingScanIndex >= 0) {
      const updatedScans = [...autoScans];
      updatedScans[existingScanIndex] = {
        ...updatedScans[existingScanIndex],
        leftBoundary: currentPanPosition,
      };
      onAutoScansChange(updatedScans);
    } else {
      const newScan: AutoScan = {
        id: Date.now(),
        scanNo: selectedScanNo,
        speed: speed,
        leftBoundary: currentPanPosition,
        rightBoundary: null,
        isActive: false,
      };
      onAutoScansChange([...autoScans, newScan]);
    }
    
    alert(`Left boundary set at Pan: ${currentPanPosition}°`);
  };

  const handleSetRightBoundary = () => {
    onSetPosition();
    
    const existingScanIndex = autoScans.findIndex(s => s.scanNo === selectedScanNo);
    
    if (existingScanIndex >= 0) {
      const updatedScans = [...autoScans];
      updatedScans[existingScanIndex] = {
        ...updatedScans[existingScanIndex],
        rightBoundary: currentPanPosition,
      };
      onAutoScansChange(updatedScans);
    } else {
      const newScan: AutoScan = {
        id: Date.now(),
        scanNo: selectedScanNo,
        speed: speed,
        leftBoundary: null,
        rightBoundary: currentPanPosition,
        isActive: false,
      };
      onAutoScansChange([...autoScans, newScan]);
    }
    
    alert(`Right boundary set at Pan: ${currentPanPosition}°`);
  };

  const handleStartScan = () => {
    if (!currentScan || currentScan.leftBoundary === null || currentScan.rightBoundary === null) {
      alert('Please set both left and right boundaries before starting the scan!');
      return;
    }
    
    onStartScan(currentScan);
  };

  const handleDeleteScan = (scanNo: number) => {
    const scan = autoScans.find(s => s.scanNo === scanNo);
    if (scan && activeScanId === scan.id) {
      onStopScan();
    }
    onAutoScansChange(autoScans.filter(s => s.scanNo !== scanNo));
  };

  const getSpeedLabel = (speed: number): string => {
    if (speed <= 20) return 'Very Slow';
    if (speed <= 40) return 'Slow';
    if (speed <= 60) return 'Medium';
    if (speed <= 80) return 'Fast';
    return 'Very Fast';
  };

  const activeScan = autoScans.find(s => s.id === activeScanId);

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
          </svg>
          Auto Scan
        </h3>
        <span className="text-sm text-gray-400">
          {autoScans.length} scan{autoScans.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300 space-y-1">
            <p><strong>How to set up Auto Scan:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200/90">
              <li>Select a Scan No.</li>
              <li>Adjust the scan speed</li>
              <li>Use PTZ controls to position camera</li>
              <li>Set left and right boundaries</li>
              <li>Click "Start" to begin scanning</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Scan Configuration */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-4">
        {/* Scan Number Selection */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 2: Select Scan No.
          </label>
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4].map((no) => {
              const scan = autoScans.find(s => s.scanNo === no);
              const isActive = scan && activeScanId === scan.id;
              
              return (
                <button
                  key={no}
                  onClick={() => handleScanNoChange(no)}
                  className={`relative py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                    selectedScanNo === no
                      ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                      : scan
                      ? 'bg-gray-700/50 border-gray-600 text-white hover:border-gray-500'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Scan {no}</span>
                    {scan && (
                      <div className="flex gap-1">
                        {scan.leftBoundary !== null && (
                          <div className="w-1.5 h-1.5 bg-green-500 rounded-full"></div>
                        )}
                        {scan.rightBoundary !== null && (
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full"></div>
                        )}
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
          <p className="text-xs text-gray-500 mt-2">
            Green dot = Left boundary set • Blue dot = Right boundary set
          </p>
        </div>

        {/* Speed Control */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 3: Set Scan Speed
          </label>
          <div className="space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-gray-400 text-sm min-w-[80px]">Speed:</span>
              <input
                type="range"
                min="1"
                max="100"
                value={speed}
                onChange={(e) => handleSpeedChange(parseInt(e.target.value))}
                className="flex-1 h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              />
              <span className="text-white font-mono font-medium min-w-[40px] text-right">{speed}</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-500">Slow</span>
              <span className={`font-medium px-3 py-1 rounded ${
                speed <= 40 ? 'bg-green-500/20 text-green-400' :
                speed <= 70 ? 'bg-yellow-500/20 text-yellow-400' :
                'bg-red-500/20 text-red-400'
              }`}>
                {getSpeedLabel(speed)}
              </span>
              <span className="text-gray-500">Fast</span>
            </div>
          </div>
        </div>

        {/* Current Position Display */}
        <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
          <div className="flex items-center justify-between">
            <span className="text-gray-400 text-sm">Current Pan Position:</span>
            <span className="text-white font-mono font-medium">{currentPanPosition}°</span>
          </div>
        </div>

        {/* Boundary Settings */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 4-5: Set Boundaries
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={handleSetLeftBoundary}
              className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex flex-col items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
              </svg>
              <span className="font-medium text-sm">Set Left Boundary</span>
              {currentScan?.leftBoundary !== null && (
                <span className="text-xs opacity-90 font-mono">{currentScan?.leftBoundary}°</span>
              )}
            </button>
            
            <button
              onClick={handleSetRightBoundary}
              className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg border border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex flex-col items-center gap-2"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" />
              </svg>
              <span className="font-medium text-sm">Set Right Boundary</span>
              {currentScan?.rightBoundary !== null && (
                <span className="text-xs opacity-90 font-mono">{currentScan?.rightBoundary}°</span>
              )}
            </button>
          </div>
          
          {currentScan && currentScan.leftBoundary !== null && currentScan.rightBoundary !== null && (
            <div className="mt-3 bg-green-500/10 border border-green-500/30 rounded-lg p-3">
              <div className="flex items-center gap-2 text-sm text-green-300">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <span>Scan range: {currentScan.leftBoundary}° to {currentScan.rightBoundary}° ({Math.abs(currentScan.rightBoundary - currentScan.leftBoundary)}° total)</span>
              </div>
            </div>
          )}
        </div>

        {/* Start/Stop Controls */}
        <div className="pt-2">
          <label className="block text-white font-medium mb-3 text-sm">
            Step 6-7: Control Scan
          </label>
          {activeScanId && activeScan?.scanNo === selectedScanNo ? (
            <button
              onClick={onStopScan}
              className="w-full bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-lg border border-orange-500 transition-all duration-200 shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Scan
            </button>
          ) : (
            <button
              onClick={handleStartScan}
              className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!currentScan || currentScan.leftBoundary === null || currentScan.rightBoundary === null}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Scan
            </button>
          )}
        </div>

        {/* Delete Scan */}
        {currentScan && (
          <button
            onClick={() => handleDeleteScan(selectedScanNo)}
            className="w-full bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 text-gray-400 hover:text-white py-2 px-4 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 flex items-center justify-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Delete Scan {selectedScanNo}
          </button>
        )}
      </div>

      {/* Active Scan Warning */}
      {activeScanId && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-yellow-300">
              <strong>Scan No. {activeScan?.scanNo} is active</strong> - Camera is scanning between {activeScan?.leftBoundary}° and {activeScan?.rightBoundary}° at speed {activeScan?.speed}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AutoScanManagement;
