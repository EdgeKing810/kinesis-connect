import React, { useContext } from 'react';
import { Redirect, Switch, Route, useHistory } from 'react-router-dom';

import NavBar from './Components/NavBar';

import LoginForm from './Screens/LoginForm';
import MyProfile from './Screens/MyProfile';
import UserProfile from './Screens/UserProfile';
import Post from './Screens/Post';
import Discover from './Screens/Discover';
import Feed from './Screens/Feed';
import Chat from './Screens/Chat';

import { LocalContext } from './Context';

export default function App() {
  const { profile, setProfile, setPeople, setChat, ws } = useContext(
    LocalContext
  );
  const history = useHistory();

  const handleWebSockets = ({ data }) => {
    const dataObj = JSON.parse(data);
    let entityData = { ...dataObj };

    switch (dataObj.type) {
      case 'profile_change':
        if (dataObj.uid === profile.uid) {
          setProfile((prev) => {
            entityData = { ...prev };

            entityData.uid = dataObj.uid;
            entityData.profileID = dataObj.uid;
            entityData.name = dataObj.name;
            entityData.username = dataObj.username;
            entityData.bio = dataObj.bio;

            return entityData;
          });
        }

        setPeople((prev) => {
          let updatedPeople = [];

          prev.forEach((p) => {
            if (p.profileID === dataObj.uid) {
              updatedPeople.push({ ...entityData });
            } else {
              updatedPeople.push({ ...p });
            }
          });

          return [...updatedPeople];
        });

        break;

      case 'account_delete':
        history.push('/');
        localStorage.clear();
        break;

      case 'room_join':
        setProfile((prev) => {
          let updatedProfile = { ...prev };
          if (!updatedProfile.chats.find((c) => c.uid === dataObj.room_id)) {
            updatedProfile.chats = [
              ...updatedProfile.chats,
              { uid: dataObj.room_id, name: dataObj.roomName },
            ];
          }
          return updatedProfile;
        });
        break;

      case 'room_leave':
        setProfile((prev) => {
          let updatedProfile = { ...prev };
          updatedProfile.chats = updatedProfile.chats.filter(
            (c) => c.uid !== dataObj.room_id
          );
          return updatedProfile;
        });
        break;

      case 'message_new':
        setChat((prev) => {
          if (prev.room !== entityData.room_id) {
            return prev;
          }

          let updatedRoom = { ...prev };
          const message = {
            messageID: entityData.messageID,
            senderID: entityData.senderID,
            message: entityData.message,
            timestamp: entityData.timestamp,
          };

          if (
            !updatedRoom.messages.find(
              (m) => m.messageID === entityData.messageID
            )
          ) {
            updatedRoom.messages = updatedRoom.messages
              ? [...prev.messages, message]
              : [message];
          }

          return updatedRoom;
        });
        break;

      case 'message_edit':
        setChat((prev) => {
          if (prev.room !== entityData.room_id) {
            return prev;
          }

          let updatedRoom = { ...prev };
          const message = {
            messageID: entityData.messageID,
            senderID: entityData.senderID,
            message: entityData.message,
            timestamp: entityData.timestamp,
          };

          updatedRoom.messages = updatedRoom.messages.map((m) => {
            if (m.messageID === entityData.messageID) {
              return message;
            } else {
              return m;
            }
          });

          return updatedRoom;
        });
        break;

      case 'message_delete':
        setChat((prev) => {
          if (prev.room !== entityData.room_id) {
            return prev;
          }

          let updatedRoom = { ...prev };

          updatedRoom.messages = updatedRoom.messages.filter(
            (m) => m.messageID !== entityData.messageID
          );

          return updatedRoom;
        });
        break;

      case 'relation':
        console.log(entityData);

        setProfile((prev) => {
          let updatedProfile = { ...prev };

          if (entityData.profileID === profile.uid) {
            // Current User -> entityData.profileID
            // User requesting -> entityData.uid

            if (entityData.operation === 'block' && entityData.bool) {
              setPeople((pre) => pre.filter((p) => p.uid !== entityData.uid));
            }

            updatedProfile.followers =
              entityData.operation === 'block' || // (un)block
              (entityData.operation !== 'block' && !entityData.bool) // unfollow
                ? updatedProfile.followers.filter(
                    (p) => p.uid !== entityData.uid
                  )
                : entityData.bool // follow
                ? [...updatedProfile.followers, { uid: entityData.uid }]
                : [...prev.followers];

            updatedProfile.following =
              entityData.operation === 'block' // (un)block
                ? prev.following.filter((p) => p.uid !== entityData.uid)
                : [...prev.following];
          } else {
            // Current User -> entityData.uid
            // User beng requested -> entityData.profileID

            updatedProfile.followers =
              entityData.operation === 'block' // (un)block
                ? prev.followers.filter((p) => p.uid !== entityData.profileID)
                : [...prev.followers];

            updatedProfile.following =
              entityData.operation === 'block' || // (un)block
              (entityData.operation !== 'block' && !entityData.bool) // unfollow
                ? updatedProfile.following.filter(
                    (p) => p.uid !== entityData.profileID
                  )
                : entityData.bool &&
                  !updatedProfile.following.find(
                    (f) => f.uid === entityData.profileID
                  )
                ? [...updatedProfile.following, { uid: entityData.profileID }]
                : [...prev.following];

            updatedProfile.blocked =
              entityData.operation === 'block' // (un)block
                ? entityData.bool
                  ? [...prev.blocked, { uid: entityData.profileID }]
                  : prev.blocked.filter((p) => p.uid !== entityData.profileID)
                : [...prev.blocked];
          }

          return updatedProfile;
        });
        break;

      default:
        break;
    }
  };

  ws.addEventListener('message', handleWebSockets);

  return (
    <div className="w-full">
      <Switch>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        <Route exact path="/login">
          <LoginForm />
        </Route>

        <Route>
          <div className="w-screen sm:h-screen">
            <NavBar />

            <Switch>
              <Route exact path="/feed">
                <Feed />
              </Route>
              <Route exact path="/profile">
                <MyProfile />
              </Route>
              <Route exact path="/profile/:profileID">
                <UserProfile />
              </Route>
              <Route exact path="/post/create">
                <Post />
              </Route>
              <Route exact path="/post/edit/:postID">
                <Post />
              </Route>
              <Route exact path="/discover">
                <Discover />
              </Route>
              <Route exact path="/chat">
                <Chat />
              </Route>

              <Route render={() => <Redirect to="/" />} />
            </Switch>
          </div>
        </Route>
      </Switch>
    </div>
  );
}
