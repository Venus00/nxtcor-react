"use client";

import type React from "react";
import { useRef, useState, useEffect } from "react";
import { Target, Circle } from "lucide-react";
import WebRTCMonitor from "../components/configuration/WebRTCMonitor";

interface TrackedObject {
  classification: number;
  classificationName: string;
  trackId: number;
  x: number;
  y: number;
  z: number;
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

interface CameraState {
  tracking: string;
  follow: string;
  focus: string;
}

interface AnalyticsState {
  cam1: CameraState;
  cam2: CameraState;
}

type CameraType = "cam1" | "cam2";

const Analytics: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<CameraType>("cam1");
  const [objects, setObjects] = useState<TrackedObject[]>([]);
  const [trackingId, setTrackingId] = useState<number | null>(null);
  const [detectionEnabled, setDetectionEnabled] = useState(false);
  const [analyticsState, setAnalyticsState] = useState<AnalyticsState | null>(null);
  const [stateLoading, setStateLoading] = useState(true);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const wsRef = useRef<WebSocket | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);

  // Load analytics state from backend on component mount
  useEffect(() => {
    const loadAnalyticsState = async () => {
      try {
        setStateLoading(true);
        const response = await fetch('http://localhost:3000/api/analytics/state');
        const data = await response.json();

        if (data.success) {
          setAnalyticsState(data.state);
          console.log('[Analytics] Loaded state:', data.state);
        } else {
          console.error('[Analytics] Failed to load state:', data.error);
        }
      } catch (error) {
        console.error('[Analytics] Error loading state:', error);
      } finally {
        setStateLoading(false);
      }
    };

    loadAnalyticsState();
  }, []);

  // WebRTC connection for video feed - only starts when detection is enabled
  useEffect(() => {
    if (!detectionEnabled) {
      // Clean up existing connection if detection is disabled
      if (pcRef.current) {
        pcRef.current.close();
        pcRef.current = null;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }
      return;
    }

    let pc: RTCPeerConnection | null = null;

    const startWebRTC = async () => {
      try {
        pc = new RTCPeerConnection();
        pcRef.current = pc;

        pc.ontrack = (event) => {
          if (videoRef.current) {
            videoRef.current.srcObject = event.streams[0];
          }
        };

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        const streamPath = selectedCamera === "cam1" ? "cam1" : "cam2";
        const res = await fetch(
          `http://${window.location.hostname}:8889/${streamPath}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/sdp",
            },
            body: offer.sdp,
          }
        );

        const answer = await res.text();

        await pc.setRemoteDescription({
          type: "answer",
          sdp: answer,
        });

        console.log(`WebRTC connection established for ${selectedCamera}`);
      } catch (error) {
        console.error("WebRTC connection error:", error);
      }
    };

    startWebRTC();

    return () => {
      if (pc) {
        pc.close();
        pcRef.current = null;
      }
    };
  }, [selectedCamera, detectionEnabled]);

  // WebSocket connection for receiving detection data
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8080`);

    ws.onopen = () => {
      console.log("WebSocket connected");
    };

    ws.onmessage = (event) => {
      try {
        const data: TrackingData = JSON.parse(event.data);
        if (data.type === "tracking_data" && data.data.crcValid) {
          //console.log('Received detection data via WebSocket:', data)
          //setObjects(data.data.objects)
        }
      } catch (err) {
        console.error("Error parsing WebSocket message:", err);
      }
    };

    ws.onerror = (error) => {
      console.error("WebSocket error:", error);
    };

    ws.onclose = () => {
      console.log("WebSocket disconnected");
    };

    wsRef.current = ws;

    return () => {
      ws.close();
    };
  }, []);

  // Drawing boxes disabled - keeping object data only
  // useEffect(() => {
  //   const canvas = canvasRef.current
  //   const video = videoRef.current
  //   if (!canvas || !video) return

  //   const ctx = canvas.getContext('2d')
  //   if (!ctx) return

  //   const drawBoxes = () => {
  //     // Match canvas size to video
  //     canvas.width = video.videoWidth || video.clientWidth
  //     canvas.height = video.videoHeight || video.clientHeight

  //     ctx.clearRect(0, 0, canvas.width, canvas.height)

  //     objects.forEach((obj) => {
  //       // Normalize coordinates (assuming x, y are in range 0-100)
  //       const boxX = (obj.x / 100) * canvas.width
  //       const boxY = (obj.y / 100) * canvas.height
  //       const boxWidth = 80
  //       const boxHeight = 120

  //       // Determine color based on tracking status
  //       const isTracking = trackingId === obj.trackId
  //       ctx.strokeStyle = isTracking ? '#ef4444' : '#22c55e'
  //       ctx.lineWidth = isTracking ? 3 : 2
  //       ctx.fillStyle = isTracking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'

  //       // Draw rectangle
  //       ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
  //       ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

  //       // Draw label background
  //       const labelText = `${obj.classificationName} #${obj.trackId}`
  //       ctx.font = '14px sans-serif'
  //       const textWidth = ctx.measureText(labelText).width
  //       ctx.fillStyle = isTracking ? '#ef4444' : '#22c55e'
  //       ctx.fillRect(boxX, boxY - 25, textWidth + 10, 20)

  //       // Draw label text
  //       ctx.fillStyle = '#ffffff'
  //       ctx.fillText(labelText, boxX + 5, boxY - 10)

  //       // Draw position info
  //       const posText = `(${obj.x.toFixed(1)}, ${obj.y.toFixed(1)}, ${obj.z.toFixed(1)})`
  //       ctx.font = '11px sans-serif'
  //       ctx.fillStyle = '#ffffff'
  //       ctx.fillText(posText, boxX + 5, boxY + boxHeight + 15)
  //     })

  //     requestAnimationFrame(drawBoxes)
  //   }

  //   drawBoxes()
  // }, [objects, trackingId])

  const startDetection = async () => {
    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/api/detection/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cameraId: selectedCamera }),
        }
      );
      const data = await res.json();
      console.log("Detection started:", data);
      setDetectionEnabled(true);
    } catch (error) {
      console.error("Error starting detection:", error);
      alert("Failed to start detection. Please try again.");
    }
  };

  const stopDetection = async () => {
    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/api/detection/stop`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cameraId: selectedCamera }),
        }
      );
      const data = await res.json();
      console.log("Detection stopped:", data);
      setDetectionEnabled(false);
      setObjects([]);
      setTrackingId(null);
    } catch (error) {
      console.error("Error stopping detection:", error);
      alert("Failed to stop detection. Please try again.");
    }
  };

  const enableTracking = (id: number) => {
    setTrackingId(id);
  };

  const disableTracking = () => {
    setTrackingId(null);
  };

  return (
    <div className="h-full bg-black p-6">
      <div className="max-w-full mx-auto h-full flex flex-col">
        {/* WebRTC Monitor Component */}


        {/* Header */}


        {/* Camera Selection */}
        <div className="mb-6">
          <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-white">Camera:</label>
              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedCamera("cam1")}
                  className={`px-4 py-2 rounded-md transition-all ${selectedCamera === "cam1"
                    ? "bg-red-600 text-white"
                    : "bg-slate-700/60 text-slate-300 hover:bg-slate-600/60"
                    }`}
                >
                  Camera 1
                </button>
                <button
                  onClick={() => setSelectedCamera("cam2")}
                  className={`px-4 py-2 rounded-md transition-all ${selectedCamera === "cam2"
                    ? "bg-red-600 text-white"
                    : "bg-slate-700/60 text-slate-300 hover:bg-slate-600/60"
                    }`}
                >
                  Camera 2
                </button>
              </div>

              <div className="flex items-center gap-2 ml-auto">
                <Circle
                  className={`h-3 w-3 ${detectionEnabled
                    ? "text-green-500 fill-green-500"
                    : "text-gray-500 fill-gray-500"
                    }`}
                />
                <span className="text-sm text-slate-300">
                  {detectionEnabled ? "Detection Active" : "Detection Inactive"}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Analytics State Display */}
        {stateLoading ? (
          <div className="mb-6">
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4">
              <div className="text-slate-300">Chargement de l'état...</div>
            </div>
          </div>
        ) : analyticsState && (
          <div className="mb-6">
            <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4">
              <h3 className="text-sm font-medium text-white mb-3">État des Caméras</h3>
              <div className="grid grid-cols-2 gap-4">
                {/* Camera 1 State */}
                <div className="bg-slate-700/60 rounded-lg p-3">
                  <div className="text-sm font-medium text-white mb-2">Camera 1</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suivi:</span>
                      <span className={`font-medium ${analyticsState.cam1.tracking === 'running' ? 'text-green-400' : 'text-slate-300'}`}>
                        {analyticsState.cam1.tracking === 'running' ? 'En cours' : 'Arrêté'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Follow:</span>
                      <span className={`font-medium ${analyticsState.cam1.follow === 'running' ? 'text-green-400' : 'text-slate-300'}`}>
                        {analyticsState.cam1.follow === 'running' ? 'En cours' : 'Arrêté'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Focus:</span>
                      <span className={`font-medium ${analyticsState.cam1.focus === 'running' ? 'text-green-400' : 'text-slate-300'}`}>
                        {analyticsState.cam1.focus === 'running' ? 'En cours' : 'Arrêté'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Camera 2 State */}
                <div className="bg-slate-700/60 rounded-lg p-3">
                  <div className="text-sm font-medium text-white mb-2">Camera 2</div>
                  <div className="space-y-1 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Suivi:</span>
                      <span className={`font-medium ${analyticsState.cam2.tracking === 'running' ? 'text-green-400' : 'text-slate-300'}`}>
                        {analyticsState.cam2.tracking === 'running' ? 'En cours' : 'Arrêté'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Follow:</span>
                      <span className={`font-medium ${analyticsState.cam2.follow === 'running' ? 'text-green-400' : 'text-slate-300'}`}>
                        {analyticsState.cam2.follow === 'running' ? 'En cours' : 'Arrêté'}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Focus:</span>
                      <span className={`font-medium ${analyticsState.cam2.focus === 'running' ? 'text-green-400' : 'text-slate-300'}`}>
                        {analyticsState.cam2.focus === 'running' ? 'En cours' : 'Arrêté'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Detection Control */}
        <div className="mb-6">
          <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-white">
                Detection:
              </label>
              {detectionEnabled ? (
                <button
                  onClick={stopDetection}
                  className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-all"
                >
                  Stop Detection
                </button>
              ) : (
                <button
                  onClick={startDetection}
                  className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md transition-all"
                >
                  Start Detection
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Object List */}
        <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg overflow-hidden flex flex-col max-w-md">
          <div className="bg-black border-b border-slate-600/50 px-4 py-3">
            <h3 className="text-base font-medium text-white">
              Detected Objects
            </h3>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            {objects.length === 0 ? (
              <div className="text-center py-8 text-slate-400">
                <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                <p>No objects detected</p>
              </div>
            ) : (
              objects.map((obj) => {
                const isTracking = trackingId === obj.trackId;
                return (
                  <div
                    key={obj.trackId}
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
                      <div>X: {obj.x.toFixed(2)}</div>
                      <div>Y: {obj.y.toFixed(2)}</div>
                      <div>Z: {obj.z.toFixed(2)}</div>
                    </div>

                    {isTracking ? (
                      <button
                        onClick={disableTracking}
                        className="w-full px-3 py-2 bg-slate-600 hover:bg-slate-500 text-white rounded-md text-sm transition-colors"
                      >
                        Stop Tracking
                      </button>
                    ) : (
                      <button
                        onClick={() => enableTracking(obj.trackId)}
                        disabled={trackingId !== null}
                        className={`w-full px-3 py-2 rounded-md text-sm transition-colors ${trackingId !== null
                          ? "bg-slate-700/50 text-slate-500 cursor-not-allowed"
                          : "bg-red-600 hover:bg-red-700 text-white"
                          }`}
                      >
                        Enable Tracking
                      </button>
                    )}
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
