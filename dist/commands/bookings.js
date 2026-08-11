import { apiJson, apiFetch } from "../lib/api-client.js";
import { printError } from "../lib/format.js";
export async function bookingsListCommand(opts) {
    try {
        const bookings = await apiJson("/user/bookings");
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
    }
    catch (err) {
        printError(err, Boolean(opts.json));
        process.exitCode = 1;
    }
}
export async function bookingsCancelCommand(bookingId, opts) {
    try {
        await apiFetch(`/user/bookings/${bookingId}`, { method: "DELETE" });
        if (opts.json) {
            console.log(JSON.stringify({ ok: true, cancelled: bookingId }, null, 2));
        }
        else {
            console.log(`Booking ${bookingId} cancelled.`);
        }
    }
    catch (err) {
        printError(err, Boolean(opts.json));
        process.exitCode = 1;
    }
}
//# sourceMappingURL=bookings.js.map