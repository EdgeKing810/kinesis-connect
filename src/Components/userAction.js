import axios from 'axios';

export default function userAction(
  profileID,
  operation,
  APIURL,
  profile,
  setProfile,
  setFeedPosts,
  ws
) {
  const bool =
    operation === 'block'
      ? !profile.blocked.some((u) => u.uid === profileID)
      : !profile.following.some((u) => u.uid === profileID);

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
    followers:
      operation === 'block'
        ? prev.followers.filter((p) => p.uid !== profileID)
        : [...prev.followers],
    following:
      operation === 'block' || (operation !== 'block' && !bool)
        ? prev.following.filter((p) => p.uid !== profileID)
        : bool
        ? [...prev.following, { uid: profileID }]
        : [...prev.following],
    blocked:
      operation === 'block'
        ? bool
          ? [...prev.blocked, { uid: profileID }]
          : prev.blocked.filter((p) => p.uid !== profileID)
        : [...prev.blocked],
    chats: prev.chats,
    jwt: prev.jwt,
  }));

  axios
    .post(
      `${APIURL}/api/profile/${operation === 'block' ? 'block' : 'follow'}`,
      { ...data },
      {
        headers: { Authorization: `Bearer ${profile.jwt}` },
      }
    )
    .then(() => {
      ws.send(
        JSON.stringify({
          roomID: profile.roomID,
          type: 'relation',
          operation: operation,
          uid: profile.uid,
          profileID: profileID,
          bool: bool,
        })
      );

      axios
        .post(
          `${APIURL}/api/feed/fetch`,
          { ...data },
          {
            headers: { Authorization: `Bearer ${profile.jwt}` },
          }
        )
        .then((response) => {
          if (response.data.error === 0) {
            setFeedPosts([...response.data.posts]);
          } else {
            setFeedPosts([]);
          }
        });
    });

  return null;
}
