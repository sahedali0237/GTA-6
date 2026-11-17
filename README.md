# GTA6 AI

A single-page website with a streaming AI chatbot that answers questions about *Grand Theft Auto VI*. Built with Next.js 15 (App Router, TypeScript), Tailwind CSS v4, shadcn/ui, and the Vercel AI SDK over OpenRouter.

## Features

- **Streaming AI chat** — OpenRouter via `@openrouter/ai-sdk-provider` + `ai` SDK, with a topic-guarded system prompt (confirmed facts first, rumors labeled, off-topic refused).
- **Daily quota** — client-side localStorage counter for UX, plus a server-side rate limiter (Upstash Redis when configured, in-memory fallback otherwise) that is the real authority.
- **Countdown** — live countdown to the release date, client-rendered with a skeleton (no hydration mismatch), switching to "GTA 6 is out now! 🎉" after the date.
- **Monetization** — affiliate grid (GA `affiliate_click` events), two ad slots (AdSense or placeholders), donation block, newsletter capture (Formspree/Beehiiv/Mailchimp compatible).
- **SEO** — Metadata API, OpenGraph image (text + gradient only), `WebSite` + `FAQPage` JSON-LD, sitemap, robots, semantic HTML.
- **Privacy-friendly** — no first-party cookies, no server-side chat/email storage.

## Requirements

