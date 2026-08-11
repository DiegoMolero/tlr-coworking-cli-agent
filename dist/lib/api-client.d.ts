export declare class ApiError extends Error {
    readonly status: number;
    readonly body?: unknown | undefined;
    constructor(message: string, status: number, body?: unknown | undefined);
}
export declare class NotAuthenticatedError extends Error {
    constructor();
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
/** Computes an absolute ISO expiry timestamp from a login/refresh response's cookie attributes. */
export declare function computeExpiresAt(meta: CookieMeta): string | undefined;
export declare function login(username: string, password: string): Promise<LoginResult>;
/** Performs an authenticated request against the TLR Coworking member portal API. */
export declare function apiFetch(path: string, init?: RequestInit): Promise<Response>;
export declare function apiJson<T>(path: string, init?: RequestInit): Promise<T>;
