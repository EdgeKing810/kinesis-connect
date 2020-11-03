import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import { v4 } from 'uuid';

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

  const createPost = (e) => {
    e.preventDefault();

    let d = new Date();
    const timestamp = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );

    const data = {
      uid: profile.uid,
      postID: v4(),
      content: content,
      timestamp: timestamp,
      reacts: [],
      comments: [],
    };

    axios
      .post(`${APIURL}/api/post/create`, data, {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      })
      .then((res) => {
        if (res.data.error !== 0) {
          alert(res.data.message);
        } else {
          alert('Post created successfully!');

          setContent('');
          setMyPosts((prev) => [...prev, data]);
          history.push('/profile');
        }
      });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-0 mb-4">
        Create New Post
      </div>
      {error.length > 0 ? (
        <div className="text-2xl text-yellow-400 font-sans">{error}</div>
      ) : (
        <div className="w-5/6">
          <div className="font-bold tracking-widest font-open text-yellow-300 sm:text-3xl text-xl sm:mt-8 mt-4 sm:mb-0 mb-4">
            Content
          </div>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full p-2 text-gray-100 bg-gray-700 border-2 border-blue-400 rounded-lg sm:h-1/4"
            required
          />

          <div className="w-full flex justify-center mt-2">
            <button
              className={`p-2 sm:w-1/4 w-4/5 sm:text-xl text-lg font-bold tracking-wide font-open bg-gray-900 ${
                content.length > 0
                  ? 'hover:bg-blue-500 focus:bg-blue-500'
                  : 'opacity-50'
              } rounded-lg text-gray-300`}
              onClick={(e) => (content.length > 0 ? createPost(e) : null)}
            >
              Create
            </button>
          </div>

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
