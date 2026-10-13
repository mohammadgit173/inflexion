import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import {
  LOCALE_PREF_COOKIE,
  LOCALE_PREF_MAX_AGE,
  REGION_COOKIE,
  routing,
  type Locale,
  type Region,
} from "./i18n/routing";

const intl = createMiddleware(routing);

/**
 * Crawlers are never redirected and never get a preference. Google mostly
 * crawls from US addresses, so redirecting it would send it to /en every time
 * and the French pages would drop out of search. hreflang already tells
 * crawlers about both versions.
 */
const BOT_UA =
  /bot|crawl|spider|slurp|facebookexternalhit|embedly|preview|lighthouse|headless/i;

/**
 * Where a French (unprefixed) URL lives in English, using the same per-locale
 * pathname map as the rest of the site (/confidentialite -> /en/privacy).
 * Returns null for anything that isn't a known page, so a 404 is never turned
 * into a redirect.
 */
function englishPathFor(frPath: string): string | null {
  for (const value of Object.values(routing.pathnames)) {
    const fr = typeof value === "string" ? value : value.fr;
    const en = typeof value === "string" ? value : value.en;
    if (fr === frPath) return en === "/" ? "/en" : `/en${en}`;
  }
  return null;
}

/**
 * Location-based default: French only when the visitor is known to be in
 * Quebec, English otherwise — including when location is unknown.
 */
function localeFromLocation(request: NextRequest): Locale {
  // Vercel adds these to every request; Next 16 removed request.geo. They are
  // absent in local dev and on other hosts, which falls through to English.
  const country = request.headers.get("x-vercel-ip-country");
  const region = request.headers.get("x-vercel-ip-country-region");
  return country === "CA" && region === "QC" ? "fr" : "en";
}

function regionFromLocation(request: NextRequest): Region {
  const country = request.headers.get("x-vercel-ip-country");
  const region = request.headers.get("x-vercel-ip-country-region");
  return country === "CA" && region === "QC" ? "qc" : "intl";
}

/**
 * Records the curriculum region so the page can pick which subject list to
 * show. Only set when absent, so a visitor who switches it by hand keeps
 * their choice. Readable by the browser by design.
 */
function rememberRegion(request: NextRequest, response: NextResponse) {
  if (request.cookies.has(REGION_COOKIE)) return response;
  response.cookies.set(REGION_COOKIE, regionFromLocation(request), {
    path: "/",
    maxAge: LOCALE_PREF_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

function remember(response: NextResponse, locale: Locale) {
  response.cookies.set(LOCALE_PREF_COOKIE, locale, {
    path: "/",
    maxAge: LOCALE_PREF_MAX_AGE,
    sameSite: "lax",
  });
  return response;
}

/**
 * Which language a visitor sees on the bare, unprefixed URLs (/, /confidentialite):
 *
 *   1. A saved preference wins. It is set by the FR/EN toggle, and by step 2
 *      the first time a visitor arrives.
 *   2. No preference yet: French in Quebec, English everywhere else —
 *      including when location is unknown (local dev, non-Vercel hosting).
 *
 * Explicit /en URLs are always served in English as linked. They don't change
 * a saved preference, so opening a shared English link doesn't flip someone's
 * default language.
 */
/**
 * The booking confirmation lives at exactly one URL in every language.
 *
 * Both the analytics conversion and Calendly's redirect setting take a single
 * address — Calendly cannot branch by the visitor's language, and a
 * conversion defined on two URLs is two things to keep in step. So /booked
 * stays in the address bar for everyone and is rewritten, not redirected, to
 * the page in their language.
 */
const CONFIRMATION_PATH = "/booked";

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === CONFIRMATION_PATH) {
    const saved = request.cookies.get(LOCALE_PREF_COOKIE)?.value;
    const locale: Locale =
      saved === "fr" || saved === "en" ? saved : localeFromLocation(request);
    const url = request.nextUrl.clone();
    url.pathname = `/${locale}${CONFIRMATION_PATH}`;
    return rememberRegion(request, NextResponse.rewrite(url));
  }
  const onEnglish = pathname === "/en" || pathname.startsWith("/en/");
  const isBot = BOT_UA.test(request.headers.get("user-agent") ?? "");

  if (isBot || onEnglish) {
    const response = intl(request);
    // A first visit that arrives straight on an English URL starts out English.
    if (!isBot && !request.cookies.has(LOCALE_PREF_COOKIE)) {
      remember(response, "en");
    }
    // Bots get no cookies at all: nothing to personalise, and a crawler
    // carrying state between requests is how cached pages go wrong.
    return isBot ? response : rememberRegion(request, response);
  }

  const saved = request.cookies.get(LOCALE_PREF_COOKIE)?.value;
  const wanted: Locale =
    saved === "fr" || saved === "en" ? saved : localeFromLocation(request);

  if (wanted === "en") {
    const target = englishPathFor(pathname);
    if (target) {
      const url = request.nextUrl.clone();
      url.pathname = target;
      // 307, not 308: the answer depends on who is asking, so it must never be
      // cached as a permanent redirect.
      const response = NextResponse.redirect(url, 307);
      rememberRegion(request, response);
      return saved ? response : remember(response, "en");
    }
  }

  const response = intl(request);
  if (wanted === "fr" && !saved) remember(response, "fr");
  return rememberRegion(request, response);
}

export const config = {
  // Match every path except API routes, Next internals, generated metadata
  // images, and anything that looks like a file (contains a dot).
  //
  // opengraph-image is excluded because the as-needed locale prefix would
  // otherwise 307 /fr/opengraph-image to /opengraph-image, and Next's
  // file-based metadata emits the prefixed URL in og:image. Crawlers are not
  // reliable about following redirects for that tag.
  //
  // The double backslash is load-bearing: "\." in a JS string collapses to
  // "." and the lookahead would then swallow every route.
  matcher: ["/((?!api|_next|_vercel|.*opengraph-image|.*twitter-image|.*\\..*).*)"],
};
