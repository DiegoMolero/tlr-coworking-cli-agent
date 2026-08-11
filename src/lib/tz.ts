/**
 * Converts a wall-clock date/time in a given IANA time zone into a real UTC instant, correctly
 * accounting for daylight saving time (e.g. Europe/Madrid is UTC+1 in winter, UTC+2 in summer).
 *
 * The TLR Coworking / OfficeRnD API expects booking `dateTime` fields as genuine UTC instants
 * (the member portal then renders them back converted to the office's local time zone), so a
 * naive "just append Z" conversion produces bookings shifted by the zone's UTC offset.
 */
export function zonedTimeToUtcIso(date: string, time: string, timeZone: string): string {
  const [year, month, day] = date.split("-").map(Number);
  const [hour, minute] = time.split(":").map(Number);

  // 1. Treat the desired wall-clock time as if it were already UTC (a first guess).
  const guessMs = Date.UTC(year, month - 1, day, hour, minute, 0);

  // 2. See what wall-clock time that guessed instant actually renders as in the target zone.
  const zonedMs = wallClockInZoneAsUtcMs(guessMs, timeZone);

  // 3. The difference is the zone's UTC offset at (roughly) that instant; subtract it from the
  //    guess to get the real UTC instant whose local wall-clock matches what was requested.
  let correctedMs = 2 * guessMs - zonedMs;

  // 4. Re-check once against the *desired* wall clock (handles DST-boundary edge cases where
  //    the offset differs between the initial guess and the corrected instant).
  const recheckMs = wallClockInZoneAsUtcMs(correctedMs, timeZone);
  if (recheckMs !== guessMs) {
    correctedMs = correctedMs + (guessMs - recheckMs);
  }

  return new Date(correctedMs).toISOString();
}

/** Formats `ms` (a UTC instant) in `timeZone` and returns that wall-clock reading as if it were UTC. */
function wallClockInZoneAsUtcMs(ms: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(new Date(ms));

  const get = (type: string) => Number(parts.find((p) => p.type === type)?.value);
  // Some locales render midnight as hour "24"; normalize that to 0.
  const hour = get("hour") % 24;

  return Date.UTC(get("year"), get("month") - 1, get("day"), hour, get("minute"), get("second"));
}
