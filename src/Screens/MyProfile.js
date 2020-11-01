import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

import { LocalContext } from '../Context';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function MyProfile() {
  const [error, setError] = useState('Loading...');
  const [isModifying, setIsModifying] = useState(true);

  const history = useHistory();
  const {
    APIURL,
    loggedInUser,
    profile,
    setProfile,
    myPosts,
    setMyPosts,
  } = useContext(LocalContext);

  useEffect(() => {
    if (loggedInUser.uid === undefined) {
      // console.log(JSON.parse(localStorage.getItem('_userData')));
      if (!localStorage.getItem('_userData')) {
        setError('You need to login first to view this page.');
        setTimeout(() => history.push('/'), 500);
      } else {
        const { uid, jwt } = JSON.parse(localStorage.getItem('_userData'));

        const data = {
          uid,
          profileID: uid,
        };

        axios
          .post(`${APIURL}/api/profile/fetch`, data, {
            headers: { Authorization: `Bearer ${jwt}` },
          })
          .then((res) => {
            if (res.data.error !== 0) {
              setError(res.data.message);
              setTimeout(() => history.push('/'), 500);
            } else {
              setError('');
              setProfile(res.data);

              axios
                .post(
                  `${APIURL}/api/posts/get`,
                  { uid },
                  {
                    headers: { Authorization: `Bearer ${jwt}` },
                  }
                )
                .then((res) => {
                  if (res.data.error === 0) {
                    setMyPosts(res.data.posts);
                  } else {
                    setMyPosts([]);
                  }
                });
            }
          });
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="w-screen flex flex-col items-center">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-0 mb-4">
        My Profile
      </div>
      {error.length > 0 ? (
        <div className="text-2xl text-yellow-400 font-sans">{error}</div>
      ) : (
        <div className="sm:w-2/3 w-11/12 mx-auto flex flex-col items-center">
          <img
            src={`${profile.profile_pic ? profile.profile_pic : tmpAvatar}`}
            alt="Profile Picture"
            className="border-4 border-blue-400 rounded-full w-64 mb-4"
          />
          <div className="w-full pt-1 my-2 bg-gray-900 rounded"></div>
          {!isModifying ? (
            <div className="w-full flex flex-col items-center">
              <div className="font-bold sm:text-3xl text-xl tracking-wide text-blue-300 my-2 text-center">
                {profile.name}
                <br />
                <div className="text-blue-200 font-thin sm:text-xl text-md tracking-wide w-4/5 font-open text-center mx-auto">
                  {profile.bio}
                </div>
                <div className="text-green-400 sm:text-2xl text-lg mt-3">
                  {profile.username}
                </div>
              </div>
              <button
                className="sm:w-1/4 w-4/5 py-4 rounded bg-gray-900 hover:bg-gray-700 focus:bg-gray-700 font-bold tracking-wide text-gray-300 sm:text-xl"
                onClick={() => setIsModifying(true)}
              >
                Modify Profile
              </button>
            </div>
          ) : (
            <div></div>
          )}
          <div className="w-full pt-1 my-2 bg-gray-900 rounded"></div>
          {!isModifying && (
            <div className="text-blue-200 sm:text-xl text-md tracking-wide w-4/5 font-open text-center mx-auto mt-2">
              {myPosts.length > 0 ? myPosts : 'No posts yet.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
