import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import { v4 } from 'uuid';

import { LocalContext } from '../Context';
import { Parser } from './renderers';

export default function FeedPost({
  uid,
  profileID,
  username,
  profile_pic,
  postID,
  content,
  timestamp,
  reacts,
  comments,
}) {
  const convertDate = (date) => {
    const oldDate = new Date(date);
    return new Date(
      Date.UTC(
        oldDate.getFullYear(),
        oldDate.getMonth(),
        oldDate.getDate(),
        oldDate.getHours(),
        oldDate.getMinutes(),
        oldDate.getSeconds()
      )
    ).toString();
  };

  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');

  const { APIURL, profile, setMyPosts } = useContext(LocalContext);
  const history = useHistory();

  const likePost = () => {
    const data = {
      uid: uid,
      profileID: profileID,
      postID: postID,
      like: liked ? 'false' : 'true',
    };

    axios.post(
      `${APIURL}/api/post/react`,
      { ...data },
      { headers: { Authorization: `Bearer ${profile.jwt}` } }
    );

    setMyPosts((prev) =>
      prev.map((post) => {
        if (post.postID === postID) {
          if (post.reacts.some((r) => r.uid === uid)) {
            return {
              uid: post.uid,
              postID: post.postID,
              content: post.content,
              timestamp: post.timestamp,
              reacts: post.reacts.filter((r) => r.uid !== uid),
              comments: post.comments,
            };
          } else {
            return {
              uid: post.uid,
              postID: post.postID,
              content: post.content,
              timestamp: post.timestamp,
              reacts: [...post.reacts, { uid: uid }],
              comments: post.comments,
            };
          }
        } else {
          return post;
        }
      })
    );
  };

  const deletePost = () => {
    const data = {
      uid: uid,
      postID: postID,
    };

    if (window.confirm('Are you sure you want to delete this post?')) {
      axios
        .post(
          `${APIURL}/api/post/delete`,
          { ...data },
          { headers: { Authorization: `Bearer ${profile.jwt}` } }
        )
        .then((res) => {
          alert(res.data.message);

          if (res.data.error === 0) {
            setMyPosts((prev) => prev.filter((post) => post.postID !== postID));
          }
        });
    }
  };

  const liked = reacts.some((r) => r.uid === uid);

  const makeComment = ({ uid, commentID, comment, timestamp, reacts }) => (
    <div
      className="w-11/12 mx-auto flex justify-around rounded-lg py-2 px-4 border-2 border-blue-900 my-2"
      key={commentID}
    >
      <div className="w-1/6 flex justify-center items-center">
        <img
          src={profile_pic}
          alt={'p.pic-comment'}
          className="w-12 h-12 rounded-full object-scale-down bg-blue-200 mr-2"
        />
      </div>

      <div className="flex flex-col items-start w-3/4 sm:ml-0 ml-2">
        <div className="font-bold tracking-wider sm:text-md text-sm mb-1">
          {username}
        </div>
        <div className="text-blue-200 sm:text-sm text-xs border-b border-gray-800 mb-2">
          {convertDate(timestamp).split(' ').slice(0, 5).join(' ')}
        </div>
        <div className="text-gray-200 sm:text-sm text-xs">{comment}</div>
      </div>
    </div>
  );

  const submitComment = (e) => {
    e.preventDefault();

    let d = new Date();
    const t = new Date(
      d.getUTCFullYear(),
      d.getUTCMonth(),
      d.getUTCDate(),
      d.getUTCHours(),
      d.getUTCMinutes(),
      d.getUTCSeconds()
    );

    const data = {
      uid: uid,
      profileID: profileID,
      postID: postID,
      commentID: v4(),
      comment: comment,
      timestamp: t,
      reacts: [],
    };

    setMyPosts((prev) =>
      prev.map((post) => {
        if (post.postID === postID) {
          return {
            uid: post.uid,
            postID: post.postID,
            content: post.content,
            timestamp: post.timestamp,
            reacts: post.reacts,
            comments: [...post.comments, data],
          };
        } else {
          return post;
        }
      })
    );

    axios.post(
      `${APIURL}/api/post/comment/add`,
      { ...data },
      { headers: { Authorization: `Bearer ${profile.jwt}` } }
    );
  };

  return (
    <div
      className="w-full flex flex-col items-center p-2 bg-gray-900 my-2 rounded-lg"
      key={postID}
    >
      <div className="flex items-center">
        <img
          src={profile_pic}
          alt={'p.pic'}
          className="sm:w-16 w-12 sm:h-16 h-12 p-1 rounded-full border-2 border-blue-400 object-scale-down mr-2"
        />

        <div className="h-full w-full flex flex-col items-start ml-2">
          <div className="sm:text-xl text-lg bg-blue-900 p-1 rounded">
            {username}
          </div>
          <div className="sm:text-md text-xs text-left italic">
            Posted on {convertDate(timestamp)}
          </div>
        </div>
      </div>

      <div className="pt-1 w-full bg-gray-800 my-2"></div>

      {uid === profileID ? (
        <div className="w-full">
          <div className="w-full flex justify-around py-1">
            <button
              className="w-2/5 sm:text-lg text-sm tracking-wider font-open hover:bg-indigo-700 focus:bg-indigo-700 flex justify-center items-center rounded py-1 text-blue-200 font-bold bg-gray-800"
              onClick={() => history.push(`/post/edit/${postID}`)}
            >
              Edit Post
            </button>
            <button
              className="w-2/5 sm:text-lg text-sm tracking-wider font-open hover:bg-red-700 focus:bg-red-700 flex justify-center items-center rounded py-1 text-blue-200 font-bold bg-gray-800"
              onClick={() => deletePost()}
            >
              Delete Post
            </button>
          </div>

          <div className="pt-1 w-full bg-gray-800 my-2"></div>
        </div>
      ) : (
        ''
      )}

      <div className="w-5/6 flex flex-col items-start -mb-1">
        <Parser content={content} />
      </div>

      <div className="pt-1 w-full bg-gray-800 mt-4 mb-2"></div>

      <div className="w-full flex justify-between">
        <button
          className={`w-49/100 p-2 sm:text-xl text-md bg-${
            liked ? 'blue' : 'gray'
          }-900 tracking-wider font-open hover:bg-gray-700 focus:bg-gray-700 flex justify-center items-center rounded`}
          onClick={() => likePost()}
        >
          Like{liked ? 'd' : ''}
          <div
            className={`ml-2 text-md ri-thumb-up-${liked ? 'fill' : 'line'}`}
          ></div>
        </button>
        <button
          className={`w-49/100 p-2 sm:text-xl text-md ${
            showComment ? 'bg-blue-900' : ''
          } tracking-wider font-open hover:bg-gray-700 focus:bg-gray-700 flex justify-center items-center rounded`}
          onClick={() => {
            setShowComment((prev) => !prev);
          }}
        >
          {showComment ? 'Hide Comments' : 'Show Comments'}{' '}
          <div
            className={`ml-2 text-md ri-message-3-${
              showComment ? 'fill' : 'line'
            }`}
          ></div>
        </button>
      </div>
      {showComment ? (
        <div className="w-full mt-4 mb-2">
          <div className="pt-1 w-full bg-gray-800 mb-4"></div>

          {comments.map((c) => makeComment(c))}

          <div className="w-11/12 mx-auto flex sm:flex-row flex-col sm:justify-between items-center">
            <div className="sm:w-1/5 w-2/5 flex justify-center items-center sm:text-md text-sm font-rale sm:mb-0 mb-2 tracking-wider text-blue-300 border-2 border-blue-900 p-1 rounded-lg">
              {profile.username}
            </div>

            <input
              type="text"
              name="commentBox"
              value={comment}
              placeholder="Type Something..."
              className="sm:w-1/2 w-5/6 p-2 text-gray-100 placeholder-gray-500 bg-gray-700 sm:text-sm text-xs rounded-lg"
              onChange={(e) => setComment(e.target.value)}
            />

            <button
              className={`p-1 sm:text-md text-sm sm:w-1/5 w-1/2 sm:mt-0 mt-2 bg-gray-800 ${
                comment.length > 0
                  ? 'hover:bg-blue-900 focus:bg-blue-900'
                  : 'opacity-50'
              } rounded-lg`}
              onClick={(e) => (comment.length > 0 ? submitComment(e) : null)}
            >
              Comment
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
