import type { Metadata } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans } from "next/font/google";
import { NextIntlClientProvider, hasLocale } from "next-intl";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { Providers } from "@/components/providers";
import { Navbar } from "@/components/chrome/navbar";
import { Footer } from "@/components/chrome/footer";
import { BeamsBackground } from "@/components/ui/beams-background";
import { Analytics } from "@/components/analytics";
import { IS_PUBLIC_SITE, SITE_URL } from "@/lib/site";
import "../globals.css";

// next/font downloads these at build time and serves them from our own origin —
// no runtime request to Google, and size-adjust metrics prevent layout shift.
// IBM Plex: a sans and a mono designed as one family for engineering
// documentation, so headlines, body and labels share a single voice. Warmer
// than Inter, with well-drawn French accents. Not a variable font, so only the
// two weights the site uses are loaded (400 regular, 500 medium); the "latin"
// subset already covers é, è, ç, à, ô, etc.
const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
  display: "swap",
  // Measured both ways (with the previous mono): dropping the preload gave no
  // LCP improvement and pushed CLS from 0 to 0.012 as mono labels swapped in.
  // Preloading stays.
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "meta" });

  const path = locale === routing.defaultLocale ? "/" : `/${locale}`;

  return {
    metadataBase: new URL(SITE_URL),
    title: t("title"),
    description: t("description"),
    keywords: t("keywords"),
    alternates: {
      canonical: path,
      languages: {
        fr: "/",
        en: "/en",
        "x-default": "/en",
      },
    },
    openGraph: {
      type: "website",
      siteName: "Inflexion",
      locale: locale === "fr" ? "fr_CA" : "en_CA",
      alternateLocale: locale === "fr" ? "en_CA" : "fr_CA",
      title: t("title"),
      description: t("description"),
      url: path,
      // og:image is supplied by app/[locale]/opengraph-image.tsx — the
      // file-based convention takes precedence over anything set here.
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    // noindex until the real domain is configured — see IS_PUBLIC_SITE.
    robots: { index: IS_PUBLIC_SITE, follow: IS_PUBLIC_SITE },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) notFound();

  setRequestLocale(locale);

  const t = await getTranslations({ locale, namespace: "meta" });
  const tFooter = await getTranslations({ locale, namespace: "footer" });
  const tSubjects = await getTranslations({ locale, namespace: "subjects" });
  const tAbout = await getTranslations({ locale, namespace: "about" });

  /*
   * Structured data. Deliberately limited to facts the page itself states —
   * no ratings and no review counts, since there are no reviews to count.
   *
   * areaServed says the sessions are online and based in Montréal, which is
   * what tells a search engine to consider us for "math tutor Montreal"
   * without claiming a storefront we don't have. knowsAbout mirrors the
   * subjects section exactly: it is how a crawler connects the site to a
   * search for "differential calculus help" rather than just "tutoring".
   */
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "EducationalOrganization",
    name: "Inflexion",
    url: locale === routing.defaultLocale ? SITE_URL : `${SITE_URL}/${locale}`,
    description: t("description"),
    email: tFooter("email"),
    inLanguage: ["fr-CA", "en-CA"],
    knowsLanguage: ["fr-CA", "en-CA"],
    // The French page is the one Quebec visitors get, so it is the one that
    // claims the city. The English page is served everywhere else and stays
    // continental.
    areaServed:
      locale === "fr"
        ? [
            { "@type": "City", name: "Montréal" },
            { "@type": "Country", name: "Canada" },
          ]
        : [
            { "@type": "Country", name: "Canada" },
            { "@type": "Country", name: "United States" },
          ],
    // Sessions happen over video, so there is no physical place to visit.
    availableChannel: {
      "@type": "ServiceChannel",
      serviceLocation: { "@type": "VirtualLocation", name: "Online" },
      availableLanguage: ["fr-CA", "en-CA"],
    },
    // Every subject from both curricula, deduplicated: the page shows one
    // region at a time, but it teaches all of it.
    knowsAbout: [
      ...new Set(
        (tSubjects.raw("regions") as { tabs: { items: string[] }[] }[]).flatMap(
          (region) => region.tabs.flatMap((tab) => tab.items),
        ),
      ),
    ],
    founder: {
      "@type": "Person",
      name: "Mono Awad",
      jobTitle: tAbout("credential"),
    },
    /*
     * The published starting rate, as a minimum rather than a fixed price —
     * the FAQ says "starting at", and structured data must not claim more
     * precision than the page shows. Stated in CAD because that is the
     * currency the number on the page is quoted in.
     */
    makesOffer: {
      "@type": "Offer",
      itemOffered: {
        "@type": "Service",
        name: t("title"),
        serviceType: locale === "fr" ? "Tutorat de mathématiques" : "Math tutoring",
      },
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        minPrice: 40,
        priceCurrency: "CAD",
        unitCode: "HUR",
      },
    },
  };

  return (
    <html
      lang={locale}
      // next-themes writes data-theme on this element before paint.
      suppressHydrationWarning
      className={`${plexSans.variable} ${plexMono.variable} antialiased`}
    >
      <head>
        {/*
          The hero scene pulls its SDK from jsdelivr, which then fetches assets
          from two further origins. Lighthouse measured ~340ms of connection
          setup per host; warming them costs nothing on pages that use them.
        */}
        <link rel="preconnect" href="https://cdn.jsdelivr.net" crossOrigin="" />
        <link
          rel="preconnect"
          href="https://assets.unicorn.studio"
          crossOrigin=""
        />
        <link
          rel="preconnect"
          href="https://storage.googleapis.com"
          crossOrigin=""
        />
      </head>
      <body className="flex min-h-screen flex-col">
        <script
          type="application/ld+json"
          // Values come from our own locale files, not user input.
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        <Analytics />
        <Providers>
          {/*
            Site-wide animated background. Fixed to the viewport behind all
            content (negative z-index still paints above the page's root
            background), so it is one screen-sized canvas no matter how long
            the page is, and sections scroll over it.
          */}
          {/*
            "subtle": behind every section, the beams sit directly under body
            text with no scrim. At full strength, small grey labels dropped
            below AA contrast where beams overlap.
          */}
          <BeamsBackground
            intensity="subtle"
            className="pointer-events-none fixed inset-0 -z-10 h-dvh"
          />
          <NextIntlClientProvider>
            <Navbar />
            <main id="main" className="flex-1">
              {children}
            </main>
            <Footer />
          </NextIntlClientProvider>
        </Providers>
      </body>
    </html>
  );
}
