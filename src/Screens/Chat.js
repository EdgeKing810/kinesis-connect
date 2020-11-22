import React, { useEffect, useState, useContext, useRef } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import { v4 } from 'uuid';

import { LocalContext } from '../Context';
import { Parser } from '../Components/renderers';
import useWindowSize from '../Components/useWindowSize';

export default function Chat() {
  const [error, setError] = useState('Loading...');

  const [search, setSearch] = useState('');
  const [currentFound, setCurrentFound] = useState({});

  const [activeRoom, setActiveRoom] = useState('');
  const [activeRoomID, setActiveRoomID] = useState('');

  const [currentChat, setCurrentChat] = useState('');
  const [currentEditChat, setCurrentEditChat] = useState('');

  const [otherProfileID, setOtherProfileID] = useState('');

  const {
    APIURL,
    UPLOADSURL,
    profile,
    setProfile,
    people,
    ws,
    chat,
    setChat,
  } = useContext(LocalContext);
  const history = useHistory();

  const { width } = useWindowSize();
  // console.log(`Height: ${height}`);

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

  const messagesEndRef = useRef(null);
  const chatBoxRef = useRef(null);

  const convertDate = (date) => {
    const oldDate = new Date(date);
    return new Date(
      Date.UTC(
        oldDate.getFullYear(),
        oldDate.getMonth(),
        oldDate.getDate(),
        oldDate.getHours(),
        oldDate.getMinutes(),
        oldDate.getSeconds()
      )
    ).toString();
  };

  const fetchChats = (roomID) => {
    const data = {
      uid: profile.uid,
      roomID: roomID,
    };

    axios
      .post(`${APIURL}/api/messages/get`, data, {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      })
      .then((res) => {
        if (res.data.error !== 0) {
          setChat({ messages: [] });
        } else {
          setChat(res.data);
          setOtherProfileID(
            res.data.members.find((m) => m.uid !== profile.uid).uid
          );

          if (chatBoxRef.current) {
            chatBoxRef.current.focus();
          }

          setTimeout(() => {
            if (messagesEndRef.current) {
              messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
            }
          }, 300);
        }
      });
  };

  const messages =
    profile.chats &&
    profile.chats.map(({ uid, name }) => (
      <button
        className={`sm:w-43/50 w-11/12 rounded-lg flex justify-center px-2 py-4 my-1 font-open sm:text-md text-xs sm:mx-0 mx-2 bg-${
          name === activeRoom
            ? 'blue-600 text-gray-900 font-bold'
            : 'gray-800 text-blue-200'
        } ${name === activeRoom ? '' : 'hover:bg-blue-900 focus:bg-blue-900'}`}
        key={uid}
        onClick={() => {
          if (activeRoom !== uid) {
            setChat({});
            setActiveRoom(name);
            setActiveRoomID(uid);
            fetchChats(uid);
          } else {
            setActiveRoom('');
            setActiveRoomID('');
          }
        }}
      >
        {name}
      </button>
    ));

  const joinRoom = ({ profileID, username }) => {
    const id = v4();

    const data = {
      uid: profile.uid,
      roomID: id,
      roomName: `${profile.username}, ${username} (${id
        .split('-')[0]
        .toString()})`,
      name: `${profile.username}, ${username} (${id.split('-')[0].toString()})`,
      profileID: profileID,
    };

    setSearch('');
    setCurrentFound({});
    setActiveRoom(data.name);
    setActiveRoomID(data.roomID);
    setCurrentChat('');
    setCurrentEditChat('');

    setOtherProfileID(profileID);

    axios
      .post(`${APIURL}/api/room/join`, data, {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      })
      .then((res) => {
        if (res.data.error !== 0) {
          alert(res.data.message);
        } else {
          let updatedProfile = { ...profile };
          updatedProfile.chats = [
            ...updatedProfile.chats,
            { uid: id, name: data.name },
          ];

          setChat({
            room: id,
            messages: [],
            members: [{ uid: profile.uid }, { uid: profileID }],
          });

          ws.send(
            JSON.stringify({
              roomID: profile.roomID,
              type: 'room_join',
              uid: profile.uid,
              profileID: data.profileID,
              room_id: data.roomID,
              roomName: data.roomName,
            })
          );

          setProfile(updatedProfile);
        }
      });
  };

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages]);

  const submitMessage = (e) => {
    e.preventDefault();

    let d = new Date();
    const timestamp = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );

    const isEditing = currentEditChat.length > 0;

    const data = {
      uid: profile.uid,
      senderID: profile.uid,
      roomID: activeRoomID,
      messageID: isEditing ? currentEditChat : v4(),
      message: currentChat,
      timestamp: timestamp,
    };

    axios
      .post(`${APIURL}/api/message/${isEditing ? 'edit' : 'send'}`, data, {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      })
      .then((res) => {
        if (res.data.error !== 0) {
          alert(res.data.message);
        } else {
          setChat((prev) => ({
            room: prev.room,
            members: prev.members,
            messages: isEditing
              ? prev.messages.map((msg) => {
                  if (msg.messageID === data.messageID) {
                    return data;
                  } else {
                    return msg;
                  }
                })
              : prev.messages
              ? [...prev.messages, data]
              : [data],
          }));

          ws.send(
            JSON.stringify({
              roomID: profile.roomID,
              type: `message_${isEditing ? 'edit' : 'new'}`,
              uid: profile.uid,
              profileID: otherProfileID,
              room_id: data.roomID,
              messageID: data.messageID,
              senderID: data.senderID,
              message: data.message,
              timestamp: data.timestamp,
            })
          );

          setCurrentChat('');
          setCurrentEditChat('');
        }
      });
  };

  const deleteMessage = (e, messageID) => {
    e.preventDefault();

    const data = {
      uid: profile.uid,
      roomID: activeRoomID,
      messageID: messageID,
    };

    if (window.confirm('Are you sure you want to delete this message?')) {
      axios
        .post(`${APIURL}/api/message/delete`, data, {
          headers: { Authorization: `Bearer ${profile.jwt}` },
        })
        .then((res) => {
          if (res.data.error !== 0) {
            alert(res.data.message);
          } else {
            setChat((prev) => ({
              room: prev.room,
              members: prev.members,
              messages: prev.messages.filter(
                (msg) => msg.messageID !== data.messageID
              ),
            }));

            ws.send(
              JSON.stringify({
                roomID: profile.roomID,
                type: 'message_delete',
                uid: profile.uid,
                profileID: otherProfileID,
                room_id: data.roomID,
                messageID: data.messageID,
              })
            );

            if (currentEditChat === currentChat) {
              setCurrentChat('');
            }
            setCurrentEditChat('');
          }
        });
    }
  };

  const leaveRoom = () => {
    const data = {
      uid: profile.uid,
      roomID: activeRoomID,
    };

    if (window.confirm(`Are you sure you want to close ${activeRoom}?`)) {
      axios
        .post(`${APIURL}/api/room/leave`, data, {
          headers: { Authorization: `Bearer ${profile.jwt}` },
        })
        .then((res) => {
          if (res.data.error !== 0) {
            alert(res.data.message);
          } else {
            let updatedProfile = { ...profile };
            updatedProfile.chats = updatedProfile.chats.filter(
              (c) => c.uid !== data.roomID
            );

            ws.send(
              JSON.stringify({
                roomID: profile.roomID,
                type: 'room_leave',
                uid: profile.uid,
                room_id: data.roomID,
              })
            );

            setProfile(updatedProfile);

            setSearch('');
            setCurrentFound({});
            setActiveRoom('');
            setActiveRoomID('');
            setCurrentChat('');
            setCurrentEditChat('');
            setChat({});
          }
        });
    }
  };

  const createChat = () => {
    return (
      <div className="w-11/12 flex sm:flex-col flex-row items-center sm:justify-start justify-around rounded border-2 border-gray-800 sm:my-4 sm:py-4 py-1 px-1 my-1">
        <input
          className="rounded-lg sm:w-1/2 w-2/5 text-gray-300 placeholder-gray-500 bg-gray-900 border-2 border-blue-600 sm:text-lg text-xs p-2"
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
                      (p.name
                        .toLowerCase()
                        .includes(e.target.value.toLowerCase()) ||
                        p.username
                          .toLowerCase()
                          .includes(e.target.value.toLowerCase())) &&
                      !profile.blocked.some((u) => p.profileID === u.uid)
                  )
                : {}
            );
          }}
        />

        {currentFound && currentFound.name ? (
          <button
            className="rounded-lg bg-gray-800 hover:bg-gray-700 focus:bg-gray-700 text-gray-300 sm:text-lg sm:mt-4 flex flex-col sm:w-5/6 w-1/2 py-2 sm:px-4 px-2"
            onClick={() => joinRoom({ ...currentFound })}
          >
            <div className="sm:text-lg text-xs text-blue-300">
              {currentFound.name}
            </div>
            <div className="sm:text-md text-xs text-green-300 tracking-wide">
              {currentFound.username}
            </div>
          </button>
        ) : (
          ''
        )}
      </div>
    );
  };

  const chatMessages =
    chat && chat.messages
      ? chat.messages.map((msg) => {
          const isCurrentUser = msg.senderID === profile.uid;

          return (
            <div
              className={`w-full my-1 flex-none flex ${
                isCurrentUser ? 'justify-end' : 'justify-start'
              }`}
              key={msg.messageID}
            >
              {isCurrentUser ? (
                <div className={`flex items-center justify-center mx-1`}>
                  <button
                    className={`${
                      currentEditChat === msg.messageID
                        ? 'ri-close-circle-line hover:ri-close-circle-fill focus:ri-close-circle-fill'
                        : 'ri-pencil-line hover:ri-pencil-fill focus:ri-pencil-fill'
                    } px-2 flex justify-center items-center hover:text-yellow-400 focus:text-yellow-400 text-gray-300 sm:text-xl text-md`}
                    onClick={() => {
                      if (currentEditChat !== msg.messageID) {
                        setCurrentEditChat(msg.messageID);
                        setCurrentChat(msg.message);
                      } else {
                        setCurrentEditChat('');
                        setCurrentChat('');
                      }
                    }}
                  ></button>
                  <button
                    className={`ri-delete-bin-5-line hover:ri-delete-bin-5-fill focus:ri-delete-bin-5-fill px-2 flex justify-center items-center hover:text-red-400 focus:text-red-400 text-gray-300 sm:text-xl text-md`}
                    onClick={(e) => deleteMessage(e, msg.messageID)}
                  ></button>
                </div>
              ) : (
                ''
              )}
              <div
                className={`sm:w-2/5 w-4/5 font-rale sm:text-lg text-sm tracking-wide rounded-lg p-2 text-gray-900 bg-${
                  isCurrentUser ? 'green' : 'blue'
                }-400`}
              >
                <div
                  className={`text-${
                    isCurrentUser ? 'right' : 'left'
                  } bg-gray-900 rounded p-1`}
                  style={{ whiteSpace: 'pre-line' }}
                >
                  <Parser content={msg.message} />
                </div>

                <div
                  className={`mt-1 text-xs font-sans text-${
                    isCurrentUser ? 'right' : 'left'
                  }`}
                >
                  {convertDate(msg.timestamp).split(' ').slice(0, 5).join(' ')}
                </div>
              </div>
            </div>
          );
        })
      : [];

  const uploadImage = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 5000000) {
        alert('File too large!');
      } else {
        e.preventDefault();

        const data = new FormData();
        data.append('file', e.target.files[0]);

        axios.post(`${APIURL}/api/user/upload`, data).then((res) => {
          setCurrentChat(
            (prev) => `${prev}\n![](${UPLOADSURL}/${res.data.url})`
          );
        });
      }
    }
  };

  const MobileChat = () => (
    <div className="w-full mx-auto flex flex-col items-center justify-between h-43/50">
      <div className="w-full h-full bg-gray-700 flex flex-col justify-center items-center p-2 border-2 border-gray-900 rounded-lg mt-4">
        {activeRoom.length <= 0 ? (
          <div className="w-full h-full flex flex-col items-center justify-center border-b-2 border-t-2 border-blue-600 p-2 text-lg font-rale font-bold tracking-wide text-blue-100">
            Select a chat to see messages.
          </div>
        ) : (
          <div className={`w-full h-full flex flex-col justify-around`}>
            <div className="w-full flex h-1/12 items-center p-2 justify-between mb-2">
              <div className="text-blue-100 text-sm font-bold tracking-wide w-2/3">
                {activeRoom}
              </div>

              <button
                className="text-gray-100 bg-red-500 hover:bg-red-600 focus:bg-red-600 rounded-lg py-2 px-1 w-1/3 text-md"
                onClick={() => leaveRoom()}
              >
                Leave Chat
              </button>
            </div>

            <div className="w-full h-3/4 flex flex-col justify-around bg-gray-900">
              {!chat.messages || chat.messages.length <= 0 ? (
                <div className="w-full h-full border-2 border-red-500 p-2 text-lg font-rale font-bold tracking-wide text-blue-100 flex justify-center items-center">
                  {chat.messages && chat.messages.length <= 0
                    ? 'No messages yet, send one!'
                    : 'Loading...'}
                </div>
              ) : (
                <div className="w-full h-full border-2 border-blue-500 py-2 px-3 overflow-y-scroll flex-initial">
                  {chatMessages}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            <form
              className="w-full h-1/6 flex justify-around items-center -my-2"
              onSubmit={(e) => {
                e.preventDefault();
                if (currentChat.length > 0) submitMessage(e);
              }}
            >
              <textarea
                name="chat_box"
                placeholder="Type something..."
                value={currentChat}
                ref={chatBoxRef}
                onChange={(e) => setCurrentChat(e.target.value)}
                className="w-7/10 p-1 rounded placeholder-gray-700 text-gray-900 bg-blue-100 -my-2 text-sm"
              />

              <div className="w-1/4 flex flex-col justify-around mt-2">
                <button
                  className={`text-gray-100 bg-blue-500 ${
                    currentChat.length > 0
                      ? 'hover:bg-blue-600 focus:bg-blue-600'
                      : 'opacity-50'
                  } rounded-lg py-2 w-full text-sm mt-0`}
                  type="submit"
                >
                  {currentEditChat.length > 0 ? 'Edit' : 'Send'}
                </button>

                <input
                  className={`p-2 w-full text-xs font-bold tracking-wide font-open bg-blue-900 rounded-lg text-gray-300 mt-2 overflow-hidden`}
                  type="file"
                  onChange={(e) => {
                    e.persist();
                    uploadImage(e);
                  }}
                />
              </div>
            </form>
          </div>
        )}
      </div>

      {activeRoom.length <= 0 ? (
        <div className="w-full h-3/5 flex flex-col bg-gray-900 border-r-2 border-gray-700 rounded-lg">
          <div className="w-full flex justify-center items-center h-1/2">
            {createChat()}
          </div>

          <div className="w-full flex flex-col items-center h-3/5 p-1">
            <div className="w-full h-full overflow-y-scroll flex flex-col items-center bg-gray-900 rounded border-2 border-yellow-500 border-opacity-50 py-2">
              {messages.length > 0 ? (
                messages.reverse()
              ) : (
                <div className="w-5/6 text-center rounded-lg text-xs border-2 border-blue-700 p-2 font-rale font-bold tracking-wide text-blue-100">
                  Chats you participate in will appear here.
                </div>
              )}
            </div>
          </div>
        </div>
      ) : (
        <div className="w-full flex py-2 justify-center items-center">
          <button
            className="text-gray-900 bg-yellow-400 hover:bg-yellow-500 focus:bg-yellow-500 rounded-lg py-2 px-1 w-2/3 text-md"
            onClick={() => setActiveRoom('')}
          >
            Message someone else
          </button>
        </div>
      )}
    </div>
  );

  return (
    <div className={`w-full flex flex-col items-center px-2 sm:h-43/50 h-full`}>
      {activeRoom.length <= 0 ? (
        <div className="font-bold tracking-widest font-rale text-gray-200 text-5xl sm:my-8 sm:mb-8 my-4 -mb-4">
          Chat
        </div>
      ) : (
        ''
      )}

      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center mt-4">
          {error}
        </div>
      ) : width > 640 ? (
        <div className="w-full mx-auto flex justify-center items-start h-full">
          <div className="w-1/4 h-full flex flex-col bg-gray-900 justify-between border-r-2 border-gray-700 rounded-l-lg">
            <div className="w-full flex justify-center items-center h-1/3">
              {createChat()}
            </div>

            <div className="w-full flex flex-col items-center h-2/3 p-2">
              <div className="w-full h-full overflow-y-scroll flex flex-col items-center bg-gray-900 rounded border-2 border-yellow-500 border-opacity-50 py-2">
                {messages.length > 0 ? (
                  messages.reverse()
                ) : (
                  <div className="w-5/6 text-center rounded-lg border-2 border-blue-700 p-2 font-rale font-bold tracking-wide text-blue-100">
                    Chats you participate in will appear here.
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="w-3/4 h-full bg-gray-700 flex flex-col justify-center items-center p-2 border-l-2 border-gray-900 rounded-r-lg">
            {activeRoom.length <= 0 ? (
              <div className="w-5/6 text-center border-b-2 border-t-2 border-blue-600 p-2 text-lg font-rale font-bold tracking-wide text-blue-100">
                Select a chat to see messages.
              </div>
            ) : (
              <div className={`w-full h-full flex flex-col justify-around`}>
                <div className="w-full flex h-1/12 items-center p-2 justify-between mb-2">
                  <div className="text-blue-100 text-xl font-bold tracking-wide w-4/5">
                    {activeRoom}
                  </div>

                  <button
                    className="text-gray-100 bg-red-500 hover:bg-red-600 focus:bg-red-600 rounded-lg py-2 px-1 w-1/6 text-lg"
                    onClick={() => leaveRoom()}
                  >
                    Leave Chat
                  </button>
                </div>

                <div className="w-full h-3/4 flex flex-col justify-around bg-gray-900">
                  {!chat.messages || chat.messages.length <= 0 ? (
                    <div className="w-full h-full border-2 border-red-500 p-2 text-lg font-rale font-bold tracking-wide text-blue-100 flex justify-center items-center">
                      {chat.messages && chat.messages.length <= 0
                        ? 'No messages yet, send one!'
                        : 'Loading...'}
                    </div>
                  ) : (
                    <div className="w-full h-full border-2 border-blue-500 py-2 px-3 overflow-y-scroll flex-initial">
                      {chatMessages}
                      <div ref={messagesEndRef} />
                    </div>
                  )}
                </div>

                <form
                  className="w-full h-1/6 flex justify-around items-center"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (currentChat.length > 0) submitMessage(e);
                  }}
                >
                  <textarea
                    name="chat_box"
                    placeholder="Type something..."
                    value={currentChat}
                    ref={chatBoxRef}
                    onChange={(e) => setCurrentChat(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.keyCode === 13 && e.shiftKey === false) {
                        e.preventDefault();
                        if (e.target.value.length > 0) submitMessage(e);
                      }
                    }}
                    className="w-3/4 p-1 rounded placeholder-gray-700 text-gray-900 bg-blue-100 text-lg"
                  />

                  <div className="w-1/5 flex flex-col justify-around mt-2">
                    <button
                      className={`text-gray-100 bg-blue-500 ${
                        currentChat.length > 0
                          ? 'hover:bg-blue-600 focus:bg-blue-600'
                          : 'opacity-50'
                      } rounded-lg py-4 w-full mt-0`}
                      type="submit"
                    >
                      {currentEditChat.length > 0 ? 'Edit' : 'Send'}
                    </button>

                    <input
                      className={`p-2 w-full text-md font-bold tracking-wide font-open bg-blue-900 rounded-lg text-gray-300 mt-2 overflow-hidden`}
                      type="file"
                      onChange={(e) => {
                        e.persist();
                        uploadImage(e);
                      }}
                    />
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      ) : (
        MobileChat()
      )}
    </div>
  );
}
