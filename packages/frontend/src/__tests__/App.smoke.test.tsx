import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import App from '../App';

describe('App smoke test', () => {
  it('mounts the shell without throwing and renders the public landing', async () => {
    expect(() => render(<App />)).not.toThrow();
    // The landing (`/`) shows the app name in the header and the landing title.
    expect(await screen.findByRole('heading', { level: 1 })).toHaveTextContent(
      'e-Paperé Online Institute',
    );
  });
});
