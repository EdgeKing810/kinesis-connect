import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { LocalContext } from '../Context';
import FeedPost from '../Components/FeedPost';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function Feed() {
  const [error, setError] = useState('Loading...');

  const { UPLOADSURL, profile, people, feedPosts, ws } = useContext(
    LocalContext
  );
  const history = useHistory();

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

  const displayPosts = feedPosts.map((post) => {
    const currentUser = people.find((p) => p.profileID === post.uid);

    return (
      <FeedPost
        uid={profile.uid}
        profileID={post.uid}
        username={currentUser.username}
        profile_pic={
          currentUser.profile_pic !== undefined &&
          currentUser.profile_pic.length > 3
            ? `${UPLOADSURL}/${currentUser.profile_pic}`
            : tmpAvatar
        }
        postID={post.postID}
        content={post.content}
        timestamp={post.timestamp}
        reacts={post.reacts}
        comments={post.comments}
        keyname={`${post.postID}-feed`}
        personal={false}
        key={`${post.postID}-feed`}
        ws={ws}
      />
    );
  });

  return (
    <div className="w-full flex flex-col items-center">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl sm:mt-4 mt-8 sm:mb-0 mb-4">
        Feed
      </div>
      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
          {error}
        </div>
      ) : (
        <div className="sm:w-4/5 w-11/12 mb-4 text-blue-200 sm:text-xl text-md tracking-wide text-center">
          {displayPosts.length > 0 ? (
            <div className="w-full">{displayPosts.reverse()}</div>
          ) : (
            <p className="w-full text-center text-yellow-400">
              Follow more users to see posts here!
            </p>
          )}
        </div>
      )}
    </div>
  );
}
