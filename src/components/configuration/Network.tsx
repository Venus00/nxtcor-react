import  { useState } from 'react';
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
    <div className='bg-black text-white p-6 rounded-lg h-[calc(100vh-5rem)]'>
      <div className="mb-6">
        <ul
          className="flex space-x-6 text-lg text-center border-b border-gray-700"
          role="tablist"
        >
          {tabs.map((tab) => (
            <li className="me-2" role="presentation" key={tab.name}>
              <button
                className={`inline-block p-4 rounded-t-lg transition-colors duration-200 ${
                  activeTab === tab.name
                    ? 'text-white border-blue-500 border-b-2 bg-gray-800'
                    : 'text-gray-400 hover:text-gray-200 hover:border-gray-500 hover:bg-gray-800/50'
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
      <div>
        {tabs.map((tab) => (
          <div
            key={tab.name}
            className={`p-6 rounded-lg h-[calc(100vh-12rem)] overflow-y-hidden bg-black ${
              activeTab === tab.name ? '' : 'hidden'
            }`}
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
