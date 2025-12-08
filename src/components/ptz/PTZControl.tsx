// components/camera/PTZControl.tsx
import React, { useState } from "react";
import { useCamId } from "../../contexts/CameraContext";
// Assuming these hooks are exported from your hooks file as defined in your prompt
import {
  usePtzMove,
  usePtzStop,
  usePtzZoomIn,
  usePtzZoomOut,
  usePtzZoomStop,
  usePtzFocusOut,
  usePtzFocusIn,
  usePtzFocusStop,
} from "../../hooks/useCameraMutations";

interface PTZControlProps {
  // Props are handled internally or via context now
}

const PTZControl: React.FC<PTZControlProps> = () => {
  const camId = useCamId();
  console.log(camId)
  // 1. Initialize specific mutations
  const moveMutation = usePtzMove(camId);
  const stopMoveMutation = usePtzStop(camId);
  const zoomInMutation = usePtzZoomIn(camId);
  const zoomOutMutation = usePtzZoomOut(camId);
  const stopZoomMutation = usePtzZoomStop(camId);
  const focusMutationIn = usePtzFocusIn(camId);
  const focusMutationOut = usePtzFocusOut(camId);
  const stopFocusMutation = usePtzFocusStop(camId);
  // Local state for active button styling
  const [activeButton, setActiveButton] = useState<string | null>(null);

  // ===========================================================================
  // Handlers
  // ===========================================================================

  // --- Direction ---
  const handleDirectionStart = (
    direction: "up" | "down" | "left" | "right"
  ) => {
    setActiveButton(direction);
    moveMutation.mutate({ direction, speed: 5 }); // Default speed 5
  };

  const handleDirectionStop = (triggerBtn?: string) => {
    // Only stop if the button released was the one active
    if (triggerBtn && activeButton !== triggerBtn) return;

    setActiveButton(null);
    stopMoveMutation.mutate();
  };

  const handleCenter = () => {
    // Usually "Center" stops everything or goes to Home.
    // Mapping to Stop for now based on provided hooks.
    stopMoveMutation.mutate();
    stopZoomMutation.mutate();
  };

  // --- Zoom ---
  const handleZoomStart = (type: "in" | "out") => {
    const key = `zoom${type}`;
    setActiveButton(key);
    if (type === "in") {
      zoomInMutation.mutate();
    } else {
      zoomOutMutation.mutate();
    }
  };

  const handleZoomStop = (type: "in" | "out") => {
    const key = `zoom${type}`;
    if (activeButton !== key) return;

    setActiveButton(null);
    stopZoomMutation.mutate();
  };

  // --- Focus (Placeholder) ---
  const handleFocusStart = (type: "near" | "far") => {
    // TODO: Implement usePtzFocus mutation when available
    console.log(`Focus ${type} start - Hook not provided`);
    setActiveButton(`focus${type}`);

    const key = `focus${type}`;
    setActiveButton(key);
    if (type === "near") {
      focusMutationIn.mutate();
    } else {
      focusMutationOut.mutate();
    }
  };

  const handleFocusStop = () => {
    // TODO: Implement usePtzFocusStop mutation when available
    setActiveButton(null);
    stopFocusMutation.mutate();
  };

  // --- Aperture (Placeholder) ---
  const handleApertureStart = (type: "open" | "close") => {
    // TODO: Implement usePtzAperture mutation when available
    console.log(`Iris ${type} start - Hook not provided`);
    setActiveButton(`iris${type}`);
  };

  const handleApertureStop = () => {
    // TODO: Implement usePtzApertureStop mutation when available
    setActiveButton(null);
  };

  return (
    <div className="space-y-2">
      {/* Direction Controls */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-xs">
          <svg
            className="w-3.5 h-3.5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4"
            />
          </svg>
          Direction
        </h3>

        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Up Arrow */}
            <button
              onMouseDown={() => handleDirectionStart("up")}
              onMouseUp={() => handleDirectionStop("up")}
              onMouseLeave={() => handleDirectionStop("up")}
              className={`absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group ${activeButton === "up"
                ? "from-red-600 to-red-700 border-red-500"
                : ""
                }`}
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
            </button>

            {/* Left Arrow */}
            <button
              onMouseDown={() => handleDirectionStart("left")}
              onMouseUp={() => handleDirectionStop("left")}
              onMouseLeave={() => handleDirectionStop("left")}
              className={`absolute top-1/2 left-0 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group ${activeButton === "left"
                ? "from-red-600 to-red-700 border-red-500"
                : ""
                }`}
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M4 12l8-8v5h8v6h-8v5z" />
              </svg>
            </button>

            {/* Center Button (Stop) */}
            <button
              onClick={handleCenter}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 hover:from-red-600 hover:to-red-800 rounded-full border-2 border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group"
            >
              <svg
                className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <rect x="9" y="9" width="6" height="6" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onMouseDown={() => handleDirectionStart("right")}
              onMouseUp={() => handleDirectionStop("right")}
              onMouseLeave={() => handleDirectionStop("right")}
              className={`absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 bg-gradient-to-l from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group ${activeButton === "right"
                ? "from-red-600 to-red-700 border-red-500"
                : ""
                }`}
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20 12l-8 8v-5H4V9h8V4z" />
              </svg>
            </button>

            {/* Down Arrow */}
            <button
              onMouseDown={() => handleDirectionStart("down")}
              onMouseUp={() => handleDirectionStop("down")}
              onMouseLeave={() => handleDirectionStop("down")}
              className={`absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-t from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group ${activeButton === "down"
                ? "from-red-600 to-red-700 border-red-500"
                : ""
                }`}
            >
              <svg
                className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M12 20l8-8h-5V4H9v8H4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-xs">
          <svg
            className="w-3.5 h-3.5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
            />
          </svg>
          Zoom
        </h3>
        <div className="flex gap-2">
          <button
            onMouseDown={() => handleZoomStart("in")}
            onMouseUp={() => handleZoomStop("in")}
            onMouseLeave={() => handleZoomStop("in")}
            className={`flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm ${activeButton === "zoomin"
              ? "from-red-600 to-red-700 border-red-500"
              : ""
              }`}
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7"
              />
            </svg>
            <span className="font-medium">In</span>
          </button>
          <button
            onMouseDown={() => handleZoomStart("out")}
            onMouseUp={() => handleZoomStop("out")}
            onMouseLeave={() => handleZoomStop("out")}
            className={`flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm ${activeButton === "zoomout"
              ? "from-red-600 to-red-700 border-red-500"
              : ""
              }`}
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
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7"
              />
            </svg>
            <span className="font-medium">Out</span>
          </button>
        </div>
      </div>

      {/* Focus Controls - Visual Only (No Hooks Provided) */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg opacity-80">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-xs">
          <svg
            className="w-3.5 h-3.5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          Focus
        </h3>
        <div className="flex gap-2">
          <button
            onMouseDown={() => handleFocusStart("near")}
            onMouseUp={handleFocusStop}
            onMouseLeave={handleFocusStop}
            className={`flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm ${activeButton === "focusnear"
              ? "from-red-600 to-red-700 border-red-500"
              : ""
              }`}
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
                d="M15 19l-7-7 7-7"
              />
            </svg>
            <span className="font-medium">Near</span>
          </button>
          <button
            onMouseDown={() => handleFocusStart("far")}
            onMouseUp={handleFocusStop}
            onMouseLeave={handleFocusStop}
            className={`flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm ${activeButton === "focusfar"
              ? "from-red-600 to-red-700 border-red-500"
              : ""
              }`}
          >
            <span className="font-medium">Far</span>
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
                d="M9 5l7 7-7 7"
              />
            </svg>
          </button>
        </div>
      </div>

      {/* Aperture Controls - Visual Only (No Hooks Provided) */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg opacity-80">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-xs">
          <svg
            className="w-3.5 h-3.5 text-red-500"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z"
            />
          </svg>
          Aperture
        </h3>
        <div className="flex gap-2">
          <button
            onMouseDown={() => handleApertureStart("open")}
            onMouseUp={handleApertureStop}
            onMouseLeave={handleApertureStop}
            className={`flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm ${activeButton === "irisopen"
              ? "from-red-600 to-red-700 border-red-500"
              : ""
              }`}
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
                d="M12 4v16m8-8H4"
              />
            </svg>
            <span className="font-medium">Open</span>
          </button>
          <button
            onMouseDown={() => handleApertureStart("close")}
            onMouseUp={handleApertureStop}
            onMouseLeave={handleApertureStop}
            className={`flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm ${activeButton === "irisclose"
              ? "from-red-600 to-red-700 border-red-500"
              : ""
              }`}
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
                d="M20 12H4"
              />
            </svg>
            <span className="font-medium">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PTZControl;
