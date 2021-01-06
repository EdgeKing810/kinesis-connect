import React from 'react';
import ReactDOM from 'react-dom';

import { HashRouter as Router } from 'react-router-dom';

import { transitions, positions, Provider as AlertProvider } from 'react-alert';
import AlertTemplate from 'react-alert-template-basic';

import App from './App';

import WebSocketWrapper from './WebSocketWrapper';

import { LocalContextProvider } from './Context';

import ReactGA from 'react-ga';
import { createBrowserHistory } from 'history';

const history = createBrowserHistory();

const trackingId = 'UA-186719743-4';
ReactGA.initialize(trackingId);

history.listen((location) => {
  ReactGA.set({ page: location.pathname });
  ReactGA.pageview(location.pathname);
});

const options = {
  position: positions.BOTTOM_CENTER,
  timeout: 2000,
  offset: '30px',
  transition: transitions.SCALE,
};

ReactDOM.render(
  <LocalContextProvider>
    <Router history={history}>
      <WebSocketWrapper>
        <AlertProvider template={AlertTemplate} {...options}>
          <App />
        </AlertProvider>
      </WebSocketWrapper>
    </Router>
  </LocalContextProvider>,
  document.getElementById('root')
);
