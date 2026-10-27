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

  return (
    <section className="w-full">
      <h1 className="mb-6 font-serif text-3xl font-semibold sm:text-4xl md:mb-8">Feed</h1>
      {posts === null && <p className="text-stone-600">Loading posts...</p>}
      {errorMessage && <p role="alert" className="text-red-700">{errorMessage}</p>}
      {!errorMessage && posts?.length === 0 && (
        <>
          <p className="mt-4 text-sm text-stone-600 sm:text-base">No posts yet.</p>
          <Link className="mt-6 inline-flex min-h-[44px] items-center rounded-md font-medium text-stone-800 underline underline-offset-4" to="/write">Write the first one</Link>
        </>
      )}
      {!errorMessage && posts?.length > 0 && (
        <div className="space-y-4 sm:space-y-5">{posts.map((post) => <PostCard key={post.id} post={post} />)}</div>
      )}
    </section>
  );
}

export default Feed;
