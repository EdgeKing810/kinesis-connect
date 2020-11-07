import React, { useContext, useEffect, useState } from 'react';
import { useHistory, useParams } from 'react-router-dom';

import { LocalContext } from '../Context';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

export default function UserProfile() {
  const [error, setError] = useState('Loading...');

  const { UPLOADSURL, people, profile } = useContext(LocalContext);
  const history = useHistory();

  const { profileID } = useParams();
  let currentProfile = people.find((p) => p.profileID === profileID.toString());

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
              currentProfile.profile_pic.length > 1
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
        </div>
      )}
    </div>
  );
}
