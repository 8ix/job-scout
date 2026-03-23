/**
 * Returns true if `timeZone` is a valid IANA zone for this runtime (Intl).
 */
export function isValidIanaTimeZone(timeZone: string): boolean {
  if (!timeZone || typeof timeZone !== "string") return false;
  try {
    Intl.DateTimeFormat(undefined, { timeZone }).format(new Date());
    return true;
  } catch {
    return false;
  }
}
