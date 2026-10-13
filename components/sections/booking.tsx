"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
// The plain router, not the locale-aware one: the confirmation page is a
// single unprefixed URL in every language.
import { useRouter } from "next/navigation";
import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { Section } from "@/components/primitives/section";
import { Reveal } from "@/components/primitives/reveal";
import { BOOKING_URL } from "@/lib/site";

const noopSubscribe = () => () => {};

/**
 * Applies theme parameters to the booking URL. Cal.com and Calendly each take
 * their own, so the provider is detected from the host rather than assumed.
 */
function themedBookingUrl(
  raw: string,
  theme: "light" | "dark",
  embedDomain: string,
): string {
  try {
    const url = new URL(raw);
    const host = url.hostname;

    if (host.includes("cal.com")) {
      url.searchParams.set("embed", "true");
      url.searchParams.set("theme", theme);
      url.searchParams.set("layout", "month_view");
    } else if (host.includes("calendly.com")) {
      // Calendly expects hex without the leading '#'.
      url.searchParams.set(
        "background_color",
        theme === "dark" ? "121214" : "ffffff",
      );
      url.searchParams.set("text_color", theme === "dark" ? "ffffff" : "0a0a0b");
      url.searchParams.set(
        "primary_color",
        theme === "dark" ? "5ba7e8" : "4a90d9",
      );
      // Calendly's own cookie notice is deliberately left visible. Hiding it
      // tidies the frame, but it is the consent notice for a third party
      // setting its own cookies inside our page, and the privacy policy tells
      // visitors it appears.
      // Marks this as an inline embed. Without these two, Calendly never
      // posts its content height to the parent page, so the frame can't be
      // sized to fit and ends up scrolling inside the page.
      url.searchParams.set("embed_type", "Inline");
      url.searchParams.set("embed_domain", embedDomain);
    }

    return url.toString();
  } catch {
    // Not a parseable absolute URL — hand it back untouched.
    return raw;
  }
}

export function Booking() {
  const t = useTranslations("booking");
  const { resolvedTheme } = useTheme();
  const router = useRouter();

  const mounted = useSyncExternalStore(
    noopSubscribe,
    () => true,
    () => false,
  );
  const theme = resolvedTheme === "light" ? "light" : "dark";

  // Height reported by the embed itself. Calendly's month view is taller
  // than any fixed box on a phone, so a fixed height meant a scrollbar
  // inside the page's own scroll.
  const [embedHeight, setEmbedHeight] = useState<number | null>(null);

  useEffect(() => {
    function onMessage(e: MessageEvent) {
      if (e.origin !== "https://calendly.com") return;
      const data = e.data as { event?: string; payload?: { height?: string } };

      if (data?.event === "calendly.page_height") {
        const px = Number.parseInt(data.payload?.height ?? "", 10);
        if (Number.isFinite(px) && px > 0) setEmbedHeight(px);
        return;
      }

      /*
       * A completed booking. Calendly's own redirect-after-booking is a paid
       * feature, but the embed posts this event on every plan — so the
       * confirmation page works regardless, and a booking becomes a page view
       * at a URL analytics can count instead of an invisible event inside a
       * third-party iframe.
       */
      if (data?.event === "calendly.event_scheduled") {
        // The conversion is reported by the confirmation page itself, not
        // here: that page is also where Calendly's own redirect and the
        // confirmation email land, so counting in one place keeps a single
        // booking from being counted twice.
        router.push("/booked");
      }
    }
    window.addEventListener("message", onMessage);
    return () => window.removeEventListener("message", onMessage);
  }, [router]);

  return (
    <Section
      id="booking"
      number={t("sectionNumber")}
      title={t("title")}
      titleVariant="display"
    >
      <div className="max-w-3xl">
        <Reveal>
          <p className="label">{t("note")}</p>
        </Reveal>

        <Reveal index={1}>
          <div className="mt-10 border border-[var(--hairline)]">
            {mounted ? (
              <iframe
                // Re-keyed on theme so the provider re-renders in the new
                // palette when the toggle is used.
                key={theme}
                src={themedBookingUrl(BOOKING_URL, theme, window.location.hostname)}
                title={t("embedTitle")}
                loading="lazy"
                className="block h-[640px] w-full sm:h-[700px]"
                // The fixed heights above are only the pre-measurement size.
                style={embedHeight ? { height: embedHeight } : undefined}
              />
            ) : (
              // Same box before hydration, so the embed does not shift layout.
              <div aria-hidden="true" className="h-[640px] w-full sm:h-[700px]" />
            )}
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
