"use client"

import React, { useState } from 'react';
import { Preset } from './PresetManagement';
import { Tour } from './TourManagement';
import { AutoScan } from './AutoScanManagement';
import { Pattern } from './PatternManagement';

export interface IdleAction {
  enabled: boolean;
  actionType: 'preset' | 'tour' | 'autoscan' | 'pattern';
  actionNumber: number;
  idleTime: number; // in seconds
}

interface IdleActionManagementProps {
  idleAction: IdleAction;
  onIdleActionChange: (idleAction: IdleAction) => void;
  onSave: () => void;
  availablePresets: Preset[];
  availableTours: Tour[];
  availableAutoScans: AutoScan[];
  availablePatterns: Pattern[];
}

const IdleActionManagement: React.FC<IdleActionManagementProps> = ({
  idleAction,
  onIdleActionChange,
  onSave,
  availablePresets,
  availableTours,
  availableAutoScans,
  availablePatterns,
}) => {
  const [enabled, setEnabled] = useState<boolean>(idleAction.enabled);
  const [actionType, setActionType] = useState<'preset' | 'tour' | 'autoscan' | 'pattern'>(idleAction.actionType);
  const [actionNumber, setActionNumber] = useState<number>(idleAction.actionNumber);
  const [idleTime, setIdleTime] = useState<number>(idleAction.idleTime);

  const handleEnabledChange = (value: boolean) => {
    setEnabled(value);
    onIdleActionChange({ ...idleAction, enabled: value });
  };

  const handleActionTypeChange = (type: 'preset' | 'tour' | 'autoscan' | 'pattern') => {
    setActionType(type);
    // Reset action number when type changes
    setActionNumber(0);
    onIdleActionChange({ ...idleAction, actionType: type, actionNumber: 0 });
  };

  const handleActionNumberChange = (number: number) => {
    setActionNumber(number);
    onIdleActionChange({ ...idleAction, actionNumber: number });
  };

  const handleIdleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);
    setIdleTime(time);
    onIdleActionChange({ ...idleAction, idleTime: time });
  };

  const handleSave = () => {
    onSave();
  };

  const getAvailableItems = () => {
    switch (actionType) {
      case 'preset':
        return availablePresets;
      case 'tour':
        return availableTours;
      case 'autoscan':
        return availableAutoScans;
      case 'pattern':
        return availablePatterns;
      default:
        return [];
    }
  };

  const getItemName = (item: any) => {
    if (actionType === 'preset') return item.title;
    if (actionType === 'tour') return item.name;
    if (actionType === 'autoscan') return `Scan ${item.scanNo}`;
    if (actionType === 'pattern') return `Pattern ${item.patternNo}`;
    return '';
  };

  const getItemId = (item: any) => {
    if (actionType === 'preset') return item.id;
    if (actionType === 'tour') return item.id;
    if (actionType === 'autoscan') return item.scanNo;
    if (actionType === 'pattern') return item.patternNo;
    return 0;
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins === 0) return `${secs}s`;
    return `${mins}m ${secs}s`;
  };

  const availableItems = getAvailableItems();

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Idle Action
        </h3>
        {enabled && (
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
            <span className="text-green-400 text-sm font-medium">Enabled</span>
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
            <p><strong>Idle Action:</strong></p>
            <p className="text-blue-200/90 mt-1">
              Camera automatically performs the selected action when no valid commands are received within the set idle time.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-5">
        {/* Step 2: Enable/Disable */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 2: Enable Idle Action
          </label>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleEnabledChange(true)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                enabled
                  ? 'bg-gradient-to-br from-green-600 to-green-700 border-green-500 text-white shadow-lg'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                Enable
              </div>
            </button>
            <button
              onClick={() => handleEnabledChange(false)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                !enabled
                  ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                Disable
              </div>
            </button>
          </div>
        </div>

        {/* Step 3: Action Type */}
        {enabled && (
          <div>
            <label className="block text-white font-medium mb-3 text-sm">
              Step 3: Select Idle Action Type
            </label>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Preset Point */}
              <button
                onClick={() => handleActionTypeChange('preset')}
                className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                  actionType === 'preset'
                    ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span>Preset Point</span>
                </div>
                {actionType === 'preset' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </button>

              {/* Tour */}
              <button
                onClick={() => handleActionTypeChange('tour')}
                className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                  actionType === 'tour'
                    ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
                  </svg>
                  <span>Tour</span>
                </div>
                {actionType === 'tour' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </button>

              {/* Auto Scan */}
              <button
                onClick={() => handleActionTypeChange('autoscan')}
                className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                  actionType === 'autoscan'
                    ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                  </svg>
                  <span>Auto Scan</span>
                </div>
                {actionType === 'autoscan' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </button>

              {/* Pattern */}
              <button
                onClick={() => handleActionTypeChange('pattern')}
                className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                  actionType === 'pattern'
                    ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                    : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                }`}
              >
                <div className="flex flex-col items-center gap-2">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span>Pattern</span>
                </div>
                {actionType === 'pattern' && (
                  <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
                )}
              </button>
            </div>
          </div>
        )}

        {/* Step 4: Action Number Selection */}
        {enabled && (
          <div>
            <label className="block text-white font-medium mb-3 text-sm">
              Step 4: Select {actionType === 'preset' ? 'Preset Point' : actionType === 'tour' ? 'Tour' : actionType === 'autoscan' ? 'Auto Scan' : 'Pattern'}
            </label>
            
            {availableItems.length > 0 ? (
              <div className="space-y-2">
                {availableItems.map((item: any) => {
                  const itemId = getItemId(item);
                  const itemName = getItemName(item);
                  const isSelected = actionNumber === itemId;
                  
                  return (
                    <button
                      key={itemId}
                      onClick={() => handleActionNumberChange(itemId)}
                      className={`w-full py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm text-left ${
                        isSelected
                          ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                          : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span>{itemName}</span>
                        {isSelected && (
                          <svg className="w-5 h-5 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            ) : (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-4">
                <div className="flex gap-2">
                  <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-yellow-300">
                    <strong>No {actionType === 'preset' ? 'presets' : actionType === 'tour' ? 'tours' : actionType === 'autoscan' ? 'auto scans' : 'patterns'} available</strong>
                    <p className="text-yellow-200/90 mt-1">
                      Please create at least one {actionType} before configuring idle action.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 5: Idle Time */}
        {enabled && (
          <div>
            <label className="block text-white font-medium mb-3 text-sm">
              Step 5: Set Idle Time
            </label>
            
            <div className="space-y-3">
              {/* Time Slider */}
              <div className="relative">
                <input
                  type="range"
                  min="10"
                  max="300"
                  step="10"
                  value={idleTime}
                  onChange={handleIdleTimeChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                  style={{
                    background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${((idleTime - 10) / 290) * 100}%, #374151 ${((idleTime - 10) / 290) * 100}%, #374151 100%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>10s</span>
                  <span>1m</span>
                  <span>2m</span>
                  <span>3m</span>
                  <span>4m</span>
                  <span>5m</span>
                </div>
              </div>

              {/* Time Display */}
              <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400 text-sm">Idle Time:</span>
                  <div className="flex items-center gap-2">
                    <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-white font-mono font-bold text-lg">{formatTime(idleTime)}</span>
                  </div>
                </div>
              </div>

              <p className="text-gray-400 text-xs">
                Camera will perform the selected action after {formatTime(idleTime)} of inactivity.
              </p>
            </div>
          </div>
        )}

        {/* Configuration Summary */}
        {enabled && actionNumber > 0 && (
          <div className="bg-gray-900/50 rounded-lg p-4 border border-gray-700">
            <h4 className="text-white font-medium text-sm mb-3">Configuration Summary</h4>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Status:</span>
                <span className="text-green-400 font-medium text-sm flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                  Enabled
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Action Type:</span>
                <span className="text-white font-medium text-sm capitalize">{actionType === 'autoscan' ? 'Auto Scan' : actionType === 'preset' ? 'Preset Point' : actionType}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Action:</span>
                <span className="text-white font-medium text-sm">
                  {availableItems.find((item: any) => getItemId(item) === actionNumber) 
                    ? getItemName(availableItems.find((item: any) => getItemId(item) === actionNumber))
                    : 'Not selected'}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Idle Time:</span>
                <span className="text-white font-mono font-medium">{formatTime(idleTime)}</span>
              </div>
            </div>
          </div>
        )}

        {/* Step 6: Save Button */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 6: Save Configuration
          </label>
          
          <button
            onClick={handleSave}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Idle Action Settings
          </button>
        </div>
      </div>

      {/* Active Idle Action Warning */}
      {enabled && actionNumber > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-300">
              <strong>Idle Action is configured</strong>
              <p className="text-green-200/90 mt-1">
                Camera will automatically execute "{availableItems.find((item: any) => getItemId(item) === actionNumber) 
                  ? getItemName(availableItems.find((item: any) => getItemId(item) === actionNumber))
                  : 'selected action'}" after {formatTime(idleTime)} of inactivity.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default IdleActionManagement;
