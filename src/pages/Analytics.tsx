"use client"

import type React from "react"
import { useRef, useState } from "react"
import { Camera, Thermometer, BarChart3 } from "lucide-react"

type CameraType = "normal" | "thermique"

const Analytics: React.FC = () => {
  const [selectedCamera, setSelectedCamera] = useState<CameraType>("normal")
  const videoRef = useRef<HTMLVideoElement | null>(null)

  const [scale] = useState(1)
  const [position] = useState({ x: 0, y: 0 })

  return (
    <div className="h-full bg-black p-6">
      <div className="max-w-7xl mx-auto h-full flex flex-col">
        
        <div className="mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-red-600 to-red-700 text-white rounded-md shadow-lg shadow-red-500/25">
              <BarChart3 className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-white">Analytics Dashboard</h1>
              <p className="text-slate-300">Real-time video analysis</p>
            </div>
          </div>
        </div>

        <div className="mb-6">
          <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium text-white">Camera Type:</label>

              <div className="relative">
                <select
                  value={selectedCamera}
                  onChange={(e) => setSelectedCamera(e.target.value as CameraType)}
                  className="bg-slate-900/60 border border-slate-600/50 text-slate-300 rounded-md px-3 py-2 pr-8 focus:outline-none focus:ring-2 focus:ring-red-500/50 focus:border-red-500/50 cursor-pointer min-w-[180px] hover:bg-slate-800/60 transition-all duration-200"
                >
                  <option value="normal">Caméra Normale</option>
                  <option value="thermique">Caméra Thermique</option>
                </select>
                <div className="absolute inset-y-0 right-0 flex items-center px-2 pointer-events-none">
                  <svg className="w-4 h-4 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>

              <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-700/60 text-slate-200 rounded-md border border-slate-600/50">
                {selectedCamera === "normal" ? <Camera className="h-4 w-4" /> : <Thermometer className="h-4 w-4" />}
                <span className="text-sm font-medium capitalize">
                  {selectedCamera === "normal" ? "Standard" : "Thermal"}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="flex-1 min-h-0">
          <div className="h-full bg-slate-800/60 border border-slate-600/50 rounded-lg overflow-hidden shadow-2xl shadow-black/40">

            <div className="bg-black border-b border-slate-600/50 px-4 py-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {selectedCamera === "normal" ? (
                    <Camera className="h-5 w-5 text-slate-400" />
                  ) : (
                    <Thermometer className="h-5 w-5 text-slate-400" />
                  )}
                  <h3 className="text-base font-medium text-white">
                    {selectedCamera === "normal" ? "Standard Camera Feed" : "Thermal Camera Feed"}
                  </h3>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-xs text-slate-400">1920x1080 • 30 FPS</div>
                  <div className="flex items-center gap-2 px-2 py-1 bg-red-600/20 text-red-400 rounded-md border border-red-500/30">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                    <span className="text-xs font-medium">REC</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative h-full p-4">
              <div className="w-full h-full bg-black rounded-md overflow-hidden border border-slate-700/50 relative">
                
                <div className="flex-grow flex justify-center items-center relative bg-black">
                  <div className="relative w-full h-full overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="object-fill"
                      poster="/mjpeg"
                      style={{
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        transformOrigin: "center",
                        transition: "transform 0.3s ease",
                        width: "100%",
                        height: "100%",
                      }}
                      autoPlay
                      muted
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>

                <div className="absolute top-3 left-3 bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-md border border-slate-600/50">
                  <div className="text-xs text-slate-200 font-mono space-y-1">
                    <div>Camera: {selectedCamera.toUpperCase()}</div>
                    <div>Time: {new Date().toLocaleTimeString()}</div>
                    <div className="flex items-center gap-1">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span>LIVE</span>
                    </div>
                  </div>
                </div>

                <div className="absolute top-3 right-3 bg-slate-800/90 backdrop-blur-sm px-3 py-2 rounded-md border border-slate-600/50">
                  <div className="text-xs text-slate-200 space-y-1">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span>Objects: 0</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <span>Motion: Inactive</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <span>Analysis: ON</span>
                    </div>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  )
}

export default Analytics
