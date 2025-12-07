// components/camera/PresetManagement.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { usePresets as usePtzPreset } from "../../hooks/useCameraQueries";
import { useSetPreset as useSetPtzPreset } from "../../hooks/useCameraMutations";
import { useGotoPreset as useSetPTZStatus } from "../../hooks/useCameraMutations";
import { useClearPreset } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Preset {
  id: number; // API: PresetId index (0-127)
  title: string; // API: Name
  enabled: boolean; // API: Enable
  position: {
    pan: number; // API: Position[0]
    tilt: number; // API: Position[1]
    zoom: number; // API: Position[2]
  };
}

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Parses API response to UI state.
 * Iterates through table.PtzPreset[0][i] to find valid presets.
 * Based on provided JSON, max index goes up to 127.
 */

const apiToUI = (data: any): Preset[] => {
  if (!data || !data.presets) return [];

  const config = data.presets;
  const presets: Preset[] = [];
  const MAX_PRESETS = 128; // 0-127 based on JSON

  for (let i = 0; i < MAX_PRESETS; i++) {
    const prefix = `table.PtzPreset[0][${i}].`;

    // Check if the preset exists in config
    if (config[`${prefix}Name`] !== undefined) {
      const enabledStr = String(config[`${prefix}Enable`] ?? "false");
      const name = config[`${prefix}Name`];
      const enabled = enabledStr === "true";

      // Only include if explicitly enabled
      if (enabled) {
        presets.push({
          id: i, // Use 0-based index to match API (important for gotoPreset calls)
          title: name || `Preset ${i + 1}`,
          enabled: enabled,
          position: {
            pan: Number(config[`${prefix}Position[0]`] ?? 0),
            tilt: Number(config[`${prefix}Position[1]`] ?? 0),
            zoom: Number(config[`${prefix}Position[2]`] ?? 0),
          },
        });
      }
    }
  }

  return presets;
};

// =============================================================================
// COMPONENT
// =============================================================================

