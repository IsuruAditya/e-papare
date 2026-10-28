import { describe, it, expect, beforeEach } from 'vitest';
import {
  LANGUAGE_STORAGE_KEY,
  isSupportedLanguage,
  readStoredLanguage,
  writeStoredLanguage,
  resolveInitialLanguage,
  applyDocumentLanguage,
} from './language-storage';

describe('language-storage', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.removeAttribute('lang');
  });

  it('recognizes supported languages only', () => {
    expect(isSupportedLanguage('en')).toBe(true);
    expect(isSupportedLanguage('si')).toBe(true);
    expect(isSupportedLanguage('fr')).toBe(false);
    expect(isSupportedLanguage(null)).toBe(false);
  });

  it('reads a valid stored language and ignores an invalid one', () => {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'si');
    expect(readStoredLanguage()).toBe('si');
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'xx');
    expect(readStoredLanguage()).toBeNull();
  });

  it('writes the language to storage', () => {
    writeStoredLanguage('si');
    expect(localStorage.getItem(LANGUAGE_STORAGE_KEY)).toBe('si');
  });

  it('resolveInitialLanguage prefers stored, else defaults to en', () => {
    expect(resolveInitialLanguage()).toBe('en');
    localStorage.setItem(LANGUAGE_STORAGE_KEY, 'si');
    expect(resolveInitialLanguage()).toBe('si');
  });

  it('applyDocumentLanguage sets the html lang attribute', () => {
    applyDocumentLanguage('si');
    expect(document.documentElement.getAttribute('lang')).toBe('si');
  });
});
