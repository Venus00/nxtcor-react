import { Link, useLocation } from "react-router-dom"
import { Thermometer, Camera, Play, Settings } from "lucide-react"

const Navbar = () => {
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path

  return (
    <nav className="bg-black backdrop-blur-sm  shadow-2xl">
      <div className="flex items-center justify-between mx-auto px-8 py-4">
        {/* Logo */}
        <Link to="/live" className="flex items-center space-x-3 group">
          <div className="relative">
            <img src="assets/logo.svg" className="h-10 transition-transform group-hover:scale-105" alt="NEXTCOR Logo" />
            <div className="absolute inset-0 bg-gradient-to-r from-blue-500/20 to-blue-500/20 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity blur-xl"></div>
          </div>
        </Link>

        {/* Navigation Links */}
        <div className="flex items-center">
          <ul className="flex items-center space-x-6">
            {/* Caméra Thermique */}
            <li>
              <Link
                to="/live"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive("/live")
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
                to="/live"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive("/live")
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                }`}
              >
                <Camera className="h-4 w-4" />
                Normale
              </Link>
            </li>

            {/* Playback */}
            <li>
              <Link
                to="/playback"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive("/playback")
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                }`}
              >
                <Play className="h-4 w-4" />
                Playback
              </Link>
            </li>

            {/* Configuration */}
            <li>
              <Link
                to="/configuration"
                className={`flex items-center gap-3 px-6 py-3 rounded-lg font-medium text-sm transition-all duration-200 ${
                  isActive("/configuration")
                    ? "bg-gradient-to-r from-red-600 to-red-700 text-white shadow-lg shadow-red-500/25 border border-red-500/50"
                    : "text-slate-300 hover:text-white hover:bg-slate-800/60 border border-transparent hover:border-slate-600/50"
                }`}
              >
                <Settings className="h-4 w-4" />
                Configuration
              </Link>
            </li>
          </ul>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center gap-3 px-4 py-2 bg-slate-800/50 rounded-lg border border-slate-700/50">
            <div className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse shadow-lg shadow-green-500/50"></div>
            <span className="text-sm text-slate-300 font-medium">Live</span>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Navbar
