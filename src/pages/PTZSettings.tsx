"use client"

import React, { useState } from 'react';
import PTZControl from '../components/ptz/PTZControl';
import PresetManagement, { type Preset } from '../components/ptz/PresetManagement';
import TourManagement, { type Tour } from '../components/ptz/TourManagement';
import AutoScanManagement, { type AutoScan } from '../components/ptz/AutoScanManagement';
import PatternManagement, { type Pattern } from '../components/ptz/PatternManagement';
import AutoPanManagement, { type AutoPan } from '../components/ptz/AutoPanManagement';
import IdleActionManagement, { type IdleAction } from '../components/ptz/IdleActionManagement';
import PTZLimitManagement, { type PTZLimit } from '../components/ptz/PTZLimitManagement';
import ScheduledTaskManagement, { type ScheduledTask } from '../components/ptz/ScheduledTaskManagement';
import PTZRestart from '../components/ptz/PTZRestart';
import RestoreDefault from '../components/ptz/RestoreDefault';

const PTZSettings: React.FC = () => {
  const [presets, setPresets] = useState<Preset[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [autoScans, setAutoScans] = useState<AutoScan[]>([]);
  const [patterns, setPatterns] = useState<Pattern[]>([]);
  const [autoPan, setAutoPan] = useState<AutoPan>({
    speed: 50,
    direction: 'clockwise',
    isActive: false,
  });
  const [idleAction, setIdleAction] = useState<IdleAction>({
    enabled: false,
    actionType: 'preset',
    actionNumber: 0,
    idleTime: 60,
  });
  const [ptzLimit, setPTZLimit] = useState<PTZLimit>({
    verticalLimit: {
      enabled: false,
      upLimit: null,
      downLimit: null,
    },
    horizontalLimit: {
      enabled: false,
      leftLimit: null,
      rightLimit: null,
    },
    zeroPointCalibration: 'off',
  });
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [activeTourId, setActiveTourId] = useState<number | null>(null);
  const [activeScanId, setActiveScanId] = useState<number | null>(null);
  const [activePatternId, setActivePatternId] = useState<number | null>(null);
  const [isRecording, setIsRecording] = useState<boolean>(false);
  const [recordingPatternNo, setRecordingPatternNo] = useState<number | null>(null);
  const [recordingStartTime, setRecordingStartTime] = useState<Date | null>(null);
  const [recordedMovements, setRecordedMovements] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'preset' | 'tour' | 'scan' | 'pattern' | 'autopan' | 'idle' | 'limit' | 'scheduled' | 'restart' | 'default'>('preset');
  const [currentPosition, setCurrentPosition] = useState({
    pan: 0,
    tilt: 0,
    zoom: 50,
    focus: 50,
    aperture: 50,
  });

  const handleDirectionControl = (direction: 'up' | 'down' | 'left' | 'right' | 'center') => {
    console.log('Direction control:', direction);
    
    // Record movement if recording is active
    if (isRecording) {
      setRecordedMovements(prev => [...prev, `Direction: ${direction}`]);
    }
    
    setCurrentPosition(prev => {
      const newPosition = { ...prev };
      
      switch (direction) {
        case 'up':
          newPosition.tilt = Math.min(90, prev.tilt + 5);
          break;
        case 'down':
          newPosition.tilt = Math.max(-90, prev.tilt - 5);
          break;
        case 'left':
          newPosition.pan = Math.max(-180, prev.pan - 5);
          break;
        case 'right':
          newPosition.pan = Math.min(180, prev.pan + 5);
          break;
        case 'center':
          newPosition.pan = 0;
          newPosition.tilt = 0;
          break;
      }
      
      return newPosition;
    });
  };

  const handleZoomControl = (action: 'in' | 'out') => {
    console.log('Zoom control:', action);
    
    // Record movement if recording is active
    if (isRecording) {
      setRecordedMovements(prev => [...prev, `Zoom: ${action}`]);
    }
    
    setCurrentPosition(prev => ({
      ...prev,
      zoom: action === 'in' 
        ? Math.min(100, prev.zoom + 5)
        : Math.max(0, prev.zoom - 5),
    }));
  };

  const handleFocusControl = (action: 'near' | 'far') => {
    console.log('Focus control:', action);
    
    // Record movement if recording is active
    if (isRecording) {
      setRecordedMovements(prev => [...prev, `Focus: ${action}`]);
    }
    
    setCurrentPosition(prev => ({
      ...prev,
      focus: action === 'far' 
        ? Math.min(100, prev.focus + 5)
        : Math.max(0, prev.focus - 5),
    }));
  };

  const handleApertureControl = (action: 'open' | 'close') => {
    console.log('Aperture control:', action);
    
    // Record movement if recording is active
    if (isRecording) {
      setRecordedMovements(prev => [...prev, `Aperture: ${action}`]);
    }
    
    setCurrentPosition(prev => ({
      ...prev,
      aperture: action === 'open' 
        ? Math.min(100, prev.aperture + 5)
        : Math.max(0, prev.aperture - 5),
    }));
  };

  const handleGotoPreset = (preset: Preset) => {
    console.log('Going to preset:', preset);
    
    // Record movement if recording is active
    if (isRecording) {
      setRecordedMovements(prev => [...prev, `Goto Preset: ${preset.title}`]);
    }
    
    setCurrentPosition(preset.position);
    alert(`Moving to preset: ${preset.title}`);
  };

  const handleStartTour = (tour: Tour) => {
    console.log('Starting tour:', tour);
    setActiveTourId(tour.id);
    alert(`Starting tour: ${tour.name}\nThis will cycle through ${tour.presetPoints.length} preset points.`);
    
    // Simulate tour execution (in real implementation, this would control the camera)
    // Tour will be stopped if PTZ is manually operated
  };

  const handleStopTour = () => {
    console.log('Stopping tour');
    setActiveTourId(null);
    alert('Tour stopped');
  };

  const handleStartScan = (scan: AutoScan) => {
    console.log('Starting auto scan:', scan);
    setActiveScanId(scan.id);
    alert(`Starting Auto Scan ${scan.scanNo}\nScanning from ${scan.leftBoundary}° to ${scan.rightBoundary}° at speed ${scan.speed}`);
    
    // Simulate scan execution (in real implementation, this would control the camera)
  };

  const handleStopScan = () => {
    console.log('Stopping auto scan');
    setActiveScanId(null);
    alert('Auto scan stopped');
  };

  const handleSetPosition = () => {
    console.log('Setting position at Pan:', currentPosition.pan);
    // This is called when setting boundaries to ensure the camera is at the current position
  };

  const handleStartRecording = (patternNo: number) => {
    console.log('Starting pattern recording:', patternNo);
    setIsRecording(true);
    setRecordingPatternNo(patternNo);
    setRecordingStartTime(new Date());
    setRecordedMovements([]);
    alert(`Started recording Pattern ${patternNo}\nAll camera movements will be recorded.`);
  };

  const handleStopRecording = () => {
    if (!isRecording || recordingPatternNo === null || !recordingStartTime) {
      return;
    }

    const duration = Math.floor((new Date().getTime() - recordingStartTime.getTime()) / 1000);
    
    const newPattern: Pattern = {
      id: Date.now(),
      patternNo: recordingPatternNo,
      isRecorded: true,
      recordingStartTime: recordingStartTime,
      recordingDuration: duration,
      movements: [...recordedMovements],
      isActive: false,
    };

    // Remove existing pattern with same patternNo if exists
    setPatterns(prev => {
      const filtered = prev.filter(p => p.patternNo !== recordingPatternNo);
      return [...filtered, newPattern];
    });

    console.log('Pattern recorded:', newPattern);
    alert(`Pattern ${recordingPatternNo} recorded successfully!\nDuration: ${duration}s, Movements: ${recordedMovements.length}`);

    setIsRecording(false);
    setRecordingPatternNo(null);
    setRecordingStartTime(null);
    setRecordedMovements([]);
  };

  const handleStartPattern = (pattern: Pattern) => {
    console.log('Starting pattern playback:', pattern);
    setActivePatternId(pattern.id);
    alert(`Playing Pattern ${pattern.patternNo}\nExecuting ${pattern.movements.length} recorded movements over ${pattern.recordingDuration}s`);
    
    // Simulate pattern execution (in real implementation, this would control the camera)
  };

  const handleStopPattern = () => {
    console.log('Stopping pattern playback');
    setActivePatternId(null);
    alert('Pattern playback stopped');
  };

  const handleStartAutoPan = () => {
    console.log('Starting auto pan:', autoPan);
    setAutoPan(prev => ({ ...prev, isActive: true }));
    alert(`Starting Auto Pan\nRotating ${autoPan.direction} at speed ${autoPan.speed}`);
    
    // Simulate auto pan execution (in real implementation, this would control the camera)
  };

  const handleStopAutoPan = () => {
    console.log('Stopping auto pan');
    setAutoPan(prev => ({ ...prev, isActive: false }));
    alert('Auto Pan stopped');
  };

  const handleSaveIdleAction = () => {
    console.log('Saving idle action configuration:', idleAction);
    
    if (idleAction.enabled && idleAction.actionNumber === 0) {
      alert('Please select an action before saving!');
      return;
    }
    
    const actionTypeLabel = idleAction.actionType === 'autoscan' ? 'Auto Scan' : 
                           idleAction.actionType === 'preset' ? 'Preset Point' :
                           idleAction.actionType.charAt(0).toUpperCase() + idleAction.actionType.slice(1);
    
    if (idleAction.enabled) {
      alert(`Idle Action Saved!\nAction Type: ${actionTypeLabel}\nIdle Time: ${idleAction.idleTime}s\n\nCamera will automatically execute the selected action after ${idleAction.idleTime}s of inactivity.`);
    } else {
      alert('Idle Action Disabled and Saved!');
    }
  };

  const handleSaveScheduledTask = () => {
    console.log('Saving scheduled tasks:', scheduledTasks);
    
    const enabledTasks = scheduledTasks.filter(t => t.enabled);
    
    if (enabledTasks.length > 0) {
      alert(`Scheduled Tasks Saved!\n${enabledTasks.length} task(s) enabled and configured.\n\nTasks will execute automatically at scheduled times.`);
    } else {
      alert('Scheduled Tasks Saved!\nNo tasks currently enabled.');
    }
  };

  const handlePTZRestart = () => {
    console.log('Restarting PTZ system...');
    
    // Stop all active operations
    if (activeTourId) setActiveTourId(null);
    if (activeScanId) setActiveScanId(null);
    if (activePatternId) setActivePatternId(null);
    if (autoPan.isActive) setAutoPan({ ...autoPan, isActive: false });
    
    // In a real implementation, this would call the API to restart the PTZ
    // For now, we just log it
    console.log('PTZ restart command sent');
  };

  const handleRestoreDefault = () => {
    console.log('Restoring PTZ default settings...');
    
    // Reset all PTZ configurations to default
    setPresets([]);
    setTours([]);
    setAutoScans([]);
    setPatterns([]);
    setAutoPan({
      speed: 50,
      direction: 'clockwise',
      isActive: false,
    });
    setIdleAction({
      enabled: false,
      actionType: 'preset',
      actionNumber: 0,
      idleTime: 60,
    });
    setPTZLimit({
      verticalLimit: {
        enabled: false,
        upLimit: null,
        downLimit: null,
      },
      horizontalLimit: {
        enabled: false,
        leftLimit: null,
        rightLimit: null,
      },
      zeroPointCalibration: 'off',
    });
    setScheduledTasks([]);
    
    // Stop all active operations
    setActiveTourId(null);
    setActiveScanId(null);
    setActivePatternId(null);
    setIsRecording(false);
    setRecordingPatternNo(null);
    setRecordingStartTime(null);
    setRecordedMovements([]);
    
    // In a real implementation, this would call the API to restore defaults
    console.log('PTZ default settings restored');
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">PTZ Settings</h1>
          <p className="text-gray-400">
            Control pan, tilt, zoom and manage preset positions
          </p>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Live Preview with Controls */}
          <div className="lg:col-span-2">
            {/* Live Preview */}
            <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden">
              <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
                <h2 className="text-white font-medium flex items-center gap-2">
                  <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Live Preview
                </h2>
              </div>
              
              {/* Video Preview Area */}
              <div className="relative aspect-video bg-gray-900 flex items-center justify-center">
                {/* Placeholder for live stream */}
                <div className="absolute inset-0 bg-gradient-to-br from-gray-800 to-gray-900">
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="text-center">
                      <svg className="w-24 h-24 text-gray-600 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                      </svg>
                      <p className="text-gray-500 text-lg font-medium mb-2">Live Camera Feed</p>
                      <p className="text-gray-600 text-sm">Stream will appear here</p>
                    </div>
                  </div>
                  
                  {/* Grid overlay for reference */}
                  <div className="absolute inset-0 opacity-10">
                    <div className="h-full w-full" style={{
                      backgroundImage: `
                        linear-gradient(0deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent),
                        linear-gradient(90deg, transparent 24%, rgba(255, 255, 255, .05) 25%, rgba(255, 255, 255, .05) 26%, transparent 27%, transparent 74%, rgba(255, 255, 255, .05) 75%, rgba(255, 255, 255, .05) 76%, transparent 77%, transparent)
                      `,
                      backgroundSize: '50px 50px'
                    }}></div>
                  </div>
                </div>

               
                {/* Recording Indicator */}
                <div className="absolute top-4 right-4 flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700 z-10">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white text-sm font-medium">LIVE</span>
                </div>

                {/* PTZ Controls - Bottom Left */}
                <div className="absolute bottom-4 left-4 z-20">
                  <PTZControl
                    onDirectionControl={handleDirectionControl}
                    onZoomControl={handleZoomControl}
                    onFocusControl={handleFocusControl}
                    onApertureControl={handleApertureControl}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column - Preset/Tour Management */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden sticky top-6">
              {/* Tab Navigation */}
              <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('preset')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'preset'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      Preset
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('tour')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'tour'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                      </svg>
                      Tour
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('scan')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'scan'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                      </svg>
                      Scan
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('pattern')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'pattern'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                      </svg>
                      Pattern
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('autopan')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'autopan'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Pan
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('idle')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'idle'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      Idle
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('limit')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'limit'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Limit
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'scheduled'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Task
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('restart')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'restart'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Restart
                    </div>
                  </button>
                  <button
                    onClick={() => setActiveTab('default')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${
                      activeTab === 'default'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                    }`}
                  >
                    <div className="flex items-center justify-center gap-1.5">
                      <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                      Default
                    </div>
                  </button>
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6">
                {activeTab === 'preset' ? (
                  <PresetManagement
                    presets={presets}
                    onPresetsChange={setPresets}
                    onGotoPreset={handleGotoPreset}
                    currentPosition={currentPosition}
                  />
                ) : activeTab === 'tour' ? (
                  <TourManagement
                    tours={tours}
                    onToursChange={setTours}
                    availablePresets={presets}
                    onStartTour={handleStartTour}
                    onStopTour={handleStopTour}
                    activeTourId={activeTourId}
                  />
                ) : activeTab === 'scan' ? (
                  <AutoScanManagement
                    autoScans={autoScans}
                    onAutoScansChange={setAutoScans}
                    onStartScan={handleStartScan}
                    onStopScan={handleStopScan}
                    activeScanId={activeScanId}
                    currentPanPosition={currentPosition.pan}
                    onSetPosition={handleSetPosition}
                  />
                ) : activeTab === 'pattern' ? (
                  <PatternManagement
                    patterns={patterns}
                    onPatternsChange={setPatterns}
                    onStartPattern={handleStartPattern}
                    onStopPattern={handleStopPattern}
                    activePatternId={activePatternId}
                    isRecording={isRecording}
                    onStartRecording={handleStartRecording}
                    onStopRecording={handleStopRecording}
                    recordingPatternNo={recordingPatternNo}
                  />
                ) : activeTab === 'autopan' ? (
                  <AutoPanManagement
                    autoPan={autoPan}
                    onAutoPanChange={setAutoPan}
                    onStartAutoPan={handleStartAutoPan}
                    onStopAutoPan={handleStopAutoPan}
                  />
                ) : activeTab === 'idle' ? (
                  <IdleActionManagement
                    idleAction={idleAction}
                    onIdleActionChange={setIdleAction}
                    onSave={handleSaveIdleAction}
                    availablePresets={presets}
                    availableTours={tours}
                    availableAutoScans={autoScans}
                    availablePatterns={patterns}
                  />
                ) : activeTab === 'limit' ? (
                  <PTZLimitManagement
                    ptzLimit={ptzLimit}
                    onPTZLimitChange={setPTZLimit}
                    currentPosition={{
                      pan: currentPosition.pan,
                      tilt: currentPosition.tilt,
                    }}
                    onSetPosition={handleSetPosition}
                  />
                ) : activeTab === 'scheduled' ? (
                  <ScheduledTaskManagement
                    scheduledTasks={scheduledTasks}
                    onScheduledTasksChange={setScheduledTasks}
                    onSave={handleSaveScheduledTask}
                    availablePresets={presets}
                    availableTours={tours}
                    availableAutoScans={autoScans}
                    availablePatterns={patterns}
                  />
                ) : activeTab === 'restart' ? (
                  <PTZRestart onRestart={handlePTZRestart} />
                ) : (
                  <RestoreDefault onRestoreDefault={handleRestoreDefault} />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PTZSettings;
