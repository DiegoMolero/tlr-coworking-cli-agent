---
name: carmen-plz
description: Book, check availability for, list, or cancel desk/room reservations at TLR Coworking (Malaga) using the installed `tlr` CLI. Use this whenever the user asks to reserve/book a desk or table at TLR Coworking, check desk availability there, see their upcoming bookings, or cancel a booking. Invoke directly with /carmen-plz.
---

# TLR Coworking booking skill

This skill lets you book desks/rooms at **TLR Coworking (Málaga)** on behalf of the user, by
calling the `tlr` command line tool that must already be installed and logged in on the user's
machine (see the [main README](../../README.md) for install instructions: clone the repo and run
`npm install && npm install -g .`, then `tlr login`). This
skill never talks to the TLR Coworking API directly — it only shells out to `tlr` and parses its
JSON output.

> This is an unofficial community tool, not affiliated with TLR Coworking or OfficeRnD. Only use
> it with the user's own account and be transparent about any booking/cancellation you perform.

## Prerequisites

Before using any command below, check whether the `tlr` CLI is installed:

```bash
command -v tlr
```

- If it is **not found**, do not attempt to install it yourself. Tell the user they need to
  install it first by cloning the repo and running `npm install && npm install -g .` (see the
  project README: https://github.com/DiegoMolero/tlr-coworking-cli-agent). Stop here until they
  confirm it's installed.
- If it **is** found, verify the user is logged in:

```bash
tlr whoami --json
```

- If this fails with a "Not logged in" error, tell the user to run `tlr login` themselves in
  their own terminal (this requires typing a password interactively — **never** ask the user to
  paste their password into the chat, and never attempt to run `tlr login` for them).

## Checking availability

To see which desks/rooms are free on a given date:

```bash
tlr desks list --date YYYY-MM-DD --json
```

- Defaults to `hotdesk` type; pass `--type meeting_room` for meeting rooms if the user asks for
  those instead.
- Parse the JSON array; each item has `_id`, `name`, `number`, `type`, and `rate.price`. Use
  `name` when talking to the user, and the matching `_id` (or just the name) when booking.

## Booking a desk/room

```bash
tlr book "<desk name or id>" --date YYYY-MM-DD --start HH:mm --end HH:mm --title "<short title>" --json
```

- Always confirm date, start/end time, and which desk with the user before running this command
  — it creates a real reservation.
- `--start`/`--end` are UTC clock times combined with `--date` (matching the office's own
  calendar behavior for Europe/Madrid). If the user gives you a local time, convert it to what
  the portal expects the same way `tlr desks list` shows availability, or simply pass through
  what the user says and tell them to double check with `tlr bookings list` afterwards.
- On success, the JSON output includes the created booking's `_id` and `reference` — report the
  `reference` back to the user as their booking confirmation.

## Listing bookings

```bash
tlr bookings list --json
```

Returns an array of the user's bookings (past and future) with `_id`, `summary`, `start`, `end`.
Filter for future dates yourself if the user asks for "upcoming" bookings only.

## Cancelling a booking

```bash
tlr bookings cancel <bookingId> --json
```

- Always confirm with the user which specific booking (by date/time/title) they want to cancel
  before running this — look it up via `tlr bookings list --json` first if you only have a
  description, not an id.

## Error handling

All commands print `{"error": "..."}` on failure when run with `--json` and exit with a non-zero
status. Surface that message to the user in plain language; do not retry destructive commands
(`book`, `bookings cancel`) automatically after a failure without checking with the user first.
