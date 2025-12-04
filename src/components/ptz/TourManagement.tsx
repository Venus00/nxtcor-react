"use client"

import React, { useState } from 'react';
import { type Preset } from './PresetManagement';

export interface TourPresetPoint {
  id: number;
  presetId: number;
  presetName: string;
  duration: number; // in seconds
}

export interface Tour {
  id: number;
  name: string;
  presetPoints: TourPresetPoint[];
  isActive: boolean;
}

interface TourManagementProps {
  tours: Tour[];
  onToursChange: (tours: Tour[]) => void;
  availablePresets: Preset[];
  onStartTour: (tour: Tour) => void;
  onStopTour: () => void;
  activeTourId: number | null;
}

const TourManagement: React.FC<TourManagementProps> = ({
  tours,
  onToursChange,
  availablePresets,
  onStartTour,
  onStopTour,
  activeTourId,
}) => {
  const [selectedTourId, setSelectedTourId] = useState<number | null>(null);
  const [editingTourNameId, setEditingTourNameId] = useState<number | null>(null);
  const [editingTourName, setEditingTourName] = useState('');
  const [editingDurationId, setEditingDurationId] = useState<number | null>(null);
  const [editingDuration, setEditingDuration] = useState('');

  const selectedTour = tours.find(t => t.id === selectedTourId);

  const handleAddTour = () => {
    const newTour: Tour = {
      id: Date.now(),
      name: `Tour ${tours.length + 1}`,
      presetPoints: [],
      isActive: false,
    };
    onToursChange([...tours, newTour]);
    setSelectedTourId(newTour.id);
  };

  const handleDeleteTour = (tourId: number) => {
    if (activeTourId === tourId) {
      onStopTour();
    }
    onToursChange(tours.filter(t => t.id !== tourId));
    if (selectedTourId === tourId) {
      setSelectedTourId(null);
    }
  };

  const handleAddPresetPoint = (presetId: number) => {
    if (!selectedTourId) return;

    const preset = availablePresets.find(p => p.id === presetId);
    if (!preset) return;

    const newPresetPoint: TourPresetPoint = {
      id: Date.now(),
      presetId: preset.id,
      presetName: preset.title,
      duration: 5, // default 5 seconds
    };

    onToursChange(
      tours.map(t =>
        t.id === selectedTourId
          ? { ...t, presetPoints: [...t.presetPoints, newPresetPoint] }
          : t
      )
    );
  };

  const handleDeletePresetPoint = (pointId: number) => {
    if (!selectedTourId) return;

    onToursChange(
      tours.map(t =>
        t.id === selectedTourId
          ? { ...t, presetPoints: t.presetPoints.filter(p => p.id !== pointId) }
          : t
      )
    );
  };

  const handleTourNameDoubleClick = (tour: Tour) => {
    setEditingTourNameId(tour.id);
    setEditingTourName(tour.name);
  };

  const handleTourNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTourName(e.target.value);
  };

  const handleTourNameBlur = () => {
    if (editingTourNameId !== null) {
      onToursChange(
        tours.map(t =>
          t.id === editingTourNameId
            ? { ...t, name: editingTourName || t.name }
            : t
        )
      );
      setEditingTourNameId(null);
    }
  };

  const handleTourNameKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTourNameBlur();
    } else if (e.key === 'Escape') {
      setEditingTourNameId(null);
    }
  };

  const handleDurationDoubleClick = (point: TourPresetPoint) => {
    setEditingDurationId(point.id);
    setEditingDuration(point.duration.toString());
  };

  const handleDurationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingDuration(e.target.value);
  };

  const handleDurationBlur = () => {
    if (editingDurationId !== null && selectedTourId !== null) {
      const duration = parseInt(editingDuration);
      if (!isNaN(duration) && duration > 0) {
        onToursChange(
          tours.map(t =>
            t.id === selectedTourId
              ? {
                  ...t,
                  presetPoints: t.presetPoints.map(p =>
                    p.id === editingDurationId ? { ...p, duration } : p
                  ),
                }
              : t
          )
        );
      }
      setEditingDurationId(null);
    }
  };

  const handleDurationKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleDurationBlur();
    } else if (e.key === 'Escape') {
      setEditingDurationId(null);
    }
  };

  const handleStartTour = (tour: Tour) => {
    if (tour.presetPoints.length === 0) {
      alert('Please add preset points to the tour first!');
      return;
    }
    onStartTour(tour);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Tour Routes
        </h3>
        <span className="text-sm text-gray-400">
          {tours.length} tour{tours.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300 space-y-1">
            <p><strong>How to create a tour:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200/90">
              <li>Click "Add Tour" to create a route</li>
              <li>Select the tour from the list</li>
              <li>Add preset points to the tour</li>
              <li>Double-click duration to set stay time</li>
              <li>Click "Start" to begin the tour</li>
            </ol>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Tour List */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium text-sm">Tour Routes</h4>
            <button
              onClick={handleAddTour}
              className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-1.5 px-3 rounded-lg border border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center gap-2 text-sm"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Tour
            </button>
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700 max-h-64 overflow-y-auto">
            {tours.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                </svg>
                <p className="text-gray-400 text-sm">No tours created yet</p>
                <p className="text-gray-500 text-xs mt-1">Click "Add Tour" to create a route</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {tours.map((tour) => (
                  <div
                    key={tour.id}
                    className={`p-3 hover:bg-gray-700/30 transition-colors cursor-pointer ${
                      selectedTourId === tour.id ? 'bg-red-500/10 border-l-4 border-red-500' : ''
                    } ${activeTourId === tour.id ? 'border-l-4 border-green-500' : ''}`}
                    onClick={() => setSelectedTourId(tour.id)}
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        {editingTourNameId === tour.id ? (
                          <input
                            type="text"
                            value={editingTourName}
                            onChange={handleTourNameChange}
                            onBlur={handleTourNameBlur}
                            onKeyDown={handleTourNameKeyDown}
                            onClick={(e) => e.stopPropagation()}
                            autoFocus
                            className="w-full bg-gray-700 text-white px-2 py-1 rounded border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500 text-sm"
                          />
                        ) : (
                          <div onDoubleClick={(e) => { e.stopPropagation(); handleTourNameDoubleClick(tour); }}>
                            <p className="text-white font-medium text-sm">{tour.name}</p>
                            <p className="text-xs text-gray-500 mt-0.5">
                              {tour.presetPoints.length} preset{tour.presetPoints.length !== 1 ? 's' : ''} • Double-click to edit
                            </p>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        {activeTourId === tour.id ? (
                          <div className="flex items-center gap-1.5 bg-green-500/20 px-2 py-1 rounded border border-green-500/50">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-green-400 text-xs font-medium">Active</span>
                          </div>
                        ) : null}

                        <button
                          onClick={(e) => { e.stopPropagation(); handleDeleteTour(tour.id); }}
                          className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 text-gray-400 hover:text-white p-1.5 rounded border border-gray-600 hover:border-red-500 transition-all duration-200"
                        >
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Preset Points for Selected Tour */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h4 className="text-white font-medium text-sm">
              {selectedTour ? `Preset Points - ${selectedTour.name}` : 'Select a Tour'}
            </h4>
            {selectedTour && availablePresets.length > 0 && (
              <div className="relative group">
                <button className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-1.5 px-3 rounded-lg border border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center gap-2 text-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                  Add Preset Point
                </button>
                <div className="absolute right-0 top-full mt-2 w-48 bg-gray-800 border border-gray-700 rounded-lg shadow-xl opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 max-h-64 overflow-y-auto">
                  {availablePresets.map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handleAddPresetPoint(preset.id)}
                      className="w-full text-left px-3 py-2 text-sm text-white hover:bg-red-600/20 transition-colors border-b border-gray-700 last:border-b-0"
                    >
                      {preset.title}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="bg-gray-800/50 rounded-lg border border-gray-700 max-h-64 overflow-y-auto">
            {!selectedTour ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                </svg>
                <p className="text-gray-400 text-sm">Select a tour to manage preset points</p>
              </div>
            ) : selectedTour.presetPoints.length === 0 ? (
              <div className="p-8 text-center">
                <svg className="w-12 h-12 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <p className="text-gray-400 text-sm">No preset points added</p>
                <p className="text-gray-500 text-xs mt-1">Click "Add Preset Point" to add presets to this tour</p>
              </div>
            ) : (
              <div className="divide-y divide-gray-700">
                {selectedTour.presetPoints.map((point, index) => (
                  <div key={point.id} className="p-3 hover:bg-gray-700/30 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0 w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 rounded-lg flex items-center justify-center text-white font-bold text-sm">
                        {index + 1}
                      </div>

                      <div className="flex-1 min-w-0">
                        <p className="text-white font-medium text-sm">{point.presetName}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-gray-500">Duration:</span>
                          {editingDurationId === point.id ? (
                            <input
                              type="number"
                              min="1"
                              value={editingDuration}
                              onChange={handleDurationChange}
                              onBlur={handleDurationBlur}
                              onKeyDown={handleDurationKeyDown}
                              autoFocus
                              className="w-16 bg-gray-700 text-white px-2 py-0.5 rounded border border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500 text-xs"
                            />
                          ) : (
                            <span
                              onDoubleClick={() => handleDurationDoubleClick(point)}
                              className="text-white font-mono text-xs bg-gray-700/50 px-2 py-0.5 rounded cursor-pointer hover:bg-gray-700 transition-colors"
                            >
                              {point.duration}s
                            </span>
                          )}
                          <span className="text-xs text-gray-500">• Double-click to edit</span>
                        </div>
                      </div>

                      <button
                        onClick={() => handleDeletePresetPoint(point.id)}
                        className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 text-gray-400 hover:text-white p-1.5 rounded border border-gray-600 hover:border-red-500 transition-all duration-200"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Tour Control Buttons */}
      {selectedTour && selectedTour.presetPoints.length > 0 && (
        <div className="flex gap-3">
          {activeTourId === selectedTour.id ? (
            <button
              onClick={onStopTour}
              className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 hover:from-orange-500 hover:to-orange-600 text-white py-3 px-4 rounded-lg border border-orange-500 transition-all duration-200 shadow-lg hover:shadow-orange-500/50 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 10a1 1 0 011-1h4a1 1 0 011 1v4a1 1 0 01-1 1h-4a1 1 0 01-1-1v-4z" />
              </svg>
              Stop Tour
            </button>
          ) : (
            <button
              onClick={() => handleStartTour(selectedTour)}
              className="flex-1 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Start Tour
            </button>
          )}
        </div>
      )}

      {/* Active Tour Warning */}
      {activeTourId && (
        <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
          <div className="flex gap-2">
            <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <div className="text-sm text-yellow-300">
              <strong>Note:</strong> If the PTZ is operated manually during the tour, the camera will stop the tour automatically.
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TourManagement;
