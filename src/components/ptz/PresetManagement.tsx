"use client"

import React, { useState } from 'react';

export interface Preset {
  id: number;
  title: string;
  position: {
    pan: number;
    tilt: number;
    zoom: number;
    focus: number;
    aperture: number;
  };
}

interface PresetManagementProps {
  presets: Preset[];
  onPresetsChange: (presets: Preset[]) => void;
  onGotoPreset: (preset: Preset) => void;
  currentPosition: {
    pan: number;
    tilt: number;
    zoom: number;
    focus: number;
    aperture: number;
  };
}

const PresetManagement: React.FC<PresetManagementProps> = ({
  presets,
  onPresetsChange,
  onGotoPreset,
  currentPosition,
}) => {
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  const handleAddPreset = () => {
    const newPreset: Preset = {
      id: Date.now(),
      title: `Preset ${presets.length + 1}`,
      position: { ...currentPosition },
    };
    onPresetsChange([...presets, newPreset]);
  };

  const handleDeletePreset = (id: number) => {
    onPresetsChange(presets.filter(p => p.id !== id));
    if (selectedPresetId === id) {
      setSelectedPresetId(null);
    }
  };

  const handleDoubleClick = (preset: Preset) => {
    setEditingId(preset.id);
    setEditingTitle(preset.title);
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditingTitle(e.target.value);
  };

  const handleTitleBlur = () => {
    if (editingId !== null) {
      onPresetsChange(
        presets.map(p =>
          p.id === editingId ? { ...p, title: editingTitle || p.title } : p
        )
      );
      setEditingId(null);
    }
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleTitleBlur();
    } else if (e.key === 'Escape') {
      setEditingId(null);
    }
  };

  const handleGotoPreset = (preset: Preset) => {
    setSelectedPresetId(preset.id);
    onGotoPreset(preset);
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          Preset Points
        </h3>
        <span className="text-sm text-gray-400">
          {presets.length} preset{presets.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300 space-y-1">
            <p><strong>How to use:</strong></p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200/90">
              <li>Use arrow keys to adjust camera direction</li>
              <li>Adjust zoom, focus, and aperture as needed</li>
              <li>Click "Add Preset" to save current position</li>
              <li>Double-click preset title to rename</li>
              <li>Click preset to go to that position</li>
              <li>Click delete icon to remove preset</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Add Preset Button */}
      <button
        onClick={handleAddPreset}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 px-4 rounded-lg border border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 font-medium"
      >
        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
        </svg>
        Add Preset
      </button>

      {/* Presets List */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
        {presets.length === 0 ? (
          <div className="p-8 text-center">
            <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
            </svg>
            <p className="text-gray-400 text-sm">No presets saved yet</p>
            <p className="text-gray-500 text-xs mt-1">Click "Add Preset" to save the current camera position</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`p-4 hover:bg-gray-700/30 transition-colors ${
                  selectedPresetId === preset.id ? 'bg-red-500/10 border-l-4 border-red-500' : ''
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Preset Number Badge */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    {presets.indexOf(preset) + 1}
                  </div>

                  {/* Preset Title */}
                  <div className="flex-1 min-w-0">
                    {editingId === preset.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={handleTitleChange}
                        onBlur={handleTitleBlur}
                        onKeyDown={handleTitleKeyDown}
                        autoFocus
                        className="w-full bg-gray-700 text-white px-3 py-1.5 rounded border border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500"
                      />
                    ) : (
                      <div
                        onDoubleClick={() => handleDoubleClick(preset)}
                        className="cursor-pointer group"
                      >
                        <p className="text-white font-medium group-hover:text-red-400 transition-colors">
                          {preset.title}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          Double-click to edit
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex items-center gap-2">
                    {/* Go to Preset Button */}
                    <button
                      onClick={() => handleGotoPreset(preset)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center gap-2 text-sm font-medium"
                      title="Go to this preset"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                      Go
                    </button>

                    {/* Delete Button */}
                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 text-gray-400 hover:text-white p-2 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50"
                      title="Delete preset"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>

                {/* Position Details */}
                <div className="mt-3 grid grid-cols-5 gap-2 text-xs">
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <p className="text-gray-400">Pan</p>
                    <p className="text-white font-mono">{preset.position.pan}°</p>
                  </div>
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <p className="text-gray-400">Tilt</p>
                    <p className="text-white font-mono">{preset.position.tilt}°</p>
                  </div>
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <p className="text-gray-400">Zoom</p>
                    <p className="text-white font-mono">{preset.position.zoom}%</p>
                  </div>
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <p className="text-gray-400">Focus</p>
                    <p className="text-white font-mono">{preset.position.focus}%</p>
                  </div>
                  <div className="bg-gray-700/50 rounded px-2 py-1">
                    <p className="text-gray-400">Iris</p>
                    <p className="text-white font-mono">{preset.position.aperture}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Save All Button */}
      {presets.length > 0 && (
        <button
          onClick={() => {
            console.log('Saving all presets:', presets);
            alert('All presets saved successfully!');
          }}
          className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg border border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
          </svg>
          Save All Presets
        </button>
      )}
    </div>
  );
};

export default PresetManagement;
