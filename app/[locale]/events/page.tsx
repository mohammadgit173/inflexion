import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { routing, type Locale } from "@/i18n/routing";
import { IS_PUBLIC_SITE, SITE_URL } from "@/lib/site";
import { upcomingEvents } from "@/lib/events";
import { EventEntry } from "@/components/events/event-entry";

type Params = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "events" });
  const path = locale === routing.defaultLocale ? "/evenements" : "/en/events";

  return {
    metadataBase: new URL(SITE_URL),
    title: t("metaTitle"),
    description: t("metaDescription"),
    alternates: {
      canonical: path,
      languages: {
        fr: "/evenements",
        en: "/en/events",
        "x-default": "/en/events",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Inflexion",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: locale === "fr" ? "en_CA" : "fr_CA",
      title: t("metaTitle"),
      description: t("metaDescription"),
      url: path,
    },
    robots: { index: IS_PUBLIC_SITE, follow: IS_PUBLIC_SITE },
  };
}

export default async function EventsPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);

  /*
   * Event structured data, one per session. This is what can put the date,
   * the price and "online" directly into a search result — the main reason
   * these live on our own page rather than only on a ticketing platform.
   */
  const events = upcomingEvents();
  const path = locale === routing.defaultLocale ? "/evenements" : "/en/events";
  const eventLd = events.map((event) => ({
    "@context": "https://schema.org",
    "@type": "EducationEvent",
    name: event.title[locale],
    description: event.tagline[locale],
    startDate: event.startsAt,
    endDate: new Date(
      new Date(event.startsAt).getTime() +
        (event.durationMaxMinutes ?? event.durationMinutes) * 60_000,
    ).toISOString(),
    eventAttendanceMode: "https://schema.org/OnlineEventAttendanceMode",
    eventStatus: "https://schema.org/EventScheduled",
    inLanguage: ["fr-CA", "en-CA"],
    location: {
      "@type": "VirtualLocation",
      url: `${SITE_URL}${path}`,
    },
    organizer: {
      "@type": "EducationalOrganization",
      name: "Inflexion",
      url: SITE_URL,
    },
    // Free and open. isAccessibleForFree plus a zero-price Offer is how
    // Google is told there is nothing to buy — omitting offers entirely
    // makes the event ineligible for rich results.
    isAccessibleForFree: true,
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "CAD",
      availability: "https://schema.org/InStock",
      url: event.joinUrl ?? `${SITE_URL}${path}`,
      validFrom: new Date().toISOString(),
    },
  }));

  return (
    <>
      {eventLd.map((ld, i) => (
        <script
          key={i}
          type="application/ld+json"
          // Values come from our own event config, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }}
        />
      ))}
      <EventsContent locale={locale} />
    </>
  );
}

function EventsContent({ locale }: { locale: Locale }) {
  const t = useTranslations("events");
  const events = upcomingEvents();

  return (
    <div className="mx-auto w-full max-w-5xl px-5 py-24 sm:px-8 md:py-32">
      <header className="max-w-2xl">
        <p className="mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
          {t("eyebrow")}
        </p>
        <h1 className="mt-5 text-balance text-4xl tracking-[-0.03em] sm:text-5xl md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-6 text-pretty text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
          {t("intro")}
        </p>
      </header>

      <div className="mt-16 space-y-10">
        {events.length === 0 ? (
          <p className="text-[0.9375rem] text-[var(--text-muted)]">
            {t("empty")}
          </p>
        ) : (
          events.map((event) => (
            <EventEntry key={event.slug} event={event} locale={locale} />
          ))
        )}
      </div>

    </div>
  );
}
