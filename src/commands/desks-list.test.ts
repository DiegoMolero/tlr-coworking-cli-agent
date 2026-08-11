import { test, afterEach } from "node:test";
import assert from "node:assert/strict";
import { fetchBookableResources } from "./desks-list.js";
import { saveSession, clearSession } from "../lib/auth-store.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearSession();
});

test("fetchBookableResources() requests bookable resources with expected query params", async () => {
  saveSession({ cookie: "connect.sid=fake", savedAt: new Date().toISOString() });

  let capturedUrl: string | undefined;
  globalThis.fetch = (async (input: RequestInfo | URL) => {
    capturedUrl = String(input);
    return new Response(
      JSON.stringify([{ _id: "res-1", name: "Hot Desk 01", type: "hotdesk", office: "office-1" }]),
      { status: 200, headers: { "Content-Type": "application/json" } }
    );
  }) as unknown as typeof fetch;

  const resources = await fetchBookableResources({ date: "2026-01-01", type: "hotdesk" });

  assert.equal(resources.length, 1);
  assert.equal(resources[0]._id, "res-1");
  assert.ok(capturedUrl?.includes("/user/resources/bookable"));
  assert.ok(capturedUrl?.includes("date=2026-01-01"));
  assert.ok(capturedUrl?.includes("type=hotdesk"));
});
