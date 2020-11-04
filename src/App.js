import React from 'react';
import { Redirect, Switch, Route, Link } from 'react-router-dom';

import LoginForm from './Screens/LoginForm';
import MyProfile from './Screens/MyProfile';
import Post from './Screens/Post';

export default function App() {
  return (
    <div className="w-full">
      <Switch>
        <Route exact path="/">
          <Redirect to="/login" />
        </Route>

        <Route exact path="/login">
          <LoginForm />
        </Route>

        <Route exact path="/feed">
          Feed
          <Link to="/profile">My Profile</Link>
        </Route>

        <Route exact path="/profile">
          <MyProfile />
        </Route>

        <Route exact path="/profile/:id">
          <div>profile</div>
        </Route>

        <Route exact path="/post/create">
          <Post />
        </Route>

        <Route exact path="/post/edit/:postID">
          <Post />
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
