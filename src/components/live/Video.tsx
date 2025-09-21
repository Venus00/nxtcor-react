import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, Minus, Plus, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const VideoStream: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [position,] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [rotation, setRotation] = useState(0);
  const [speed, setSpeed] = useState(50);
  
  const upIntervalRef = useRef<number | null>(null);
  const downIntervalRef = useRef<number | null>(null);
  const leftIntervalRef = useRef<number | null>(null);
  const rightIntervalRef = useRef<number | null>(null);
  const zoomInIntervalRef = useRef<number | null>(null);
  const zoomOutIntervalRef = useRef<number | null>(null);
  const focusInIntervalRef = useRef<number | null>(null);
  const focusOutIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState < 3) {
        videoRef.current.load();
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const zoomIn = () => {
    setScale((prevScale) => prevScale + 0.2);
  };
  
  const camId = useParams().id;
  


  
  const move = async (direction: 'up' | 'down' | 'left' | 'right' | 'zoom_in' | 'zoom_out' | 'focus_in' | 'focus_out') => {
    console.log(direction, `speed: ${speed}`);
    try {
      if(direction === 'focus_in' || direction === 'focus_out') {
        const res = await fetch(`http://${import.meta.env.VITE_SERVER_URL}:3000/focus/${camId}/move`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ direction, time: 1, speed }), 
        });
        const data = await res.json();
        console.log(data);
        return;
      }
      const res = await fetch(`http://${import.meta.env.VITE_SERVER_URL}:3000/ptz/${camId}/move`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ direction, time: 1, speed }), 
      });
      const data = await res.json();
      console.log(data);
    } catch (err) {
      console.error(err);
    }
  };

  const createHoldHandlers = (direction: 'up' | 'down' | 'left' | 'right' | 'zoom_in' | 'zoom_out' | 'focus_in' | 'focus_out', intervalRef: React.MutableRefObject<number | null>) => {
    const handleStart = () => {
      move(direction); 
      intervalRef.current = setInterval(() => move(direction), 200); 
    };

    const handleStop = () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    return { handleStart, handleStop };
  };

  const upHandlers = createHoldHandlers('up', upIntervalRef);
  const downHandlers = createHoldHandlers('down', downIntervalRef);
  const leftHandlers = createHoldHandlers('left', leftIntervalRef);
  const rightHandlers = createHoldHandlers('right', rightIntervalRef);
  const zoomInHandlers = createHoldHandlers('zoom_in', zoomInIntervalRef);
  const zoomOutHandlers = createHoldHandlers('zoom_out', zoomOutIntervalRef);
  const focusInHandlers = createHoldHandlers('focus_in', focusInIntervalRef);
  const focusOutHandlers = createHoldHandlers('focus_out', focusOutIntervalRef);
  useEffect(() => {
    return () => {
      [upIntervalRef, downIntervalRef, leftIntervalRef, rightIntervalRef, zoomInIntervalRef, zoomOutIntervalRef, focusInIntervalRef, focusOutIntervalRef].forEach(ref => {
        if (ref.current) {
          clearInterval(ref.current);
        }
      });
    };
  }, []);

  return (
    <div className="flex h-[calc(100vh-5rem)] border rounded-xl overflow-hidden bg-black">
      <div className="flex-grow flex justify-center items-center relative bg-black">
        <div className="relative w-full h-full overflow-hidden bg-black">
          <div className="absolute bottom-4 right-10 z-20">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 min-w-[160px]">
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  <span className="text-white/90 text-xs font-medium tracking-wide">PTZ CONTROL</span>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2 mb-6">
                <button
                  onMouseDown={upHandlers.handleStart}
                  onMouseUp={upHandlers.handleStop}
                  onMouseLeave={upHandlers.handleStop}
                  onTouchStart={upHandlers.handleStart}
                  onTouchEnd={upHandlers.handleStop}
                  className="group w-12 h-12 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                  aria-label="Tilt Up"
                >
                  <ChevronUp size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onMouseDown={leftHandlers.handleStart}
                    onMouseUp={leftHandlers.handleStop}
                    onMouseLeave={leftHandlers.handleStop}
                    onTouchStart={leftHandlers.handleStart}
                    onTouchEnd={leftHandlers.handleStop}
                    className="group w-12 h-12 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Pan Left"
                  >
                    <ChevronLeft size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                  </button>

                  <div className="w-12 h-12 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white/60 rounded-full shadow-lg"></div>
                  </div>

                  <button
                    onMouseDown={rightHandlers.handleStart}
                    onMouseUp={rightHandlers.handleStop}
                    onMouseLeave={rightHandlers.handleStop}
                    onTouchStart={rightHandlers.handleStart}
                    onTouchEnd={rightHandlers.handleStop}
                    className="group w-12 h-12 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Pan Right"
                  >
                    <ChevronRight size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                  </button>
                </div>

                <button
                  onMouseDown={downHandlers.handleStart}
                  onMouseUp={downHandlers.handleStop}
                  onMouseLeave={downHandlers.handleStop}
                  onTouchStart={downHandlers.handleStart}
                  onTouchEnd={downHandlers.handleStop}
                  className="group w-12 h-12 bg-white/5 hover:bg-white/15 active:bg-white/25 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                  aria-label="Tilt Down"
                >
                  <ChevronDown size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
              {/* ZOOM */}

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-3 text-white/50 text-xs font-medium tracking-wider">ZOOM</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 mb-6">
                <button
                  onMouseDown={zoomOutHandlers.handleStart}
                  onMouseUp={zoomOutHandlers.handleStop}
                  onMouseLeave={zoomOutHandlers.handleStop}
                  onTouchStart={zoomOutHandlers.handleStart}
                  onTouchEnd={zoomOutHandlers.handleStop}
                  className="group w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>

                <button
                  onMouseDown={zoomInHandlers.handleStart}
                  onMouseUp={zoomInHandlers.handleStop}
                  onMouseLeave={zoomInHandlers.handleStop}
                  onTouchStart={zoomInHandlers.handleStart}
                  onTouchEnd={zoomInHandlers.handleStop}
                  className="group w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
              {/* FOCUS */}
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-3 text-white/50 text-xs font-medium tracking-wider">FOCUS</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 mb-6">
                <button
                  onMouseDown={focusInHandlers.handleStart}
                  onMouseUp={focusInHandlers.handleStop}
                  onMouseLeave={focusInHandlers.handleStop}
                  onTouchStart={focusInHandlers.handleStart}
                  onTouchEnd={focusInHandlers.handleStop}
                  className="group w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom Out"
                >
                  <Minus size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>

                <button
                  onMouseDown={focusOutHandlers.handleStart}
                  onMouseUp={focusOutHandlers.handleStop}
                  onMouseLeave={focusOutHandlers.handleStop}
                  onTouchStart={focusOutHandlers.handleStart}
                  onTouchEnd={focusOutHandlers.handleStop}
                  className="group w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 active:bg-blue-500/40 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom In"
                >
                  <Plus size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>
              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-3 text-white/50 text-xs font-medium tracking-wider">SPEED</span>
                </div>
              </div>

              <div className="flex flex-col items-center mb-6">
                <input
                  type="range"
                  min="1"
                  max="100"
                  step="5"
                  value={speed}
                  onChange={(e) => setSpeed(Number(e.target.value))}
                  className="w-32 accent-blue-500 cursor-pointer"
                  aria-label="Speed Control"
                />
                <div className="flex justify-between w-32 mt-2 text-white/60 text-xs font-medium">
                  <span>1</span>
                  <span>3</span>
                  <span>5</span>
                </div>             
              </div>

              <div className="flex items-center justify-center pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2 text-xs text-white/60">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="font-medium tracking-wide">CONNECTED</span>
                </div>
              </div>
            </div>
          </div>

          <iframe
            src={`http://${import.meta.env.VITE_SERVER_URL}:8889/${camId}`}
            width="640"
            height="360"
            className="object-fill"
            allow="autoplay; fullscreen"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: "center",
              transition: "transform 0.3s ease",
              width: "100%",
              height: "100%",
            }}
          />
        </div>
      </div>
    </div>
  );
};

export default VideoStream;