import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/components/primitives/section";
import { Reveal } from "@/components/primitives/reveal";

/** Soft oval fade so the art's rectangular edges never show. */
const EDGE_FADE =
  "radial-gradient(ellipse 70% 70% at 50% 46%, #000 40%, transparent 100%)";

/**
 * How visible the background art is. Kept low because body text sits
 * directly on it: see the contrast note on the layer below.
 */
const ART_OPACITY = 0.35;

/**
 * 002 — The problem. Quiet and centred, no cards. The head artwork sits
 * behind the text as a faded background; each line fades in on its own as
 * the section scrolls into view.
 */
export function Problem() {
  const t = useTranslations("problem");
  const lines = t.raw("lines") as string[];

  return (
    <Section id="problem" number={t("sectionNumber")} title={t("title")}>
      {/* No z-index on this wrapper: a stacking context here would stop the
          art's blend mode from compositing against the page. */}
      <div className="relative mx-auto max-w-5xl">
        {/*
          Background art. The blend drops out the image's own flat field —
          black via screen in dark mode, white via multiply after the light-
          mode invert — so the head floats on the page with the beams behind
          it. Decorative, hence alt="": the quote carries the meaning.
        */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0"
          style={{
            mixBlendMode:
              "var(--hero-blend)" as React.CSSProperties["mixBlendMode"],
            opacity: ART_OPACITY,
            maskImage: EDGE_FADE,
            WebkitMaskImage: EDGE_FADE,
          }}
        >
          <Image
            src="/problem-art.png"
            alt=""
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover"
            style={{ filter: "var(--art-filter)" }}
          />
        </div>

        <div className="relative z-10 mx-auto max-w-3xl pb-4 pt-10 text-center sm:pt-12 md:pb-6 md:pt-16">
          <Reveal>
            <p className="text-pretty text-2xl leading-[1.25] tracking-[-0.015em] sm:text-3xl md:text-4xl">
              {t("quote")}
            </p>
          </Reveal>

          <div className="mt-12 space-y-5 md:mt-16">
            {lines.map((line, i) => (
              <Reveal key={i} index={i + 1} as="p">
                <span className="block text-pretty text-base leading-relaxed text-[var(--text-muted)] sm:text-lg">
                  {line}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </div>
    </Section>
  );
}
