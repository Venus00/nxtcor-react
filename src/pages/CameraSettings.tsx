"use client"

import type React from "react"
import { useRef, useState } from "react"
import ProfileManagement, { type ProfileManagementData } from "../components/camera/ProfileManagement"
import PictureSettings, { type PictureSettingsData } from "../components/camera/PictureSettings"
import ExposureSettings, { type ExposureSettingsData } from "../components/camera/ExposureSettings"
import WhiteBalanceSettings, { type WhiteBalanceSettingsData } from "../components/camera/WhiteBalanceSettings"
import DayNightSettings, { type DayNightSettingsData } from "../components/camera/DayNightSettings"
import ZoomFocusSettings, { type ZoomFocusSettingsData } from "../components/camera/ZoomFocusSettings"
import DefogSettings, { type DefogSettingsData } from "../components/camera/DefogSettings"
import VideoEncoding, { type VideoEncodingData } from "../components/encoding/VideoEncoding"
import PictureStream, { type PictureStreamData } from "../components/encoding/PictureStream"
import VideoOverlay, { type VideoOverlayData } from "../components/encoding/VideoOverlay"
import ROI, { type ROIData } from "../components/encoding/ROI"
import Audio, { type AudioData } from "../components/encoding/Audio"

const CameraSettingsPage: React.FC = () => {
  // Profile Management State
  const [profileSettings, setProfileSettings] = useState<ProfileManagementData>({
    type: 'normal',
  });

  // Conditions Settings States
  const [pictureSettings, setPictureSettings] = useState<PictureSettingsData>({
    profile: 'normal',
    brightness: 50,
    contrast: 50,
    saturability: 50,
    chromaCNT: 50,
    sharpness: 50,
    sharpnessCNT: 50,
    gamma: 50,
    nr2D: 50,
    nr3D: 50,
    grade: 50,
    flip: 'normal',
    eis: false,
  });

  const [exposureSettings, setExposureSettings] = useState<ExposureSettingsData>({
    mode: 'auto',
    gainRange: 50,
    shutter: 50,
    shutterRange: 500,
    aperture: 50,
    exposureCompensation: 50,
    autoExposureRecovery: '15min',
  });

  const [whiteBalanceSettings, setWhiteBalanceSettings] = useState<WhiteBalanceSettingsData>({
    mode: 'auto',
  });

  const [dayNightSettings, setDayNightSettings] = useState<DayNightSettingsData>({
    type: 'icr',
    mode: 'auto',
    sensitivity: 'medium',
    latency: 5,
  });

  const [zoomFocusSettings, setZoomFocusSettings] = useState<ZoomFocusSettingsData>({
    digitalZoom: false,
    zoomSpeed: 100,
    mode: 'semi-automatic',
    focusLimit: 'auto',
    sensitivity: 50,
    afTracking: false,
  });

  const [defogSettings, setDefogSettings] = useState<DefogSettingsData>({
    mode: 'off',
    intensity: 'middle',
  });

  // Encoding Settings States
  const [videoSettings, setVideoSettings] = useState<VideoEncodingData>({
    videoCodec: 'H.264',
    resolution: '1920x1080',
    frameRate: 25,
    bitRateType: 'variable',
    pictureQuality: 5,
    referenceBitRate: 4096,
    bitRate: 4096,
    iFrameInterval: 50,
    watermarkEnabled: false,
    watermarkText: 'DigitalCCTV',
    subStreamEnabled: true,
  });

  const [pictureStreamSettings, setPictureStreamSettings] = useState<PictureStreamData>({
    snapshotType: 'normal',
    imageSize: '1080P',
    quality: 'good',
    interval: 1,
    customInterval: 10,
  });

  const [videoOverlaySettings, setVideoOverlaySettings] = useState<VideoOverlayData>({
    privacyMasks: [],
    channelTitle: {
      enabled: false,
      text: 'Camera 1',
      x: 5,
      y: 5,
    },
    timeTitle: {
      enabled: true,
      showWeek: false,
      x: 5,
      y: 95,
    },
    osdInfo: {
      enabled: false,
      showPresetPoint: false,
      showPTZCoordinates: false,
      showPattern: false,
      alignment: 'left',
      x: 5,
      y: 50,
    },
    textOverlay: {
      enabled: false,
      text: '',
      alignment: 'left',
      x: 50,
      y: 90,
    },
    fontSize: 'medium',
    overlayPicture: {
      enabled: false,
      imageUrl: null,
      x: 80,
      y: 80,
      width: 100,
      height: 50,
    },
    osdWarning: {
      enabled: false,
    },
    gpsCoordinates: {
      enabled: false,
      latitude: '',
      longitude: '',
    },
  });

  const [roiSettings, setRoiSettings] = useState<ROIData>({
    enabled: false,
    regions: [],
  });

  const [audioSettings, setAudioSettings] = useState<AudioData>({
    audioEnabled: false,
    channelNumber: 1,
    audioCodec: 'AAC',
    samplingFrequency: '16K',
    audioInType: 'LineIn',
    noiseFilter: true,
    microphoneVolume: 50,
    speakerVolume: 50,
  });

  const [activeTab, setActiveTab] = useState<'profile' | 'picture' | 'exposure' | 'white-balance' | 'day-night' | 'zoom-focus' | 'defog' | 'video-encoding' | 'picture-stream' | 'video-overlay' | 'roi' | 'audio'>('profile');
  const [activeCategory, setActiveCategory] = useState<'profile' | 'conditions' | 'encoding'>('profile');
 const videoRef = useRef<HTMLVideoElement | null>(null)

  const [scale] = useState(1)
  const [position] = useState({ x: 0, y: 0 })
  const handleSave = () => {
    // TODO: Implement actual save functionality to camera API
    console.log('Saving profile settings:', profileSettings);
    console.log('Saving picture settings:', pictureSettings);
    console.log('Saving exposure settings:', exposureSettings);
    console.log('Saving white balance settings:', whiteBalanceSettings);
    console.log('Saving day/night settings:', dayNightSettings);
    console.log('Saving zoom/focus settings:', zoomFocusSettings);
    console.log('Saving defog settings:', defogSettings);
    console.log('Saving video encoding settings:', videoSettings);
    console.log('Saving picture stream settings:', pictureStreamSettings);
    console.log('Saving video overlay settings:', videoOverlaySettings);
    console.log('Saving ROI settings:', roiSettings);
    console.log('Saving audio settings:', audioSettings);
    alert('Paramètres enregistrés avec succès!');
  };

  const handleReset = () => {
    setProfileSettings({
      type: 'normal',
    });
    setPictureSettings({
      profile: 'normal',
      brightness: 50,
      contrast: 50,
      saturability: 50,
      chromaCNT: 50,
      sharpness: 50,
      sharpnessCNT: 50,
      gamma: 50,
      nr2D: 50,
      nr3D: 50,
      grade: 50,
      flip: 'normal',
      eis: false,
    });
    setExposureSettings({
      mode: 'auto',
      gainRange: 50,
      shutter: 50,
      shutterRange: 500,
      aperture: 50,
      exposureCompensation: 50,
      autoExposureRecovery: '15min',
    });
    setWhiteBalanceSettings({
      mode: 'auto',
    });
    setDayNightSettings({
      type: 'icr',
      mode: 'auto',
      sensitivity: 'medium',
      latency: 5,
    });
    setZoomFocusSettings({
      digitalZoom: false,
      zoomSpeed: 100,
      mode: 'semi-automatic',
      focusLimit: 'auto',
      sensitivity: 50,
      afTracking: false,
    });
    setDefogSettings({
      mode: 'off',
      intensity: 'middle',
    });
    setVideoSettings({
      videoCodec: 'H.264',
      resolution: '1920x1080',
      frameRate: 25,
      bitRateType: 'variable',
      pictureQuality: 5,
      referenceBitRate: 4096,
      bitRate: 4096,
      iFrameInterval: 50,
      watermarkEnabled: false,
      watermarkText: 'DigitalCCTV',
      subStreamEnabled: true,
    });
    setPictureStreamSettings({
      snapshotType: 'normal',
      imageSize: '1080P',
      quality: 'good',
      interval: 1,
      customInterval: 10,
    });
    setVideoOverlaySettings({
      privacyMasks: [],
      channelTitle: {
        enabled: false,
        text: 'Camera 1',
        x: 5,
        y: 5,
      },
      timeTitle: {
        enabled: true,
        showWeek: false,
        x: 5,
        y: 95,
      },
      osdInfo: {
        enabled: false,
        showPresetPoint: false,
        showPTZCoordinates: false,
        showPattern: false,
        alignment: 'left',
        x: 5,
        y: 50,
      },
      textOverlay: {
        enabled: false,
        text: '',
        alignment: 'left',
        x: 50,
        y: 90,
      },
      fontSize: 'medium',
      overlayPicture: {
        enabled: false,
        imageUrl: null,
        x: 80,
        y: 80,
        width: 100,
        height: 50,
      },
      osdWarning: {
        enabled: false,
      },
      gpsCoordinates: {
        enabled: false,
        latitude: '',
        longitude: '',
      },
    });
    setRoiSettings({
      enabled: false,
      regions: [],
    });
    setAudioSettings({
      audioEnabled: false,
      channelNumber: 1,
      audioCodec: 'AAC',
      samplingFrequency: '16K',
      audioInType: 'LineIn',
      noiseFilter: true,
      microphoneVolume: 50,
      speakerVolume: 50,
    });
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres de la Caméra Optique</h1>
          <p className="text-gray-400">Configurez les réglages et l'encodage de votre caméra optique</p>
        </div>

        {/* Main Layout: Sidebar + Content */}
        <div className="flex gap-6">
          {/* Left Sidebar Navigation */}
          <div className="w-64 flex-shrink-0">
            <div className="bg-gray-800/50 rounded-lg border border-gray-700 overflow-hidden sticky top-6">
              {/* Live Feed Section */}
              <div className="p-4 border-b border-gray-700">
                <h3 className="text-sm font-semibold text-gray-400 uppercase mb-3">Aperçu en Direct</h3>
                <div className="aspect-video bg-gray-900 rounded-lg border border-gray-600 flex items-center justify-center overflow-hidden">
                      <div className="relative w-full h-full overflow-hidden bg-black">
                    <video
                      ref={videoRef}
                      className="object-fill"
                      poster="/mjpeg"
                      style={{
                        transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`,
                        transformOrigin: "center",
                        transition: "transform 0.3s ease",
                        width: "100%",
                        height: "100%",
                      }}
                      autoPlay
                      muted
                      playsInline
                    >
                      Your browser does not support the video tag.
                    </video>
                  </div>
                </div>
              </div>

              {/* Main Categories */}
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Catégories</h3>
                
                {/* Profile Management */}
                <button
                  onClick={() => {
                    setActiveCategory('profile');
                    setActiveTab('profile');
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg mb-2 transition-all ${
                    activeCategory === 'profile'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="font-medium text-sm">Gestion de Profil</span>
                  </div>
                </button>

                {/* Conditions Category */}
                <button
                  onClick={() => {
                    setActiveCategory('conditions');
                    setActiveTab('picture');
                  }}
                  className={`w-full text-left px-3 py-3 rounded-lg mb-3 transition-all ${
                    activeCategory === 'conditions'
                      ? 'bg-red-600 text-white shadow-lg'
                      : 'text-gray-300 hover:bg-gray-700/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                    <span className="font-medium text-sm">Conditions</span>
                  </div>
                </button>

                {/* Sub-navigation for Conditions */}
                {activeCategory === 'conditions' && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-700 pl-3">
                    <button
                      onClick={() => setActiveTab('picture')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'picture'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Image
                    </button>
                    <button
                      onClick={() => setActiveTab('exposure')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'exposure'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Exposition
                    </button>
                    <button
                      onClick={() => setActiveTab('white-balance')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'white-balance'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Balance des Blancs
                    </button>
                    <button
                      onClick={() => setActiveTab('day-night')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'day-night'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Jour/Nuit
                    </button>
                    <button
                      onClick={() => setActiveTab('zoom-focus')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'zoom-focus'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Zoom/Focus
                    </button>
                    <button
                      onClick={() => setActiveTab('defog')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'defog'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Débrouillage
                    </button>
                  </div>
                )}
              </div>

              {/* Encoding Section */}
              <div className="mb-4">
                <button
                  onClick={() => {
                    setActiveCategory('encoding');
                    setActiveTab('video-encoding');
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                    activeCategory === 'encoding'
                      ? 'bg-red-600 text-white shadow-lg shadow-red-600/20'
                      : 'bg-gray-800 text-gray-300 hover:bg-gray-700 border border-gray-700'
                  }`}
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
                  </svg>
                  <span className="font-medium">Encodage</span>
                </button>

                {/* Encoding Sub-navigation */}
                {activeCategory === 'encoding' && (
                  <div className="ml-4 space-y-1 border-l-2 border-gray-700 pl-3 mt-2">
                    <button
                      onClick={() => setActiveTab('video-encoding')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'video-encoding'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Encodage Vidéo
                    </button>
                    <button
                      onClick={() => setActiveTab('picture-stream')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'picture-stream'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Flux d'Images
                    </button>
                    <button
                      onClick={() => setActiveTab('video-overlay')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'video-overlay'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Superposition Vidéo
                    </button>
                    <button
                      onClick={() => setActiveTab('roi')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'roi'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      ROI
                    </button>
                    <button
                      onClick={() => setActiveTab('audio')}
                      className={`w-full text-left px-3 py-2 rounded text-sm transition-all ${
                        activeTab === 'audio'
                          ? 'bg-red-600/20 text-red-400 font-medium'
                          : 'text-gray-400 hover:text-white hover:bg-gray-700/30'
                      }`}
                    >
                      Audio
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-6">
              
              {/* Profile Management Section */}
              {activeCategory === 'profile' && (
                <ProfileManagement 
                  settings={profileSettings} 
                  onSettingsChange={setProfileSettings}
                />
              )}

              {/* Conditions Section */}
              {activeCategory === 'conditions' && (
                <>
                  {/* Picture Settings Tab */}
                  {activeTab === 'picture' && (
                    <PictureSettings 
                      settings={pictureSettings} 
                      onSettingsChange={setPictureSettings}
                    />
                  )}

          {/* Exposure Settings Tab */}
          {activeTab === 'exposure' && (
            <ExposureSettings 
              settings={exposureSettings} 
              onSettingsChange={setExposureSettings}
            />
          )}

          {/* White Balance Settings Tab */}
          {activeTab === 'white-balance' && (
            <WhiteBalanceSettings 
              settings={whiteBalanceSettings} 
              onSettingsChange={setWhiteBalanceSettings}
            />
          )}

          {/* Day/Night Settings Tab */}
          {activeTab === 'day-night' && (
            <DayNightSettings 
              settings={dayNightSettings} 
              onSettingsChange={setDayNightSettings}
            />
          )}

          {/* Zoom/Focus Settings Tab */}
          {activeTab === 'zoom-focus' && (
            <ZoomFocusSettings 
              settings={zoomFocusSettings} 
              onSettingsChange={setZoomFocusSettings}
            />
          )}

          {/* Defog Settings Tab */}
          {activeTab === 'defog' && (
            <DefogSettings 
              settings={defogSettings} 
              onSettingsChange={setDefogSettings}
            />
          )}
                </>
              )}

              {/* Encoding Section */}
              {activeCategory === 'encoding' && (
                <>
                  {/* Video Encoding Tab */}
                  {activeTab === 'video-encoding' && (
                    <VideoEncoding 
                      settings={videoSettings} 
                      onSettingsChange={setVideoSettings}
                    />
                  )}

                  {/* Picture Stream Tab */}
                  {activeTab === 'picture-stream' && (
                    <PictureStream 
                      settings={pictureStreamSettings} 
                      onSettingsChange={setPictureStreamSettings}
                    />
                  )}

                  {/* Video Overlay Tab */}
                  {activeTab === 'video-overlay' && (
                    <VideoOverlay 
                      settings={videoOverlaySettings} 
                      onSettingsChange={setVideoOverlaySettings}
                    />
                  )}

                  {/* ROI Tab */}
                  {activeTab === 'roi' && (
                    <ROI 
                      settings={roiSettings} 
                      onSettingsChange={setRoiSettings}
                    />
                  )}

                  {/* Audio Tab */}
                  {activeTab === 'audio' && (
                    <Audio 
                      settings={audioSettings} 
                      onSettingsChange={setAudioSettings}
                    />
                  )}
                </>
              )}

              {/* Action Buttons */}
              <div className="flex gap-4 justify-end mt-8">
                <button
                  onClick={handleReset}
                  className="px-6 py-3 bg-gray-700 text-white font-medium rounded-lg hover:bg-gray-600 transition-colors"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={handleSave}
                  className="px-6 py-3 bg-red-600 text-white font-medium rounded-lg hover:bg-red-700 transition-colors shadow-lg hover:shadow-red-500/25"
                >
                  Enregistrer les Paramètres
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <style>{`
        .slider-thumb::-webkit-slider-thumb {
          appearance: none;
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #DC2626;
          cursor: pointer;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }

        .slider-thumb::-moz-range-thumb {
          width: 20px;
          height: 20px;
          border-radius: 50%;
          background: #DC2626;
          cursor: pointer;
          border: none;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
      `}</style>
    </div>
  );
};

export default CameraSettingsPage;
