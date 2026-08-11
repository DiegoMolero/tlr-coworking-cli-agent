/**
 * Converts a wall-clock date/time in a given IANA time zone into a real UTC instant, correctly
 * accounting for daylight saving time (e.g. Europe/Madrid is UTC+1 in winter, UTC+2 in summer).
 *
 * The TLR Coworking / OfficeRnD API expects booking `dateTime` fields as genuine UTC instants
 * (the member portal then renders them back converted to the office's local time zone), so a
 * naive "just append Z" conversion produces bookings shifted by the zone's UTC offset.
 */
export declare function zonedTimeToUtcIso(date: string, time: string, timeZone: string): string;
