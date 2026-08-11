import { ApiError } from "./api-client.js";
export function printResult(data, json, human) {
    if (json) {
        console.log(JSON.stringify(data, null, 2));
    }
    else {
        console.log(human(data));
    }
}
export function printError(err, json) {
    const message = err instanceof Error ? err.message : String(err);
    if (json) {
        const payload = { error: message };
        if (err instanceof ApiError) {
            payload.status = err.status;
            if (err.body !== undefined)
                payload.details = err.body;
        }
        console.error(JSON.stringify(payload, null, 2));
    }
    else {
        console.error(`Error: ${message}`);
    }
}
//# sourceMappingURL=format.js.map