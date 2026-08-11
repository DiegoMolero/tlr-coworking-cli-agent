import { loadSession } from "../lib/auth-store.js";
import { printError } from "../lib/format.js";
import { NotAuthenticatedError } from "../lib/api-client.js";

export function whoamiCommand(opts: { json?: boolean }): void {
  const session = loadSession();
  if (!session) {
    printError(new NotAuthenticatedError(), Boolean(opts.json));
    process.exitCode = 1;
    return;
  }

  if (opts.json) {
    console.log(
      JSON.stringify(
        {
          displayName: session.displayName,
          email: session.email,
          savedAt: session.savedAt,
          expiresAt: session.expiresAt,
          hasExplicitExpiry: session.hasExplicitExpiry,
        },
        null,
        2
      )
    );
  } else {
    console.log(`${session.displayName ?? "Unknown"} (${session.email ?? "no email cached"})`);
    console.log(`Session saved at: ${session.savedAt}`);
    if (session.expiresAt) {
      console.log(`Session valid until: ${session.expiresAt}`);
    } else if (session.hasExplicitExpiry === false) {
      console.log("Session has no explicit expiry (likely a rolling/idle-timeout session).");
    }
  }
}
