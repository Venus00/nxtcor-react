"use client"

import type React from "react"
import { useRef, useState, useEffect } from "react"
import { Camera, Target, Circle } from "lucide-react"

interface TrackedObject {
  classification: number;
  classificationName: string;
  trackId: number;
  x: number;
  y: number;
  z: number;
  x2: number;
  y2: number;
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

type CameraType = "cam1" | "cam2"

const Analytics: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<CameraType>("cam1")
  const [objects, setObjects] = useState<TrackedObject[]>([])
  const [trackingId, setTrackingId] = useState<number | null>(null)
  const [wsConnected, setWsConnected] = useState(false)
  const iframeRef = useRef<HTMLIFrameElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const wsRef = useRef<WebSocket | null>(null)

  // WebSocket connection
  useEffect(() => {
    const ws = new WebSocket(`ws://${window.location.hostname}:8080`)

    ws.onopen = () => {
      console.log('WebSocket connected')
      setWsConnected(true)
    }

    ws.onmessage = (event) => {
      try {
        console.log(event)
        const data: TrackingData = JSON.parse(event.data)
        if (data.type === 'tracking_data') {
          // Update objects even if checksum validation fails (for debugging)
          setObjects(data.data.objects)
          if (!data.data.crcValid) {
            console.warn('Checksum validation failed, but displaying objects anyway')
          }
        }
      } catch (err) {
        console.error('Error parsing WebSocket message:', err)
      }
    }

    ws.onerror = (error) => {
      console.error('WebSocket error:', error)
      setWsConnected(false)
    }

    ws.onclose = () => {
      console.log('WebSocket disconnected')
      setWsConnected(false)
    }

    wsRef.current = ws

    return () => {
      ws.close()
    }
  }, [])

  // Draw bounding boxes on canvas
  useEffect(() => {
    const canvas = canvasRef.current
    const iframe = iframeRef.current
    if (!canvas || !iframe) return

    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const drawBoxes = () => {
      // Get the actual rendered size of the iframe
      const iframeRect = iframe.getBoundingClientRect()

      // Update canvas to match iframe actual size
      canvas.width = iframeRect.width
      canvas.height = iframeRect.height

      ctx.clearRect(0, 0, canvas.width, canvas.height)

      objects.forEach((obj) => {
        // If tracking is active, only show the tracked object
        if (trackingId !== null && obj.trackId !== trackingId) {
          return; // Skip drawing this object
        }

        // Camera resolution (source coordinates from Python server)
        const cameraWidth = 640
        const cameraHeight = 480

        // Scale coordinates from camera resolution (640x480) to actual canvas size
        const boxX = (obj.x / cameraWidth) * canvas.width
        const boxY = (obj.y / cameraHeight) * canvas.height
        const boxX2 = (obj.x2 / cameraWidth) * canvas.width
        const boxY2 = (obj.y2 / cameraHeight) * canvas.height

        // Calculate box dimensions from diagonal coordinates
        const boxWidth = boxX2 - boxX
        const boxHeight = boxY2 - boxY

        // Determine color based on tracking status
        const isTracking = trackingId === obj.trackId
        ctx.strokeStyle = isTracking ? '#ef4444' : '#22c55e'
        ctx.lineWidth = isTracking ? 3 : 2
        ctx.fillStyle = isTracking ? 'rgba(239, 68, 68, 0.2)' : 'rgba(34, 197, 94, 0.2)'

        // Draw rectangle
        ctx.fillRect(boxX, boxY, boxWidth, boxHeight)
        ctx.strokeRect(boxX, boxY, boxWidth, boxHeight)

        // Draw label background
        const labelText = `${obj.classificationName} #${obj.trackId}`
        ctx.font = '14px sans-serif'
        const textWidth = ctx.measureText(labelText).width
        ctx.fillStyle = isTracking ? '#ef4444' : '#22c55e'
        ctx.fillRect(boxX, boxY - 25, textWidth + 10, 20)

        // Draw label text
        ctx.fillStyle = '#ffffff'
        ctx.fillText(labelText, boxX + 5, boxY - 10)

        // Draw position info
        const posText = `(${obj.x.toFixed(1)}, ${obj.y.toFixed(1)}, ${obj.z.toFixed(1)})`
        ctx.font = '11px sans-serif'
        ctx.fillStyle = '#ffffff'
        ctx.fillText(posText, boxX + 5, boxY + boxHeight + 15)
      })

      requestAnimationFrame(drawBoxes)
    }

    drawBoxes()
  }, [objects, trackingId])

