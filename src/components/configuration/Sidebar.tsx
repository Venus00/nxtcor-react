import React, { useState, useEffect } from 'react';
import {  Events } from './Content';
import General from './General';
import Security from './Security';
import Camera from './Camera';
import Network from './Network'

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState('General');
  const [windowWidth, setWindowWidth] = useState(window.innerWidth);

  const tabs = [
    { name: 'General', activeImg: 'assets/GeneralActive.png', img: 'assets/General.png', content: <General /> },
    { name: 'Camera', activeImg: 'assets/CameraActive.png', img: 'assets/Camera.png', content: <Camera /> },
    { name: 'Network', activeImg: 'assets/NetworkActive.png', img: 'assets/Network.png', content: <Network /> },
    { name: 'Events', activeImg: 'assets/EventsActive.png', img: 'assets/Events.png', content: <Events /> },
    { name: 'Security', activeImg: 'assets/SecurityActive.png', img: 'assets/Security.png', content: <Security /> }
  ];

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  const sidebarWidthClass = windowWidth >= 1024 ? 'w-1/6' : windowWidth >= 768 ? 'w-1/4' : 'w-1/2';

  return (
    <>
      <div className={`${sidebarWidthClass} h-[calc(100vh-8rem)] rounded-[16px] p-[16px] flex flex-col bg-white shadow  `}>
        <ul className="flex flex-col space-y-6 text-xs  text-gray-900">
          {tabs.map((tab) => (
            <li key={tab.name}>
              <a
                href="#"
                onClick={() => setActiveTab(tab.name)}
                className={`inline-flex items-center px-4 py-3 text-[20px] rounded-lg w-full ${tab.name === activeTab ? 'text-red-700' : 'hover:text-gray-500'}`}
                aria-current={tab.name === activeTab ? 'page' : undefined}
              >
                <img
                  src={tab.name === activeTab ? tab.activeImg : tab.img}
                  alt={`${tab.name} icon`}
                  className="w-[24px] h-[24px] me-2"
                />
                {tab.name}
              </a>
            </li>
          ))}
        </ul>
      </div>

      <div className="text-medium text-gray-500 w-full pl-4 bg-white shadow rounded-[16px]  ">
        <div>{tabs.find((tab) => tab.name === activeTab)?.content}</div>
      </div>
    </>
  );
};

export default Sidebar;
