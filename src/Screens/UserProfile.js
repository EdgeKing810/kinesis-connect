import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import LazyLoad from 'react-lazyload';

import { LocalContext } from '../Context';
import FeedPost from '../Components/FeedPost';
import userAction from '../Components/userAction';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function UserProfile() {
  const [error, setError] = useState('Loading...');

  const {
    APIURL,
    UPLOADSURL,
    people,
    profile,
    setProfile,
    feedPosts,
    setFeedPosts,
    ws,
  } = useContext(LocalContext);
  const history = useHistory();

  const { profileID } = useParams();
  let currentProfile = people.find((p) => p.profileID === profileID.toString());

  let isFollowing =
    profile.following !== undefined
      ? profile.following.some((p) => p.uid === profileID)
      : false;
  let isBlocked =
    profile.blocked !== undefined
      ? profile.blocked.some((p) => p.uid === profileID)
      : false;

  let userPosts =
    feedPosts.length > 0
      ? feedPosts.filter((post) => post.uid === profileID)
      : [];

  useEffect(() => {
    if (
      !localStorage.getItem('_userData') ||
      profile.jwt === undefined ||
      !profile.jwt
    ) {
      setError('You need to login first to view this page.');
      setTimeout(() => history.push('/'), 500);
    } else {
      if (profile.uid === profileID || profileID === undefined) {
        history.push('/profile');
      } else {
        setError('');
      }
    }
    // eslint-disable-next-line
  }, []);

  const formattedPosts = userPosts.map((post) => (
    <LazyLoad key={`${post.postID}-profile`}>
      <FeedPost
        uid={profile.uid}
        profileID={profileID}
        username={currentProfile.username}
        profile_pic={
          currentProfile.profile_pic !== undefined &&
          currentProfile.profile_pic.length > 3
            ? `${UPLOADSURL}/${currentProfile.profile_pic}`
            : tmpAvatar
        }
        postID={post.postID}
        content={post.content}
        timestamp={post.timestamp}
        reacts={post.reacts}
        comments={post.comments}
        keyname={`${post.postID}-profile`}
        key={`${post.postID}-profile`}
        personal={false}
        ws={ws}
      />
    </LazyLoad>
  ));

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-0 mb-4">
        User Profile
      </div>
      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
          {error}
        </div>
      ) : (
        <div className="sm:w-2/3 w-11/12 mx-auto flex flex-col items-center">
          <img
            src={`${
              currentProfile.profile_pic !== undefined &&
              currentProfile.profile_pic.length > 3
                ? `${UPLOADSURL}/${currentProfile.profile_pic}`
                : tmpAvatar
            }`}
            alt="Profile Pic"
            className="border-4 border-blue-400 rounded-full p-2 sm:w-64 w-56 sm:h-64 h-56 mb-4 object-scale-down"
          />

          <div className="w-full pt-1 my-2 bg-gray-900 rounded"></div>

          <div className="w-full flex flex-col items-center">
            <div className="font-bold w-full sm:text-3xl text-2xl tracking-wide text-blue-300 my-2 text-center">
              {currentProfile.name}
              <br />
              <div className="text-blue-200 font-thin sm:text-xl text-sm tracking-wide sm:w-4/5 w-full font-open text-center mx-auto p-2 border-2 border-dashed border-blue-500 my-4">
                {currentProfile.bio}
              </div>
              <div className="text-green-400 sm:text-2xl text-lg tracking-widest font-rale mt-3">
                @{currentProfile.username}
              </div>
            </div>
          </div>

          <div className="w-full pt-1 mt-2 mb-4 bg-gray-900 rounded"></div>

          <div className="w-full flex sm:flex-row flex-col justify-around sm:items-start items-center">
            {!isBlocked ? (
              <button
                className={`sm:w-1/3 w-5/6 sm:py-4 py-2 rounded-lg sm:text-lg bg-blue-${
                  isFollowing ? '900' : '700'
                } text-gray-200 hover:bg-blue-${
                  isFollowing ? '700' : '900'
                } focus:bg-blue-${
                  isFollowing ? '700' : '900'
                } sm:mb-0 mb-2 transition ease-in-out duration-300`}
                onClick={() =>
                  userAction(
                    profileID,
                    'follow',
                    APIURL,
                    profile,
                    setProfile,
                    setFeedPosts,
                    ws
                  )
                }
              >
                {isFollowing ? 'Unfollow' : 'Follow'}
              </button>
            ) : (
              ''
            )}

            <button
              className={`sm:w-1/3 w-5/6 sm:py-4 py-2 rounded-lg sm:text-lg bg-red-${
                isBlocked ? '900' : '700'
              } text-gray-200 hover:bg-red-${
                isBlocked ? '700' : '900'
              } focus:bg-red-${
                isBlocked ? '700' : '900'
              } transition ease-in-out duration-300`}
              onClick={() =>
                userAction(
                  profileID,
                  'block',
                  APIURL,
                  profile,
                  setProfile,
                  setFeedPosts,
                  ws
                )
              }
            >
              {isBlocked ? 'Unblock' : 'Block'}
            </button>
          </div>

          <div className="w-full pt-1 mt-4 mb-2 bg-gray-900 rounded"></div>

          {!isFollowing || isBlocked || !userPosts.length > 0 ? (
            <div className="w-full sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
              {!isFollowing || isBlocked
                ? `Need to ${
                    isBlocked ? 'unblock' : !isFollowing ? 'follow' : ''
                  }${' '}
              ${currentProfile.username}${' '}
              to view posts.`
                : 'No posts yet.'}
            </div>
          ) : (
            <div className="sm:w-4/5 w-11/12 mx-auto mb-4 text-blue-200 sm:text-xl text-md tracking-wide">
              {formattedPosts.reverse()}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
