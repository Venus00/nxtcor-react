


const Login = () => {
    return (
    <>
        <section className="bg-gray-200 w-screen h-screen">
        <div className="flex flex-col items-center justify-center px-6 py-8 mx-auto md:h-screen lg:py-0  shadow">
            <a  className="flex items-center mb-6 text-2xl font-semibold text-gray-900 ">
                <img className="w-44  mr-2" src="public/assets/logo.svg"  alt="logo" />
                 
            </a>
            <div className="w-full bg-white rounded-lg   md:mt-0 sm:max-w-md xl:p-0 ">
                <div className="p-6 space-y-4 md:space-y-6 sm:p-8">
                    <h1 className="text-md font-bold leading-tight tracking-tight text-gray-900 md:text-2xl ">
                        Log In 
                    </h1>
                    <form className="space-y-4 md:space-y-6" action="#">
                        <div>
                            <label  className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Username</label>
                            <input name="username" id="username" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg focus:ring-red-600 focus:border-primary-600 block w-full p-2.5" placeholder="username"/>
                        </div>
                        <div>
                            <label className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">Password</label>
                            <input type="password" name="password" id="password" placeholder="••••••••" className="bg-gray-50 border border-gray-300 text-gray-900 rounded-lg  block w-full p-2.5" />
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-start">
                                <div className="flex items-center h-5">
                                  <input id="remember" aria-describedby="remember" type="checkbox" className="w-4 h-4 border border-gray-300 rounded bg-gray-50 focus:ring-3 focus:ring-primary-300" />
                                </div>
                                <div className="ml-3 text-sm">
                                  <label  className="text-gray-600 dark:text-gray-300">Show Password</label>
                                </div>
                            </div>
                        </div>
                        <button type="submit" className="w-full text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center  bg-black">Log in</button>
                      
                    </form>
                </div>
            </div>
        </div>
      </section></>
      )
}

export default Login;
