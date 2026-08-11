export interface Booking {
    _id: string;
    reference?: string;
    summary?: string;
    start?: {
        dateTime: string;
    };
    end?: {
        dateTime: string;
    };
    resourceId?: string;
}
export declare function bookingsListCommand(opts: {
    json?: boolean;
}): Promise<void>;
export declare function bookingsCancelCommand(bookingId: string, opts: {
    json?: boolean;
}): Promise<void>;
