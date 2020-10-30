import React from 'react';

import background from '../Assets/images/4048243.jpg';
import logo from '../Assets/images/logo.png';

export default function LoginForm() {
  return (
    <div className="w-screen h-screen overflow-hidden flex justify-center items-center">
      <img src={background} alt="Background" className="fixed bg-fixed z-0" />
      <div className="sm:w-2/3 sm:h-3/4 w-5/6 bg-gray-600 rounded-lg z-50 opacity-95 shadow-lg flex sm:flex-row flex-col">
        <div className="h-full w-1/2 bg-gray-600 rounded-l-lg flex flex-col justify-center items-center border-r-4 border-gray-800">
          <div className="w-full mb-4 font-bold tracking-wider text-4xl uppercase text-blue-900 flex justify-center">
            Kinesis <p className="ml-2 text-blue-300">Connect</p>
          </div>
          <img src={logo} alt="Logo" className="w-1/2 object-scale-down" />
        </div>
        <div className="h-full w-1/2 bg-gray-800 rounded-r-lg border-l-4 border-gray-600 flex flex-col justify-center">
          <div className="w-5/6 mx-auto">
            <div className="font-bold tracking-wide text-white text-4xl">
              Login
            </div>
            <input
              type="text"
              placeholder="Enter Username..."
              className="w-full p-2 text-gray-100 bg-gray-700 rounded-lg my-4"
            />
            <input
              type="password"
              placeholder="Enter Password..."
              className="w-full p-2 text-gray-100 bg-gray-700 rounded-lg mb-4"
            />
            <button
              className="p-2 rounded-lg bg-gray-900 uppercase tracking-wide font-bold text-lg hover:bg-blue-600 focus:bg-blue-600 text-gray-300 w-1/3"
              onClick={() => null}
            >
              Let's Go!
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
