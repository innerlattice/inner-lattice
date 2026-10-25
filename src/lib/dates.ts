// Posts are written in Eastern time, so dates read the same wherever the site is built.
export function formatDate(date: Date, month: 'long' | 'short' = 'short'): string {
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month,
    day: 'numeric',
    timeZone: 'America/Toronto',
  });
}
