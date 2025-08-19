import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, Circle, RotateCcw, RotateCw, ZoomIn, ZoomOut } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';

const VideoStream: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [position,] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [rotation, setRotation] = useState(0); 

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
  const camId = useParams().id
  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 1));
  };
  const rotateLeft = () => setRotation((prev) => prev - 90);
  const rotateRight = () => setRotation((prev) => prev + 90);
  const move = (direction: 'up' | 'down' | 'left' | 'right') => {
    // const movementStep = 20; // Amount of pixels to move
    console.log(direction)
    // setPosition((prevPosition) => {
    //   const videoElement = videoRef.current;
    //   if (!videoElement) return prevPosition;

    //   const videoWidth = videoElement.videoWidth * scale;
    //   const videoHeight = videoElement.videoHeight * scale;
    //   const containerWidth = videoElement.parentElement!.offsetWidth;
    //   const containerHeight = videoElement.parentElement!.offsetHeight;

    //   let newX = prevPosition.x;
    //   let newY = prevPosition.y;

    //   switch (direction) {
    //     case 'up':
    //       newY = Math.min(newY + movementStep, 0);
    //       break;
    //     case 'down':
    //       newY = Math.max(newY - movementStep, containerHeight - videoHeight);
    //       break;
    //     case 'left':
    //       newX = Math.min(newX + movementStep, 0);
    //       break;
    //     case 'right':
    //       newX = Math.max(newX - movementStep, containerWidth - videoWidth);
    //       break;
    //     default:
    //       break;
    //   }

    //   return { x: newX, y: newY };
    // });
  };

  return (
    <div className="flex h-[calc(100vh-5rem)]">
      <div className="w-1/6 h-full p-4 bg-black shadow-2xl border-r border-gray-800">
        <h2 className="text-xl font-semibold mb-4 text-white text-center">Controls</h2>
        <div className="flex flex-col items-center justify-center space-y-3">
          {/* Arrow Keys */}
          <div className="flex justify-center gap-2">
            <button
              onClick={() => move("up")}
              className="w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg border border-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <ChevronUp size={24} />
            </button>
          </div>
          <div className="flex justify-center gap-2">
            <button
              onClick={() => move("left")}
              className="w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg border border-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <ChevronLeft size={24} />
            </button>
            <div className="w-14 h-14 bg-gray-900 border border-gray-600 rounded-lg flex items-center justify-center shadow-inner">
              <Circle size={16} className="text-gray-500" />
            </div>
            <button
              onClick={() => move("right")}
              className="w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg border border-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <ChevronRight size={24} />
            </button>
          </div>
          <div className="flex justify-center gap-4">
            <button
              onClick={() => move("down")}
              className="w-14 h-14 bg-gray-800 hover:bg-gray-700 text-white font-semibold rounded-lg shadow-lg border border-gray-600 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <ChevronDown size={24} />
            </button>
          </div>
          <div className="flex justify-center gap-2 mt-4">
            <button
              onClick={zoomOut}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg border border-blue-500 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <ZoomOut size={20} />
            </button>
            <button
              onClick={zoomIn}
              className="w-14 h-14 bg-blue-600 hover:bg-blue-500 text-white font-semibold rounded-lg shadow-lg border border-blue-500 flex items-center justify-center transition-all duration-200 hover:scale-105 hover:shadow-xl active:scale-95"
            >
              <ZoomIn size={20} />
            </button>
          </div>
        </div>
      </div>
      <div className="flex-grow flex justify-center items-center relative bg-black">
        <div className="relative w-full h-full overflow-hidden bg-black">
          
          <div className="absolute bottom-4 right-6 z-20">
            <div className="bg-black/20 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl p-6 min-w-[160px]">
              
              <div className="flex items-center justify-between mb-5 pb-3 border-b border-white/10">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse shadow-lg shadow-red-500/50"></div>
                  <span className="text-white/90 text-xs font-medium tracking-wide">PTZ CONTROL</span>
                </div>
              </div>

              <div className="flex flex-col items-center space-y-2 mb-6">
                <button
                  onClick={() => move("up")}
                  className="group w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                  aria-label="Tilt Up"
                >
                  <ChevronUp size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => move("left")}
                    className="group w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Pan Left"
                  >
                    <ChevronLeft size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                  </button>
                  
                  <div className="w-12 h-12 bg-white/5 border border-white/20 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <div className="w-2 h-2 bg-white/60 rounded-full shadow-lg"></div>
                  </div>
                  
                  <button
                    onClick={() => move("right")}
                    className="group w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                    aria-label="Pan Right"
                  >
                    <ChevronRight size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                  </button>
                </div>

                <button
                  onClick={() => move("down")}
                  className="group w-12 h-12 bg-white/5 hover:bg-white/15 border border-white/10 hover:border-white/25 text-white/80 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-white/5"
                  aria-label="Tilt Down"
                >
                  <ChevronDown size={18} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              <div className="relative mb-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-black/20 px-3 text-white/50 text-xs font-medium tracking-wider">ZOOM</span>
                </div>
              </div>

              <div className="flex items-center justify-center space-x-3 mb-5">
                <button
                  onClick={zoomOut}
                  className="group w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom Out"
                >
                  <ZoomOut size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>
                
                <button
                  onClick={zoomIn}
                  className="group w-12 h-12 bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/30 hover:border-blue-400/50 text-blue-100 hover:text-white rounded-xl flex items-center justify-center transition-all duration-300 ease-out hover:scale-110 active:scale-95 backdrop-blur-sm hover:shadow-lg hover:shadow-blue-500/20"
                  aria-label="Zoom In"
                >
                  <ZoomIn size={16} strokeWidth={2.5} className="group-hover:scale-110 transition-transform duration-200" />
                </button>
              </div>

              <div className="flex items-center justify-center pt-3 border-t border-white/10">
                <div className="flex items-center space-x-2 text-xs text-white/60">
                  <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse shadow-lg shadow-green-400/50"></div>
                  <span className="font-medium tracking-wide">CONNECTED</span>
                </div>
              </div>
            </div>
          </div>

          {/* Video iframe */}
          <iframe
            src={`http://192.168.10.57:8888/${camId}`}
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
  )
}

export default VideoStream;