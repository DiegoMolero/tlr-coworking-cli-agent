export interface StoredSession {
    cookie: string;
    displayName?: string;
    email?: string;
    memberId?: string;
    savedAt: string;
}
export declare function saveSession(session: StoredSession): void;
export declare function loadSession(): StoredSession | null;
export declare function clearSession(): void;
