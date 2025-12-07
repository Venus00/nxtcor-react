// components/camera/ROI.tsx
import React, { useEffect, useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
import { useVideoEncodeROI } from "../../hooks/useCameraQueries";
import { useSetVideoEncodeROI } from "../../hooks/useCameraMutations";

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

export interface ROIRegion {
  id: number;
  x: number; // 0-100%
  y: number; // 0-100%
  width: number; // 0-100%
  height: number; // 0-100%
  quality: number; // 1-6 (API Range)
}

export interface ROIData {
  enabled: boolean; // API: Main
  regions: ROIRegion[];
}

const MAX_REGIONS = 0;
const API_COORD_MAX = 8192; // API coordinate space is 0-8192

const defaultState: ROIData = {
  enabled: false,
  regions: [],
};

// =============================================================================
// API MAPPING HELPERS
// =============================================================================

/**
 * Parses API response to UI state.
 * Fixed to Channel [0] for simplicity.
 * API Ref: table.VideoEncodeROI[0]...
 * Note: API structure is slightly unusual:
 * - Regions are defined by [x1, y1, x2, y2] in `Regions[i][0..3]`
 * - Quality seems to be global `table.VideoEncodeROI[0].Quality` in some firmware, 
 * but modern ROIs often allow per-region. The provided doc (3.2.9.1) shows `Quality` 
 * as a single field `table.VideoEncodeROI[0].Quality`, implying global quality for all ROIs, 
 * OR it might be indexed. The UI request implies per-region quality. 
 * However, looking at 3.2.9.1 Response: `table.VideoEncodeROI[0].Quality=6` is top-level.
 * And 3.2.9.2 Set ParamName: `head.Quality` is integer, `head.Regions[0][0]` etc.
 * This suggests **Global Quality** for all ROI regions on this specific camera model.
 * * *ADAPTATION*: I will map the global quality to the first region for UI display, 
 * or treat quality as a global setting in the UI if possible. 
 * To keep the requested UI (per region quality), I will sync them all to the global value 
 * on save, or just read the global value.
 * * Wait, `head.Regions` is an array. Let's look closer at 3.2.9.2.
 * It lists `head.Regions[0][0]`... implying index 0 is the region index?
 * Actually `VideoEncodeROI[0]` is channel. `Regions[0]` is likely the first ROI region?
 * The docs say `head.Regions[0][0]` is X of upper left of ROI area. 
 * Usually `Regions` is `Regions[RegionIndex][CoordIndex]`.
 * Let's assume standard behavior: up to 4 regions.
 */
const apiToUI = (data: any): ROIData => {
  if (!data) return defaultState;
  
  const config = data.config || data;
  const prefix = "table.VideoEncodeROI[0].";

  const getVal = (key: string, def: any) => config[key] ?? def;

  const enabled = String(getVal(`${prefix}Main`, "false")) === "true";
  const globalQuality = Number(getVal(`${prefix}Quality`, 6)); // 1-6

  const regions: ROIRegion[] = [];
  
  // Try to parse up to MAX_REGIONS
  for (let i = 0; i < MAX_REGIONS; i++) {
    // Check if region exists by looking for X1. If 0,0,0,0 often means empty/disabled region
    // keys: Regions[i][0] (x1), [1] (y1), [2] (x2), [3] (y3)
    const x1 = Number(getVal(`${prefix}Regions[${i}][0]`, 0));
    const y1 = Number(getVal(`${prefix}Regions[${i}][1]`, 0));
    const x2 = Number(getVal(`${prefix}Regions[${i}][2]`, 0));
    const y2 = Number(getVal(`${prefix}Regions[${i}][3]`, 0));

    // Simple validation: if area is 0, ignore
    if (x2 <= x1 || y2 <= y1) continue;

    regions.push({
      id: Date.now() + i, // Pseudo-ID
      x: (x1 / API_COORD_MAX) * 100,
      y: (y1 / API_COORD_MAX) * 100,
      width: ((x2 - x1) / API_COORD_MAX) * 100,
      height: ((y2 - y1) / API_COORD_MAX) * 100,
      quality: globalQuality // Assign global quality to region for UI
    });
  }

  return { enabled, regions };
};

/**
 * Converts UI state to API payload.
 * Maps back to table.VideoEncodeROI[0]...
 */
const uiToApi = (ui: ROIData) => {
  // const prefix = "VideoEncodeROI[0].";
  const payload: any = {
    [`Main`]: ui.enabled,
    // Take quality from first region or default to 6 if none
    [`Quality`]: ui.regions.length > 0 ? ui.regions[0].quality : 6, 
  };

  // Map regions back to 0-8192 space
  for (let i = 0; i < MAX_REGIONS; i++) {
    const region = ui.regions[i];
    if (region) {
      const x1 = Math.round((region.x / 100) * API_COORD_MAX);
      const y1 = Math.round((region.y / 100) * API_COORD_MAX);
      const w = Math.round((region.width / 100) * API_COORD_MAX);
      const h = Math.round((region.height / 100) * API_COORD_MAX);
      
      payload[`Regions[${i}][0]`] = x1;
      payload[`Regions[${i}][1]`] = y1;
      payload[`Regions[${i}][2]`] = x1 + w;
      payload[`Regions[${i}][3]`] = y1 + h;
    } else {
      // Clear gions
      payload[`Regions[${i}][0]`] = 0;
      payload[`Regions[${i}][1]`] = 0;
      payload[`Regions[${i}][2]`] = 0;
      payload[`Regions[${i}][3]`] = 0;
    }
  }

  return payload;
};

// =============================================================================
// COMPONENT
// =============================================================================

const ROI: React.FC = () => {
  const camId = useCamId();
  const { data: apiData, isLoading, error, refetch } = useVideoEncodeROI(camId);
  const mutation = useSetVideoEncodeROI(camId);

  // Local State
  const [settings, setSettings] = useState<ROIData>(defaultState);
  const [selectedRegionId, setSelectedRegionId] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [currentDraw, setCurrentDraw] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [isDirty, setIsDirty] = useState(false);

  // Sync API -> UI
  useEffect(() => {
    if (apiData) {
      const parsed = apiToUI(apiData);
      setSettings(parsed);
      setIsDirty(false);
    }
  }, [apiData]);

  // Handlers
  const handleUpdate = (updates: Partial<ROIData>) => {
    setSettings(prev => ({ ...prev, ...updates }));
    setIsDirty(true);
  };

  const handleSave = () => {
    const payload = uiToApi(settings);
    mutation.mutate(payload);
    setIsDirty(false);
  };

  const updateSettings = (key: keyof ROIData, value: any) => {
    handleUpdate({ [key]: value });
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!settings.enabled || settings.regions.length >= MAX_REGIONS) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setIsDrawing(true);
    setDrawStart({ x, y });
    setCurrentDraw({ x, y, width: 0, height: 0 });
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!isDrawing || !drawStart) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const currentX = ((e.clientX - rect.left) / rect.width) * 100;
    const currentY = ((e.clientY - rect.top) / rect.height) * 100;

    const width = Math.abs(currentX - drawStart.x);
    const height = Math.abs(currentY - drawStart.y);
    const x = Math.min(currentX, drawStart.x);
    const y = Math.min(currentY, drawStart.y);

    setCurrentDraw({ x, y, width, height });
  };

  const handleMouseUp = () => {
    if (!isDrawing || !currentDraw || currentDraw.width < 2 || currentDraw.height < 2) {
      setIsDrawing(false);
      setDrawStart(null);
      setCurrentDraw(null);
      return;
    }

    // Default to quality of existing regions or 6
    const defaultQuality = settings.regions.length > 0 ? settings.regions[0].quality : 6;

    const newRegion: ROIRegion = {
      id: Date.now(),
      x: currentDraw.x,
      y: currentDraw.y,
      width: currentDraw.width,
      height: currentDraw.height,
      quality: defaultQuality,
    };

    updateSettings('regions', [...settings.regions, newRegion]);
    setIsDrawing(false);
    setDrawStart(null);
    setCurrentDraw(null);
    setSelectedRegionId(newRegion.id);
  };

  const handleDeleteRegion = (id: number) => {
    updateSettings('regions', settings.regions.filter(region => region.id !== id));
    if (selectedRegionId === id) {
      setSelectedRegionId(null);
    }
  };

  const handleClearAll = () => {
    updateSettings('regions', []);
    setSelectedRegionId(null);
  };

  const handleQualityChange = (id: number, quality: number) => {
    // Since API likely supports only Global Quality, update ALL regions to match
    // to avoid user confusion (UI showing different qualities but backend only supporting one)
    updateSettings('regions', settings.regions.map(region => ({ ...region, quality })));
  };

  const handleContextMenu = (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    handleDeleteRegion(id);
  };

  const getQualityColor = (quality: number) => {
    if (quality <= 2) return 'text-red-400';
    if (quality <= 4) return 'text-yellow-400';
    return 'text-green-400';
  };

  const getQualityLabel = (quality: number) => {
    if (quality <= 2) return 'Low';
    if (quality <= 4) return 'Medium';
    return 'High';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-red-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading ROI Settings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      
      {/* Feedback Messages */}
      {error && (
        <div className="p-4 rounded-lg bg-red-900/50 border border-red-700 text-red-300">
          Error: {(error as Error).message}
          <button onClick={() => refetch()} className="ml-4 underline hover:no-underline">Retry</button>
        </div>
      )}
      {mutation.isPending && (
         <div className="p-3 rounded-lg bg-blue-900/30 border border-blue-700 text-blue-300 flex items-center gap-2 text-sm">
           <div className="animate-spin rounded-full h-3 w-3 border-b-2 border-blue-300"></div>
           Saving changes...
         </div>
      )}
      {mutation.isSuccess && (
        <div className="p-3 rounded-lg bg-green-900/30 border border-green-700 text-green-300 text-sm">
          ✓ ROI settings saved successfully!
        </div>
      )}

      {/* Header */}
      <div className="border-b border-gray-700 pb-4 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-white mb-2">ROI Configuration</h2>
          <p className="text-gray-400 text-sm">
            Define up to 4 regions with specific encoding quality
          </p>
        </div>
        <button
          onClick={handleSave}
          disabled={!isDirty || mutation.isPending}
          className="px-6 py-2 rounded-lg font-medium bg-red-600 text-white hover:bg-red-700 disabled:opacity-50 shadow-lg transition-colors"
        >
          {mutation.isPending ? 'Saving...' : 'Save Settings'}
        </button>
      </div>

      {/* Enable ROI */}
      <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Enable ROI Function
            </h3>
            <p className="text-sm text-gray-400">
              Activate region-based encoding to prioritize important areas with higher quality
            </p>
          </div>
          <label className="relative inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={settings.enabled}
              onChange={(e) => updateSettings('enabled', e.target.checked)}
              className="sr-only peer"
            />
            <div className="w-14 h-7 bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-red-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-red-600"></div>
          </label>
        </div>
      </div>

      {/* Drawing Area */}
      {settings.enabled && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM14 5a1 1 0 011-1h4a1 1 0 011 1v7a1 1 0 01-1 1h-4a1 1 0 01-1-1V5zM4 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1H5a1 1 0 01-1-1v-3zM14 16a1 1 0 011-1h4a1 1 0 011 1v3a1 1 0 01-1 1h-4a1 1 0 01-1-1v-3z" />
              </svg>
              Region Selection
              <span className="text-sm text-gray-400 font-normal">
                ({settings.regions.length}/{MAX_REGIONS} regions)
              </span>
            </h3>
            <div className="flex gap-2">
              <button
                onClick={handleClearAll}
                disabled={settings.regions.length === 0}
                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 text-sm"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Clear All
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="mb-4 p-4 bg-blue-900/20 border border-blue-600/50 rounded-lg">
            <div className="flex items-start gap-3">
              <svg className="w-5 h-5 text-blue-400 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div className="text-sm text-blue-200 space-y-1">
                <p><strong>How to use:</strong></p>
                <ul className="list-disc list-inside space-y-1 ml-2">
                  <li>Press and hold left mouse button to draw a region (up to {MAX_REGIONS} regions)</li>
                  <li>Click the "Delete" button or right-click on a region to remove it</li>
                  <li>Click "Clear All" to remove all regions at once</li>
                  <li>Adjust image quality for all regions using the slider below (Global setting)</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Video Preview Area with ROI Drawing */}
          <div 
            className={`relative bg-gray-900 rounded-lg border-2 aspect-video overflow-hidden ${
              settings.regions.length >= MAX_REGIONS 
                ? 'border-orange-600 cursor-not-allowed' 
                : 'border-gray-600 cursor-crosshair'
            }`}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={() => {
              if (isDrawing) {
                handleMouseUp();
              }
            }}
          >
            {/* Background placeholder */}
            <div className="absolute inset-0 flex items-center justify-center text-gray-500">
              <div className="text-center">
                <svg className="w-16 h-16 mx-auto mb-2 opacity-50" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                </svg>
                <p className="text-sm">
                  {settings.regions.length >= MAX_REGIONS 
                    ? 'Maximum regions reached' 
                    : 'Click and drag to draw ROI regions'}
                </p>
              </div>
            </div>

            {/* Existing ROI Regions */}
            {settings.regions.map((region, index) => (
              <div
                key={region.id}
                onClick={() => setSelectedRegionId(region.id)}
                onContextMenu={(e) => handleContextMenu(e, region.id)}
                className={`absolute border-3 group cursor-pointer transition-all ${
                  selectedRegionId === region.id
                    ? 'border-red-500 bg-red-500/20 z-10'
                    : 'border-green-500 bg-green-500/10 hover:bg-green-500/20'
                }`}
                style={{
                  left: `${region.x}%`,
                  top: `${region.y}%`,
                  width: `${region.width}%`,
                  height: `${region.height}%`,
                }}
              >
                {/* Region Label */}
                <div className={`absolute -top-6 left-0 px-2 py-1 rounded text-xs font-semibold ${
                  selectedRegionId === region.id ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  ROI {index + 1}
                </div>

                {/* Quality Badge */}
                <div className={`absolute -bottom-6 left-0 px-2 py-1 rounded text-xs font-semibold ${
                  selectedRegionId === region.id ? 'bg-red-500 text-white' : 'bg-green-500 text-white'
                }`}>
                  Q: {region.quality}/6
                </div>

                {/* Delete Button */}
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDeleteRegion(region.id);
                  }}
                  className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center hover:bg-red-600"
                >
                  ×
                </button>
              </div>
            ))}

            {/* Current Drawing Region */}
            {isDrawing && currentDraw && currentDraw.width > 0 && currentDraw.height > 0 && (
              <div
                className="absolute border-2 border-dashed border-blue-400 bg-blue-400/10"
                style={{
                  left: `${currentDraw.x}%`,
                  top: `${currentDraw.y}%`,
                  width: `${currentDraw.width}%`,
                  height: `${currentDraw.height}%`,
                }}
              >
                <div className="absolute -top-6 left-0 bg-blue-400 text-white px-2 py-1 rounded text-xs font-semibold">
                  Drawing...
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Region Quality Settings */}
      {settings.enabled && settings.regions.length > 0 && (
        <div className="bg-gray-800/40 rounded-lg p-6 border border-gray-700">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
            </svg>
            Global Image Quality Settings
          </h3>
          <p className="text-sm text-gray-400 mb-4">
            Adjust encoding quality for all ROI regions (1 lowest - 6 highest)
          </p>

          <div className="space-y-4">
            {/* Taking the first region as the controller for global quality */}
            {settings.regions.slice(0,1).map((region) => (
              <div key="global-quality-control" className="p-5 rounded-lg border-2 border-gray-700 bg-gray-900/50">
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-gray-300">Image Quality Level</label>
                    <div className="flex items-center gap-2">
                      <span className={`text-sm font-semibold ${getQualityColor(region.quality)}`}>
                        {getQualityLabel(region.quality)}
                      </span>
                      <span className="text-sm text-gray-400">({region.quality}/6)</span>
                    </div>
                  </div>
                  
                  <div className="relative">
                    <input
                      type="range"
                      min="1"
                      max="6"
                      value={region.quality}
                      onChange={(e) => handleQualityChange(0, parseInt(e.target.value))} // ID 0 is dummy here, function updates all
                      className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider-thumb"
                      style={{
                        background: `linear-gradient(to right, #DC2626 0%, #DC2626 ${(region.quality - 1) * 20}%, #374151 ${(region.quality - 1) * 20}%, #374151 100%)`
                      }}
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>1 (Lowest)</span>
                      <span>6 (Highest)</span>
                    </div>
                  </div>

                  <div className="flex gap-1 mt-2">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div
                        key={i}
                        className={`flex-1 h-2 rounded ${
                          i < region.quality
                            ? region.quality <= 2
                              ? 'bg-red-500'
                              : region.quality <= 4
                              ? 'bg-yellow-500'
                              : 'bg-green-500'
                            : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ROI;