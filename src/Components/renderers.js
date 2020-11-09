import React from 'react';

import ReactMarkdown from 'react-markdown';

const htmlParser = require('react-markdown/plugins/html-parser');

const heading = (props) => {
  return (
    <div className="font-bold tracking-wider sm:text-3xl text-xl text-gray-200 sm:my-4 my-2">
      {props.children}
    </div>
  );
};

const link = (props) => {
  return (
    <a href={props.href} className="text-blue-300 bg-blue-900 underline">
      {props.children}
    </a>
  );
};

const text = (props) => {
  return (
    <span className="text-gray-300" style={{ whiteSpace: 'pre-line' }}>
      {props.children}
    </span>
  );
};

const list = (props) => {
  return <ul className="list-disc pl-8">{props.children}</ul>;
};

const listItem = (props) => {
  return <li className="text-blue-300">{props.children}</li>;
};

const code = (props) => {
  return (
    <div
      className="text-blue-400 font-mono p-2 bg-gray-700 rounded my-2 p-2 border-2 border-blue-100"
      style={{ whiteSpace: 'pre-line' }}
    >
      {props.node.value}
    </div>
  );
};

const image = (props) => {
  return (
    <div className="w-5/6 flex flex-col justify-center items-center">
      <img
        src={props.src}
        alt={props.alt}
        className="w-full object-scale-down rounded p-1 border-2 border-blue-400"
      />
    </div>
  );
};

const renderers = {
  heading: heading,
  link: link,
  text: text,
  list: list,
  listItem: listItem,
  code: code,
  image: image,
};

// eslint-disable-next-line
const parseHtml = htmlParser({
  isValidNode: (node) => node.type !== 'script',
  processingInstructions: [
    /* ... */
  ],
});

export const Parser = ({ content }) => (
  <ReactMarkdown
    source={content}
    renderers={renderers}
    // escapeHtml={false}
    // astPlugins={[parseHtml]}
    parserOptions={{ commonmark: true }}
  />
);
