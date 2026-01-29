import React, { useState, useRef, useEffect } from 'react';
import { Camera, Plus, Save, Trash2, Square, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Thermometer } from 'lucide-react';
import WebRTCMonitor from './WebRTCMonitor';

type CameraType = "cam1" | "cam2";

interface Rectangle {
    id: string;
    x: number;
    y: number;
    width: number;
    height: number;
    color: string;
}

interface Preset {
    id: string;
    name: string;
    cameraId: CameraType;
    timestamp: number;
    rectangles: Rectangle[];
    imageData?: string;
    presetNumber?: number; // Camera PTZ preset number (30-128)
}

const IntrusionDetection: React.FC = () => {
    const [mode, setMode] = useState<'list' | 'create' | 'monitor'>('list');
    const [selectedCamera, setSelectedCamera] = useState<CameraType>('cam1');
    const [activePreset, setActivePreset] = useState<Preset | null>(null);
    const [isCapturing, setIsCapturing] = useState(false);
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [rectangles, setRectangles] = useState<Rectangle[]>([]);
    const [isDrawing, setIsDrawing] = useState(false);
    const [startPoint, setStartPoint] = useState<{ x: number; y: number } | null>(null);
    const [currentRect, setCurrentRect] = useState<Rectangle | null>(null);

    const [presetName, setPresetName] = useState('');
    const [presets, setPresets] = useState<Preset[]>([]);
    const [speed, setSpeed] = useState(2);

    const canvasRef = useRef<HTMLCanvasElement>(null);
    const videoRef = useRef<HTMLVideoElement | null>(null);
    const iframeRef = useRef<HTMLIFrameElement>(null);
    const drawingCanvasRef = useRef<HTMLCanvasElement>(null);

    // PTZ control refs
    const upIntervalRef = useRef<number | null>(null);
    const downIntervalRef = useRef<number | null>(null);
    const leftIntervalRef = useRef<number | null>(null);
    const rightIntervalRef = useRef<number | null>(null);
    const zoomInIntervalRef = useRef<number | null>(null);
    const zoomOutIntervalRef = useRef<number | null>(null);

    // Load presets from backend
    useEffect(() => {
        loadPresets();
    }, []);

    const loadPresets = async () => {
        try {
            const response = await fetch(`http://${window.location.hostname}:3000/api/intrusion/presets`);
            const data = await response.json();
            if (data.success) {
                setPresets(data.presets || []);
            }
        } catch (error) {
            console.error('Error loading presets:', error);
        }
    };

    const captureFrame = async () => {
        if (!iframeRef.current || !canvasRef.current) return;

        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        try {
            // Create a temporary video element to capture from the same stream
            const video = document.createElement('video');
            video.autoplay = true;
            video.muted = true;
            video.playsInline = true;
            video.src = `http://${window.location.hostname}:8889/${selectedCamera}`;
            video.style.position = 'fixed';
            video.style.top = '-9999px';
            video.style.left = '-9999px';
            video.style.width = '640px';
            video.style.height = '480px';
            document.body.appendChild(video);

            console.log('[Capture] Starting capture from:', video.src);

            // Wait for video to load and be ready to play
            await new Promise<void>((resolve, reject) => {
                let resolved = false;
                const timeout = setTimeout(() => {
                    if (!resolved) {
                        reject(new Error('Video load timeout'));
                    }
                }, 10000);

                video.onloadeddata = () => {
                    console.log('[Capture] Video data loaded');
                };

                video.oncanplay = () => {
                    console.log('[Capture] Video can play');
                    if (!resolved) {
                        resolved = true;
                        clearTimeout(timeout);
                        setTimeout(resolve, 1000); // Wait 1 second for stream to stabilize
                    }
                };

                video.onerror = (e) => {
                    console.error('[Capture] Video error:', e);
                    clearTimeout(timeout);
                    reject(new Error('Video load error'));
                };
            });

            console.log('[Capture] Video ready, capturing frame...');

            // Set canvas size and draw
            canvas.width = 640;
            canvas.height = 480;
            ctx.clearRect(0, 0, 640, 480);
            ctx.drawImage(video, 0, 0, 640, 480);

            const imageData = canvas.toDataURL('image/png');

            console.log('[Capture] Frame captured, size:', imageData.length);

            // Cleanup
            video.pause();
            video.src = '';
            document.body.removeChild(video);

            if (imageData.length < 1000) {
                throw new Error('Captured image is too small (blank frame)');
            }

            setCapturedImage(imageData);
            setIsCapturing(true);
            setRectangles([]);
        } catch (error: any) {
            console.error('[Capture] Error capturing frame:', error);
            alert('Failed to capture frame: ' + error.message);
        }
    };

    const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isCapturing) return;

        const canvas = drawingCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // Get click position relative to canvas display
        const clickX = e.clientX - rect.left;
        const clickY = e.clientY - rect.top;

        // Normalize to 640x480 coordinate space
        const x = (clickX / rect.width) * 640;
        const y = (clickY / rect.height) * 480;

        setIsDrawing(true);
        setStartPoint({ x, y });
    };

    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isDrawing || !startPoint) return;

        const canvas = drawingCanvasRef.current;
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        // Get current mouse position relative to canvas display
        const mouseX = e.clientX - rect.left;
        const mouseY = e.clientY - rect.top;

        // Normalize to 640x480 coordinate space
        const x = (mouseX / rect.width) * 640;
        const y = (mouseY / rect.height) * 480;

        const width = x - startPoint.x;
        const height = y - startPoint.y;

        setCurrentRect({
            id: 'temp',
            x: startPoint.x,
            y: startPoint.y,
            width,
            height,
            color: '#ef4444'
        });
    };

    const handleMouseUp = () => {
        if (!isDrawing || !currentRect) return;

        if (Math.abs(currentRect.width) > 10 && Math.abs(currentRect.height) > 10) {
            const newRect: Rectangle = {
                id: Date.now().toString(),
                x: currentRect.width > 0 ? currentRect.x : currentRect.x + currentRect.width,
                y: currentRect.height > 0 ? currentRect.y : currentRect.y + currentRect.height,
                width: Math.abs(currentRect.width),
                height: Math.abs(currentRect.height),
                color: '#ef4444'
            };
            setRectangles([...rectangles, newRect]);
        }

        setIsDrawing(false);
        setStartPoint(null);
        setCurrentRect(null);
    };

    const deleteRectangle = (id: string) => {
        setRectangles(rectangles.filter(r => r.id !== id));
    };

    const savePreset = async () => {
        if (!presetName.trim() || rectangles.length === 0) {
            alert('Please enter a preset name and draw at least one zone');
            return;
        }

        const preset: Preset = {
            id: Date.now().toString(),
            name: presetName,
            cameraId: selectedCamera,
            timestamp: Date.now(),
            rectangles,
            imageData: capturedImage || undefined
        };

        try {
            const response = await fetch(`http://${window.location.hostname}:3000/api/intrusion/presets`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(preset)
            });

            const data = await response.json();
            if (data.success) {
                alert('Preset saved successfully!');
                await loadPresets();
                resetCreation();
            } else {
                alert('Error saving preset: ' + (data.message || 'Unknown error'));
            }
        } catch (error) {
            console.error('Error saving preset:', error);
            alert('Error saving preset');
        }
    };

    const deletePreset = async (id: string) => {
        if (!confirm('Are you sure you want to delete this preset?')) return;

        try {
            const response = await fetch(`http://${window.location.hostname}:3000/api/intrusion/presets/${id}`, {
                method: 'DELETE'
            });

            const data = await response.json();
            if (data.success) {
                await loadPresets();
            }
        } catch (error) {
            console.error('Error deleting preset:', error);
        }
    };

    const startIntrusion = async (presetId: string) => {
        try {
            // Find the preset
            const preset = presets.find(p => p.id === presetId);
            if (!preset) {
                alert('Preset not found');
                return;
            }

            // Send request to backend to enable intrusion detection
            const response = await fetch(`http://${window.location.hostname}:3000/api/intrusion/start`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ presetId })
            });

            const data = await response.json();
            if (data.success) {
                // Set active preset and switch to monitor mode
                setActivePreset(preset);
                setSelectedCamera(preset.cameraId);
                setMode('monitor');
                console.log(`[Intrusion] Started monitoring with preset "${preset.name}" on ${preset.cameraId}`);
            } else {
                alert('Failed to start intrusion detection');
            }
        } catch (error) {
            console.error('Error starting intrusion:', error);
            alert('Error starting intrusion detection');
        }
    };

    const resetCreation = () => {
        setMode('list');
        setIsCapturing(false);
        setCapturedImage(null);
        setRectangles([]);
        setPresetName('');
    };

    const stopMonitoring = async () => {
        try {
            // TODO: Send request to backend to disable intrusion detection
            // await fetch(`http://${window.location.hostname}:3000/api/intrusion/stop`, {
            //     method: 'POST',
            //     headers: { 'Content-Type': 'application/json' },
            //     body: JSON.stringify({ cameraId: activePreset?.cameraId })
            // });

            setMode('list');
            setActivePreset(null);
            console.log('[Intrusion] Stopped monitoring');
        } catch (error) {
            console.error('Error stopping intrusion:', error);
        }
    };

    // PTZ Movement Functions
    const move = async (direction: "up" | "down" | "left" | "right" | "zoom_in" | "zoom_out") => {
        try {
            let endpoint = "";
            switch (direction) {
                case "up": endpoint = `/camera/${selectedCamera}/ptz/move/up`; break;
                case "down": endpoint = `/camera/${selectedCamera}/ptz/move/down`; break;
                case "left": endpoint = `/camera/${selectedCamera}/ptz/move/left`; break;
                case "right": endpoint = `/camera/${selectedCamera}/ptz/move/right`; break;
                case "zoom_in": endpoint = `/camera/${selectedCamera}/ptz/zoom/in`; break;
                case "zoom_out": endpoint = `/camera/${selectedCamera}/ptz/zoom/out`; break;
            }

            await fetch(`http://${window.location.hostname}:3000${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channel: 0, speed }),
            });
        } catch (err) {
            console.error(err);
        }
    };

    const stop = async (direction: "up" | "down" | "left" | "right" | "zoom_in" | "zoom_out") => {
        try {
            let endpoint = "";
            switch (direction) {
                case "up":
                case "down":
                case "left":
                case "right":
                    endpoint = `/camera/${selectedCamera}/ptz/move/stop`;
                    break;
                case "zoom_in":
                case "zoom_out":
                    endpoint = `/camera/${selectedCamera}/ptz/zoom/stop`;
                    break;
            }

            await fetch(`http://${window.location.hostname}:3000/api${endpoint}`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ channel: 0 }),
            });
        } catch (err) {
            console.error(err);
        }
    };

    const createHoldHandlers = (
        direction: "up" | "down" | "left" | "right" | "zoom_in" | "zoom_out",
        intervalRef: React.MutableRefObject<number | null>
    ) => {
        const handleStart = () => {
            if (intervalRef.current) clearInterval(intervalRef.current);
            move(direction);
            intervalRef.current = window.setInterval(() => move(direction), 100);
        };

        const handleStop = () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            stop(direction);
        };

        return { handleStart, handleStop };
    };

    const upHandlers = createHoldHandlers("up", upIntervalRef);
    const downHandlers = createHoldHandlers("down", downIntervalRef);
    const leftHandlers = createHoldHandlers("left", leftIntervalRef);
    const rightHandlers = createHoldHandlers("right", rightIntervalRef);
    const zoomInHandlers = createHoldHandlers("zoom_in", zoomInIntervalRef);
    const zoomOutHandlers = createHoldHandlers("zoom_out", zoomOutIntervalRef);

    // Draw rectangles on canvas
    useEffect(() => {
        const canvas = drawingCanvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        // Get scale factor (display size vs actual canvas size)
        const rect = canvas.getBoundingClientRect();
        const scaleX = rect.width / 640;
        const scaleY = rect.height / 480;

        // Save context and apply scale
        ctx.save();
        ctx.scale(scaleX, scaleY);

        // Draw saved rectangles in 640x480 space
        rectangles.forEach(rect => {
            ctx.strokeStyle = rect.color;
            ctx.lineWidth = 2 / Math.min(scaleX, scaleY); // Adjust line width for scale
            ctx.strokeRect(rect.x, rect.y, rect.width, rect.height);
            ctx.fillStyle = rect.color + '33';
            ctx.fillRect(rect.x, rect.y, rect.width, rect.height);
        });

        // Draw current rectangle being drawn
        if (currentRect && isDrawing) {
            ctx.strokeStyle = currentRect.color;
            ctx.lineWidth = 2 / Math.min(scaleX, scaleY);
            ctx.strokeRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
            ctx.fillStyle = currentRect.color + '33';
            ctx.fillRect(currentRect.x, currentRect.y, currentRect.width, currentRect.height);
        }

        // Restore context
        ctx.restore();
    }, [rectangles, currentRect, isDrawing]);

    if (mode === 'list') {
        return (
            <div className="h-full bg-black p-6">
                <div className="max-w-6xl mx-auto">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">Intrusion Detection</h2>
                        <button
                            onClick={() => setMode('create')}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
                        >
                            <Plus className="w-5 h-5" />
                            Create New Setup
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {presets.map(preset => (
                            <div key={preset.id} className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
                                {preset.imageData && (
                                    <div className="relative h-48 bg-black">
                                        <img src={preset.imageData} alt={preset.name} className="w-full h-full object-cover" />
                                    </div>
                                )}
                                <div className="p-4">
                                    <h3 className="text-lg font-semibold text-white mb-2">{preset.name}</h3>
                                    <div className="text-sm text-slate-400 mb-3">
                                        <div>Camera: {preset.cameraId === 'cam1' ? 'Optical' : 'Thermal'}</div>
                                        <div>Zones: {preset.rectangles.length}</div>
                                        {preset.presetNumber && <div>PTZ Preset: #{preset.presetNumber}</div>}
                                        <div>Created: {new Date(preset.timestamp).toLocaleString()}</div>
                                    </div>
                                    <div className="flex gap-2">
                                        <button
                                            onClick={() => startIntrusion(preset.id)}
                                            className="flex-1 px-3 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm transition-colors"
                                        >
                                            Start
                                        </button>
                                        <button
                                            onClick={() => deletePreset(preset.id)}
                                            className="px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {presets.length === 0 && (
                        <div className="text-center py-12 text-slate-400">
                            <Square className="w-16 h-16 mx-auto mb-4 opacity-50" />
                            <p className="text-lg">No intrusion detection setups created yet</p>
                            <p className="text-sm mt-2">Click "Create New Setup" to get started</p>
                        </div>
                    )}
                </div>
            </div>
        );
    }

    // Monitor mode - Show live stream with intrusion detection active
    if (mode === 'monitor' && activePreset) {
        return (
            <div className="h-full bg-black p-4">
                <div className="max-w-full mx-auto h-full flex flex-col gap-4">
                    {/* Header */}
                    <div className="flex justify-between items-center">
                        <div>
                            <h2 className="text-2xl font-bold text-white">Intrusion Detection Active</h2>
                            <p className="text-slate-400 mt-1">
                                Monitoring: <span className="text-white font-semibold">{activePreset.name}</span> on {activePreset.cameraId === 'cam1' ? 'Optical' : 'Thermal'} Camera
                            </p>
                        </div>
                        <button
                            onClick={stopMonitoring}
                            className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors font-medium"
                        >
                            Stop Monitoring
                        </button>
                    </div>

                    {/* Live Stream */}
                    <div className="flex-1 min-h-0">
                        <div className="h-full flex items-center justify-center bg-black rounded-lg overflow-hidden border border-green-500/50">
                            <WebRTCMonitor
                                selectedCamera={activePreset.cameraId}
                                detectionEnabled={true}
                                onVideoRef={(ref) => {
                                    if (ref) videoRef.current = ref;
                                }}
                            />
                        </div>
                    </div>

                    {/* Detection Zones Info */}
                    <div className="bg-slate-800/60 border border-slate-600/50 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h3 className="text-white font-semibold mb-1">Detection Zones</h3>
                                <p className="text-sm text-slate-400">{activePreset.rectangles.length} zone(s) configured</p>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                                <span className="text-green-400 font-medium">Active</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="h-full bg-black p-4">
            <div className="max-w-full mx-auto h-full flex gap-4">
                {/* Video Feed */}
                <div className="flex-1 min-h-0 relative">
                    <div className="relative h-full">
                        <div className="h-full flex items-center justify-center bg-black rounded-lg overflow-hidden">
                            {!isCapturing ? (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    <iframe
                                        ref={iframeRef}
                                        src={`http://${window.location.hostname}:8889/${selectedCamera}`}
                                        className="border-0"
                                        style={{ width: '640px', height: '480px' }}
                                        allow="autoplay; fullscreen"
                                        title="Live Camera Feed"
                                    />
                                    <canvas ref={canvasRef} className="hidden" />
                                </div>
                            ) : (
                                <div className="relative w-full h-full flex items-center justify-center">
                                    {capturedImage && (
                                        <div className="relative">
                                            <img
                                                src={capturedImage}
                                                alt="Captured frame"
                                                className="max-w-full max-h-full"
                                                style={{ width: '640px', height: '480px', objectFit: 'contain' }}
                                            />
                                            <canvas
                                                ref={drawingCanvasRef}
                                                width={640}
                                                height={480}
                                                className="absolute top-0 left-0 cursor-crosshair"
                                                style={{ width: '640px', height: '480px' }}
                                                onMouseDown={handleMouseDown}
                                                onMouseMove={handleMouseMove}
                                                onMouseUp={handleMouseUp}
                                                onMouseLeave={handleMouseUp}
                                            />
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* PTZ Controls Overlay */}
                        {!isCapturing && (
                            <div className="absolute bottom-6 right-6 z-20">
                                <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-3 min-w-[120px]">
                                    <div className="flex items-center justify-between mb-3 pb-2 border-b border-white/10">
                                        <div className="flex items-center space-x-2">
                                            <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                                            <span className="text-white/90 text-xs font-medium tracking-wide">PTZ CONTROL</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-center space-y-1 mb-3">
                                        <button
                                            onMouseDown={upHandlers.handleStart}
                                            onMouseUp={upHandlers.handleStop}
                                            onMouseLeave={upHandlers.handleStop}
                                            className="group w-8 h-8 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                                        >
                                            <ChevronUp size={14} strokeWidth={2.5} />
                                        </button>

                                        <div className="flex items-center space-x-1.5">
                                            <button
                                                onMouseDown={leftHandlers.handleStart}
                                                onMouseUp={leftHandlers.handleStop}
                                                onMouseLeave={leftHandlers.handleStop}
                                                className="group w-8 h-8 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                                            >
                                                <ChevronLeft size={14} strokeWidth={2.5} />
                                            </button>

                                            <button
                                                onClick={async () => {
                                                    await stop('up');
                                                    await stop('down');
                                                    await stop('left');
                                                    await stop('right');
                                                }}
                                                className="w-8 h-8 bg-red-500/20 hover:bg-red-500/30 active:bg-red-500/40 border border-red-400/30 hover:border-red-400/50 rounded-xl flex items-center justify-center backdrop-blur-sm cursor-pointer transition-all duration-300 ease-out hover:scale-110 active:scale-95"
                                            >
                                                <div className="w-2 h-2 bg-red-400 rounded-sm shadow-lg"></div>
                                            </button>

                                            <button
                                                onMouseDown={rightHandlers.handleStart}
                                                onMouseUp={rightHandlers.handleStop}
                                                onMouseLeave={rightHandlers.handleStop}
                                                className="group w-8 h-8 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                                            >
                                                <ChevronRight size={14} strokeWidth={2.5} />
                                            </button>
                                        </div>

                                        <button
                                            onMouseDown={downHandlers.handleStart}
                                            onMouseUp={downHandlers.handleStop}
                                            onMouseLeave={downHandlers.handleStop}
                                            className="group w-8 h-8 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                                        >
                                            <ChevronDown size={14} strokeWidth={2.5} />
                                        </button>
                                    </div>

                                    <div className="relative mb-3">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10"></div>
                                        </div>
                                        <div className="relative flex justify-center">
                                            <span className="bg-black/20 px-3 text-white/50 text-xs font-medium tracking-wider">ZOOM</span>
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-center space-x-2">
                                        <button
                                            onMouseDown={zoomOutHandlers.handleStart}
                                            onMouseUp={zoomOutHandlers.handleStop}
                                            onMouseLeave={zoomOutHandlers.handleStop}
                                            className="group w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                                        >
                                            <ZoomOut size={12} strokeWidth={2.5} />
                                        </button>

                                        <button
                                            onMouseDown={zoomInHandlers.handleStart}
                                            onMouseUp={zoomInHandlers.handleStop}
                                            onMouseLeave={zoomInHandlers.handleStop}
                                            className="group w-8 h-8 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                                        >
                                            <ZoomIn size={12} strokeWidth={2.5} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Right Sidebar - Controls */}
                <div className="w-80 bg-slate-800/60 border border-slate-600/50 rounded-lg overflow-hidden flex flex-col">
                    <div className="bg-black border-b border-slate-600/50 p-3 space-y-3">
                        <div className="flex items-center justify-between">
                            <h3 className="text-white font-semibold">Setup Intrusion Detection</h3>
                            <button
                                onClick={resetCreation}
                                className="px-3 py-1 bg-slate-700 hover:bg-slate-600 text-white rounded text-sm transition-colors"
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Camera Selector */}
                        <div>
                            <label className="text-xs font-medium text-slate-400 mb-2 block">Camera Selection</label>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => setSelectedCamera('cam1')}
                                    disabled={isCapturing}
                                    className={`flex-1 px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-all text-sm ${selectedCamera === 'cam1'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        } ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Camera className="w-4 h-4" />
                                    Optical
                                </button>
                                <button
                                    onClick={() => setSelectedCamera('cam2')}
                                    disabled={isCapturing}
                                    className={`flex-1 px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-all text-sm ${selectedCamera === 'cam2'
                                        ? 'bg-blue-600 text-white'
                                        : 'bg-slate-700 text-slate-300 hover:bg-slate-600'
                                        } ${isCapturing ? 'opacity-50 cursor-not-allowed' : ''}`}
                                >
                                    <Thermometer className="w-4 h-4" />
                                    Thermal
                                </button>
                            </div>
                        </div>

                        {/* Preset Name */}
                        {isCapturing && (
                            <div>
                                <label className="text-xs font-medium text-slate-400 mb-2 block">Preset Name</label>
                                <input
                                    type="text"
                                    value={presetName}
                                    onChange={(e) => setPresetName(e.target.value)}
                                    placeholder="Enter preset name..."
                                    className="w-full px-3 py-2 bg-slate-700 border border-slate-600 rounded-md text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                            </div>
                        )}

                        {/* Capture Button */}
                        {!isCapturing && (
                            <button
                                onClick={captureFrame}
                                className="w-full px-4 py-2.5 rounded-md bg-blue-600 hover:bg-blue-700 text-white transition-all text-sm font-medium"
                            >
                                Capture Frame
                            </button>
                        )}

                        {/* Instructions */}
                        {isCapturing && (
                            <div className="text-xs text-slate-400 space-y-1 bg-slate-900/50 p-3 rounded-md">
                                <p className="font-semibold text-white mb-2">Instructions:</p>
                                <p>• Click and drag to draw detection zones</p>
                                <p>• Draw multiple zones if needed</p>
                                <p>• Delete unwanted zones below</p>
                                <p>• Save when ready</p>
                            </div>
                        )}
                    </div>

                    {/* Rectangles List */}
                    {isCapturing && (
                        <div className="flex-1 overflow-y-auto p-4 space-y-2">
                            <div className="flex items-center justify-between mb-2">
                                <h4 className="text-sm font-medium text-white">Detection Zones ({rectangles.length})</h4>
                            </div>

                            {rectangles.map((rect, index) => (
                                <div
                                    key={rect.id}
                                    className="p-3 bg-slate-700/60 border border-slate-600/50 rounded-lg flex items-center justify-between"
                                >
                                    <div className="text-sm text-white">
                                        <div className="font-medium">Zone {index + 1}</div>
                                        <div className="text-xs text-slate-400">
                                            {rect.width.toFixed(0)} × {rect.height.toFixed(0)}
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => deleteRectangle(rect.id)}
                                        className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}

                            {rectangles.length === 0 && (
                                <div className="text-center py-8 text-slate-400">
                                    <Square className="h-12 w-12 mx-auto mb-2 opacity-50" />
                                    <p className="text-sm">No zones drawn yet</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Save Button */}
                    {isCapturing && (
                        <div className="p-4 border-t border-slate-600/50">
                            <button
                                onClick={savePreset}
                                disabled={rectangles.length === 0 || !presetName.trim()}
                                className={`w-full px-4 py-2.5 rounded-md flex items-center justify-center gap-2 text-sm font-medium transition-colors ${rectangles.length === 0 || !presetName.trim()
                                    ? 'bg-slate-700 text-slate-500 cursor-not-allowed'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                                    }`}
                            >
                                <Save className="w-4 h-4" />
                                Save Preset
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IntrusionDetection;
