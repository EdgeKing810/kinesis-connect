import React, { useState } from 'react';

const LocalContext = React.createContext();

function LocalContextProvider({ children }) {
  const [loggedInUser, setLoggedInUser] = useState({});

  const APIURL = 'https://api.connect.kinesis.games';

  return (
    <LocalContext.Provider value={{ APIURL, loggedInUser, setLoggedInUser }}>
      {children}
    </LocalContext.Provider>
  );
}

export { LocalContext, LocalContextProvider };
