import axios from 'axios';
import { useEffect, useState } from 'react';

const VideoListSidebar = () => {
    const [videos, setVideos] = useState<string[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        // Fetch the list of videos from the backend
        axios.get('/cgi-bin/videosList.cgi')
            .then(response => {
                console.log('Response data:', response.data); // Inspect the response

                // Ensure response.data.videos is an array
                if (Array.isArray(response.data.videos)) {
                    // Extract just the file names from the full paths
                    const fileNames = response.data.videos.map((path: string) => {
                        // Extract the base name from the full path
                        return path.substring(path.lastIndexOf('/') + 1);
                    });
                    setVideos(fileNames);
                } else {
                    throw new Error('Response data.videos is not an array');
                }
            })
            .catch(error => {
                console.error('Error fetching videos list:', error);
                setError('Failed to fetch videos list');
            });
    }, []);

    const handleSelectVideo = (video: string) => {
        setSelectedVideo(video);
    };

    const handleDelete = (videoName: string) => {
        // Assuming the full path needs to be sent for deletion
        const payload = { videoUrl: `/mnt/mmcblk0p1/${videoName}` };
        const formData = new URLSearchParams();
        formData.append('videoUrl', payload.videoUrl);

        axios.post('/cgi-bin/deleteVideo.cgi', formData.toString(), {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then(() => {
                setVideos(videos.filter(v => v !== videoName)); // Remove video from list
                if (selectedVideo === videoName) {
                    setSelectedVideo(null); // Clear video if it's the currently selected one
                }
            })
            .catch(error => {
                console.error('Error deleting video:', error);
                setError('Failed to delete video');
            });
    };

    if (error) {
        return <div className="p-4 bg-red-400 text-black font-medium rounded-md mt-4">Error: {error}</div>;
    }

    const sidebarWidthClass = window.innerWidth >= 1024 ? 'w-1/6' : window.innerWidth >= 768 ? 'w-1/4' : 'w-1/2';

    return (
        <div className="flex h-[calc(100vh-8rem)] mt-4 space-x-4">
            {/* Sidebar with video list */}
            <div className={`${sidebarWidthClass} h-full rounded-lg p-4 flex flex-col bg-white shadow-md border border-gray-200 overflow-auto`}>
                <h2 className="text-xl font-semibold mb-4 text-gray-900">Video List</h2>
                <ul className="space-y-2">
                    {videos.length > 0 ? (
                        videos.map((video, index) => (
                            <li
                                key={index}
                                className={`flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-100 ${selectedVideo === video ? 'bg-blue-200' : ''}`}
                                onClick={() => handleSelectVideo(video)}
                            >
                                <span className="text-sm">{video}</span>
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent event bubbling to the list item
                                        handleDelete(video);
                                    }}
                                    className="ml-2 text-red-600 hover:text-red-800"
                                    aria-label="Delete Video"
                                >
                                    <svg
                                        xmlns="http://www.w3.org/2000/svg"
                                        className="w-4 h-4 inline"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                        stroke="currentColor"
                                        strokeWidth="2"
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                    >
                                        <path d="M3 6h18M9 6V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2M4 6h16l1 14a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1L4 6z" />
                                    </svg>
                                </button>
                            </li>
                        ))
                    ) : (
                        <li className="text-gray-500">No videos found</li>
                    )}
                </ul>
            </div>

            {/* Video Player */}
            <div className="flex-grow flex items-center justify-center bg-black rounded-lg overflow-hidden">
                {selectedVideo ? (
                    <video
                        src={`/mnt/mmcblk0p1/${selectedVideo}`}
                        controls
                        className="object-contain h-[calc(100vh-8rem)] w-full"
                    >
                        Your browser does not support the video tag.
                    </video>
                ) : (
                    <div className="text-white text-lg">Select a video to play</div>
                )}
            </div>
        </div>
    );
};

export default VideoListSidebar;
