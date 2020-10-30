import React from 'react';

const LocalContext = React.createContext();

function LocalContextProvider({ children }) {
  const APIURL = 'https://api.connect.kinesis.games';

  return (
    <LocalContext.Provider value={{ APIURL }}>{children}</LocalContext.Provider>
  );
}

export { LocalContext, LocalContextProvider };
