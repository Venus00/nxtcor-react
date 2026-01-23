"use client"

import type React from "react"
import { useState } from "react"

const Storage: React.FC = () => {
  const [activeTab, setActiveTab] = useState("recording")

  const [recordingSchedule, setRecordingSchedule] = useState(true)
  const [format, setFormat] = useState("MP4")
  const [resolution, setResolution] = useState("1920*1080")
  const [quality, setQuality] = useState("High")
  const [bitrate, setBitrate] = useState("2048")
  const [framerate, setFramerate] = useState("30fps")

  const [imageStorageCapacity, setImageStorageCapacity] = useState("5.00 GB")
  const [freeImageSize, setFreeImageSize] = useState("3.00 GB")
  const [recordingCapacity, setRecordingCapacity] = useState("5.00 GB")
  const [freeRecordingSize, setFreeRecordingSize] = useState("3.00 GB")
  const [imagePercentage, setImagePercentage] = useState(0.0)
  const [recordingPercentage, setRecordingPercentage] = useState(95)

  const [schedule, setSchedule] = useState<boolean[][]>(
    Array(7)
      .fill(null)
      .map(() => Array(24).fill(false)),
  )

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  const hours = Array.from({ length: 24 }, (_, i) => i.toString().padStart(2, "0"))

  const toggleScheduleCell = (dayIndex: number, hourIndex: number) => {
    const newSchedule = [...schedule]
    newSchedule[dayIndex][hourIndex] = !newSchedule[dayIndex][hourIndex]
    setSchedule(newSchedule)
  }

  const clearAll = () => {
    setSchedule(
      Array(7)
        .fill(null)
        .map(() => Array(24).fill(false)),
    )
  }

  const diskData = [
    {
      capacity: "1TB",
      details: "SATA III",
      firstSpace: "Available",
      boot: "No",
      type: "HDD",
      property: "Read/Write",
      options: "Format",
    },
  ]

  return (
    <div className="h-full flex flex-col">
      <div className="border-b border-gray-200 mb-4">
        <nav className="-mb-px flex space-x-6">
          <button
            onClick={() => setActiveTab("recording")}
            className={`py-1 px-1 border-b-2 text-sm font-medium ${activeTab === "recording"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Recording schedule
          </button>
          <button
            onClick={() => setActiveTab("storage")}
            className={`py-1 px-1 border-b-2 text-sm font-medium ${activeTab === "storage"
                ? "border-blue-500 text-blue-600"
                : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
          >
            Storage management
          </button>
        </nav>
      </div>

      <div className="flex-1 overflow-auto">
        {activeTab === "recording" && (
          <div className="space-y-4">
            <div className="flex items-center">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  checked={recordingSchedule}
                  onChange={(e) => setRecordingSchedule(e.target.checked)}
                  className="mr-1 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                <span className="text-sm text-gray-700">Schedule recording</span>
              </label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Format</label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="MP4">MP4</option>
                  <option value="AVI">AVI</option>
                  <option value="MOV">MOV</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Resolution</label>
                <select
                  value={resolution}
                  onChange={(e) => setResolution(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="1920*1080">1920*1080</option>
                  <option value="1280*720">1280*720</option>
                  <option value="640*480">640*480</option>
                </select>
              </div>
            </div>

            {/* Quality and Bitrate */}
            <div className="grid grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Quality</label>
                <select
                  value={quality}
                  onChange={(e) => setQuality(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Bitrate</label>
                <select
                  value={bitrate}
                  onChange={(e) => setBitrate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="2048">2048</option>
                  <option value="1024">1024</option>
                  <option value="512">512</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1"> time</label>
                <select
                  value={framerate}
                  onChange={(e) => setFramerate(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="30fps">ms</option>
                  <option value="25fps">s</option>
                  <option value="15fps">m</option>
                </select>
              </div>
            </div>


            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs text-gray-700">Weekly recording schedule</span>
                <button onClick={clearAll} className="text-xs text-red-600 hover:text-red-800">
                  Clear all
                </button>
              </div>

              <div className="border border-gray-300 rounded overflow-hidden">
                <div className="flex bg-gray-50">
                  <div className="w-12 p-1 text-xs text-gray-700 border-r border-gray-300"></div>
                  {hours.map((hour) => (
                    <div
                      key={hour}
                      className="flex-1 p-1 text-sm text-gray-700 text-center border-r border-gray-300 last:border-r-0 min-w-[24px]"
                    >
                      {hour}
                    </div>
                  ))}
                </div>
                {days.map((day, dayIndex) => (
                  <div key={day} className="flex border-t border-gray-300">
                    <div className="w-12 p-1 text-sm text-gray-700 bg-gray-50 border-r border-gray-300">
                      {day}
                    </div>
                    <div className="flex flex-1">
                      {hours.map((_, hourIndex) => (
                        <div
                          key={hourIndex}
                          className="flex-1 p-0.5 border-r border-gray-300 last:border-r-0 cursor-pointer hover:bg-gray-100 min-w-[24px] flex items-center justify-center"
                          onClick={() => toggleScheduleCell(dayIndex, hourIndex)}
                        >
                          <div
                            className={`w-3 h-3 rounded-sm ${schedule[dayIndex][hourIndex] ? "bg-green-500" : "bg-gray-200 hover:bg-gray-300"
                              }`}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button className="px-3 py-1 bg-red-600 text-white  rounded hover:bg-red-700 focus:ring-1 focus:ring-red-500">
              Enregistrer les Modifications
            </button>
          </div>
        )}


        {activeTab === "storage" && (
          <div className="space-y-6">
            {/* Hard disk management table */}
            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Hard disk management</h3>
              <div className="overflow-x-auto">
                <table className="min-w-full border border-gray-300">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                        Capacity
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                        Details
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                        First space
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                        Boot
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                        Type
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700 border-r border-gray-300">
                        Property
                      </th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-700">Options</th>
                    </tr>
                  </thead>
                  <tbody>
                    {diskData.map((disk, index) => (
                      <tr key={index} className="border-t border-gray-300">
                        <td className="px-4 py-2 text-sm text-gray-700 border-r border-gray-300">{disk.capacity}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 border-r border-gray-300">{disk.details}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 border-r border-gray-300">{disk.firstSpace}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 border-r border-gray-300">{disk.boot}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 border-r border-gray-300">{disk.type}</td>
                        <td className="px-4 py-2 text-sm text-gray-700 border-r border-gray-300">{disk.property}</td>
                        <td className="px-4 py-2 text-sm text-gray-700">{disk.options}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-700 mb-3">Quota</h3>
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Image storage capacity</label>
                  <input
                    type="text"
                    value={imageStorageCapacity}
                    onChange={(e) => setImageStorageCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Free image size</label>
                  <input
                    type="text"
                    value={freeImageSize}
                    onChange={(e) => setFreeImageSize(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Recording capacity</label>
                  <input
                    type="text"
                    value={recordingCapacity}
                    onChange={(e) => setRecordingCapacity(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 mb-6">
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Free recording size</label>
                  <input
                    type="text"
                    value={freeRecordingSize}
                    onChange={(e) => setFreeRecordingSize(e.target.value)}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-600 mb-1">Image percentage</label>
                  <input
                    type="text"
                    value={`${imagePercentage.toFixed(2)} GB`}
                    onChange={(e) => {
                      const value = Number.parseFloat(e.target.value.replace(" GB", "")) || 0
                      setImagePercentage(value)
                    }}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div></div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-gray-600 mb-2">Image percentage</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">0</span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      step="0.01"
                      value={imagePercentage}
                      onChange={(e) => setImagePercentage(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="absolute -top-8 left-0 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      {imagePercentage.toFixed(2)}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">100</span>
                </div>
              </div>

              <div className="mb-6">
                <label className="block text-xs text-gray-600 mb-2">Recording percentage</label>
                <div className="flex items-center space-x-4">
                  <span className="text-sm text-gray-700">0</span>
                  <div className="flex-1 relative">
                    <input
                      type="range"
                      min="0"
                      max="100"
                      value={recordingPercentage}
                      onChange={(e) => setRecordingPercentage(Number(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="absolute -top-8 right-0 bg-red-600 text-white text-xs px-2 py-1 rounded">
                      {recordingPercentage}
                    </div>
                  </div>
                  <span className="text-sm text-gray-700">100</span>
                </div>
              </div>

              <button className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500">
                ENREGISTRER LES MODIFICATIONS
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default Storage
