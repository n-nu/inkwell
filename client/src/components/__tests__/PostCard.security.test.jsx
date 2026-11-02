import { cleanup, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, test } from 'vitest';
import PostCard from '../PostCard.jsx';

afterEach(() => {
  cleanup();
  delete window.__xss;
});

describe('PostCard security', () => {
  test('renders script content as inert literal text', () => {
    const body = '<script>window.__xss = true;</script>';

    render(
      <PostCard
        post={{
          title: 'Untrusted content',
          body,
        }}
      />,
    );

    expect(screen.getByText(body, { exact: true })).toBeInTheDocument();
    expect(window.__xss).toBeUndefined();
  });
});
