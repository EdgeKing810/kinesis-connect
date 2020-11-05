import React, { useContext, useEffect, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';

import { LocalContext } from '../Context';

import tmpAvatar from '../Assets/images/avatar_tmp.png';
import FeedPost from '../Components/FeedPost';

export default function MyProfile() {
  const [error, setError] = useState('Loading...');
  const [isModifying, setIsModifying] = useState(false);

  const [modifiedValues, setModifiedValues] = useState(['', '', '', '']);

  const [password, setPassword] = useState('');
  const [file, setFile] = useState(null);

  const history = useHistory();
  const {
    APIURL,
    UPLOADSURL,
    setLoggedInUser,
    profile,
    setProfile,
    myPosts,
    setMyPosts,
  } = useContext(LocalContext);

  const classes = {
    input:
      'sm:w-2/5 w-4/5 sm:ml-4 p-2 text-gray-100 bg-gray-700 border-2 border-gray-600 rounded-lg overflow-hidden',
  };

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

      setModifiedValues([profile.name, profile.username, '', profile.bio]);
    }
    // eslint-disable-next-line
  }, []);

  const updateModifiedValues = (index, value) => {
    const update = modifiedValues.map((item, i) => {
      if (i === index) {
        return value;
      } else {
        return item;
      }
    });

    setModifiedValues(update);
  };

  const makeInput = (identifier, index, func) => (
    <div className="w-full flex sm:flex-row flex-col items-center sm:mt-2 mt-4">
      <div className="sm:text-xl text-lg font-kale font-bold text-blue-400 sm:mb-0 mb-1 sm:w-1/3 w-4/5">
        Change {identifier}
      </div>

      <input
        type={`${
          identifier.toLowerCase() === 'password' ? 'password' : 'text'
        }`}
        name="name"
        className={classes.input}
        value={modifiedValues[index]}
        onChange={(e) => {
          e.persist();
          e.preventDefault();
          updateModifiedValues(index, e.target.value);
        }}
      />

      <button
        className={`sm:ml-4 sm:w-1/5 w-3/5 p-2 bg-gray-900 ${
          password.length > 0 && modifiedValues[index].length > 0
            ? 'hover:bg-blue-600 focus:bg-blue-600'
            : 'opacity-50'
        } rounded-lg font-bold tracking-wide sm:text-lg text-md text-gray-200 sm:mt-0 mt-2`}
        onClick={
          password.length > 0 && modifiedValues[index].length > 0 ? func : null
        }
      >
        Change
      </button>
    </div>
  );

  const makeSingleInput = (title, variable, func) => (
    <div className="w-full flex sm:flex-row flex-col items-center sm:mt-2 mt-4">
      <div className="sm:text-xl text-lg font-kale font-bold text-blue-400 sm:mb-0 mb-1 sm:w-1/3 w-4/5">
        {title}
      </div>

      <input
        type="password"
        name={title}
        className={classes.input}
        value={variable}
        onChange={(e) => {
          e.persist();
          e.preventDefault();
          func(e.target.value);
        }}
      />
    </div>
  );

  const submitUpdate = (key, index, path) => {
    const data = {
      uid: profile.uid,
      password: password,
      old_password: password,
      [key]: modifiedValues[index],
    };

    axios
      .post(`${APIURL}${path}`, data, {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      })
      .then((res) => {
        if (res.data.error !== 0) {
          alert(res.data.message);
        } else {
          let updatedProfile = { ...profile };
          updatedProfile[key] = modifiedValues[index];

          setProfile(updatedProfile);
          alert('Successful!');
        }
      });
  };

  const handleUploadImage = (e) => {
    if (e.target.files[0]) {
      if (e.target.files[0].size > 5000000) {
        alert('File too large!');
      } else {
        setFile(e.target.files[0]);
      }
    }
  };

  const changeProfilePic = (e) => {
    e.preventDefault();

    const data = new FormData();
    data.append('file', file);

    setFile(null);

    axios.post(`${APIURL}/api/user/upload`, data).then((res) => {
      axios
        .post(
          `${APIURL}/api/profile/pic`,
          { uid: profile.uid, profile_pic_url: res.data.url },
          { headers: { Authorization: `Bearer ${profile.jwt}` } }
        )
        .then((response) => {
          if (response.data.error !== 0) {
            alert(response.data.message);
          } else {
            alert('Profile Pic Updated!');

            const updatedProfile = { ...profile };
            updatedProfile.profile_pic = res.data.url;

            setProfile(updatedProfile);
          }
        });
    });
  };

  const deleteAccount = (e) => {
    if (window.confirm('Are you sure you want to delete your account?')) {
      axios
        .post(
          `${APIURL}/api/user/delete`,
          { uid: profile.uid, password: password },
          { headers: { Authorization: `Bearer ${profile.jwt}` } }
        )
        .then((res) => {
          if (res.data.error !== 0) {
            alert(res.data.message);
          } else {
            alert('Account successfully deleted');

            history.push('/');
            localStorage.clear();
          }
        });
    }
  };

  const clearProfilePic = (e) => {
    e.preventDefault();

    axios
      .post(
        `${APIURL}/api/profile/pic`,
        { uid: profile.uid, profile_pic_url: '#' },
        { headers: { Authorization: `Bearer ${profile.jwt}` } }
      )
      .then((response) => {
        if (response.data.error !== 0) {
          alert(response.data.message);
        } else {
          alert('Profile Pic Removed!');

          const updatedProfile = { ...profile };
          updatedProfile.profile_pic = '';

          setProfile(updatedProfile);
        }
      });
  };

  const formattedPosts = myPosts.map((post) => (
    <FeedPost
      uid={profile.uid}
      profileID={profile.uid}
      username={profile.username}
      profile_pic={`${UPLOADSURL}/${profile.profile_pic}`}
      postID={post.postID}
      content={post.content}
      timestamp={post.timestamp}
      reacts={post.reacts}
      comments={post.comments}
      key={post.postID}
    />
  ));

  return (
    <div className="w-full flex flex-col items-center overflow-x-hidden">
      <div className="font-bold tracking-widest font-rale text-gray-200 sm:text-5xl text-3xl mt-8 sm:mb-0 mb-4">
        My Profile
      </div>
      {error.length > 0 ? (
        <div className="sm:text-2xl text-lg w-5/6 mx-auto text-yellow-400 font-sans text-center">
          {error}
        </div>
      ) : (
        <div className="sm:w-2/3 w-11/12 mx-auto flex flex-col items-center overflow-x-hidden">
          <img
            src={`${
              profile.profile_pic !== undefined &&
              profile.profile_pic.length > 1
                ? `${UPLOADSURL}/${profile.profile_pic}`
                : tmpAvatar
            }`}
            alt="Profile Pic"
            className="border-4 border-blue-400 rounded-full p-2 sm:w-64 w-56 sm:h-64 h-56 mb-4 object-scale-down"
          />
          <div className="w-full pt-1 my-2 bg-gray-900 rounded"></div>
          {!isModifying ? (
            <div className="w-full flex flex-col items-center">
              <div className="font-bold w-full sm:text-3xl text-2xl tracking-wide text-blue-300 my-2 text-center">
                {profile.name}
                <br />
                <div className="text-blue-200 font-thin sm:text-xl text-sm tracking-wide sm:w-4/5 w-full font-open text-center mx-auto p-2 border-2 border-dashed border-blue-500 my-4">
                  {profile.bio}
                </div>
                <div className="text-green-400 sm:text-2xl text-lg tracking-widest font-rale mt-3">
                  @{profile.username}
                </div>
              </div>
              <div className="w-full flex sm:flex-row flex-col sm:justify-center sm:items-start items-center">
                <button
                  className="sm:w-1/4 w-4/5 py-4 rounded bg-gray-900 hover:bg-gray-700 focus:bg-gray-700 font-bold tracking-wide text-gray-300 sm:text-xl sm:mr-2"
                  onClick={() => setIsModifying(true)}
                >
                  Modify Profile
                </button>

                <button
                  className="sm:w-1/4 w-4/5 py-4 rounded bg-gray-900 hover:bg-red-700 focus:bg-red-700 font-bold tracking-wide text-gray-300 sm:text-xl sm:my-0 my-2 sm:ml-2"
                  onClick={() => {
                    setLoggedInUser({});
                    setProfile({});
                    setMyPosts([]);

                    localStorage.clear();
                    history.push('/');
                  }}
                >
                  Logout
                </button>
              </div>
            </div>
          ) : (
            <div className="w-full flex flex-col items-center overflow-x-hidden">
              <div className="font-bold sm:text-3xl text-xl tracking-wide text-blue-200 my-2 text-center">
                Modify Profile
              </div>

              {makeSingleInput('Enter Current Password', password, setPassword)}

              <div className="w-full pt-1 my-4 bg-gray-900 rounded"></div>

              {makeInput('Name', 0, () =>
                submitUpdate('name', 0, '/api/user/update')
              )}

              {makeInput('Username', 1, () =>
                submitUpdate('username', 1, '/api/user/update')
              )}

              {makeInput('Password', 2, () =>
                submitUpdate('password', 2, '/api/user/update')
              )}

              {makeInput('Bio', 3, () =>
                submitUpdate('bio', 3, '/api/profile/update')
              )}

              <div className="w-full flex sm:flex-row flex-col items-center sm:mt-2 mt-4 overflow-x-hidden">
                <div className="sm:text-xl text-lg font-kale font-bold text-blue-400 sm:mb-0 mb-1 sm:w-1/3 w-4/5">
                  Change Profile Picture
                </div>

                <input
                  type="file"
                  name="profile_pic"
                  className={classes.input}
                  onChange={(e) => {
                    e.persist();
                    e.preventDefault();
                    handleUploadImage(e);
                  }}
                  multiple
                />

                <button
                  className={`sm:ml-4 sm:w-1/5 w-3/5 p-2 bg-gray-900 ${
                    file ? 'hover:bg-blue-600 focus:bg-blue-600' : 'opacity-50'
                  } rounded-lg font-bold tracking-wide sm:text-lg text-md text-gray-200 sm:mt-0 mt-2`}
                  onClick={(e) => (file ? changeProfilePic(e) : null)}
                >
                  Upload
                </button>
              </div>

              <div className="flex sm:flex-row flex-col sm:justify-around sm:items-start items-center w-11/12 mx-auto mt-4">
                <button
                  className={`p-2 sm:w-1/3 w-4/5 sm:text-xl text-lg font-bold tracking-wide font-open bg-gray-900 ${
                    profile.profile_pic !== undefined &&
                    profile.profile_pic.length > 0
                      ? 'hover:bg-yellow-600 focus:bg-yellow-600'
                      : 'opacity-50'
                  } rounded-lg text-gray-300`}
                  onClick={(e) =>
                    profile.profile_pic !== undefined &&
                    profile.profile_pic.length > 0
                      ? clearProfilePic(e)
                      : null
                  }
                >
                  Remove Profile Picture
                </button>

                <button
                  className={`p-2 sm:w-1/3 w-4/5 sm:text-xl text-lg font-bold tracking-wide font-open bg-gray-900 sm:mt-0 mt-2 ${
                    password.length > 0
                      ? 'hover:bg-red-600 focus:bg-red-600'
                      : 'opacity-50'
                  } rounded-lg text-gray-300`}
                  onClick={(e) =>
                    password.length > 0 ? deleteAccount(e) : null
                  }
                >
                  Delete Account
                </button>
              </div>

              <div className="w-full pt-1 my-2 bg-gray-900 rounded"></div>

              <button
                className="p-2 sm:w-1/4 w-4/5 sm:text-xl text-lg font-bold tracking-wide font-open bg-gray-900 hover:bg-green-600 focus:bg-green-600 rounded-lg text-gray-300"
                onClick={() => setIsModifying(false)}
              >
                Done
              </button>
            </div>
          )}
          <div className="w-full pt-1 my-2 bg-gray-900 rounded mb-4"></div>
          {!isModifying && (
            <div className="text-blue-200 sm:text-xl text-md tracking-wide sm:w-4/5 w-full font-open text-center mx-auto mt-2 flex flex-col items-center mb-8">
              <button
                className="sm:w-1/2 w-5/6 py-4 rounded bg-gray-900 hover:bg-blue-500 focus:bg-blue-500 font-bold tracking-wide text-gray-300 sm:text-xl mb-4"
                onClick={() => {
                  history.push('/post/create');
                }}
              >
                Create new post
              </button>

              {myPosts.length > 0 ? formattedPosts.reverse() : 'No posts yet.'}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
