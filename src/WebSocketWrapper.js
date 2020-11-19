import React, { useContext } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

import { LocalContext } from './Context';

export default function WebSocketWrapper({ children }) {
  const { APIURL, profile, setProfile, setPeople, setChat, ws } = useContext(
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
        let updatedProfile = {};

        setProfile((prev) => {
          updatedProfile = { ...prev };

          if (entityData.profileID.toString() === prev.uid.toString()) {
            // Current User -> entityData.profileID
            // User requesting -> entityData.uid

            if (entityData.operation === 'block') {
              if (entityData.bool) {
                setPeople((pre) =>
                  pre.filter((p) => p.profileID !== entityData.uid)
                );
              } else {
                const { jwt } = JSON.parse(localStorage.getItem('_userData'));

                const data = {
                  uid: prev.uid,
                  profileID: prev.uid,
                };

                axios
                  .post(`${APIURL}/api/profile/fetch`, data, {
                    headers: { Authorization: `Bearer ${jwt}` },
                  })
                  .then((res) => {
                    console.log(`res: ${JSON.stringify(res.data)}`);
                    axios
                      .post(`${APIURL}/api/profiles/fetch`, data, {
                        headers: { Authorization: `Bearer ${jwt}` },
                      })
                      .then((response) => {
                        if (response.data.error === 0) {
                          setPeople([
                            ...response.data.users,
                            { ...res.data, profileID: res.data.uid },
                          ]);
                        } else {
                          setPeople([{ ...res.data, profileID: res.data.uid }]);
                        }
                      });
                  });
              }
            }

            updatedProfile.followers =
              entityData.operation === 'block' || // (un)block
              (entityData.operation !== 'block' && !entityData.bool) // unfollow
                ? updatedProfile.followers.filter(
                    (p) => p.uid !== entityData.uid
                  )
                : entityData.bool // follow
                ? [...updatedProfile.followers, { uid: entityData.uid }]
                : [...updatedProfile.followers];

            updatedProfile.following =
              entityData.operation === 'block' // (un)block
                ? updatedProfile.following.filter(
                    (p) => p.uid !== entityData.uid
                  )
                : [...updatedProfile.following];
          } else {
            // Current User -> entityData.uid
            // User beng requested -> entityData.profileID

            updatedProfile.followers =
              entityData.operation === 'block' // (un)block
                ? updatedProfile.followers.filter(
                    (p) => p.uid !== entityData.profileID
                  )
                : [...updatedProfile.followers];

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
                : [...updatedProfile.following];

            updatedProfile.blocked =
              entityData.operation === 'block' // (un)block
                ? entityData.bool
                  ? [...updatedProfile.blocked, { uid: entityData.profileID }]
                  : updatedProfile.blocked.filter(
                      (p) => p.uid !== entityData.profileID
                    )
                : [...updatedProfile.blocked];
          }

          return updatedProfile;
        });
        break;

      default:
        break;
    }
  };

  ws.addEventListener('message', handleWebSockets);

  return <div className="w-full h-full">{children}</div>;
}
