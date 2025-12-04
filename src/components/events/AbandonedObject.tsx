"use client"

import React, { useState } from 'react';

// Interfaces for Abandoned Object
interface ScheduledPeriod {
  id: number;
  dayOfWeek: 'all' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  periods: {
    enabled: boolean;
    startTime: string;
    endTime: string;
  }[];
}

interface AbandonedObjectRule {
  id: number;
  name: string;
  color: string;
  trackingTime: number; // Shortest time from leaving object to triggering alarm (in seconds)
  targetFilter: {
    minSize: number; // Minimum target size (0-100, to filter out people/vehicles)
    maxSize: number; // Maximum target size (0-100)
  };
  sensitivity: number; // 0-100
  coordinates: { x: number; y: number }[];
}

export interface AbandonedObjectConfig {
  enabled: boolean;
  antiDither: number; // 0-100 seconds
  record: boolean;
  recordDelay: number; // 10-300 seconds
  sendEmail: boolean;
  ptz: {
    enabled: boolean;
    actionType: 'preset' | 'tour' | 'pattern';
    actionNumber: number;
  };
  snapshot: boolean;
  scheduledPeriods: ScheduledPeriod[];
  abandonedObjectRules: AbandonedObjectRule[];
}

interface AbandonedObjectProps {
  config: AbandonedObjectConfig;
  onConfigChange: (config: AbandonedObjectConfig) => void;
  onSave: () => void;
}

