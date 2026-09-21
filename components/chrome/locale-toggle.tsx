"use client";

import Link from "next/link";
import { useLocale, useTranslations } from "next-intl";
import { usePathname, getPathname } from "@/i18n/navigation";
import {
  LOCALE_PREF_COOKIE,
  LOCALE_PREF_MAX_AGE,
  locales,
  type Locale,
} from "@/i18n/routing";

/**
 * Saves the choice before the navigation starts. proxy.ts sends visitors on
 * the bare URLs to their saved language, so without this, clicking FR from
 * /en would land on "/" and bounce straight back to English.
 */
function savePreference(locale: Locale) {
  document.cookie = `${LOCALE_PREF_COOKIE}=${locale}; path=/; max-age=${LOCALE_PREF_MAX_AGE}; samesite=lax`;
}

export function LocaleToggle() {
  const t = useTranslations("toggles");
  const active = useLocale();
  const pathname = usePathname();

  return (
    <div
      className="mono flex items-center text-[0.6875rem] tracking-[0.14em]"
      role="group"
      aria-label={t("language")}
    >
      {locales.map((locale, i) => {
        const isActive = locale === active;
        // next-intl's own <Link locale=...> always emits the locale prefix,
        // so the French entry would point at "/fr" and eat a 307 back to "/".
        // getPathname applies the as-needed rule and also resolves the
        // per-locale pathname map (/confidentialite vs /privacy).
        const href = getPathname({
          href: pathname as Parameters<typeof getPathname>[0]["href"],
          locale: locale as Locale,
        });

        return (
          <span key={locale} className="flex items-center">
            {i > 0 && (
              <span aria-hidden="true" className="px-1 text-[var(--text-faint)]">
                /
              </span>
            )}
            <Link
              href={href}
              hrefLang={locale}
              onClick={() => savePreference(locale as Locale)}
              aria-current={isActive ? "true" : undefined}
              // px/py bring the hit area to the 24px minimum tap target;
              // the label itself is only 11px tall.
              className={`inline-flex items-center px-1.5 py-2 ${
                isActive
                  ? "text-[var(--text)] underline decoration-[var(--accent)] decoration-1 underline-offset-4"
                  : "text-[var(--text-faint)] transition-colors hover:text-[var(--text)]"
              }`}
            >
              {locale.toUpperCase()}
            </Link>
          </span>
        );
      })}
    </div>
  );
}
