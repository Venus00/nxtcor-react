// components/camera/TourManagement.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useTours as usePtzTour, usePresets } from "../../hooks/useCameraQueries";
import { useStartTour, useStopTour, useUpdateTour } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface TourPreset {
  presetId: number;
  presetName: string;
  duration: number; // in seconds
}

export interface Tour {
  id: number;
  name: string;
  presetCount: number;
  presets: TourPreset[];
}

export interface Preset {
  id: number;
  title: string;
}

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Parses API response to UI state.
 * Iterates through table.PtzTour[0][i].
 *
 */
const apiToUI = (data: any): Tour[] => {
  if (!data || !data.tours) return [];

  const config = data.tours;
  const tours: Tour[] = [];
  const MAX_TOURS = 31; // Typically 8 tours supported
 console.log("API Tour Data:", config);
  for (let i = 0; i < MAX_TOURS; i++) {
    const prefix = `table.PtzTour[0][${i}].`;

    // Check if tour is enabled or named
    const enabledStr = String(config[`${prefix}Enable`] ?? "false");
    const name = config[`${prefix}Name`];

    if (enabledStr === "true" || (name && name !== "None")) {
      const presets: TourPreset[] = [];

      // Get preset points
      for (let j = 0; j < 32; j++) {
        const pId = Number(config[`${prefix}Presets[${j}][0]`] ?? 0);
        const duration = Number(config[`${prefix}Presets[${j}][1]`] ?? 10);

        if (pId > 0) {
          presets.push({
            presetId: pId,
            presetName: `Preset ${pId}`,
            duration
          });
        }
      }

      tours.push({
        id: i + 1,
        name: name || `Tour ${i + 1}`,
        presetCount: presets.length,
        presets
      });
    }
  }
  return tours;
};

// =============================================================================
// COMPONENT
// =============================================================================