const PresetManagement: React.FC = () => {
  const camId = useCamId();

  // 1. Data Fetching
  const { data: apiData, isLoading, error, refetch } = usePtzPreset(camId);

  // 2. Mutations
  const setPresetMutation = useSetPtzPreset(camId);
  const ptzActionMutation = useSetPTZStatus(camId);
  const clearPreset = useClearPreset(camId);
  // 3. Local State
  const [presets, setPresets] = useState<Preset[]>([]);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<number | null>(null);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      setPresets(apiToUI(apiData));
    }
  }, [apiData]);

  // Handlers

  // ADD: Saves CURRENT position to a new ID
  const handleAddPreset = () => {
    // Find first available ID (1-128)
    const usedIds = presets.map((p) => p.id);
    let newId = 1;
    while (usedIds.includes(newId) && newId <= 128) newId++;

    if (newId > 128) {
      alert("Maximum presets reached (128)");
      return;
    }

    const newTitle = `No${newId}`;
    const apiIndex = newId - 1; // 0-based index for API

    setPresetMutation.mutate(
      {
        Enable: true,
        Name: newTitle,
        id : apiIndex
      },
      {
        onSuccess: () => refetch(), // Refresh list to get new coordinates if API updates them
      }
    );
  };

  // GOTO: Moves camera to preset
  const handleGotoPreset = (id: number) => {
    setSelectedPresetId(id);
    ptzActionMutation.mutate({
      id,
    });
  };

  // DELETE: Clears preset
  const handleDeletePreset = (id: number) => {
    // 1. Clear via PTZ command
    clearPreset.mutate({
      id,
    });
  };

  // RENAME
  const handleTitleBlur = () => {
    if (editingId !== null) {
      const apiIndex = editingId - 1;
      setPresetMutation.mutate(
        {
          [`table.PtzPreset[0][${apiIndex}].Name`]: editingTitle,
        },
        {
          onSuccess: () => {
            setPresets((prev) =>
              prev.map((p) =>
                p.id === editingId ? { ...p, title: editingTitle } : p
              )
            );
            setEditingId(null);
          },
        }
      );
    }
  };

  const handleDoubleClick = (preset: Preset) => {
    setEditingId(preset.id);
    setEditingTitle(preset.title);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleTitleBlur();
    else if (e.key === "Escape") setEditingId(null);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-red-500"></div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-white font-medium flex items-center gap-2">
          <svg
            className="w-5 h-5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
            />
          </svg>
          Points de Préréglage (Presets)
        </h3>
        <span className="text-sm text-gray-400">{presets.length} actif(s)</span>
      </div>

      {/* Instructions */}
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
          <div className="text-sm text-blue-300 space-y-1">
            <p>
              <strong>Instructions :</strong>
            </p>
            <ol className="list-decimal list-inside space-y-1 text-blue-200/90">
              <li>Positionnez la caméra (Pan/Tilt/Zoom).</li>
              <li>
                Cliquez sur "Ajouter Preset" pour sauvegarder la position
                actuelle.
              </li>
              <li>Double-cliquez sur un nom pour le renommer.</li>
              <li>Cliquez sur "Go" pour appeler le préréglage.</li>
            </ol>
          </div>
        </div>
      </div>

      {/* Add Preset Button */}
      <button
        onClick={handleAddPreset}
        disabled={ptzActionMutation.isPending || setPresetMutation.isPending}
        className="w-full bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white py-3 px-4 rounded-lg border border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 font-medium disabled:opacity-50"
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
        {ptzActionMutation.isPending
          ? "Enregistrement..."
          : "Ajouter Preset (Position Actuelle)"}
      </button>

      {/* Presets List */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
        {presets.length === 0 ? (
          <div className="p-8 text-center">
            <svg
              className="w-16 h-16 text-gray-600 mx-auto mb-3"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
              />
            </svg>
            <p className="text-gray-400 text-sm">
              Aucun préréglage enregistré.
            </p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {presets.map((preset) => (
              <div
                key={preset.id}
                className={`p-4 hover:bg-gray-700/30 transition-colors ${
                  selectedPresetId === preset.id
                    ? "bg-red-500/10 border-l-4 border-red-500"
                    : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  {/* Badge */}
                  <div className="flex-shrink-0 w-10 h-10 bg-gradient-to-br from-red-600 to-red-700 rounded-lg flex items-center justify-center text-white font-bold shadow-lg">
                    {preset.id}
                  </div>

                  {/* Title */}
                  <div className="flex-1 min-w-0">
                    {editingId === preset.id ? (
                      <input
                        type="text"
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
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
                          Double-cliquez pour renommer
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleGotoPreset(preset.id)}
                      className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 text-white px-4 py-2 rounded-lg border border-green-500 transition-all duration-200 shadow-lg hover:shadow-green-500/50 flex items-center gap-2 text-sm font-medium"
                      title="Aller vers"
                    >
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M14 5l7 7m0 0l-7 7m7-7H3"
                        />
                      </svg>
                      Go
                    </button>

                    <button
                      onClick={() => handleDeletePreset(preset.id)}
                      className="bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 text-gray-400 hover:text-white p-2 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50"
                      title="Supprimer"
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

                {/* Position Details (Read-only if available) */}
                {(preset.position.pan !== 0 ||
                  preset.position.tilt !== 0 ||
                  preset.position.zoom !== 0) && (
                  <div className="mt-3 grid grid-cols-3 gap-2 text-xs">
                    <div className="bg-gray-700/50 rounded px-2 py-1">
                      <p className="text-gray-400">Pan</p>
                      <p className="text-white font-mono">
                        {preset.position.pan.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 rounded px-2 py-1">
                      <p className="text-gray-400">Tilt</p>
                      <p className="text-white font-mono">
                        {preset.position.tilt.toFixed(1)}
                      </p>
                    </div>
                    <div className="bg-gray-700/50 rounded px-2 py-1">
                      <p className="text-gray-400">Zoom</p>
                      <p className="text-white font-mono">
                        {preset.position.zoom}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PresetManagement;
