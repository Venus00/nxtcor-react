import React, { useState, useEffect } from 'react';
import Sidebar from './Sidebar';

const VideoStream: React.FC = () => {
  const [scale, setScale] = useState(1);

  const zoomIn = () => {
    setScale((prevScale) => prevScale + 0.2);
  };

  const zoomOut = () => {
    setScale((prevScale) => Math.max(prevScale - 0.2, 1));
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    switch (event.key) {
      case '+':
        zoomIn();
        break;
      case '-':
        zoomOut();
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  return (
    <div className="relative flex justify-center items-center mt-4 h-[calc(100vh-8rem)] bg-none overflow-hidden gap-1">
      <Sidebar />
      <video
        className="object-fill h-full w-full rounded-xl"
        loop
        controls
         src="https://www.w3schools.com/html/mov_bbb.mp4"
        style={{
          transform: `scale(${scale})`,
          transformOrigin: 'center',
          transition: 'transform 0.3s ease',
        }}
      >
        Your browser does not support the video tag.
      </video>

      {/* Optional Zoom-In Button */}
      <button
        onClick={zoomIn}
        className="absolute bottom-4 right-4 bg-white text-black p-2 rounded"
      >
        Zoom In
      </button>
      <button
        onClick={zoomOut}
        className="absolute bottom-4 right-20 bg-white text-black p-2 rounded"
      >
        Zoom Out
      </button>
    </div>
  );
};

export default VideoStream;

// const VideoStream: React.FC = () => {
//   return (
//     <div className="relative flex justify-center items-center mt-4 h-[calc(100vh-8rem)] bg-none">
//       <video
//         className="object-fill  h-[calc(100vh-8rem)] w-full"
//         loop
//         autoPlay // Added controls for better testing
//         poster="/mjpeg"
//       >
//         Your browser does not support the video tag.
//       </video>
//     </div>
//   );
// };

// export default VideoStream;

