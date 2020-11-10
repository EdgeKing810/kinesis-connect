import React, { useEffect, useState, useContext } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import { v4 } from 'uuid';

import { LocalContext } from '../Context';
import useWindowSize from '../Components/useWindowSize';

export default function Chat() {
  const [error, setError] = useState('Loading...');

  const [search, setSearch] = useState('');
  const [currentFound, setCurrentFound] = useState({});
  const [activeRoom, setActiveRoom] = useState('');
  const [currentChat, setCurrentChat] = useState('');

  const { APIURL, profile, setProfile, people } = useContext(LocalContext);
  const history = useHistory();

  const { height } = useWindowSize();

  useEffect(() => {
    if (
      !localStorage.getItem('_userData') ||
      profile.jwt === undefined ||
      !profile.jwt
    ) {
      setError('You need to login first to view this page.');
      setTimeout(() => history.push('/'), 500);
    } else {
      setError('');
    }
    // eslint-disable-next-line
  }, []);

  const chats =
    profile.chats &&
    profile.chats.map(({ uid, name }) => (
      <button
        className={`sm:w-4/5 w-11/12 rounded-lg flex justify-center px-2 py-4 my-1 font-open sm:text-lg text-md sm:mx-0 mx-2 bg-${
          name === activeRoom
            ? 'blue-600 text-gray-900 font-bold'
            : 'gray-800 text-blue-200'
        } ${name === activeRoom ? '' : 'hover:bg-blue-900 focus:bg-blue-900'}`}
        key={uid}
        onClick={() =>
          activeRoom === uid ? setActiveRoom('') : setActiveRoom(name)
        }
      >
        {name}
      </button>
    ));

  const joinRoom = ({ profileID, username }) => {
    const data = {
      uid: profile.uid,
      roomID: v4(),
      roomName: `${username} (${profileID.split('-')[0].toString()})`,
      name: `${username} (${profileID.split('-')[0].toString()})`,
      profileID: profileID,
    };

    setSearch('');
    setCurrentFound({});
    setActiveRoom(data.name);
    setCurrentChat('');

    axios
      .post(`${APIURL}/api/room/join`, data, {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      })
      .then((res) => {
        if (res.data.error !== 0) {
          alert(res.data.message);
        } else {
          let updatedProfile = { ...profile };
          updatedProfile.chats = [...updatedProfile.chats, { ...data }];

          setProfile(updatedProfile);
        }
      });
  };

  const createChat = () => {
    return (
      <div className="w-11/12 flex flex-col items-center rounded border-2 border-gray-800 py-2 my-4">
        <input
          className="rounded-lg sm:w-1/2 w-5/6 text-gray-300 placeholder-gray-500 bg-gray-900 border-2 border-blue-600 sm:text-lg p-2"
          name="search_user"
          value={search}
          placeholder="Message someone..."
          onChange={(e) => {
            e.preventDefault();
            setSearch(e.target.value);
            setCurrentFound(
              e.target.value.length > 0
                ? people.find(
                    (p) =>
                      p.name.includes(e.target.value) ||
                      (p.username.includes(e.target.value) &&
                        p.profileID !== profile.uid)
                  )
                : {}
            );
          }}
        />

        {currentFound && currentFound.name ? (
          <button
            className="rounded-lg bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 text-gray-300 sm:text-lg mb-8 mt-4 flex flex-col w-5/6 py-2 sm:px-4 px-2"
            onClick={() => joinRoom({ ...currentFound })}
          >
            <div className="sm:text-xl text-lg text-blue-300">
              {currentFound.name}
            </div>
            <div className="sm:text-lg text-sm text-green-300 tracking-wide">
              {currentFound.username}
            </div>
          </button>
        ) : (
          ''
        )}
      </div>
    );
  };

  return (
    <div
      className={`w-full flex flex-col items-center ${
        height > 900 ? 'sm:h-7/10' : height > 700 ? 'sm:h-3/5' : 'sm:h-2/5'
      } sm:px-4`}
    >
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-8 mb-4">
        Chat
      </div>
      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
          {error}
        </div>
      ) : (
        <div className="sm:w-full w-11/12 mx-auto flex sm:flex-row flex-col sm:justify-center sm:items-start items-center sm:h-full">
          <div className="sm:w-1/3 w-full sm:h-full flex flex-col bg-gray-900 sm:justify-between sm:border-r-2 sm:border-gray-700 sm:rounded-l-lg">
            <div className="w-full flex sm:flex-row flex-col sm:justify-center sm:items-center sm:h-1/3">
              {createChat()}
            </div>

            <div className="w-full flex flex-col items-center sm:h-2/3 sm:px-2 sm:max-h-none max-h-xs py-2">
              <div className="w-full sm:h-full overflow-y-scroll flex flex-col items-center bg-gray-900 rounded border-2 border-yellow-500 border-opacity-50 py-2">
                {chats.length > 0 ? (
                  chats.reverse()
                ) : (
                  <div className="w-5/6 text-center rounded-lg border-2 border-blue-700 p-2 font-rale font-bold tracking-wide text-blue-100">
                    Rooms you join will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="sm:w-2/3 w-full h-full bg-gray-700 flex flex-col justify-center items-center py-2 px-2 sm:border-l-2 sm:border-gray-900 sm:border-gray-700 sm:rounded-r-lg">
            {activeRoom.length <= 0 ? (
              <div className="w-5/6 text-center border-b-2 border-t-2 border-blue-600 p-2 sm:text-lg text-md font-rale font-bold tracking-wide text-blue-100">
                Select a chat to see messages.
              </div>
            ) : (
              <div className="w-full sm:h-full flex flex-col sm:justify-between">
                <div className="w-full flex sm:h-1/12 items-center p-2 justify-between mb-2">
                  <div className="text-blue-100 sm:text-xl text-md font-bold tracking-wide sm:w-4/5 w-2/3">
                    {activeRoom}
                  </div>

                  <button className="text-gray-100 bg-red-500 hover:bg-red-600 focus:bg-red-600 rounded-lg py-2 sm:w-1/6 w-1/3">
                    Leave Room
                  </button>
                </div>

                <div className="w-full sm:h-3/4 overflow-y-scroll flex flex-col px-2 bg-gray-900">
                  Chats
                </div>

                <div className="w-full sm:h-1/6 flex sm:flex-row flex-col justify-around items-center">
                  <textarea
                    name="chat_box"
                    placeholder="Type something..."
                    value={currentChat}
                    onChange={(e) => setCurrentChat(e.target.value)}
                    className="max-h-sm sm:w-3/4 w-full p-1 rounded placeholder-gray-700 text-gray-900 bg-blue-100"
                  />

                  <button className="text-gray-100 bg-blue-500 hover:bg-blue-600 focus:bg-blue-600 rounded-lg sm:py-4 py-2 sm:w-1/5 w-3/5 sm:mt-0 mt-2">
                    Send
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}