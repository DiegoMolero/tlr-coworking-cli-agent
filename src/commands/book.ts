import { apiJson, NotAuthenticatedError } from "../lib/api-client.js";
import { config } from "../lib/config.js";
import { loadSession } from "../lib/auth-store.js";
import { printError } from "../lib/format.js";
import { fetchBookableResources } from "./desks-list.js";

export interface BookOptions {
  date: string;
  start: string;
  end: string;
  title?: string;
  type?: string;
  json?: boolean;
}

function toIsoDateTime(date: string, time: string): string {
  // Interprets date+time as Europe/Madrid local time, sent with the timezone field to the API.
  return `${date}T${time}:00.000Z`;
}

async function resolveResourceId(nameOrId: string, opts: { date: string; type?: string }): Promise<string> {
  const resources = await fetchBookableResources(opts);
  const exact = resources.find((r) => r._id === nameOrId);
  if (exact) return exact._id;

  const byName = resources.find((r) => r.name.toLowerCase().includes(nameOrId.toLowerCase()));
  if (byName) return byName._id;

  throw new Error(`Could not find a bookable resource matching "${nameOrId}" on ${opts.date}.`);
}

export async function bookCommand(resourceNameOrId: string, opts: BookOptions): Promise<void> {
  try {
    const session = loadSession();
    if (!session) {
      throw new NotAuthenticatedError();
    }
    if (!session.memberId) {
      throw new Error('Missing member id in local session. Please run "tlr login" again.');
    }

    const resourceId = await resolveResourceId(resourceNameOrId, { date: opts.date, type: opts.type });

    const payload = {
      summary: opts.title ?? "Booking",
      start: { dateTime: toIsoDateTime(opts.date, opts.start) },
      end: { dateTime: toIsoDateTime(opts.date, opts.end) },
      resourceId,
      office: config.officeId,
      timezone: config.timezone,
      source: "portal",
      properties: {},
      extras: {},
      visitors: [],
      members: [],
      recurrenceEditMode: "single",
      member: session.memberId,
      team: null,
      recurrence: { rrule: null },
    };

    const result = await apiJson("/user/bookings", {
      method: "POST",
      body: JSON.stringify(payload),
    });

    if (opts.json) {
      console.log(JSON.stringify(result, null, 2));
    } else {
      console.log("Booking created successfully.");
      console.log(JSON.stringify(result, null, 2));
    }
  } catch (err) {
    printError(err, Boolean(opts.json));
    process.exitCode = 1;
  }
}
