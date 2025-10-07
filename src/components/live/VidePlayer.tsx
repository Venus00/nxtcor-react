import React, { useRef, useEffect } from "react";

const WS_URL = "ws://192.168.137.31:12581/live/main";

function VideoStreamPlayer() {
  const videoRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    let mediaSource;
    let sourceBuffer;
    let ws;
    const dataQueue = [];

    const videoElement = videoRef.current;
    if (!videoElement || !window.MediaSource) {
      console.error("Browser does not support MediaSource.");
      return;
    }

    mediaSource = new MediaSource();
    videoElement.src = URL.createObjectURL(mediaSource);

    const appendNextChunk = () => {
      if (
        isMounted &&
        sourceBuffer &&
        !sourceBuffer.updating &&
        dataQueue.length > 0 &&
        mediaSource.readyState === "open"
      ) {
        try {
          sourceBuffer.appendBuffer(dataQueue.shift());
        } catch (error) {
          console.error("Error appending buffer:", error);
        }
      }
    };

    const onSourceOpen = () => {
      if (!isMounted) return;
      URL.revokeObjectURL(videoElement.src);

      ws = new WebSocket(WS_URL);
      ws.binaryType = "arraybuffer";

      // --- LOW-LATENCY MANAGEMENT ---
      // This interval will run periodically to manage the buffer
      const lowLatencyInterval = setInterval(() => {
        // If we have a buffer and it's not updating...
        if (sourceBuffer && !sourceBuffer.updating) {
          // Check if we have buffered data
          if (videoElement.buffered.length > 0) {
            const bufferedEnd = videoElement.buffered.end(0);
            const playbackTime = videoElement.currentTime;

            // If the player has fallen more than 1.5 seconds behind the live edge, seek forward
            if (bufferedEnd - playbackTime > 1.5) {
              console.log("Latency too high, seeking to live edge...");
              videoElement.currentTime = bufferedEnd;
            }
          }
        }
      }, 2000); // Run every 2 seconds

      ws.onmessage = async (event) => {
        // ... (The onmessage logic is the same as the previous version)
        if (!isMounted) return;

        if (!sourceBuffer) {
          try {
            const initData = JSON.parse(event.data);
            if (initData.mimecodec) {
              const mimeType = initData.mimecodec;
              console.log("Received MIME type:", mimeType);

              if (MediaSource.isTypeSupported(mimeType)) {
                sourceBuffer = mediaSource.addSourceBuffer(mimeType);
                sourceBuffer.addEventListener("updateend", appendNextChunk);
              } else {
                console.error("Unsupported MIME type:", mimeType);
                ws.close();
              }
            }
          } catch (e) {
            console.warn(
              "Received a non-JSON message before initialization. Ignoring."
            );
          }
          return;
        }

        if (event.data instanceof ArrayBuffer) {
          dataQueue.push(event.data);
          appendNextChunk();
        }
      };

      ws.onopen = () =>
        console.log("WebSocket connected, waiting for initialization data...");
      ws.onerror = (error) => console.error("WebSocket Error:", error);
      ws.onclose = () => {
        console.log("WebSocket closed.");
        clearInterval(lowLatencyInterval); // Stop the interval on close
      };
    };

    mediaSource.addEventListener("sourceopen", onSourceOpen);

    return () => {
      // Cleanup function
      isMounted = false;
      // Make sure interval is cleared on component unmount
      const lowLatencyInterval = mediaSource.lowLatencyInterval;
      if (lowLatencyInterval) clearInterval(lowLatencyInterval);

      if (sourceBuffer) {
        sourceBuffer.removeEventListener("updateend", appendNextChunk);
      }
      if (ws) {
        ws.close();
      }
      if (mediaSource && mediaSource.readyState === "open") {
        try {
          mediaSource.endOfStream();
        } catch (e) {
          console.warn("Error during mediaSource.endOfStream():", e);
        }
      }
    };
  }, []);

  return (
    <div>
      <h2>Live Camera Feed</h2>
      <video ref={videoRef} autoPlay controls muted playsInline>
        Your browser does not support the video tag.
      </video>
    </div>
  );
}

export default VideoStreamPlayer;
