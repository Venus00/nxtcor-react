import { useState } from 'react';
import NetworkAccess from './network/Network';
// import Port from './network/Port';
import Rtmp from './network/Rtmp';
import Rtsp from './network/Rtsp';

const Network = () => {
  const [activeTab, setActiveTab] = useState('Network access');

  const tabs = [
    { name: 'Network access', content: <NetworkAccess /> },
    { name: 'RTSP', content: <Rtsp /> },
    { name: 'RTMP', content: <Rtmp /> }
  ];

  return (
    <div className="bg-white text-black flex flex-col ">
      <div className="mb-2 flex-shrink-0">
        <ul
          className="flex space-x-4 text-base text-center border-b border-gray-200"
          role="tablist"
        >
          {tabs.map((tab) => (
            <li className="me-2" role="presentation" key={tab.name}>
              <button
                className={`inline-block p-2 rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab.name
                    ? 'text-black border-blue-500 border-b-2 bg-gray-50'
                    : 'text-gray-600 hover:text-black hover:bg-gray-100 hover:border-gray-300'
                }`}
                onClick={() => setActiveTab(tab.name)}
                type="button"
                role="tab"
                aria-selected={activeTab === tab.name}
              >
                {tab.name}
              </button>
            </li>
          ))}
        </ul>
      </div>
      <div className="flex-1 overflow-auto bg-white rounded-lg p-4">
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`${activeTab === tab.name ? '' : 'hidden'}`}
            role="tabpanel"
          >
            <div>{tabs.find((tab) => tab.name === activeTab)?.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Network;