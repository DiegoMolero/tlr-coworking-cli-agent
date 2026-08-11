import { apiPath } from "./config.js";
import { loadSession } from "./auth-store.js";
export class ApiError extends Error {
    status;
    body;
    constructor(message, status, body) {
        super(message);
        this.status = status;
        this.body = body;
        this.name = "ApiError";
    }
}
export class NotAuthenticatedError extends Error {
    constructor() {
        super('Not logged in. Run "tlr login" first.');
        this.name = "NotAuthenticatedError";
    }
}
/** Extracts the connect.sid cookie pair from a Set-Cookie response header. */
function extractSessionCookie(setCookieHeaders) {
    for (const header of setCookieHeaders) {
        const match = header.match(/connect\.sid=[^;]+/);
        if (match) {
            return match[0];
        }
    }
    return null;
}
export async function login(username, password) {
    const res = await fetch(apiPath("/signin"), {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
    });
    const body = (await res.json().catch(() => undefined));
    if (!res.ok) {
        throw new ApiError(body?.message ?? "Login failed", res.status, body);
    }
    const setCookie = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
    const cookie = extractSessionCookie(setCookie);
    if (!cookie) {
        throw new ApiError("Login succeeded but no session cookie was returned", res.status, body);
    }
    return {
        cookie,
        displayName: body?.user?.displayName,
        email: body?.user?.emails?.[0],
        memberId: body?.perm?.contact,
    };
}
function requireSession() {
    const session = loadSession();
    if (!session) {
        throw new NotAuthenticatedError();
    }
    return session;
}
/** Performs an authenticated request against the TLR Coworking member portal API. */
export async function apiFetch(path, init = {}) {
    const session = requireSession();
    const headers = new Headers(init.headers);
    headers.set("Cookie", session.cookie);
    if (init.body && !headers.has("Content-Type")) {
        headers.set("Content-Type", "application/json");
    }
    const res = await fetch(apiPath(path), { ...init, headers });
    if (res.status === 401) {
        throw new NotAuthenticatedError();
    }
    if (!res.ok) {
        const body = await res.json().catch(() => undefined);
        throw new ApiError(`Request to ${path} failed`, res.status, body);
    }
    return res;
}
export async function apiJson(path, init = {}) {
    const res = await apiFetch(path, init);
    return (await res.json());
}
//# sourceMappingURL=api-client.js.map