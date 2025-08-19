import { Camera, Thermometer, BarChart3, Eye } from "lucide-react"
import { useState, useEffect, useRef } from "react"
import axios from "axios"
import Hls from "hls.js"
const cameraOptions = [
    { id: "Normal", name: "Normal Camera", icon: Camera, color: "blue", rtspUrl: "rtsp://192.168.10.57:8554/cam1" },
    { id: "Thermal", name: "Thermal Camera", icon: Thermometer, color: "red", rtspUrl: "rtsp://192.168.10.57:8554/cam2" }
]
function CameraPlayer({ cameraId, name, icon: Icon, rtspUrl, color }: any) {
    const [hlsUrl, setHlsUrl] = useState<string | null>(null)
    const videoRef = useRef<HTMLVideoElement | null>(null)

    useEffect(() => {
        const fetchStreamUrl = async () => {
            try {
                const res = await axios.post("http://192.168.10.207:8000/stream_rtsp", {
                    rtsp_url: rtspUrl,
                    type: cameraId

                },
                    {
                        headers: {
                            'Content-Type': 'multipart/form-data'
                        }
                    })
                console.log(res.data)
                const url = `http://192.168.10.207:8000${res.data.hls_playlist}`
                console.log(url)
                setHlsUrl(url)
            } catch (err) {
                console.error(`Failed to fetch HLS URL for ${name}:`, err)
            }
        }
        fetchStreamUrl()
    }, [])

    useEffect(() => {
        if (!hlsUrl || !videoRef.current) return

        if (Hls.isSupported()) {
            const hls = new Hls({
                maxBufferLength: 60,
                maxMaxBufferLength: 120,
                maxBufferSize: 60 * 1000 * 1000,
                liveSyncDuration: 10,
                liveMaxLatencyDuration: 30,
            });
            hls.loadSource(hlsUrl)
            hls.attachMedia(videoRef.current)
            hls.on(Hls.Events.ERROR, (_, data) => {
                console.error(`HLS error (${name}):`, data)
            })
            return () => hls.destroy()
        } else if (videoRef.current.canPlayType("application/vnd.apple.mpegurl")) {
            videoRef.current.src = hlsUrl
        }
    }, [hlsUrl, name])

    return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-4">
            <div className="flex items-center justify-between mb-3">
                <h3 className="text-base font-medium text-white flex items-center gap-2">
                    <Icon className={`h-4 w-4 text-${color}-400`} />
                    {name}
                </h3>
                <div className="text-xs text-gray-400">
                    {cameraId === "thermal" ? "640×480px" : "1920×1080px"}
                </div>
            </div>

            <div className="flex justify-center">
                <div className="relative bg-black rounded-lg overflow-hidden border-2 border-gray-600 w-full aspect-video max-w-2xl">
                    {hlsUrl ? (
                        <video
                            ref={videoRef}
                            autoPlay
                            muted
                            controls={true}
                            className="w-full h-full object-contain"
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-900">
                            <p className={`text-${color}-400 text-sm`}>Loading {name}...</p>
                        </div>
                    )}

                    <div className="absolute top-2 left-2">
                        <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium bg-${color}-600 text-white`}>
                            <div className="w-1.5 h-1.5 bg-white rounded-full animate-pulse"></div>
                            LIVE
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-3 flex items-center gap-2">
                <Eye className={`h-3 w-3 text-${color}-400`} />
                <span className="text-xs text-gray-400">{name} Feed</span>
            </div>
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

    const getCameraGridClass = () => selectedCameras.length === 1 ? "grid-cols-1" : "grid-cols-1 xl:grid-cols-2"

    // Camera configs (RTSP per camera here 👇)


    return (
        <div className="min-h-screen bg-black p-2 sm:p-4 lg:p-6">
            <div className=" mx-auto space-y-6">

                {/* Camera selection */}
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
                                    className={`flex items-center gap-3 px-4 py-3 rounded-lg border cursor-pointer transition-all ${selected
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
                </div>

                {selectedCameras.length > 0 ? (
                    <div className={`grid ${getCameraGridClass()} gap-4`}>
                        {cameraOptions.map(cam =>
                            isSelected(cam.id) ? (
                                <CameraPlayer
                                    key={cam.id}
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
                    <div className="bg-gray-800 border border-gray-700 rounded-lg p-8 text-center text-gray-400">
                        No camera selected
                    </div>
                )}
            </div>
        </div>
    )
}
