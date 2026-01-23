"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import {
  Camera,
  Target,
  Circle,
  ChevronUp,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ZoomIn,
  ZoomOut,
  Minus,
  Plus,
  Thermometer,
  Focus,
} from "lucide-react";
import { useCameraContext } from "../../contexts/CameraContext";
import WebRTCMonitor from "./WebRTCMonitor";

interface TrackedObject {
  classification: number;
  classificationName: string;
  trackId: number;
  x: number;
  x1: number;
  y: number;
  y1: number;
}

interface TrackedObjectWithTimestamp extends TrackedObject {
  lastSeen: number;
}

interface TrackingData {
  type: string;
  timestamp: number;
  data: {
    header: number;
    objectCount: number;
    crcValid: boolean;
    objects: TrackedObject[];
  };
}

type CameraType = "cam1" | "cam2";

const Analytics: React.FC = () => {
  // Restore selected camera from localStorage
  const [selectedCamera, setSelectedCamera] = useState<CameraType>(() => {
    const saved = localStorage.getItem("analytics_selected_camera");
    return (saved && (saved === "cam1" || saved === "cam2")) ? saved : "cam1";
  });
  const [objects, setObjects] = useState<TrackedObjectWithTimestamp[]>([]);
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [wsConnected, setWsConnected] = useState(false);
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const [speed, setSpeed] = useState(2);
  const [autoFocusEnabled, setAutoFocusEnabled] = useState(false);

  // Handle camera switching - disable detection if active
  const handleCameraSwitch = async (newCamera: CameraType) => {
    if (detectionEnabled) {
      await disableDetection();
    }
    setSelectedCamera(newCamera);
    localStorage.setItem("analytics_selected_camera", newCamera);
  };
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const objectMapRef = useRef<Map<number, TrackedObjectWithTimestamp>>(
    new Map(),
  );
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { camId, setCamId } = useCameraContext();

  // Update camera context when selectedCamera changes
  useEffect(() => {
    setCamId(selectedCamera);
  }, [selectedCamera, setCamId]);

  // WebRTC connection for video feed - only starts when detection is enabled
  useEffect(() => {
    if (!detectionEnabled) {
      // Clean up existing connection if detection is disabled
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    // WebRTC connection is now handled by WebRTCMonitor component
    // This space kept for future enhancements if needed
  }, [selectedCamera, detectionEnabled]);

  // Load autofocus state from backend
  useEffect(() => {
    const loadAutofocusState = async () => {
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/detection/state`,
        );
        const data = await response.json();

        if (data.success && data.state?.[selectedCamera]) {
          // Check if focus is "running" to set autofocus enabled
          const focusStatus = data.state[selectedCamera].focus;
          const isEnabled = focusStatus === "running";
          setAutoFocusEnabled(isEnabled);
          localStorage.setItem(
            `analytics_autofocus_enabled_${selectedCamera}`,
            JSON.stringify(isEnabled),
          );
          console.log(
            `[Analytics] Loaded autofocus state from backend: ${focusStatus} (enabled: ${isEnabled})`,
          );
        }
      } catch (error) {
        console.error("[Analytics] Error loading autofocus state:", error);
      }
    };

    loadAutofocusState();
  }, [selectedCamera]);

  // Restore detection state on mount
  useEffect(() => {
    const restoreState = async () => {
      try {
        // Get state from backend - always reads from file
        const response = await fetch(
          `http://${window.location.hostname}:3000/detection/state?cameraId=${selectedCamera}`,
        );
        const data = await response.json();

        if (data.success && data.state) {
          console.log("[Analytics] Loaded state from backend:", data.state);

          // Check if tracking is "running" to restore detection state
          const trackingStatus = data.state.tracking;
          const followStatus = data.state.follow;
          const focusStatus = data.state.focus;

          // Restore detection state (tracking = running means detection is enabled)
          if (trackingStatus === "running") {
            setDetectionEnabled(true);
            localStorage.setItem(
              `analytics_detection_enabled_${selectedCamera}`,
              JSON.stringify(true),
            );

            // Re-enable detection on backend
            fetch(`http://${window.location.hostname}:3000/detection/start`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cameraId: selectedCamera }),
            }).catch((err) => console.error("Error restoring detection:", err));
          }

          // Restore tracking state (follow = running means an object is being tracked)
          if (followStatus === "running") {
            // Note: We don't have the trackId in the state file, so we'll try to restore from localStorage
            const savedTracking = localStorage.getItem(`analytics_tracking_id_${selectedCamera}`);
            if (savedTracking && JSON.parse(savedTracking) !== null) {
              const trackId = JSON.parse(savedTracking);
              setTrackingId(trackId);

              // Re-enable tracking on backend
              fetch(
                `http://${window.location.hostname}:3000/track/object/${trackId}`,
                {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify({ cameraId: selectedCamera }),
                },
              ).catch((err) => console.error("Error restoring tracking:", err));
            }
          }

          // Restore autofocus state
          if (focusStatus === "running") {
            setAutoFocusEnabled(true);
            localStorage.setItem(
              `analytics_autofocus_enabled_${selectedCamera}`,
              JSON.stringify(true),
            );
          }
        }
      } catch (error) {
        console.error("[Analytics] Error loading state from backend:", error);

        // Fallback to localStorage if backend fails
        const savedDetection = localStorage.getItem(
          `analytics_detection_enabled_${selectedCamera}`,
        );
        const savedTracking = localStorage.getItem(`analytics_tracking_id_${selectedCamera}`);

        if (savedDetection && JSON.parse(savedDetection)) {
          setDetectionEnabled(true);
          fetch(`http://${window.location.hostname}:3000/detection/start`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ cameraId: selectedCamera }),
          }).catch((err) => console.error("Error restoring detection:", err));
        }

        if (savedTracking && JSON.parse(savedTracking) !== null) {
          const trackId = JSON.parse(savedTracking);
          setTrackingId(trackId);
          fetch(
            `http://${window.location.hostname}:3000/track/object/${trackId}`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ cameraId: selectedCamera }),
            },
          ).catch((err) => console.error("Error restoring tracking:", err));
        }
      }
    };

    restoreState();
  }, [selectedCamera]);
  // PTZ control refs
  const upIntervalRef = useRef<number | null>(null);
  const downIntervalRef = useRef<number | null>(null);
  const leftIntervalRef = useRef<number | null>(null);
  const rightIntervalRef = useRef<number | null>(null);
  const zoomInIntervalRef = useRef<number | null>(null);
  const zoomOutIntervalRef = useRef<number | null>(null);
  const focusInIntervalRef = useRef<number | null>(null);
  const focusOutIntervalRef = useRef<number | null>(null);

  // WebSocket connection with auto-reconnect
  useEffect(() => {
    let ws: WebSocket | null = null;
    let isUnmounting = false;

    const connect = () => {
      // Clear any existing reconnect timeout
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }

      ws = new WebSocket(`ws://${window.location.hostname}:8080`);

      ws.onopen = () => {
        console.log("WebSocket connected");
        setWsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          // console.log(event);
          const data: TrackingData = JSON.parse(event.data);
          if (data.type === "tracking_data") {
            // If we receive tracking data with objects, detection is enabled
            if (data.data.objects.length > 0 && !detectionEnabled) {
              setDetectionEnabled(true);
              localStorage.setItem(
                "analytics_detection_enabled",
                JSON.stringify(true),
              );
            }

            // Clear any existing timeout
            if (clearTimeoutRef.current) {
              clearTimeout(clearTimeoutRef.current);
              clearTimeoutRef.current = null;
            }

            // Replace old objects with new ones (clear the map and add new data)
            const objectMap = objectMapRef.current;
            objectMap.clear();

            const now = Date.now();
            const activeObjects: TrackedObjectWithTimestamp[] = [];

            // Add new objects with current timestamp
            data.data.objects.forEach((obj) => {
              const objWithTimestamp = {
                ...obj,
                lastSeen: now,
              };
              objectMap.set(obj.trackId, objWithTimestamp);
              activeObjects.push(objWithTimestamp);
            });

            setObjects(activeObjects);

            // Set timeout to clear all boxes after 1 second if no new data arrives
            clearTimeoutRef.current = setTimeout(async () => {
              if (trackingId !== null) {
                console.log(
                  "[Analytics] No data received, but tracking is active — skipping clear",
                );
                return;
              }
              console.log(
                "[Analytics] No data received for 1 second, clearing boxes",
              );
              objectMapRef.current.clear();
              setObjects([]);
              // Clear tracking if active - call backend to persist state
              if (trackingId !== null) {
                try {
                  await fetch(
                    `http://${window.location.hostname}:3000/track/stop`,
                    {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ cameraId: selectedCamera }),
                    },
                  );
                  console.log(
                    "[Analytics] Tracking cleared on backend due to timeout",
                  );
                } catch (error) {
                  console.error(
                    "[Analytics] Error clearing tracking on backend:",
                    error,
                  );
                }
                setTrackingId(null);
                localStorage.setItem(
                  "analytics_tracking_id",
                  JSON.stringify(null),
                );
              }
            }, 1000);

            if (!data.data.crcValid) {
              console.warn(
                "Checksum validation failed, but displaying objects anyway",
              );
            }
          }
        } catch (err) {
          console.error("Error parsing WebSocket message:", err);
        }
      };

      ws.onerror = (error) => {
        console.error("WebSocket error:", error);
        setWsConnected(false);
      };

      ws.onclose = () => {
        console.log("WebSocket disconnected");
        setWsConnected(false);

        // Attempt to reconnect after 5 seconds if not unmounting
        if (!isUnmounting) {
          console.log("Attempting to reconnect in 5 seconds...");
          reconnectTimeoutRef.current = setTimeout(() => {
            connect();
          }, 5000);
        }
      };

      wsRef.current = ws;
    };

    // Initial connection
    connect();

    return () => {
      isUnmounting = true;
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
      if (ws) {
        ws.close();
      }
    };
  }, [trackingId]);

  // Drawing boxes disabled - keeping object data only
  // useEffect(() => {
  //   const canvas = canvasRef.current;
  //   const iframe = iframeRef.current;
  //   if (!canvas || !iframe) return;

  //   const ctx = canvas.getContext("2d");
  //   if (!ctx) return;

  //   // Set fixed canvas size to match camera resolution
  //   canvas.width = 640;
  //   canvas.height = 480;

  //   const drawBoxes = () => {
  //     ctx.clearRect(0, 0, canvas.width, canvas.height);

  //     objects.forEach((obj) => {
  //       // If tracking is active, only show the tracked object
  //       if (trackingId !== null && obj.trackId !== trackingId) {
  //         return; // Skip drawing this object
  //       }

  //       // Use coordinates directly from Python server (already in 640x480)
  //       // Apply -5px offset to Y coordinates to compensate for display deviation
  //       const boxX = obj.x;
  //       const boxX1 = obj.x1;
  //       const boxY = obj.y - 55;
  //       const boxY1 = obj.y1 - 55;

  //       // Calculate box dimensions from diagonal coordinates
  //       const boxWidth = boxX1 - boxX;
  //       const boxHeight = boxY1 - boxY;

  //       // Determine color based on tracking status
  //       const isTracking = trackingId === obj.trackId;
  //       ctx.strokeStyle = isTracking ? "#ef4444" : "#22c55e";
  //       ctx.lineWidth = isTracking ? 3 : 2;
  //       ctx.fillStyle = isTracking
  //         ? "rgba(239, 68, 68, 0.2)"
  //         : "rgba(34, 197, 94, 0.2)";

  //       // Draw rectangle
  //       ctx.fillRect(boxX, boxY, boxWidth, boxHeight);
  //       ctx.strokeRect(boxX, boxY, boxWidth, boxHeight);

  //       // Draw label background
  //       const labelText = `${obj.classificationName} #${obj.trackId}`;
  //       ctx.font = "14px sans-serif";
  //       const textWidth = ctx.measureText(labelText).width;
  //       ctx.fillStyle = isTracking ? "#ef4444" : "#22c55e";
  //       ctx.fillRect(boxX, boxY - 25, textWidth + 10, 20);

  //       // Draw label text
  //       ctx.fillStyle = "#ffffff";
  //       ctx.fillText(labelText, boxX + 5, boxY - 10);

  //       // Draw position info
  //       const posText = `(${obj.x.toFixed(0)}, ${obj.y.toFixed(
  //         0
  //       )}) - (${obj.x1.toFixed(0)}, ${obj.y1.toFixed(0)})`;
  //       ctx.font = "11px sans-serif";
  //       ctx.fillStyle = "#ffffff";
  //       ctx.fillText(posText, boxX + 5, boxY + boxHeight + 15);
  //     });

  //     requestAnimationFrame(drawBoxes);
  //   };

  //   drawBoxes();
  // }, [objects, trackingId]);

  const enableDetection = async () => {
    try {
      await fetch(`http://${window.location.hostname}:3000/detection/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cameraId: selectedCamera }),
      });
      setDetectionEnabled(true);
      localStorage.setItem(`analytics_detection_enabled_${selectedCamera}`, JSON.stringify(true));
    } catch (error) {
      console.error("Error enabling detection:", error);
    }
  };

  const disableDetection = async () => {
    try {
      await fetch(`http://${window.location.hostname}:3000/detection/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cameraId: selectedCamera }),
      });
      setDetectionEnabled(false);
      localStorage.setItem(
        `analytics_detection_enabled_${selectedCamera}`,
        JSON.stringify(false),
      );

      // Clear tracking when detection is disabled - call backend to persist state
      if (trackingId !== null) {
        await fetch(`http://${window.location.hostname}:3000/track/stop`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cameraId: selectedCamera }),
        }).catch((err) =>
          console.error("Error clearing tracking on backend:", err),
        );
      }

      setTrackingId(null);
      localStorage.setItem(`analytics_tracking_id_${selectedCamera}`, JSON.stringify(null));
      setObjects([]);
      objectMapRef.current.clear();
    } catch (error) {
      console.error("Error disabling detection:", error);
    }
  };

  const enableTracking = async (id: number) => {
    try {
      await fetch(
        `http://${window.location.hostname}:3000/track/object/${id}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cameraId: selectedCamera }),
        },
      );
      setTrackingId(id);
      localStorage.setItem(`analytics_tracking_id_${selectedCamera}`, JSON.stringify(id));
    } catch (error) {
      console.error("Error enabling tracking:", error);
    }
  };

  const disableTracking = async () => {
    try {
      await fetch(`http://${window.location.hostname}:3000/track/stop`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ cameraId: selectedCamera }),
      });
      setTrackingId(null);
      localStorage.setItem(`analytics_tracking_id_${selectedCamera}`, JSON.stringify(null));
    } catch (error) {
      console.error("Error disabling tracking:", error);
    }
  };

  // PTZ Movement Functions
  const move = async (
    direction:
      | "up"
      | "down"
      | "left"
      | "right"
      | "zoom_in"
      | "zoom_out"
      | "focus_in"
      | "focus_out",
  ) => {
    try {
      let endpoint = "";

      switch (direction) {
        case "up":
          endpoint = `/camera/${selectedCamera}/ptz/move/up`;
          break;
        case "down":
          endpoint = `/camera/${selectedCamera}/ptz/move/down`;
          break;
        case "left":
          endpoint = `/camera/${selectedCamera}/ptz/move/left`;
          break;
        case "right":
          endpoint = `/camera/${selectedCamera}/ptz/move/right`;
          break;
        case "zoom_in":
          endpoint = `/camera/${selectedCamera}/ptz/zoom/in`;
          break;
        case "zoom_out":
          endpoint = `/camera/${selectedCamera}/ptz/zoom/out`;
          break;
        case "focus_in":
          endpoint = `/camera/${selectedCamera}/ptz/focus/near`;
          break;
        case "focus_out":
          endpoint = `/camera/${selectedCamera}/ptz/focus/far`;
          break;
      }

      await fetch(`http://${window.location.hostname}:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: 0, speed }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const stop = async (
    direction:
      | "up"
      | "down"
      | "left"
      | "right"
      | "zoom_in"
      | "zoom_out"
      | "focus_in"
      | "focus_out",
  ) => {
    try {
      let endpoint = "";

      switch (direction) {
        case "up":
        case "down":
        case "left":
        case "right":
          endpoint = `/camera/${selectedCamera}/ptz/move/stop`;
          break;
        case "zoom_in":
        case "zoom_out":
          endpoint = `/camera/${selectedCamera}/ptz/zoom/stop`;
          break;
        case "focus_in":
        case "focus_out":
          endpoint = `/camera/${selectedCamera}/ptz/focus/stop`;
          break;
      }

      await fetch(`http://${window.location.hostname}:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: 0 }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  const createHoldHandlers = (
    direction:
      | "up"
      | "down"
      | "left"
      | "right"
      | "zoom_in"
      | "zoom_out"
      | "focus_in"
      | "focus_out",
    intervalRef: React.MutableRefObject<number | null>,
  ) => {
    const handleStart = () => {
      move(direction);
      intervalRef.current = window.setInterval(() => move(direction), 200);
    };

    const handleStop = () => {
      stop(direction);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    return { handleStart, handleStop };
  };

  const upHandlers = createHoldHandlers("up", upIntervalRef);
  const downHandlers = createHoldHandlers("down", downIntervalRef);
  const leftHandlers = createHoldHandlers("left", leftIntervalRef);
  const rightHandlers = createHoldHandlers("right", rightIntervalRef);
  const zoomInHandlers = createHoldHandlers("zoom_in", zoomInIntervalRef);
  const zoomOutHandlers = createHoldHandlers("zoom_out", zoomOutIntervalRef);
  const focusInHandlers = createHoldHandlers("focus_in", focusInIntervalRef);
  const focusOutHandlers = createHoldHandlers("focus_out", focusOutIntervalRef);

  const toggleAutoFocus = async () => {
    try {
      const newState = !autoFocusEnabled;
      const endpoint = autoFocusEnabled
        ? `/camera/${selectedCamera}/ptz/focus/auto/disable`
        : `/camera/${selectedCamera}/ptz/focus/auto/enable`;

      await fetch(`http://${window.location.hostname}:3000${endpoint}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: 0 }),
      });
      setAutoFocusEnabled(newState);
      localStorage.setItem(
        `analytics_autofocus_enabled_${selectedCamera}`,
        JSON.stringify(newState),
      );
    } catch (err) {
      console.error("Error toggling autofocus:", err);
    }
  };

  // Cleanup PTZ intervals on unmount
  useEffect(() => {
    return () => {
      [
        upIntervalRef,
        downIntervalRef,
        leftIntervalRef,
        rightIntervalRef,
        zoomInIntervalRef,
        zoomOutIntervalRef,
        focusInIntervalRef,
        focusOutIntervalRef,
      ].forEach((ref) => {
        if (ref.current) {
          clearInterval(ref.current);
        }
      });
    };
  }, []);

  return (
    <div className="h-full bg-black p-4">
      <div className="max-w-full mx-auto h-full flex gap-4">
        {/* Video Feed - Primary Component */}
        <div className="flex-1 min-h-0 relative">
          <div className="relative h-full">
            <div className="h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
              <WebRTCMonitor
                selectedCamera={selectedCamera}
                detectionEnabled={detectionEnabled}
                onVideoRef={(ref) => {
                  if (ref) videoRef.current = ref;
                }}
              />
            </div>

            {/* PTZ Controls Overlay */}
            <div className="absolute bottom-6 right-6 z-20">
              <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 min-w-[120px]">
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                    <span className="text-white/90 text-xs font-medium tracking-wide">
                      PTZ CONTROL
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center space-y-1 mb-3">
                  <button
                    onMouseDown={upHandlers.handleStart}
                    onMouseUp={upHandlers.handleStop}
                    onMouseLeave={upHandlers.handleStop}
                    onTouchStart={upHandlers.handleStart}
                    onTouchEnd={upHandlers.handleStop}
                    className="group w-8 h-8 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Tilt Up"
                  >
                    <ChevronUp
                      size={14}
                      strokeWidth={2.5}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </button>

                  <div className="flex items-center space-x-1.5">
                    <button
                      onMouseDown={leftHandlers.handleStart}
                      onMouseUp={leftHandlers.handleStop}
                      onMouseLeave={leftHandlers.handleStop}
                      onTouchStart={leftHandlers.handleStart}
                      onTouchEnd={leftHandlers.handleStop}
                      className="group w-8 h-8 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                      aria-label="Pan Left"
                    >
                      <ChevronLeft
                        size={14}
                        strokeWidth={2.5}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                    </button>

                    <div className="w-8 h-8 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                      <div className="w-1.5 h-1.5 bg-white/60 rounded-full shadow-lg"></div>
                    </div>

                    <button
                      onMouseDown={rightHandlers.handleStart}
                      onMouseUp={rightHandlers.handleStop}
                      onMouseLeave={rightHandlers.handleStop}
                      onTouchStart={rightHandlers.handleStart}
                      onTouchEnd={rightHandlers.handleStop}
                      className="group w-8 h-8 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                      aria-label="Pan Right"
                    >
                      <ChevronRight
                        size={14}
                        strokeWidth={2.5}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                    </button>
                  </div>

                  <button
                    onMouseDown={downHandlers.handleStart}
                    onMouseUp={downHandlers.handleStop}
                    onMouseLeave={downHandlers.handleStop}
                    onTouchStart={downHandlers.handleStart}
                    onTouchEnd={downHandlers.handleStop}
                    className="group w-8 h-8 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Tilt Down"
                  >
                    <ChevronDown
                      size={14}
                      strokeWidth={2.5}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </button>
                </div>

                {/* ZOOM */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-black/20 px-3 text-white/50 text-xs font-medium tracking-wider">
                      ZOOM
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-3">
                  <button
                    onMouseDown={zoomOutHandlers.handleStart}
                    onMouseUp={zoomOutHandlers.handleStop}
                    onMouseLeave={zoomOutHandlers.handleStop}
                    onTouchStart={zoomOutHandlers.handleStart}
                    onTouchEnd={zoomOutHandlers.handleStop}
                    className="group w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                    aria-label="Zoom Out"
                  >
                    <ZoomOut
                      size={12}
                      strokeWidth={2.5}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </button>

                  <button
                    onMouseDown={zoomInHandlers.handleStart}
                    onMouseUp={zoomInHandlers.handleStop}
                    onMouseLeave={zoomInHandlers.handleStop}
                    onTouchStart={zoomInHandlers.handleStart}
                    onTouchEnd={zoomInHandlers.handleStop}
                    className="group w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                    aria-label="Zoom In"
                  >
                    <ZoomIn
                      size={12}
                      strokeWidth={2.5}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </button>
                </div>

                {/* FOCUS */}
                <div className="relative mb-3">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-black/20 px-3 text-white/50 text-xs font-medium tracking-wider">
                      FOCUS
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-center space-x-2 mb-3">
                  <button
                    onMouseDown={focusInHandlers.handleStart}
                    onMouseUp={focusInHandlers.handleStop}
                    onMouseLeave={focusInHandlers.handleStop}
                    onTouchStart={focusInHandlers.handleStart}
                    onTouchEnd={focusInHandlers.handleStop}
                    disabled={autoFocusEnabled}
                    className={`group w-8 h-8 ${autoFocusEnabled
                      ? "bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white"
                      } border rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 disabled:hover:scale-100`}
                    aria-label="Focus Near"
                  >
                    <Minus
                      size={12}
                      strokeWidth={2.5}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </button>

                  <button
                    onClick={toggleAutoFocus}
                    className={`group w-8 h-8 ${autoFocusEnabled
                      ? "bg-green-500/30 border-green-400/50 text-green-100"
                      : "bg-gray-500/20 border-gray-400/30 text-gray-400"
                      } border rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg ${autoFocusEnabled
                        ? "hover:shadow-green-500/20"
                        : "hover:shadow-gray-500/20"
                      }`}
                    aria-label="Toggle Autofocus"
                    title={
                      autoFocusEnabled ? "Autofocus: ON" : "Autofocus: OFF"
                    }
                  >
                    <Focus
                      size={12}
                      strokeWidth={2.5}
                      className={`group-hover:scale-110 transition-transform duration-200 ${autoFocusEnabled ? "animate-pulse" : ""
                        }`}
                    />
                  </button>

                  <button
                    onMouseDown={focusOutHandlers.handleStart}
                    onMouseUp={focusOutHandlers.handleStop}
                    onMouseLeave={focusOutHandlers.handleStop}
                    onTouchStart={focusOutHandlers.handleStart}
                    onTouchEnd={focusOutHandlers.handleStop}
                    disabled={autoFocusEnabled}
                    className={`group w-8 h-8 ${autoFocusEnabled
                      ? "bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed"
                      : "bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white"
                      } border rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 disabled:hover:scale-100`}
                    aria-label="Focus Far"
                  >
                    <Plus
                      size={12}
                      strokeWidth={2.5}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </button>
                </div>

                {/* SPEED */}
                <div className="relative mb-4">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-white/10"></div>
                  </div>
                  <div className="relative flex justify-center">
                    <span className="bg-black/20 px-3 text-white/50 text-xs font-medium tracking-wider">
                      SPEED
                    </span>
                  </div>
                </div>

                <div className="flex flex-col items-center">
                  <input
                    type="range"
                    min="1"
                    max="8"
                    step="1"
                    value={speed}
                    onChange={(e) => setSpeed(Number(e.target.value))}
                    className="w-24 accent-blue-500 cursor-pointer"
                    aria-label="Speed Control"
                  />
                  <div className="flex justify-between w-24 mt-2 text-white/60 text-xs font-medium">
                    <span>1</span>
                    <span>3</span>
                    <span>5</span>
                    <span>8</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Sidebar - Controls & Object List */}
        <div className="w-80 bg-slate-800/60 border border-slate-600/50 rounded-lg overflow-hidden flex flex-col">
          {/* Camera & Detection Controls */}
          <div className="bg-black border-b border-slate-600/50 p-3 space-y-3">
            {/* Camera Selector */}
            <div>
              <label className="text-xs font-medium text-slate-400 mb-2 block">
                Camera Selection
              </label>
              <div className="flex gap-2">
                <button
                  onClick={() => handleCameraSwitch("cam1")}
                  className={`flex-1 px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-all text-sm ${selectedCamera === "cam1"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                >
                  <Camera className="w-4 h-4" />
                  Optique
                </button>
                <button
                  onClick={() => handleCameraSwitch("cam2")}
                  className={`flex-1 px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-all text-sm ${selectedCamera === "cam2"
                    ? "bg-blue-600 text-white"
                    : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                    }`}
                >
                  <Thermometer className="w-4 h-4" />
                  Thermique
                </button>
              </div>
            </div>

            {/* Detection Toggle */}
            <div>
              {detectionEnabled ? (
                <button
                  onClick={disableDetection}
                  className="w-full px-4 py-2.5 rounded-md bg-red-600 hover:bg-red-700 text-white transition-all text-sm font-medium"
                >
                  Disable Detection
                </button>
              ) : (
                <button
                  onClick={enableDetection}
                  className="w-full px-4 py-2.5 rounded-md bg-green-600 hover:bg-green-700 text-white transition-all text-sm font-medium"
                >
                  Enable Detection
                </button>
              )}
            </div>

            {/* Status Indicators */}
            {/* <div className="flex flex-col gap-2 pt-2 border-t border-slate-700">
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">Detection</span>
                <div className="flex items-center gap-2">
                  <Circle
                    className={`h-2 w-2 ${detectionEnabled
                      ? "text-green-500 fill-green-500"
                      : "text-gray-500 fill-gray-500"
                      }`}
                  />
                  <span className="text-xs text-slate-300">
                    {detectionEnabled ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-slate-400">WebSocket</span>
                <div className="flex items-center gap-2">
                  <Circle
                    className={`h-2 w-2 ${wsConnected
                      ? "text-green-500 fill-green-500"
                      : "text-red-500 fill-red-500"
                      }`}
                  />
                  <span className="text-xs text-slate-300">
                    {wsConnected ? "Connected" : "Disconnected"}
                  </span>
                </div>
              </div>
              {trackingId !== null && (
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-400">Tracking</span>
                  <div className="flex items-center gap-2">
                    <Target className="w-3 h-3 text-red-400" />
                    <span className="text-xs text-red-400">#{trackingId}</span>
                  </div>
                </div>
              )}
            </div> */}
          </div>

          {/* Objects Header */}
          <div className="bg-slate-900/60 border-b border-slate-600/50 px-4 py-2.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-medium text-white">
                Detected Objects
              </h3>
              <span className="text-xs text-slate-400">{objects.length}</span>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {objects.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No objects detected</p>
              </div>
            ) : (
              objects.map((obj, index) => {
                const isTracking = trackingId === obj.trackId;
                return (
                  <div
                    key={`${obj.trackId}-${index}-${obj.lastSeen}`}
                    className={`p-3 rounded-lg border transition-all ${isTracking
                      ? "bg-red-600/20 border-red-500/50"
                      : "bg-slate-700/60 border-slate-600/50"
                      }`}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <div className="text-sm font-medium text-white">
                          {obj.classificationName}
                        </div>
                        <div className="text-xs text-slate-400">
                          ID: #{obj.trackId}
                        </div>
                      </div>
                      <div
                        className={`px-2 py-1 rounded text-xs ${isTracking
                          ? "bg-red-500 text-white"
                          : "bg-slate-600 text-slate-300"
                          }`}
                      >
                        {isTracking ? "TRACKING" : "IDLE"}
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 space-y-1 mb-3">
                      <div>
                        X: {obj.x.toFixed(2)} - {obj.x1.toFixed(2)}
                      </div>
                      <div>
                        Y: {obj.y.toFixed(2)} - {obj.y1.toFixed(2)}
                      </div>
                    </div>

                    {/* {isTracking ? (
                      <button
                        onClick={disableTracking}
                        disabled={!detectionEnabled}
                        className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${!detectionEnabled
                          ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                          : "bg-slate-600 hover:bg-slate-500 text-white"
                          }`}
                      >
                        Stop Tracking
                      </button>
                    ) : (
                      <button
                        onClick={() => enableTracking(obj.trackId)}
                        disabled={!detectionEnabled || trackingId !== null}
                        className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${!detectionEnabled || trackingId !== null
                          ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                      >
                        Enable Tracking
                      </button>
                    )} */}
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
