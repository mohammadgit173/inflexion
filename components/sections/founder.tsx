import Image from "next/image";
import { useTranslations } from "next-intl";
import { Section } from "@/components/primitives/section";
import { ReachLine } from "@/components/sections/reach-line";
import { Reveal } from "@/components/primitives/reveal";
import { YouTubeFacade } from "@/components/ui/youtube-facade";
import { LocalVideo } from "@/components/ui/local-video";

/**
 * 006 — About the founder. A modest round portrait beside the text, so the
 * words carry the section rather than the photo.
 */
export function Founder() {
  const t = useTranslations("about");
  const paragraphs = t.raw("paragraphs") as string[];
  const personalStory = t("personalStory");
  /*
   * Two ways to fill the video slot, both optional:
   *   videoFile — an mp4 in /public, best for short silent clips (the
   *               animated curve): no third party, no player branding.
   *   videoId   — a YouTube id, best for a narrated intro, where YouTube's
   *               hosting and reach are worth the embed.
   * A local file wins if both are set. With neither, nothing renders.
   */
  const videoFile = t("videoFile").trim();
  const videoId = t("videoId").trim();

  return (
    <Section id="about" number={t("sectionNumber")} title={t("title")}>
      <div className="grid grid-cols-1 items-center gap-10 md:grid-cols-[auto_1fr] md:gap-16">
        <Reveal>
          {/* Square box holding a circular portrait: 176px on phones, 208px on
              small tablets, 240px from md. The brackets sit on the square's
              corners, so the circle reads as a figure inside a drawing frame. */}
          <div className="relative mx-auto size-44 sm:size-52 md:mx-0 md:size-60">
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -left-2 -top-2 h-5 w-5 border-l border-t border-[var(--hairline)]"
            />
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -bottom-2 -right-2 h-5 w-5 border-b border-r border-[var(--hairline)]"
            />
            <div className="relative size-full overflow-hidden rounded-full border border-[var(--hairline)]">
              <Image
                src="/founder-portrait-v4.jpg"
                alt={t("photoAlt")}
                fill
                // Displayed at 176-240px, so only the small sizes are needed;
                // Next serves WebP/AVIF at the right one. Untouched original:
                // design/founder-original-v3.png.
                sizes="240px"
                // Already a square crop centred on the face, so no bias needed.
                className="object-cover"
              />
            </div>
          </div>
          <p className="mono mx-auto mt-5 max-w-60 text-center text-[0.6875rem] uppercase leading-relaxed tracking-[0.14em] text-[var(--text-faint)]">
            {t("name")} — {t("credential")}
          </p>
        </Reveal>

        {/* space-y on the container: the old per-paragraph "last:mb-0" hit
            every paragraph (each was the last child of its own wrapper), so
            they ran together with no gap. */}
        <div className="space-y-5 md:space-y-6">
          {paragraphs.map((paragraph, i) => (
            <Reveal key={i} index={i} as="p">
              <span className="block text-pretty text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
                {paragraph}
              </span>
              {/* The reach sentence follows the introduction, and names a
                  city only for the visitors a city means something to. */}
              {i === 0 ? (
                <ReachLine className="mt-5 block text-pretty text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl md:mt-6" />
              ) : null}
            </Reveal>
          ))}

          {/* Rendered only once there is something to show — an empty string
              in the locale file leaves no trace in the markup. */}
          {personalStory ? (
            <Reveal index={paragraphs.length} as="p">
              <span className="block text-pretty text-lg leading-relaxed text-[var(--text-muted)] sm:text-xl">
                {personalStory}
              </span>
            </Reveal>
          ) : null}
        </div>
      </div>

      {videoFile || videoId ? (
        <Reveal>
          <div className="mx-auto mt-12 max-w-3xl md:mt-16">
            {videoFile ? (
              <LocalVideo
                src={videoFile}
                poster={t("videoPoster")}
                title={t("videoTitle")}
              />
            ) : (
              <YouTubeFacade
                videoId={videoId}
                title={t("videoTitle")}
                playLabel={t("videoPlayLabel")}
              />
            )}
          </div>
        </Reveal>
      ) : null}
    </Section>
  );
}
