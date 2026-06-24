/* Client-side rate limit - localStorage-backed, survives tab changes and
   browser restarts. Max 3 submissions per 24 hours per browser/device.
   The server does a parallel IP-based check; these two layers work together. */

const STORE_KEY  = "ik_contact_log";
const MAX_HITS   = 3;
const WINDOW_MS  = 24 * 60 * 60 * 1000; // 24 hours

function getLog(): number[] {
  try {
    const raw = localStorage.getItem(STORE_KEY);
    const now = Date.now();
    const log: number[] = raw ? JSON.parse(raw) : [];
    return log.filter((t) => now - t < WINDOW_MS);
  } catch {
    return [];
  }
}

/** Call before sending. Returns `allowed: false` with a human-readable
 *  `retryIn` when the device has hit its limit. */
export function clientRateCheck(): { allowed: boolean; retryIn?: string } {
  const recent = getLog();
  if (recent.length >= MAX_HITS) {
    const resetMs = Math.min(...recent) + WINDOW_MS - Date.now();
    const hours   = Math.ceil(resetMs / (1000 * 60 * 60));
    return { allowed: false, retryIn: `${hours}h` };
  }
  return { allowed: true };
}

/** Call after a successful send to record the timestamp. */
export function logClientSubmit(): void {
  try {
    const recent = getLog();
    localStorage.setItem(STORE_KEY, JSON.stringify([...recent, Date.now()]));
  } catch { /* ignore - storage unavailable */ }
}
