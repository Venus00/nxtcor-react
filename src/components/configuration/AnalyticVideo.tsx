import { Camera, Thermometer, BarChart3, Eye } from "lucide-react"
import { useState, useRef } from "react"
import axios from "axios"

const cameraOptions = [
    { id: "Normal", name: "Normal Camera", icon: Camera, color: "blue", rtspUrl: "rtsp://${VITE}:8554/cam1", stream: 'stream1' },
    { id: "Thermal", name: "Thermal Camera", icon: Thermometer, color: "red", rtspUrl: "rtsp://${VITE}:8554/cam2", stream: 'stream2' }
]

function CameraPlayer({ cameraId, name, icon: Icon, rtspUrl, stream, color }: any) {
    // State for preset action
    const [activePreset, setActivePreset] = useState<number | null>(null);
    const [isPresetRunning, setIsPresetRunning] = useState(false);

    // Send PTZ move command to backend for the selected camera and preset
    const handlePresetClick = async (preset: number) => {
        setActivePreset(preset);
        setIsPresetRunning(true);
        try {
            await axios.post(`http://${window.location.hostname}:3000/ptz/cam1/preset`, { preset });
        } catch (err) {
            alert('Failed to move PTZ camera to preset.');
            setIsPresetRunning(false);
            setActivePreset(null);
        }
    };

    const handleStopClick = async () => {
        // Stop PTZ, zoom, and focus
        setIsPresetRunning(false);
        setActivePreset(null);
        try {
            await axios.post(`http://${window.location.hostname}:3000/ptz/cam1/move/stop`, { direction: 'stop' });
            await axios.post(`http://${window.location.hostname}:3000/focus/cam1/focus/stop`, { direction: 'focus_in' });
            await axios.post(`http://${window.location.hostname}:3000/focus/cam1/zoom/stop`, { direction: 'focus_out' });
        } catch (err) {
            // ignore errors for stop
        }
    };

    // ...existing code...
    const [showPresetModal, setShowPresetModal] = useState(false);

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
            <div className="flex items-center justify-between mb-2">
                <h3 className="text-sm font-medium text-white flex items-center gap-1">
                    <Icon className={`h-3.5 w-3.5 text-${color}-400`} />
                    {name}
                </h3>
                <div className="flex items-center gap-2">
                    <div className="text-xs text-gray-400">
                        {cameraId === "thermal" ? "640×480px" : "1920×1080px"}
                    </div>
                </div>
            </div>
            {/* Image and live view side by side */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
                {/* Live view - much larger */}
                <div className="flex-1 min-w-[400px] max-w-4xl aspect-video flex items-center justify-center" style={{ aspectRatio: '16/9' }}>
                    <iframe
                        src={`http://${window.location.hostname}:8889/${stream === "stream1" ? "cam1" : "cam2"}`}
                        width="1000"
                        height="562"
                        className="object-fill w-full h-full rounded-lg border-2 border-blue-700 shadow-xl"
                        allow="autoplay; fullscreen"
                        style={{
                            transformOrigin: "center",
                            transition: "transform 0.3s ease",
                        }}
                    />
                </div>

            </div>
            <span className="text-xs text-gray-500 block text-center mt-2">Click a marker to move PTZ camera to preset</span>
        </div>
    )
}

export function VideoFeedContent() {
    const [selectedCameras, setSelectedCameras] = useState<string[]>(["Normal", "Thermal"])

    const handleCameraChange = (cameraId: string) => {
        setSelectedCameras(prev =>
            prev.includes(cameraId) ? prev.filter(id => id !== cameraId) : [...prev, cameraId]
        )
    }

    const isSelected = (cameraId: string) => selectedCameras.includes(cameraId)

    const getCameraGridClass = () => selectedCameras.length === 1 ? "grid-cols-1" : "grid-cols-1 lg:grid-cols-2"

    return (
        <div className="h-[calc(100vh-5rem)] p-2 sm:p-3 lg:p-4">
            <div className="mx-auto space-y-4">
                <div className="bg-gray-800 border border-gray-700 rounded-lg p-3">
                    <h2 className="text-base font-medium text-white mb-2 flex items-center gap-1">
                        <BarChart3 className="h-4 w-4 text-green-400" />
                        Camera Selection
                    </h2>
                    <div className="flex flex-wrap gap-2">
                        {cameraOptions.map((camera) => {
                            const IconComponent = camera.icon
                            const selected = isSelected(camera.id)
                            return (
                                <label
                                    key={camera.id}
                                    className={`flex items-center gap-2 px-3 py-2 rounded-lg border cursor-pointer transition-all ${selected
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
                                    <IconComponent className="h-4 w-4" />
                                    <span className="text-sm font-medium">{camera.name}</span>
                                    {selected && (
                                        <div className={`w-1.5 h-1.5 bg-${camera.color}-400 rounded-full animate-pulse`}></div>
                                    )}
                                </label>
                            )
                        })}
                    </div>
                </div>

                {selectedCameras.length > 0 ? (
                    <div className={`grid ${getCameraGridClass()} gap-3`}>
                        {cameraOptions.map(cam =>
                            isSelected(cam.id) ? (
                                <CameraPlayer
                                    key={cam.id}
                                    stream={cam.stream}
                                    cameraId={cam.id}
                                    name={cam.name}
                                    icon={cam.icon}
                                    rtspUrl={cam.rtspUrl}
                                    color={cam.color}
                                />
                            ) : null
                        )}
                    </div>
                ) : (
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-6 text-center text-gray-400 text-sm">
                        No camera selected
                    </div>
                )}
            </div>
        </div>
    )
}