"use client"

import { useState } from "react"
import Identification from "./general/Identification"
import Date_Time from "./general/Date_Time"
// import User_Management from './general/User_Management';

const General = () => {
  const [activeTab, setActiveTab] = useState("Identification")

  const tabs = [
    { name: "Identification", content: <Identification /> },
    { name: "Date/Time", content: <Date_Time /> },
    // { name: 'User Management', content: <User_Management />}
  ]

 return (
    <div className="bg-white text-black  flex flex-col">
      <div className="mb-4 flex-shrink-0">
        <ul className="flex space-x-6 text-base text-center" role="tablist">
          {tabs.map((tab) => (
            <li className="me-2" role="presentation" key={tab.name}>
              <button
                className={`inline-block p-4 rounded-t-lg ${
                  activeTab === tab.name
                    ? "text-black border-black border-b-2"
                    : "text-gray-600 hover:text-black hover:border-gray-300"
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
      
      <div className="flex-1 overflow-hidden">
        {tabs.map((tab) => (
          <div 
            key={tab.name} 
            className={`h-full ${activeTab === tab.name ? "" : "hidden"}`} 
            role="tabpanel"
          >
            <div className="p-4 rounded-lg h-full">
              {tabs.find((tab) => tab.name === activeTab)?.content}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default General