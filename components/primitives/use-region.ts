"use client";

import { useSyncExternalStore } from "react";
import { REGION_COOKIE, type Region } from "@/i18n/routing";

/*
 * The region cookie as an external store.
 *
 * The proxy writes it from geolocation; the browser reads it during render,
 * so the right variant is on screen from the first client render instead of
 * flashing the default and correcting itself. Cookies emit no change event,
 * so the setter notifies subscribers itself.
 */
const listeners = new Set<() => void>();

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  return () => {
    listeners.delete(onChange);
  };
}

function readRegion(): Region | null {
  const match = document.cookie.match(
    new RegExp(`(?:^|; )${REGION_COOKIE}=(qc|intl)`),
  );
  return (match?.[1] as Region) ?? null;
}

// On the server there is no cookie, so callers fall back to their default.
const noRegion = () => null;

/**
 * The region to assume before the cookie is read: French is read
 * overwhelmingly from Quebec, English from everywhere.
 */
export function defaultRegionForLocale(locale: string): Region {
  return locale === "fr" ? "qc" : "intl";
}

/** Writes the visitor's correction, the same way the proxy would have. */
export function writeRegion(next: Region) {
  document.cookie = `${REGION_COOKIE}=${next}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
  for (const listener of listeners) listener();
}

/**
 * The visitor's curriculum region, or `fallback` until the cookie says
 * otherwise (server render, and visitors who arrived before the cookie
 * existed).
 */
export function useRegion(fallback: Region): Region {
  return useSyncExternalStore(subscribe, readRegion, noRegion) ?? fallback;
}
