
import { Link, useLocation } from 'react-router-dom';

const Navbar= () => {

  const location = useLocation();


  const isActive = (path: string) => location.pathname === path;

  return (
    <nav className="bg-gray-900 border-gray-200  rounded-xl">
      <div className="flex flex-wrap bg-red- 500items-center justify-between mx-auto p-2 ">
        
        {/* Logo */}
        <a href="live" className="flex items-center space-x-3 rtl:space-x-reverse">
          <img
            src="assets/logo.svg"
            className="h-8"
            alt="NEXTCOR Logo"
          />
        </a>

   

        {/* Navigation Links */}
        <div
          className={` w-full md:block md:w-auto `}
          id="navbar-default"
        >
          <ul className="  flex flex-col p-4 md:p-0 mt-4 border border-gray-500 rounded-lg md:flex-row md:space-x-8 rtl:space-x-reverse md:mt-0 md:border-0  ">
            <li className=''>
              <Link
                to="live"
                className={`flex   items-center text-xl  gap-2 py-2 px-3 rounded ${
                 ( isActive('/') ||  isActive('/live')  )? 'text-white md:bg-transparent md:text-blue-500' : 'text-white  hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 '
                }`}
            
              >
                <img src="assets/live.png" className='h-6 w-6'/>
                Live
              </Link>
            </li>
            {/* <li>
              <Link
                to="/playback"
                className={`flex flex-row text-xl   gap-2 py-2 px-3 rounded ${
                  isActive('/playback') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700' : 'text-white hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'
                }`}
              >
                 <img src="assets/playback.png" className='w-10 h-8'/>
                Playback
              </Link>
            </li> */}
            <li className='flex items-center'>
              <Link
                to="/configuration"
                className={`flex  items-center text-xl  gap-2 py-2 px-3 rounded ${
                  isActive('/configuration') ? 'text-white bg-blue-700 md:bg-transparent md:text-blue-700' : 'text-white hover:bg-gray-100 md:hover:bg-transparent md:border-0 md:hover:text-blue-700 dark:text-white md:dark:hover:text-blue-500 dark:hover:bg-gray-700 dark:hover:text-white md:dark:hover:bg-transparent'
                }`}
              >
                 <img src="assets/configuration.png" className='h-6 w-6' />
                 Configuration
              </Link>
            </li>
          </ul>
        </div>

        {/* Logout Button */}
        <button
          type="button"
          className="text-white bg-red-700 hover:bg-red-00 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-4 py-2 text-center dark:bg-red-500 dark:hover:bg-red-600 dark:focus:ring-red-800"
        >
          Logout
        </button>
      </div>
    </nav>
  );
};

export default Navbar;
