import React, { useState } from 'react';

const LocalContext = React.createContext();

function LocalContextProvider({ children }) {
  const [loggedInUser, setLoggedInUser] = useState({});

  const [profile, setProfile] = useState([]);
  const [myPosts, setMyPosts] = useState([]);

  const APIURL = 'https://api.connect.kinesis.games';

  return (
    <LocalContext.Provider
      value={{
        APIURL,
        loggedInUser,
        setLoggedInUser,
        profile,
        setProfile,
        myPosts,
        setMyPosts,
      }}
    >
      {children}
    </LocalContext.Provider>
  );
}

export { LocalContext, LocalContextProvider };
