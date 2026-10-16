import { useState, useEffect } from 'react';
import { useAuth } from '../AuthContext';

export default function PostsPage() {
  const [posts, setPosts] = useState([]);
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const fetchPosts = async () => {
    setLoading(true);
    const res = await fetch('/api/posts');
    const data = await res.json();
    setPosts(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const res = await fetch('/api/posts', {
      method: 'POST',
      credentials: 'include',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ content })
    });
    await res.json();
    setContent('');
    await fetchPosts();
  };

  return (
    <div>
      <h1>Posts</h1>
      <div className="user-bar">Welcome, {user.firstname || user.email}</div>

      <form onSubmit={handleSubmit}>
        <textarea
          value={content}
          onChange={e => setContent(e.target.value)}
          placeholder="Write something..."
          rows={4}
        />
        <button type="submit">Post</button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <ul className="posts-list">
          {posts.map((post) => (
            <li key={post.id}>
              <div className="post-content">{post.content}</div>
              <div className="post-meta">{new Date(post.created).toLocaleString()}</div>
              <div className="post-meta">{post.user?.email}</div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
