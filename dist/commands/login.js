import prompts from "prompts";
import { login as apiLogin, ApiError } from "../lib/api-client.js";
import { saveSession } from "../lib/auth-store.js";
import { printError } from "../lib/format.js";
export async function loginCommand(opts) {
    const answers = await prompts([
        { type: "text", name: "username", message: "Email" },
        { type: "password", name: "password", message: "Password" },
    ]);
    if (!answers.username || !answers.password) {
        console.error("Login cancelled.");
        process.exitCode = 1;
        return;
    }
    try {
        const result = await apiLogin(answers.username, answers.password);
        const savedAt = new Date().toISOString();
        const expiresAt = result.cookieMeta.maxAgeSeconds
            ? new Date(Date.now() + result.cookieMeta.maxAgeSeconds * 1000).toISOString()
            : result.cookieMeta.expires
                ? new Date(result.cookieMeta.expires).toISOString()
                : undefined;
        saveSession({
            cookie: result.cookie,
            displayName: result.displayName,
            email: result.email,
            memberId: result.memberId,
            savedAt,
            expiresAt,
            hasExplicitExpiry: result.cookieMeta.hasExplicitExpiry,
        });
        if (opts.json) {
            console.log(JSON.stringify({ ok: true, displayName: result.displayName, expiresAt, hasExplicitExpiry: result.cookieMeta.hasExplicitExpiry }, null, 2));
        }
        else {
            console.log(`Logged in as ${result.displayName ?? result.email ?? "unknown user"}.`);
            if (expiresAt) {
                console.log(`Session valid until: ${expiresAt}`);
            }
            else {
                console.log("The server did not set an explicit session expiry (no Max-Age/Expires on the cookie). " +
                    "It's likely a rolling/idle-timeout session on the server side, so using the CLI " +
                    "regularly should keep it alive; if it stops working, just run \"tlr login\" again.");
            }
        }
    }
    catch (err) {
        printError(err, Boolean(opts.json));
        if (err instanceof ApiError && err.status === 401) {
            process.exitCode = 1;
        }
        else {
            process.exitCode = 2;
        }
    }
}
//# sourceMappingURL=login.js.map