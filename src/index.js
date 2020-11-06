import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';
import { LocalContextProvider } from './Context';

ReactDOM.render(
  <LocalContextProvider>
    <Router>
      <App />
    </Router>
  </LocalContextProvider>,
  document.getElementById('root')
);
