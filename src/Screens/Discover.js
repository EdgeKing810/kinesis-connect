import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

import { LocalContext } from '../Context';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function Discover() {
  const [error, setError] = useState('Loading...');

  const { APIURL, UPLOADSURL, profile, setProfile, people } = useContext(
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

  const peopleYouMayKnow = [...people]
    .filter(
      (p) =>
        p.profileID !== profile.uid &&
        !profile.following.some((u) => p.profileID === u.uid)
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

  const followUser = (profileID) => {
    const bool = !profile.following.some((u) => u.uid === profileID);

    const data = {
      uid: profile.uid,
      profileID: profileID,
      status: bool ? 'true' : 'false',
    };

    setProfile((prev) => ({
      uid: prev.uid,
      name: prev.name,
      username: prev.username,
      email: prev.email,
      roomID: prev.roomID,
      bio: prev.bio,
      profile_pic: prev.profile_pic,
      followers: prev.followers,
      following: bool
        ? [...prev.following, { uid: profileID }]
        : prev.following.filter((p) => p.uid !== profileID),
      blocked: prev.blocked,
      chats: prev.chats,
      jwt: prev.jwt,
    }));

    axios.post(
      `${APIURL}/api/profile/follow`,
      { ...data },
      {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      }
    );
  };

  const card = ({ profileID, name, username, profile_pic }, id) => (
    <div
      className="bg-blue-900 flex-none rounded-lg flex flex-col items-center px-2 mx-2 my-2 w-64 sm:h-88 h-74"
      key={`${id}-${profileID}`}
    >
      <div className="w-full text-center text-blue-300 sm:text-xl text-lg tracking-wide font-open mt-2">
        {name}
      </div>

      <img
        src={
          profile_pic !== undefined && profile_pic.length > 1
            ? `${UPLOADSURL}/${profile_pic}`
            : tmpAvatar
        }
        alt="p.pic"
        className="my-2 border-4 border-blue-400 rounded-full p-2 sm:w-40 w-32 sm:h-40 h-32 sm:mb-4 mb-2 object-scale-down"
      />

      <div className="w-full text-center text-green-300 sm:text-xl text-lg font-rale tracking-wider sm:mb-0 mb-1 font-bold">
        @{username}
      </div>

      <hr />

      <button
        className="w-full p-1 my-1 rounded uppercase tracking-wide sm:text-lg text-center bg-blue-700 hover:bg-gray-900 focus:bg-gray-900 text-blue-200"
        onClick={() => history.push(`/${profileID}`)}
      >
        Visit Profile
      </button>

      <button
        className={`w-full p-1 my-1 rounded uppercase tracking-wide sm:text-lg text-center bg-blue-700 hover:bg-gray-900 focus:bg-gray-900 text-blue-200`}
        onClick={() => followUser(profileID)}
      >
        {profile.following.some((p) => p.uid === profileID)
          ? 'Unfollow'
          : 'Follow'}
      </button>
    </div>
  );

  return (
    <div className="w-full flex flex-col items-center">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-0 mb-4">
        Discover
      </div>
      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
          {error}
        </div>
      ) : (
        <div className="sm:w-2/3 w-11/12 mx-auto mb-4">
          <div className="font-bold tracking-wider font-open text-gray-400 sm:text-3xl text-xl mt-4 mb-2">
            People you may know ({peopleYouMayKnow.length})
          </div>
          <div className="w-full flex sm:py-2 py-4 overflow-x-scroll">
            {peopleYouMayKnow.map((p) => card(p, 'pymk'))}
          </div>

          <div className="font-bold tracking-wider font-open text-gray-400 sm:text-3xl text-xl mt-4 mb-2">
            People you follow ({peopleYouFollow.length})
          </div>
          <div className="w-full flex sm:py-2 py-4 overflow-x-scroll">
            {peopleYouFollow.map((p) => card(p, 'pyf'))}
          </div>

          <div className="font-bold tracking-wider font-open text-gray-400 sm:text-3xl text-xl mt-4 mb-2">
            People following you ({peopleFollowingYou.length})
          </div>
          <div className="w-full flex sm:py-2 py-4 overflow-x-scroll">
            {peopleFollowingYou.map((p) => card(p, 'pfw'))}
          </div>
        </div>
      )}
    </div>
  );
}
