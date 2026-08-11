export interface BookOptions {
    date: string;
    start: string;
    end: string;
    title?: string;
    type?: string;
    json?: boolean;
}
export declare function bookCommand(resourceNameOrId: string, opts: BookOptions): Promise<void>;
