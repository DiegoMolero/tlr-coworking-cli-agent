import { loadSession } from "../lib/auth-store.js";
import { printError } from "../lib/format.js";
import { NotAuthenticatedError } from "../lib/api-client.js";
const EXPIRY_WARNING_WINDOW_MS = 24 * 60 * 60 * 1000; // warn inside the last 24h before expiry
export function whoamiCommand(opts) {
    const session = loadSession();
    if (!session) {
        printError(new NotAuthenticatedError(), Boolean(opts.json));
        process.exitCode = 1;
        return;
    }
    const expiresSoon = Boolean(session.expiresAt && new Date(session.expiresAt).getTime() - Date.now() < EXPIRY_WARNING_WINDOW_MS);
    if (opts.json) {
        console.log(JSON.stringify({
            displayName: session.displayName,
            email: session.email,
            savedAt: session.savedAt,
            expiresAt: session.expiresAt,
            hasExplicitExpiry: session.hasExplicitExpiry,
            expiresSoon,
        }, null, 2));
    }
    else {
        console.log(`${session.displayName ?? "Unknown"} (${session.email ?? "no email cached"})`);
        console.log(`Session saved at: ${session.savedAt}`);
        if (session.expiresAt) {
            console.log(`Session valid until: ${session.expiresAt}`);
            if (expiresSoon) {
                console.log('Session expires soon — run "tlr login" again to avoid interruptions.');
            }
        }
        else if (session.hasExplicitExpiry === false) {
            console.log("Session has no explicit expiry (likely a rolling/idle-timeout session).");
        }
    }
}
//# sourceMappingURL=whoami.js.map