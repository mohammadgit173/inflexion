import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { LocaleToggle } from "./locale-toggle";
import { ThemeToggle } from "./theme-toggle";

export function Footer() {
  const t = useTranslations("footer");
  const year = new Date().getFullYear();

  return (
    <footer className="border-t border-[var(--hairline)]">
      <div className="mx-auto w-full max-w-6xl px-5 py-12 sm:px-8 md:py-16">
        <div className="flex flex-col gap-10 md:flex-row md:items-start md:justify-between">
          <div>
            <p className="mono text-sm tracking-[0.22em]">{t("wordmark")}</p>
            <p className="mt-3 max-w-xs text-sm text-[var(--text-muted)]">
              {t("tagline")}
            </p>
          </div>

          <nav
            aria-label={t("wordmark")}
            className="flex flex-col gap-3 text-sm"
          >
            <a
              href={`mailto:${t("email")}`}
              className="inline-flex w-fit items-center py-1 text-[var(--text-muted)] transition-colors hover:text-[var(--accent-text)]"
            >
              {t("email")}
            </a>
            <Link
              href="/privacy"
              className="inline-flex w-fit items-center py-1 text-[var(--text-muted)] transition-colors hover:text-[var(--accent-text)]"
            >
              {t("privacy")}
            </Link>
          </nav>

          <div className="flex items-center gap-4">
            <LocaleToggle />
            <span
              aria-hidden="true"
              className="h-4 w-px bg-[var(--hairline)]"
            />
            <ThemeToggle />
          </div>
        </div>

        <div className="mt-12 border-t border-[var(--hairline-soft)] pt-6">
          <p className="mono text-[0.6875rem] tracking-[0.14em] text-[var(--text-faint)]">
            {t("copyright", { year })}
          </p>
        </div>
      </div>
    </footer>
  );
}
