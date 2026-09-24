import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { saveToken } from '../lib/auth.js';

function LoginForm() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [workflowState, setWorkflowState] = useState('idle');
  const [errorMessage, setErrorMessage] = useState('');
  const isSubmitting = workflowState === 'submitting';

  async function handleSubmit(event) {
    event.preventDefault();
    setWorkflowState('submitting');
    setErrorMessage('');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const result = await response.json();
      if (!response.ok) {
        setErrorMessage(result.error?.message || 'Unable to log in.');
        setWorkflowState('idle');
        return;
      }
      saveToken(result.accessToken);
      navigate('/');
    } catch {
      setErrorMessage('Something went wrong. Please try again.');
      setWorkflowState('idle');
    }
  }

  return (
    <section className="mx-auto max-w-md">
      <h1 className="font-serif text-4xl font-semibold">Log in</h1>
      <form className="mt-8 space-y-5" onSubmit={handleSubmit}>
        <div>
          <label className="mb-2 block font-medium" htmlFor="login-email">Email</label>
          <input className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base" id="login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} aria-describedby={errorMessage ? 'login-error' : undefined} required />
        </div>
        <div>
          <label className="mb-2 block font-medium" htmlFor="login-password">Password</label>
          <input className="w-full rounded-md border border-stone-300 bg-white px-3 py-2 text-base" id="login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} aria-describedby={errorMessage ? 'login-error' : undefined} required />
        </div>
        {errorMessage && <p id="login-error" role="alert" className="text-red-700">{errorMessage}</p>}
        <button className="w-full min-h-[44px] rounded-md bg-stone-900 px-5 py-2 font-medium text-white transition hover:bg-stone-800 disabled:cursor-not-allowed disabled:opacity-50 md:w-auto" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Logging in...' : 'Log In'}
        </button>
      </form>
    </section>
  );
}

export default LoginForm;
