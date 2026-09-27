import { cn } from "@/lib/utils";

type LocalVideoProps = {
  /** Path under /public, e.g. /inflexion-curve.mp4 */
  src: string;
  /** Still frame shown before playback, also under /public. */
  poster?: string;
  /** Shown under the frame and used as the accessible label. */
  title: string;
  className?: string;
};

/**
 * A video served from our own domain, for short silent clips like the
 * animated curve.
 *
 * No third party and no player branding, which suits a wordless brand
 * animation better than an embed would. preload="none" means the file is
 * only fetched when someone presses play, so it costs nothing for visitors
 * who scroll past — and nothing autoplays, which respects anyone who would
 * rather things held still.
 */
export function LocalVideo({ src, poster, title, className }: LocalVideoProps) {
  return (
    <figure className={cn("w-full", className)}>
      <video
        controls
        playsInline
        preload="none"
        poster={poster}
        aria-label={title}
        className="aspect-video w-full border border-[var(--hairline)] bg-[var(--surface)]"
      >
        <source src={src} type="video/mp4" />
      </video>
      <figcaption className="label mt-3 !text-[var(--text-faint)]">
        {title}
      </figcaption>
    </figure>
  );
}
