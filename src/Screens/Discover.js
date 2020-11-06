import React, { useContext, useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';

import { LocalContext } from '../Context';

export default function Discover() {
  const [error, setError] = useState('Loading...');

  const { profile } = useContext(LocalContext);
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

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-0 mb-4">
        Discover
      </div>
      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
          {error}
        </div>
      ) : (
        <div className="sm:w-2/3 w-11/12 mx-auto flex flex-col">
          <div className="font-bold tracking-wider font-open text-gray-400 sm:text-3xl text-xl my-4 underline">
            People you may know
          </div>
        </div>
      )}
    </div>
  );
}
