import '@testing-library/jest-dom';
import { vi } from 'vitest';

globalThis.fetch = vi.fn();

if (typeof window.localStorage?.getItem !== 'function') {
  const store = new Map();
  Object.defineProperty(window, 'localStorage', {
    configurable: true,
    value: {
      getItem: (key) => (store.has(key) ? store.get(key) : null),
      setItem: (key, value) => store.set(key, String(value)),
      removeItem: (key) => store.delete(key),
      clear: () => store.clear(),
    },
  });
}
