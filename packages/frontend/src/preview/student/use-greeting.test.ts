import { describe, it, expect } from 'vitest';
import { greetingKeyForHour } from './use-greeting';

describe('greetingKeyForHour', () => {
  it('returns the morning key before noon', () => {
    expect(greetingKeyForHour(0)).toBe('welcome.greetingMorning');
    expect(greetingKeyForHour(11)).toBe('welcome.greetingMorning');
  });

  it('returns the afternoon key from noon to 16:59', () => {
    expect(greetingKeyForHour(12)).toBe('welcome.greetingAfternoon');
    expect(greetingKeyForHour(16)).toBe('welcome.greetingAfternoon');
  });

  it('returns the evening key from 17:00 onward', () => {
    expect(greetingKeyForHour(17)).toBe('welcome.greetingEvening');
    expect(greetingKeyForHour(23)).toBe('welcome.greetingEvening');
  });
});
