import React from 'react';
import ReactDOM from 'react-dom';

import { BrowserRouter as Router } from 'react-router-dom';

import App from './App';

import WebSocketWrapper from './WebSocketWrapper';

import { LocalContextProvider } from './Context';

ReactDOM.render(
  <LocalContextProvider>
    <Router>
      <WebSocketWrapper>
        <App />
      </WebSocketWrapper>
    </Router>
  </LocalContextProvider>,
  document.getElementById('root')
);
