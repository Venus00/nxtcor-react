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
  Thermometer,
  Play,
  Video,
} from "lucide-react"
import { useNavigate, useLocation } from "react-router-dom"

interface SidebarProps {
  activeConfigTab?: string;
  setActiveConfigTab?: (tab: string) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ activeConfigTab, setActiveConfigTab }) => {
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1024
  )
  const navigate = useNavigate()
  const location = useLocation()



  const configTabs = [
    { name: "General", icon: Settings },
    { name: "Camera", icon: CameraIcon },
    { name: "Network", icon: NetworkIcon },
    { name: "Storage", icon: HardDrive },
    { name: "Events", icon: Calendar },
    { name: "Security", icon: Shield },
  ]

  const isConfigurationPage = location.pathname === "/configuration"

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated")
    navigate("/login")
  }

  const handleNavigation = (path: string) => {
    navigate(path)
  }

  const handleConfigTabClick = (tabName: string) => {
    if (setActiveConfigTab) {
      setActiveConfigTab(tabName)
    }
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
    if (windowWidth >= 1024) return "w-64"
    if (windowWidth >= 768) return "w-56"
    return "w-48"
  }

  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed)
  }

  const isActivePath = (path: string) => {
    if (path === "/live") {
      return location.pathname === "/live" || location.pathname.startsWith("/live/")
    }
    return location.pathname === path
  }

  return (
    <div
      className={`${getSidebarWidth()} h-[calc(100vh-5rem)] flex flex-col justify-between bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out relative   rounded-xl`}
    >
      <button
        onClick={toggleSidebar}
        className="absolute -right-3 top-4 bg-gray-100 border border-gray-300 rounded-full p-1 shadow-md hover:bg-gray-200 transition-colors z-10"
      >
        {isCollapsed ? (
          <ChevronRight className="w-4 h-4 text-gray-600" />
        ) : (
          <ChevronLeft className="w-4 h-4 text-gray-600" />
        )}
      </button>

      <div className="flex flex-col mt-4 flex-1">
     

      

        {isConfigurationPage && (
          <div className="mt-6">
            <div className="px-4 py-2">
              {!isCollapsed && (
                <h2 className="text-sm font-semibold text-gray-600 uppercase tracking-wider">
                  Settings
                </h2>
              )}
            </div>

            <ul className="flex flex-col space-y-2 text-sm text-gray-700 px-2">
              {configTabs.map((tab) => {
                const IconComponent = tab.icon
                const isActiveTab = activeConfigTab === tab.name

                return (
                  <li key={tab.name}>
                    <button
                      onClick={() => handleConfigTabClick(tab.name)}
                      className={`inline-flex items-center px-3 py-2 text-sm rounded-lg w-full transition-colors ${
                        isActiveTab
                          ? "text-red-600 bg-gray-100 border-l-2 border-blue-600"
                          : "hover:bg-gray-100"
                      }`}
                      title={isCollapsed ? tab.name : undefined}
                    >
                      <IconComponent
                        className={`w-5 h-5 ${isCollapsed ? "" : "me-3"} flex-shrink-0`}
                      />
                      {!isCollapsed && (
                        <span className="transition-opacity duration-300">
                          {tab.name}
                        </span>
                      )}
                    </button>
                  </li>
                )
              })}
            </ul>
          </div>
        )}
      </div>

      {/* <div className="border-t border-gray-200 pt-4 px-2">
        <button
          onClick={handleLogout}
          className="flex items-center justify-center lg:justify-start px-3 py-3 text-sm text-red-500 rounded-lg w-full hover:bg-gray-100 transition-colors"
        >
          <LogOut className="w-5 h-5 flex-shrink-0" />
          {!isCollapsed && <span className="ml-3">Sign out</span>}
        </button>
      </div> */}
    </div>
  )
}

export default Sidebar