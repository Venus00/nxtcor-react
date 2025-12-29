import axios from 'axios';
import { useEffect, useState } from 'react';
import { Calendar, Search, Trash2, Clock, Video, Camera, Thermometer, ChevronDown, ChevronRight, Folder } from 'lucide-react';

interface VideoFile {
    name: string;
    date: string;
    hour?: string;
    size: number;
    relativePath: string;
    downloadUrl: string;
}

interface VideosByDate {
    [date: string]: VideoFile[];
}

type CameraType = 'cam1' | 'cam2';

const API_BASE_URL = `http://${window.location.hostname}:3001`;

const VideoListSidebar = () => {
    const [selectedCamera, setSelectedCamera] = useState<CameraType>('cam1');
    const [allVideos, setAllVideos] = useState<VideosByDate>({});
    const [filteredVideos, setFilteredVideos] = useState<VideoFile[]>([]);
    const [selectedVideo, setSelectedVideo] = useState<VideoFile | null>(null);
    const [selectedDate, setSelectedDate] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState<boolean>(false);
    const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());
    const [expandedHours, setExpandedHours] = useState<Set<string>>(new Set());

    // Fetch all files on mount or when camera changes
    useEffect(() => {
        fetchAllFiles();
        setSelectedVideo(null);
        setSelectedDate('');
    }, [selectedCamera]);

    // Filter videos when date or search changes
    useEffect(() => {
        if (selectedDate) {
            fetchVideosByDate(selectedDate);
        } else {
            // Show all videos if no date selected
            const allVids: VideoFile[] = [];
            Object.values(allVideos).forEach(dateVideos => {
                allVids.push(...dateVideos);
            });
            setFilteredVideos(allVids);
        }
    }, [selectedDate, allVideos]);

    const fetchAllFiles = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/files`, {
                params: { camera: selectedCamera }
            });
            const videos: VideoFile[] = response.data.videos || [];

            // Group videos by date and extract hour from filename or date
            const videosByDate: VideosByDate = {};
            videos.forEach(video => {
                // Extract hour from filename (assuming format contains hour like HH_MM_SS)
                const hourMatch = video.name.match(/(\d{2})_\d{2}_\d{2}/);
                video.hour = hourMatch ? hourMatch[1] : '00';

                if (!videosByDate[video.date]) {
                    videosByDate[video.date] = [];
                }
                videosByDate[video.date].push(video);
            });

            setAllVideos(videosByDate);
            setFilteredVideos(videos);
        } catch (err: any) {
            console.error('Error fetching all files:', err);
            setError('Failed to fetch video files');
        } finally {
            setLoading(false);
        }
    };

    const fetchVideosByDate = async (date: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/files/videos-by-date`, {
                params: { date, camera: selectedCamera }
            });
            setFilteredVideos(response.data.videos.map((v: VideoFile) => ({ ...v, date })));
        } catch (err: any) {
            console.error('Error fetching videos by date:', err);
            setError('Failed to fetch videos for selected date');
        } finally {
            setLoading(false);
        }
    };

    const searchVideo = async () => {
        if (!searchQuery || !selectedDate) {
            setError('Please select a date and enter a video name');
            return;
        }

        setLoading(true);
        setError(null);
        try {
            const response = await axios.get(`${API_BASE_URL}/files/search-video`, {
                params: {
                    name: searchQuery,
                    date: selectedDate,
                    camera: selectedCamera
                }
            });

            if (response.data.found) {
                setFilteredVideos([{ ...response.data.video, date: selectedDate }]);
            } else {
                setFilteredVideos([]);
                setError('Video not found');
            }
        } catch (err: any) {
            console.error('Error searching video:', err);
            setError('Failed to search video');
        } finally {
            setLoading(false);
        }
    };

    const deleteVideo = async (video: VideoFile) => {
        if (!confirm(`Delete ${video.name}?`)) return;

        try {
            await axios.delete(`${API_BASE_URL}/files/delete-video`, {
                params: {
                    name: video.name,
                    date: video.date,
                    camera: selectedCamera
                }
            });

            // Remove from list
            setFilteredVideos(filteredVideos.filter(v => v.name !== video.name || v.date !== video.date));
            if (selectedVideo?.name === video.name && selectedVideo?.date === video.date) {
                setSelectedVideo(null);
            }

            // Refresh the file list
            fetchAllFiles();
        } catch (err: any) {
            console.error('Error deleting video:', err);
            setError('Failed to delete video');
        }
    };

    const deleteByHour = async (date: string, hour: string) => {
        if (!confirm(`Delete all videos from ${date} at hour ${hour}?`)) return;

        try {
            await axios.delete(`${API_BASE_URL}/files/delete-by-hour`, {
                params: { date, hour, camera: selectedCamera }
            });

            // Refresh
            fetchAllFiles();
            if (selectedDate === date) {
                fetchVideosByDate(date);
            }
        } catch (err: any) {
            console.error('Error deleting by hour:', err);
            setError('Failed to delete videos by hour');
        }
    };

    const deleteByDate = async (date: string) => {
        if (!confirm(`Delete ALL videos from ${date}?`)) return;

        try {
            await axios.delete(`${API_BASE_URL}/files/delete-by-date`, {
                params: { date, camera: selectedCamera }
            });

            // Refresh
            setSelectedDate('');
            setFilteredVideos([]);
            setSelectedVideo(null);
            fetchAllFiles();
        } catch (err: any) {
            console.error('Error deleting by date:', err);
            setError('Failed to delete videos by date');
        }
    };

    const handleSelectVideo = (video: VideoFile) => {
        setSelectedVideo(video);
    };

    const toggleDate = (date: string) => {
        const newExpanded = new Set(expandedDates);
        if (newExpanded.has(date)) {
            newExpanded.delete(date);
        } else {
            newExpanded.add(date);
        }
        setExpandedDates(newExpanded);
    };

    const toggleHour = (dateHour: string) => {
        const newExpanded = new Set(expandedHours);
        if (newExpanded.has(dateHour)) {
            newExpanded.delete(dateHour);
        } else {
            newExpanded.add(dateHour);
        }
        setExpandedHours(newExpanded);
    };

    const getVideoUrl = (video: VideoFile) => {
        // Use downloadUrl from API response if available, otherwise construct URL
        // if (video.downloadUrl) {
        //     return video.downloadUrl.startsWith('http')
        //         ? video.downloadUrl
        //         : `${API_BASE_URL}${video.downloadUrl}`;
        // }
        return `${API_BASE_URL}/files/search-video?date=${video.date}&name=${video.name}&camera=${selectedCamera}`;
    };

    // Get unique dates for date selector
    const availableDates = Object.keys(allVideos).sort().reverse();

    // Group all videos by date and hour for hierarchical view
    const videosByDateAndHour: { [date: string]: { [hour: string]: VideoFile[] } } = {};
    if (!selectedDate) {
        // Show all videos grouped by date and hour
        Object.entries(allVideos).forEach(([date, videos]) => {
            if (!videosByDateAndHour[date]) {
                videosByDateAndHour[date] = {};
            }
            videos.forEach(video => {
                const hour = video.hour || '00';
                if (!videosByDateAndHour[date][hour]) {
                    videosByDateAndHour[date][hour] = [];
                }
                videosByDateAndHour[date][hour].push(video);
            });
        });
    } else {
        // Show filtered videos grouped by hour for selected date
        videosByDateAndHour[selectedDate] = {};
        filteredVideos.forEach(video => {
            const hour = video.hour || '00';
            if (!videosByDateAndHour[selectedDate][hour]) {
                videosByDateAndHour[selectedDate][hour] = [];
            }
            videosByDateAndHour[selectedDate][hour].push(video);
        });
    }

    // Group videos by hour for the current filtered list (legacy, kept for compatibility)
    const videosByHour: { [hour: string]: VideoFile[] } = {};
    if (Array.isArray(filteredVideos)) {
        filteredVideos.forEach(video => {
            const hour = video.hour || '00';
            if (!videosByHour[hour]) {
                videosByHour[hour] = [];
            }
            videosByHour[hour].push(video);
        });
    }

    return (
        <div className="flex h-screen bg-gray-900">
            {/* Controls and Date Selector */}
            <div className="w-80 h-full rounded-lg p-4 flex flex-col bg-gray-800 shadow-md border border-gray-700 overflow-hidden">
                <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                    <Calendar className="w-5 h-5" />
                    Playback Controls
                </h2>

                {/* Camera Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Camera</label>
                    <div className="grid grid-cols-2 gap-2">
                        <button
                            onClick={() => setSelectedCamera('cam1')}
                            className={`px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${selectedCamera === 'cam1'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            <Camera className="w-4 h-4" />
                            Optique
                        </button>
                        <button
                            onClick={() => setSelectedCamera('cam2')}
                            className={`px-3 py-2 rounded-md flex items-center justify-center gap-2 transition-all ${selectedCamera === 'cam2'
                                ? 'bg-blue-600 text-white'
                                : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                                }`}
                        >
                            <Thermometer className="w-4 h-4" />
                            Thermique
                        </button>
                    </div>
                </div>

                {/* Date Selector */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Select Date</label>
                    <select
                        value={selectedDate}
                        onChange={(e) => setSelectedDate(e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        <option value="">All Dates</option>
                        {availableDates.map(date => (
                            <option key={date} value={date}>{date}</option>
                        ))}
                    </select>
                </div>

                {/* Search */}
                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-300 mb-2">Search Video</label>
                    <div className="flex gap-2">
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Video name..."
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <button
                            onClick={searchVideo}
                            className="px-3 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md flex items-center gap-1"
                        >
                            <Search className="w-4 h-4" />
                        </button>
                    </div>
                </div>

                {/* Delete by Date */}
                {selectedDate && (
                    <button
                        onClick={() => deleteByDate(selectedDate)}
                        className="mb-4 w-full px-3 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md flex items-center justify-center gap-2"
                    >
                        <Trash2 className="w-4 h-4" />
                        Delete All ({selectedDate})
                    </button>
                )}

                {error && (
                    <div className="mb-4 p-3 bg-red-900/50 border border-red-600 text-red-200 rounded-md text-sm">
                        {error}
                    </div>
                )}
            </div>

            <div className="flex flex-1 gap-4 overflow-hidden min-h-0 p-4">
                {/* Sidebar with video list */}
                <div className="w-1/3 h-full rounded-lg p-4 flex flex-col bg-gray-800 border border-gray-700 overflow-auto">
                    <h2 className="text-xl font-semibold mb-4 text-white flex items-center gap-2">
                        <Video className="w-5 h-5" />
                        Videos ({filteredVideos.length})
                    </h2>

                    {loading ? (
                        <div className="text-center text-gray-400">Loading...</div>
                    ) : Object.keys(videosByDateAndHour).length > 0 ? (
                        <div className="space-y-2">
                            {Object.entries(videosByDateAndHour).sort().reverse().map(([date, hourGroups]) => (
                                <div key={date} className="border border-gray-700 rounded-lg overflow-hidden">
                                    {/* Date Folder Header */}
                                    <div
                                        className="flex items-center justify-between p-3 bg-gray-700/50 hover:bg-gray-700 cursor-pointer transition-colors"
                                        onClick={() => toggleDate(date)}
                                    >
                                        <div className="flex items-center gap-2">
                                            {expandedDates.has(date) ?
                                                <ChevronDown className="w-4 h-4 text-gray-400" /> :
                                                <ChevronRight className="w-4 h-4 text-gray-400" />
                                            }
                                            <Folder className="w-4 h-4 text-yellow-400" />
                                            <span className="font-semibold text-gray-200">{date}</span>
                                            <span className="text-xs text-gray-400">
                                                ({Object.values(hourGroups).reduce((sum, vids) => sum + vids.length, 0)} videos)
                                            </span>
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                deleteByDate(date);
                                            }}
                                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-900/20"
                                        >
                                            <Trash2 className="w-3 h-3" />
                                            Delete Day
                                        </button>
                                    </div>

                                    {/* Hour Folders */}
                                    {expandedDates.has(date) && (
                                        <div className="bg-gray-800/50 pl-4">
                                            {Object.entries(hourGroups).sort().reverse().map(([hour, videos]) => (
                                                <div key={`${date}-${hour}`} className="border-b border-gray-700/50 last:border-b-0">
                                                    {/* Hour Folder Header */}
                                                    <div
                                                        className="flex items-center justify-between p-2 hover:bg-gray-700/30 cursor-pointer transition-colors"
                                                        onClick={() => toggleHour(`${date}-${hour}`)}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            {expandedHours.has(`${date}-${hour}`) ?
                                                                <ChevronDown className="w-3 h-3 text-gray-400" /> :
                                                                <ChevronRight className="w-3 h-3 text-gray-400" />
                                                            }
                                                            <Clock className="w-3 h-3 text-blue-400" />
                                                            <span className="text-sm font-medium text-gray-300">
                                                                {hour}:00
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                ({videos.length} videos)
                                                            </span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                deleteByHour(date, hour);
                                                            }}
                                                            className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-1.5 py-0.5 rounded hover:bg-red-900/20"
                                                        >
                                                            <Trash2 className="w-3 h-3" />
                                                        </button>
                                                    </div>

                                                    {/* Video Files */}
                                                    {expandedHours.has(`${date}-${hour}`) && (
                                                        <ul className="pl-6 py-1 space-y-1">
                                                            {videos.map((video, index) => (
                                                                <li
                                                                    key={`${video.date}-${video.name}-${index}`}
                                                                    className={`flex items-center justify-between cursor-pointer p-2 rounded-lg hover:bg-gray-700 transition-colors ${selectedVideo?.name === video.name && selectedVideo?.date === video.date
                                                                            ? 'bg-blue-900/50 border border-blue-500'
                                                                            : 'bg-gray-900/30 border border-transparent'
                                                                        }`}
                                                                    onClick={() => handleSelectVideo(video)}
                                                                >
                                                                    <div className="flex-1 min-w-0">
                                                                        <span className="text-xs block truncate font-medium text-white">
                                                                            {video.name}
                                                                        </span>
                                                                    </div>
                                                                    <button
                                                                        onClick={(e) => {
                                                                            e.stopPropagation();
                                                                            deleteVideo(video);
                                                                        }}
                                                                        className="ml-2 text-red-400 hover:text-red-300 flex-shrink-0"
                                                                        aria-label="Delete Video"
                                                                    >
                                                                        <Trash2 className="w-3 h-3" />
                                                                    </button>
                                                                </li>
                                                            ))}
                                                        </ul>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center text-gray-400">No videos found</div>
                    )}
                </div>

                {/* Video Player */}
                <div className="flex-1 flex items-center justify-center bg-black rounded-lg overflow-hidden">
                    {selectedVideo ? (
                        <video
                            key={`${selectedVideo.date}-${selectedVideo.name}`}
                            src={getVideoUrl(selectedVideo)}
                            controls
                            className="w-full h-full"
                        >
                            Your browser does not support the video tag.
                        </video>
                    ) : (
                        <div className="text-white text-lg flex flex-col items-center gap-4">
                            <Video className="w-16 h-16 opacity-50" />
                            <span>Select a video to play</span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default VideoListSidebar;