- Node.js 20+
- An [OpenRouter](https://openrouter.ai/) API key

## Quick start (pnpm)

```bash
pnpm install
cp .env.example .env.local   # fill in the values, see below
pnpm dev                     # http://localhost:3000
```

## Quick start (npm)

```bash
npm install
cp .env.example .env.local
npm run dev
```

Production build:

```bash
pnpm build && pnpm start     # or: npm run build && npm start
```

## Environment variables

Copy `.env.example` to `.env.local` and fill in:

### Server only (never exposed to the browser)

| Variable | Purpose |
|---|---|
| `OPENROUTER_API_KEY` | Your OpenRouter key (`sk-or-v1-...`). **Required for the chat to work.** |
| `OPENROUTER_MODEL` | Model to use, e.g. `openai/gpt-4o-mini` (default). Optional. |
| `ALLOWED_ORIGIN` | Your production site origin (e.g. `https://example.com`). Used for the origin check and OpenRouter referrer attribution. |
| `IP_HASH_SALT` | Long random string used to salt the hashed IPs for rate limiting. |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | Optional. Free-tier Upstash Redis for a shared, persistent rate limiter. |

### Public (safe for the browser)

| Variable | Purpose |
|---|---|
| `NEXT_PUBLIC_DAILY_LIMIT` | Free questions per user per day (default `10`). |
| `NEXT_PUBLIC_GA4_ID` | Google Analytics 4 measurement ID (`G-XXXXXXX`). Analytics is disabled when empty. |
| `NEXT_PUBLIC_ADS_ENABLED` | `"true"` to enable AdSense slots. |
| `NEXT_PUBLIC_ADSENSE_CLIENT_ID` | Your AdSense client ID (`ca-pub-...`). |
| `NEXT_PUBLIC_SHOW_AD_PLACEHOLDERS` | `"true"` to always show dashed ad placeholders. Placeholders always show in development. |

## Getting an OpenRouter key (and not going broke)

1. Sign up at [openrouter.ai](https://openrouter.ai/) → **Keys** → **Create Key**.
2. **Set a spending cap.** OpenRouter → *Credits / Limits* → set a hard monthly credit limit for the key. Without a cap, a viral traffic spike translates directly into a bill. (This is also why the app caps context at 7 short messages and 350 output tokens per answer.)
3. **Prefer cheap models.** The default is `openai/gpt-4o-mini` — good quality at a low price. You can switch with `OPENROUTER_MODEL` in `.env.local` (or Vercel env vars) without a code change.
4. Free models such as `google/gemini-2.0-flash-exp:free` are fine for testing, but they have strict rate limits and are frequently unavailable — expect 429s/timeouts. Use a paid cheap model for production.
5. Fallback models (`CONFIG.FALLBACK_MODELS` in `lib/config.ts`) are passed to OpenRouter as provider-side fallbacks, so a primary-model outage degrades gracefully.

## Optional: Upstash rate limiting

Without Upstash the app uses a per-instance in-memory limiter (fine for a single Node host, best-effort on serverless). For a shared, restart-proof limiter:

1. Create a free database at [upstash.com](https://upstash.com/) (Regional, REST API).
2. Copy the **REST URL** and **REST token** into `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN`.

The app logs a single warning when falling back to memory.

## Deploy to Vercel

1. Push the repo to GitHub/GitLab/Bitbucket.
2. [vercel.com/new](https://vercel.com/new) → import the repo (framework auto-detected: Next.js).
3. Add the environment variables from the tables above in **Project → Settings → Environment Variables**.
4. Deploy. Set `ALLOWED_ORIGIN` to your production domain (e.g. `https://yourdomain.vercel.app` or your custom domain) — the chat API rejects other origins in production.
5. After deploying, consider adding your domain in Vercel → update `CONFIG.SITE_URL` in `lib/config.ts` to match.

## Customizing

Everything visible/configurable lives in **`lib/config.ts`** (the single source of truth):

| What | Where |
|---|---|
| Site URL, name, contact email | `SITE_URL`, `SITE_NAME`, `CONTACT_EMAIL` |
| Release date (countdown + system prompt) | `RELEASE_DATE` |
| Daily question limit | `NEXT_PUBLIC_DAILY_LIMIT` env var |
| Chat model + fallbacks | `OPENROUTER_MODEL` env var, `DEFAULT_MODEL` / `FALLBACK_MODELS` |
| Donation link | `DONATION_URL` (Buy Me a Coffee, Ko-fi, PayPal…) |
| Newsletter endpoint | `NEWSLETTER_ACTION_URL` (Formspree/Beehiiv/Mailchimp form action URL) |
| Trailer video | `TRAILER_YOUTUBE_ID` |
| Affiliate products | `AFFILIATE_PRODUCTS` (replace placeholder images in `public/img/` and the `amzn.to` URLs with your own tags) |
| Suggested chat chips | `SUGGESTED_QUESTIONS` |
| GA / AdSense | `NEXT_PUBLIC_GA4_ID`, `NEXT_PUBLIC_ADS_ENABLED`, `NEXT_PUBLIC_ADSENSE_CLIENT_ID` |

**System prompt:** edit `lib/system-prompt.ts`. It is the guardrail for the bot — keep the knowledge rules, scope limits, and the exact hardware-recommendation line intact unless you know what you're changing. The `{{RELEASE_DATE_HUMAN}}` placeholder is filled from `CONFIG.RELEASE_DATE`.

**FAQ / intro copy:** edit `lib/faq-data.ts`. The FAQ accordion and the `FAQPage` JSON-LD are both generated from this file — keep at least 12 items.

## Security notes

- The OpenRouter key is server-only (`app/api/chat/route.ts`); verify nothing leaked: `grep -r "sk-or" .next/static` must return nothing after a build.
- Security headers (including a CSP) are set in `next.config.ts`.
- The API validates every request: JSON content type, `x-gta6-client: 1` header, same-origin check in production, zod schema (≤ 7 messages, ≤ 500 chars), user-role last message — then per-minute (5/60 s) and daily limiters keyed by salted, truncated SHA-256 of the IP.
- The app sets no cookies; only localStorage (quota) and sessionStorage (current chat) are used.

## Decisions

Choices made where the spec was ambiguous:

1. **Tailwind v4** is used (no `tailwind.config.ts`), with theme tokens declared via `@theme inline` in `app/globals.css`. The spec allowed the v3 fallback; v4 installed and built cleanly, so the fallback was not needed.
2. **CSP uses `'unsafe-inline'` for scripts** (documented inline in `next.config.ts`): Next.js injects inline hydration/bootstrap scripts, and GA/AdSense rely on inline snippets; a nonce-based policy would require threading a nonce through third-party scripts we don't control. Styles also use `'unsafe-inline'` as the spec permits.
3. **Upstream errors mid-stream**: with streaming responses, headers are often already sent when OpenRouter fails or the 25 s abort fires, so a 502 can only be returned for pre-stream failures (bad config, sync errors). Mid-stream errors surface to the client as the §5.6 upstream message via the AI SDK's `onError` handling in `ChatWidget`. Provider error text is never forwarded in either case.
4. **`hashIp` is async** and uses the Web Crypto API instead of `node:crypto`. The spec lists `hashIp()` in `lib/utils.ts`, which is imported by client components; a Node built-in there would break the browser bundle. Web Crypto's SHA-256 is available in Node 20 and produces the same digest.
5. **Client quota increments when a question is dispatched** (the request is sent, not when the answer completes). The server-side daily limiter remains the authority; the client counter is UX only, as the spec states.
6. **Per-minute vs daily 429 distinction**: both limiters return the same `{ "error": "limit" }` per spec, so the client decides which §5.6 message to show based on its own quota state (exhausted → daily message; otherwise → per-minute message).
7. **`GET`/`PUT`/`DELETE` on `/api/chat` return 405** with `{ "error": "bad_request" }`. The spec says "Accept POST only" without naming a status; 405 is the semantically correct choice.
8. **Missing `ALLOWED_ORIGIN` in production** falls back to the request's own host for the origin check (still blocks cross-site abuse). A missing `IP_HASH_SALT` uses a documented default salt so the limiter still works — both are called out with `// NOTE:` comments in the route.
9. **Newsletter POSTs via `fetch`** (JSON body, `Accept: application/json`) instead of a raw form submit, so we can show loading state and toasts without a page reload, as §4.8 requires. This works with Formspree/Beehiiv/Mailchimp endpoints.
10. **Trailer thumbnail uses `hqdefault.jpg`** (always exists on `i.ytimg.com`) rather than `maxresdefault.jpg`, which 404s for some videos. `i.ytimg.com` was added to `next.config.ts` `images.remotePatterns` for `next/image`.
11. **Placeholder product images are simple gradient SVGs** with text (no Rockstar artwork, per §12) served via `next/image` with `dangerouslyAllowSVG` + hardened CSP/sandbox settings, since our own local SVGs are safe.
12. **The affiliate grid is a client component** so the `affiliate_click` GA event can fire from `onClick`. Everything else that doesn't need interactivity stays a server component.
13. **The chat restores from `sessionStorage` after hydration** (initial render is empty, then messages load in an effect). Rendering stored messages during the first client render would cause a hydration mismatch against the server-rendered empty state.
14. **The chat's context trimming is done in a custom `fetch` wrapper** passed to `useChat`, rewriting the request body to the last 7 messages. This avoids depending on AI SDK internal body-merge behavior.
15. **Message length ≤ 500 chars** is enforced by zod on the server. The client textarea does not hard-block longer input; the API's 400 response surfaces as the §5.6 bad-request message.
