import React, { useRef, useEffect } from "react";

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
      return;
    }

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
        const res = await fetch(
          `http://${window.location.hostname}:9898/${selectedCamera}`,
          {
            method: "POST",
            headers: {
              "Content-Type": "application/sdp",
            },
            body: offer.sdp,
          }
        );

        if (!res.ok) {
          throw new Error(`Server returned ${res.status}: ${res.statusText}`);
        }

        const answerText = await res.text();
        console.log("Received WebRTC answer:", answerText.substring(0, 100));

        // Check if the response is JSON (server wraps SDP in JSON)
        let sdpAnswer: string;
        try {
          const jsonResponse = JSON.parse(answerText);
          sdpAnswer = jsonResponse.sdp;
          console.log("Extracted SDP from JSON response");
        } catch {
          // Not JSON, use as-is
          sdpAnswer = answerText;
        }

        if (!sdpAnswer || sdpAnswer.trim().length === 0) {
          throw new Error("Received empty SDP answer from server");
        }

        await pc.setRemoteDescription({
          type: "answer",
          sdp: sdpAnswer,
        });

        console.log(`WebRTC connection established for ${selectedCamera}`);
      } catch (error) {
        console.error("WebRTC connection error:", error);
      }
    };

    startWebRTC();

    // Expose video ref to parent if callback provided
    if (onVideoRef) {
      onVideoRef(videoRef.current);
    }

    return () => {
      if (pc) {
        pc.close();
        pcRef.current = null;
      }
    };
  }, [selectedCamera, detectionEnabled, onVideoRef]);

  return (
    <div className="w-full bg-black rounded-lg overflow-hidden border border-slate-600/50 shadow-2xl shadow-black/40">
      <div
        className="relative"
        style={{ width: "100%", aspectRatio: "4/3", backgroundColor: "#000" }}
      >
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          style={{
            width: "100%",
            height: "100%",
            objectFit: "contain",
            backgroundColor: "#000",
            display: "block",
          }}
        />
      </div>
    </div>
  );
};

export default WebRTCMonitor;
