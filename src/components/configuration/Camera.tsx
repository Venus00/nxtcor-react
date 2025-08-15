import  { useState } from 'react';
import Video from './camera/Video';
import Audio from './camera/Audio';
import Image from './camera/Image';
import Display from './camera/Display';

const Camera = () => {
  const [activeTab, setActiveTab] = useState("Video")

  const tabs = [
    { name: "Video", content: <Video /> },
    { name: "Audio", content: <Audio /> },
    { name: "Image", content: <Image /> },
    { name: "Display", content: <Display /> },
  ]

  return (
    <div className="bg-black h-[calc(100vh-4rem)] ">
      <div className="mb-4">
        <ul className="flex space-x-6 text-xl text-center border-b border-gray-700" role="tablist">
          {tabs.map((tab) => (
            <li className="me-2" role="presentation" key={tab.name}>
              <button
                className={`inline-block p-4 rounded-t-lg transition-colors ${
                  activeTab === tab.name
                    ? "text-white border-blue-500 border-b-2 bg-gray-800"
                    : "text-gray-400 hover:text-gray-200 hover:border-gray-500 hover:bg-gray-900"
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
      <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
        {tabs.map((tab) => (
          <div key={tab.name} className={`${activeTab === tab.name ? "" : "hidden"}`} role="tabpanel">
            <div>{tabs.find((tab) => tab.name === activeTab)?.content}</div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default Camera
