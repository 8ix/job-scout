/**
 * Returns a human-readable relative time string (e.g. "5 minutes ago", "2 days ago").
 */
export function formatTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return "just now";
  if (diffMin < 60) return diffMin === 1 ? "1 minute ago" : `${diffMin} minutes ago`;
  if (diffHour < 24) return diffHour === 1 ? "1 hour ago" : `${diffHour} hours ago`;
  if (diffDay < 7) return diffDay === 1 ? "1 day ago" : `${diffDay} days ago`;
  if (diffWeek < 52) return diffWeek === 1 ? "1 week ago" : `${diffWeek} weeks ago`;
  return diffYear === 1 ? "1 year ago" : `${diffYear} years ago`;
}
