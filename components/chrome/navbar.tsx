"use client";

import { useTranslations } from "next-intl";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";
import { LocaleToggle } from "./locale-toggle";
import { ThemeToggle } from "./theme-toggle";

const SECTIONS = [
  { id: "approach", key: "approach" },
  { id: "subjects", key: "subjects" },
  { id: "process", key: "process" },
  { id: "about", key: "about" },
  { id: "faq", key: "faq" },
] as const;

export function Navbar() {
  const t = useTranslations("nav");
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  // Close the mobile panel on Escape and lock the page behind it.
  useEffect(() => {
    if (!menuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setMenuOpen(false);
    };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:bg-[var(--surface)] focus:px-4 focus:py-2 focus:text-sm"
      >
        {t("skipToContent")}
      </a>

      <header
        className={`sticky top-0 z-40 border-b transition-colors duration-300 ${
          scrolled
            ? "border-[var(--hairline)] bg-[var(--bg)]/90 backdrop-blur-sm"
            : "border-transparent bg-transparent"
        }`}
      >
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-5 sm:px-8">
          <Link
            href="/"
            aria-label={t("home")}
            className="mono text-sm tracking-[0.22em] transition-colors hover:text-[var(--accent-text)]"
          >
            INFLEXION
          </Link>

          <nav className="hidden items-center gap-7 lg:flex" aria-label={t("home")}>
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                className="mono group relative text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
              >
                {t(section.key)}
                <span
                  aria-hidden="true"
                  className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-300 group-hover:scale-x-100"
                />
              </a>
            ))}
            {/* A page of its own, not a section, so it is a Link. */}
            <Link
              href="/events"
              className="mono group relative text-[0.6875rem] uppercase tracking-[0.14em] text-[var(--text-muted)] transition-colors hover:text-[var(--text)]"
            >
              {t("events")}
              <span
                aria-hidden="true"
                className="absolute -bottom-1.5 left-0 h-px w-full origin-left scale-x-0 bg-[var(--accent)] transition-transform duration-300 group-hover:scale-x-100"
              />
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-3 sm:flex">
              <LocaleToggle />
              <span aria-hidden="true" className="h-4 w-px bg-[var(--hairline)]" />
              <ThemeToggle />
            </div>
            <a
              href="#booking"
              className="mono hidden border border-[var(--border-interactive)] px-4 py-2 text-[0.6875rem] uppercase tracking-[0.14em] transition-colors hover:border-[var(--accent)] hover:text-[var(--accent-text)] lg:inline-block"
            >
              {t("cta")}
            </a>

            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              aria-label={menuOpen ? t("closeMenu") : t("openMenu")}
              className="inline-flex h-9 w-9 items-center justify-center text-[var(--text)] lg:hidden"
            >
              <svg
                aria-hidden="true"
                viewBox="0 0 24 24"
                className="h-5 w-5"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.25"
                strokeLinecap="round"
              >
                {menuOpen ? (
                  <path d="M6 6l12 12M18 6L6 18" />
                ) : (
                  <path d="M3 8h18M3 16h18" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </header>

      {menuOpen && (
        <div
          id="mobile-menu"
          className="fixed inset-0 top-16 z-30 bg-[var(--bg)] lg:hidden"
        >
          <nav className="flex flex-col px-5 pt-4 sm:px-8" aria-label={t("home")}>
            {SECTIONS.map((section) => (
              <a
                key={section.id}
                href={`#${section.id}`}
                onClick={() => setMenuOpen(false)}
                className="mono border-b border-[var(--hairline-soft)] py-5 text-sm uppercase tracking-[0.14em] text-[var(--text-muted)]"
              >
                {t(section.key)}
              </a>
            ))}
            <Link
              href="/events"
              onClick={() => setMenuOpen(false)}
              className="mono border-b border-[var(--hairline-soft)] py-5 text-sm uppercase tracking-[0.14em] text-[var(--text-muted)]"
            >
              {t("events")}
            </Link>
            <a
              href="#booking"
              onClick={() => setMenuOpen(false)}
              className="mono mt-8 border border-[var(--border-interactive)] px-4 py-4 text-center text-[0.6875rem] uppercase tracking-[0.14em]"
            >
              {t("cta")}
            </a>
            <div className="mt-8 flex items-center gap-4">
              <LocaleToggle />
              <span aria-hidden="true" className="h-4 w-px bg-[var(--hairline)]" />
              <ThemeToggle />
            </div>
          </nav>
        </div>
      )}
    </>
  );
}
