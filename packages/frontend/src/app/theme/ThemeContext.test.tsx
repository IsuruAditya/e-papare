import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ThemeProvider, useTheme } from './ThemeContext';
import { THEME_STORAGE_KEY } from './theme-storage';

function Probe(): React.JSX.Element {
  const { theme, toggleTheme, setTheme } = useTheme();
  return (
    <div>
      <span data-testid="theme">{theme}</span>
      <button type="button" onClick={toggleTheme}>
        toggle
      </button>
      <button type="button" onClick={() => setTheme('dark')}>
        force-dark
      </button>
    </div>
  );
}

describe('ThemeContext', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  it('initializes from a stored preference and applies html.dark', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    render(
      <ThemeProvider>
        <Probe />
      </ThemeProvider>,
    );
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('toggles theme, updates html.dark and persists to localStorage', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>,
    );
    expect(document.documentElement.classList.contains('dark')).toBe(false);

    await user.click(screen.getByRole('button', { name: 'toggle' }));

    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('throws when useTheme is used outside a provider', () => {
    function Bare(): React.JSX.Element {
      useTheme();
      return <div />;
    }
    // Suppress React's error boundary console noise for this expected throw.
    expect(() => render(<Bare />)).toThrow(/useTheme must be used within a ThemeProvider/);
  });

  it('setTheme applies an explicit theme', async () => {
    const user = userEvent.setup();
    render(
      <ThemeProvider initialTheme="light">
        <Probe />
      </ThemeProvider>,
    );
    await act(async () => {
      await user.click(screen.getByRole('button', { name: 'force-dark' }));
    });
    expect(screen.getByTestId('theme')).toHaveTextContent('dark');
  });
});
