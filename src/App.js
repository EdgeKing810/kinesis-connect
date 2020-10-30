import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import LoginForm from './Screens/LoginForm';

export default function App() {
  return (
    <div className="w-screen">
      <Switch>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        <Route exact path="/login">
          <LoginForm />
        </Route>
      </Switch>
    </div>
  );
}
