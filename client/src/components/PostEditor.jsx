import { useState } from 'react';

function PostEditor({ authorId, onPublished }) {
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
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(requestBody),
      });

      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error?.message || 'Unable to publish the post.');
        setWorkflowState('error');
        return;
      }

      setWorkflowState('idle');
      onPublished?.(result);
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setWorkflowState('error');
    }
  }

  const isPublishing = workflowState === 'publishing';

  return (
    <form onSubmit={(event) => { event.preventDefault(); handlePublish(); }}>
      <label htmlFor="post-title">Title</label>
      <input id="post-title" value={title} onChange={handleTitleChange} />
      <label htmlFor="post-body">Body</label>
      <textarea id="post-body" value={body} onChange={handleBodyChange} />
      {errorMessage && <p role="alert">{errorMessage}</p>}
      <button type="submit" disabled={isPublishing}>
        {isPublishing ? 'Publishing...' : 'Publish'}
      </button>
    </form>
  );
}

export default PostEditor;