import React, { useEffect, useRef } from "react";
import axios from "axios";
import VideoStreamPlayer from "./VidePlayer";

const VideoStream: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      if (videoRef.current && videoRef.current.readyState < 3) {
        // Less than HAVE_FUTURE_DATA
        videoRef.current.load(); // Reload the video if it's stuck
      }
    }, 5000); // Check every 5 seconds

    return () => clearInterval(interval);
  }, []);

  const move = async (
    direction:
      | "up"
      | "down"
      | "left"
      | "right"
      | "zoomIn"
      | "zoomOut"
      | "FocusIn"
      | "FocusOut"
  ) => {
    console.log(direction);

    const actionUrl = "/cgi-bin/setPTZ.cgi";
    const payload = {
      cmd: direction,
    };
    try {
      const response = await axios.post(actionUrl, payload, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });

      if (response.data.includes("success")) {
        console.log("PTZ commmand success " + direction);
      } else {
        console.log("PTZ commmand not success ");
      }
    } catch (error) {
      console.log("PTZ commmand success " + error);
    }
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] mt-4 gap-2">
      {/* Sidebar with grid controls */}
      <div className="w-1/6 h-full p-4 bg-gray-50 shadow-md border  rounded-xl">
        <h2 className="text-xl font-semibold mb-4 text-gray-900 text-center ">
          Controls
        </h2>
        <div className=" flex flex-col items-center justify-center mt-24  space-y-2  ">
          {/* Arrow Keys */}
          <div className="flex  justify-center gap-2 ">
            <button
              onClick={() => move("up")}
              className=" text-white font-semibold rounded-lg bg-white shadow border flex justify-center"
            >
              <img src="/assets/top.png" alt="Up" className="w-12 h-12" />
            </button>
          </div>
          <div className="flex  justify-center gap-2 ">
            <button
              onClick={() => move("left")}
              className=" text-white font-semibold rounded-lg shadow border  flex items-center justify-center"
            >
              <img src="/assets/left.png" alt="Left" className="w-12 h-12" />
            </button>

            <img
              src="/assets/middle.png"
              alt="middle"
              className="w-12 h-12 shadow border cursor-none"
            />

            <button
              onClick={() => move("right")}
              className=" text-white font-semibold rounded-lg shadow border  flex items-center justify-center"
            >
              <img src="/assets/right.png" alt="Right" className="w-12 h-12" />
            </button>
          </div>

          <div className="flex  justify-center gap-4 ">
            <button
              onClick={() => move("down")}
              className=" text-white font-semibold rounded-lg shadow border  flex items-center justify-center"
            >
              <img src="/assets/down.png" alt="Down" className="w-12 h-12" />
            </button>
          </div>
          <div className="flex  justify-center gap-2 ">
            <button
              onClick={() => move("zoomOut")}
              className=" text-white font-semibold rounded-lg shadow border flex items-center justify-center"
            >
              <img
                src="/assets/zoomOut.png"
                alt="Zoom Out"
                className="w-12 h-12"
              />
            </button>
            <button
              onClick={() => move("zoomIn")}
              className=" text-white font-semibold rounded-lg shadow border flex items-center justify-center"
            >
              <img
                src="/assets/zoomIn.png"
                alt="Zoom In"
                className="w-12 h-12"
              />
            </button>
          </div>
          <div className="flex  justify-center gap-2 ">
            <button
              onClick={() => move("FocusIn")}
              className=" text-white font-semibold rounded-lg shadow border flex items-center justify-center"
            >
              <img
                src="/assets/FocusIn.png"
                alt="Zoom In"
                className="w-12 h-12"
              />
            </button>
            <button
              onClick={() => move("FocusOut")}
              className=" text-white font-semibold rounded-lg shadow border flex items-center justify-center"
            >
              <img
                src="/assets/FocusOut.png"
                alt="Zoom Out"
                className="w-12 h-12"
              />
            </button>
          </div>
        </div>
      </div>

      {/* Video Player */}
      <div className="flex-grow flex justify-center items-center relative">
        <div className="relative w-full h-full overflow-hidden bg-black rounded-xl object-fill ">
          <VideoStreamPlayer />
        </div>
      </div>
    </div>
  );
};

export default VideoStream;
