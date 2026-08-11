import { ApiError } from "./api-client.js";

export function printResult(data: unknown, json: boolean, human: (data: any) => string): void {
  if (json) {
    console.log(JSON.stringify(data, null, 2));
  } else {
    console.log(human(data));
  }
}

export function printError(err: unknown, json: boolean): void {
  const message = err instanceof Error ? err.message : String(err);
  if (json) {
    const payload: Record<string, unknown> = { error: message };
    if (err instanceof ApiError) {
      payload.status = err.status;
      if (err.body !== undefined) payload.details = err.body;
    }
    console.error(JSON.stringify(payload, null, 2));
  } else {
    console.error(`Error: ${message}`);
  }
}
