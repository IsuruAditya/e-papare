import { describe, it, expect } from 'vitest';
import { z } from 'zod';

describe('zod smoke test', () => {
  it('parses a valid string', () => {
    const result = z.string().parse('hello');
    expect(result).toBe('hello');
  });

  it('throws on invalid type', () => {
    expect(() => z.string().parse(42)).toThrow();
  });
});
