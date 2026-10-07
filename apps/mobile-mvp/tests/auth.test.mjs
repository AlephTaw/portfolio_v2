import assert from "node:assert/strict";
import test from "node:test";
import { handleAuth } from "../app/lib/auth.ts";
import { GET as authReturn } from "../app/api/auth/return/route.ts";

test("provider sign-in configuration, CSRF and callback cookies", async (t) => {
  const keys = ["NODE_ENV", "AUTH_URL", "AUTH_SECRET", "AUTH_GOOGLE_ID", "AUTH_GOOGLE_SECRET", "AUTH_APPLE_ID", "AUTH_APPLE_SECRET"];
  const previous = new Map(keys.map((key) => [key, process.env[key]]));
  const originalFetch = globalThis.fetch;
  t.after(() => {
    for (const [key, value] of previous) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
    globalThis.fetch = originalFetch;
  });
  for (const key of keys) delete process.env[key];
  process.env.NODE_ENV = "development";

  await t.test("missing credentials do not pretend to authenticate", async () => {
    const session = await handleAuth(new Request("http://localhost:3007/api/auth/session"));
    assert.equal(await session.json(), null);
    assert.equal(session.headers.get("cache-control"), "no-store");
    for (const provider of ["google", "apple"]) {
      const response = await handleAuth(new Request(`http://localhost:3007/api/auth/signin/${provider}`, { method: "POST" }));
      assert.equal(response.status, 503);
      assert.match((await response.json()).error, /not configured/);
    }
  });

  await t.test("untrusted origins are rejected", async () => {
    const response = await handleAuth(new Request("https://untrusted.example/api/auth/csrf"));
    assert.equal(response.status, 503);
  });

  process.env.AUTH_URL = "https://app.example";
  process.env.AUTH_SECRET = "test-only-secret-with-at-least-thirty-two-characters";
  process.env.AUTH_GOOGLE_ID = "test-google-client";
  process.env.AUTH_GOOGLE_SECRET = "test-google-secret";
  process.env.AUTH_APPLE_ID = "test-apple-service";
  process.env.AUTH_APPLE_SECRET = "test-apple-client-secret";
  globalThis.fetch = async (input) => {
    const url = new URL(input instanceof Request ? input.url : input);
    assert.equal(url.pathname, "/.well-known/openid-configuration");
    return Response.json({
      issuer: url.origin,
      authorization_endpoint: `${url.origin}/authorize`,
      token_endpoint: `${url.origin}/token`,
      jwks_uri: `${url.origin}/keys`,
      response_types_supported: ["code"],
      subject_types_supported: ["public"],
      id_token_signing_alg_values_supported: ["RS256"],
      code_challenge_methods_supported: ["S256"],
    });
  };

  await t.test("Google uses PKCE/state; Apple uses state/nonce and secure POST callback cookies", async () => {
    for (const provider of ["google", "apple"]) {
      const csrfResponse = await handleAuth(new Request("https://app.example/api/auth/csrf"));
      const { csrfToken } = await csrfResponse.json();
      assert.ok(csrfToken);
      const cookie = csrfResponse.headers.getSetCookie().map((value) => value.split(";")[0]).join("; ");
      const response = await handleAuth(new Request(`https://app.example/api/auth/signin/${provider}`, {
        method: "POST",
        headers: { cookie, "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" },
        body: new URLSearchParams({ csrfToken, callbackUrl: "https://app.example/?auth=return" }),
      }));
      assert.equal(response.status, 200);
      const destination = new URL((await response.json()).url);
      assert.equal(destination.searchParams.get("redirect_uri"), `https://app.example/api/auth/callback/${provider}`);
      assert.ok(destination.searchParams.get("state"));
      if (provider === "google") {
        assert.equal(destination.searchParams.get("code_challenge_method"), "S256");
      } else {
        assert.ok(destination.searchParams.get("nonce"));
        assert.equal(destination.searchParams.get("response_mode"), "form_post");
        const transientCookies = response.headers.getSetCookie().filter((value) => /authjs\.(state|nonce)=/.test(value));
        assert.equal(transientCookies.length, 2);
        for (const value of transientCookies) {
          assert.match(value, /HttpOnly/);
          assert.match(value, /Secure/);
          assert.match(value, /SameSite=None/i);
        }
      }
    }
  });

  await t.test("a POST without CSRF cannot launch OAuth", async () => {
    const response = await handleAuth(new Request("https://app.example/api/auth/signin/google", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded", "X-Auth-Return-Redirect": "1" },
      body: new URLSearchParams({ callbackUrl: "https://app.example/?auth=return" }),
    }));
    const destination = new URL((await response.json()).url);
    assert.equal(destination.origin, "https://app.example");
    assert.notEqual(destination.pathname, "/authorize");
  });

  await t.test("cancelled sign-in returns to the landing modal without leaking provider details", () => {
    const response = authReturn(new Request("https://app.example/api/auth/return?error=AccessDenied&callbackUrl=https://untrusted.example"));
    assert.equal(response.status, 303);
    assert.equal(response.headers.get("location"), "https://app.example/?auth=return&error=signin");
  });
});
