import React, { useState, useEffect, useRef } from 'react';

const VideoStream: React.FC = () => {
  const [scale, setScale] = useState(1);
  const [position, ] = useState({ x: 0, y: 0 });
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState < 3) { // Less than HAVE_FUTURE_DATA
        videoRef.current.load(); // Reload the video if it's stuck
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const zoomIn = () => {
    setScale((prevScale) => prevScale + 0.2);
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 1));
  };

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
    <div className="flex h-[calc(100vh-8rem)] mt-4 gap-2">
      {/* Sidebar with grid controls */}
      <div className="w-1/6 h-full p-4 bg-gray-50 shadow-md border  rounded-xl">
      <h2 className="text-xl font-semibold mb-4 text-gray-900 text-center ">Controls</h2>
        <div className=" flex flex-col items-center justify-center mt-24  space-y-2  ">
          {/* Arrow Keys */}
          <div className='flex  justify-center gap-2 '>
          <button
            onClick={() => move('up')}
            className=" text-white font-semibold rounded-lg bg-white shadow border flex justify-center"
          >
            <img src="/assets/top.png" alt="Up" className="w-14 h-14" />
          </button>
          </div>
          <div className='flex  justify-center gap-2 '>
           
            <button
              onClick={() => move('left')}
              className=" text-white font-semibold rounded-lg shadow border  flex items-center justify-center"
            >
              <img src="/assets/left.png" alt="Left" className="w-14 h-14" />
            </button>
        
             <img src="/assets/middle.png" alt="middle" className="w-14 h-14 shadow border cursor-none" />
        
            <button
              onClick={() => move('right')}
              className=" text-white font-semibold rounded-lg shadow border  flex items-center justify-center"
            >
              <img src="/assets/right.png" alt="Right" className="w-14 h-14" />
            </button>
          </div>
        
          <div className='flex  justify-center gap-4 '>
          <button
            onClick={() => move('down')}
            className=" text-white font-semibold rounded-lg shadow border  flex items-center justify-center"
          >
            <img src="/assets/down.png" alt="Down" className="w-14 h-14" />
          </button>
          </div>
          <div className='flex  justify-center gap-2 '>
            <button
              onClick={zoomOut}
              className=" text-white font-semibold rounded-lg shadow border flex items-center justify-center"
            >
              <img src="/assets/zoomOut.png" alt="Zoom Out" className="w-14 h-14" />
            </button>
            <button
              onClick={zoomIn}
              className=" text-white font-semibold rounded-lg shadow border flex items-center justify-center"
            >
              <img src="/assets/zoomIn.png" alt="Zoom In" className="w-14 h-14" />
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-grow flex justify-center items-center relative">
        <div className="relative w-full h-full overflow-hidden bg-black rounded-xl">
          <video
            ref={videoRef}
            className="object-fill"
            poster="/mjpeg"
            style={{
              transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
              transformOrigin: 'center',
              transition: 'transform 0.3s ease',
              width: '100%',
              height: '100%',
            }}
          >
            Your browser does not support the video tag.
          </video>
        </div>
      </div>
    </div>
  );
};

export default VideoStream;
