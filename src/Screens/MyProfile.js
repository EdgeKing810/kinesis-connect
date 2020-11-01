import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

import { LocalContext } from '../Context';

export default function MyProfile() {
  const [error, setError] = useState('Loading...');

  const history = useHistory();
  const { APIURL, loggedInUser, setProfile } = useContext(LocalContext);

  useEffect(() => {
    if (loggedInUser.uid === undefined) {
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
              setProfile(res.data);
            }
          });
      }
    }
    // eslint-disable-next-line
  }, []);

  return (
    <div>
      <div>My Profile</div>
      <div>{error}</div>
    </div>
  );
}
