import  { useState } from 'react';
import Recording from './storage/Recording';



// import User_Management from './general/User_Management';

const Storage = () => {
  const [activeTab, setActiveTab] = useState('Recording Schedule');

  const tabs = [
    { name: 'Recording Schedule', content: <Recording /> },
  ];

return (
    <div className="min-h-screen bg-black">
      <div className="container mx-auto px-4 py-6">
        {/* Header avec gradient subtil */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Storage Management</h1>
          <p className="text-gray-400">Manage your recordings and storage settings</p>
        </div>

        {/* Tabs Navigation */}
        <div className="mb-6 bg-gray-900 rounded-lg shadow-lg overflow-hidden">
          <ul
            className="flex space-x-0 text-lg"
            role="tablist"
          >
            {tabs.map((tab) => (
              <li className="flex-1" role="presentation" key={tab.name}>
                <button
                  className={`w-full p-4 font-medium transition-all duration-300 relative ${
                    activeTab === tab.name
                      ? 'text-white bg-gray-700 shadow-lg'
                      : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                  }`}
                  onClick={() => setActiveTab(tab.name)}
                  type="button"
                  role="tab"
                  aria-selected={activeTab === tab.name}
                >
                  {tab.name}
                  {/* Indicateur actif */}
                  {activeTab === tab.name && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-500 rounded-t-full"></div>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Contenu des tabs */}
        <div className="bg-black rounded-lg shadow-xl overflow-hidden">
          {tabs.map((tab) => (
            <div
              key={tab.name}
              className={`transition-all duration-300 ${
                activeTab === tab.name 
                  ? 'opacity-100 transform translate-y-0' 
                  : 'hidden opacity-0 transform translate-y-4'
              }`}
              role="tabpanel"
            >
              <div className="p-2">
                {tabs.find((tab) => tab.name === activeTab)?.content}
              </div>
            </div>
          ))}
        </div>

       
      </div>
    </div>
  );
};

export default Storage;
