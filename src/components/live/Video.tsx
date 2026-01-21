import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Circle,
  Minus,
  Plus,
  ZoomIn,
  ZoomOut,
  Video as VideoIcon,
  Square,
  Focus,
  Power,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const VideoStream: React.FC = () => {
  const [scale, setScale] = useState(1.5);
  const [position] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(5);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [recordingFileName, setRecordingFileName] = useState("");
  const [autoFocusEnabled, setAutoFocusEnabled] = useState(() => {
    const saved = localStorage.getItem("video_autofocus_enabled");
    return saved ? JSON.parse(saved) : false;
  });
  const recordingTimerRef = useRef<number | null>(null);
  const maxRecordingDuration = 600; // 10 minutes in seconds

  const upIntervalRef = useRef<number | null>(null);
  const downIntervalRef = useRef<number | null>(null);
  const leftIntervalRef = useRef<number | null>(null);
  const rightIntervalRef = useRef<number | null>(null);
  const zoomInIntervalRef = useRef<number | null>(null);
  const zoomOutIntervalRef = useRef<number | null>(null);
  const focusInIntervalRef = useRef<number | null>(null);
  const focusOutIntervalRef = useRef<number | null>(null);

  const camId = useParams().id;

  // Load autofocus state from backend on mount
  useEffect(() => {
    const loadAutofocusState = async () => {
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/detection/state`,
        );
        const data = await response.json();

        if (data.success && data.state?.autofocus) {
          const savedState =
            data.state.autofocus[camId === "cam1" ? "cam2" : "cam1"]; // Reverse for Video.tsx
          if (savedState !== undefined) {
            setAutoFocusEnabled(savedState);
            localStorage.setItem(
              "video_autofocus_enabled",
              JSON.stringify(savedState),
            );
            console.log(
              `[Video] Loaded autofocus state from backend: ${savedState}`,
            );
          }
        }
      } catch (error) {
        console.error("[Video] Error loading autofocus state:", error);
      }
    };

    if (camId) {
      loadAutofocusState();
    }
  }, [camId]);

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
    console.log(direction, `speed: ${speed}`);
    try {
      let endpoint = "";

      // Map direction to specific API endpoint
      switch (direction) {
        case "up":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/up`;
          break;
        case "down":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/down`;
          break;
        case "left":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/left`;
          break;
        case "right":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/right`;
          break;
        case "zoom_in":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/zoom/in`;
          break;
        case "zoom_out":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/zoom/out`;
          break;
        case "focus_in":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/focus/near`;
          break;
        case "focus_out":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/focus/far`;
          break;
      }

      const res = await fetch(
        `http://${window.location.hostname}:3000${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: 0, speed }),
        },
      );
      const data = await res.json();
      console.log(data);
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
    console.log(direction, `speed: ${speed}`);
    try {
      let endpoint = "";

      // Map direction to specific stop endpoint
      switch (direction) {
        case "up":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/stop`;
          break;
        case "down":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/stop`;
          break;
        case "left":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/stop`;
          break;
        case "right":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/stop`;
          break;
        case "zoom_in":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/zoom/stop`;
          break;
        case "zoom_out":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/zoom/stop`;
          break;
        case "focus_in":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/focus/stop`;
          break;
        case "focus_out":
          endpoint = `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/focus/stop`;
          break;
      }

      const res = await fetch(
        `http://${window.location.hostname}:3000${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: 0 }),
        },
      );
      const data = await res.json();
      console.log(data);
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
      intervalRef.current = setInterval(() => move(direction), 200);
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

  const handleWiperOn = async () => {
    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/camera/${camId}/ptz/wiper/on`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: 0 }),
        },
      );
      const data = await res.json();
      console.log("Wiper activated:", data);
    } catch (err) {
      console.error("Error activating wiper:", err);
    }
  };

  const handleRebootCamera = async () => {
    if (
      !confirm(
        "Are you sure you want to reboot the camera? This will temporarily interrupt the video stream.",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/camera/${camId}/system/reboot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        },
      );
      const data = await res.json();
      console.log("Camera reboot initiated:", data);
      alert(
        "Camera reboot initiated. The camera will be offline for about 30-60 seconds.",
      );
    } catch (err) {
      console.error("Error rebooting camera:", err);
      alert("Failed to reboot camera. Please try again.");
    }
  };

  const handleRebootSystem = async () => {
    if (
      !confirm(
        "⚠️ WARNING: This will reboot the ENTIRE SYSTEM (server and all cameras).\n\nThe system will be offline for 1-2 minutes.\n\nAre you sure you want to proceed?",
      )
    ) {
      return;
    }

    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/system/reboot`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ confirm: true }),
        },
      );
      const data = await res.json();
      console.log("System reboot initiated:", data);
      alert(
        "System reboot initiated. All services will be offline for 1-2 minutes.",
      );
    } catch (err) {
      console.error("Error rebooting system:", err);
      alert("Failed to reboot system. Please try again.");
    }
  };

  const toggleAutoFocus = async () => {
    try {
      const newState = !autoFocusEnabled;
      const endpoint = autoFocusEnabled
        ? `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/focus/auto/disable`
        : `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/focus/auto/enable`;

      const res = await fetch(
        `http://${window.location.hostname}:3000${endpoint}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: 0 }),
        },
      );
      const data = await res.json();
      console.log("Autofocus toggled:", data);
      setAutoFocusEnabled(newState);
      localStorage.setItem("video_autofocus_enabled", JSON.stringify(newState));
    } catch (err) {
      console.error("Error toggling autofocus:", err);
    }
  };

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

      // Clean up recording timer on unmount
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  const startRecording = async () => {
    setRecordingCompleted(false);
    setIsRecording(true);
    setRecordingDuration(0);

    // Generate filename with timestamp
    const timestamp = new Date()
      .toISOString()
      .replace(/[:.]/g, "-")
      .slice(0, -5);
    const fileName = `recording_${camId}_${timestamp}.mp4`;
    setRecordingFileName(fileName);

    // Start recording on backend
    // Reverse camera ID for recording (cam1 -> cam2, cam2 -> cam1)
    const recordingCameraId = camId === "cam1" ? "cam2" : "cam1";
    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/recording/start`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cameraId: recordingCameraId, fileName }),
        },
      );
      const data = await res.json();
      console.log("Recording started:", data);
    } catch (error) {
      console.error("Error starting recording:", error);
    }

    // Start timer
    recordingTimerRef.current = window.setInterval(() => {
      setRecordingDuration((prev) => {
        const newDuration = prev + 1;
        // Auto-stop at max duration
        if (newDuration >= maxRecordingDuration) {
          stopRecording();
        }
        return newDuration;
      });
    }, 1000);
  };

  const stopRecording = async () => {
    setIsRecording(false);
    setRecordingCompleted(true);

    // Stop recording on backend
    // Reverse camera ID for recording (cam1 -> cam2, cam2 -> cam1)
    const recordingCameraId = camId === "cam1" ? "cam2" : "cam1";
    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/recording/stop`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ cameraId: recordingCameraId }),
        },
      );
      const data = await res.json();
      console.log("Recording stopped:", data);
    } catch (error) {
      console.error("Error stopping recording:", error);
    }

    // Clear timer
    if (recordingTimerRef.current) {
      clearInterval(recordingTimerRef.current);
      recordingTimerRef.current = null;
    }
  };

  const formatDuration = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

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

      // Clean up recording timer on unmount
      if (recordingTimerRef.current) {
        clearInterval(recordingTimerRef.current);
      }
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-5rem)]  overflow-hidden bg-black">
      <div className="flex-grow flex justify-center items-center relative bg-black">
        <div className="relative w-full h-full overflow-hidden bg-black">
          <div className="absolute bottom-4 right-10 z-20">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-4 min-w-[140px]">
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <div className="flex items-center space-x-1.5">
                  <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  <span className="text-white/90 text-[10px] font-medium tracking-wide">
                    PTZ CONTROL
                  </span>
                </div>
              </div>

              {/* MANUAL RECORD */}
              <div className="flex flex-col items-center mb-4">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  disabled={recordingCompleted}
                  className={`group w-full h-10 ${
                    isRecording
                      ? "bg-red-500/30 hover:bg-red-500/40 active:bg-red-500/50 border-red-400/50 hover:border-red-400/70 text-red-100 hover:shadow-red-500/20"
                      : recordingCompleted
                        ? "bg-gray-500/20 border-gray-400/30 text-gray-400 cursor-not-allowed"
                        : "bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 border-green-400/30 hover:border-green-400/50 text-green-100 hover:shadow-green-500/20"
                  } border hover:text-white rounded-xl flex items-center justify-center space-x-1.5 transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg disabled:hover:scale-100`}
                  aria-label={
                    isRecording ? "Stop Recording" : "Start Recording"
                  }
                >
                  {isRecording ? (
                    <>
                      <Square
                        size={12}
                        strokeWidth={2.5}
                        className="group-hover:scale-110 transition-transform duration-200 fill-current"
                      />
                      <span className="text-xs font-medium tracking-wide">
                        STOP
                      </span>
                    </>
                  ) : (
                    <>
                      <VideoIcon
                        size={12}
                        strokeWidth={2.5}
                        className="group-hover:scale-110 transition-transform duration-200"
                      />
                      <span className="text-xs font-medium tracking-wide">
                        RECORD
                      </span>
                    </>
                  )}
                </button>

                {isRecording && (
                  <div className="mt-2 flex flex-col items-center space-y-1">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                      <span className="text-red-400 text-xs font-mono font-bold tracking-wider">
                        {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <div className="text-white/40 text-[10px]">
                      Max: {formatDuration(maxRecordingDuration)}
                    </div>
                    <div className="w-full bg-white/10 rounded-full h-0.5 mt-1.5">
                      <div
                        className="bg-red-500 h-0.5 rounded-full transition-all duration-1000"
                        style={{
                          width: `${(recordingDuration / maxRecordingDuration) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                )}

                {recordingCompleted && (
                  <div className="mt-2 flex flex-col items-center space-y-1.5">
                    <div className="flex items-center space-x-1.5">
                      <div className="w-1.5 h-1.5 bg-green-500 rounded-full shadow-lg shadow-green-500/50"></div>
                      <span className="text-green-400 text-[10px] font-medium tracking-wide">
                        Completed: {formatDuration(recordingDuration)}
                      </span>
                    </div>
                    <a
                      href={`http://${window.location.hostname}:3000/recording/download/${recordingFileName}`}
                      download={recordingFileName}
                      className="group w-full h-8 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center space-x-1.5 transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                    >
                      <svg
                        className="w-3 h-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
                        />
                      </svg>
                      <span className="text-xs font-medium tracking-wide">
                        DOWNLOAD
                      </span>
                    </a>
                  </div>
                )}
              </div>

              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-2 text-white/50 text-[10px] font-medium tracking-wider">
                    PTZ
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-1.5 mb-4">
                <button
                  onMouseDown={upHandlers.handleStart}
                  onMouseUp={upHandlers.handleStop}
                  onMouseLeave={upHandlers.handleStop}
                  onTouchStart={upHandlers.handleStart}
                  onTouchEnd={upHandlers.handleStop}
                  className="group w-10 h-10 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                  aria-label="Tilt Up"
                >
                  <ChevronUp
                    size={16}
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
                    className="group w-10 h-10 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Pan Left"
                  >
                    <ChevronLeft
                      size={16}
                      strokeWidth={2.5}
                      className="group-hover:scale-110 transition-transform duration-200"
                    />
                  </button>

                  <div className="w-10 h-10 bg-white/5 border border-white/20 rounded-lg flex items-center justify-center backdrop-blur-sm">
                    <div className="w-1.5 h-1.5 bg-white/60 rounded-full shadow-lg"></div>
                  </div>

                  <button
                    onMouseDown={rightHandlers.handleStart}
                    onMouseUp={rightHandlers.handleStop}
                    onMouseLeave={rightHandlers.handleStop}
                    onTouchStart={rightHandlers.handleStart}
                    onTouchEnd={rightHandlers.handleStop}
                    className="group w-10 h-10 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Pan Right"
                  >
                    <ChevronRight
                      size={16}
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
                  className="group w-10 h-10 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                  aria-label="Tilt Down"
                >
                  <ChevronDown
                    size={16}
                    strokeWidth={2.5}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                </button>
              </div>

              {/* ZOOM */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-2 text-white/50 text-[10px] font-medium tracking-wider">
                    ZOOM
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 mb-4">
                <button
                  onMouseDown={zoomOutHandlers.handleStart}
                  onMouseUp={zoomOutHandlers.handleStop}
                  onMouseLeave={zoomOutHandlers.handleStop}
                  onTouchStart={zoomOutHandlers.handleStart}
                  onTouchEnd={zoomOutHandlers.handleStop}
                  className="group w-10 h-10 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom Out"
                >
                  <ZoomOut
                    size={14}
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
                  className="group w-10 h-10 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom In"
                >
                  <ZoomIn
                    size={14}
                    strokeWidth={2.5}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                </button>
              </div>

              {/* FOCUS */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-2 text-white/50 text-[10px] font-medium tracking-wider">
                    FOCUS
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-2 mb-4">
                <button
                  onMouseDown={focusInHandlers.handleStart}
                  onMouseUp={focusInHandlers.handleStop}
                  onMouseLeave={focusInHandlers.handleStop}
                  onTouchStart={focusInHandlers.handleStart}
                  onTouchEnd={focusInHandlers.handleStop}
                  disabled={autoFocusEnabled}
                  className={`group w-10 h-10 ${autoFocusEnabled ? "bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed" : "bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white"} border rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 disabled:hover:scale-100`}
                  aria-label="Focus Near"
                >
                  <Minus
                    size={14}
                    strokeWidth={2.5}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                </button>

                <button
                  onClick={toggleAutoFocus}
                  className={`group w-10 h-10 ${autoFocusEnabled ? "bg-green-500/30 border-green-400/50 text-green-100" : "bg-gray-500/20 border-gray-400/30 text-gray-400"} border rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg ${autoFocusEnabled ? "hover:shadow-green-500/20" : "hover:shadow-gray-500/20"}`}
                  aria-label="Toggle Autofocus"
                  title={autoFocusEnabled ? "Autofocus: ON" : "Autofocus: OFF"}
                >
                  <Focus
                    size={14}
                    strokeWidth={2.5}
                    className={`group-hover:scale-110 transition-transform duration-200 ${autoFocusEnabled ? "animate-pulse" : ""}`}
                  />
                </button>

                <button
                  onMouseDown={focusOutHandlers.handleStart}
                  onMouseUp={focusOutHandlers.handleStop}
                  onMouseLeave={focusOutHandlers.handleStop}
                  onTouchStart={focusOutHandlers.handleStart}
                  onTouchEnd={focusOutHandlers.handleStop}
                  disabled={autoFocusEnabled}
                  className={`group w-10 h-10 ${autoFocusEnabled ? "bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed" : "bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white"} border rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 disabled:hover:scale-100`}
                  aria-label="Focus Far"
                >
                  <Plus
                    size={14}
                    strokeWidth={2.5}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                </button>
              </div>

              {/* WIPER */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-2 text-white/50 text-[10px] font-medium tracking-wider">
                    WIPER
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={handleWiperOn}
                  className="group w-full h-10 bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 border border-purple-400/30 hover:border-purple-400/50 text-purple-100 hover:text-white rounded-xl flex items-center justify-center space-x-1.5 transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20"
                  aria-label="Activate Wiper"
                >
                  <Circle
                    size={12}
                    strokeWidth={2.5}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="text-xs font-medium tracking-wide">
                    WIPER ON
                  </span>
                </button>
              </div>

              {/* SPEED */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-2 text-white/50 text-[10px] font-medium tracking-wider">
                    SPEED
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center mb-4">
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-28 accent-blue-500 cursor-pointer"
                  aria-label="Speed Control"
                />
                <div className="flex justify-between w-28 mt-1.5 text-white/60 text-[10px] font-medium">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                  <span>8</span>
                </div>
              </div>

              {/* SYSTEM */}
              <div className="relative mb-4">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-2 text-white/50 text-[10px] font-medium tracking-wider">
                    SYSTEM
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={handleRebootCamera}
                  className="group w-full h-10 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 border border-red-400/30 hover:border-red-400/50 text-red-100 hover:text-white rounded-xl flex items-center justify-center space-x-1.5 transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-red-500/20"
                  aria-label="Reboot Camera"
                >
                  <Power
                    size={12}
                    strokeWidth={2.5}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="text-xs font-medium tracking-wide">
                    REBOOT CAM
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center mb-4">
                <button
                  onClick={handleRebootSystem}
                  className="group w-full h-10 bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 border border-orange-400/30 hover:border-orange-400/50 text-orange-100 hover:text-white rounded-xl flex items-center justify-center space-x-1.5 transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-500/20"
                  aria-label="Reboot System"
                >
                  <Power
                    size={12}
                    strokeWidth={2.5}
                    className="group-hover:scale-110 transition-transform duration-200"
                  />
                  <span className="text-xs font-medium tracking-wide">
                    REBOOT SYS
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center pt-2 border-t border-white/10">
                <div className="flex items-center space-x-1.5 text-[10px] text-white/60">
                  <div className="w-1 h-1 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="font-medium tracking-wide">CONNECTED</span>
                </div>
              </div>
            </div>
          </div>

          <iframe
            src={`http://${window.location.hostname}:8889/${camId}`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
            style={camId === 'cam1' ? {
              transform: `scale(${scale * 1.2}) translate(${position.x}px, ${position.y}px)`, // Zoom in by 1.2x
              transformOrigin: "center",
              transition: "transform 0.3s ease",
              width: "120%", // Overflow to stretch width
              height: "100%",
              marginLeft: "-10%", // Center the stretch
            } : {
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoStream;
