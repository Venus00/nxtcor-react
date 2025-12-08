"use client"

import React, { useState } from 'react';
import PTZControl from '../components/ptz/PTZControl';
import PresetManagement, { type Preset } from '../components/ptz/PresetManagement';
import TourManagement, { type Tour } from '../components/ptz/TourManagement';
import ScheduledTaskManagement, { type ScheduledTask } from '../components/ptz/ScheduledTaskManagement';
import PTZRestart from '../components/ptz/PTZRestart';
import RestoreDefault from '../components/ptz/RestoreDefault';

const PTZSettings: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<'cam1' | 'cam2'>('cam1');
  const [presets, setPresets] = useState<Preset[]>([]);
  const [tours, setTours] = useState<Tour[]>([]);
  const [scheduledTasks, setScheduledTasks] = useState<ScheduledTask[]>([]);
  const [activeTourId, setActiveTourId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<'preset' | 'tour' | 'scheduled' | 'restart' | 'default'>('preset');
  const [currentPosition, setCurrentPosition] = useState({
    pan: 0,
    tilt: 0,
    zoom: 50,
    focus: 50,
    aperture: 50,
  });

  const handleDirectionControl = async (direction: 'up' | 'down' | 'left' | 'right' | 'center') => {
    console.log('Direction control:', direction);

    // Send API request for PTZ control
    if (direction !== 'center') {
      try {
        const response = await fetch(`http://${window.location.hostname}:3000/camera/${selectedCamera}/ptz/move/${direction}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ channel: 0, speed: 4 }),
        });
        const data = await response.json();
        console.log('PTZ move response:', data);
      } catch (error) {
        console.error('PTZ move error:', error);
      }
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

  const handleZoomControl = async (action: 'in' | 'out') => {
    console.log('Zoom control:', action);

    // Send API request for zoom control
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/camera/${selectedCamera}/ptz/zoom/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 0, speed: 4 }),
      });
      const data = await response.json();
      console.log('Zoom response:', data);
    } catch (error) {
      console.error('Zoom error:', error);
    }

    setCurrentPosition(prev => ({
      ...prev,
      zoom: action === 'in'
        ? Math.min(100, prev.zoom + 5)
        : Math.max(0, prev.zoom - 5),
    }));
  };

  const handleFocusControl = async (action: 'near' | 'far') => {
    console.log('Focus control:', action);

    // Send API request for focus control
    try {
      const response = await fetch(`http://${window.location.hostname}:3000/camera/${selectedCamera}/ptz/focus/${action}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ channel: 0, speed: 4 }),
      });
      const data = await response.json();
      console.log('Focus response:', data);
    } catch (error) {
      console.error('Focus error:', error);
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

    setCurrentPosition(prev => ({
      ...prev,
      aperture: action === 'open'
        ? Math.min(100, prev.aperture + 5)
        : Math.max(0, prev.aperture - 5),
    }));
  };

  const handleGotoPreset = (preset: Preset) => {
    console.log('Going to preset:', preset);

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

    // In a real implementation, this would call the API to restart the PTZ
    // For now, we just log it
    console.log('PTZ restart command sent');
  };

  const handleRestoreDefault = () => {
    console.log('Restoring PTZ default settings...');

    // Reset all PTZ configurations to default
    setPresets([]);
    setTours([]);
    setScheduledTasks([]);

    // Stop all active operations
    setActiveTourId(null);

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
        <div className="flex gap-6 h-[calc(100vh-12rem)]">
          {/* Left Column - Live Preview with Controls - Full Screen */}
          <div className="flex-1 flex flex-col">
            {/* Live Preview */}
            <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden flex-1 flex flex-col">
              <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
                <div className="flex items-center justify-between">
                  <h2 className="text-white font-medium flex items-center gap-2">
                    <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    Live Preview
                  </h2>

                  {/* Camera Selection */}
                  <div className="flex items-center gap-2">
                    <label className="text-gray-400 text-sm">Camera:</label>
                    <select
                      value={selectedCamera}
                      onChange={(e) => setSelectedCamera(e.target.value as 'cam1' | 'cam2')}
                      className="bg-gray-700/50 border border-gray-600 text-white text-sm rounded-lg px-3 py-1.5 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none transition-all"
                    >
                      <option value="cam2">Camera Optique</option>
                      <option value="cam1">Camera Thermique</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Video Preview Area */}
              <div className="relative flex-1 bg-gray-900">
                {/* Live Camera Stream */}
                <iframe
                  src={`http://${window.location.hostname}:8889/${selectedCamera}`}
                  width="640"
                  height="360"
                  className="object-fill absolute inset-0"
                  allow="autoplay; fullscreen"
                  style={{
                    transformOrigin: "center",
                    transition: "transform 0.3s ease",
                    width: "100%",
                    height: "100%",
                  }}
                />

                {/* Recording Indicator & Camera Label */}
                <div className="absolute top-4 right-4 flex items-center gap-3 z-10">
                  <div className="flex items-center gap-2 bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-white text-sm font-medium">LIVE</span>
                  </div>
                  <div className="bg-black/70 backdrop-blur-sm rounded-lg px-3 py-2 border border-gray-700">
                    <span className="text-white text-sm font-medium">
                      {selectedCamera === 'cam1' ? 'camera Optique' : 'camera Thermique'}
                    </span>
                  </div>
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
          <div className="w-96 flex-shrink-0">
            <div className="bg-gray-800/30 rounded-lg border border-gray-700 overflow-hidden h-full flex flex-col">
              {/* Tab Navigation */}
              <div className="bg-gray-800/50 px-4 py-3 border-b border-gray-700">
                <div className="flex gap-2">
                  <button
                    onClick={() => setActiveTab('preset')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${activeTab === 'preset'
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
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${activeTab === 'tour'
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
                  {/* <button
                    onClick={() => setActiveTab('scheduled')}
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${activeTab === 'scheduled'
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
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${activeTab === 'restart'
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
                    className={`flex-1 py-2 px-1.5 rounded-lg font-medium text-xs transition-all ${activeTab === 'default'
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
                  </button> */}
                </div>
              </div>

              {/* Tab Content */}
              <div className="p-6 flex-1 overflow-y-auto">
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
                ) : activeTab === 'scheduled' ? (
                  <ScheduledTaskManagement
                    scheduledTasks={scheduledTasks}
                    onScheduledTasksChange={setScheduledTasks}
                    onSave={handleSaveScheduledTask}
                    availablePresets={presets}
                    availableTours={tours}
                    availableAutoScans={[]}
                    availablePatterns={[]}
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
