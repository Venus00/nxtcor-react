import { Link, useLocation, useNavigate } from "react-router-dom"
import { Thermometer, Camera, Play, Settings, ChevronDown, LogOut, Shield, BarChart3, Sliders } from "lucide-react"
import { useState, useRef, useEffect } from "react"

const Navbar = () => {
  const location = useLocation()
  const [isPopoverOpen, setIsPopoverOpen] = useState(false)
  const navigate = useNavigate();

  const popoverRef = useRef<HTMLDivElement>(null)

  const isActive = (path: string) => location.pathname === path

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setIsPopoverOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("isAuthenticated");
    navigate("/login");
  };

  const handleSecurity = () => {
    console.log('Security clicked')
    setIsPopoverOpen(false)
  }

  return (

    <nav className="bg-black backdrop-blur-sm shadow-2xl relative z-[100] border rounded-xl  ">
      <div className="flex items-center justify-between mx-auto px-8 py-4">
        <div className="relative">
          <img src="/assets/logoNav.png" className="h-10 transition-transform group-hover:scale-105" alt="NEXTCOR Logo" />
        </div>

        <div className="flex items-center">
          <ul className="flex items-center space-x-6">
            <li>
              <Link
                to="/live/cam1"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/live/cam1")
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
              >
                <Thermometer className="h-4 w-4" />
                Thermique
              </Link>
            </li>

            {/* Caméra Normale */}
            <li>
              <Link
                to="/live/cam2"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/live/cam2")
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
              >
                <Camera className="h-4 w-4" />
                Optique
              </Link>
            </li>

            <li>
              <Link
                to="/analytics"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/analytics")
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
              >
                <BarChart3 className="h-4 w-4" />
                Analytics
              </Link>
            </li>




            {/* Playback */}
            <li>
              <Link
                to="/playback"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/playback")
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
              >
                <Play className="h-4 w-4" />
                Playback
              </Link>
            </li>

            {/* Configuration */}
            {/* <li>
              <Link
                to="/configuration"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/configuration")
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
              >
                <Settings className="h-4 w-4" />
                Configuration
              </Link>
            </li> */}

            {/* Camera Settings */}
            <li>
              <Link
                to="/camera-settings"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/camera-settings")
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
              >
                <Sliders className="h-4 w-4" />
                Paramètres de la Caméra Optique
              </Link>
            </li>

            {/* PTZ Settings */}
            <li>
              <Link
                to="/ptz-settings"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/ptz-settings")
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16V4m0 0L3 8m4-4l4 4m6 0v12m0 0l4-4m-4 4l-4-4" />
                </svg>
                Paramètres PTZ
              </Link>
            </li>

            {/* Events Management */}
            <li>
              <Link
                to="/events-management"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${isActive("/events-management")
                  ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                  : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                  }`}
              >
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                Événements
              </Link>
            </li>
          </ul>
        </div>

        {/* Popover Menu */}
        <div className="flex items-center space-x-4 relative z-[10000]">
          <div className="relative" ref={popoverRef}>
            <button
              onClick={() => setIsPopoverOpen(!isPopoverOpen)}
              className="flex items-center gap-3 px-5 py-2.5 bg-gradient-to-r from-slate-800/60 to-slate-800/40 rounded-xl border border-slate-600/50 hover:border-slate-500/60 hover:from-slate-700/60 hover:to-slate-700/40 transition-all duration-300 cursor-pointer group shadow-lg shadow-black/20"
            >
              <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50 ring-2 ring-green-500/20"></div>
              <span className="text-sm text-slate-200 font-semibold tracking-wide">Live</span>
              <ChevronDown
                className={`h-4 w-4 text-slate-400 group-hover:text-slate-300 transition-all duration-300 ${isPopoverOpen ? 'rotate-180 text-slate-300' : ''
                  }`}
              />
            </button>

            {isPopoverOpen && (
              <div className="absolute right-0 top-full mt-3 w-56 z-[9999]">
                <div className="absolute -top-2 right-4 w-4 h-4 bg-slate-800 border-l border-t border-slate-600/50 rotate-45"></div>

                <div className="bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-600/50 rounded-xl shadow-2xl shadow-black/40 backdrop-blur-sm overflow-hidden">
                  <div className="px-4 py-3 bg-gradient-to-r from-slate-700/30 to-slate-800/30 border-b border-slate-600/30">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
                      <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">System Status</span>
                    </div>
                  </div>

                  <div className="py-2">
                    <button
                      onClick={handleSecurity}
                      className="group flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-300 hover:text-white hover:bg-gradient-to-r hover:from-blue-600/20 hover:to-blue-700/20 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-500/0 to-blue-600/0 group-hover:from-blue-500/10 group-hover:to-blue-600/10 transition-all duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <div className="p-1.5 bg-blue-500/20 group-hover:bg-blue-500/30 rounded-lg transition-all duration-300">
                          <Shield className="h-4 w-4 text-blue-400 group-hover:text-blue-300" />
                        </div>
                        <span>Security Settings</span>
                      </div>
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-1 h-4 bg-gradient-to-b from-blue-400 to-blue-600 rounded-full"></div>
                      </div>
                    </button>

                    <div className="mx-4 my-1 h-px bg-gradient-to-r from-transparent via-slate-600/30 to-transparent"></div>

                    <button
                      onClick={handleLogout}
                      className="group flex items-center gap-3 w-full px-4 py-3 text-sm font-medium text-slate-300 hover:text-red-200 hover:bg-gradient-to-r hover:from-red-600/20 hover:to-red-700/20 transition-all duration-300 relative overflow-hidden"
                    >
                      <div className="absolute inset-0 bg-gradient-to-r from-red-500/0 to-red-600/0 group-hover:from-red-500/10 group-hover:to-red-600/10 transition-all duration-300"></div>
                      <div className="relative flex items-center gap-3">
                        <div className="p-1.5 bg-red-500/20 group-hover:bg-red-500/30 rounded-lg transition-all duration-300">
                          <LogOut className="h-4 w-4 text-red-400 group-hover:text-red-300" />
                        </div>
                        <span>Sign Out</span>
                      </div>
                      <div className="absolute right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                        <div className="w-1 h-4 bg-gradient-to-b from-red-400 to-red-600 rounded-full"></div>
                      </div>
                    </button>
                  </div>


                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar