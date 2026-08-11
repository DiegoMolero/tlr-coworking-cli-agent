import { test, mock, beforeEach, afterEach } from "node:test";
import assert from "node:assert/strict";
import { login, ApiError } from "./api-client.js";

const originalFetch = globalThis.fetch;

afterEach(() => {
  globalThis.fetch = originalFetch;
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
