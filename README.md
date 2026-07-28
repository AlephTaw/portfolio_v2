# Steven Wilcox CV

Single-page public CV and work presentation built with Next App Router semantics
on top of Vinext, Vite, and a Cloudflare Workers runtime.

## Stack

- Next.js App Router
- Vinext
- Vite
- Cloudflare Workers
- Tailwind CSS
- Framer Motion
- Lenis

## Prerequisites

- Node.js `>=22.13.0`
- A Cloudflare account
- A Resend account for contact-form delivery

## Local Development

```bash
npm install
npm run dev
```

Useful commands:

- `npm run build`: production build
- `npm run start`: preview the production build locally
- `npm run test`: build and run the SSR regression tests

## Contact Form Configuration

The contact workflow posts to `app/api/contact/route.ts` and sends mail through
Resend.

For local development, put these values in `.env.local`:

- `RESEND_API_KEY`
- `CONTACT_DESTINATION_EMAIL`
- `CONTACT_FROM_EMAIL`
- `CONTACT_PUBLIC_EMAIL` (optional, shown publicly on the contact page)

The checked-in [`.env.example`](/Users/stevenwilcox/Desktop/swdev/.env.example)
shows the exact variable names.

Recommended pattern:

- `Destination`: your private inbox
- `From`: a verified domain address like `contact@swilcox.dev`
- `Public`: an address you are comfortable displaying publicly, if you want one shown
- `Reply-To`: the sender's email from the form

For backward compatibility, the server still accepts `CONTACT_TO_EMAIL`, but
`CONTACT_DESTINATION_EMAIL` is the preferred name because it makes the private
delivery target explicit.

## Cloudflare Deployment

This repo is set up to deploy to Cloudflare Workers.

Relevant files:

- [wrangler.jsonc](/Users/stevenwilcox/Desktop/swdev/wrangler.jsonc)
- [worker/index.ts](/Users/stevenwilcox/Desktop/swdev/worker/index.ts)
- [vite.config.ts](/Users/stevenwilcox/Desktop/swdev/vite.config.ts)

### 1. Authenticate Wrangler

```bash
npx wrangler login
```

Then confirm the account info:

```bash
npx wrangler whoami
```

Copy your Cloudflare `account_id` into
[wrangler.jsonc](/Users/stevenwilcox/Desktop/swdev/wrangler.jsonc).

### 2. Set production secrets

Use Wrangler secrets for the contact-form environment variables:

```bash
npx wrangler secret put RESEND_API_KEY
npx wrangler secret put CONTACT_DESTINATION_EMAIL
npx wrangler secret put CONTACT_FROM_EMAIL
npx wrangler secret put CONTACT_PUBLIC_EMAIL
```

You will be prompted for each value.

### 3. Deploy the Worker

```bash
npm run cf:deploy
```

That runs the production build and then deploys the Worker with Wrangler.

### 4. Attach the custom domain

After the Worker is deployed, attach `swilcox.dev` to the production Worker in
the Cloudflare dashboard:

- Workers & Pages -> `steven-wilcox-cv`
- Settings -> Domains & Routes
- Add Domain
- Domain: `swilcox.dev`

When the binding is active, the domain should appear in the table under
**Custom Domains and Routes** for the production environment.

### 5. Tail production logs

```bash
npm run cf:tail
```

## Domain and DNS Setup

Recommended production hostnames:

- primary site: `swilcox.dev`
- redirect alias: `www.swilcox.dev` -> `swilcox.dev`

### If your DNS is managed in Cloudflare

This is the cleanest option.

1. Add `swilcox.dev` as a zone in Cloudflare.
2. Update your registrar to use the Cloudflare nameservers assigned to the
   zone.
3. After the Worker is deployed, attach `swilcox.dev` as a **Custom Domain**
   in Cloudflare:
   - Workers & Pages -> your Worker -> Settings -> Domains & Routes -> Add Domain
4. In the zone's **SSL/TLS** settings, enable **Always Use HTTPS** so
   `http://` requests are redirected to `https://`.

For a Worker **Custom Domain**, Cloudflare creates the DNS record and TLS
certificate for that hostname automatically. That means you do **not** need to
manually create an apex `A` or `CNAME` record for `swilcox.dev` when using the
Custom Domain flow.

### `www` redirect record

Because Worker Custom Domains match exact hostnames, `www.swilcox.dev` should
be redirected separately.

Create one proxied placeholder DNS record for `www`:

- `Type`: `AAAA`
- `Name`: `www`
- `Value`: `100::`
- `Proxy`: on

Cloudflare also documents a proxied placeholder `A` record to `192.0.2.0`, but
the `AAAA` placeholder above is enough for this redirect setup.

Then create the redirect using Cloudflare's **simple redirect form**:

- Rules -> Redirect Rules -> Create rule
- Rule type: **Single Redirect**
- Rule name: `www to apex`
- Incoming request URL: `https://www.swilcox.dev/*`
- Target URL: `https://swilcox.dev/${1}`
- Status code: `301`
- Preserve query string: enabled

That preserves paths and query strings, so:

- `https://www.swilcox.dev/contact` -> `https://swilcox.dev/contact`
- `https://www.swilcox.dev/contact?ref=linkedin` -> `https://swilcox.dev/contact?ref=linkedin`

If the hostname does not resolve immediately after setup, check that:

- the Cloudflare zone status is **Active**
- `swilcox.dev` appears in the Worker's **Custom Domains and Routes** table
- nameserver changes have had time to propagate

### If your DNS stays somewhere else

You can still deploy the Worker on Cloudflare, but the easiest setup is usually
to move authoritative DNS for the zone to Cloudflare too. That way the Worker
custom-domain flow can manage the DNS record and certificate automatically.

## Repo Cleanup Notes

This repo intentionally no longer includes Netlify deployment configuration.

- removed: `netlify.toml`
- kept: `.openai/hosting.json`

`.openai/hosting.json` is local Codex/Sites metadata, not the production
deployment target for this site.
