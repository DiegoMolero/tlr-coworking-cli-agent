export interface BookableResource {
    _id: string;
    name: string;
    number?: number;
    type: string;
    office: string;
    rate?: {
        price?: number;
        name?: string;
    };
    availability?: Array<{
        startDate: string;
        endDate: string | null;
    }>;
}
export interface DesksListOptions {
    date?: string;
    type?: string;
    json?: boolean;
}
export declare function fetchBookableResources(opts: {
    date?: string;
    type?: string;
}): Promise<BookableResource[]>;
export declare function desksListCommand(opts: DesksListOptions): Promise<void>;
