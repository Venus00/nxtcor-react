// components/camera/RecordSchedule.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useRecordSettings as useRecordSchedule } from "../../hooks/useCameraQueries";
import { useSetRecordSettings as useSetRecordSchedule } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface TimeSlot {
  start: string;
  end: string;
  type: "general"; // Simplified for this component
}

export interface DaySchedule {
  day: string;
  enabled: boolean;
  timeSlots: TimeSlot[];
}

export interface RecordScheduleData {
  monday: DaySchedule;
  tuesday: DaySchedule;
  wednesday: DaySchedule;
  thursday: DaySchedule;
  friday: DaySchedule;
  saturday: DaySchedule;
  sunday: DaySchedule;
  holiday?: DaySchedule; // Optional but part of API
}

// Map day index to key
const DAY_KEYS: (keyof RecordScheduleData)[] = [
  "sunday",
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
  "saturday",
  "holiday",
];

const defaultDay: DaySchedule = { day: "", enabled: false, timeSlots: [] };
const defaultState: RecordScheduleData = {
  sunday: { ...defaultDay, day: "Sunday" },
  monday: { ...defaultDay, day: "Monday" },
  tuesday: { ...defaultDay, day: "Tuesday" },
  wednesday: { ...defaultDay, day: "Wednesday" },
  thursday: { ...defaultDay, day: "Thursday" },
  friday: { ...defaultDay, day: "Friday" },
  saturday: { ...defaultDay, day: "Saturday" },
};

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Parses API TimeSection string "mask HH:mm:ss-HH:mm:ss"
 * Mask: 1=General, 2=Motion, 4=Alarm. (We focus on General=1 based on UI req)
 *
 */
const parseTimeSection = (val: string): TimeSlot | null => {
  if (!val || val.startsWith("0 ")) return null; // 0 mask = disabled

  // Format: "1 00:00:00-23:59:59"
  const parts = val.split(" ");
  const mask = parseInt(parts[0]);

  // Check if General (bit 0) is set. 1, 3(1+2), 5(1+4), 7(1+2+4) all contain General.
  if ((mask & 1) === 0) return null;

  const range = parts[1];
  if (!range || !range.includes("-")) return null;

  const [start, end] = range.split("-");
  return {
    start: start.substring(0, 5), // HH:mm
    end: end.substring(0, 5),
    type: "general",
  };
};

/**
 * API to UI
 *
 */
const apiToUI = (data: any): RecordScheduleData => {
  if (!data) return defaultState;

  const config = data.config || data;
  const prefix = "table.Record[0].TimeSection"; // Assuming Channel 0

  const result = { ...defaultState };

  // Loop through days (0-6 + 7 for Holiday)
  // API day index: 0=Sunday, 1=Monday...
  for (let d = 0; d < 7; d++) {
    const dayKey = DAY_KEYS[d];
    const slots: TimeSlot[] = [];

    // 6 periods per day
    for (let p = 0; p < 6; p++) {
      const key = `${prefix}[${d}][${p}]`;
      const val = config[key];
      if (val) {
        const slot = parseTimeSection(val);
        if (slot) slots.push(slot);
      }
    }

    result[dayKey] = {
      day: dayKey.charAt(0).toUpperCase() + dayKey.slice(1),
      enabled: slots.length > 0,
      timeSlots: slots,
    };
  }
  return result;
};

/**
 * UI to API
 *
 */
const uiToApi = (ui: RecordScheduleData) => {
  console.log("uiToApi called with:", ui);
  const prefix = "Record[0].TimeSection";
  const payload: any = {};

  // Loop through days 0-6
  for (let d = 0; d < 7; d++) {
    const dayKey = DAY_KEYS[d];
    const dayData = ui[dayKey];
    const slots = dayData?.timeSlots || [];
    console.log(`Processing day ${dayKey} with slots:`, slots);
    // Fill up to 6 slots
   
      const key = `${prefix}[${d}][0]`;
      if (slots.length) {
        const s = slots[0];
        // Construct "1 HH:mm:ss-HH:mm:ss" (Mask 1 for General)
        payload[key] = `1 ${s.start}:00-${s.end}:00`;
      } else {
        // Disable unused slots
        payload[key] = "0 00:00:00-23:59:59";
      }
    
  }
  console.log("Constructed payload:", payload);
  return payload;
};

// =============================================================================
// COMPONENT
// =============================================================================

