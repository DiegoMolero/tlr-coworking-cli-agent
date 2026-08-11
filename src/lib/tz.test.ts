import { test } from "node:test";
import assert from "node:assert/strict";
import { zonedTimeToUtcIso } from "./tz.js";

test("zonedTimeToUtcIso() converts Europe/Madrid summer (CEST, UTC+2) local time to UTC", () => {
  // 10:00 local in Madrid in August (daylight saving, UTC+2) is 08:00 UTC.
  assert.equal(zonedTimeToUtcIso("2026-08-14", "10:00", "Europe/Madrid"), "2026-08-14T08:00:00.000Z");
});

test("zonedTimeToUtcIso() converts Europe/Madrid winter (CET, UTC+1) local time to UTC", () => {
  // 10:00 local in Madrid in January (standard time, UTC+1) is 09:00 UTC.
  assert.equal(zonedTimeToUtcIso("2026-01-14", "10:00", "Europe/Madrid"), "2026-01-14T09:00:00.000Z");
});

test("zonedTimeToUtcIso() round-trips back to the requested local wall-clock time", () => {
  const iso = zonedTimeToUtcIso("2026-08-14", "15:00", "Europe/Madrid");
  const local = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Europe/Madrid",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(iso));
  assert.equal(local, "15:00");
});
