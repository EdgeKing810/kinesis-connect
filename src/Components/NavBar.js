import React, { useState } from 'react';
import { useHistory, useLocation } from 'react-router-dom';

import useWindowSize from './useWindowSize';

export default function NavBar() {
  const [showMenu, setShowMenu] = useState(false);

  const { pathname } = useLocation();
  const history = useHistory();

  const { width } = useWindowSize();

  const buttonsToMake = [
    { name: 'Feed', path: '/feed', icon: 'article' },
    { name: 'Create a post', path: '/post/create', icon: 'add-box' },
    { name: 'Discover', path: '/discover', icon: 'eye-2' },
    { name: 'Chats', path: '/chat', icon: 'message-2' },
    { name: 'My Profile', path: '/profile', icon: 'account-box' },
  ];

  const navButtons = buttonsToMake.map(({ path, icon }, i) => (
    <button
      className="sm:w-20 sm:h-20 w-16 h-16 mx-2"
      key={`nav-${i}`}
      onClick={() => (pathname === path ? null : history.push(path))}
    >
      <div
        className={`ri-${icon}-${
          pathname === path ? 'fill' : 'line'
        } w-full h-full flex justify-center items-center rounded p-2 sm:text-4xl text-2xl bg-gray-${
          pathname === path ? '900' : '800'
        } text-gray-200 ${
          pathname === path ? '' : 'hover:text-blue-300 focus:text-blue-300'
        }`}
      />
    </button>
  ));

  const sidebarMenu = (
    <div className="w-screen h-screen fixed flex -mt-4 -mr-4 z-50 opacity-100">
      <div className="w-full flex justify-end fixed pt-4 pr-4">
        <button className="h-12 w-12 fixed" onClick={() => setShowMenu(false)}>
          <div
            className={`ri-menu-line p-2 text-2xl font-bold flex justify-center items-center rounded ${
              showMenu ? 'bg-blue-400' : 'bg-gray-400'
            } text-gray-900 opacity-50 w-full h-full`}
          />
        </button>
      </div>

      <div
        className={`w-4/5 bg-gray-700 h-full flex flex-col items-center px-2 z-50 border-r-2 border-blue-400 transform ${
          showMenu
            ? 'translate-x-0 ease-out duration-1000 transition-medium'
            : '-translate-x-screen ease-in duration-1000 transition-mediums'
        }`}
      >
        <div className="text-2xl font-bold my-2 tracking-widest text-blue-300">
          Navigation
        </div>

        {buttonsToMake.map(({ path, name }, i) => (
          <button
            className={`w-full h-12 py-2 mb-2 text-lg ${
              pathname === path ? 'bg-blue-500' : 'bg-gray-900'
            } text-bold tracking-wider text-gray-100 rounded text-center`}
            key={`nav-${i}`}
            onClick={() => {
              setShowMenu(false);
              if (pathname !== path) history.push(path);
            }}
          >
            {name}
          </button>
        ))}
      </div>
    </div>
  );

  return (
    <div className="w-full sm:bg-gray-700 sm:mb-2 flex sm:justify-center sm:items-center justify-end sm:border-b-2 sm:border-blue-500 sm:pr-0 pr-4 sm:py-4 sm:h-3/25">
      {width > 640 ? (
        navButtons
      ) : (
        <button
          className={`h-12 w-12 fixed ${
            showMenu ? 'opacity-0' : 'opacity-100'
          }`}
          onClick={() => setShowMenu((prev) => !prev)}
        >
          <div className="ri-menu-line p-2 text-2xl font-bold flex justify-center items-center rounded bg-gray-400 text-gray-900 opacity-50 w-full h-full" />
        </button>
      )}

      {showMenu && sidebarMenu}
    </div>
  );
}
