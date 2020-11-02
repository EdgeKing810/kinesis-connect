import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

import { LocalContext } from '../Context';

export default function Post() {
  const [error, setError] = useState('Loading...');

  const history = useHistory();
  const { APIURL, profile, setProfile, setMyPosts } = useContext(LocalContext);

  useEffect(() => {
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
            setProfile({ ...res.data, jwt: jwt });
          }
        });
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div className="w-screen flex flex-col items-center overflow-x-hidden">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-0 mb-4">
        Create New Post
      </div>
      {error.length > 0 ? (
        <div className="text-2xl text-yellow-400 font-sans">{error}</div>
      ) : (
        <div></div>
      )}
    </div>
  );
}
