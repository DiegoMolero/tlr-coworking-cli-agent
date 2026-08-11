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
        console.error(JSON.stringify({ error: message }, null, 2));
    }
    else {
        console.error(`Error: ${message}`);
    }
}
//# sourceMappingURL=format.js.map