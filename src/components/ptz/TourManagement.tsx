// components/camera/TourManagement.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useTours as usePtzTour } from "../../hooks/useCameraQueries";
import { useStartTour, useStopTour } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface Tour {
  id: number;
  name: string;
  presetCount: number;
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
  if (!data || !data.config) return [];
  
  const config = data.tours;
  const tours: Tour[] = [];
  const MAX_TOURS = 31; // Typically 8 tours supported

  for (let i = 0; i < MAX_TOURS; i++) {
    const prefix = `table.PtzTour[0][${i}].`;
    
    // Check if tour is enabled or named
    const enabledStr = String(config[`${prefix}Enable`] ?? "false");
    const name = config[`${prefix}Name`];
    
    if (enabledStr === "true" || (name && name !== "None")) {
        let presetCount = 0;
        // Count defined presets
        for(let j=0; j<32; j++) {
            const pId = Number(config[`${prefix}Presets[${j}][0]`] ?? 0);
            if(pId > 0) presetCount++;
        }

        tours.push({
            id: i + 1, // UI 1-based to match API arg expectation usually
            name: name || `Tour ${i + 1}`,
            presetCount
        });
    }
  }
  return tours;
};

// =============================================================================
// COMPONENT
// =============================================================================

const TourManagement: React.FC = () => {
  const camId = useCamId();
  
  // 1. Data Fetching
  const { data: apiData, isLoading, error, refetch } = usePtzTour(camId);
  
  // 2. Mutations
  const startTourMutation = useStartTour(camId);
  const stopTourMutation = useStopTour(camId);

  // 3. Local State
  const [tours, setTours] = useState<Tour[]>([]);
  const [activeTourId, setActiveTourId] = useState<number | null>(null);

  // 4. Sync API -> UI
  useEffect(() => {
    if (apiData) {
      setTours(apiToUI(apiData));
    }
  }, [apiData]);

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
      <div className="bg-gray-800/50 rounded-lg border border-gray-700 max-h-96 overflow-y-auto">
        {tours.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-400 text-sm">Aucun tour configuré.</p>
          </div>
        ) : (
          <div className="divide-y divide-gray-700">
            {tours.map((tour) => (
              <div
                key={tour.id}
                className={`p-4 transition-colors ${
                  activeTourId === tour.id ? 'bg-green-900/20 border-l-4 border-green-500' : 'hover:bg-gray-700/30'
                }`}
              >
                <div className="flex items-center justify-between gap-4">
                  
                  {/* Tour Info */}
                  <div className="flex items-center gap-3">
                    <div className={`flex-shrink-0 w-10 h-10 rounded-lg flex items-center justify-center font-bold shadow-lg ${
                       activeTourId === tour.id ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300'
                    }`}>
                      {tour.id}
                    </div>
                    <div>
                      <p className="text-white font-medium">{tour.name}</p>
                      <p className="text-xs text-gray-500">
                        {tour.presetCount} point(s) de passage
                      </p>
                    </div>
                  </div>

                  {/* Controls */}
                  <div className="flex items-center gap-2">
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
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all shadow-lg ${
                           activeTourId !== null 
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
                  </div>
                </div>
              </div>
            ))}
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