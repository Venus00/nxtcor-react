import { useEffect, useRef } from 'react';

const VideoStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState < 3) { // Less than HAVE_FUTURE_DATA
        videoRef.current.load(); // Reload the video if it's stuck
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative flex justify-center items-center mt-4 h-[calc(100vh-8rem)] bg-black rounded-xl">
      <video
        ref={videoRef}
        className="object-fill h-[calc(100vh-8rem)] w-full"
        loop
        autoPlay
        poster="/mjpeg"
      >
        Your browser does not support the video tag.
      </video>
    </div>
  );
};

export default VideoStream;
