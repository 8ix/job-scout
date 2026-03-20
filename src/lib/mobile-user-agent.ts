const MOBILE_UA_PATTERN =
  /Mobile|Android.*Mobile|iPhone|iPod|webOS|BlackBerry|IEMobile|Opera Mini/i;

/**
 * Conservative phone detection for server-side redirect. Excludes iPad-only UAs
 * (many iPads identify as "Macintosh" in newer Safari anyway).
 */
export function isMobileUserAgent(userAgent: string | null | undefined): boolean {
  if (!userAgent || typeof userAgent !== "string") return false;
  return MOBILE_UA_PATTERN.test(userAgent);
}

export const JOBSCOUT_DESKTOP_COOKIE = "jobscout_desktop";
