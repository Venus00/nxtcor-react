import React from 'react';
import General from '../components/configuration/General';
import Security from '../components/configuration/Security';
import CameraComponent from '../components/configuration/Camera';
import NetworkComponent from '../components/configuration/Network';
import Events from '../components/configuration/Events';
import Storage from '../components/configuration/Storage';
import Analytics from '../components/configuration/Analytics';
import Sidebar from '../components/configuration/Sidebar';

interface ConfigurationProps {
  activeConfigTab: string;
  setActiveConfigTab: (tab: string) => void;
}

const Configuration: React.FC<ConfigurationProps> = ({ activeConfigTab, setActiveConfigTab }) => {
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
    <div className="flex h-[calc(100vh-5rem)] bg-gray-200">
      <Sidebar 
        activeConfigTab={activeConfigTab}
        setActiveConfigTab={setActiveConfigTab}
      />

      {/* Contenu principal sans overflow */}
      <div className="flex-1 h-[calc(100vh-5rem)]">
        <div className="p-6 h-full bg-gray-100">
          <div className="bg-white rounded-lg shadow-sm h-full">
            <div className="p-6 h-full">
              {configComponents[activeConfigTab as keyof typeof configComponents]}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Configuration;