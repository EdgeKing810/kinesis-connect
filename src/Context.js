import React, { useState, useEffect } from 'react';

import axios from 'axios';

const LocalContext = React.createContext();

function LocalContextProvider({ children }) {
  const [loggedInUser, setLoggedInUser] = useState({});

  const [profile, setProfile] = useState({});
  const [myPosts, setMyPosts] = useState([]);
  const [people, setPeople] = useState([]);

  const APIURL = 'https://api.connect.kinesis.games';
  const UPLOADSURL = 'https://uploads.connect.kinesis.games';

  useEffect(() => {
    // console.log(JSON.parse(localStorage.getItem('_userData')));
    if (localStorage.getItem('_userData')) {
      if (
        profile.jwt !== undefined &&
        profile.jwt &&
        myPosts &&
        myPosts.length > 0
      ) {
        return;
      }

      const { uid, jwt } = JSON.parse(localStorage.getItem('_userData'));

      const data = {
        uid,
        profileID: uid,
      };

      axios
        .post(`${APIURL}/api/profile/fetch`, data, {
          headers: { Authorization: `Bearer ${jwt}` },
        })
        .then((res) => {
          if (res.data.error === 0) {
            setProfile({ ...res.data, jwt: jwt });

            axios
              .post(
                `${APIURL}/api/posts/get`,
                { uid },
                {
                  headers: { Authorization: `Bearer ${jwt}` },
                }
              )
              .then((response) => {
                if (response.data.error === 0) {
                  setMyPosts(response.data.posts);
                } else {
                  setMyPosts([]);
                }
              });

            axios
              .post(`${APIURL}/api/profiles/fetch`, data, {
                headers: { Authorization: `Bearer ${jwt}` },
              })
              .then((response) => {
                if (response.data.error === 0) {
                  setPeople([...response.data.users, { ...res.data }]);
                } else {
                  setPeople([{ ...res.data }]);
                }
              });
          }
        });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <LocalContext.Provider
      value={{
        APIURL,
        UPLOADSURL,
        loggedInUser,
        setLoggedInUser,
        profile,
        setProfile,
        myPosts,
        setMyPosts,
        people,
        setPeople,
      }}
    >
      {children}
    </LocalContext.Provider>
  );
}

export { LocalContext, LocalContextProvider };
