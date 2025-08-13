import  { useState } from 'react';
import Recording from './storage/Recording';



// import User_Management from './general/User_Management';

const Storage = () => {
  const [activeTab, setActiveTab] = useState('Recording Schedule');

  const tabs = [
    { name: 'Recording Schedule', content: <Recording /> },
  ];

  return (
    <div>
      <div className="mb-4 ">
        <ul
          className="flex  space-x-6 text-xl text-center "
          role="tablist"
        >
          {tabs.map((tab) => (
            <li className="me-2" role="presentation" key={tab.name}>
              <button
                className={`inline-block p-4  rounded-t-lg ${
                  activeTab === tab.name
                    ? 'text-black border-black border-b-2'
                    : 'text-gray-500 hover:text-gray-600 hover:border-gray-300 '
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
            className={`p-4 rounded-lg   ${
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

export default Storage;
