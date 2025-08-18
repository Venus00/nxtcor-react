"use client"

import type React from "react"
import { useState, useRef } from "react"
import { Camera, Thermometer, BarChart3, TrendingUp, Video, Eye, Move } from "lucide-react"

type CameraType = "normal" | "thermique"

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Video Feed")
  const [selectedCamera, setSelectedCamera] = useState<CameraType>("normal")
  const [videoSize, setVideoSize] = useState({ width: 640, height: 360 })
  const [isResizing, setIsResizing] = useState(false)
  const videoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const tabs = [
    { name: "Video Feed", content: <VideoFeedContent /> },
    { name: "Settings", content: <SettingsContent /> },
    { name: "Statistics", content: <StatisticsContent /> },
  ]

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsResizing(true)
    const startX = e.clientX
    const startY = e.clientY
    const startWidth = videoSize.width
    const startHeight = videoSize.height

    const handleMouseMove = (e: MouseEvent) => {
      const newWidth = Math.max(320, Math.min(800, startWidth + (e.clientX - startX)))
      const newHeight = Math.max(180, Math.min(450, startHeight + (e.clientY - startY)))
      setVideoSize({ width: newWidth, height: newHeight })
    }

    const handleMouseUp = () => {
      setIsResizing(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
  }

  function VideoFeedContent() {
    return (
      <div className="space-y-3">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-medium text-white mb-3 flex items-center gap-2">
            <Camera className="h-4 w-4 text-gray-400" />
            Camera Selection
          </h3>

          <div className="flex gap-3">
            <button
              onClick={() => setSelectedCamera("normal")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                selectedCamera === "normal"
                  ? "border-blue-500 bg-blue-900/30 text-blue-300 shadow-sm"
                  : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600"
              }`}
            >
              <Camera className="h-4 w-4" />
              <span className="font-medium">Normal Camera</span>
            </button>

            <button
              onClick={() => setSelectedCamera("thermique")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg border-2 transition-all duration-200 ${
                selectedCamera === "thermique"
                  ? "border-red-500 bg-red-900/30 text-red-300 shadow-sm"
                  : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600"
              }`}
            >
              <Thermometer className="h-4 w-4" />
              <span className="font-medium">Thermal Camera</span>
            </button>
          </div>

          <div className="mt-2 flex items-center gap-2">
            {selectedCamera === "normal" ? (
              <>
                <Eye className="h-3 w-3 text-blue-400" />
                <span className="text-xs text-gray-400">Standard RGB Camera Feed</span>
              </>
            ) : (
              <>
                <Thermometer className="h-3 w-3 text-red-400" />
                <span className="text-xs text-gray-400">Thermal Infrared Camera Feed</span>
              </>
            )}
          </div>
        </div>

        {/* Video Display */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg h-full">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-base font-medium text-white flex items-center gap-2">
              <Video className="h-4 w-4 text-gray-400" />
              Live Feed - {selectedCamera === "normal" ? "Normal Camera" : "Thermal Camera"}
            </h3>
            <div className="text-xs text-gray-400">
              {videoSize.width} × {videoSize.height}px
            </div>
          </div>

          <div className="flex justify-center">
      <div
  ref={containerRef}
  className="relative bg-black rounded-lg overflow-hidden border-2 border-gray-600 transition-all duration-200"
  style={{
    width: videoSize.width,
    height: videoSize.height,
    minWidth: 320,
    minHeight: 180,
    maxWidth: 800,
    maxHeight: 450,
  }}
>
  <div
    className={`w-full h-full flex flex-col items-center justify-center ${
      selectedCamera === "thermique"
        ? "bg-gradient-to-br from-purple-900 via-red-900 to-yellow-900"
        : "bg-gray-900"
    }`}
  >
                <div className="text-center px-4">
                  {selectedCamera === "normal" ? (
                    <>
                      <Camera className="h-8 w-8 sm:h-10 sm:w-10 text-gray-400 mx-auto mb-2" />
                      <p className="text-gray-300 text-sm font-medium">Normal Camera Feed</p>
                      <p className="text-gray-400 text-xs">Standard RGB Video Stream</p>
                    </>
                  ) : (
                    <>
                      <Thermometer className="h-8 w-8 sm:h-10 sm:w-10 text-red-400 mx-auto mb-2" />
                      <p className="text-red-300 text-sm font-medium">Thermal Camera Feed</p>
                      <p className="text-red-400 text-xs">Infrared Heat Detection</p>
                    </>
                  )}
                </div>
              </div>

              <div className="absolute top-2 left-2">
                <div
                  className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium ${
                    selectedCamera === "thermique" ? "bg-red-600 text-white" : "bg-blue-600 text-white"
                  }`}
                >
                  <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                  LIVE
                </div>
              </div>

              <div className="absolute bottom-2 right-2">
                <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                  {selectedCamera === "normal" ? "1920×1080 • 30fps" : "640×480 • 9Hz"}
                </div>
              </div>

            </div>
          </div>
        </div>
      </div>
    )
  }

  function SettingsContent() {
    return (
      <div className="space-y-6 h-[calc(100vh-5rem)] ">
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4">Camera Settings</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
              <select className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>1920x1080 (Full HD)</option>
                <option>1280x720 (HD)</option>
                <option>640x480 (SD)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Frame Rate</label>
              <select className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                <option>30 FPS</option>
                <option>25 FPS</option>
                <option>15 FPS</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    )
  }

  function StatisticsContent() {
    return (
      <div className="space-y-6 h-[calc(100vh-5rem)]">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-white">Objects Detected</h3>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-400">Today</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-white">Motion Events</h3>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-400">Today</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium text-white">Recording Time</h3>
            </div>
            <p className="text-2xl font-bold text-white">0</p>
            <p className="text-sm text-gray-400">Today</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className=" bg-black p-4">
      <div className="mb-4">
        <ul className="flex space-x-6 text-xl text-center border-b border-gray-700" role="tablist">
          {tabs.map((tab) => (
            <li className="me-2" role="presentation" key={tab.name}>
              <button
                className={`inline-block p-4 rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab.name
                    ? "text-white border-blue-500 border-b-2 bg-gray-800/50"
                    : "text-gray-400 hover:text-gray-200 hover:border-gray-500 border-b-2 border-transparent"
                }`}
                onClick={() => setActiveTab(tab.name)}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.name}
              >
                {tab.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        {tabs.map((tab) => (
          <div key={tab.name} className={`p-4 rounded-lg ${activeTab === tab.name ? "" : "hidden"}`} role="tabpanel">
            <div>{tabs.find((tab) => tab.name === activeTab)?.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Analytics
