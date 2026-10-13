"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";
import { GA_ID } from "@/lib/site";

declare global {
  interface Window {
    dataLayer?: unknown[];
    gtag?: (...args: unknown[]) => void;
  }
}

/**
 * Google Analytics 4, loaded only when a measurement ID is configured.
 *
 * Without NEXT_PUBLIC_GA_ID nothing renders: no script, no request to Google,
 * no cookies. That is what lets the privacy policy describe the site's actual
 * behaviour in both states instead of guessing.
 *
 * Page views are sent manually rather than by the default snippet, because
 * this is a single-page-ish app with client-side navigation — the automatic
 * page_view only fires on the first load, so the confirmation page would
 * never be counted.
 */
export function Analytics() {
  const pathname = usePathname();
  const lastSent = useRef<string | null>(null);

  useEffect(() => {
    if (!GA_ID || !window.gtag) return;
    // React runs effects twice in development; without this the first page
    // view is double-counted.
    if (lastSent.current === pathname) return;
    lastSent.current = pathname;
    window.gtag("event", "page_view", { page_path: pathname });
  }, [pathname]);

  if (!GA_ID) return null;

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="ga-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          window.gtag = gtag;
          gtag('js', new Date());
          // Page views are sent from the effect above instead, so navigation
          // between pages is counted too.
          gtag('config', '${GA_ID}', { send_page_view: false });
        `}
      </Script>
    </>
  );
}

/** Reports a completed booking. Safe to call when analytics are disabled. */
export function trackBooking(source: string) {
  if (!GA_ID || typeof window === "undefined" || !window.gtag) return;
  // generate_lead is one of GA4's recommended events, so it can be marked as
  // a conversion in the GA interface without custom configuration.
  window.gtag("event", "generate_lead", {
    event_category: "booking",
    event_label: source,
    value: 1,
  });
}
