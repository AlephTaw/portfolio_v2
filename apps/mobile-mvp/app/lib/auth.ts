import { Auth, type AuthConfig } from "@auth/core";
import Apple from "@auth/core/providers/apple";
import Google from "@auth/core/providers/google";

function unavailable(error: string): Response {
  return Response.json({ error }, { status: 503, headers: { "Cache-Control": "no-store" } });
}

/** Keep credentials and session verification entirely on the server. */
export async function handleAuth(request: Request): Promise<Response> {
  const url = new URL(request.url);
  const configuredOrigin = process.env.AUTH_URL ? new URL(process.env.AUTH_URL).origin : null;
  const localDevelopment = process.env.NODE_ENV !== "production" &&
    ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (configuredOrigin ? url.origin !== configuredOrigin : !localDevelopment) {
    return unavailable("Sign-up requires a configured AUTH_URL.");
  }

  const providers: AuthConfig["providers"] = [];
  if (process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET) {
    providers.push(Google({ clientId: process.env.AUTH_GOOGLE_ID, clientSecret: process.env.AUTH_GOOGLE_SECRET, checks: ["pkce", "state"] }));
  }
  if (process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET && url.protocol === "https:") {
    providers.push(Apple({ clientId: process.env.AUTH_APPLE_ID, clientSecret: process.env.AUTH_APPLE_SECRET }));
  }
  const provider = url.pathname.match(/\/signin\/(google|apple)$/)?.[1];
  const available = provider === "google"
    ? process.env.AUTH_GOOGLE_ID && process.env.AUTH_GOOGLE_SECRET
    : process.env.AUTH_APPLE_ID && process.env.AUTH_APPLE_SECRET && url.protocol === "https:";
  if (!process.env.AUTH_SECRET || (provider && !available)) {
    if (url.pathname.endsWith("/session")) return Response.json(null, { headers: { "Cache-Control": "no-store" } });
    return unavailable("Sign-up is not configured yet. Please try again later.");
  }

  const response = await Auth(request, {
    basePath: "/api/auth",
    secret: process.env.AUTH_SECRET,
    trustHost: true, // Origin is explicitly validated above, not trusted from arbitrary host headers.
    providers,
    session: { strategy: "jwt", maxAge: 30 * 24 * 60 * 60 },
    pages: { signIn: "/api/auth/return", error: "/api/auth/return" },
    callbacks: {
      signIn({ profile }) {
        const verified: unknown = profile?.email_verified;
        return verified === true || verified === "true";
      },
      redirect({ baseUrl }) {
        // Apple posts cross-site, so the Lax callback URL cookie may be absent.
        // Both providers always return to this app's single landing-page modal.
        return `${baseUrl}/?auth=return`;
      },
    },
  });
  response.headers.set("Cache-Control", "no-store");
  return response;
}
