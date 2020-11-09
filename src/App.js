import React from 'react';
import { Redirect, Switch, Route } from 'react-router-dom';

import NavBar from './Components/NavBar';

import LoginForm from './Screens/LoginForm';
import MyProfile from './Screens/MyProfile';
import UserProfile from './Screens/UserProfile';
import Post from './Screens/Post';
import Discover from './Screens/Discover';
import Feed from './Screens/Feed';
import Chat from './Screens/Chat';

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
                <Feed />
              </Route>
              <Route exact path="/profile">
                <MyProfile />
              </Route>
              <Route exact path="/profile/:profileID">
                <UserProfile />
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
                <Chat />
              </Route>

              <Route render={() => <Redirect to="/" />} />
            </Switch>
          </div>
        </Route>
      </Switch>
    </div>
  );
}
