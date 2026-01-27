import React, { useState, useEffect, useRef } from 'react';
import { fetchPTZStatus } from '../util/ptzStatus';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from 'lucide-react';



const CAMERA_OPTIONS = [
    { label: 'Thermal Camera', value: 'thermal' },
    { label: 'Optical Camera', value: 'optical' },
];


const MapWithLiveCamera: React.FC = () => {
    const [selectedCamera, setSelectedCamera] = useState<'thermal' | 'optical'>('thermal');
    const [panAngle, setPanAngle] = useState(0); // degrees
    const [tiltAngle, setTiltAngle] = useState(0); // degrees
    const [speed, setSpeed] = useState(2);
    const markerRef = useRef<HTMLDivElement>(null);

    // PTZ Control handlers
    const handlePTZMove = async (direction: string) => {
        try {
            const cameraId = selectedCamera === 'thermal' ? 'cam1' : 'cam2';
            await fetch(`http://${window.location.hostname}:3000/api/camera/${cameraId}/ptz/move/${direction}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel: 0, speed })
            });
        } catch (error) {
            console.error('PTZ move error:', error);
        }
    };

    const handlePTZStop = async () => {
        try {
            const cameraId = selectedCamera === 'thermal' ? 'cam1' : 'cam2';
            await fetch(`http://${window.location.hostname}:3000/api/camera/${cameraId}/ptz/stop`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel: 0 })
            });
        } catch (error) {
            console.error('PTZ stop error:', error);
        }
    };

    const handleZoom = async (action: 'in' | 'out') => {
        try {
            const cameraId = selectedCamera === 'thermal' ? 'cam1' : 'cam2';
            await fetch(`http://${window.location.hostname}:3000/api/camera/${cameraId}/ptz/zoom/${action === 'in' ? 'tele' : 'wide'}`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ channel: 0, speed })
            });
        } catch (error) {
            console.error('PTZ zoom error:', error);
        }
    };

    // Poll backend for pan angle every 2 seconds
    useEffect(() => {
        let interval: number;
        const fetchPTZ = async () => {
            try {
                // Use the real cameraId and API base URL
                const cameraId = selectedCamera === 'thermal' ? 'cam1' : 'cam2';
                const baseUrl = 'http://172.24.161.28:3000/api';
                const status = await fetchPTZStatus(cameraId, baseUrl);
                setPanAngle(status.pan);
                setTiltAngle(status.tilt);
            } catch {
                setPanAngle(0);
                setTiltAngle(0);
            }
        };
        fetchPTZ();
        interval = window.setInterval(fetchPTZ, 2000);
        return () => clearInterval(interval);
    }, [selectedCamera]);

    return (
        <div className="fixed inset-0 bg-gray-900 flex flex-col min-h-screen min-w-full z-40 overflow-auto">
            <div className="flex flex-col md:flex-row flex-1">
                {/* Map Section with marker overlay */}
                <div className="flex-1 min-h-[400px] bg-gray-800 flex items-center justify-center relative">
                    {/* Replace with your map component or embed */}
                    <iframe
                        title="Map"
                        src="https://www.openstreetmap.org/export/embed.html?bbox=2.50517%2C42.48919%2C2.51517%2C42.49919&layer=mapnik"
                        className="w-full h-[60vh] md:h-full rounded-lg shadow-lg border-2 border-gray-700"
                        style={{ minHeight: 400 }}
                        allowFullScreen
                    />

                    {/* PTZ Directional Controls - Positioned around the map */}
                    {/* Up Button */}
                    <button
                        onMouseDown={() => handlePTZMove('up')}
                        onMouseUp={handlePTZStop}
                        onMouseLeave={handlePTZStop}
                        className="absolute top-6 left-1/2 -translate-x-1/2 z-10 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 border-2 border-blue-400/30 backdrop-blur-sm"
                        title="Move Up"
                    >
                        <ChevronUp className="w-8 h-8 stroke-[3]" />
                    </button>

                    {/* Down Button */}
                    <button
                        onMouseDown={() => handlePTZMove('down')}
                        onMouseUp={handlePTZStop}
                        onMouseLeave={handlePTZStop}
                        className="absolute bottom-6 left-1/2 -translate-x-1/2 z-10 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 border-2 border-blue-400/30 backdrop-blur-sm"
                        title="Move Down"
                    >
                        <ChevronDown className="w-8 h-8 stroke-[3]" />
                    </button>

                    {/* Left Button */}
                    <button
                        onMouseDown={() => handlePTZMove('right')}
                        onMouseUp={handlePTZStop}
                        onMouseLeave={handlePTZStop}
                        className="absolute left-6 top-1/2 -translate-y-1/2 z-10 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 border-2 border-blue-400/30 backdrop-blur-sm"
                        title="Move Left"
                    >
                        <ChevronLeft className="w-8 h-8 stroke-[3]" />
                    </button>

                    {/* Right Button */}
                    <button
                        onMouseDown={() => handlePTZMove('left')}
                        onMouseUp={handlePTZStop}
                        onMouseLeave={handlePTZStop}
                        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 w-16 h-16 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 active:from-blue-700 active:to-blue-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-2xl hover:shadow-blue-500/50 hover:scale-110 active:scale-95 border-2 border-blue-400/30 backdrop-blur-sm"
                        title="Move Right"
                    >
                        <ChevronRight className="w-8 h-8 stroke-[3]" />
                    </button>

                    {/* Zoom and Speed Controls - Bottom Right */}
                    <div className="absolute bottom-6 right-6 z-10 bg-gradient-to-br from-gray-900/95 via-gray-800/95 to-gray-900/95 backdrop-blur-md rounded-2xl p-4 border-2 border-gray-700/50 shadow-2xl shadow-black/50">
                        <div className="flex flex-col gap-3">
                            <div className="text-white text-sm font-bold text-center tracking-wide bg-gradient-to-r from-green-500 to-emerald-500 bg-clip-text text-transparent">
                                ZOOM
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onMouseDown={() => handleZoom('out')}
                                    onMouseUp={handlePTZStop}
                                    onMouseLeave={handlePTZStop}
                                    className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 active:from-green-700 active:to-green-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-green-500/50 hover:scale-105 active:scale-95 border border-green-400/30"
                                    title="Zoom Out"
                                >
                                    <ZoomOut className="w-6 h-6 stroke-[2.5]" />
                                </button>
                                <button
                                    onMouseDown={() => handleZoom('in')}
                                    onMouseUp={handlePTZStop}
                                    onMouseLeave={handlePTZStop}
                                    className="w-12 h-12 bg-gradient-to-br from-green-600 to-green-700 hover:from-green-500 hover:to-green-600 active:from-green-700 active:to-green-800 text-white rounded-xl flex items-center justify-center transition-all duration-200 shadow-lg hover:shadow-green-500/50 hover:scale-105 active:scale-95 border border-green-400/30"
                                    title="Zoom In"
                                >
                                    <ZoomIn className="w-6 h-6 stroke-[2.5]" />
                                </button>
                            </div>
                            <div className="mt-1 p-2 bg-black/20 rounded-xl">
                                <div className="flex items-center justify-between mb-1">
                                    <label className="text-white text-[10px] font-semibold tracking-wide">SPEED</label>
                                    <span className="text-blue-400 text-xs font-bold">{speed}</span>
                                </div>
                                <input
                                    type="range"
                                    min="1"
                                    max="5"
                                    value={speed}
                                    onChange={(e) => setSpeed(parseInt(e.target.value))}
                                    className="w-24 h-1.5 bg-gray-700 rounded-full appearance-none cursor-pointer accent-blue-500"
                                    style={{
                                        background: `linear-gradient(to right, rgb(59 130 246) 0%, rgb(59 130 246) ${((speed - 1) / 4) * 100}%, rgb(55 65 81) ${((speed - 1) / 4) * 100}%, rgb(55 65 81) 100%)`
                                    }}
                                />
                            </div>
                        </div>
                    </div>

                    {/* Marker overlay - centered on map */}
                    <div
                        ref={markerRef}
                        className="absolute left-1/2 top-1/2 w-48 h-48 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
                        style={{ transform: `translate(-50%, -50%)` }}
                    >
                        {/* Radar sweep effect, rotates with pan angle */}
                        <div
                            style={{
                                position: 'absolute',
                                zIndex: 1,
                                width: '280px',
                                height: '280px',
                                left: '-70px',
                                top: '-70px',
                                pointerEvents: 'none',
                                transform: `rotate(${panAngle}deg)`
                            }}
                        >
                            <svg width="280" height="280" viewBox="0 0 280 280">
                                <defs>
                                    <radialGradient id="radar-fade" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.2" />
                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                                    </radialGradient>
                                    <linearGradient id="radar-sweep" x1="140" y1="140" x2="280" y2="140" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#38bdf8" stopOpacity="0.6" />
                                        <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M140,140 L140,30 A110,110 0 0,1 260,140 Z" fill="url(#radar-sweep)" />
                                <circle cx="140" cy="140" r="110" fill="url(#radar-fade)" />
                            </svg>
                        </div>
                        {/* Marker icon, rotates with pan angle */}
                        <div style={{ position: 'absolute', zIndex: 2, width: '120px', height: '120px', left: '30px', top: '30px', transform: `rotate(${panAngle}deg)` }}>
                            <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="60" cy="60" r="50" stroke="#38bdf8" strokeWidth="8" fill="#222" />
                                <polygon points="60,20 80,85 60,60 40,85" fill="#38bdf8" />
                            </svg>
                        </div>
                    </div>
                </div>
                {/* Live Camera Section */}
                <div className="w-full md:w-[480px] bg-gray-900 border-l border-gray-800 flex flex-col items-center justify-center p-6 gap-6">
                    <div className="w-full flex flex-col items-center">
                        <label className="block text-white font-semibold mb-2 text-lg">Live Camera Feed</label>
                        <select
                            className="w-full mb-4 px-3 py-2 rounded bg-gray-800 text-white border border-gray-700 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            value={selectedCamera}
                            onChange={e => setSelectedCamera(e.target.value as 'thermal' | 'optical')}
                        >
                            {CAMERA_OPTIONS.map(opt => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </select>
                        <div className="w-full aspect-video bg-black rounded-lg shadow-lg flex items-center justify-center overflow-hidden relative">
                            {/* Live camera iframe stream */}
                            <iframe
                                title={selectedCamera + "-live-stream"}
                                src={`http://${window.location.hostname}:8889/${selectedCamera}`}
                                className="w-full h-full border-0"
                                allow="autoplay; fullscreen"
                                style={{ pointerEvents: 'none' }}
                            />
                            {/* Marker overlay - bigger */}
                            <div
                                ref={markerRef}
                                className="absolute left-1/2 top-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
                                style={{ transform: `translate(-50%, -50%) rotate(${panAngle}deg)` }}
                            >

                            </div>
                        </div>
                        <div className="mt-2 text-sm text-gray-400">Pan Angle: <span className="font-bold text-blue-400">{panAngle}&deg;</span> | Tilt Angle: <span className="font-bold text-blue-400">{tiltAngle}&deg;</span></div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MapWithLiveCamera;
