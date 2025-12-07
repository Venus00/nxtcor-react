"use client"

import React from 'react';

interface PTZControlProps {
  onDirectionControl: (direction: 'up' | 'down' | 'left' | 'right' | 'center') => void;
  onZoomControl: (action: 'in' | 'out') => void;
  onFocusControl: (action: 'near' | 'far') => void;
  onApertureControl: (action: 'open' | 'close') => void;
}

const PTZControl: React.FC<PTZControlProps> = ({
  onDirectionControl,
  onZoomControl,
  onFocusControl,
  onApertureControl,
}) => {
  return (
    <div className="space-y-2">
      {/* Direction Controls */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-xs">
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
          </svg>
          Direction
        </h3>

        <div className="flex items-center justify-center">
          <div className="relative w-32 h-32">
            {/* Up Arrow */}
            <button
              onMouseDown={() => onDirectionControl('up')}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-b from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 4l-8 8h5v8h6v-8h5z" />
              </svg>
            </button>

            {/* Left Arrow */}
            <button
              onMouseDown={() => onDirectionControl('left')}
              className="absolute top-1/2 left-0 -translate-y-1/2 w-10 h-10 bg-gradient-to-r from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M4 12l8-8v5h8v6h-8v5z" />
              </svg>
            </button>

            {/* Center Button */}
            <button
              onClick={() => onDirectionControl('center')}
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-gradient-to-br from-gray-700 to-gray-900 hover:from-red-600 hover:to-red-800 rounded-full border-2 border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group"
            >
              <svg className="w-4 h-4 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <circle cx="12" cy="12" r="4" />
              </svg>
            </button>

            {/* Right Arrow */}
            <button
              onMouseDown={() => onDirectionControl('right')}
              className="absolute top-1/2 right-0 -translate-y-1/2 w-10 h-10 bg-gradient-to-l from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M20 12l-8 8v-5H4V9h8V4z" />
              </svg>
            </button>

            {/* Down Arrow */}
            <button
              onMouseDown={() => onDirectionControl('down')}
              className="absolute bottom-0 left-1/2 -translate-x-1/2 w-10 h-10 bg-gradient-to-t from-gray-700 to-gray-800 hover:from-red-600 hover:to-red-700 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center group"
            >
              <svg className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 20l8-8h-5V4H9v8H4z" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Zoom Controls */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-xs">
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
          </svg>
          Zoom
        </h3>
        <div className="flex gap-2">
          <button
            onMouseDown={() => onZoomControl('in')}
            className="flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
            </svg>
            <span className="font-medium">In</span>
          </button>
          <button
            onMouseDown={() => onZoomControl('out')}
            className="flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM13 10H7" />
            </svg>
            <span className="font-medium">Out</span>
          </button>
        </div>
      </div>

      {/* Focus Controls */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-xs">
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          Focus
        </h3>
        <div className="flex gap-2">
          <button
            onMouseDown={() => onFocusControl('near')}
            className="flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="font-medium">Near</span>
          </button>
          <button
            onMouseDown={() => onFocusControl('far')}
            className="flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm"
          >
            <span className="font-medium">Far</span>
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>
      </div>

      {/* Aperture Controls */}
      <div className="bg-black/70 backdrop-blur-sm rounded-lg p-3 border border-gray-700/50 shadow-lg">
        <h3 className="text-white font-medium mb-2 flex items-center gap-2 text-xs">
          <svg className="w-3.5 h-3.5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
          Aperture
        </h3>
        <div className="flex gap-2">
          <button
            onMouseDown={() => onApertureControl('open')}
            className="flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span className="font-medium">Open</span>
          </button>
          <button
            onMouseDown={() => onApertureControl('close')}
            className="flex-1 bg-gradient-to-r from-gray-700/90 to-gray-800/90 hover:from-red-600 hover:to-red-700 text-white py-2 px-3 rounded-lg border border-gray-600 hover:border-red-500 transition-all duration-200 shadow-lg hover:shadow-red-500/50 flex items-center justify-center gap-2 group text-sm"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
            <span className="font-medium">Close</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default PTZControl;
