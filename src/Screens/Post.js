import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

import { LocalContext } from '../Context';
import { Parser } from '../Components/renderers';

export default function Post() {
  const [error, setError] = useState('Loading...');
  const [content, setContent] = useState('');

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
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-0 mb-4">
        Create New Post
      </div>
      {error.length > 0 ? (
        <div className="text-2xl text-yellow-400 font-sans">{error}</div>
      ) : (
        <div className="w-5/6">
          <div className="font-bold tracking-widest font-open text-yellow-300 sm:text-3xl text-xl mt-8 sm:mb-0 mb-4">
            Content
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 text-gray-100 bg-gray-700 border-2 border-blue-400 rounded-lg sm:h-1/4"
            required
          />

          <div className="w-full pt-1 my-4 bg-gray-900 rounded"></div>

          <div className="font-bold tracking-widest font-open text-blue-300 sm:text-3xl text-xl mt-4 sm:mb-0 mb-4">
            Preview
          </div>

          <div className="w-full bg-gray-900 rounded-lg px-8 py-2 mb-4">
            <Parser content={content} />
          </div>
        </div>
      )}
    </div>
  );
}
