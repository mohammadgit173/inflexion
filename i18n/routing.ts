import { defineRouting } from "next-intl/routing";

export const locales = ["fr", "en"] as const;
export type Locale = (typeof locales)[number];

/**
 * A visitor's language preference. Written by proxy.ts on a first visit
 * (from location) and by the FR/EN toggle on every explicit switch.
 */
export const LOCALE_PREF_COOKIE = "inflexion_locale";
export const LOCALE_PREF_MAX_AGE = 60 * 60 * 24 * 365;

/**
 * Which curriculum the visitor is likely studying, set from geolocation by
 * the proxy and read in the browser. Language cannot stand in for this: an
 * English-speaking student at Dawson or Vanier is in the Quebec system, and a
 * francophone outside Quebec is not.
 */
export const REGION_COOKIE = "inflexion_region";
export type Region = "qc" | "intl";

export const routing = defineRouting({
  locales,
  defaultLocale: "fr",
  // French lives at "/", English at "/en".
  localePrefix: "as-needed",
  // Language choice is handled in proxy.ts (location on first visit, then the
  // saved preference), not by next-intl's Accept-Language negotiation.
  localeDetection: false,
  // next-intl would otherwise write its own NEXT_LOCALE cookie as well. One
  // writer only: the preference cookie above.
  localeCookie: false,
  pathnames: {
    "/": "/",
    "/privacy": {
      fr: "/confidentialite",
      en: "/privacy",
    },
    "/events": {
      fr: "/evenements",
      en: "/events",
    },
  },
});
