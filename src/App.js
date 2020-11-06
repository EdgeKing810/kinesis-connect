import React from 'react';
import { Redirect, Switch, Route, Link } from 'react-router-dom';

import NavBar from './Components/NavBar';

import LoginForm from './Screens/LoginForm';
import MyProfile from './Screens/MyProfile';
import Post from './Screens/Post';
import Discover from './Screens/Discover';

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

        <Route>
          <div className="w-screen">
            <NavBar />

            <Switch>
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
              <Route exact path="/discover">
                <Discover />
              </Route>
              <Route exact path="/chat">
                <div>chat</div>
              </Route>

              <Route render={() => <Redirect to="/" />} />
            </Switch>
          </div>
        </Route>
      </Switch>
    </div>
  );
}
