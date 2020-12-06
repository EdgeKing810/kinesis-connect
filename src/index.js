import React from 'react';
import ReactDOM from 'react-dom';

import { HashRouter as Router } from 'react-router-dom';

import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import App from './App';

import WebSocketWrapper from './WebSocketWrapper';

import { LocalContextProvider } from './Context';

const options = {
  position: positions.BOTTOM_CENTER,
  timeout: 2000,
  offset: '30px',
  transition: transitions.SCALE,
};

ReactDOM.render(
  <LocalContextProvider>
    <Router>
      <WebSocketWrapper>
        <AlertProvider template={AlertTemplate} {...options}>
          <App />
        </AlertProvider>
      </WebSocketWrapper>
    </Router>
  </LocalContextProvider>,
  document.getElementById('root')
);
