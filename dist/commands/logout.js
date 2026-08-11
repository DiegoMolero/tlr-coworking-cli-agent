import { clearSession } from "../lib/auth-store.js";
export function logoutCommand(opts) {
    clearSession();
    if (opts.json) {
        console.log(JSON.stringify({ ok: true }, null, 2));
    }
    else {
        console.log("Logged out. Local session cleared.");
    }
}
//# sourceMappingURL=logout.js.map