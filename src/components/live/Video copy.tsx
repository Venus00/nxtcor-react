import axios from 'axios';
import React, { useRef } from 'react';


const VideoStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement>(null);


  const handleFullScreen = () => {
    const video = videoRef.current;
    if (video) {
      if (video.requestFullscreen) {
        video.requestFullscreen();
      }
    }
  };

  const captureAndSendRequest = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

        const apiUrl = '/cgi-bin/image.cgi';
        axios.get(apiUrl)
          .then(response => {
            if (response.status === 200) {
              console.log('Image saved successfully.');
            } else {
              console.log('error');
            }
          })
          .catch(error => {
            console.error('Error:', error);
          });
      }
    }
  };

  return (
    <div className="relative flex justify-center items-center mt-4 h-[calc(100vh-8rem)] bg-none rounded-xl">
      <video
        ref={videoRef}
        className="object-contain h-full w-full"
        loop
        poster="/mjpeg" // Replace with your actual poster image
      >
        Your browser does not support the video tag.
      </video>

      {/* Control Buttons */}
      <div className="absolute bottom-4 flex justify-center w-full space-x-4">
        {/* Full Screen Button */}
        <button
          onClick={handleFullScreen}
          className="text-white p-2 rounded-full hover:bg-gray-700"
          aria-label="Full Screen"
        >
          <img
            className="w-12 h-12"
            src="/assets/fullScreen.png"
            alt="Full Screen"
          />
        </button>

        {/* Capture Button */}
        <button
          onClick={captureAndSendRequest}
          className="p-2 rounded-full hover:bg-gray-700"
          aria-label="Capture Image"
        >
          <img
            className="w-12 h-12"
            src="/assets/capture.png"
            alt="Capture"
          />
        </button>
      </div>



    </div>
  );
};

export default VideoStream;
