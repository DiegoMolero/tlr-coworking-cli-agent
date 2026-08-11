import { apiPath } from "./config.js";
import { loadSession, saveSession, type StoredSession } from "./auth-store.js";

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
    public readonly body?: unknown
  ) {
    super(message);
    this.name = "ApiError";
  }
}

export class NotAuthenticatedError extends Error {
  constructor() {
    super('Not logged in. Run "tlr login" first.');
    this.name = "NotAuthenticatedError";
  }
}

export interface LoginResult {
  cookie: string;
  displayName?: string;
  email?: string;
  memberId?: string;
  /** Diagnostic info about the session cookie's lifetime, never includes the cookie's value. */
  cookieMeta: CookieMeta;
}

export interface CookieMeta {
  maxAgeSeconds?: number;
  expires?: string;
  hasExplicitExpiry: boolean;
}

/** Extracts the connect.sid cookie pair from a Set-Cookie response header. */
function extractSessionCookie(setCookieHeaders: string[]): string | null {
  for (const header of setCookieHeaders) {
    const match = header.match(/connect\.sid=[^;]+/);
    if (match) {
      return match[0];
    }
  }
  return null;
}

/**
 * Parses cookie attributes (Max-Age/Expires) for diagnostics, without ever touching the
 * cookie's actual value. Used to figure out whether/when a stored session will expire.
 */
function extractCookieMeta(setCookieHeaders: string[]): CookieMeta {
  for (const header of setCookieHeaders) {
    if (!/connect\.sid=/.test(header)) continue;
    const maxAgeMatch = header.match(/Max-Age=(\d+)/i);
    const expiresMatch = header.match(/Expires=([^;]+)/i);
    return {
      maxAgeSeconds: maxAgeMatch ? Number(maxAgeMatch[1]) : undefined,
      expires: expiresMatch ? expiresMatch[1].trim() : undefined,
      hasExplicitExpiry: Boolean(maxAgeMatch || expiresMatch),
    };
  }
  return { hasExplicitExpiry: false };
}

/** Computes an absolute ISO expiry timestamp from a login/refresh response's cookie attributes. */
export function computeExpiresAt(meta: CookieMeta): string | undefined {
  if (meta.maxAgeSeconds) {
    return new Date(Date.now() + meta.maxAgeSeconds * 1000).toISOString();
  }
  if (meta.expires) {
    return new Date(meta.expires).toISOString();
  }
  return undefined;
}

export async function login(username: string, password: string): Promise<LoginResult> {
  const res = await fetch(apiPath("/signin"), {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });

  const body = (await res.json().catch(() => undefined)) as
    | {
        user?: { displayName?: string; emails?: string[] };
        perm?: { contact?: string };
        message?: string;
        name?: string;
      }
    | undefined;

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
    cookieMeta: extractCookieMeta(setCookie),
  };
}

/** Best-effort extraction of a human-readable reason from an API error body. */
function extractErrorMessage(body: unknown): string | undefined {
  if (!body || typeof body !== "object") return undefined;
  const b = body as Record<string, unknown>;

  if (typeof b.message === "string" && b.message.trim()) return b.message;
  if (typeof b.error === "string" && b.error.trim()) return b.error;

  // OfficeRnD Flex often returns { errors: [{ message }] } or { errors: [{ msg }] }.
  if (Array.isArray(b.errors) && b.errors.length > 0) {
    const parts = b.errors
      .map((e) => (typeof e === "string" ? e : (e as Record<string, unknown>)?.message ?? (e as Record<string, unknown>)?.msg))
      .filter((m): m is string => typeof m === "string" && m.trim().length > 0);
    if (parts.length > 0) return parts.join("; ");
  }

  if (typeof b.name === "string" && b.name.trim() && b.name !== "Error") return b.name;

  return undefined;
}

function requireSession(): StoredSession {
  const session = loadSession();
  if (!session) {
    throw new NotAuthenticatedError();
  }
  return session;
}

/** Performs an authenticated request against the TLR Coworking member portal API. */
export async function apiFetch(path: string, init: RequestInit = {}): Promise<Response> {
  const session = requireSession();
  const headers = new Headers(init.headers);
  headers.set("Cookie", session.cookie);
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  const res = await fetch(apiPath(path), { ...init, headers });

  // If the server refreshed the session (e.g. a rolling/sliding-expiration cookie), persist the
  // updated cookie + expiry locally so the stored session keeps extending itself as long as the
  // CLI (or an agent using it) keeps being used, without ever needing the password again.
  const setCookie = typeof res.headers.getSetCookie === "function" ? res.headers.getSetCookie() : [];
  const refreshedCookie = extractSessionCookie(setCookie);
  if (refreshedCookie && refreshedCookie !== session.cookie) {
    const meta = extractCookieMeta(setCookie);
    saveSession({
      ...session,
      cookie: refreshedCookie,
      expiresAt: computeExpiresAt(meta) ?? session.expiresAt,
      hasExplicitExpiry: meta.hasExplicitExpiry || session.hasExplicitExpiry,
    });
  }

  if (res.status === 401) {
    throw new NotAuthenticatedError();
  }
  if (!res.ok) {
    const body = await res.json().catch(() => undefined);
    const reason = extractErrorMessage(body);
    const message = reason
      ? `Request to ${path} failed (${res.status}): ${reason}`
      : `Request to ${path} failed (${res.status})`;
    throw new ApiError(message, res.status, body);
  }
  return res;
}

export async function apiJson<T>(path: string, init: RequestInit = {}): Promise<T> {
  const res = await apiFetch(path, init);
  return (await res.json()) as T;
}
