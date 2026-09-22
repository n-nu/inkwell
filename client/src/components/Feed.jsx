import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import PostCard from './PostCard.jsx';

function Feed() {
  const [posts, setPosts] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    let isCurrent = true;

    async function loadPosts() {
      try {
        const response = await fetch('/api/posts?page=1');
        const result = await response.json();
        if (!response.ok) {
          throw new Error(result.error?.message || 'Unable to load posts.');
        }
        if (isCurrent) setPosts(result.posts || []);
      } catch (error) {
        if (isCurrent) {
          setErrorMessage(error instanceof TypeError ? 'Something went wrong. Please try again.' : error.message);
          setPosts([]);
        }
      }
    }

    loadPosts();
    return () => { isCurrent = false; };
  }, []);

  if (posts === null) return <p className="text-stone-600">Loading posts...</p>;
  if (errorMessage) return <p role="alert" className="text-red-700">{errorMessage}</p>;
  if (posts.length === 0) {
    return (
      <section>
        <h1 className="font-serif text-4xl font-semibold">The feed</h1>
        <p className="mt-4 text-stone-600">No posts yet.</p>
        <Link className="mt-6 inline-block font-medium underline" to="/write">Write the first one</Link>
      </section>
    );
  }

  return (
    <section>
      <h1 className="mb-8 font-serif text-4xl font-semibold">The feed</h1>
      <div>{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
    </section>
  );
}

export default Feed;
