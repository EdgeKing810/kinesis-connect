import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { useAlert } from 'react-alert';

import axios from 'axios';
import { v4 } from 'uuid';

import { LocalContext } from '../Context';
import { Parser } from '../Components/renderers';

export default function Post() {
  const [error, setError] = useState('Loading...');

  const { postID } = useParams();
  const edit = postID !== undefined;

  const history = useHistory();
  const alert = useAlert();
  const { APIURL, UPLOADSURL, UPLOADERURL, profile, myPosts, setMyPosts, ws } =
    useContext(LocalContext);

  let content, reacts, comments;
  if (edit && myPosts.length > 0) {
    const myPost = myPosts.find((p) => p.postID === postID);

    content = myPost.content;
    reacts = myPost.reacts;
    comments = myPosts.comments;
  }

  const [postContent, setPostContent] = useState(edit ? content : '');

  useEffect(() => {
    if (
      !localStorage.getItem('_userData') ||
      profile.jwt === undefined ||
      !profile.jwt
    ) {
      setError('You need to login first to view this page.');
      setTimeout(() => history.push('/'), 500);
    } else {
      setError('');
    }
    // eslint-disable-next-line
  }, []);

  const uploadImage = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 10485760) {
        alert.error('File too large!');
      } else {
        e.preventDefault();

        const data = new FormData();
        data.append('file', e.target.files[0]);

        axios.post(`${UPLOADERURL}/api/upload`, data).then((res) => {
          setPostContent(
            (prev) => `${prev}\n![](${UPLOADSURL}/${res.data.path})`
          );

          axios.post(
            `${APIURL}/api/links/create`,
            { uid: profile.uid, link: res.data.path, linkID: v4() },
            { headers: { Authorization: `Bearer ${profile.jwt}` } }
          );
        });
      }
    }
  };

  const submitPost = (e) => {
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
      postID: edit ? postID : v4(),
      content: postContent,
      timestamp: timestamp,
      reacts: edit ? reacts : [],
      comments: edit ? comments : [],
    };

    axios
      .post(`${APIURL}/api/post/${edit ? 'update' : 'create'}`, data, {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      })
      .then((res) => {
        if (res.data.error !== 0) {
          alert.error(res.data.message);
        } else {
          alert.success(`Post ${edit ? 'edited' : 'created'} successfully!`);

          setPostContent('');

          ws.send(
            JSON.stringify({
              roomID: profile.roomID,
              type: `post_${edit ? 'edit' : 'new'}`,
              uid: profile.uid,
              postID: data.postID,
              content: data.content,
              timestamp: data.timestamp,
              reacts: data.reacts ? data.reacts : [],
              comments: data.comments ? data.comments : [],
            })
          );

          if (!edit) {
            setMyPosts((prev) => [...prev, data]);
          } else {
            setMyPosts((prev) =>
              prev.map((p) => {
                if (p.postID === postID) {
                  return data;
                } else {
                  return p;
                }
              })
            );
          }

          history.push('/profile');
        }
      });
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl sm:mt-4 mt-8 sm:mb-0 mb-4">
        {edit ? 'Edit' : 'Create New'} Post
      </div>
      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
          {error}
        </div>
      ) : (
        <div className="w-5/6">
          <div className="font-bold tracking-widest font-open text-yellow-300 sm:text-3xl text-xl sm:mt-8 mt-4 sm:mb-0 mb-4">
            Content
          </div>
          <textarea
            value={postContent}
            onChange={(e) => setPostContent(e.target.value)}
            className="w-full p-2 text-gray-100 bg-gray-700 border-2 border-blue-400 rounded-lg sm:h-1/4"
            style={{ minHeight: '12em' }}
            required
          />

          <div className="w-full flex sm:flex-row flex-col sm:justify-around sm:items-start items-center mt-2">
            <button
              className={`p-2 sm:w-1/4 w-4/5 sm:text-xl text-lg font-bold tracking-wide font-open bg-gray-900 ${
                postContent.length > 0
                  ? 'hover:bg-blue-500 focus:bg-blue-500'
                  : 'opacity-50 z-0'
              } rounded-lg text-gray-300 transition ease-in-out duration-300`}
              onClick={(e) => (postContent.length > 0 ? submitPost(e) : null)}
            >
              {edit ? 'Update' : 'Create'}
            </button>

            <input
              className={`p-2 sm:w-1/4 w-4/5 sm:text-xl text-lg font-bold tracking-wide font-open bg-gray-900 rounded-lg text-gray-300 sm:mt-0 mt-2 overflow-hidden`}
              type="file"
              accept=".jpg,.jpeg,.png,.svg,.gif,.bmp"
              onChange={(e) => {
                e.persist();
                uploadImage(e);
              }}
            />

            <button
              className={`p-2 sm:w-1/4 w-4/5 sm:text-xl text-lg font-bold tracking-wide font-open bg-gray-900 hover:bg-red-500 focus:bg-red-500 rounded-lg text-gray-300 sm:mt-0 mt-2 transition ease-in-out duration-300`}
              onClick={() => {
                setPostContent('');
                history.push('/profile');
              }}
            >
              Cancel
            </button>
          </div>

          <div className="w-full pt-1 my-4 bg-gray-900 rounded"></div>

          <div className="font-bold tracking-widest font-open text-blue-300 sm:text-3xl text-xl mt-4 sm:mb-0 mb-4">
            Preview
          </div>

          <div className="w-full flex flex-col items-center bg-gray-900 rounded-lg px-8 py-2 mb-8">
            <div className="w-full " style={{ whiteSpace: 'pre-line' }}>
              <Parser content={postContent} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
