Here is what HTML should be produced by this app:

<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>Posts — Sample</title>
    <link rel="stylesheet" href="./App.css" />
  </head>
  <body>
    <div>
      <h1>Posts</h1>

      <form>
        <textarea placeholder="Write something..." rows="4"></textarea>
        <button type="button">Post</button>
      </form>

      <ul class="posts-list">
        <li>
          <div class="post-content">Hello world! This is the first post.</div>
          <div class="post-meta">2/1/2026, 10:00:00 AM</div>
        </li>

        <li>
          <div class="post-content">Here's a second post.
It has two lines.</div>
          <div class="post-meta">1/31/2026, 4:30:12 PM</div>
        </li>

        <li>
          <div class="post-content">Third post — testing long content to see wrapping behavior. Lorem ipsum dolor sit amet, consectetur adipiscing elit.</div>
          <div class="post-meta">1/30/2026, 9:05:00 AM</div>
        </li>
      </ul>
    </div>
  </body>
</html>


Here is what App.jsx looks like in javascript when converted:
import { useState, useEffect } from 'react';
import React from 'react';
import './App.css';

function App() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPosts = async () => {
      const res = await fetch('/api/posts');
      const data = await res.json();
      setPosts(data);
      setLoading(false);
    };
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const res = await fetch('/api/posts', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });

    const newPost = await res.json();
    setPosts([newPost, ...posts]);
    setContent('');
  };

  return React.createElement(
    'div',
    null,

    React.createElement('h1', null, 'Posts'),

    React.createElement(
      'form',
      { onSubmit: handleSubmit },

      React.createElement('textarea', {
        value: content,
        onChange: e => setContent(e.target.value),
        placeholder: 'Write something...',
        rows: 4
      }),

      React.createElement(
        'button',
        { type: 'submit' },
        'Post'
      )
    ),

    loading
      ? React.createElement('p', null, 'Loading...')
      : React.createElement(
          'ul',
          { className: 'posts-list' },

          posts.map((post) =>
            React.createElement(
              'li',
              { key: post.id },

              React.createElement(
                'div',
                { className: 'post-content' },
                post.content
              ),

              React.createElement(
                'div',
                { className: 'post-meta' },
                new Date(post.createdAt).toLocaleString()
              )
            )
          )
        )
  );
}

export default App;
