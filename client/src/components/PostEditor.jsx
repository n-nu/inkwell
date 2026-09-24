import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getToken } from '../lib/auth.js';

function PostEditor({ authorId, onPublished }) {
  const navigate = useNavigate();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [workflowState, setWorkflowState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');

  function handleTitleChange(event) {
    setTitle(event.target.value);
    setWorkflowState('editing');
  }

  function handleBodyChange(event) {
    setBody(event.target.value);
    setWorkflowState('editing');
  }

  async function handlePublish() {
    setWorkflowState('publishing');
    setErrorMessage('');

    try {
      const requestBody = { title, body };
      if (authorId !== undefined) {
        requestBody.authorId = authorId;
      }

      const response = await fetch('/api/posts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${getToken()}`,
        },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error?.message || 'Unable to publish the post.');
        setWorkflowState('editing');
        return;
      }

      setWorkflowState('idle');
      onPublished?.(result);
      navigate('/');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setWorkflowState('editing');
    }
  }

  const isPublishing = workflowState === 'publishing';

  return (
    <form className="w-full space-y-4" onSubmit={(event) => { event.preventDefault(); handlePublish(); }}>
      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-800" htmlFor="post-title">Title</label>
        <input
          id="post-title"
          className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base outline-none transition focus:border-stone-500"
          value={title}
          onChange={handleTitleChange}
          aria-describedby={errorMessage ? 'post-error' : undefined}
        />
      </div>

      <div className="space-y-2">
        <label className="block text-sm font-medium text-stone-800" htmlFor="post-body">Body</label>
        <textarea
          id="post-body"
          className="min-h-[180px] w-full resize-y rounded-md border border-stone-300 bg-white px-3 py-2 text-base outline-none transition focus:border-stone-500"
          value={body}
          onChange={handleBodyChange}
          aria-describedby={errorMessage ? 'post-error' : undefined}
        />
      </div>

      {errorMessage && <p id="post-error" role="alert" className="text-sm text-red-700">{errorMessage}</p>}

      <button
        type="submit"
        disabled={isPublishing}
        className="w-full min-h-[44px] rounded-md bg-indigo-600 px-4 py-2 text-base font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto"
      >
        {isPublishing ? 'Publishing...' : 'Publish'}
      </button>
    </form>
  );
}

export default PostEditor;