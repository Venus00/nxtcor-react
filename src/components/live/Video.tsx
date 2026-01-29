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
  Loader2,
  RefreshCw,
  AlertCircle,
  Minimize2,
  PanelRightClose,
  PanelRightOpen,
} from "lucide-react";
import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";

const VideoStream: React.FC = () => {
  const [scale] = useState(1.5);
  const [position] = useState({ x: 0, y: 0 });
  const [speed, setSpeed] = useState(2);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [recordingCompleted, setRecordingCompleted] = useState(false);
  const [recordingFileName, setRecordingFileName] = useState("");
  const [autoFocusEnabled, setAutoFocusEnabled] = useState(() => {
    const saved = localStorage.getItem("video_autofocus_enabled");
    return saved ? JSON.parse(saved) : false;
  });
  const [stabilizerEnabled, setStabilizerEnabled] = useState(() => {
    const saved = localStorage.getItem("video_stabilizer_enabled");
    return saved ? JSON.parse(saved) : false;
  });
  const [controlPanelCollapsed, setControlPanelCollapsed] = useState(false);
  const [gotoExpanded, setGotoExpanded] = useState(false);
  const [gotoPan, setGotoPan] = useState("");
  const [gotoTilt, setGotoTilt] = useState("");
  const [gotoZoom, setGotoZoom] = useState("");
  const [streamLoading, setStreamLoading] = useState(true);
  const [streamError, setStreamError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const [isRetrying, setIsRetrying] = useState(false);
  const [digitalZoom, setDigitalZoom] = useState(1);
  const recordingTimerRef = useRef<number | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const retryTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const maxRecordingDuration = 600; // 10 minutes in seconds

  const upIntervalRef = useRef<number | null>(null);
  const downIntervalRef = useRef<number | null>(null);
  const leftIntervalRef = useRef<number | null>(null);
  const rightIntervalRef = useRef<number | null>(null);
  const zoomInIntervalRef = useRef<number | null>(null);
  const zoomOutIntervalRef = useRef<number | null>(null);
  const focusInIntervalRef = useRef<number | null>(null);
  const focusOutIntervalRef = useRef<number | null>(null);
  const autoStopTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const clickMoveIntervalRef = useRef<number | null>(null);
  const clickMoveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const videoOverlayRef = useRef<HTMLDivElement | null>(null);

  const camId = useParams().id || "cam1";

  // Monitor stream loading and handle errors
  useEffect(() => {
    setStreamLoading(true);
    setStreamError(false);

    const checkStreamHealth = async () => {
      try {
        const response = await fetch(
          `http://${window.location.hostname}:8889/${camId}`,
          { method: "HEAD", mode: "no-cors" },
        );
        setStreamLoading(false);
        setStreamError(false);
        setRetryCount(0);
      } catch (error) {
        console.error("[Video] Stream check failed:", error);
        setStreamLoading(false);
        setStreamError(true);
      }
    };

    // Initial check after a brief delay
    const initialTimeout = setTimeout(() => {
      checkStreamHealth();
    }, 2000);

    // Set up periodic health checks
    const healthCheckInterval = setInterval(() => {
      if (iframeRef.current) {
        checkStreamHealth();
      }
    }, 10000); // Check every 10 seconds

    return () => {
      clearTimeout(initialTimeout);
      clearInterval(healthCheckInterval);
      if (retryTimeoutRef.current) {
        clearTimeout(retryTimeoutRef.current);
      }
    };
  }, [camId, retryCount]);

  const handleRetryStream = () => {
    setIsRetrying(true);
    setStreamError(false);
    setStreamLoading(true);

    // Reload iframe
    if (iframeRef.current) {
      iframeRef.current.src = `http://${window.location.hostname}:8889/${camId}`;
    }

    retryTimeoutRef.current = setTimeout(() => {
      setIsRetrying(false);
      setRetryCount((prev) => prev + 1);
    }, 3000);
  };

  const handleIframeLoad = () => {
    setStreamLoading(false);
    setStreamError(false);
    setIsRetrying(false);
  };

  const handleIframeError = () => {
    setStreamLoading(false);
    setStreamError(true);
    setIsRetrying(false);
  };

  // Load autofocus  state from backend on mount
  useEffect(() => {
    const loadCameraState = async () => {
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/api/detection/state`,
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

      // Load stabilizer state
      try {
        const response = await fetch(
          `http://${window.location.hostname}:3000/api/camera/${camId === "cam1" ? "cam2" : "cam1"}/video/stabilizer`,
        );
        const data = await response.json();

        if (
          data.config &&
          data.config["table.VideoImageControl[0].Stable"] !== undefined
        ) {
          const stableValue = data.config["table.VideoImageControl[0].Stable"];
          console.log(
            "[Video] Raw Stable value from API:",
            stableValue,
            typeof stableValue,
          );

          // Handle string value: "0" means OFF/disabled, "3" (or any non-zero) means ON/enabled
          const stabilizerState = stableValue === "0" ? false : true;

          setStabilizerEnabled(stabilizerState);
          localStorage.setItem(
            "video_stabilizer_enabled",
            JSON.stringify(stabilizerState),
          );
          console.log(
            `[Video] Loaded stabilizer state from backend: ${stabilizerState} (raw value: "${stableValue}")`,
          );
        }
      } catch (error) {
        console.error("[Video] Error loading stabilizer state:", error);
      }
    };

    if (camId) {
      loadCameraState();
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
        `http://${window.location.hostname}:3000/api${endpoint}`,
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
        `http://${window.location.hostname}:3000/api${endpoint}`,
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
    const handleStart = (e?: React.MouseEvent | React.TouchEvent) => {
      // Prevent default to avoid ghost clicks
      if (e) {
        e.preventDefault();
      }

      // Clear any existing interval first
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }

      // Clear any existing timeout
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }

      move(direction);
      intervalRef.current = window.setInterval(() => move(direction), 100);

      // Auto-stop after 2 seconds for safety
      autoStopTimeoutRef.current = setTimeout(() => {
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
          stop(direction);
        }
        if (autoStopTimeoutRef.current) {
          clearTimeout(autoStopTimeoutRef.current);
          autoStopTimeoutRef.current = null;
        }
      }, 15000);
    };

    const handleStop = (e?: React.MouseEvent | React.TouchEvent) => {
      // Prevent default to avoid ghost clicks
      if (e) {
        e.preventDefault();
      }

      // Clear the auto-stop timeout
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
        autoStopTimeoutRef.current = null;
      }

      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      stop(direction);
    };

    return { handleStart, handleStop };
  };

  const upHandlers = createHoldHandlers("up", upIntervalRef);
  const downHandlers = createHoldHandlers("down", downIntervalRef);
  const leftHandlers = createHoldHandlers("left", leftIntervalRef);
  const rightHandlers = createHoldHandlers("right", rightIntervalRef);
  const zoomInHandlers = createHoldHandlers("zoom_in", zoomInIntervalRef);
  const zoomOutHandlers = createHoldHandlers("zoom_out", zoomOutIntervalRef);

  // Digital zoom handlers
  const handleDigitalZoomIn = () => {
    setDigitalZoom((prev) => Math.min(prev + 0.1, 3));
  };

  const handleDigitalZoomOut = () => {
    setDigitalZoom((prev) => Math.max(prev - 0.1, 1));
  };

  const focusInHandlers = createHoldHandlers("focus_in", focusInIntervalRef);
  const focusOutHandlers = createHoldHandlers("focus_out", focusOutIntervalRef);

  const handleWiperOn = async () => {
    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/camera/cam1/ptz/wiper/on`,
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
        "Êtes-vous sûr de vouloir redémarrer la caméra? Cela interrompra temporairement le flux vidéo.",
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
        "Redémarrage de la caméra initié. La caméra sera hors ligne pendant environ 30-60 secondes.",
      );
    } catch (err) {
      console.error("Error rebooting camera:", err);
      alert("Échec du redémarrage de la caméra. Veuillez réessayer.");
    }
  };

  const handleRebootSystem = async () => {
    if (
      !confirm(
        "⚠️ ATTENTION: Ceci redémarrera TOUT LE SYSTÈME (serveur et toutes les caméras).\n\nLe système sera hors ligne pendant 1-2 minutes.\n\nÊtes-vous sûr de vouloir continuer?",
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
        `http://${window.location.hostname}:3000/api${endpoint}`,
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

  const toggleStabilizer = async () => {
    try {
      const newState = !stabilizerEnabled;
      const res = await fetch(
        `http://${window.location.hostname}:3000/api/camera/${camId === "cam1" ? "cam2" : "cam1"}/video/stabilizer`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            channel: 0,
            config: 0,
            stabilizer: newState ? 3 : 0,
          }),
        },
      );
      const data = await res.json();
      console.log("Stabilizer toggled:", data);
      setStabilizerEnabled(newState);
      localStorage.setItem(
        "video_stabilizer_enabled",
        JSON.stringify(newState),
      );
    } catch (err) {
      console.error("Error toggling stabilizer:", err);
    }
  };

  const fetchPTZStatus = async () => {
    try {
      const res = await fetch(
        `http://${window.location.hostname}:3000/api/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/status`,
        {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        },
      );

      const data = await res.json();
      console.log("PTZ Status fetched:", data);

      if (data.success && data.status) {
        // Extract pan, tilt, zoom from status using the correct keys
        const zoom = parseFloat(data.status["status.Postion[2]"]) || 0;
        const pan = parseFloat(data.status["status.Postion[0]"]) || 0;
        const tilt = parseFloat(data.status["status.Postion[1]"]) || 0;

        setGotoPan(pan.toFixed(2));
        setGotoTilt(tilt.toFixed(2));
        setGotoZoom(zoom.toFixed(2));

        console.log(`[PTZ Status] Pan: ${pan}, Tilt: ${tilt}, Zoom: ${zoom}`);
      }
    } catch (err) {
      console.error("Error fetching PTZ status:", err);
    }
  };

  // Fetch PTZ status when GoTo panel is expanded
  useEffect(() => {
    if (gotoExpanded) {
      fetchPTZStatus();
    }
  }, [gotoExpanded, camId]);

  const handleGoTo = async () => {
    try {
      const pan = parseFloat(gotoPan);
      const tilt = parseFloat(gotoTilt);
      const zoom = parseFloat(gotoZoom);

      // Validate inputs
      if (gotoPan && (isNaN(pan) || pan < 0 || pan > 360)) {
        alert("Pan must be between 0 and 360 degrees");
        return;
      }
      if (gotoTilt && (isNaN(tilt) || tilt < -90 || tilt > 90)) {
        alert("Tilt must be between -90 and 90 degrees");
        return;
      }
      if (gotoZoom && (isNaN(zoom) || zoom < 0 || zoom > 128)) {
        alert("Zoom must be between 0 and 128");
        return;
      }

      // Prepare body with only filled values
      const body: any = { channel: 0 };
      if (gotoPan) body.pan = pan;
      if (gotoTilt) body.tilt = tilt;
      if (gotoZoom) body.zoom = zoom;

      const res = await fetch(
        `http://${window.location.hostname}:3000/api/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/position`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        },
      );

      const data = await res.json();
      console.log("GoTo command sent:", data);

      if (!data.ok && !data.success) {
        alert("Failed to execute GoTo command");
      }
    } catch (err) {
      console.error("Error executing GoTo:", err);
      alert("Error sending GoTo command");
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
        `http://${window.location.hostname}:3000/api/recording/start`,
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
        `http://${window.location.hostname}:3000/api/recording/stop`,
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

  const handleVideoClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!videoOverlayRef.current) return;

    // Clear any existing click-move operations
    if (clickMoveIntervalRef.current) {
      clearInterval(clickMoveIntervalRef.current);
      clickMoveIntervalRef.current = null;
    }
    if (clickMoveTimeoutRef.current) {
      clearTimeout(clickMoveTimeoutRef.current);
      clickMoveTimeoutRef.current = null;
    }

    const rect = videoOverlayRef.current.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const clickY = e.clientY - rect.top;

    // Calculate center point
    const centerX = rect.width / 2;
    const centerY = rect.height / 2;

    // Calculate offset from center (-1 to 1)
    const offsetX = (clickX - centerX) / centerX;
    const offsetY = (clickY - centerY) / centerY;

    // Calculate distance from center (0 to ~1.414 for corners)
    const distance = Math.sqrt(offsetX * offsetX + offsetY * offsetY);

    // Determine primary direction based on which offset is larger
    const absX = Math.abs(offsetX);
    const absY = Math.abs(offsetY);

    // Only move if click is far enough from center (dead zone)
    if (distance < 0.1) {
      console.log("[PTZ Click] Click too close to center, ignoring");
      return;
    }

    // Calculate speed based on distance (1-8 scale)
    // Map distance 0.1-1.0 to speed 1-8
    const normalizedDistance = Math.min(distance, 1.0);
    const calculatedSpeed = Math.max(
      1,
      Math.min(8, Math.round(1 + normalizedDistance * 7)),
    );

    console.log(
      `[PTZ Click] Offset: (${offsetX.toFixed(2)}, ${offsetY.toFixed(2)}), Distance: ${distance.toFixed(2)}, Speed: ${calculatedSpeed}`,
    );

    let direction: "up" | "down" | "left" | "right";

    // Determine direction based on larger offset
    if (absX > absY) {
      // Horizontal movement dominates
      direction = offsetX > 0 ? "right" : "left";
    } else {
      // Vertical movement dominates
      direction = offsetY > 0 ? "down" : "up";
    }

    console.log(`[PTZ Click] Moving ${direction} at speed ${calculatedSpeed}`);

    // Execute move command with calculated speed
    const moveWithSpeed = async () => {
      try {
        let endpoint = "";
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
        }

        await fetch(`http://${window.location.hostname}:3000/api${endpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: 0, speed: calculatedSpeed }),
        });
      } catch (err) {
        console.error("[PTZ Click] Move error:", err);
      }
    };

    const stopMove = async () => {
      try {
        const stopEndpoint =
          direction === "left" || direction === "right"
            ? `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/stop`
            : `/camera/${camId === "cam1" ? "cam2" : "cam1"}/ptz/move/stop`;

        await fetch(`http://${window.location.hostname}:3000${stopEndpoint}`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ channel: 0 }),
        });
      } catch (err) {
        console.error("[PTZ Click] Stop error:", err);
      }
    };

    // Start moving
    moveWithSpeed();
    clickMoveIntervalRef.current = window.setInterval(
      () => moveWithSpeed(),
      100,
    );

    // Auto-stop after 1.5 seconds
    clickMoveTimeoutRef.current = setTimeout(() => {
      if (clickMoveIntervalRef.current) {
        clearInterval(clickMoveIntervalRef.current);
        clickMoveIntervalRef.current = null;
      }
      stopMove();
      console.log("[PTZ Click] Auto-stopped");
    }, 1500);
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

      // Clean up auto-stop timeout
      if (autoStopTimeoutRef.current) {
        clearTimeout(autoStopTimeoutRef.current);
      }

      // Clean up click-move operations
      if (clickMoveIntervalRef.current) {
        clearInterval(clickMoveIntervalRef.current);
      }
      if (clickMoveTimeoutRef.current) {
        clearTimeout(clickMoveTimeoutRef.current);
      }

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
          {/* Control Panel Toggle Button */}
          <button
            onClick={() => setControlPanelCollapsed(!controlPanelCollapsed)}
            className="absolute top-6 right-6 z-30 w-12 h-12 bg-white/10 hover:bg-white/20 active:bg-white/30 border border-white/20 hover:border-white/40 text-white rounded-lg flex items-center justify-center transition-all duration-300 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg"
            aria-label={
              controlPanelCollapsed
                ? "Expand Control Panel"
                : "Collapse Control Panel"
            }
            title={
              controlPanelCollapsed
                ? "Afficher le panneau"
                : "Masquer le panneau"
            }
          >
            {controlPanelCollapsed ? (
              <PanelRightOpen size={24} strokeWidth={2.5} />
            ) : (
              <PanelRightClose size={24} strokeWidth={2.5} />
            )}
          </button>

          {/* Control Panel */}
          <div
            className={`absolute bottom-[1vw] right-[2vw] z-20 transition-all duration-300 ${controlPanelCollapsed
                ? "opacity-0 pointer-events-none translate-x-[120%]"
                : "opacity-100"
              }`}
          >
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-[1vw] min-w-[8vw]">
              <div className="flex items-center justify-between mb-[0.8vw] pb-[0.4vw] border-b border-white/10">
                <div className="flex items-center space-x-[0.3vw]">
                  <div className="w-[0.3vw] h-[0.3vw] bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  <span className="text-white/90 text-[0.6vw] font-medium tracking-wide">
                    CONTRÔLE PTZ
                  </span>
                </div>
              </div>

              {/* MANUAL RECORD */}
              <div className="flex flex-col items-center mb-[0.8vw]">
                <button
                  onClick={isRecording ? stopRecording : startRecording}
                  onTouchEnd={isRecording ? stopRecording : startRecording}
                  disabled={recordingCompleted}
                  className={`group w-full h-[2vw] ${isRecording
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
                        className="w-[0.8vw] h-[0.8vw] group-hover:scale-110 transition-transform duration-200 fill-current"
                        strokeWidth={2.5}
                      />
                      <span className="text-[0.6vw] font-medium tracking-wide">
                        STOP
                      </span>
                    </>
                  ) : (
                    <>
                      <VideoIcon
                        className="w-[0.8vw] h-[0.8vw] group-hover:scale-110 transition-transform duration-200"
                        strokeWidth={2.5}
                      />
                      <span className="text-[0.6vw] font-medium tracking-wide">
                        ENREGISTRER
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
                        Terminé: {formatDuration(recordingDuration)}
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
                        TÉLÉCHARGER
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

              <div className="flex flex-col items-center space-y-[0.3vw] mb-[0.8vw]">
                <button
                  onMouseDown={upHandlers.handleStart}
                  onMouseUp={upHandlers.handleStop}
                  onMouseLeave={upHandlers.handleStop}
                  onTouchStart={upHandlers.handleStart}
                  onTouchEnd={upHandlers.handleStop}
                  className="group w-[2vw] h-[2vw] bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                  aria-label="Tilt Up"
                >
                  <ChevronUp
                    className="w-[1vw] h-[1vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                </button>

                <div className="flex items-center space-x-[0.3vw]">
                  <button
                    onMouseDown={leftHandlers.handleStart}
                    onMouseUp={leftHandlers.handleStop}
                    onMouseLeave={leftHandlers.handleStop}
                    onTouchStart={leftHandlers.handleStart}
                    onTouchEnd={leftHandlers.handleStop}
                    className="group w-[2vw] h-[2vw] bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Pan Left"
                  >
                    <ChevronLeft
                      className="w-[1vw] h-[1vw] group-hover:scale-110 transition-transform duration-200"
                      strokeWidth={2.5}
                    />
                  </button>{" "}
                  <button
                    onClick={async () => {
                      // Stop all PTZ movements
                      await stop("up");
                      await stop("down");
                      await stop("left");
                      await stop("right");
                      console.log("[PTZ] Stop all movements");
                    }}
                    className="w-[2vw] h-[2vw] bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 border border-red-400/30 hover:border-red-400/50 rounded-lg flex items-center justify-center backdrop-blur-sm cursor-pointer transition-all duration-300 ease-out hover:scale-110 active:scale-95"
                    aria-label="Stop PTZ"
                    title="Arrêter tous les mouvements PTZ"
                  >
                    <div className="w-[0.5vw] h-[0.5vw] bg-red-400 rounded-sm shadow-lg"></div>
                  </button>
                  <button
                    onMouseDown={rightHandlers.handleStart}
                    onMouseUp={rightHandlers.handleStop}
                    onMouseLeave={rightHandlers.handleStop}
                    onTouchStart={rightHandlers.handleStart}
                    onTouchEnd={rightHandlers.handleStop}
                    className="group w-[2vw] h-[2vw] bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Pan Right"
                  >
                    <ChevronRight
                      className="w-[1vw] h-[1vw] group-hover:scale-110 transition-transform duration-200"
                      strokeWidth={2.5}
                    />
                  </button>
                </div>

                <button
                  onMouseDown={downHandlers.handleStart}
                  onMouseUp={downHandlers.handleStop}
                  onMouseLeave={downHandlers.handleStop}
                  onTouchStart={downHandlers.handleStart}
                  onTouchEnd={downHandlers.handleStop}
                  className="group w-[2vw] h-[2vw] bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                  aria-label="Pan Right"
                >
                  <ChevronDown
                    className="w-[1vw] h-[1vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                </button>
              </div>

              {/* ZOOM */}
              <div className="relative mb-[0.8vw]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-[0.4vw] text-white/50 text-[0.6vw] font-medium tracking-wider">
                    ZOOM
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-[0.4vw] mb-[0.8vw]">
                <button
                  onMouseDown={zoomOutHandlers.handleStart}
                  onMouseUp={zoomOutHandlers.handleStop}
                  onMouseLeave={zoomOutHandlers.handleStop}
                  onTouchStart={zoomOutHandlers.handleStart}
                  onTouchEnd={zoomOutHandlers.handleStop}
                  className="group w-[2vw] h-[2vw] bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom Out"
                >
                  <ZoomOut
                    className="w-[0.9vw] h-[0.9vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                </button>
                <button
                  onClick={handleDigitalZoomOut}
                  disabled={digitalZoom <= 1}
                  className="group w-[1.5vw] h-[1.5vw] bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 border border-purple-400/30 hover:border-purple-400/50 text-purple-100 hover:text-white rounded flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Digital Zoom Out"
                  title="Digital Zoom Out"
                >
                  <Minus
                    className="w-[0.7vw] h-[0.7vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                </button>{" "}
                <button
                  onMouseDown={zoomInHandlers.handleStart}
                  onMouseUp={zoomInHandlers.handleStop}
                  onMouseLeave={zoomInHandlers.handleStop}
                  onTouchStart={zoomInHandlers.handleStart}
                  onTouchEnd={zoomInHandlers.handleStop}
                  className="group w-[2vw] h-[2vw] bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom In"
                >
                  <ZoomIn
                    className="w-[0.9vw] h-[0.9vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                </button>
                <button
                  onClick={handleDigitalZoomIn}
                  disabled={digitalZoom >= 3}
                  className="group w-[1.5vw] h-[1.5vw] bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 border border-purple-400/30 hover:border-purple-400/50 text-purple-100 hover:text-white rounded flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20 disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:scale-100"
                  aria-label="Digital Zoom In"
                  title="Digital Zoom In"
                >
                  <Plus
                    className="w-[0.7vw] h-[0.7vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                </button>
              </div>

              {/* Digital Zoom Indicator */}
              <div className="text-center mb-[0.8vw]">
                <span className="text-white/60 text-[0.55vw] font-medium">
                  Digital: {digitalZoom.toFixed(1)}x
                </span>
              </div>

              {/* FOCUS */}
              <div className="relative mb-[0.8vw]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-[0.4vw] text-white/50 text-[0.6vw] font-medium tracking-wider">
                    FOCUS
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-[0.4vw] mb-[0.8vw]">
                <button
                  onMouseDown={focusInHandlers.handleStart}
                  onMouseUp={focusInHandlers.handleStop}
                  onMouseLeave={focusInHandlers.handleStop}
                  onTouchStart={focusInHandlers.handleStart}
                  onTouchEnd={focusInHandlers.handleStop}
                  disabled={autoFocusEnabled}
                  className={`group w-[2vw] h-[2vw] ${autoFocusEnabled ? "bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed" : "bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white"} border rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 disabled:hover:scale-100`}
                  aria-label="Focus Near"
                >
                  <Minus
                    className="w-[0.9vw] h-[0.9vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                </button>

                <button
                  onClick={toggleAutoFocus}
                  onTouchEnd={toggleAutoFocus}
                  className={`group w-[2vw] h-[2vw] ${autoFocusEnabled ? "bg-green-500/30 border-green-400/50 text-green-100" : "bg-gray-500/20 border-gray-400/30 text-gray-400"} border rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg ${autoFocusEnabled ? "hover:shadow-green-500/20" : "hover:shadow-gray-500/20"}`}
                  aria-label="Toggle Autofocus"
                  title={
                    autoFocusEnabled
                      ? "Autofocus: ACTIVÉ"
                      : "Autofocus: DÉSACTIVÉ"
                  }
                >
                  <Focus
                    className={`w-[0.9vw] h-[0.9vw] group-hover:scale-110 transition-transform duration-200 ${autoFocusEnabled ? "animate-pulse" : ""}`}
                    strokeWidth={2.5}
                  />
                </button>

                <button
                  onMouseDown={focusOutHandlers.handleStart}
                  onMouseUp={focusOutHandlers.handleStop}
                  onMouseLeave={focusOutHandlers.handleStop}
                  onTouchStart={focusOutHandlers.handleStart}
                  onTouchEnd={focusOutHandlers.handleStop}
                  disabled={autoFocusEnabled}
                  className={`group w-[2vw] h-[2vw] ${autoFocusEnabled ? "bg-gray-500/20 border-gray-400/30 text-gray-500 cursor-not-allowed" : "bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white"} border rounded-lg flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20 disabled:hover:scale-100`}
                  aria-label="Focus Far"
                >
                  <Plus
                    className="w-[0.9vw] h-[0.9vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                </button>
              </div>

              {/* WIPER */}
              <div className="relative mb-[0.8vw]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-[0.4vw] text-white/50 text-[0.6vw] font-medium tracking-wider">
                    WIPER
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center mb-[0.8vw]">
                <button
                  onClick={handleWiperOn}
                  onTouchEnd={handleWiperOn}
                  className="group w-full h-[2vw] bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 border border-purple-400/30 hover:border-purple-400/50 text-purple-100 hover:text-white rounded-xl flex items-center justify-center space-x-[0.3vw] transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-purple-500/20"
                  aria-label="Activate Wiper"
                >
                  <Circle
                    className="w-[0.8vw] h-[0.8vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                  <span className="text-[0.6vw] font-medium tracking-wide">
                    ESSUIE-GLACE
                  </span>
                </button>
              </div>

              {/* SPEED */}
              <div className="relative mb-[0.8vw]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-[0.4vw] text-white/50 text-[0.6vw] font-medium tracking-wider">
                    VITESSE
                  </span>
                </div>
              </div>

              <div className="flex flex-col items-center mb-[0.8vw]">
                <input
                  type="range"
                  min="1"
                  max="8"
                  step="1"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-[6vw] accent-blue-500 cursor-pointer"
                  aria-label="Speed Control"
                />
                <div className="flex justify-between w-[6vw] mt-[0.3vw] text-white/60 text-[0.6vw] font-medium">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                  <span>8</span>
                </div>
              </div>

              {/* SYSTEM */}
              <div className="relative mb-[0.8vw]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-[0.4vw] text-white/50 text-[0.6vw] font-medium tracking-wider">
                    SYSTÈME
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center mb-[0.8vw]">
                <button
                  onClick={handleRebootCamera}
                  onTouchEnd={handleRebootCamera}
                  className="group w-full h-[2vw] bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 border border-red-400/30 hover:border-red-400/50 text-red-100 hover:text-white rounded-xl flex items-center justify-center space-x-[0.3vw] transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-red-500/20"
                  aria-label="Reboot Camera"
                >
                  <Power
                    className="w-[0.8vw] h-[0.8vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                  <span className="text-[0.6vw] font-medium tracking-wide">
                    REDÉMARRER CAM
                  </span>
                </button>
              </div>

              <div className="flex items-center justify-center mb-[0.8vw]">
                <button
                  onClick={handleRebootSystem}
                  onTouchEnd={handleRebootSystem}
                  className="group w-full h-[2vw] bg-orange-500/20 hover:bg-orange-500/30 active:bg-orange-500/40 border border-orange-400/30 hover:border-orange-400/50 text-orange-100 hover:text-white rounded-xl flex items-center justify-center space-x-[0.3vw] transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-orange-500/20"
                  aria-label="Reboot System"
                >
                  <Power
                    className="w-[0.8vw] h-[0.8vw] group-hover:scale-110 transition-transform duration-200"
                    strokeWidth={2.5}
                  />
                  <span className="text-[0.6vw] font-medium tracking-wide">
                    REDÉMARRER SYS
                  </span>
                </button>
              </div>

              {/* IMAGE STABILIZER */}
              <div className="relative mb-[0.8vw]">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-[0.4vw] text-white/50 text-[0.6vw] font-medium tracking-wider">
                    STABILISATEUR
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-center">
                <button
                  onClick={toggleStabilizer}
                  onTouchEnd={toggleStabilizer}
                  className={`group w-full h-[2vw] ${stabilizerEnabled
                      ? "bg-green-500/30 border-green-400/50 text-green-100"
                      : "bg-gray-500/20 border-gray-400/30 text-gray-400"
                    } border rounded-xl flex items-center justify-center space-x-[0.3vw] transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg ${stabilizerEnabled
                      ? "hover:shadow-green-500/20"
                      : "hover:shadow-gray-500/20"
                    }`}
                  aria-label="Toggle Image Stabilizer"
                  title={
                    stabilizerEnabled
                      ? "Stabilisateur: ACTIVÉ"
                      : "Stabilisateur: DÉSACTIVÉ"
                  }
                >
                  <Minimize2
                    className={`w-[0.8vw] h-[0.8vw] group-hover:scale-110 transition-transform duration-200 ${stabilizerEnabled ? "animate-pulse" : ""
                      }`}
                    strokeWidth={2.5}
                  />
                  <span className="text-[0.6vw] font-medium tracking-wide">
                    {stabilizerEnabled ? "ACTIVÉ" : "DÉSACTIVÉ"}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* GoTo Panel - Bottom Left */}
          <div className="absolute bottom-[1vw] left-[2vw] z-20">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-[1vw] min-w-[12vw]">
              <div className="relative mb-[0.8vw]">
                <button
                  onClick={() => setGotoExpanded(!gotoExpanded)}
                  className="w-full flex items-center justify-between text-white/90 hover:text-white transition-colors"
                >
                  <div className="flex items-center space-x-[0.3vw]">
                    <div className="w-[0.3vw] h-[0.3vw] bg-blue-500 rounded-full animate-pulse shadow-lg shadow-blue-500/50"></div>
                    <span className="text-[0.6vw] font-medium tracking-wide">
                      GOTO POSITION
                    </span>
                  </div>
                  <div className="flex items-center gap-[0.3vw]">
                    {gotoExpanded && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          fetchPTZStatus();
                        }}
                        className="p-[0.2vw] hover:bg-white/10 rounded transition-colors"
                        title="Refresh current position"
                      >
                        <RefreshCw
                          className="w-[0.7vw] h-[0.7vw]"
                          strokeWidth={2.5}
                        />
                      </button>
                    )}
                    <ChevronDown
                      className={`w-[0.8vw] h-[0.8vw] transition-transform duration-200 ${gotoExpanded ? "rotate-180" : ""}`}
                      strokeWidth={2.5}
                    />
                  </div>
                </button>
              </div>

              {gotoExpanded && (
                <div className="space-y-[0.6vw]">
                  {/* Current Status Info */}
                  <div className="text-white/40 text-[0.5vw] mb-[0.4vw] text-center">
                    Current position loaded - adjust as needed
                  </div>

                  {/* Pan Input */}
                  <div>
                    <label className="text-white/60 text-[0.55vw] font-medium mb-[0.2vw] block">
                      Pan (°)
                    </label>
                    <div className="flex gap-[0.3vw]">
                      <input
                        type="number"
                        value={gotoPan}
                        onChange={(e) => setGotoPan(e.target.value)}
                        placeholder="0 - 360"
                        className="flex-1 bg-white/10 border border-white/20 text-white text-[0.6vw] rounded-lg px-[0.5vw] py-[0.3vw] focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-colors placeholder:text-white/30"
                      />
                      <button
                        onClick={() => setGotoPan("0")}
                        className="px-[0.5vw] py-[0.3vw] bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-100 text-[0.5vw] rounded-lg transition-all hover:scale-105"
                        title="Set to minimum (0°)"
                      >
                        Min
                      </button>
                      <button
                        onClick={() => setGotoPan("360")}
                        className="px-[0.5vw] py-[0.3vw] bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-100 text-[0.5vw] rounded-lg transition-all hover:scale-105"
                        title="Set to maximum (360°)"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {/* Tilt Input */}
                  <div>
                    <label className="text-white/60 text-[0.55vw] font-medium mb-[0.2vw] block">
                      Tilt (°)
                    </label>
                    <div className="flex gap-[0.3vw]">
                      <input
                        type="number"
                        value={gotoTilt}
                        onChange={(e) => setGotoTilt(e.target.value)}
                        placeholder="-90 - 90"
                        className="flex-1 bg-white/10 border border-white/20 text-white text-[0.6vw] rounded-lg px-[0.5vw] py-[0.3vw] focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-colors placeholder:text-white/30"
                      />
                      <button
                        onClick={() => setGotoTilt("-90")}
                        className="px-[0.5vw] py-[0.3vw] bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-100 text-[0.5vw] rounded-lg transition-all hover:scale-105"
                        title="Set to minimum (-90°)"
                      >
                        Min
                      </button>
                      <button
                        onClick={() => setGotoTilt("90")}
                        className="px-[0.5vw] py-[0.3vw] bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-100 text-[0.5vw] rounded-lg transition-all hover:scale-105"
                        title="Set to maximum (90°)"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {/* Zoom Input */}
                  <div>
                    <label className="text-white/60 text-[0.55vw] font-medium mb-[0.2vw] block">
                      Zoom (0-128)
                    </label>
                    <div className="flex gap-[0.3vw]">
                      <input
                        type="number"
                        value={gotoZoom}
                        onChange={(e) => setGotoZoom(e.target.value)}
                        placeholder="0 - 128"
                        className="flex-1 bg-white/10 border border-white/20 text-white text-[0.6vw] rounded-lg px-[0.5vw] py-[0.3vw] focus:outline-none focus:border-blue-400/50 focus:bg-white/15 transition-colors placeholder:text-white/30"
                      />
                      <button
                        onClick={() => setGotoZoom("0")}
                        className="px-[0.5vw] py-[0.3vw] bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-100 text-[0.5vw] rounded-lg transition-all hover:scale-105"
                        title="Set to minimum (0)"
                      >
                        Min
                      </button>
                      <button
                        onClick={() => setGotoZoom("128")}
                        className="px-[0.5vw] py-[0.3vw] bg-purple-500/20 hover:bg-purple-500/30 border border-purple-400/30 text-purple-100 text-[0.5vw] rounded-lg transition-all hover:scale-105"
                        title="Set to maximum (128)"
                      >
                        Max
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-[0.4vw]">
                    <button
                      onClick={handleGoTo}
                      className="group flex-1 h-[2vw] bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-105 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                      aria-label="Go To Position"
                    >
                      <span className="text-[0.6vw] font-medium tracking-wide">
                        GO
                      </span>
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Overlay PTZ Controls - Positioned at edges */}
          {/* Up Button - Top Center */}
          {controlPanelCollapsed && (
            <button
              onMouseDown={upHandlers.handleStart}
              onMouseUp={upHandlers.handleStop}
              onMouseLeave={upHandlers.handleStop}
              onTouchStart={upHandlers.handleStart}
              onTouchEnd={upHandlers.handleStop}
              className="absolute top-6 left-1/2 transform -translate-x-1/2 z-20 w-14 h-14 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 border border-green-400/40 hover:border-green-400/60 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg shadow-green-500/20"
              aria-label="Move Up"
            >
              <ChevronUp size={28} strokeWidth={2.5} />
            </button>
          )}

          {/* Down Button - Bottom Center */}
          {controlPanelCollapsed && (
            <button
              onMouseDown={downHandlers.handleStart}
              onMouseUp={downHandlers.handleStop}
              onMouseLeave={downHandlers.handleStop}
              onTouchStart={downHandlers.handleStart}
              onTouchEnd={downHandlers.handleStop}
              className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20 w-14 h-14 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 border border-green-400/40 hover:border-green-400/60 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg shadow-green-500/20"
              aria-label="Move Down"
            >
              <ChevronDown size={28} strokeWidth={2.5} />
            </button>
          )}

          {/* Left Button - Left Center */}
          {controlPanelCollapsed && (
            <button
              onMouseDown={leftHandlers.handleStart}
              onMouseUp={leftHandlers.handleStop}
              onMouseLeave={leftHandlers.handleStop}
              onTouchStart={leftHandlers.handleStart}
              onTouchEnd={leftHandlers.handleStop}
              className="absolute left-6 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 border border-green-400/40 hover:border-green-400/60 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg shadow-green-500/20"
              aria-label="Move Left"
            >
              <ChevronLeft size={28} strokeWidth={2.5} />
            </button>
          )}

          {/* Right Button - Right Center */}
          {controlPanelCollapsed && (
            <button
              onMouseDown={rightHandlers.handleStart}
              onMouseUp={rightHandlers.handleStop}
              onMouseLeave={rightHandlers.handleStop}
              onTouchStart={rightHandlers.handleStart}
              onTouchEnd={rightHandlers.handleStop}
              className="absolute right-6 top-1/2 transform -translate-y-1/2 z-20 w-14 h-14 bg-green-500/20 hover:bg-green-500/30 active:bg-green-500/40 border border-green-400/40 hover:border-green-400/60 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg shadow-green-500/20"
              aria-label="Move Right"
            >
              <ChevronRight size={28} strokeWidth={2.5} />
            </button>
          )}

          {/* Zoom Controls Overlay - Bottom Left */}
          {controlPanelCollapsed && (
            <div className="absolute bottom-6 left-6 z-20 flex flex-col gap-2">
              <button
                onMouseDown={zoomInHandlers.handleStart}
                onMouseUp={zoomInHandlers.handleStop}
                onMouseLeave={zoomInHandlers.handleStop}
                onTouchStart={zoomInHandlers.handleStart}
                onTouchEnd={zoomInHandlers.handleStop}
                className="w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/40 hover:border-blue-400/60 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg"
                aria-label="Zoom In"
              >
                <ZoomIn size={20} strokeWidth={2.5} />
              </button>
              <button
                onMouseDown={zoomOutHandlers.handleStart}
                onMouseUp={zoomOutHandlers.handleStop}
                onMouseLeave={zoomOutHandlers.handleStop}
                onTouchStart={zoomOutHandlers.handleStart}
                onTouchEnd={zoomOutHandlers.handleStop}
                className="w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/40 hover:border-blue-400/60 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg"
                aria-label="Zoom Out"
              >
                <ZoomOut size={20} strokeWidth={2.5} />
              </button>
            </div>
          )}

          {/* Focus Controls Overlay - Bottom Right (only show if autofocus is disabled) */}
          {!autoFocusEnabled && controlPanelCollapsed && (
            <div className="absolute bottom-6 right-6 z-20 flex flex-col gap-2">
              <button
                onMouseDown={focusInHandlers.handleStart}
                onMouseUp={focusInHandlers.handleStop}
                onMouseLeave={focusInHandlers.handleStop}
                onTouchStart={focusInHandlers.handleStart}
                onTouchEnd={focusInHandlers.handleStop}
                className="w-12 h-12 bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 border border-purple-400/40 hover:border-purple-400/60 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg"
                aria-label="Focus In"
              >
                <Minus size={20} strokeWidth={2.5} />
              </button>
              <button
                onMouseDown={focusOutHandlers.handleStart}
                onMouseUp={focusOutHandlers.handleStop}
                onMouseLeave={focusOutHandlers.handleStop}
                onTouchStart={focusOutHandlers.handleStart}
                onTouchEnd={focusOutHandlers.handleStop}
                className="w-12 h-12 bg-purple-500/20 hover:bg-purple-500/30 active:bg-purple-500/40 border border-purple-400/40 hover:border-purple-400/60 text-white rounded-lg flex items-center justify-center transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-md shadow-lg"
                aria-label="Focus Out"
              >
                <Plus size={20} strokeWidth={2.5} />
              </button>
            </div>
          )}

          <iframe
            ref={iframeRef}
            src={`http://${window.location.hostname}:8889/${camId}`}
            className="w-full h-full border-0"
            allow="autoplay; fullscreen"
            onLoad={handleIframeLoad}
            onError={handleIframeError}
            style={{
              width: "100%",
              height: "100%",
              pointerEvents: "none",
              transform: `scale(${digitalZoom})`,
              transformOrigin: "center center",
              transition: "transform 0.2s ease-out",
            }}
          />

          {/* Loading Overlay */}
          {streamLoading && !streamError && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <Loader2 className="w-16 h-16 text-blue-500 animate-spin mb-4" />
              <p className="text-white text-lg font-medium">
                Chargement du flux vidéo...
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Connexion à la caméra en cours
              </p>
            </div>
          )}

          {/* Retry Overlay */}
          {isRetrying && (
            <div className="absolute inset-0 bg-black/80 backdrop-blur-sm flex flex-col items-center justify-center z-30">
              <RefreshCw className="w-16 h-16 text-yellow-500 animate-spin mb-4" />
              <p className="text-white text-lg font-medium">
                Reconnexion en cours...
              </p>
              <p className="text-slate-400 text-sm mt-2">
                Tentative de rétablissement du flux
              </p>
            </div>
          )}

          {/* Error Overlay */}
          {!streamError && streamLoading && isRetrying && (
            <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col items-center justify-center z-30">
              <div className="relative">
                <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
                <AlertCircle className="relative w-24 h-24 text-red-500 mb-6" />
              </div>
              <h3 className="text-white text-2xl font-bold mb-2">
                Impossible d'obtenir le flux
              </h3>
              <p className="text-slate-300 text-base mb-1">
                La connexion à la caméra a échoué
              </p>
              <p className="text-slate-400 text-sm mb-6">
                Vérifiez que la caméra est allumée et connectée
              </p>
              <button
                onClick={handleRetryStream}
                className="group px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
              >
                <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
                <span>Réessayer la connexion</span>
              </button>
              {retryCount > 0 && (
                <p className="text-slate-500 text-xs mt-4">
                  Tentatives: {retryCount}
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoStream;