const RecordSchedule: React.FC = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error } = useRecordSchedule(camId);
  const mutation = useSetRecordSchedule(camId);

  // Local State
  const [settings, setSettings] = useState<RecordScheduleData>(defaultState);
  const [selectedDay, setSelectedDay] =
    useState<keyof RecordScheduleData>("monday");
  const [showSetupModal, setShowSetupModal] = useState(false);
  const [editingSlots, setEditingSlots] = useState<TimeSlot[]>([]);
  const [isDirty, setIsDirty] = useState(false);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      setSettings(apiToUI(apiData));
      setIsDirty(false);
    }
  }, [apiData]);

  // Handlers
  const handleUpdate = (newSettings: RecordScheduleData) => {
    setSettings(newSettings);
    setIsDirty(true);
  };

  const handleSaveAll = () => {
    const payload = uiToApi(settings);
    mutation.mutate(payload);
    setIsDirty(false);
  };

  const handleSetupDay = (day: keyof RecordScheduleData) => {
    setSelectedDay(day);
    setEditingSlots([...settings[day].timeSlots]);
    setShowSetupModal(true);
  };

  const handleAddTimeSlot = () => {
    if (editingSlots.length < 6) {
      setEditingSlots([
        ...editingSlots,
        { start: "00:00", end: "23:59", type: "general" },
      ]);
    }
  };

  const handleRemoveTimeSlot = (index: number) => {
    setEditingSlots(editingSlots.filter((_, i) => i !== index));
  };

  const handleTimeSlotChange = (
    index: number,
    field: "start" | "end",
    value: string
  ) => {
    const newSlots = [...editingSlots];
    newSlots[index][field] = value;
    setEditingSlots(newSlots);
  };

  const handleSaveModal = () => {
    handleUpdate({
      ...settings,
      [selectedDay]: {
        ...settings[selectedDay],
        timeSlots: editingSlots,
        enabled: editingSlots.length > 0,
      },
    });
    setShowSetupModal(false);
  };

  const handleCopyToAll = () => {
    const newSettings = { ...settings };
    DAY_KEYS.forEach((key) => {
      // Skip holiday if not in UI keys
      if (key !== "holiday") {
        newSettings[key] = {
          ...newSettings[key],
          timeSlots: [...editingSlots],
          enabled: editingSlots.length > 0,
        };
      }
    });
    handleUpdate(newSettings);
  };

  const timeToPixels = (time: string): number => {
    const [hours, minutes] = time.split(":").map(Number);
    return ((hours * 60 + minutes) / (24 * 60)) * 100;
  };

  const daysList: { key: keyof RecordScheduleData; label: string }[] = [
    { key: "monday", label: "Monday" },
    { key: "tuesday", label: "Tuesday" },
    { key: "wednesday", label: "Wednesday" },
    { key: "thursday", label: "Thursday" },
    { key: "friday", label: "Friday" },
    { key: "saturday", label: "Saturday" },
    { key: "sunday", label: "Sunday" },
  ];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">
            Record Schedule
          </h2>
          <p className="text-gray-400 text-sm">
            Set up recording schedules (General) for each day of the week
          </p>
        </div>
        <button
          onClick={handleSaveAll}
          disabled={!isDirty || mutation.isPending}
          className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-lg transition-colors"
        >
          {mutation.isPending ? "Saving..." : "Save Schedule"}
        </button>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300">
          Error: {(error as Error).message}
        </div>
      )}
      {mutation.isSuccess && (
        <div className="p-3 rounded-lg bg-green-900/30 border border-green-700 text-green-300 text-sm">
          ✓ Schedule saved successfully!
        </div>
      )}

      {/* Schedule Grid */}
      <div className="space-y-3">
        {daysList.map(({ key, label }) => {
          const daySchedule = settings[key];
          return (
            <div
              key={key}
              className="bg-gray-800/50 rounded-lg border border-gray-700 p-4"
            >
              <div className="flex items-center gap-4">
                {/* Day Label */}
                <div className="w-32">
                  <span className="text-white font-medium">{label}</span>
                </div>

                {/* Timeline Visual */}
                <div className="flex-1 relative h-8 bg-gray-900 rounded border border-gray-600">
                  {/* Hour Markers */}
                  {[0, 6, 12, 18, 24].map((hour) => (
                    <div
                      key={hour}
                      className="absolute top-0 bottom-0 border-l border-gray-700"
                      style={{ left: `${(hour / 24) * 100}%` }}
                    >
                      <span className="absolute -bottom-5 -translate-x-1/2 text-xs text-gray-500">
                        {hour}:00
                      </span>
                    </div>
                  ))}

                  {/* Time Slots */}
                  {daySchedule.timeSlots.map((slot, idx) => {
                    const startPos = timeToPixels(slot.start);
                    const endPos = timeToPixels(slot.end);
                    const width = endPos - startPos;

                    return (
                      <div
                        key={idx}
                        className="absolute top-1 bottom-1 bg-green-500 rounded opacity-80 hover:opacity-100 transition-opacity"
                        style={{
                          left: `${startPos}%`,
                          width: `${width}%`,
                        }}
                        title={`${slot.start} - ${slot.end}`}
                      />
                    );
                  })}
                </div>

                {/* Setup Button */}
                <button
                  onClick={() => handleSetupDay(key)}
                  className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors text-sm font-medium"
                >
                  Setup
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-4">
        <h3 className="text-white font-medium mb-3">Legend</h3>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-4 bg-green-500 rounded"></div>
            <span className="text-gray-300 text-sm">General Recording</span>
          </div>
        </div>
      </div>

      {/* Setup Modal */}
      {showSetupModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-lg border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-gray-800 border-b border-gray-700 p-6">
              <h3 className="text-xl font-bold text-white">
                Schedule Settings -{" "}
                {daysList.find((d) => d.key === selectedDay)?.label}
              </h3>
              <p className="text-gray-400 text-sm mt-1">
                Configure up to 6 time periods for recording (General type)
              </p>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-4">
              {/* Time Slots */}
              {editingSlots.map((slot, index) => (
                <div
                  key={index}
                  className="bg-gray-900/50 rounded-lg border border-gray-700 p-4"
                >
                  <div className="flex items-center gap-4">
                    <div className="flex-1 grid grid-cols-2 gap-4">
                      {/* Start Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          Start Time
                        </label>
                        <input
                          type="time"
                          value={slot.start}
                          onChange={(e) =>
                            handleTimeSlotChange(index, "start", e.target.value)
                          }
                          className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        />
                      </div>

                      {/* End Time */}
                      <div>
                        <label className="block text-sm font-medium text-gray-300 mb-2">
                          End Time
                        </label>
                        <input
                          type="time"
                          value={slot.end}
                          onChange={(e) =>
                            handleTimeSlotChange(index, "end", e.target.value)
                          }
                          className="w-full bg-gray-800 border border-gray-600 text-white rounded-lg px-4 py-2 focus:ring-2 focus:ring-red-500 focus:border-transparent outline-none"
                        />
                      </div>
                    </div>

                    {/* Type Badge */}
                    <div className="flex items-center gap-2">
                      <div className="px-3 py-1 bg-green-500/20 text-green-400 rounded-lg text-sm font-medium border border-green-500/30">
                        General
                      </div>
                    </div>

                    {/* Remove Button */}
                    <button
                      onClick={() => handleRemoveTimeSlot(index)}
                      className="p-2 text-red-400 hover:bg-red-500/10 rounded-lg transition-colors"
                      title="Remove time slot"
                    >
                      <svg
                        className="w-5 h-5"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}

              {/* Add Time Slot Button */}
              {editingSlots.length < 6 && (
                <button
                  onClick={handleAddTimeSlot}
                  className="w-full py-3 border-2 border-dashed border-gray-600 text-gray-400 rounded-lg hover:border-red-500 hover:text-red-400 transition-colors flex items-center justify-center gap-2"
                >
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 4v16m8-8H4"
                    />
                  </svg>
                  Add Time Period ({editingSlots.length}/6)
                </button>
              )}

              {/* Info Note */}
              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-4">
                <div className="flex gap-3">
                  <svg
                    className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="text-sm text-blue-300">
                    <p className="font-medium mb-1">Note:</p>
                    <p>
                      Click "Copy to All Days" to apply this schedule to the
                      entire week.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-800 border-t border-gray-700 p-6 flex gap-3 justify-between">
              <button
                onClick={handleCopyToAll}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium"
              >
                Copy to All Days
              </button>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowSetupModal(false)}
                  className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors font-medium"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveModal}
                  className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors font-medium shadow-lg hover:shadow-red-500/25"
                >
                  Confirm (Local)
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RecordSchedule;
