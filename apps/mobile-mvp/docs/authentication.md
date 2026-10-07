# Google and Apple signup

The beta modal uses Auth.js Core through `/api/auth/[...auth]`. Provider tokens
are verified on the server; sessions use encrypted, HTTP-only cookies. OAuth
returns to the landing page's final countdown state with the beta modal open.
Google and Apple are the only signup options. Manual email submission and its
local-storage saving behavior have been removed. Provider authentication does
not yet register users in a mailing list or application database.

## Configuration

Copy `auth.env.example` into `.env.local` in this app and restart the server.
Generate `AUTH_SECRET` with `openssl rand -base64 32`. Keep it and all provider
secrets private. Set `AUTH_URL` to the exact public origin serving the app
(including the port locally); production proxies must preserve that origin.
Never use a wildcard host. Do not expose any auth variables with `NEXT_PUBLIC_`.

### Google

Create a Web application OAuth client in Google Cloud; configure its consent
screen and test users as needed. Set `AUTH_GOOGLE_ID` and `AUTH_GOOGLE_SECRET`.
Register these authorized redirect URIs for the environments you actually use:

- Local: `http://localhost:3007/api/auth/callback/google`
- Production: `https://YOUR_DOMAIN/api/auth/callback/google`

### Apple

Configure Sign in with Apple for an Apple Developer App ID and associated
Services ID. Register your HTTPS domain and return URL
`https://YOUR_DOMAIN/api/auth/callback/apple`.
Set `AUTH_APPLE_ID` to the Services ID. `AUTH_APPLE_SECRET` is a signed client
secret JWT generated with your Apple Team ID, Key ID and private `.p8` key—not
the private key itself. Renew it before it expires. Apple does not accept
localhost/HTTP callbacks; test on a registered HTTPS environment.

Auth.js's Apple provider handles the POST callback and secure SameSite=None
state/nonce cookies. Both providers must return a verified email. Apple private
relay emails are accepted. No database adapter/account merging is configured;
this is provider sign-in, not durable application account provisioning.

## Verification

Without credentials, both buttons display a configuration message rather than
pretending to sign up. With credentials, verify successful login, cancellation,
the beta modal reopening, the verified email displaying, and session persistence
after reload. Ensure an invalid callback/state is rejected and no tokens appear
in client storage. Complete these live-provider checks before deployment.

Provider setup references: [Google](https://authjs.dev/getting-started/providers/google),
[Apple](https://authjs.dev/getting-started/providers/apple).
