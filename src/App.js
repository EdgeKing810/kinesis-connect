import React, { useContext } from 'react';
import { Redirect, Switch, Route, useHistory } from 'react-router-dom';

import NavBar from './Components/NavBar';

import LoginForm from './Screens/LoginForm';
import MyProfile from './Screens/MyProfile';
import UserProfile from './Screens/UserProfile';
import Post from './Screens/Post';
import Discover from './Screens/Discover';
import Feed from './Screens/Feed';
import Chat from './Screens/Chat';

import { LocalContext } from './Context';

export default function App() {
  const { profile, setProfile, setPeople, ws } = useContext(LocalContext);
  const history = useHistory();

  const handleWebSockets = ({ data }) => {
    const dataObj = JSON.parse(data);
    let entityData = { ...dataObj };

    switch (dataObj.type) {
      case 'profile_change':
        if (dataObj.uid === profile.uid) {
          setProfile((prev) => {
            entityData = { ...prev };

            entityData.uid = dataObj.uid;
            entityData.profileID = dataObj.uid;
            entityData.name = dataObj.name;
            entityData.username = dataObj.username;
            entityData.bio = dataObj.bio;

            return entityData;
          });
        }

        setPeople((prev) => {
          let updatedPeople = [];

          prev.forEach((p) => {
            if (p.profileID === dataObj.uid) {
              updatedPeople.push({ ...entityData });
            } else {
              updatedPeople.push({ ...p });
            }
          });

          return [...updatedPeople];
        });

        break;

      case 'account_delete':
        history.push('/');
        localStorage.clear();

      default:
        break;
    }
  };

  ws.addEventListener('message', handleWebSockets);

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
          <div className="w-screen sm:h-screen">
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
