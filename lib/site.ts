/**
 * The real, public domain. Set NEXT_PUBLIC_SITE_URL only once the site is
 * live on its own domain; until then every deployment is treated as a
 * temporary copy (see IS_PUBLIC_SITE).
 */
const EXPLICIT_SITE_URL = process.env.NEXT_PUBLIC_SITE_URL;

/**
 * Vercel exposes the deployment's own host at build time. Used as the origin
 * when no real domain is set, so link previews and canonical tags on a
 * temporary *.vercel.app deployment point at that deployment, not at a
 * domain that doesn't exist yet.
 */
const VERCEL_HOST =
  process.env.VERCEL_PROJECT_PRODUCTION_URL || process.env.VERCEL_URL;

/**
 * Canonical origin, used for metadata, hreflang, sitemap and OG images.
 *
 * Normalised through URL so the scheme and host come out lower-case whatever
 * the environment variable happens to hold. Next's metadata helpers already
 * do this internally, so a value typed as HTTPS://EXAMPLE.COM looks correct
 * in the canonical tag while robots.txt and the sitemap — which interpolate
 * the string directly — shout it back in capitals. Normalising once here
 * keeps every consumer consistent.
 */
export const SITE_URL = normaliseOrigin(
  EXPLICIT_SITE_URL ??
    (VERCEL_HOST ? `https://${VERCEL_HOST}` : "https://inflexion.ca"),
);

function normaliseOrigin(value: string): string {
  try {
    return new URL(value).origin;
  } catch {
    // Not parseable as a URL: fall back to the raw value minus any trailing
    // slash, which is what this did before.
    return value.replace(/\/$/, "");
  }
}

/**
 * True only once NEXT_PUBLIC_SITE_URL names the real domain. Everything else
 * — feedback copies on *.vercel.app, local builds — asks search engines not
 * to index it, so a temporary copy never competes with the real site later.
 */
export const IS_PUBLIC_SITE = Boolean(EXPLICIT_SITE_URL);

/**
 * The booking link the embed points at.
 *
 * Defaulted in code rather than left to the environment. It is a public URL,
 * not a secret, and when it lived only in an environment variable a deploy
 * made without that variable silently shipped a page with no calendar on it.
 * NEXT_PUBLIC_BOOKING_URL still overrides this for testing another link.
 */
export const BOOKING_URL =
  process.env.NEXT_PUBLIC_BOOKING_URL ||
  "https://calendly.com/math-inflexion/30min";

/**
 * Google Analytics 4 measurement ID (G-XXXXXXXXXX).
 *
 * Empty means no analytics script is loaded at all — no requests to Google,
 * no cookies. The privacy policy reads this too, so the page cannot claim
 * "no analytics" while analytics are running.
 */
export const GA_ID = process.env.NEXT_PUBLIC_GA_ID ?? "";
