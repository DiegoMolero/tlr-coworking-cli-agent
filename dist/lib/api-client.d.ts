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
}
export declare function login(username: string, password: string): Promise<LoginResult>;
/** Performs an authenticated request against the TLR Coworking member portal API. */
export declare function apiFetch(path: string, init?: RequestInit): Promise<Response>;
export declare function apiJson<T>(path: string, init?: RequestInit): Promise<T>;
