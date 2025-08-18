import { useState } from 'react';
import Authentification from './security/Authentification';
import Rebooting from './security/Rebooting';

// import Security_Service from './security/Security_Service';

const Security = () => {
  const [activeTab, setActiveTab] = useState('Authentification');

  const tabs = [
    { name: 'Authentification', content: <Authentification /> },
    { name: 'Reboot', content: <Rebooting /> }
  ];

  return (
    <div className='bg-black text-white h-[calc(100vh-4rem)] '>
      <div className="mb-4 ">
        <ul
          className="flex  space-x-6 text-xl text-center "
          role="tablist"
        >
          {tabs.map((tab) => (
            <li className="me-2" role="presentation" key={tab.name}>
              <button
                className={`inline-block p-4  rounded-t-lg ${activeTab === tab.name
                  ? 'text-white border-black border-b-2'
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
            className={`p-4 ml-3 rounded-lg bg-gray-800 w-[900px]  ${activeTab === tab.name ? '' : 'hidden'
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

export default Security;
