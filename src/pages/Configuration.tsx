import React from 'react';
import General from '../components/configuration/General';
import Security from '../components/configuration/Security';
import CameraComponent from '../components/configuration/Camera';
import NetworkComponent from '../components/configuration/Network';
import Events from '../components/configuration/Events';
import Storage from '../components/configuration/Storage';
import Analytics from '../components/configuration/Analytics';

interface ConfigurationProps {
  activeConfigTab: string;
  setActiveConfigTab: (tab: string) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({ activeConfigTab }) => {
  const configComponents = {
    General: <General />,
    Analytics: <Analytics />,
    Camera: <CameraComponent />,
    Network: <NetworkComponent />,
    Storage: <Storage />,
    Events: <Events />,
    Security: <Security />,
  }

  return (
    <div className="p-6 h-full bg-black text-white">
      {/* <div className="mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">Configuration</h1>
        <p className="text-white">
          Gérez les paramètres de votre système de surveillance
        </p>
      </div>

      <div className="mb-6">
        <nav className="text-sm text-white">
          Configuration / <span className="text-red-600 font-medium">{activeConfigTab}</span>
        </nav>
      </div> */}

      <div className="bg-black rounded-lg shadow-sm border border-gray-950 min-h-[calc(100vh-12rem)]">
        <div className="p-6">
          {/* <h2 className="text-xl font-semibold text-white mb-4 border-b border-gray-950 pb-2">
            {activeConfigTab}
          </h2> */}
          {configComponents[activeConfigTab as keyof typeof configComponents]}
        </div>
      </div>
    </div>
  )
}

export default Configuration;