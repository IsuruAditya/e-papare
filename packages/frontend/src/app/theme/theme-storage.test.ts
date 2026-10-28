import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
  THEME_STORAGE_KEY,
  readStoredTheme,
  writeStoredTheme,
  resolveInitialTheme,
  applyThemeClass,
} from './theme-storage';

describe('theme-storage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reads a valid stored theme and ignores an invalid one', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(readStoredTheme()).toBe('dark');
    localStorage.setItem(THEME_STORAGE_KEY, 'banana');
    expect(readStoredTheme()).toBeNull();
    localStorage.removeItem(THEME_STORAGE_KEY);
    expect(readStoredTheme()).toBeNull();
  });

  it('writes the theme to storage', () => {
    writeStoredTheme('dark');
    expect(localStorage.getItem(THEME_STORAGE_KEY)).toBe('dark');
  });

  it('resolveInitialTheme prefers a stored value over the system preference', () => {
    localStorage.setItem(THEME_STORAGE_KEY, 'dark');
    expect(resolveInitialTheme()).toBe('dark');
  });

  it('resolveInitialTheme falls back to prefers-color-scheme for a new user', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: true,
      media: '(prefers-color-scheme: dark)',
    } as unknown as MediaQueryList);
    expect(resolveInitialTheme()).toBe('dark');
  });

  it('resolveInitialTheme falls back to light when nothing is set', () => {
    vi.spyOn(window, 'matchMedia').mockReturnValue({
      matches: false,
    } as unknown as MediaQueryList);
    expect(resolveInitialTheme()).toBe('light');
  });

  it('applyThemeClass toggles the html.dark class', () => {
    applyThemeClass('dark');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    applyThemeClass('light');
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });
});
