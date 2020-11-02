import React from 'react';
import { Parser } from './renderers';

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

  return (
    <div className="w-full flex flex-col items-center p-2 bg-gray-900 my-2 rounded-lg">
      <div className="flex items-center">
        <img
          src={profile_pic}
          alt={'p.pic'}
          className="sm:w-16 w-12 sm:h-16 h-12 p-1 rounded-full border-2 border-blue-400 object-scale-down mr-2"
        />

        <div className="h-full w-full flex flex-col items-start ml-2">
          <p className="sm:text-xl text-md bg-blue-900 p-1 rounded">
            {username}
          </p>
          <p className="sm:text-md text-sm italic">
            Posted on {convertDate(timestamp)}
          </p>
        </div>
      </div>

      <div className="pt-1 w-full bg-gray-800 my-2"></div>

      <div className="w-5/6 flex flex-col items-start">
        <Parser content={content} />
      </div>

      <div className="pt-1 w-full bg-gray-800 mt-4 mb-2"></div>

      <div className="w-full flex">
        <button className="w-1/2 p-2 sm:text-xl text-lg tracking-wider font-open hover:bg-gray-700 focus:bg-gray-700 flex justify-center items-center rounded-l">
          Like <div className="ml-2 text-md ri-thumb-up-line"></div>
        </button>
        <button className="w-1/2 p-2 sm:text-xl text-lg tracking-wider font-open hover:bg-gray-700 focus:bg-gray-700 flex justify-center items-center rounded-l">
          Comment <div className="ml-2 text-md ri-message-3-line"></div>
        </button>
      </div>
    </div>
  );
}
