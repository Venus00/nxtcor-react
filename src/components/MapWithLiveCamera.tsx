import React, { useState, useEffect, useRef } from 'react';
import { fetchPTZStatus } from '../util/ptzStatus';



const CAMERA_OPTIONS = [
    { label: 'Thermal Camera', value: 'thermal' },
    { label: 'Optical Camera', value: 'optical' },
];


const MapWithLiveCamera: React.FC = () => {
    const [selectedCamera, setSelectedCamera] = useState<'thermal' | 'optical'>('thermal');
    const [panAngle, setPanAngle] = useState(0); // degrees
    const [tiltAngle, setTiltAngle] = useState(0); // degrees
    const markerRef = useRef<HTMLDivElement>(null);

    // Poll backend for pan angle every 2 seconds
    useEffect(() => {
        let interval: number;
        const fetchPTZ = async () => {
            try {
                // Use the real cameraId and API base URL
                const cameraId = selectedCamera === 'thermal' ? 'cam1' : 'cam2';
                const baseUrl = 'http://172.24.161.28:3000';
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
                    {/* Marker overlay - centered on map */}
                    <div
                        ref={markerRef}
                        className="absolute left-1/2 top-1/2 w-32 h-32 -translate-x-1/2 -translate-y-1/2 pointer-events-none flex items-center justify-center"
                        style={{ transform: `translate(-50%, -50%)` }}
                    >
                        {/* Radar sweep effect, rotates with pan angle */}
                        <div
                            style={{
                                position: 'absolute',
                                zIndex: 1,
                                width: '180px',
                                height: '180px',
                                left: '-30px',
                                top: '-30px',
                                pointerEvents: 'none',
                                transform: `rotate(${panAngle}deg)`
                            }}
                        >
                            <svg width="180" height="180" viewBox="0 0 180 180">
                                <defs>
                                    <radialGradient id="radar-fade" cx="50%" cy="50%" r="50%">
                                        <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.15" />
                                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0" />
                                    </radialGradient>
                                    <linearGradient id="radar-sweep" x1="90" y1="90" x2="180" y2="90" gradientUnits="userSpaceOnUse">
                                        <stop stopColor="#38bdf8" stopOpacity="0.5" />
                                        <stop offset="1" stopColor="#38bdf8" stopOpacity="0" />
                                    </linearGradient>
                                </defs>
                                <path d="M90,90 L90,20 A70,70 0 0,1 170,90 Z" fill="url(#radar-sweep)" />
                                <circle cx="90" cy="90" r="70" fill="url(#radar-fade)" />
                            </svg>
                        </div>
                        {/* Marker icon, rotates with pan angle */}
                        <div style={{ position: 'absolute', zIndex: 2, width: '80px', height: '80px', left: '20px', top: '20px', transform: `rotate(${panAngle}deg)` }}>
                            <svg width="80" height="80" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <circle cx="40" cy="40" r="35" stroke="#38bdf8" strokeWidth="7" fill="#222" />
                                <polygon points="40,10 58,60 40,40 22,60" fill="#38bdf8" />
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
