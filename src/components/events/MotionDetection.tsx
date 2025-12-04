"use client"

import React, { useState } from 'react';

export interface ScheduledPeriod {
  id: number;
  dayOfWeek: 'all' | 'sun' | 'mon' | 'tue' | 'wed' | 'thu' | 'fri' | 'sat';
  periods: {
    enabled: boolean;
    startTime: string; // HH:mm
    endTime: string; // HH:mm
  }[];
}

export interface DetectionArea {
  id: number;
  name: string;
  color: string;
  sensitivity: number; // 0-100
  threshold: number; // 0-100
  coordinates: { x: number; y: number }[];
}

export interface MotionDetectionConfig {
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
  detectionAreas: DetectionArea[];
}

interface MotionDetectionProps {
  config: MotionDetectionConfig;
  onConfigChange: (config: MotionDetectionConfig) => void;
  onSave: () => void;
}

const MotionDetection: React.FC<MotionDetectionProps> = ({
  config,
  onConfigChange,
  onSave,
}) => {
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [showAreaModal, setShowAreaModal] = useState(false);

  const updateConfig = (updates: Partial<MotionDetectionConfig>) => {
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
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
          </svg>
          Motion Detection
        </h3>
      </div>

      {/* Instructions */}
      <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
        <div className="flex gap-3">
          <svg className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-blue-300">
            <p><strong>Motion Detection:</strong></p>
            <p className="text-blue-200/90 mt-1">
              Detect motion in the camera view and trigger alarms, recordings, or other actions. Configure detection areas, sensitivity, and response actions.
            </p>
          </div>
        </div>
      </div>

      {/* Main Configuration */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 p-6 space-y-6">
        {/* Step 2: Enable/Disable */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">
            Step 2: Enable Motion Detection
          </label>
          
          <div className="flex gap-3">
            <button
              onClick={() => updateConfig({ enabled: true })}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                config.enabled
                  ? 'bg-gradient-to-br from-green-600 to-green-700 border-green-500 text-white shadow-lg'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                ON
              </div>
            </button>
            <button
              onClick={() => updateConfig({ enabled: false })}
              className={`flex-1 py-3 px-4 rounded-lg border-2 transition-all font-medium ${
                !config.enabled
                  ? 'bg-gradient-to-br from-red-600 to-red-700 border-red-500 text-white shadow-lg'
                  : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                </svg>
                OFF
              </div>
            </button>
          </div>
        </div>

        {/* Anti-Dither */}
        <div>
          <label className="flex items-center gap-2 text-white font-medium mb-3 text-sm">
            Anti-Dither
            <span className="text-gray-400 text-xs font-normal">(0-100 seconds)</span>
          </label>
          
          <div className="space-y-3">
            <input
              type="range"
              min="0"
              max="100"
              value={config.antiDither}
              onChange={handleAntiDitherChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              style={{
                background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${config.antiDither}%, #374151 ${config.antiDither}%, #374151 100%)`
              }}
            />
            
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Current Value:</span>
                <span className="text-white font-mono font-bold text-lg">{config.antiDither}s</span>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Motion detection time is recorded only once in this anti-dither period
              </p>
            </div>
          </div>
        </div>

        {/* Record */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={config.record}
                onChange={(e) => updateConfig({ record: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-14 h-7 rounded-full transition-colors ${
                config.record ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  config.record ? 'translate-x-7' : 'translate-x-0'
                }`}></div>
              </div>
            </div>
            <div className="flex-1">
              <span className="text-white font-medium text-sm">Record</span>
              <p className="text-gray-400 text-xs mt-0.5">
                Automatically record when local alarm occurs (requires alarm video taking period in Storage Management)
              </p>
            </div>
          </label>
        </div>

        {/* Record Delay */}
        {config.record && (
          <div className="ml-16 space-y-3">
            <label className="flex items-center gap-2 text-white font-medium text-sm">
              Record Delay
              <span className="text-gray-400 text-xs font-normal">(10-300 seconds)</span>
            </label>
            
            <input
              type="range"
              min="10"
              max="300"
              step="10"
              value={config.recordDelay}
              onChange={handleRecordDelayChange}
              className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-red-600"
              style={{
                background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${((config.recordDelay - 10) / 290) * 100}%, #374151 ${((config.recordDelay - 10) / 290) * 100}%, #374151 100%)`
              }}
            />
            
            <div className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
              <div className="flex items-center justify-between">
                <span className="text-gray-400 text-sm">Delay Time:</span>
                <span className="text-white font-mono font-bold text-lg">{config.recordDelay}s</span>
              </div>
              <p className="text-gray-500 text-xs mt-2">
                Continue recording for this period after alarm stops
              </p>
            </div>
          </div>
        )}

        {/* Send Email */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={config.sendEmail}
                onChange={(e) => updateConfig({ sendEmail: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-14 h-7 rounded-full transition-colors ${
                config.sendEmail ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  config.sendEmail ? 'translate-x-7' : 'translate-x-0'
                }`}></div>
              </div>
            </div>
            <div className="flex-1">
              <span className="text-white font-medium text-sm">Send Email</span>
              <p className="text-gray-400 text-xs mt-0.5">
                Send email notification when alarm occurs (configure email in SMTP settings)
              </p>
            </div>
          </label>
        </div>

        {/* PTZ Linkage */}
        <div className="space-y-4">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={config.ptz.enabled}
                onChange={(e) => updateConfig({ ptz: { ...config.ptz, enabled: e.target.checked } })}
                className="sr-only"
              />
              <div className={`w-14 h-7 rounded-full transition-colors ${
                config.ptz.enabled ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  config.ptz.enabled ? 'translate-x-7' : 'translate-x-0'
                }`}></div>
              </div>
            </div>
            <div className="flex-1">
              <span className="text-white font-medium text-sm">PTZ Linkage</span>
              <p className="text-gray-400 text-xs mt-0.5">
                Link to PTZ preset point, tour, or pattern when alarm occurs
              </p>
            </div>
          </label>

          {config.ptz.enabled && (
            <div className="ml-16 space-y-3">
              {/* PTZ Action Type */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">Action Type</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    onClick={() => updateConfig({ ptz: { ...config.ptz, actionType: 'preset', actionNumber: 0 } })}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      config.ptz.actionType === 'preset'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white'
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    Preset
                  </button>
                  <button
                    onClick={() => updateConfig({ ptz: { ...config.ptz, actionType: 'tour', actionNumber: 0 } })}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      config.ptz.actionType === 'tour'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white'
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    Tour
                  </button>
                  <button
                    onClick={() => updateConfig({ ptz: { ...config.ptz, actionType: 'pattern', actionNumber: 0 } })}
                    className={`py-2 px-3 rounded-lg border-2 transition-all text-sm font-medium ${
                      config.ptz.actionType === 'pattern'
                        ? 'bg-gradient-to-r from-red-600 to-red-700 border-red-500 text-white'
                        : 'bg-gray-700/50 border-gray-600 text-gray-300 hover:border-gray-500'
                    }`}
                  >
                    Pattern
                  </button>
                </div>
              </div>

              {/* PTZ Action Number */}
              <div>
                <label className="block text-white font-medium mb-2 text-sm">
                  {config.ptz.actionType.charAt(0).toUpperCase() + config.ptz.actionType.slice(1)} Number
                </label>
                <input
                  type="number"
                  min="1"
                  max="255"
                  value={config.ptz.actionNumber || ''}
                  onChange={(e) => updateConfig({ ptz: { ...config.ptz, actionNumber: parseInt(e.target.value) || 0 } })}
                  placeholder="Enter number"
                  className="w-full bg-gray-900/50 border border-gray-700 rounded-lg px-3 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-red-500"
                />
              </div>
            </div>
          )}
        </div>

        {/* Snapshot */}
        <div>
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input
                type="checkbox"
                checked={config.snapshot}
                onChange={(e) => updateConfig({ snapshot: e.target.checked })}
                className="sr-only"
              />
              <div className={`w-14 h-7 rounded-full transition-colors ${
                config.snapshot ? 'bg-green-600' : 'bg-gray-600'
              }`}>
                <div className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform ${
                  config.snapshot ? 'translate-x-7' : 'translate-x-0'
                }`}></div>
              </div>
            </div>
            <div className="flex-1">
              <span className="text-white font-medium text-sm">Snapshot</span>
              <p className="text-gray-400 text-xs mt-0.5">
                Automatically capture image when alarm occurs
              </p>
            </div>
          </label>
        </div>

        {/* Scheduled Period */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">Scheduled Period</label>
          
          <button
            onClick={() => setShowScheduleModal(true)}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white py-3 px-4 rounded-lg border border-blue-500 transition-all duration-200 shadow-lg hover:shadow-blue-500/50 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Setup Schedule
            {config.scheduledPeriods.length > 0 && (
              <span className="ml-2 bg-blue-800/50 px-2 py-0.5 rounded text-xs">
                {config.scheduledPeriods.length} period{config.scheduledPeriods.length > 1 ? 's' : ''}
              </span>
            )}
          </button>

          <p className="text-gray-400 text-xs mt-2">
            Set time periods when motion detection will be active. Alarm events will only be triggered within the set time periods.
          </p>
        </div>

        {/* Setup Area */}
        <div>
          <label className="block text-white font-medium mb-3 text-sm">Detection Areas</label>
          
          <button
            onClick={() => setShowAreaModal(true)}
            className="w-full bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-500 hover:to-purple-600 text-white py-3 px-4 rounded-lg border border-purple-500 transition-all duration-200 shadow-lg hover:shadow-purple-500/50 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Setup Areas
            {config.detectionAreas.length > 0 && (
              <span className="ml-2 bg-purple-800/50 px-2 py-0.5 rounded text-xs">
                {config.detectionAreas.length} area{config.detectionAreas.length > 1 ? 's' : ''}
              </span>
            )}
          </button>

          <p className="text-gray-400 text-xs mt-2">
            Define detection regions with custom sensitivity and threshold settings (Region1, Region2, Region3, Region4)
          </p>

          {/* Area List */}
          {config.detectionAreas.length > 0 && (
            <div className="mt-3 space-y-2">
              {config.detectionAreas.map((area) => (
                <div key={area.id} className="bg-gray-900/50 rounded-lg p-3 border border-gray-700">
                  <div className="flex items-center gap-3">
                    <div 
                      className="w-4 h-4 rounded"
                      style={{ backgroundColor: area.color }}
                    ></div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-white font-medium text-sm">{area.name}</span>
                        <button
                          onClick={() => {
                            updateConfig({
                              detectionAreas: config.detectionAreas.filter(a => a.id !== area.id)
                            });
                          }}
                          className="text-red-400 hover:text-red-300 text-xs"
                        >
                          Delete
                        </button>
                      </div>
                      <div className="text-gray-400 text-xs space-y-0.5">
                        <div>Sensitivity: {area.sensitivity}%</div>
                        <div>Threshold: {area.threshold}%</div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Step 3: Save Button */}
        <div className="pt-4 border-t border-gray-700">
          <label className="block text-white font-medium mb-3 text-sm">
            Step 3: Save Configuration
          </label>
          
          <button
            onClick={onSave}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white py-3 px-4 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center justify-center gap-2 font-medium"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
            </svg>
            Save Motion Detection Settings
          </button>
        </div>
      </div>

      {/* Configuration Summary */}
      {config.enabled && (
        <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-4">
          <div className="flex gap-3">
            <svg className="w-5 h-5 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <div className="text-sm text-green-300">
              <strong>Motion Detection is Active</strong>
              <div className="space-y-1 mt-2 text-green-200/90 text-xs">
                <p>• Anti-Dither: {config.antiDither}s</p>
                {config.record && <p>• Recording enabled (Delay: {config.recordDelay}s)</p>}
                {config.sendEmail && <p>• Email notifications enabled</p>}
                {config.ptz.enabled && <p>• PTZ linkage: {config.ptz.actionType} #{config.ptz.actionNumber}</p>}
                {config.snapshot && <p>• Snapshot capture enabled</p>}
                {config.detectionAreas.length > 0 && <p>• Detection areas: {config.detectionAreas.length} configured</p>}
              </div>
            </div>
          </div>
        </div>
      )}

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

      {/* Area Setup Modal */}
      {showAreaModal && (
        <AreaSetupModal
          detectionAreas={config.detectionAreas}
          onSave={(areas) => {
            updateConfig({ detectionAreas: areas });
            setShowAreaModal(false);
          }}
          onClose={() => setShowAreaModal(false)}
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
        {/* Header */}
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

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Day Selection */}
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

          {/* Time Periods */}
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
                    {/* Enable Checkbox */}
                    <label className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={period.enabled}
                        onChange={() => handlePeriodToggle(index)}
                        className="w-4 h-4 rounded border-gray-600 text-green-600 focus:ring-green-500 focus:ring-offset-gray-800"
                      />
                      <span className="text-white font-medium text-sm">Period {index + 1}</span>
                    </label>

                    {/* Time Inputs */}
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

                    {/* Status Indicator */}
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

          {/* Info Box */}
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

        {/* Footer */}
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

// Area Setup Modal Component
interface AreaSetupModalProps {
  detectionAreas: DetectionArea[];
  onSave: (areas: DetectionArea[]) => void;
  onClose: () => void;
}

const AreaSetupModal: React.FC<AreaSetupModalProps> = ({
  detectionAreas,
  onSave,
  onClose,
}) => {
  const [areas, setAreas] = useState<DetectionArea[]>(detectionAreas);
  const [selectedAreaId, setSelectedAreaId] = useState<number | null>(
    detectionAreas.length > 0 ? detectionAreas[0].id : null
  );

  const colors = ['#EF4444', '#3B82F6', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

  const selectedArea = areas.find(a => a.id === selectedAreaId);

  const handleAddArea = () => {
    if (areas.length >= 4) return;

    const newArea: DetectionArea = {
      id: Date.now(),
      name: `Region${areas.length + 1}`,
      color: colors[areas.length % colors.length],
      sensitivity: 50,
      threshold: 5,
      coordinates: [],
    };

    setAreas([...areas, newArea]);
    setSelectedAreaId(newArea.id);
  };

  const handleDeleteArea = (id: number) => {
    const newAreas = areas.filter(a => a.id !== id);
    setAreas(newAreas);
    if (selectedAreaId === id) {
      setSelectedAreaId(newAreas.length > 0 ? newAreas[0].id : null);
    }
  };

  const handleRemoveAll = () => {
    if (confirm('Are you sure you want to remove all detection areas?')) {
      setAreas([]);
      setSelectedAreaId(null);
    }
  };

  const handleUpdateArea = (id: number, updates: Partial<DetectionArea>) => {
    setAreas(areas.map(a => a.id === id ? { ...a, ...updates } : a));
  };

  const handleSave = () => {
    onSave(areas);
  };

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-6xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-6 border-b border-gray-700">
          <h4 className="text-white font-medium text-lg flex items-center gap-2">
            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
            </svg>
            Detection Area Setup
          </h4>
          <p className="text-gray-400 text-sm mt-1">
            Configure up to 4 detection regions with custom sensitivity and threshold settings.
          </p>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left: Video Preview Area */}
            <div>
              <label className="block text-white font-medium mb-3 text-sm">Video Preview</label>
              
              <div className="relative aspect-video bg-gray-900 rounded-lg border-2 border-gray-700 overflow-hidden">
                {/* Placeholder Video */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <svg className="w-16 h-16 text-gray-600 mx-auto mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-gray-500 text-sm">Live Camera Feed</p>
                    <p className="text-gray-600 text-xs mt-1">Draw detection areas here</p>
                  </div>
                </div>

                {/* Detection Areas Overlay */}
                {areas.map((area) => (
                  <div
                    key={area.id}
                    className={`absolute inset-4 border-4 rounded-lg pointer-events-none transition-opacity ${
                      selectedAreaId === area.id ? 'opacity-70' : 'opacity-30'
                    }`}
                    style={{
                      borderColor: area.color,
                      backgroundColor: `${area.color}20`,
                    }}
                  >
                    <div
                      className="absolute top-2 left-2 px-2 py-1 rounded text-xs font-bold"
                      style={{ backgroundColor: area.color, color: 'white' }}
                    >
                      {area.name}
                    </div>
                  </div>
                ))}
              </div>

              {/* Drawing Controls */}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={handleAddArea}
                  disabled={areas.length >= 4}
                  className="flex-1 py-2 px-4 bg-blue-600 hover:bg-blue-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm"
                >
                  Add Area ({areas.length}/4)
                </button>
                <button
                  onClick={handleRemoveAll}
                  disabled={areas.length === 0}
                  className="py-2 px-4 bg-red-600 hover:bg-red-500 disabled:bg-gray-600 disabled:cursor-not-allowed text-white rounded-lg transition-all font-medium text-sm"
                >
                  Remove All
                </button>
              </div>
            </div>

            {/* Right: Area Configuration */}
            <div className="space-y-4">
              <label className="block text-white font-medium mb-3 text-sm">Area Configuration</label>

              {/* Area List */}
              <div className="space-y-2">
                {areas.map((area) => (
                  <button
                    key={area.id}
                    onClick={() => setSelectedAreaId(area.id)}
                    className={`w-full text-left p-3 rounded-lg border-2 transition-all ${
                      selectedAreaId === area.id
                        ? 'border-purple-500 bg-purple-500/10'
                        : 'border-gray-700 bg-gray-900/50 hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="w-4 h-4 rounded flex-shrink-0"
                        style={{ backgroundColor: area.color }}
                      ></div>
                      <div className="flex-1">
                        <div className="text-white font-medium text-sm">{area.name}</div>
                        <div className="text-gray-400 text-xs mt-0.5">
                          Sensitivity: {area.sensitivity}% • Threshold: {area.threshold}%
                        </div>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteArea(area.id);
                        }}
                        className="text-red-400 hover:text-red-300 text-xs px-2 py-1 rounded hover:bg-red-500/10"
                      >
                        Delete
                      </button>
                    </div>
                  </button>
                ))}

                {areas.length === 0 && (
                  <div className="text-center py-8 text-gray-500 text-sm">
                    No detection areas configured.<br />
                    Click "Add Area" to create one.
                  </div>
                )}
              </div>

              {/* Selected Area Settings */}
              {selectedArea && (
                <div className="bg-gray-900/50 rounded-lg border border-gray-700 p-4 space-y-4">
                  <h5 className="text-white font-medium text-sm">Settings for {selectedArea.name}</h5>

                  {/* Name */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-2">Region Name</label>
                    <input
                      type="text"
                      value={selectedArea.name}
                      onChange={(e) => handleUpdateArea(selectedArea.id, { name: e.target.value })}
                      className="w-full bg-gray-700 border border-gray-600 rounded px-3 py-2 text-white text-sm focus:outline-none focus:border-purple-500"
                      placeholder="Enter region name"
                    />
                  </div>

                  {/* Sensitivity */}
                  <div>
                    <label className="flex items-center justify-between text-gray-400 text-xs mb-2">
                      <span>Sensitivity (Higher = Detect smaller changes)</span>
                      <span className="text-white font-bold">{selectedArea.sensitivity}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedArea.sensitivity}
                      onChange={(e) => handleUpdateArea(selectedArea.id, { sensitivity: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${selectedArea.color} 0%, ${selectedArea.color} ${selectedArea.sensitivity}%, #374151 ${selectedArea.sensitivity}%, #374151 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low (0)</span>
                      <span className="text-yellow-400">Recommended: 30-70</span>
                      <span>High (100)</span>
                    </div>
                  </div>

                  {/* Threshold */}
                  <div>
                    <label className="flex items-center justify-between text-gray-400 text-xs mb-2">
                      <span>Threshold (Lower = Trigger easier)</span>
                      <span className="text-white font-bold">{selectedArea.threshold}%</span>
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={selectedArea.threshold}
                      onChange={(e) => handleUpdateArea(selectedArea.id, { threshold: parseInt(e.target.value) })}
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer"
                      style={{
                        background: `linear-gradient(to right, ${selectedArea.color} 0%, ${selectedArea.color} ${selectedArea.threshold}%, #374151 ${selectedArea.threshold}%, #374151 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low (0)</span>
                      <span className="text-yellow-400">Recommended: 1-10</span>
                      <span>High (100)</span>
                    </div>
                  </div>

                  {/* Waveform Graph Placeholder */}
                  <div>
                    <label className="block text-gray-400 text-xs mb-2">Waveform Graph</label>
                    <div className="bg-gray-800 rounded border border-gray-700 h-20 flex items-center justify-center">
                      <p className="text-gray-600 text-xs">
                        <span className="text-red-400">Red</span> = Triggered • <span className="text-green-400">Green</span> = Normal
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Box */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <div className="text-sm text-blue-300">
                  <p className="text-blue-200/90 text-xs">
                    <strong>Tips:</strong><br />
                    • Up to 4 detection regions can be configured<br />
                    • Each area can have different sensitivity/threshold<br />
                    • Sensitivity: How sensitive to brightness changes<br />
                    • Threshold: Relationship between object and area size
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
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
            Save Areas
          </button>
        </div>
      </div>
    </div>
  );
};

export default MotionDetection;
