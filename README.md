# Inflexion

Marketing site for Inflexion — online math tutoring, high school through
first-year university. Next.js App Router, TypeScript, Tailwind v4, next-intl
(French at `/`, English at `/en`), next-themes, Motion.

## Running locally

```bash
npm install
npm run dev
```

Copy `.env.example` to `.env.local` and fill it in.

## Environment variables

| Variable | Required | Notes |
|---|---|---|
| `NEXT_PUBLIC_SITE_URL` | yes | Canonical origin. Drives metadata, hreflang, sitemap, OG images. Defaults to `https://inflexion.ca`. |
| `NEXT_PUBLIC_BOOKING_URL` | yes | Booking link — currently `https://calendly.com/math-inflexion/30min`. Cal.com links also work. While empty, section 009 shows the email address instead of a calendar. |
| `NEXT_PUBLIC_HERO_SCENE_MOBILE` | no | `true` (default) runs the animated hero on phones. `false` serves the static poster below 1024px — the main lever for mobile performance. |

## Language selection

French lives at `/`, English under `/en`. On a visitor's **first** visit to
a French URL, `proxy.ts` picks the language from their location:

- in Quebec (country `CA`, region `QC`) → French
- anywhere else, or location unknown → English (redirected to the `/en` equivalent)

The result is saved in the `inflexion_locale` cookie for a year, and the FR/EN
toggle overwrites it, so the visitor's choice always wins after that.
Search-engine crawlers are never redirected, which keeps the French pages
indexed.

Location comes from headers Vercel adds to each request, so **on localhost
there is no location and everyone gets English**. To see the Quebec case, send
the headers yourself:

```bash
curl -I -H "x-vercel-ip-country: CA" -H "x-vercel-ip-country-region: QC" http://localhost:3000/
```

## Theme

Dark on a first visit, whatever the visitor's OS setting. The sun/moon toggle
switches to light, and that choice is remembered in the browser.

## Editing copy

**All text lives in `messages/fr.json` and `messages/en.json`.** No strings are
hardcoded in components. Two conventions:

- An **empty string** hides its element. FAQ entries with `"a": ""` are
  skipped; `about.personalStory` renders nothing until filled.
- `testimonials.items` is an **empty array**, and section 007 renders nothing
  at all — no heading, no rule, no spacing — until entries are added:

  ```json
  { "quote": "…", "firstName": "…", "context": "Secondaire 5", "parent": false }
  ```

## Assets to replace

- `public/founder-portrait-v2.png` — the founder portrait: square crop around
  the face, then a full ordered dither (blur, Bayer 8x8 at 2px dots, 3 levels
  per channel). Served unoptimized, shown in a circle. The untouched photo is
  `design/founder-original-v2.jpg` (and the earlier one, in a blazer, is
  `design/founder-original.jpg`). Give the file a new name whenever the photo
  or treatment changes, so no cache serves a stale version.
- `public/hero-fallback.png` — static hero, shown under
  `prefers-reduced-motion`, without WebGL, and as the poster before the scene
  loads. Regenerate if the Unicorn Studio scene changes.

## Deploying to Vercel

```bash
npm i -g vercel
vercel link
vercel env add NEXT_PUBLIC_SITE_URL production
vercel env add NEXT_PUBLIC_BOOKING_URL production
vercel deploy --prod
```

No framework configuration is needed — Vercel detects Next.js. After the first
deploy, point the domain at the project and confirm `NEXT_PUBLIC_SITE_URL`
matches it exactly, or canonical tags and the sitemap will disagree with the
served host.

## Measured quality

Lighthouse, mobile preset, production build, three-run median:

| | score |
|---|---|
| Accessibility | **100** |
| Best practices | **100** |
| SEO | **92** locally — the only failure is the canonical audit comparing `inflexion.ca` against `localhost`. Expect 100 on the real domain. |
| Performance | **55** with the hero scene on mobile; **73** with it off |

CLS is 0, FCP ~1.0s. Performance is dominated by the third-party WebGL scene
(TBT ~2.5s). Mitigations already applied: scene init deferred to idle, render
DPI capped at 1 below 1024px, scene skipped on Save-Data and low-core/low-memory
devices, and a server-rendered poster so the image is never gated behind
hydration. Note these numbers come from headless Chrome using software WebGL,
which is considerably slower than a real phone GPU.