const TourManagement: React.FC = () => {
  const camId = 'cam2';
  
  // 1. Data Fetching
  const { data: apiData, isLoading, error, refetch } = usePtzTour(camId);
  const { data: presetsData } = usePresets(camId);

  // 2. Mutations
  const startTourMutation = useStartTour(camId);
  const stopTourMutation = useStopTour(camId);
  const updateTourMutation = useUpdateTour(camId);

  // 3. Local State
  const [tours, setTours] = useState<Tour[]>([]);
  const [availablePresets, setAvailablePresets] = useState<Preset[]>([]);
  const [activeTourId, setActiveTourId] = useState<number | null>(null);
  const [expandedTourId, setExpandedTourId] = useState<number | null>(null);
  const [editingTour, setEditingTour] = useState<Tour | null>(null);

  // 4. Sync API -> UI
  useEffect(() => {
    if (apiData) {
      setTours(apiToUI(apiData));
    }
  }, [apiData]);

  useEffect(() => {
    if (presetsData) {
      // Parse presets from API
      console.log("API Presets Data:", presetsData);
      const presets: Preset[] = [];
      // Assuming presetsData has similar structure
      for (let i = 0; i < 300; i++) {
        const name = presetsData.presets?.[`table.PtzPreset[0][${i}].Name`];
         const enable = presetsData.presets?.[`table.PtzPreset[0][${i}].Enable`] ?? "false";
        if (name && name !== "None" && enable === "true") {
          presets.push({ id: i + 1, title: name });
        }
      }
      setAvailablePresets(presets);
    }
  }, [presetsData]);

  // 5. Handlers
  const handleStart = (tourId: number) => {
    startTourMutation.mutate(tourId, {
      onSuccess: () => setActiveTourId(tourId)
    });
  };

  const handleStop = (tourId: number) => {
    stopTourMutation.mutate(tourId, {
      onSuccess: () => setActiveTourId(null)
    });
  };

  const handleEditTour = (tour: Tour) => {
    setEditingTour({ ...tour });
    setExpandedTourId(tour.id);
  };

  const handleAddPreset = (tourId: number) => {
    if (!editingTour || editingTour.id !== tourId) return;

    const newPreset: TourPreset = {
      presetId: availablePresets[0]?.id || 1,
      presetName: availablePresets[0]?.title || 'Preset 1',
      duration: 10
    };

    setEditingTour({
      ...editingTour,
      presets: [...editingTour.presets, newPreset],
      presetCount: editingTour.presets.length + 1
    });
  };

  const handleRemovePreset = (tourId: number, index: number) => {
    if (!editingTour || editingTour.id !== tourId) return;

    const newPresets = editingTour.presets.filter((_, i) => i !== index);
    setEditingTour({
      ...editingTour,
      presets: newPresets,
      presetCount: newPresets.length
    });
  };

  const handleUpdatePreset = (tourId: number, index: number, field: 'presetId' | 'duration', value: number) => {
    if (!editingTour || editingTour.id !== tourId) return;

    const newPresets = [...editingTour.presets];
    newPresets[index] = {
      ...newPresets[index],
      [field]: value,
      ...(field === 'presetId' ? { presetName: availablePresets.find(p => p.id === value)?.title || `Preset ${value}` } : {})
    };

    setEditingTour({
      ...editingTour,
      presets: newPresets
    });
  };

  const handleUpdateTourName = (tourId: number, name: string) => {
    if (!editingTour || editingTour.id !== tourId) return;

    setEditingTour({
      ...editingTour,
      name
    });
  };

  const handleSaveTour = (tourId: number) => {
    if (!editingTour || editingTour.id !== tourId) return;


    let payloads ={
      id : tourId -1,
      // name : editingTour.name,
      // enable : true,
      presets : editingTour.presets.map(p => ([ p.presetId , p.duration, 5]))
    }
    // Build API payload
    // const tourIndex = tourId - 1;
    // const prefix = `table.PtzTour[0][${tourIndex}].`;
    // const payload: any = {
    //   [prefix + 'Name']: editingTour.name,
    //   [prefix + 'Enable']: 'true'
    // };

    // // Add presets
    // editingTour.presets.forEach((preset, idx) => {
    //   payload[`${prefix}Presets[${idx}][0]`] = preset.presetId;
    //   payload[`${prefix}Presets[${idx}][1]`] = preset.duration;
    // });

    // // Clear remaining preset slots
    for (let i = payloads.presets.length; i < 32; i++) {
      payloads.presets[`${i}`] =[  -1 , 0 , 5 ];
      // payload[`${prefix}Presets[${i}][1]`] = 0;
    }

    updateTourMutation.mutate(payloads, {
      onSuccess: () => {
        refetch();
        setEditingTour(null);
        setExpandedTourId(null);
      }
    });
  };

  const handleCancelEdit = () => {
    setEditingTour(null);
  };

  const handleClearPresets = (tourId: number) => {
    if (!editingTour || editingTour.id !== tourId) return;

    setEditingTour({
      ...editingTour,
      presets: [],
      presetCount: 0
    });
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
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" />
          </svg>
          Parcours (Tours)
        </h3>
        <span className="text-sm text-gray-400">
          {tours.length} disponible(s)
        </span>
      </div>

      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300 text-sm">
          Erreur: {(error as Error).message}
        </div>
      )}

      {/* Tour List */}
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 max-h-[600px] overflow-y-auto">
        {tours.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">Aucun tour configuré.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {tours.map((tour) => {
              const isEditing = editingTour?.id === tour.id;
              const displayTour = isEditing ? editingTour : tour;
              const isExpanded = expandedTourId === tour.id;

              return (
                <div
                  key={tour.id}
                  className={`transition-colors ${activeTourId === tour.id ? 'bg-green-900/20 border-l-4 border-green-500' : ''
                    }`}
                >
                  <div className="p-4">
                    <div className="flex items-center justify-between gap-4">

                      {/* Tour Info */}
                      <div className="flex items-center gap-3 flex-1">
                        <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-lg ${activeTourId === tour.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                          }`}>
                          {tour.id}
                        </div>
                        <div className="flex-1">
                          {isEditing ? (
                            <input
                              type="text"
                              value={displayTour.name}
                              onChange={(e) => handleUpdateTourName(tour.id, e.target.value)}
                              className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm w-full max-w-xs"
                              placeholder="Nom du tour"
                            />
                          ) : (
                            <p className="text-white font-medium">{displayTour.name}</p>
                          )}
                          <p className="text-xs text-gray-500">
                            {displayTour.presetCount} point(s) de passage
                          </p>
                        </div>
                      </div>

                      {/* Controls */}
                      <div className="flex items-center gap-2">
                        {isEditing ? (
                          <>
                            <button
                              onClick={() => handleSaveTour(tour.id)}
                              disabled={updateTourMutation.isPending}
                              className="flex items-center gap-2 px-3 py-2 bg-green-600 hover:bg-green-700 text-white text-sm rounded-lg transition-all disabled:opacity-50"
                            >
                              {updateTourMutation.isPending ? (
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                              ) : (
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                </svg>
                              )}
                              Enregistrer
                            </button>
                            <button
                              onClick={handleCancelEdit}
                              className="px-3 py-2 bg-gray-600 hover:bg-gray-700 text-white text-sm rounded-lg transition-all"
                            >
                              Annuler
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => handleEditTour(tour)}
                              className="p-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all"
                              title="Modifier"
                            >
                              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                              </svg>
                            </button>
                            <button
                              onClick={() => setExpandedTourId(isExpanded ? null : tour.id)}
                              className="p-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-all"
                              title={isExpanded ? "Masquer" : "Afficher les presets"}
                            >
                              <svg className={`w-4 h-4 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                              </svg>
                            </button>
                            {activeTourId === tour.id ? (
                              <button
                                onClick={() => handleStop(tour.id)}
                                disabled={stopTourMutation.isPending}
                                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all shadow-lg shadow-red-900/20 disabled:opacity-50"
                              >
                                {stopTourMutation.isPending ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8 7a1 1 0 00-1 1v4a1 1 0 001 1h4a1 1 0 001-1V8a1 1 0 00-1-1H8z" clipRule="evenodd" />
                                  </svg>
                                )}
                                Arrêter
                              </button>
                            ) : (
                              <button
                                onClick={() => handleStart(tour.id)}
                                disabled={startTourMutation.isPending || activeTourId !== null}
                                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg ${activeTourId !== null
                                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white shadow-green-900/20'
                                  }`}
                              >
                                {startTourMutation.isPending && activeTourId === null ? (
                                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                ) : (
                                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                                  </svg>
                                )}
                                Démarrer
                              </button>
                            )}
                          </>
                        )}
                      </div>
                    </div>

                    {/* Preset Points Table */}
                    {isExpanded && (
                      <div className="mt-4 pl-13">
                        <div className="bg-gray-900/50 rounded-lg border border-gray-600 overflow-hidden">
                          <div className="p-3 bg-gray-800 border-b border-gray-600 flex items-center justify-between">
                            <h4 className="text-sm font-medium text-gray-300">Points de Passage</h4>
                            {isEditing && (
                              <div className="flex gap-2">
                                <button
                                  onClick={() => handleAddPreset(tour.id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-green-600 hover:bg-green-700 text-white text-xs rounded transition-all"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                                  </svg>
                                  Ajouter
                                </button>
                                <button
                                  onClick={() => handleClearPresets(tour.id)}
                                  className="flex items-center gap-1 px-3 py-1 bg-red-600 hover:bg-red-700 text-white text-xs rounded transition-all"
                                >
                                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                  </svg>
                                  Effacer Tout
                                </button>
                              </div>
                            )}
                          </div>

                          {displayTour.presets.length === 0 ? (
                            <div className="p-6 text-center text-gray-500 text-sm">
                              Aucun point de passage configuré
                            </div>
                          ) : (
                            <table className="w-full text-sm">
                              <thead className="bg-gray-800/50">
                                <tr>
                                  <th className="px-4 py-2 text-left text-gray-400 font-medium">#</th>
                                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Preset</th>
                                  <th className="px-4 py-2 text-left text-gray-400 font-medium">Durée (s)</th>
                                  {isEditing && <th className="px-4 py-2 text-left text-gray-400 font-medium">Actions</th>}
                                </tr>
                              </thead>
                              <tbody className="divide-y divide-gray-700">
                                {displayTour.presets.map((preset, index) => (
                                  <tr key={index} className="hover:bg-gray-800/30">
                                    <td className="px-4 py-3 text-gray-300">{index + 1}</td>
                                    <td className="px-4 py-3">
                                      {isEditing ? (
                                        <select
                                          value={preset.presetId}
                                          onChange={(e) => handleUpdatePreset(tour.id, index, 'presetId', Number(e.target.value))}
                                          className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm"
                                        >
                                          {availablePresets.map(p => (
                                            <option key={p.id} value={p.id}>{p.title}</option>
                                          ))}
                                        </select>
                                      ) : (
                                        <span className="text-white">{preset.presetName}</span>
                                      )}
                                    </td>
                                    <td className="px-4 py-3">
                                      {isEditing ? (
                                        <input
                                          type="number"
                                          min="1"
                                          max="999"
                                          value={preset.duration}
                                          onChange={(e) => handleUpdatePreset(tour.id, index, 'duration', Number(e.target.value))}
                                          className="bg-gray-700 border border-gray-600 text-white rounded px-2 py-1 text-sm w-20"
                                        />
                                      ) : (
                                        <span className="text-gray-300">{preset.duration}</span>
                                      )}
                                    </td>
                                    {isEditing && (
                                      <td className="px-4 py-3">
                                        <button
                                          onClick={() => handleRemovePreset(tour.id, index)}
                                          className="p-1 text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded transition-all"
                                          title="Supprimer"
                                        >
                                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                          </svg>
                                        </button>
                                      </td>
                                    )}
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Active Tour Warning */}
      {activeTourId && (
        <div className="bg-yellow-900/20 border border-yellow-700/50 rounded-lg p-3 flex items-start gap-3">
          <svg className="w-5 h-5 text-yellow-500 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div className="text-sm text-yellow-200">
            <strong>Note :</strong> L'utilisation manuelle du PTZ (Pan/Tilt/Zoom) arrêtera automatiquement le tour en cours.
          </div>
        </div>
      )}
    </div>
  );
};

export default TourManagement;