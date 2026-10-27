import { describe, it, expect } from 'vitest';
import { render, screen, cleanup } from '@testing-library/react';
import { afterEach } from 'vitest';
import App from '../App';

afterEach(() => {
  cleanup();
});

describe('App smoke test', () => {
  it('renders without throwing and shows placeholder text', () => {
    expect(() => render(<App />)).not.toThrow();
    expect(screen.getByText('e-Paperé')).toBeInTheDocument();
  });
});
