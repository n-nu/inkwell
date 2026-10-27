import { cleanup, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import PostEditor from '../PostEditor.jsx';

beforeEach(() => {
  vi.resetAllMocks();
  localStorage.clear();
});

afterEach(() => {
  cleanup();
});

describe('PostEditor', () => {
  test('shows the server validation message after a failed publish', async () => {
    globalThis.fetch.mockResolvedValue({
      ok: false,
      json: async () => ({
        error: { message: 'Title is required.' },
      }),
    });

    const user = userEvent.setup();
    render(
      <MemoryRouter>
        <PostEditor />
      </MemoryRouter>,
    );

    await user.type(screen.getByLabelText(/body/i), 'A post body');
    await user.click(screen.getByRole('button', { name: /publish/i }));

    expect(await screen.findByRole('alert')).toHaveTextContent('Title is required.');
    expect(globalThis.fetch).toHaveBeenCalledWith(
      '/api/posts',
      expect.objectContaining({ method: 'POST' }),
    );
  });
});
