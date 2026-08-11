export interface StoredSession {
    cookie: string;
    displayName?: string;
    email?: string;
    memberId?: string;
    savedAt: string;
    /** ISO expiry computed from the login response's cookie Max-Age/Expires, if any was set. */
    expiresAt?: string;
    /** True if the server did not send an explicit Max-Age/Expires (likely a rolling/idle-timeout session). */
    hasExplicitExpiry?: boolean;
}
export declare function saveSession(session: StoredSession): void;
export declare function loadSession(): StoredSession | null;
export declare function clearSession(): void;
