import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { LocalContext } from '../Context';
import userAction from '../Components/userAction';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function Discover() {
  const [error, setError] = useState('Loading...');

  const {
    APIURL,
    UPLOADSURL,
    profile,
    setProfile,
    people,
    setFeedPosts,
    ws,
  } = useContext(LocalContext);
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

  const peopleYouMayKnow = [...people]
    .filter(
      (p) =>
        p.profileID !== profile.uid &&
        !profile.following.some((u) => p.profileID === u.uid) &&
        !profile.blocked.some((u) => p.profileID === u.uid)
    )
    .reverse();

  const peopleYouFollow = [...people].filter(
    (p) =>
      p.profileID !== profile.uid &&
      profile.following.some((u) => p.profileID === u.uid)
  );

  const peopleFollowingYou = [...people].filter(
    (p) =>
      p.profileID !== profile.uid &&
      profile.followers.some((u) => p.profileID === u.uid)
  );

  const peopleBlocked = [...people].filter(
    (p) =>
      p.profileID !== profile.uid &&
      profile.blocked.some((u) => p.profileID === u.uid)
  );

  const card = ({ profileID, name, username, profile_pic }, id, operation) => {
    const bool =
      operation !== 'block'
        ? profile.following.some((p) => p.uid === profileID)
        : profile.blocked.some((p) => p.uid === profileID);

    return (
      <div
        className="bg-blue-900 flex-none rounded-lg flex flex-col items-center p-2 my-2 mr-2 w-64 h-auto"
        key={`${id}-${profileID}`}
      >
        <div className="w-full text-center text-blue-300 sm:text-xl text-lg tracking-wide font-open mt-2">
          {name.length > 15 ? `${name.substring(0, 15)}...` : name}
        </div>

        <img
          src={
            profile_pic !== undefined && profile_pic.length > 3
              ? `${UPLOADSURL}/${profile_pic}`
              : tmpAvatar
          }
          alt="p.pic"
          className="my-2 border-4 border-blue-400 rounded-full p-2 sm:w-40 w-32 sm:h-40 h-32 sm:mb-4 mb-2 object-scale-down"
        />

        <div className="w-full text-center text-green-300 sm:text-xl text-lg font-rale tracking-wider sm:mb-0 mb-1 font-bold">
          @{username.length > 12 ? `${name.substring(0, 12)}...` : username}
        </div>

        <hr />

        <button
          className="w-full p-1 my-1 rounded uppercase tracking-wide sm:text-lg text-center bg-blue-700 hover:bg-gray-900 focus:bg-gray-900 text-blue-200"
          onClick={() => history.push(`/profile/${profileID}`)}
        >
          Visit Profile
        </button>

        <button
          className={`w-full p-1 my-1 rounded uppercase tracking-wide sm:text-lg text-center bg-${
            bool ? 'red' : 'blue'
          }-700 hover:bg-gray-900 focus:bg-gray-900 text-blue-200`}
          onClick={() =>
            userAction(
              profileID,
              operation,
              APIURL,
              profile,
              setProfile,
              setFeedPosts,
              ws
            )
          }
        >
          {bool
            ? operation !== 'block'
              ? 'Unfollow'
              : 'Unblock'
            : operation !== 'block'
            ? 'Follow'
            : 'Block'}
        </button>
      </div>
    );
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl sm:mt-4 mt-8 sm:mb-0 mb-4">
        Discover
      </div>
      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
          {error}
        </div>
      ) : (
        <div className="sm:w-2/3 w-full mx-auto mb-4 px-1">
          <div className="font-bold tracking-wider font-open text-gray-400 sm:text-3xl text-xl mt-4 mb-1">
            Users you may know ({peopleYouMayKnow.length})
          </div>
          <div className="w-full flex sm:py-2 py-4 overflow-x-scroll overflow-y-hidden">
            {peopleYouMayKnow.map((p) => card(p, 'pymk', 'follow'))}
          </div>

          {/* <div className="w-full flex sm:py-2 py-4 overflow-x-scroll">
            {peopleYouMayKnow.map((p) => card(p, 'pymkb', 'block'))}
          </div> */}

          <div className="font-bold tracking-wider font-open text-gray-400 sm:text-3xl text-xl mt-4 mb-1">
            Followers ({peopleFollowingYou.length})
          </div>
          <div className="w-full flex sm:py-2 py-4 overflow-x-scroll overflow-y-hidden">
            {peopleFollowingYou.map((p) => card(p, 'pfw', 'follow'))}
          </div>

          <div className="font-bold tracking-wider font-open text-gray-400 sm:text-3xl text-xl mt-4 mb-1">
            Following ({peopleYouFollow.length})
          </div>
          <div className="w-full flex sm:py-2 py-4 overflow-x-scroll overflow-y-hidden">
            {peopleYouFollow.map((p) => card(p, 'pyf', 'follow'))}
          </div>

          <div className="font-bold tracking-wider font-open text-gray-400 sm:text-3xl text-xl mt-4 mb-1">
            Blocked ({peopleBlocked.length})
          </div>
          <div className="w-full flex sm:py-2 py-4 overflow-x-scroll overflow-y-hidden mb-4">
            {peopleBlocked.map((p) => card(p, 'bck', 'block'))}
          </div>
        </div>
      )}
    </div>
  );
}
