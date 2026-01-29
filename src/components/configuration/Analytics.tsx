"use client";

import type React from "react";
import { useState } from "react";
import { Target, Shield } from "lucide-react";
import ObjectDetection from "./ObjectDetection";
import IntrusionDetection from "./IntrusionDetection";

const Analytics: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'detection' | 'intrusion'>('detection');

  return (
    <div className="h-full bg-black flex flex-col">
      {/* Tabs Header */}
      <div className="bg-slate-900 border-b border-slate-700 px-4">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveTab('detection')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === 'detection'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Target className="w-5 h-5" />
            Object Detection
          </button>
          <button
            onClick={() => setActiveTab('intrusion')}
            className={`flex items-center gap-2 px-6 py-3 font-medium transition-all ${activeTab === 'intrusion'
              ? 'text-white border-b-2 border-blue-500'
              : 'text-slate-400 hover:text-white'
              }`}
          >
            <Shield className="w-5 h-5" />
            Intrusion Detection
          </button>
        </div>
      </div>

      {/* Tab Content */}
      <div className="flex-1 overflow-hidden">
        {activeTab === 'detection' ? <ObjectDetection /> : <IntrusionDetection />}
      </div>
    </div>
  );
};

export default Analytics;