const AbandonedObject: React.FC<AbandonedObjectProps> = ({
  config,
  onConfigChange,
  onSave,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showRuleModal, setShowRuleModal] = useState(false);

  const updateConfig = (updates: Partial<AbandonedObjectConfig>) => {
    onConfigChange({ ...config, ...updates });
  };

  const handleAntiDitherChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ antiDither: parseInt(e.target.value) });
  };

  const handleRecordDelayChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateConfig({ recordDelay: parseInt(e.target.value) });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          Abandoned Object Configuration
        </h3>
        <div className="flex items-center gap-2">
          <span className="text-gray-400 text-sm">Status:</span>
          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
            config.enabled 
              ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
              : 'bg-gray-700 text-gray-400 border border-gray-600'
          }`}>
            {config.enabled ? 'Enabled' : 'Disabled'}
          </span>
        </div>
      </div>

      {/* Info Box */}
      <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-amber-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-amber-300">
            <p className="text-amber-200 font-medium mb-2">Abandoned Object Detection</p>
            <ul className="list-disc list-inside text-amber-200/90 space-y-1 text-xs">
              <li><strong>Function:</strong> Detects objects left stationary in monitored area for extended time</li>
              <li><strong>Filtering:</strong> Target size filters help exclude pedestrians/vehicles staying too long</li>
              <li><strong>Best For:</strong> Sparse targets, stable lighting, simple textures, minimal occlusion</li>
              <li><strong>Avoid:</strong> High target density, frequent occlusion, complex textures, many people staying</li>
              <li><strong>Tip:</strong> Extend tracking time to reduce false alarms from brief human stays</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Enable/Disable Toggle */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
        <div className="flex items-center justify-between">
          <div>
            <h4 className="text-white font-medium mb-1">Enable Abandoned Object Detection</h4>
            <p className="text-gray-400 text-sm">
              Detect objects left unattended in the monitored area beyond the set tracking time
            </p>
          </div>
          <button
            onClick={() => updateConfig({ enabled: !config.enabled })}
            className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
              config.enabled ? 'bg-gradient-to-r from-amber-600 to-amber-700' : 'bg-gray-600'
            }`}
          >
            <span
              className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                config.enabled ? 'translate-x-9' : 'translate-x-1'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Configuration Options - Only show when enabled */}
      {config.enabled && (
        <>
          {/* Anti-Dither */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <label className="flex items-center justify-between text-white font-medium mb-3">
              <span className="flex items-center gap-2">
                <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Anti-Dither
              </span>
              <span className="text-amber-400 font-bold text-lg">{config.antiDither}s</span>
            </label>
            <input
              type="range"
              min="0"
              max="100"
              value={config.antiDither}
              onChange={handleAntiDitherChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mb-2"
              style={{
                background: `linear-gradient(to right, #F59E0B 0%, #F59E0B ${config.antiDither}%, #374151 ${config.antiDither}%, #374151 100%)`
              }}
            />
            <p className="text-gray-400 text-sm">
              Time interval to filter false alarms (0-100 seconds). Higher values reduce sensitivity to brief events.
            </p>
          </div>

          {/* Draw Rule Section */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 21a4 4 0 01-4-4V5a2 2 0 012-2h4a2 2 0 012 2v12a4 4 0 01-4 4zm0 0h12a2 2 0 002-2v-4a2 2 0 00-2-2h-2.343M11 7.343l1.657-1.657a2 2 0 012.828 0l2.829 2.829a2 2 0 010 2.828l-8.486 8.485M7 17h.01" />
                  </svg>
                  Detection Rules
                </h4>
                <p className="text-gray-400 text-sm">Define regions and configure tracking time for abandoned objects</p>
              </div>
              <button
                onClick={() => setShowRuleModal(true)}
                className="py-2 px-4 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg transition-all font-medium text-sm shadow-lg"
              >
                Draw Rule
              </button>
            </div>

            {/* Rules List */}
            {config.abandonedObjectRules.length > 0 && (
              <div className="space-y-2">
                {config.abandonedObjectRules.map((rule) => (
                  <div
                    key={rule.id}
                    className="bg-gray-900/50 rounded-lg border border-gray-700 p-3"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-3 h-3 rounded flex-shrink-0"
                        style={{ backgroundColor: rule.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{rule.name}</div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          Tracking Time: <span className="text-amber-400">{rule.trackingTime}s</span>
                          {' • '}
                          Size Filter: <span className="text-blue-400">{rule.targetFilter.minSize}-{rule.targetFilter.maxSize}</span>
                        </div>
                      </div>
                      <button
                        onClick={() => {
                          updateConfig({
                            abandonedObjectRules: config.abandonedObjectRules.filter(r => r.id !== rule.id)
                          });
                        }}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {config.abandonedObjectRules.length === 0 && (
              <div className="text-center py-6 text-gray-500 text-sm">
                No detection rules configured.<br />
                Click "Draw Rule" to create detection regions.
              </div>
            )}
          </div>

          {/* Record */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                  Record on Detection
                </h4>
                <p className="text-gray-400 text-sm">Automatically record video when abandoned object is detected</p>
              </div>
              <button
                onClick={() => updateConfig({ record: !config.record })}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                  config.record ? 'bg-gradient-to-r from-red-600 to-red-700' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    config.record ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Record Delay - Only show when record is enabled */}
            {config.record && (
              <div className="pt-4 border-t border-gray-700">
                <label className="flex items-center justify-between text-white font-medium mb-3">
                  <span className="text-sm">Record Delay</span>
                  <span className="text-red-400 font-bold">{config.recordDelay}s</span>
                </label>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={config.recordDelay}
                  onChange={handleRecordDelayChange}
                  className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer mb-2"
                  style={{
                    background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${((config.recordDelay - 10) / 290) * 100}%, #374151 ${((config.recordDelay - 10) / 290) * 100}%, #374151 100%)`
                  }}
                />
                <p className="text-gray-400 text-sm">
                  Recording duration after abandoned object detection (10-300 seconds)
                </p>
              </div>
            )}
          </div>

          {/* Send Email */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                  Send Email Alert
                </h4>
                <p className="text-gray-400 text-sm">Send email notification when abandoned object is detected</p>
              </div>
              <button
                onClick={() => updateConfig({ sendEmail: !config.sendEmail })}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                  config.sendEmail ? 'bg-gradient-to-r from-yellow-600 to-yellow-700' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    config.sendEmail ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* PTZ Linkage */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  PTZ Linkage
                </h4>
                <p className="text-gray-400 text-sm">Trigger PTZ action when abandoned object is detected</p>
              </div>
              <button
                onClick={() => updateConfig({ ptz: { ...config.ptz, enabled: !config.ptz.enabled } })}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                  config.ptz.enabled ? 'bg-gradient-to-r from-purple-600 to-purple-700' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    config.ptz.enabled ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* PTZ Configuration - Only show when enabled */}
            {config.ptz.enabled && (
              <div className="pt-4 border-t border-gray-700 grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Action Type</label>
                  <select
                    value={config.ptz.actionType}
                    onChange={(e) => updateConfig({ 
                      ptz: { ...config.ptz, actionType: e.target.value as 'preset' | 'tour' | 'pattern' } 
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                  >
                    <option value="preset">Preset</option>
                    <option value="tour">Tour</option>
                    <option value="pattern">Pattern</option>
                  </select>
                </div>
                <div>
                  <label className="block text-gray-400 text-sm mb-2">Action Number</label>
                  <input
                    type="number"
                    min="0"
                    value={config.ptz.actionNumber}
                    onChange={(e) => updateConfig({ 
                      ptz: { ...config.ptz, actionNumber: parseInt(e.target.value) || 0 } 
                    })}
                    className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white focus:outline-none focus:border-purple-500"
                    placeholder="Enter number"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Snapshot */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-cyan-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Snapshot
                </h4>
                <p className="text-gray-400 text-sm">Capture image snapshot when abandoned object is detected</p>
              </div>
              <button
                onClick={() => updateConfig({ snapshot: !config.snapshot })}
                className={`relative inline-flex h-8 w-16 items-center rounded-full transition-all ${
                  config.snapshot ? 'bg-gradient-to-r from-cyan-600 to-cyan-700' : 'bg-gray-600'
                }`}
              >
                <span
                  className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform ${
                    config.snapshot ? 'translate-x-9' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>
          </div>

          {/* Scheduled Period */}
          <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6">
            <div className="flex items-center justify-between mb-3">
              <div>
                <h4 className="text-white font-medium flex items-center gap-2 mb-1">
                  <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Scheduled Period
                </h4>
                <p className="text-gray-400 text-sm">Configure time periods for abandoned object detection</p>
              </div>
              <button
                onClick={() => setShowScheduleModal(true)}
                className="py-2 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-lg transition-all font-medium text-sm shadow-lg"
              >
                Setup Schedule
              </button>
            </div>
            {config.scheduledPeriods.length > 0 && (
              <div className="text-sm text-green-400 flex items-center gap-2 mt-2">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                {config.scheduledPeriods.length} day schedule(s) configured
              </div>
            )}
          </div>

          {/* Configuration Summary */}
          <div className="bg-gradient-to-r from-green-500/10 to-emerald-500/10 border border-green-500/30 rounded-lg p-6">
            <h4 className="text-white font-medium mb-3 flex items-center gap-2">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              Active Configuration
            </h4>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div className="text-gray-300">
                <span className="text-gray-400">Rules Configured:</span> {config.abandonedObjectRules.length}
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">Anti-Dither:</span> {config.antiDither}s
              </div>
              {config.record && (
                <div className="text-gray-300">
                  <span className="text-gray-400">Record Delay:</span> {config.recordDelay}s
                </div>
              )}
              <div className="text-gray-300">
                <span className="text-gray-400">Email Alert:</span> {config.sendEmail ? 'Yes' : 'No'}
              </div>
              <div className="text-gray-300">
                <span className="text-gray-400">Snapshot:</span> {config.snapshot ? 'Yes' : 'No'}
              </div>
              {config.ptz.enabled && (
                <div className="text-gray-300">
                  <span className="text-gray-400">PTZ Action:</span> {config.ptz.actionType} #{config.ptz.actionNumber}
                </div>
              )}
            </div>
          </div>
        </>
      )}

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={onSave}
          className="py-3 px-8 bg-gradient-to-r from-amber-600 to-amber-700 hover:from-amber-500 hover:to-amber-600 text-white rounded-lg transition-all font-medium shadow-lg transform hover:scale-105"
        >
          Save Configuration
        </button>
      </div>

      {/* Schedule Modal */}
      {showScheduleModal && (
        <ScheduleSetupModal
          scheduledPeriods={config.scheduledPeriods}
          onSave={(periods) => {
            updateConfig({ scheduledPeriods: periods });
            setShowScheduleModal(false);
          }}
          onClose={() => setShowScheduleModal(false)}
        />
      )}

      {/* Rule Setup Modal */}
      {showRuleModal && (
        <RuleSetupModal
          abandonedObjectRules={config.abandonedObjectRules}
          onSave={(rules) => {
            updateConfig({ abandonedObjectRules: rules });
            setShowRuleModal(false);
          }}
          onClose={() => setShowRuleModal(false)}
        />
      )}
    </div>
  );
};

// Schedule Setup Modal Component
interface ScheduleSetupModalProps {
  scheduledPeriods: ScheduledPeriod[];
  onSave: (periods: ScheduledPeriod[]) => void;
  onClose: () => void;
}

const ScheduleSetupModal: React.FC<ScheduleSetupModalProps> = ({
  scheduledPeriods,
  onSave,
  onClose,
}) => {
  const [periods, setPeriods] = useState<ScheduledPeriod[]>(
    scheduledPeriods.length > 0
      ? scheduledPeriods
      : [
          {
            id: 1,
            dayOfWeek: 'all',
            periods: Array(6).fill(null).map(() => ({
              enabled: false,
              startTime: '00:00',
              endTime: '23:59',
            })),
          },
        ]
  );

  const [selectedDay, setSelectedDay] = useState<'all' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'>('all');

  const days: { value: 'all' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat'; label: string }[] = [
    { value: 'all', label: 'All Days' },
    { value: 'sun', label: 'Sunday' },
    { value: 'mon', label: 'Monday' },
    { value: 'tue', label: 'Tuesday' },
    { value: 'wed', label: 'Wednesday' },
    { value: 'thu', label: 'Thursday' },
    { value: 'fri', label: 'Friday' },
    { value: 'sat', label: 'Saturday' },
  ];

  const getCurrentDaySchedule = () => {
    return periods.find(p => p.dayOfWeek === selectedDay) || {
      id: Date.now(),
      dayOfWeek: selectedDay,
      periods: Array(6).fill(null).map(() => ({
        enabled: false,
        startTime: '00:00',
        endTime: '23:59',
      })),
    };
  };

  const updateDaySchedule = (dayOfWeek: typeof selectedDay, updatedPeriods: ScheduledPeriod['periods']) => {
    const existingIndex = periods.findIndex(p => p.dayOfWeek === dayOfWeek);
    let newPeriods = [...periods];
    
    if (existingIndex >= 0) {
      newPeriods[existingIndex] = {
        ...newPeriods[existingIndex],
        periods: updatedPeriods,
      };
    } else {
      newPeriods.push({
        id: Date.now(),
        dayOfWeek,
        periods: updatedPeriods,
      });
    }
    
    setPeriods(newPeriods);
  };

  const currentSchedule = getCurrentDaySchedule();

  const handlePeriodToggle = (index: number) => {
    const newPeriods = [...currentSchedule.periods];
    newPeriods[index].enabled = !newPeriods[index].enabled;
    updateDaySchedule(selectedDay, newPeriods);
  };

  const handleTimeChange = (index: number, field: 'startTime' | 'endTime', value: string) => {
    const newPeriods = [...currentSchedule.periods];
    newPeriods[index][field] = value;
    updateDaySchedule(selectedDay, newPeriods);
  };

  const handleSave = () => {
    onSave(periods);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h4 className="text-white font-medium text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Scheduled Period Setup
          </h4>
          <p className="text-gray-400 text-sm mt-1">
            Configure up to 6 time periods for each day. Alarm events will only be triggered within set time periods.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          <div>
            <label className="block text-white font-medium mb-3 text-sm">Select Day of Week</label>
            <div className="grid grid-cols-4 gap-2">
              {days.map((day) => (
                <button
                  key={day.value}
                  onClick={() => setSelectedDay(day.value)}
                  className={`py-2 px-3 rounded-lg border-2 transition-all font-medium text-sm ${
                    selectedDay === day.value
                      ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-lg'
                      : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                  }`}
                >
                  {day.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-white font-medium mb-3 text-sm">
              Time Periods for {days.find(d => d.value === selectedDay)?.label}
            </label>
            
            <div className="space-y-3">
              {currentSchedule.periods.map((period, index) => (
                <div
                  key={index}
                  className={`bg-gray-900/50 rounded-lg p-4 border-2 transition-all ${
                    period.enabled ? 'border-green-500/50' : 'border-gray-700'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={period.enabled}
                        onChange={() => handlePeriodToggle(index)}
                        className="w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-white font-medium text-sm">Period {index + 1}</span>
                    </label>

                    <div className="flex-1 flex items-center gap-3">
                      <div className="flex-1">
                        <label className="block text-gray-400 text-xs mb-1">Start Time</label>
                        <input
                          type="time"
                          value={period.startTime}
                          onChange={(e) => handleTimeChange(index, 'startTime', e.target.value)}
                          disabled={!period.enabled}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500"
                        />
                      </div>
                      
                      <svg className="w-4 h-4 text-gray-500 mt-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>

                      <div className="flex-1">
                        <label className="block text-gray-400 text-xs mb-1">End Time</label>
                        <input
                          type="time"
                          value={period.endTime}
                          onChange={(e) => handleTimeChange(index, 'endTime', e.target.value)}
                          disabled={!period.enabled}
                          className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:border-blue-500"
                        />
                      </div>
                    </div>

                    {period.enabled && (
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                        <span className="text-green-400 text-xs font-medium">Active</span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
            <div className="flex gap-3">
              <svg className="w-5 h-5 text-blue-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-300">
                <p className="text-blue-200/90">
                  • Check the box to enable a time period<br />
                  • Configure up to 6 time periods per day<br />
                  • "All Days" applies settings to the entire week<br />
                  • Individual day settings override "All Days"
                </p>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg transition-all font-medium shadow-lg"
          >
            Save Schedule
          </button>
        </div>
      </div>
    </div>
  );
};

// Rule Setup Modal Component
interface RuleSetupModalProps {
  abandonedObjectRules: AbandonedObjectRule[];
  onSave: (rules: AbandonedObjectRule[]) => void;
  onClose: () => void;
}

const RuleSetupModal: React.FC<RuleSetupModalProps> = ({
  abandonedObjectRules,
  onSave,
  onClose,
}) => {
  const [rules, setRules] = useState<AbandonedObjectRule[]>(abandonedObjectRules);
  const [selectedRuleId, setSelectedRuleId] = useState<number | null>(
    abandonedObjectRules.length > 0 ? abandonedObjectRules[0].id : null
  );

  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const selectedRule = rules.find(r => r.id === selectedRuleId);

  const handleAddRule = () => {
    if (rules.length >= 4) return;

    const newRule: AbandonedObjectRule = {
      id: Date.now(),
      name: `Rule${rules.length + 1}`,
      color: colors[rules.length % colors.length],
      trackingTime: 30, // Default 30 seconds
      targetFilter: {
        minSize: 10, // Smaller than people
        maxSize: 50,
      },
      sensitivity: 50,
      coordinates: [],
    };

    setRules([...rules, newRule]);
    setSelectedRuleId(newRule.id);
  };

  const handleDeleteRule = (id: number) => {
    const newRules = rules.filter(r => r.id !== id);
    setRules(newRules);
    if (selectedRuleId === id) {
      setSelectedRuleId(newRules.length > 0 ? newRules[0].id : null);
    }
  };

  const handleRemoveAll = () => {
    if (confirm('Are you sure you want to remove all detection rules?')) {
      setRules([]);
      setSelectedRuleId(null);
    }
  };

  const handleUpdateRule = (id: number, updates: Partial<AbandonedObjectRule>) => {
    setRules(rules.map(r => r.id === id ? { ...r, ...updates } : r));
  };

  const handleSave = () => {
    onSave(rules);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="p-6 border-b border-gray-700">
          <h4 className="text-white font-medium text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-amber-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
            Draw Detection Rules
          </h4>
          <p className="text-gray-400 text-sm mt-1">
            Define regions and configure tracking time for abandoned object detection. Use target size filters to exclude people/vehicles.
          </p>
        </div>

        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Video Preview Area */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm">Video Preview - Draw Regions</label>
              
              <div className="relative aspect-video bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden">
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Live Camera Feed</p>
                    <p className="text-gray-600 text-xs mt-1">Draw detection regions here</p>
                  </div>
                </div>

                {/* Rules Overlay */}
                {rules.map((rule) => (
                  <div
                    key={rule.id}
                    className={`absolute inset-4 border-4 rounded-lg pointer-events-none transition-opacity ${
                      selectedRuleId === rule.id ? 'opacity-70' : 'opacity-30'
                    }`}
                    style={{
                      borderColor: rule.color,
                      backgroundColor: `${rule.color}20`,
                    }}
                  >
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold"
                      style={{ backgroundColor: rule.color, color: 'white' }}
                    >
                      {rule.name} ({rule.trackingTime}s)
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleAddRule}
                  disabled={rules.length >= 4}
                  className="flex-1 py-2 px-4 bg-amber-600 hover:bg-amber-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm"
                >
                  Add Rule ({rules.length}/4)
                </button>
                <button
                  onClick={handleRemoveAll}
                  disabled={rules.length === 0}
                  className="py-2 px-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm"
                >
                  Remove All
                </button>
              </div>
            </div>

            {/* Right: Rule Configuration */}
            <div className="space-y-4">
              <label className="block text-white font-medium mb-3 text-sm">Rule Configuration</label>

              {/* Rules List */}
              <div className="space-y-2">
                {rules.map((rule) => (
                  <button
                    key={rule.id}
                    onClick={() => setSelectedRuleId(rule.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedRuleId === rule.id
                        ? 'border-amber-500 bg-amber-500/10'
                        : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: rule.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{rule.name}</div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          Tracking: {rule.trackingTime}s • Size: {rule.targetFilter.minSize}-{rule.targetFilter.maxSize}
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteRule(rule.id);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </button>
                ))}

                {rules.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No detection rules configured.<br />
                    Click "Add Rule" to create one.
                  </div>
                )}
              </div>

              {/* Selected Rule Settings */}
              {selectedRule && (
                <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 space-y-4">
                  <h5 className="text-white font-medium text-sm">Settings for {selectedRule.name}</h5>

                  {/* Name */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-2">Rule Name</label>
                    <input
                      type="text"
                      value={selectedRule.name}
                      onChange={(e) => handleUpdateRule(selectedRule.id, { name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      placeholder="Enter rule name"
                    />
                  </div>

                  {/* Tracking Time */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-2">
                      Tracking Time (Shortest time from leaving object to trigger alarm)
                    </label>
                    <div className="flex items-center gap-2">
                      <input
                        type="number"
                        min="5"
                        max="3600"
                        value={selectedRule.trackingTime}
                        onChange={(e) => handleUpdateRule(selectedRule.id, { trackingTime: parseInt(e.target.value) || 30 })}
                        className="flex-1 bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-amber-500"
                      />
                      <span className="text-gray-400 text-sm">seconds</span>
                    </div>
                    <p className="text-gray-500 text-xs mt-1">Extend this to reduce false alarms from brief human stays</p>
                  </div>

                  {/* Target Filter - Min Size */}
                  <div>
                    <label className="flex items-center justify-between text-gray-400 text-xs mb-2">
                      <span>Minimum Target Size (Filter out smaller objects)</span>
                      <span className="text-white font-bold">{selectedRule.targetFilter.minSize}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedRule.targetFilter.minSize}
                      onChange={(e) => handleUpdateRule(selectedRule.id, { 
                        targetFilter: { ...selectedRule.targetFilter, minSize: parseInt(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${selectedRule.color} 0%, ${selectedRule.color} ${selectedRule.targetFilter.minSize}%, #374151 ${selectedRule.targetFilter.minSize}%, #374151 100%)`
                      }}
                    />
                  </div>

                  {/* Target Filter - Max Size */}
                  <div>
                    <label className="flex items-center justify-between text-gray-400 text-xs mb-2">
                      <span>Maximum Target Size (Filter out people/vehicles)</span>
                      <span className="text-white font-bold">{selectedRule.targetFilter.maxSize}</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedRule.targetFilter.maxSize}
                      onChange={(e) => handleUpdateRule(selectedRule.id, { 
                        targetFilter: { ...selectedRule.targetFilter, maxSize: parseInt(e.target.value) }
                      })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${selectedRule.color} 0%, ${selectedRule.color} ${selectedRule.targetFilter.maxSize}%, #374151 ${selectedRule.targetFilter.maxSize}%, #374151 100%)`
                      }}
                    />
                    <p className="text-gray-500 text-xs mt-1">Set lower to exclude people/vehicles staying too long</p>
                  </div>

                  {/* Sensitivity */}
                  <div>
                    <label className="flex items-center justify-between text-gray-400 text-xs mb-2">
                      <span>Sensitivity</span>
                      <span className="text-white font-bold">{selectedRule.sensitivity}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedRule.sensitivity}
                      onChange={(e) => handleUpdateRule(selectedRule.id, { sensitivity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${selectedRule.color} 0%, ${selectedRule.color} ${selectedRule.sensitivity}%, #374151 ${selectedRule.sensitivity}%, #374151 100%)`
                      }}
                    />
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-3">
                <div className="text-sm text-amber-300">
                  <p className="text-amber-200/90 text-xs">
                    <strong>Configuration Tips:</strong><br />
                    • Abandoned objects are typically smaller than people/vehicles<br />
                    • Use size filters to exclude pedestrians staying briefly<br />
                    • Increase tracking time to reduce false positives<br />
                    • Works best in areas with simple textures and stable lighting
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="p-6 border-t border-gray-700 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2 px-4 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-all font-medium"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white rounded-lg transition-all font-medium shadow-lg"
          >
            Save Rules
          </button>
        </div>
      </div>
    </div>
  );
};

export default AbandonedObject;
