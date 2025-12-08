"use client"

import type React from "react"
import { useState } from "react"
import VideoEncoding, { type VideoEncodingData } from "../components/encoding/VideoEncoding"

const EncodingSettingsPage: React.FC = () => {
  // Video Encoding State
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

  const [activeCategory] = useState<'video'>('video');

  const handleSave = () => {
    // TODO: Implement actual save functionality to camera API
    console.log('Saving video encoding settings:', videoSettings);
    alert('Paramètres d\'encodage enregistrés avec succès!');
  };

  const handleReset = () => {
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
  };

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="container mx-auto px-4 py-6">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-bold text-white mb-2">Paramètres d'Encodage</h1>
          <p className="text-gray-400">Configurez les paramètres d'encodage vidéo de votre caméra</p>
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
                  <div className="text-center p-4">
                    <svg className="w-12 h-12 text-gray-600 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <p className="text-xs text-gray-500">Flux vidéo</p>
                  </div>
                </div>
              </div>

              {/* Main Categories */}
              <div className="p-3">
                <h3 className="text-xs font-semibold text-gray-400 uppercase mb-2 px-2">Catégories</h3>

                {/* Video Encoding */}
                <button
                  className="w-full text-left px-3 py-3 rounded-lg mb-2 transition-all bg-red-600 text-white shadow-lg"
                >
                  <div className="flex items-center gap-3">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                    <span className="font-medium text-sm">Encodage Vidéo</span>
                  </div>
                </button>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="flex-1 min-w-0">
            <div className="bg-gray-800/30 rounded-lg border border-gray-700 p-6">

              {/* Video Encoding Section */}
              {activeCategory === 'video' && (
                <VideoEncoding
                  settings={videoSettings}
                  onSettingsChange={setVideoSettings}
                />
              )}

              {/* Action Buttons */}
              {/* <div className="flex gap-4 justify-end mt-8">
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
              </div> */}
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

export default EncodingSettingsPage;
