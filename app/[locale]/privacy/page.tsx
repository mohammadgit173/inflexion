import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { routing, type Locale } from "@/i18n/routing";
import { GA_ID, SITE_URL } from "@/lib/site";

/** Bumped by hand when the policy text actually changes. */
const LAST_UPDATED = "2026-09-27";

type Params = { params: Promise<{ locale: Locale }> };

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "privacy" });

  const path = locale === routing.defaultLocale ? "/confidentialite" : "/en/privacy";

  return {
    metadataBase: new URL(SITE_URL),
    title: `${t("title")} — Inflexion`,
    description: t("metaDescription"),
    alternates: {
      canonical: path,
      languages: {
        fr: "/confidentialite",
        en: "/en/privacy",
        "x-default": "/en/privacy",
      },
    },
  };
}

export default async function PrivacyPage({ params }: Params) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PrivacyContent locale={locale} />;
}

function PrivacyContent({ locale }: { locale: Locale }) {
  const t = useTranslations("privacy");
  const tFooter = useTranslations("footer");
  const sections = t.raw("sections") as {
    heading: string;
    body: string;
    id?: string;
  }[];

  /*
   * The cookies section describes the site truthfully in both states. Its
   * stored text says only what the site always does; the claim about
   * analytics comes from whichever clause matches the build, so the policy
   * cannot say "no analytics" while analytics are running.
   */
  const cookiesBody = (body: string) =>
    GA_ID ? `${body}${t("analyticsClause")}` : `${t("noAnalyticsClause")}${body}`;

  const formattedDate = new Intl.DateTimeFormat(
    locale === "fr" ? "fr-CA" : "en-CA",
    // The constant is a UTC midnight, so format it in UTC too — otherwise
    // any timezone west of Greenwich renders the previous day.
    { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" },
  ).format(new Date(`${LAST_UPDATED}T00:00:00Z`));

  return (
    <article className="mx-auto w-full max-w-3xl px-5 py-20 sm:px-8 md:py-28">
      <h1 className="text-3xl tracking-[-0.02em] sm:text-4xl">{t("title")}</h1>

      <p className="mono mt-4 text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-faint)]">
        {t("updated", { date: formattedDate })}
      </p>

      <div className="mt-12">
        {sections.map((section, i) => (
          <section key={i} className="mb-10 last:mb-0">
            <h2 className="text-xl tracking-[-0.01em]">{section.heading}</h2>
            <p className="mt-3 text-pretty text-[0.9375rem] leading-relaxed text-[var(--text-muted)]">
              {section.id === "cookies"
                ? cookiesBody(section.body)
                : section.body}
            </p>
          </section>
        ))}
      </div>

      <div className="mt-14 border-t border-[var(--hairline)] pt-6">
        <p className="text-[0.9375rem] text-[var(--text-muted)]">
          <a
            href={`mailto:${tFooter("email")}`}
            className="text-[var(--accent-text)] underline underline-offset-4"
          >
            {tFooter("email")}
          </a>
        </p>
        <p className="mt-4">
          <Link
            href="/"
            className="mono text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-faint)] transition-colors hover:text-[var(--text)]"
          >
            {t("backHome")}
          </Link>
        </p>
      </div>
    </article>
  );
}
