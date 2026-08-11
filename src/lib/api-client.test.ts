import { test, mock, afterEach } from "node:test";
import assert from "node:assert/strict";
import { login, apiFetch, computeExpiresAt, ApiError } from "./api-client.js";
import { saveSession, loadSession, clearSession } from "./auth-store.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
  clearSession();
});

test("login() returns cookie, displayName and memberId on success", async () => {
  globalThis.fetch = mock.fn(async () => {
    return new Response(
      JSON.stringify({
        user: { displayName: "Test User", emails: ["test@example.com"] },
        perm: { contact: "member-id-123" },
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
          "Set-Cookie": "connect.sid=s%3Afake-session-value; Path=/; HttpOnly",
        },
      }
    );
  }) as unknown as typeof fetch;

  const result = await login("someone@example.com", "correct-password");

  assert.equal(result.displayName, "Test User");
  assert.equal(result.email, "test@example.com");
  assert.equal(result.memberId, "member-id-123");
  assert.match(result.cookie, /^connect\.sid=/);
});

test("login() throws ApiError on 401", async () => {
  globalThis.fetch = mock.fn(async () => {
    return new Response(
      JSON.stringify({
        name: "AuthenticationRequiredError",
        message: "Username or password did not match",
      }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }) as unknown as typeof fetch;

  await assert.rejects(
    () => login("someone@example.com", "wrong-password"),
    (err: unknown) => {
      assert.ok(err instanceof ApiError);
      assert.equal(err.status, 401);
      return true;
    }
  );
});

test("computeExpiresAt() derives an absolute expiry from Max-Age", () => {
  const before = Date.now();
  const iso = computeExpiresAt({ maxAgeSeconds: 3600, hasExplicitExpiry: true });
  assert.ok(iso);
  const delta = new Date(iso as string).getTime() - before;
  assert.ok(delta > 3500_000 && delta <= 3600_000 + 5000, `unexpected delta: ${delta}`);
});

test("computeExpiresAt() returns undefined when there is no explicit expiry", () => {
  assert.equal(computeExpiresAt({ hasExplicitExpiry: false }), undefined);
});

test("apiFetch() persists a refreshed session cookie/expiry (rolling session support)", async () => {
  saveSession({ cookie: "connect.sid=old-value", savedAt: new Date().toISOString() });

  globalThis.fetch = (async () =>
    new Response(JSON.stringify({ ok: true }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "Set-Cookie": "connect.sid=new-refreshed-value; Path=/; HttpOnly; Max-Age=604800",
      },
    })) as unknown as typeof fetch;

  await apiFetch("/user/whatever");

  const updated = loadSession();
  assert.equal(updated?.cookie, "connect.sid=new-refreshed-value");
  assert.ok(updated?.expiresAt, "expected expiresAt to be set from the refreshed cookie");
});
