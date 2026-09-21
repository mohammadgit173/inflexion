import { useTranslations } from "next-intl";
import { BracketLink } from "@/components/primitives/bracket-button";
import { CssReveal, CssRule } from "@/components/primitives/css-reveal";
import { UnicornScene } from "./unicorn-scene";

/** 1px corner brackets at the four corners of a frame. */
function CornerBrackets({ className = "" }: { className?: string }) {
  const c =
    "pointer-events-none absolute h-5 w-5 border-[var(--hairline)] sm:h-7 sm:w-7";
  return (
    // pointer-events-none on the wrapper, not just the brackets: this box
    // spans the whole hero at z-20, so without it every click on the CTAs
    // landed on an invisible layer and did nothing.
    <div
      aria-hidden="true"
      className={`pointer-events-none absolute z-20 ${className}`}
    >
      <span className={`${c} left-0 top-0 border-l border-t`} />
      <span className={`${c} right-0 top-0 border-r border-t`} />
      <span className={`${c} bottom-0 left-0 border-b border-l`} />
      <span className={`${c} bottom-0 right-0 border-b border-r`} />
    </div>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const headline = t("headline");
  const accent = t("headlineAccent");

  // Emphasise a single word of the headline in the accent colour.
  const parts = headline.split(accent);
  const hasAccent = parts.length === 2;

  return (
    <section
      aria-labelledby="hero-heading"
      className="relative flex min-h-[calc(100svh-4rem)] flex-col overflow-hidden"
    >
      {/* Desktop: the frame wraps the whole hero, which fits on one screen. */}
      <CornerBrackets className="inset-6 hidden lg:block" />

      {/*
        Mobile: the scene occupies the upper portion in normal flow, with the
        copy below it. Desktop: it becomes a full-bleed background layer and
        the copy sits on top of it.
      */}
      {/*
        No z-index here on purpose: any stacking context would make the
        scene's mix-blend-mode composite against a transparent backdrop
        instead of the page, and the blend would do nothing. Positioned
        without z-index, it still sits under the z-10 content in DOM order.
      */}
      <div className="relative h-[240px] w-full shrink-0 sm:h-[300px] lg:absolute lg:inset-0 lg:h-full">
        <UnicornScene />
        {/* Phones/tablets: the hero is taller than the screen, so a frame
            around all of it only ever showed its top two corners. Here the
            frame wraps just the scene, and all four corners are visible. */}
        <CornerBrackets className="inset-3 sm:inset-4 lg:hidden" />
      </div>

      <div className="relative z-10 flex flex-1 items-center">
        <div className="mx-auto w-full max-w-6xl px-5 py-8 sm:px-8 sm:py-10 lg:py-0">
          {/*
            Everything here is CSS-animated rather than motion-driven. This is
            the LCP region: a JS reveal waits for hydration and pushed LCP to
            5.4s, while a stylesheet animation starts with the first paint.
          */}
          <div className="hero-scrim max-w-3xl">
            {/*
              Brand wordmark as the hero's display title. Sized with clamp so
              the nine mono characters always fit on one line: ~45px at 375px
              wide, capped at 112px on desktop. The <h1> stays the headline
              sentence below, which carries the search terms.
            */}
            <CssReveal>
              <p className="mono whitespace-nowrap text-[clamp(2.75rem,12vw,7rem)] font-medium leading-[0.9] tracking-[0.04em]">
                {t("wordmark")}
              </p>
            </CssReveal>

            <CssReveal index={1} className="mt-6 flex items-center gap-4 sm:mt-8">
              <span className="mono text-xs text-[var(--text-faint)]">
                {t("sectionNumber")}
              </span>
              <CssRule className="max-w-24" index={2} />
            </CssReveal>

            <CssReveal index={2}>
              <h1
                id="hero-heading"
                className="mt-5 text-balance text-[1.75rem] sm:mt-6 leading-[1.1] tracking-[-0.02em] sm:text-4xl lg:text-5xl xl:text-6xl"
              >
                {hasAccent ? (
                  <>
                    {parts[0]}
                    <span className="text-[var(--accent)]">{accent}</span>
                    {parts[1]}
                  </>
                ) : (
                  headline
                )}
              </h1>
            </CssReveal>

            <CssReveal index={3}>
              <p className="mt-4 max-w-xl text-pretty sm:mt-6 text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
                {t("sub")}
              </p>
            </CssReveal>

            <CssReveal
              index={4}
              className="mt-7 flex flex-col gap-3 sm:mt-9 sm:flex-row sm:flex-wrap"
            >
              <BracketLink href="#booking" variant="solid">
                {t("ctaPrimary")}
              </BracketLink>
              <BracketLink href="#approach" variant="outline">
                {t("ctaSecondary")}
              </BracketLink>
            </CssReveal>

            {/*
              Social proof, placed directly under the booking button where the
              decision to click is made. The figure is the owner's own count;
              it lives in the locale files (hero.statValue / hero.statLabel).
            */}
            <CssReveal index={5}>
              <p className="mt-5 flex items-baseline gap-3 sm:mt-7">
                <span className="mono text-2xl font-medium tracking-[-0.01em] text-[var(--text)] sm:text-3xl">
                  {t("statValue")}
                </span>
                <span className="label !text-[var(--text-muted)]">
                  {t("statLabel")}
                </span>
              </p>
            </CssReveal>
          </div>
        </div>
      </div>

      {/*
        Bottom framing bar. The right cell is padded on desktop so it never
        collides with the vendor scene's own corner content.
      */}
      <div className="relative z-10 border-t border-[var(--hairline)]">
        <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-5 py-3 sm:px-8">
          <span className="label">{t("labels.left")}</span>
          <span className="label hidden sm:inline">{t("labels.center")}</span>
          <span className="label pr-0 lg:pr-44">{t("labels.right")}</span>
        </div>
      </div>
    </section>
  );
}
