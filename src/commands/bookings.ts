import { apiJson, apiFetch } from "../lib/api-client.js";
import { printError } from "../lib/format.js";

export interface Booking {
  _id: string;
  reference?: string;
  summary?: string;
  start?: { dateTime: string };
  end?: { dateTime: string };
  resourceId?: string;
}

export async function bookingsListCommand(opts: { json?: boolean }): Promise<void> {
  try {
    const bookings = await apiJson<Booking[]>("/user/bookings");
    if (opts.json) {
      console.log(JSON.stringify(bookings, null, 2));
      return;
    }
    if (bookings.length === 0) {
      console.log("No upcoming bookings.");
      return;
    }
    for (const b of bookings) {
      console.log(`${b._id}  ${b.summary ?? ""}  ${b.start?.dateTime ?? "?"} -> ${b.end?.dateTime ?? "?"}`);
    }
  } catch (err) {
    printError(err, Boolean(opts.json));
    process.exitCode = 1;
  }
}

export async function bookingsCancelCommand(bookingId: string, opts: { json?: boolean }): Promise<void> {
  try {
    await apiFetch(`/user/bookings/${bookingId}`, { method: "DELETE" });
    if (opts.json) {
      console.log(JSON.stringify({ ok: true, cancelled: bookingId }, null, 2));
    } else {
      console.log(`Booking ${bookingId} cancelled.`);
    }
  } catch (err) {
    printError(err, Boolean(opts.json));
    process.exitCode = 1;
  }
}
