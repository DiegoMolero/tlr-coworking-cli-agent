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
        saveSession({
            cookie: result.cookie,
            displayName: result.displayName,
            email: result.email,
            memberId: result.memberId,
            savedAt: new Date().toISOString(),
        });
        if (opts.json) {
            console.log(JSON.stringify({ ok: true, displayName: result.displayName }, null, 2));
        }
        else {
            console.log(`Logged in as ${result.displayName ?? result.email ?? "unknown user"}.`);
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