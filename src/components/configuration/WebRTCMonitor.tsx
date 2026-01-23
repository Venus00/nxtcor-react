import React, { useRef, useEffect, useState } from "react";
import { Loader2, RefreshCw, AlertCircle } from "lucide-react";

interface WebRTCMonitorProps {
  selectedCamera: "cam1" | "cam2";
  detectionEnabled: boolean;
  onVideoRef?: (ref: HTMLVideoElement | null) => void;
}

const WebRTCMonitor: React.FC<WebRTCMonitorProps> = ({
  selectedCamera,
  detectionEnabled,
  onVideoRef,
}) => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const pcRef = useRef<RTCPeerConnection | null>(null);
  const connectionAttemptedRef = useRef<boolean>(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isRetrying, setIsRetrying] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [connectionError, setConnectionError] = useState(false);
  const [retryCount, setRetryCount] = useState(0);
  const maxRetries = 5;

  // WebRTC connection for video feed
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
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
      connectionAttemptedRef.current = false;
      setIsLoading(false);
      setIsRetrying(false);
      setIsVideoPlaying(false);
      setConnectionError(false);
      setRetryCount(0);
      return;
    }

    // Prevent multiple connection attempts
    if (connectionAttemptedRef.current && pcRef.current) {
      return;
    }

    connectionAttemptedRef.current = true;
    setIsLoading(true);
    setIsVideoPlaying(false);
    setConnectionError(false);
    let pc: RTCPeerConnection | null = null;

    const startWebRTC = async () => {
      try {
        pc = new RTCPeerConnection();
        pcRef.current = pc;

        pc.ontrack = (event) => {
          console.log("WebRTC ontrack event received:", event);
          console.log("Number of streams:", event.streams.length);
          console.log("Track kind:", event.track.kind);
          console.log("Track enabled:", event.track.enabled);
          console.log("Track readyState:", event.track.readyState);

          if (videoRef.current && event.streams[0]) {
            videoRef.current.srcObject = event.streams[0];
            console.log("Video srcObject set to stream");
            console.log("Stream ID:", event.streams[0].id);
            console.log("Tracks in stream:", event.streams[0].getTracks());
            console.log(
              "Video element readyState:",
              videoRef.current.readyState
            );

            // Add event listeners to video element
            videoRef.current.onloadedmetadata = () => {
              console.log("Video metadata loaded");
            };
            videoRef.current.oncanplay = () => {
              console.log("Video can play");
            };
            videoRef.current.onplaying = () => {
              console.log("Video is playing");
              setIsLoading(false);
              setIsRetrying(false);
              setIsVideoPlaying(true);
            };
            videoRef.current.onerror = (e) => {
              console.error("Video element error:", e);
            };
          } else {
            console.warn("Video ref or stream not available");
          }
        };

        pc.oniceconnectionstatechange = () => {
          console.log("ICE connection state:", pc?.iceConnectionState);
        };

        pc.onconnectionstatechange = () => {
          console.log("Connection state:", pc?.connectionState);
        };

        // Add transceiver for receiving video stream
        pc.addTransceiver("video", { direction: "recvonly" });

        const offer = await pc.createOffer();
        await pc.setLocalDescription(offer);

        console.log(`Sending WebRTC offer to port 9898/${selectedCamera}`);
        const serverHost =
          window.location.hostname === "localhost"
            ? "192.168.10.208"
            : window.location.hostname;
        const res = await fetch(`http://${serverHost}:9898/${selectedCamera}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/sdp",
          },
          body: offer.sdp,
        });

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        const answer = await res.json();
        console.log("Received WebRTC answer:", answer);

        await pc.setRemoteDescription(
          new RTCSessionDescription({
            type: "answer",
            sdp: answer.sdp,
          })
        );

        console.log(`WebRTC connection established for ${selectedCamera}`);
        setConnectionError(false);
        setRetryCount(0);
      } catch (error) {
        console.error("WebRTC connection error:", error);
        connectionAttemptedRef.current = false;
        setIsLoading(false);

        if (retryCount < maxRetries) {
          setIsRetrying(true);
          setRetryCount(prev => prev + 1);
          // Retry connection after 3 seconds
          reconnectTimeoutRef.current = setTimeout(() => {
            console.log(`Retrying WebRTC connection for ${selectedCamera}... (Attempt ${retryCount + 1}/${maxRetries})`);
            setIsRetrying(true);
            setIsLoading(true);
            startWebRTC().catch(err => console.error("Retry failed:", err));
          }, 3000);
        } else {
          setConnectionError(true);
          setIsRetrying(false);
        }
      }
    };

    // Start WebRTC connection asynchronously without blocking
    startWebRTC().catch(err => {
      console.error("Failed to start WebRTC:", err);
      setIsLoading(false);
      setConnectionError(true);
    });

    // Expose video ref to parent if callback provided
    if (onVideoRef) {
      onVideoRef(videoRef.current);
    }

    return () => {
      if (pc) {
        pc.close();
        pcRef.current = null;
      }
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
        reconnectTimeoutRef.current = null;
      }
    };
  }, [selectedCamera, detectionEnabled, retryCount]);

  const handleManualRetry = () => {
    setConnectionError(false);
    setRetryCount(0);
    setIsLoading(true);
    connectionAttemptedRef.current = false;
  };

  return (
    <div className="w-full h-full bg-black rounded-lg overflow-hidden border border-slate-600/50 shadow-2xl shadow-black/40">
      <div className="relative w-full h-full flex items-center justify-center" style={{ backgroundColor: "#000" }}>
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "130%",
            height: "130%",
            objectFit: "contain",
            backgroundColor: "#000",
            display: "block",
            transform: "scale(1)",
            transformOrigin: "center center",
          }}
        />

        {/* Loading Overlay */}
        {isLoading && !isVideoPlaying && !connectionError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-blue-500/20 rounded-full blur-3xl animate-pulse"></div>
              <Loader2 className="relative w-20 h-20 text-blue-400 animate-spin" />
            </div>
            <div className="text-blue-400 text-xl font-semibold mb-2">
              Chargement du flux vidéo...
            </div>
            <div className="text-slate-400 text-sm">
              Connexion à {selectedCamera === "cam1" ? "la caméra optique" : "la caméra thermique"}
            </div>
          </div>
        )}

        {/* Retry Overlay */}
        {isRetrying && !isVideoPlaying && !connectionError && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-yellow-500/20 rounded-full blur-3xl animate-pulse"></div>
              <RefreshCw className="relative w-20 h-20 text-yellow-400 animate-spin" />
            </div>
            <div className="text-yellow-400 text-xl font-semibold mb-2">
              Reconnexion en cours...
            </div>
            <div className="text-slate-400 text-sm mb-2">
              Tentative de reconnexion au flux vidéo
            </div>
            <div className="text-slate-500 text-xs">
              Tentative {retryCount}/{maxRetries}
            </div>
          </div>
        )}

        {/* Error Overlay */}
        {connectionError && !isVideoPlaying && (
          <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
            <div className="relative mb-6">
              <div className="absolute inset-0 bg-red-500/20 rounded-full blur-3xl animate-pulse"></div>
              <AlertCircle className="relative w-20 h-20 text-red-500" />
            </div>
            <h3 className="text-white text-xl font-bold mb-2">Connexion échouée</h3>
            <p className="text-slate-300 text-base mb-1">Impossible de se connecter à la caméra</p>
            <p className="text-slate-400 text-sm mb-6">
              {selectedCamera === "cam1" ? "Caméra optique" : "Caméra thermique"} non disponible
            </p>
            <button
              onClick={handleManualRetry}
              className="group px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-all duration-300 flex items-center gap-3 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/40 hover:scale-105 active:scale-95"
            >
              <RefreshCw className="w-5 h-5 group-hover:rotate-180 transition-transform duration-500" />
              <span>Réessayer</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WebRTCMonitor;
