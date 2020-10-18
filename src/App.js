import React from 'react';

export default function App() {
  return (
    <div className="sm:w-screen w-11/12 sm:mx-0 mx-auto sm:h-screen sm:mt-0 mt-40 overflow-hidden flex flex-col justify-center items-center bg-gray-800">
      <div className="sm:text-6xl text-2xl font-extrabold tracking-widest font-sans flex">
        <div className="text-blue-300">Kinesis</div>
        <div className="opacity-0 mx-1">.</div>
        <div className="text-yellow-300">Connect</div>
      </div>
      <div className="sm:text-2xl sm:mt-0 mt-2 text-lg font-bold text-center text-indigo-200 tracking-wide font-sans">
        A complete social media. Still in Development.
        <br />
        <div className="flex justify-center sm:mt-2 mt-4 text-blue-300 sm:text-lg text-sm">
          Planned Release Date:
          <p className="ml-2 text-green-300">15 November 2020</p>
        </div>
      </div>
    </div>
  );
}