  const enableTracking = async (id: number) => {
    try {
      await fetch(`http://${window.location.hostname}:3000/track/object/${id}`, {
        method: 'POST',
      })
      setTrackingId(id)
    } catch (error) {
      console.error('Error enabling tracking:', error)
    }
  }

  const disableTracking = async () => {
    try {
      await fetch(`http://${window.location.hostname}:3000/track/stop`, {
        method: 'POST',
      })
      setTrackingId(null)
    } catch (error) {
      console.error('Error disabling tracking:', error)
    }
  }

  const getCameraUrl = () => {
    const hostname = window.location.hostname;
    return selectedCamera === "cam1"
      ? `http://${hostname}:8889/cam1`
      : `http://${hostname}:8889/cam2`
  }

  return (
    <div className="h-full bg-black p-6">
      <div className="max-w-full mx-auto h-full flex flex-col">

        {/* Header */}
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md shadow-lg shadow-red-500/25">
              <Target className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Object Tracking</h1>
              <p className="text-slate-300">Real-time object detection and tracking</p>
            </div>
          </div>
        </div>

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
                <Circle className={`h-3 w-3 ${wsConnected ? 'text-green-500 fill-green-500' : 'text-red-500 fill-red-500'}`} />
                <span className="text-sm text-slate-300">
                  {wsConnected ? 'WebSocket Connected' : 'WebSocket Disconnected'}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        <div className="flex-1 min-h-0 flex gap-4">

          {/* Video Feed */}
          <div className="flex-1 bg-slate-800/60 border border-slate-600/50 rounded-lg overflow-hidden shadow-2xl shadow-black/40">
            <div className="bg-black border-b border-slate-600/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Camera className="h-5 w-5 text-slate-400" />
                  <h3 className="text-base font-medium text-white">
                    {selectedCamera.toUpperCase()} Feed
                  </h3>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">Objects: {objects.length}</div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-600/20 text-red-400 rounded-md border border-red-500/30">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                    <span className="text-xs font-medium">LIVE</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-full p-4">
              <div className="w-full h-full bg-black rounded-md overflow-hidden border border-slate-700/50 relative">
                <div className="relative w-full h-full">
                  <iframe
                    ref={iframeRef}
                    src={getCameraUrl()}
                    className="w-full h-full object-contain"
                    allow="autoplay; fullscreen"
                    style={{
                      transformOrigin: "center",
                      transition: "transform 0.3s ease",
                      border: "none"
                    }}
                  />
                  <canvas
                    ref={canvasRef}
                    className="absolute top-0 left-0 w-full h-full pointer-events-none"
                  />
                </div>

                {/* Status Overlay */}
                <div className="absolute top-3 left-3 bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-md border border-slate-600/50">
                  <div className="text-xs text-slate-200 font-mono space-y-1">
                    <div>Camera: {selectedCamera.toUpperCase()}</div>
                    <div>Objects: {objects.length}</div>
                    {trackingId !== null && (
                      <div className="flex items-center gap-1 text-red-400">
                        <Target className="w-3 h-3" />
                        <span>Tracking: #{trackingId}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Sidebar - Object List */}
          <div className="w-80 bg-slate-800/60 border border-slate-600/50 rounded-lg overflow-hidden flex flex-col">
            <div className="bg-black border-b border-slate-600/50 px-4 py-3">
              <h3 className="text-base font-medium text-white">Detected Objects</h3>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-2">
              {objects.length === 0 ? (
                <div className="text-center py-8 text-slate-400">
                  <Target className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>No objects detected</p>
                </div>
              ) : (
                objects.map((obj) => {
                  const isTracking = trackingId === obj.trackId
                  return (
                    <div
                      key={obj.trackId}
                      className={`p-3 rounded-lg border transition-all ${isTracking
                        ? 'bg-red-600/20 border-red-500/50'
                        : 'bg-slate-700/60 border-slate-600/50'
                        }`}
                    >
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <div className="text-sm font-medium text-white">
                            {obj.classificationName}
                          </div>
                          <div className="text-xs text-slate-400">ID: #{obj.trackId}</div>
                        </div>
                        <div className={`px-2 py-1 rounded text-xs ${isTracking ? 'bg-red-500 text-white' : 'bg-slate-600 text-slate-300'
                          }`}>
                          {isTracking ? 'TRACKING' : 'IDLE'}
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
                            ? 'bg-slate-700/50 text-slate-500 cursor-not-allowed'
                            : 'bg-red-600 hover:bg-red-700 text-white'
                            }`}
                        >
                          Enable Tracking
                        </button>
                      )}
                    </div>
                  )
                })
              )}
            </div>
          </div>

        </div>

      </div>
    </div>
  )
}

export default Analytics
