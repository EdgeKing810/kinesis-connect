import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import LoginForm from './Screens/LoginForm';
import MyProfile from './Screens/MyProfile';

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

        <Route exact path="/feed">
          <div>feed</div>
        </Route>

        <Route exact path="/profile">
          <MyProfile />
        </Route>

        <Route exact path="/profile/:id">
          <div>profile</div>
        </Route>

        <Route exact path="/chat">
          <div>chat</div>
        </Route>

        <Route exact path="/discover">
          <div>discover</div>
        </Route>
      </Switch>
    </div>
  );
}
