"use client"

import type React from "react"
import { useState } from "react"
import { Camera, Thermometer, BarChart3, TrendingUp, Video, Eye } from "lucide-react"

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Video Feed")
 const [selectedCameras, setSelectedCameras] = useState<string[]>(["normal", "thermal"])

  const cameraOptions = [
    { id: "normal", name: "Normal Camera", icon: Camera, color: "blue" },
    { id: "thermal", name: "Thermal Camera", icon: Thermometer, color: "red" }
  ]

  const handleCameraChange = (cameraId: string) => {
    setSelectedCameras(prev => {
      if (prev.includes(cameraId)) {
        return prev.filter(id => id !== cameraId)
      } else {
        return [...prev, cameraId]
      }
    })
  }

  const isSelected = (cameraId: string) => selectedCameras.includes(cameraId)

  const getCameraGridClass = () => {
    if (selectedCameras.length === 1) {
      return "grid-cols-1"
    }
    return "grid-cols-1 xl:grid-cols-2"
  }
  const tabs = [
    { name: "Video Feed", content: <VideoFeedContent /> },
    // { name: "Settings", content: <SettingsContent /> },
    { name: "Statistics", content: <StatisticsContent /> },
  ]

  function VideoFeedContent() {
    return (
   <div className="min-h-screen bg-black p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h2 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-green-400" />
            Camera Selection
          </h2>
          
          <div className="flex flex-wrap gap-3">
            {cameraOptions.map((camera) => {
              const IconComponent = camera.icon
              const selected = isSelected(camera.id)
              
              return (
                <label
                  key={camera.id}
                  className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${
                    selected
                      ? `border-${camera.color}-500 bg-${camera.color}-500/10 text-${camera.color}-400`
                      : "border-gray-600 bg-gray-700 text-gray-300 hover:border-gray-500 hover:bg-gray-600"
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={selected}
                    onChange={() => handleCameraChange(camera.id)}
                    className="sr-only"
                  />
                  <IconComponent className="h-5 w-5" />
                  <span className="font-medium">{camera.name}</span>
                  {selected && (
                    <div className={`w-2 h-2 bg-${camera.color}-400 rounded-full animate-pulse`}></div>
                  )}
                </label>
              )
            })}
          </div>
          
          <p className="text-xs text-gray-400 mt-2">
            Sélectionnez les caméras à afficher ({selectedCameras.length} sélectionnée{selectedCameras.length > 1 ? 's' : ''})
          </p>
        </div>

        {selectedCameras.length > 0 ? (
          <div className={`grid ${getCameraGridClass()} gap-4`}>
            {isSelected("normal") && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-white flex items-center gap-2">
                    <Camera className="h-4 w-4 text-blue-400" />
                    Normal Camera
                  </h3>
                  <div className="text-xs text-gray-400">
                    1920 x 1080px
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative bg-black rounded-lg overflow-hidden border-2 border-gray-600 w-full aspect-video max-w-2xl">
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gray-900">
                      <div className="text-center px-4">
                        <Camera className="h-8 w-8 sm:h-12 sm:w-12 text-blue-400 mx-auto mb-3" />
                        <p className="text-blue-300 text-sm sm:text-base font-medium">Normal Camera Feed</p>
                        <p className="text-blue-400 text-xs sm:text-sm">Standard RGB Video Stream</p>
                      </div>
                    </div>

                    <div className="absolute top-2 left-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        LIVE
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                        1920×1080 • 30fps
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Eye className="h-3 w-3 text-blue-400" />
                  <span className="text-xs text-gray-400">Standard RGB Camera Feed</span>
                </div>
              </div>
            )}

            {isSelected("thermal") && (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-base font-medium text-white flex items-center gap-2">
                    <Thermometer className="h-4 w-4 text-red-400" />
                    Thermal Camera
                  </h3>
                  <div className="text-xs text-gray-400">
                    640 × 480px
                  </div>
                </div>

                <div className="flex justify-center">
                  <div className="relative bg-black rounded-lg overflow-hidden border-2 border-gray-600 w-full aspect-video max-w-2xl">
                    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-br from-purple-900 via-red-900 to-yellow-900">
                      <div className="text-center px-4">
                        <Thermometer className="h-8 w-8 sm:h-12 sm:w-12 text-red-400 mx-auto mb-3" />
                        <p className="text-red-300 text-sm sm:text-base font-medium">Thermal Camera Feed</p>
                        <p className="text-red-400 text-xs sm:text-sm">Infrared Heat Detection</p>
                      </div>
                    </div>

                    <div className="absolute top-2 left-2">
                      <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-red-600 text-white">
                        <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                        LIVE
                      </div>
                    </div>

                    <div className="absolute bottom-2 right-2">
                      <div className="bg-black bg-opacity-60 text-white px-2 py-1 rounded text-xs">
                        640×480 • 9Hz
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <Thermometer className="h-3 w-3 text-red-400" />
                  <span className="text-xs text-gray-400">Thermal Infrared Camera Feed</span>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-8">
            <div className="text-center">
              <Camera className="h-12 w-12 text-gray-500 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-400 mb-2">Aucune caméra sélectionnée</h3>
              <p className="text-sm text-gray-500">
                Veuillez sélectionner au moins une caméra pour voir les flux vidéo
              </p>
            </div>
          </div>
        )}

        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
          <h3 className="text-base font-medium text-white mb-3 flex items-center gap-2">
            <BarChart3 className="h-4 w-4 text-green-400" />
            Camera Status
          </h3>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className={`flex items-center justify-between p-3 rounded-lg transition-opacity ${
              isSelected("normal") ? "bg-gray-700" : "bg-gray-700/50 opacity-50"
            }`}>
              <span className="text-sm text-gray-300">Normal Cam</span>
              <span className={`text-sm font-medium ${isSelected("normal") ? "text-green-400" : "text-gray-500"}`}>
                {isSelected("normal") ? "Online" : "Disabled"}
              </span>
            </div>
            
            <div className={`flex items-center justify-between p-3 rounded-lg transition-opacity ${
              isSelected("thermal") ? "bg-gray-700" : "bg-gray-700/50 opacity-50"
            }`}>
              <span className="text-sm text-gray-300">Thermal Cam</span>
              <span className={`text-sm font-medium ${isSelected("thermal") ? "text-green-400" : "text-gray-500"}`}>
                {isSelected("thermal") ? "Online" : "Disabled"}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Recording</span>
              <span className="text-sm font-medium text-blue-400">Active</span>
            </div>
            
            <div className="flex items-center justify-between p-3 bg-gray-700 rounded-lg">
              <span className="text-sm text-gray-300">Storage</span>
              <span className="text-sm font-medium text-yellow-400">85%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
    )
  }

  function SettingsContent() {
    return (
      <div className="space-y-6 h-[calc(100vh-5rem)]">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Normal Camera Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Camera className="h-5 w-5 text-blue-400" />
              Normal Camera Settings
            </h3>
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
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Brightness</label>
                <input type="range" min="0" max="100" defaultValue="50" className="w-full h-2 bg-gray-600 rounded-lg appearance-none cursor-pointer slider" />
              </div>
            </div>
          </div>

          {/* Thermal Camera Settings */}
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <Thermometer className="h-5 w-5 text-red-400" />
              Thermal Camera Settings
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Resolution</label>
                <select className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option>640x480 (Thermal Standard)</option>
                  <option>320x240 (Thermal Low)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Refresh Rate</label>
                <select className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option>9 Hz</option>
                  <option>7 Hz</option>
                  <option>5 Hz</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Temperature Range</label>
                <select className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-red-500 focus:border-red-500">
                  <option>-20°C to 120°C</option>
                  <option>0°C to 80°C</option>
                  <option>-40°C to 200°C</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        {/* Recording Settings */}
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
          <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
            <Video className="h-5 w-5 text-purple-400" />
            Recording Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Auto Record</label>
              <div className="flex items-center">
                <input type="checkbox" className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500" defaultChecked />
                <label className="ml-2 text-sm text-gray-300">Enable automatic recording</label>
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Storage Duration</label>
              <select className="bg-gray-700 border border-gray-600 text-gray-200 rounded-md px-3 py-2 w-full focus:ring-2 focus:ring-purple-500 focus:border-purple-500">
                <option>7 days</option>
                <option>14 days</option>
                <option>30 days</option>
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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              <h3 className="font-medium text-white text-sm lg:text-base">Objects Detected</h3>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-white">247</p>
            <p className="text-xs lg:text-sm text-gray-400">Today</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              <h3 className="font-medium text-white text-sm lg:text-base">Motion Events</h3>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-white">89</p>
            <p className="text-xs lg:text-sm text-gray-400">Today</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Camera className="h-5 w-5 text-purple-400" />
              <h3 className="font-medium text-white text-sm lg:text-base">Recording Time</h3>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-white">8.2h</p>
            <p className="text-xs lg:text-sm text-gray-400">Today</p>
          </div>
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center gap-2 mb-2">
              <Thermometer className="h-5 w-5 text-red-400" />
              <h3 className="font-medium text-white text-sm lg:text-base">Heat Alerts</h3>
            </div>
            <p className="text-xl lg:text-2xl font-bold text-white">12</p>
            <p className="text-xs lg:text-sm text-gray-400">Today</p>
          </div>
        </div>

        {/* Additional Statistics */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-green-400" />
              Daily Activity
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Normal Camera Uptime</span>
                <span className="text-sm font-medium text-green-400">99.8%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Thermal Camera Uptime</span>
                <span className="text-sm font-medium text-green-400">98.5%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Average Temperature</span>
                <span className="text-sm font-medium text-yellow-400">22.3°C</span>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 border border-gray-700 rounded-lg p-6">
            <h3 className="text-lg font-medium text-white mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-blue-400" />
              System Performance
            </h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">CPU Usage</span>
                <span className="text-sm font-medium text-blue-400">45%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Memory Usage</span>
                <span className="text-sm font-medium text-blue-400">62%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-300">Network Latency</span>
                <span className="text-sm font-medium text-green-400">12ms</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black p-2 sm:p-4 lg:p-6">
      <div className="max-w-7xl mx-auto">
        <div className="mb-4 lg:mb-6">
          <ul className="flex space-x-2 sm:space-x-6 text-sm sm:text-lg lg:text-xl text-center border-b border-gray-700 overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <li className="flex-shrink-0" role="presentation" key={tab.name}>
                <button
                  className={`inline-block p-2 sm:p-4 rounded-t-lg transition-colors duration-200 whitespace-nowrap ${
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
            <div key={tab.name} className={`rounded-lg ${activeTab === tab.name ? "" : "hidden"}`} role="tabpanel">
              <div>{tabs.find((tab) => tab.name === activeTab)?.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics