import { Entry } from "@napi-rs/keyring";
import { existsSync, mkdirSync, readFileSync, writeFileSync, unlinkSync, chmodSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";
const SERVICE = "tlr-coworking-cli";
const ACCOUNT = "session";
/**
 * Stores/reads/clears the OfficeRnD session cookie (`connect.sid`), never the password.
 *
 * Primary storage is the OS keychain (macOS Keychain, Windows Credential Manager, libsecret
 * on Linux) via @napi-rs/keyring. If that is unavailable (e.g. headless Linux without a
 * secret service), it falls back to a local file with restrictive permissions and a warning.
 */
function fallbackPath() {
    const dir = join(homedir(), ".config", "tlr-coworking-cli");
    if (!existsSync(dir)) {
        mkdirSync(dir, { recursive: true });
    }
    return join(dir, "session.json");
}
export function saveSession(session) {
    const payload = JSON.stringify(session);
    try {
        const entry = new Entry(SERVICE, ACCOUNT);
        entry.setPassword(payload);
        return;
    }
    catch {
        // Keyring not available on this system; fall back to a local file.
        const path = fallbackPath();
        writeFileSync(path, payload, { mode: 0o600 });
        chmodSync(path, 0o600);
        console.warn(`Warning: could not use the OS keychain, session saved to ${path} instead. ` +
            "Keep this machine secure; do not share this file.");
    }
}
export function loadSession() {
    try {
        const entry = new Entry(SERVICE, ACCOUNT);
        const payload = entry.getPassword();
        if (payload) {
            return JSON.parse(payload);
        }
    }
    catch {
        // fall through to file fallback
    }
    const path = fallbackPath();
    if (existsSync(path)) {
        try {
            return JSON.parse(readFileSync(path, "utf-8"));
        }
        catch {
            return null;
        }
    }
    return null;
}
export function clearSession() {
    try {
        const entry = new Entry(SERVICE, ACCOUNT);
        entry.deletePassword();
    }
    catch {
        // ignore - may simply not exist in the keyring
    }
    const path = fallbackPath();
    if (existsSync(path)) {
        unlinkSync(path);
    }
}
//# sourceMappingURL=auth-store.js.map