import React, { useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './Navbar';
import Sidebar from './configuration/Sidebar';
import Live from '../pages/Live';
import Playback from '../pages/playback';
import Configuration from '../pages/Configuration';
import Analytics from './configuration/Analytics';

const MainLayout: React.FC = () => {
  const [activeConfigTab, setActiveConfigTab] = useState("General");

  return (
    <div className="h-screen w-full flex flex-col bg-gray-100">
      <Navbar />
      
      <div className="flex flex-1 overflow-hidden ">
        {/* <Sidebar 
          activeConfigTab={activeConfigTab}
          setActiveConfigTab={setActiveConfigTab}
        /> */}
        
        <div className="flex-1 overflow-auto   ">
          <Routes>
            <Route path="/live/:id" element={<Live />} />
            <Route path="/live" element={<Live />} />
            <Route path="/playback" element={<Playback />} />
            <Route 
              path="/configuration" 
              element={
                <Configuration 
                  activeConfigTab={activeConfigTab}
                  setActiveConfigTab={setActiveConfigTab}
                />
              } 
            />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/" element={<Navigate to="/live" replace />} />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default MainLayout;