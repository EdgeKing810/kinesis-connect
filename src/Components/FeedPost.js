import React, { useContext, useState } from 'react';
import { useHistory } from 'react-router-dom';

import axios from 'axios';
import { v4 } from 'uuid';

import { LocalContext } from '../Context';
import { Parser } from './renderers';

import tmpAvatar from '../Assets/images/avatar_tmp.png';

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
  keyname,
  personal,
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

  const [showReacts, setShowReacts] = useState(false);

  const [comment, setComment] = useState('');

  const [showComment, setShowComment] = useState(false);
  const [isEditingComment, setIsEditingComment] = useState('');
  const [showCommentReacts, setShowCommentReacts] = useState('');

  const {
    APIURL,
    UPLOADSURL,
    profile,
    setMyPosts,
    setFeedPosts,
    people,
  } = useContext(LocalContext);
  const history = useHistory();

  const userID = uid;

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

    if (personal) {
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
    } else {
      setFeedPosts((prev) =>
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
    }
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
            if (personal) {
              setMyPosts((prev) =>
                prev.filter((post) => post.postID !== postID)
              );
            } else {
              setFeedPosts((prev) =>
                prev.filter((post) => post.postID !== postID)
              );
            }
          }
        });
    }
  };

  const liked = reacts.some((r) => r.uid === uid);

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
      commentID: isEditingComment.length > 0 ? isEditingComment : v4(),
      comment: comment,
      timestamp: t,
      reacts:
        isEditingComment.length > 0
          ? comments.find((c) => c.commentID === isEditingComment).reacts
          : [],
    };

    if (personal) {
      setMyPosts((prev) =>
        prev.map((post) => {
          if (post.postID === postID) {
            return {
              uid: post.uid,
              postID: post.postID,
              content: post.content,
              timestamp: post.timestamp,
              reacts: post.reacts,
              comments:
                isEditingComment.length > 0
                  ? post.comments.map((c) => {
                      if (c.commentID === isEditingComment) {
                        return data;
                      } else {
                        return c;
                      }
                    })
                  : [...post.comments, data],
            };
          } else {
            return post;
          }
        })
      );
    } else {
      setFeedPosts((prev) =>
        prev.map((post) => {
          if (post.postID === postID) {
            return {
              uid: post.uid,
              postID: post.postID,
              content: post.content,
              timestamp: post.timestamp,
              reacts: post.reacts,
              comments:
                isEditingComment.length > 0
                  ? post.comments.map((c) => {
                      if (c.commentID === isEditingComment) {
                        return data;
                      } else {
                        return c;
                      }
                    })
                  : [...post.comments, data],
            };
          } else {
            return post;
          }
        })
      );
    }

    axios.post(
      `${APIURL}/api/post/comment/${
        isEditingComment.length > 0 ? 'edit' : 'add'
      }`,
      { ...data },
      { headers: { Authorization: `Bearer ${profile.jwt}` } }
    );

    if (isEditingComment.length > 0) {
      setIsEditingComment('');
      setComment('');
    }
  };

  const reactComment = (e, commentID, like) => {
    e.preventDefault();

    const data = {
      uid: uid,
      profileID: profileID,
      postID: postID,
      commentID: commentID,
      like: like,
    };

    if (personal) {
      setMyPosts((prev) =>
        prev.map((post) => {
          if (post.postID === postID) {
            return {
              uid: post.uid,
              postID: post.postID,
              content: post.content,
              timestamp: post.timestamp,
              reacts: post.reacts,
              comments: post.comments.map((comm) => {
                if (comm.commentID === commentID) {
                  return {
                    uid: comm.uid,
                    commentID: comm.commentID,
                    comment: comm.comment,
                    timestamp: comm.timestamp,
                    reacts:
                      like === 'true'
                        ? [...comm.reacts, { uid: uid }]
                        : comm.reacts.filter((c) => c.uid !== uid),
                  };
                } else {
                  return comm;
                }
              }),
            };
          } else {
            return post;
          }
        })
      );
    } else {
      setFeedPosts((prev) =>
        prev.map((post) => {
          if (post.postID === postID) {
            return {
              uid: post.uid,
              postID: post.postID,
              content: post.content,
              timestamp: post.timestamp,
              reacts: post.reacts,
              comments: post.comments.map((comm) => {
                if (comm.commentID === commentID) {
                  return {
                    uid: comm.uid,
                    commentID: comm.commentID,
                    comment: comm.comment,
                    timestamp: comm.timestamp,
                    reacts:
                      like === 'true'
                        ? [...comm.reacts, { uid: uid }]
                        : comm.reacts.filter((c) => c.uid !== uid),
                  };
                } else {
                  return comm;
                }
              }),
            };
          } else {
            return post;
          }
        })
      );
    }

    axios.post(
      `${APIURL}/api/post/comment/react`,
      { ...data },
      { headers: { Authorization: `Bearer ${profile.jwt}` } }
    );
  };

  const deleteComment = (e, commentID) => {
    e.preventDefault();

    const data = {
      uid: uid,
      profileID: profileID,
      postID: postID,
      commentID: commentID,
    };

    if (window.confirm('Are you sure you want to delete this comment?')) {
      if (personal) {
        setMyPosts((prev) =>
          prev.map((post) => {
            if (post.postID === postID) {
              return {
                uid: post.uid,
                postID: post.postID,
                content: post.content,
                timestamp: post.timestamp,
                reacts: post.reacts,
                comments: post.comments.filter(
                  (comm) => comm.commentID !== commentID
                ),
              };
            } else {
              return post;
            }
          })
        );
      } else {
        setFeedPosts((prev) =>
          prev.map((post) => {
            if (post.postID === postID) {
              return {
                uid: post.uid,
                postID: post.postID,
                content: post.content,
                timestamp: post.timestamp,
                reacts: post.reacts,
                comments: post.comments.filter(
                  (comm) => comm.commentID !== commentID
                ),
              };
            } else {
              return post;
            }
          })
        );
      }

      axios.post(
        `${APIURL}/api/post/comment/delete`,
        { ...data },
        { headers: { Authorization: `Bearer ${profile.jwt}` } }
      );
    }
  };

  const makeComment = ({ uid, commentID, comment, timestamp, reacts }) => {
    let currentPerson = { username: 'username', profile_pic: '' };

    people.forEach((p) => {
      if (p.profileID === uid) {
        currentPerson.username = p.username;
        currentPerson.profile_pic = p.profile_pic;
      }
    });

    let commentReacts = [];

    reacts.forEach((r) => {
      people.forEach((p) => {
        if (p.profileID === r.uid) {
          commentReacts.push({ profileID: p.profileID, username: p.username });
        }
      });
    });

    return (
      <div
        className="w-11/12 mx-auto flex justify-around rounded-lg py-2 px-4 border-2 border-blue-900 my-2"
        key={commentID}
      >
        <div className="w-1/6 flex justify-center items-center">
          <img
            src={
              currentPerson.profile_pic.length > 0
                ? `${UPLOADSURL}/${currentPerson.profile_pic}`
                : tmpAvatar
            }
            alt={'p.pic-comment'}
            className="sm:w-16 w-12 sm:h-16 h-12 rounded-full object-scale-down bg-blue-200 mr-2 border-1 border-blue-400 p-1"
          />
        </div>

        <div className="flex flex-col items-start w-3/4 sm:ml-0 ml-2">
          <div className="font-bold tracking-wider sm:text-md text-sm mb-1">
            {currentPerson.username}
          </div>
          <div className="text-blue-200 sm:text-sm text-xs border-b border-gray-800 mb-2">
            {convertDate(timestamp).split(' ').slice(0, 5).join(' ')}
          </div>
          <div className="text-gray-200 sm:text-sm text-xs">{comment}</div>

          <div className="pt-1 w-full bg-gray-800 mt-4 mb-2"></div>

          <div className="w-full flex sm:flex-row flex-col sm:justify-between sm:items-start pr-2 my-2">
            <button
              className={`sm:w-1/5 w-3/4 p-1 sm:text-md text-sm bg-${
                reacts !== undefined && reacts.some((r) => r.uid === userID)
                  ? 'blue'
                  : 'gray'
              }-800 tracking-wider font-open hover:bg-gray-700 focus:bg-gray-700 flex justify-center items-center rounded`}
              onClick={(e) =>
                reactComment(
                  e,
                  commentID,
                  reacts !== undefined && reacts.some((r) => r.uid === userID)
                    ? 'false'
                    : 'true'
                )
              }
            >
              Like
              {reacts !== undefined && reacts.some((r) => r.uid === userID)
                ? 'd'
                : ''}
              <div
                className={`ml-2 text-md ri-thumb-up-${
                  reacts !== undefined && reacts.some((r) => r.uid === userID)
                    ? 'fill'
                    : 'line'
                }`}
              ></div>
            </button>

            <button
              className={`sm:w-1/5 w-3/4 p-1 sm:mt-0 mt-2 sm:text-sm text-xs tracking-wider font-open ${
                reacts.length <= 0
                  ? 'opacity-50 bg-gray-600'
                  : showCommentReacts === commentID &&
                    showCommentReacts.length > 0
                  ? 'bg-gray-400'
                  : 'bg-gray-600 hover:bg-gray-400 focus:bg-gray-400'
              } flex justify-center items-center rounded flex justify-center items-center font-bold tracking-wider font-rale text-blue-900`}
              onClick={() =>
                reacts.length <= 0
                  ? null
                  : setShowCommentReacts((prev) =>
                      prev === commentID && prev.length > 0
                        ? setShowCommentReacts('')
                        : setShowCommentReacts(commentID)
                    )
              }
            >
              Likes: {reacts.length}
            </button>

            {userID === uid ? (
              <button
                className={`sm:w-1/5 w-3/4 p-1 sm:mt-0 mt-2 sm:text-md text-sm tracking-wider font-open bg-${
                  isEditingComment === commentID ? 'blue' : 'gray'
                }-800 hover:bg-gray-700 focus:bg-gray-700 flex justify-center items-center rounded`}
                onClick={() => {
                  if (isEditingComment !== commentID) {
                    setIsEditingComment(commentID);
                    setComment(comment);
                  } else {
                    setIsEditingComment('');
                    setComment('');
                  }
                }}
              >
                {isEditingComment === commentID ? 'Cancel' : 'Edit Comment'}
              </button>
            ) : (
              ''
            )}

            {userID === uid ? (
              <button
                className={`sm:w-1/5 w-3/4 sm:mt-0 mt-2 p-1 sm:text-md text-sm bg-gray-800 tracking-wider font-open hover:bg-red-700 focus:bg-red-700 flex justify-center items-center rounded`}
                onClick={(e) => deleteComment(e, commentID)}
              >
                Delete Comment
              </button>
            ) : (
              ''
            )}
          </div>

          {showCommentReacts === commentID &&
          showCommentReacts.length > 0 &&
          people !== undefined ? (
            <div className="w-full p-2 bg-gray-800 mt-2 rounded-lg sm:text-sm text-xs flex mt-2">
              {/* {commentReacts.join(', ')} */}

              {commentReacts.map((cr, i) => (
                <div key={`comm-${cr}-${i}`}>
                  <button
                    onClick={() => history.push(`/profile/${cr.profileID}`)}
                    className="underline hover:text-blue-400 focus:text-blue-400 pr-1"
                  >
                    {cr.username}
                    {i !== commentReacts.length - 1 ? ', ' : ''}
                  </button>
                </div>
              ))}
            </div>
          ) : (
            ''
          )}
        </div>
      </div>
    );
  };

  let postReacts = [];

  reacts.forEach((r) => {
    people.forEach((p) => {
      if (p.profileID === r.uid) {
        postReacts.push({ profileID: p.profileID, username: p.username });
      }
    });
  });

  return (
    <div
      className="w-full flex flex-col items-center p-2 bg-gray-900 sm:my-4 my-2 rounded-lg"
      key={keyname}
    >
      <div className="flex flex-none justify-start items-center w-full sm:pl-8 py-2">
        <img
          src={profile_pic}
          alt={'p.pic'}
          className="sm:w-16 w-12 sm:h-16 h-12 p-1 rounded-full border-2 border-blue-400 object-scale-down mr-2"
        />

        <div className="h-full w-full flex flex-col items-start ml-2">
          <button
            className="sm:text-xl text-lg bg-blue-900 p-1 rounded underline hover:bg-blue-800 focus:bg-blue-800"
            onClick={() =>
              userID === profileID
                ? history.push(`/profile/`)
                : history.push(`/profile/${profileID}`)
            }
          >
            {username}
          </button>
          <div className="sm:text-lg text-md text-left">
            {convertDate(timestamp).split(' ').slice(0, 5).join(' ')}
          </div>
        </div>
      </div>

      <div className="pt-1 w-full bg-gray-800 my-2"></div>

      {uid === profileID ? (
        <div className="w-full">
          <div className="w-full flex justify-around py-1">
            <button
              className="w-2/5 sm:text-lg text-sm tracking-wider font-open hover:bg-blue-700 focus:bg-blue-700 flex justify-center items-center rounded py-1 text-blue-200 font-bold bg-gray-800"
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

      <div className="w-full flex flex-col items-center -mb-1">
        <div
          className={`sm:w-4/5 w-11/12 flex flex-col text-${
            content.length < 100 &&
            !content.includes('<img') &&
            !content.includes('<li>') < 100
              ? 'center'
              : 'left'
          }`}
          style={{ whiteSpace: 'pre-line' }}
        >
          <Parser content={content} />
        </div>
      </div>

      <div className="w-full flex mt-4">
        <button
          className={`w-1/3 p-1 sm:text-lg text-md tracking-wider font-open ${
            reacts.length <= 0
              ? 'opacity-50 bg-gray-600'
              : showReacts
              ? 'bg-gray-400'
              : 'bg-gray-600 hover:bg-gray-400 focus:bg-gray-400'
          } flex justify-center items-center rounded flex justify-center items-center font-bold tracking-wider font-rale text-blue-900`}
          onClick={() =>
            reacts.length <= 0 ? null : setShowReacts((prev) => !prev)
          }
        >
          Likes: {reacts.length}
        </button>

        {/* <button
          className={`w-1/4 p-1 sm:text-lg text-md tracking-wider font-open ${
            showComment
              ? 'bg-gray-400'
              : 'bg-gray-600 hover:bg-gray-400 focus:bg-gray-400'
          } flex justify-center items-center rounded flex justify-center items-center font-bold tracking-wider font-rale text-blue-900`}
          onClick={() => setShowComment((prev) => !prev)}
        >
          Comments: {comments.length}
        </button> */}
      </div>

      {showReacts && reacts.length > 0 && people !== undefined ? (
        <div className="w-full p-2 bg-gray-800 mt-2 rounded-lg sm:text-md text-sm flex mt-4">
          {/* {postReacts.join(', ')} */}

          {postReacts.map((pr, i) => (
            <div key={`postr-${pr}-${i}`}>
              <button
                onClick={() => history.push(`/profile/${pr.profileID}`)}
                className="underline hover:text-blue-400 focus:text-blue-400 pr-1"
              >
                {pr.username}
                {i !== postReacts.length - 1 ? ', ' : ''}
              </button>
            </div>
          ))}
        </div>
      ) : (
        ''
      )}

      <div className="pt-1 w-full bg-gray-800 mt-4 mb-2"></div>

      <div className="w-full flex justify-between">
        <button
          className={`w-49/100 p-2 sm:text-xl text-sm bg-${
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
          className={`w-49/100 p-2 sm:text-xl text-sm ${
            showComment ? 'bg-blue-900' : ''
          } tracking-wider font-open hover:bg-gray-700 focus:bg-gray-700 flex justify-center items-center rounded`}
          onClick={() => {
            setShowComment((prev) => !prev);
          }}
        >
          {showComment ? 'Hide Comments' : `Comments (${comments.length})`}{' '}
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

          <div className="w-11/12 mx-auto mt-4 flex sm:flex-row flex-col sm:justify-between items-center">
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
              {isEditingComment.length > 0 ? 'Update' : 'Comment'}
            </button>
          </div>
        </div>
      ) : (
        ''
      )}
    </div>
  );
}
