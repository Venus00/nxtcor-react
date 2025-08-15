"use client"

import type React from "react"
import { useState, useEffect } from "react"
import {
  Settings,
  CameraIcon,
  NetworkIcon,
  HardDrive,
  Calendar,
  Shield,
  BarChart3,
  ChevronLeft,
  ChevronRight,
  LogOut,
} from "lucide-react"
import General from "./General"
import Security from "./Security"
import CameraComponent from "./Camera"
import NetworkComponent from "./Network"
import Events from "./Events"
import Storage from "./Storage"
import Analytics from "./Analytics"
import { useNavigate } from "react-router-dom"

const Sidebar: React.FC = () => {
  const [activeTab, setActiveTab] = useState("General")
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  )
  const navigate = useNavigate()

  const tabs = [
    { name: "General", icon: Settings, content: <General /> },
    { name: "Analytics", icon: BarChart3, content: <Analytics /> },
    { name: "Camera", icon: CameraIcon, content: <CameraComponent /> },
    { name: "Network", icon: NetworkIcon, content: <NetworkComponent /> },
    { name: "Storage", icon: HardDrive, content: <Storage /> },
    { name: "Events", icon: Calendar, content: <Events /> },
    { name: "Security", icon: Shield, content: <Security /> },
  ]

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    navigate("/login")
  }

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth)
    }
    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize)
      return () => {
        window.removeEventListener("resize", handleResize)
      }
    }
  }, [])

  const getSidebarWidth = () => {
    if (isCollapsed) return "w-16"
    if (windowWidth >= 1024) return "w-1/6"
    if (windowWidth >= 768) return "w-1/4"
    return "w-1/2"
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  return (
    <>
      <div
        className={`${getSidebarWidth()} h-[calc(100vh-8rem)] rounded-[16px] p-[16px] flex flex-col justify-between bg-white shadow border-2 transition-all duration-300 ease-in-out relative`}
      >
        <button
          onClick={toggleSidebar}
          className="absolute -right-3 top-4 bg-white border-2 rounded-full p-1 shadow-md hover:bg-gray-50 transition-colors z-10"
        >
          {isCollapsed ? (
            <ChevronRight className="w-4 h-4 text-gray-600" />
          ) : (
            <ChevronLeft className="w-4 h-4 text-gray-600" />
          )}
        </button>

        <ul className="flex flex-col space-y-6 text-xs text-gray-900 mt-4 flex-1">
          {tabs.map((tab) => {
            const IconComponent = tab.icon
            return (
              <li key={tab.name}>
                <a
                  href="#"
                  onClick={() => setActiveTab(tab.name)}
                  className={`inline-flex items-center px-4 py-3 text-[20px] rounded-lg w-full transition-colors ${
                    tab.name === activeTab
                      ? "text-red-700 bg-red-50"
                      : "hover:text-gray-500 hover:bg-gray-50"
                  }`}
                  aria-current={tab.name === activeTab ? "page" : undefined}
                  title={isCollapsed ? tab.name : undefined}
                >
                  <IconComponent
                    className={`w-[24px] h-[24px] ${isCollapsed ? "" : "me-2"} flex-shrink-0`}
                  />
                  {!isCollapsed && (
                    <span className="transition-opacity duration-300">
                      {tab.name}
                    </span>
                  )}
                </a>
              </li>
            )
          })}
        </ul>

<div className="border-t pt-4">
  <button
    onClick={handleLogout}
    className="flex items-center justify-center lg:justify-start px-4 py-3 text-[20px] text-red-600 rounded-lg w-full hover:bg-red-50 transition-colors"
  >
    <LogOut className="w-[24px] h-[24px] flex-shrink-0" />
    {!isCollapsed && <span className="ml-2">Sign out</span>}
  </button>
</div>

      </div>

      <div
        className={`text-medium text-gray-500 bg-white shadow rounded-[16px] border-2 transition-all duration-300 ease-in-out ml-4 flex-1`}
      >
        <div className="p-4">
          {tabs.find((tab) => tab.name === activeTab)?.content}
        </div>
      </div>
    </>
  )
}

export default Sidebar
