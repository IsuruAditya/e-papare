/**
 * Maps a local hour to the time-of-day greeting key in the `dashboard`
 * namespace. Pure + deterministic given an hour, so it is trivially testable
 * and has no `Date` side effect at import time.
 */
export type GreetingKey =
  'welcome.greetingMorning' | 'welcome.greetingAfternoon' | 'welcome.greetingEvening';

export function greetingKeyForHour(hour: number): GreetingKey {
  if (hour < 12) return 'welcome.greetingMorning';
  if (hour < 17) return 'welcome.greetingAfternoon';
  return 'welcome.greetingEvening';
}
