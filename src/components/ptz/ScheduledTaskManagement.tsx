"use client"

import React, { useState } from 'react';
import { Preset } from './PresetManagement';
import { Tour } from './TourManagement';
import { AutoScan } from './AutoScanManagement';
import { Pattern } from './PatternManagement';

export interface ScheduleTime {
  startTime: string; // HH:mm format
  endTime: string; // HH:mm format
  days: ('mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat' | 'sun')[];
}

export interface ScheduledTask {
  id: number;
  taskNo: number;
  enabled: boolean;
  actionType: 'preset' | 'tour' | 'autoscan' | 'pattern';
  actionNumber: number;
  automaticHomeTime: number; // in seconds
  schedules: ScheduleTime[];
}

interface ScheduledTaskManagementProps {
  scheduledTasks: ScheduledTask[];
  onScheduledTasksChange: (tasks: ScheduledTask[]) => void;
  onSave: () => void;
  availablePresets: Preset[];
  availableTours: Tour[];
  availableAutoScans: AutoScan[];
  availablePatterns: Pattern[];
}

const ScheduledTaskManagement: React.FC<ScheduledTaskManagementProps> = ({
  scheduledTasks,
  onScheduledTasksChange,
  onSave,
  availablePresets,
  availableTours,
  availableAutoScans,
  availablePatterns,
}) => {
  const [selectedTaskNo, setSelectedTaskNo] = useState<number>(1);
  const [showScheduleModal, setShowScheduleModal] = useState<boolean>(false);
  const [showCopyModal, setShowCopyModal] = useState<boolean>(false);

  const currentTask = scheduledTasks.find(t => t.taskNo === selectedTaskNo) || {
    id: Date.now(),
    taskNo: selectedTaskNo,
    enabled: false,
    actionType: 'preset' as const,
    actionNumber: 0,
    automaticHomeTime: 30,
    schedules: [],
  };

  const handleTaskNoChange = (taskNo: number) => {
    setSelectedTaskNo(taskNo);
  };

  const handleEnableToggle = (enabled: boolean) => {
    const updatedTask = { ...currentTask, enabled };
    updateTask(updatedTask);
  };

  const handleActionTypeChange = (actionType: 'preset' | 'tour' | 'autoscan' | 'pattern') => {
    const updatedTask = { ...currentTask, actionType, actionNumber: 0 };
    updateTask(updatedTask);
  };

  const handleActionNumberChange = (actionNumber: number) => {
    const updatedTask = { ...currentTask, actionNumber };
    updateTask(updatedTask);
  };

  const handleAutomaticHomeTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseInt(e.target.value);
    const updatedTask = { ...currentTask, automaticHomeTime: time };
    updateTask(updatedTask);
  };

  const updateTask = (updatedTask: ScheduledTask) => {
    const existingIndex = scheduledTasks.findIndex(t => t.taskNo === updatedTask.taskNo);
    let newTasks;
    if (existingIndex >= 0) {
      newTasks = [...scheduledTasks];
      newTasks[existingIndex] = updatedTask;
    } else {
      newTasks = [...scheduledTasks, updatedTask];
    }
    onScheduledTasksChange(newTasks);
  };

  const handleClearAll = () => {
    if (confirm('Are you sure you want to clear all scheduled tasks?')) {
      onScheduledTasksChange([]);
      alert('All scheduled tasks cleared!');
    }
  };

  const handleCopyTask = (toTaskNo: number) => {
    const copiedTask = {
      ...currentTask,
      id: Date.now(),
      taskNo: toTaskNo,
    };
    const existingIndex = scheduledTasks.findIndex(t => t.taskNo === toTaskNo);
    let newTasks;
    if (existingIndex >= 0) {
      newTasks = [...scheduledTasks];
      newTasks[existingIndex] = copiedTask;
    } else {
      newTasks = [...scheduledTasks, copiedTask];
    }
    onScheduledTasksChange(newTasks);
    setShowCopyModal(false);
    alert(`Task ${selectedTaskNo} copied to Task ${toTaskNo}!`);
  };

  const getAvailableItems = () => {
    switch (currentTask.actionType) {
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
    if (currentTask.actionType === 'preset') return item.title;
    if (currentTask.actionType === 'tour') return item.name;
    if (currentTask.actionType === 'autoscan') return `Scan ${item.scanNo}`;
    if (currentTask.actionType === 'pattern') return `Pattern ${item.patternNo}`;
    return '';
  };

  const getItemId = (item: any) => {
    if (currentTask.actionType === 'preset') return item.id;
    if (currentTask.actionType === 'tour') return item.id;
    if (currentTask.actionType === 'autoscan') return item.scanNo;
    if (currentTask.actionType === 'pattern') return item.patternNo;
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
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          Scheduled Task (Preset Task)
        </h3>
        <div className="flex items-center gap-2">
          <button
            onClick={handleClearAll}
            className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 text-gray-400 hover:text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 flex items-center gap-2 text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
            Clear All
          </button>
        </div>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p><strong>Scheduled Task:</strong></p>
            <p className="text-blue-200/90 mt-1">
              Perform related running actions (Preset, Tour, Auto Scan, Pattern) within set time periods. Tasks automatically resume after manual PTZ interruptions.
            </p>
          </div>
        </div>
      </div>

      {/* Configuration */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-4 space-y-5">
        {/* Step 3: Task No Selection */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 3: Set Preset Task No.
          </label>
          
          <div className="grid grid-cols-4 gap-2">
            {[1, 2, 3, 4, 5, 6, 7, 8].map((no) => {
              const task = scheduledTasks.find(t => t.taskNo === no);
              const isActive = task?.enabled;
              
              return (
                <button
                  key={no}
                  onClick={() => handleTaskNoChange(no)}
                  className={`relative py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                    selectedTaskNo === no
                      ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                      : task
                      ? 'bg-gray-700/50 border-gray-600 text-white hover:border-gray-500'
                      : 'bg-gray-800/50 border-gray-700 text-gray-400 hover:border-gray-600'
                  }`}
                >
                  <div className="flex flex-col items-center gap-1">
                    <span>Task {no}</span>
                    {task && (
                      <div className="flex items-center gap-1">
                        {isActive ? (
                          <div className="flex items-center gap-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                            <span className="text-xs text-green-400">Enabled</span>
                          </div>
                        ) : (
                          <span className="text-xs text-gray-500">Disabled</span>
                        )}
                      </div>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Step 2: Enable/Disable */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 2: Enable Scheduled Task
          </label>
          
          <div className="flex gap-3">
            <button
              onClick={() => handleEnableToggle(true)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                currentTask.enabled
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
              onClick={() => handleEnableToggle(false)}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                !currentTask.enabled
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

        {/* Step 4: Action Type */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 4: Select Task Action Type
          </label>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Preset Point */}
            <button
              onClick={() => handleActionTypeChange('preset')}
              className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                currentTask.actionType === 'preset'
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
              {currentTask.actionType === 'preset' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </button>

            {/* Tour */}
            <button
              onClick={() => handleActionTypeChange('tour')}
              className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                currentTask.actionType === 'tour'
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
              {currentTask.actionType === 'tour' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </button>

            {/* Auto Scan */}
            <button
              onClick={() => handleActionTypeChange('autoscan')}
              className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                currentTask.actionType === 'autoscan'
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
              {currentTask.actionType === 'autoscan' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </button>

            {/* Pattern */}
            <button
              onClick={() => handleActionTypeChange('pattern')}
              className={`relative py-4 px-4 rounded-lg border-2 transition-all font-medium text-sm ${
                currentTask.actionType === 'pattern'
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
              {currentTask.actionType === 'pattern' && (
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-green-500 rounded-full border-2 border-gray-800"></div>
              )}
            </button>
          </div>
        </div>

        {/* Step 5: Action Number Selection */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 5: Select {currentTask.actionType === 'preset' ? 'Preset Point' : currentTask.actionType === 'tour' ? 'Tour' : currentTask.actionType === 'autoscan' ? 'Auto Scan' : 'Pattern'}
          </label>
          
          {availableItems.length > 0 ? (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {availableItems.map((item: any) => {
                const itemId = getItemId(item);
                const itemName = getItemName(item);
                const isSelected = currentTask.actionNumber === itemId;
                
                return (
                  <button
                    key={itemId}
                    onClick={() => handleActionNumberChange(itemId)}
                    className={`w-full py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span>{itemName}</span>
                      {isSelected && (
                        <svg className="w-4 h-4 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
              <div className="flex gap-2">
                <svg className="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <div className="text-sm text-yellow-300">
                  <strong>No {currentTask.actionType === 'preset' ? 'presets' : currentTask.actionType === 'tour' ? 'tours' : currentTask.actionType === 'autoscan' ? 'auto scans' : 'patterns'} available</strong>
                  <p className="text-yellow-200/90 mt-1">
                    Please create at least one {currentTask.actionType} before configuring scheduled task.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Step 6: Automatic Home Time */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 6: Set Automatic Home Time
          </label>
          
          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3 mb-3">
            <div className="flex gap-2">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="text-blue-200/90">
                  Time required to automatically resume the preset task when PTZ is manually interrupted.
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-3">
            {/* Time Slider */}
            <div className="relative">
              <input
                type="range"
                min="10"
                max="300"
                step="10"
                value={currentTask.automaticHomeTime}
                onChange={handleAutomaticHomeTimeChange}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
                style={{
                  background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${((currentTask.automaticHomeTime - 10) / 290) * 100}%, #374151 ${((currentTask.automaticHomeTime - 10) / 290) * 100}%, #374151 100%)`
                }}
              />
              <div className="flex justify-between text-xs text-gray-500 mt-1">
                <span>10s</span>
                <span>1m</span>
                <span>2m</span>
                <span>3m</span>
                <span>5m</span>
              </div>
            </div>

            {/* Time Display */}
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Automatic Home Time:</span>
                <div className="flex items-center gap-2">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="text-white font-mono font-bold text-lg">{formatTime(currentTask.automaticHomeTime)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Step 7: Set Schedule */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 7: Set Schedule
          </label>
          
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg border border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Set Schedule
            {currentTask.schedules.length > 0 && (
              <span className="ml-2 bg-blue-800/50 px-2 py-0.5 rounded text-xs">
                {currentTask.schedules.length} schedule{currentTask.schedules.length > 1 ? 's' : ''}
              </span>
            )}
          </button>

          {/* Display Current Schedules */}
          {currentTask.schedules.length > 0 && (
            <div className="mt-3 space-y-2">
              <p className="text-gray-400 text-xs">Current Schedules:</p>
              {currentTask.schedules.map((schedule, index) => (
                <div key={index} className="bg-gray-900/50 rounded-lg p-2 border border-gray-700 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-white font-mono">{schedule.startTime} - {schedule.endTime}</span>
                    <span className="text-gray-400 text-xs">
                      {schedule.days.map(d => d.charAt(0).toUpperCase() + d.slice(1, 3)).join(', ')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 8: Copy */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 8: Copy to Another Task
          </label>
          
          <button
            onClick={() => setShowCopyModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white py-3 px-4 rounded-lg border border-purple-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
            </svg>
            Copy Task {selectedTaskNo}
          </button>
        </div>

        {/* Step 9: Save */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 9: Save Configuration
          </label>
          
          <button
            onClick={onSave}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Scheduled Task
          </button>
        </div>
      </div>

      {/* Copy Modal */}
      {showCopyModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-md w-full mx-4">
            <h4 className="text-white font-medium text-lg mb-4">Copy Task {selectedTaskNo} to:</h4>
            <div className="grid grid-cols-4 gap-2 mb-4">
              {[1, 2, 3, 4, 5, 6, 7, 8].filter(n => n !== selectedTaskNo).map((no) => (
                <button
                  key={no}
                  onClick={() => handleCopyTask(no)}
                  className="py-3 px-4 bg-gray-700 hover:bg-red-600 text-white rounded-lg border border-gray-600 hover:border-red-500 transition-all font-medium"
                >
                  Task {no}
                </button>
              ))}
            </div>
            <button
              onClick={() => setShowCopyModal(false)}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Schedule Modal Placeholder */}
      {showScheduleModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6 max-w-lg w-full mx-4">
            <h4 className="text-white font-medium text-lg mb-4">Set Schedule (Coming Soon)</h4>
            <p className="text-gray-400 text-sm mb-4">
              Schedule configuration UI will allow you to set time periods and days for the task execution.
            </p>
            <button
              onClick={() => setShowScheduleModal(false)}
              className="w-full py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}

      {/* Active Task Summary */}
      {currentTask.enabled && currentTask.actionNumber > 0 && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-300">
              <strong>Task {selectedTaskNo} is Enabled</strong>
              <div className="space-y-1 mt-2 text-green-200/90">
                <p>Action: {currentTask.actionType.charAt(0).toUpperCase() + currentTask.actionType.slice(1)}</p>
                <p>Automatic Home: {formatTime(currentTask.automaticHomeTime)}</p>
                {currentTask.schedules.length > 0 && (
                  <p>Schedules: {currentTask.schedules.length} configured</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ScheduledTaskManagement;
