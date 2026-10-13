import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { SITE_URL } from "@/lib/site";
import { BookingTracked } from "./booking-tracked";

type Params = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "booked" });

  return {
    metadataBase: new URL(SITE_URL),
    title: `${t("title")} — Inflexion`,
    description: t("metaDescription"),
    // Served from one unprefixed URL for every language (see proxy.ts), so
    // that is the address analytics and Calendly are given.
    alternates: { canonical: "/booked" },
    // A confirmation page has nothing to offer a searcher, and indexing it
    // would put a "thanks for booking" page in results for the brand name.
    robots: { index: false, follow: false },
  };
}

export default async function BookedPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <Confirmation />;
}

function Confirmation() {
  const t = useTranslations("booked");
  const steps = t.raw("steps") as string[];

  return (
    <article className="mx-auto w-full max-w-2xl px-5 py-24 sm:px-8 md:py-32">
      {/* Fires the conversion once this page is actually reached. */}
      <BookingTracked />

      <p className="mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--accent-text)]">
        {t("eyebrow")}
      </p>

      <h1 className="mt-5 text-3xl tracking-[-0.02em] sm:text-4xl">
        {t("title")}
      </h1>

      <p className="mt-6 text-pretty text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
        {t("lead")}
      </p>

      <ol className="mt-12">
        {steps.map((step, i) => (
          <li
            key={i}
            className="flex gap-5 border-b border-[var(--hairline-soft)] py-5 first:border-t"
          >
            <span
              aria-hidden="true"
              className="mono pt-1 text-xs text-[var(--text-faint)]"
            >
              {String(i + 1).padStart(2, "0")}
            </span>
            <span className="text-pretty leading-relaxed text-[var(--text-muted)]">
              {step}
            </span>
          </li>
        ))}
      </ol>

      <div className="mt-14 border-t border-[var(--hairline)] pt-6">
        <Link
          href={routing.pathnames["/"] as "/"}
          className="mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-faint)] transition-colors hover:text-[var(--text)]"
        >
          {t("backHome")}
        </Link>
      </div>
    </article>
  );
}
