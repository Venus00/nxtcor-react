import type React from "react"
import { useState } from "react"
import { Camera, Thermometer, BarChart3, TrendingUp, Video, Eye } from "lucide-react"
import { VideoFeedContent } from "./AnalyticVideo"

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState("Video Feed")
  const tabs = [
    { name: "Video Feed", content: <VideoFeedContent /> },
    // { name: "Settings", content: <SettingsContent /> },
    { name: "Statistics", content: <StatisticsContent /> },
  ]

  function StatisticsContent() {
    return (
      <div className=" h-[calc(100vh-5rem)]  ">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-8">
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
    <div className="h-full bg-black p-2 ">
      <div className=" mx-auto">
        <div className="mb-4 lg:mb-6">
          <ul className="flex space-x-2 sm:space-x-6 text-sm sm:text-lg lg:text-xl text-center border-b border-gray-700 overflow-x-auto" role="tablist">
            {tabs.map((tab) => (
              <li className="flex-shrink-0" role="presentation" key={tab.name}>
                <button
                  className={`inline-block p-2 sm:p-4 rounded-t-lg transition-colors duration-200 whitespace-nowrap ${activeTab === tab.name
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
            <div key={tab.name} className={`rounded-lg  ${activeTab === tab.name ? "" : "hidden"}`} role="tabpanel">
              <div >{tabs.find((tab) => tab.name === activeTab)?.content}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default Analytics