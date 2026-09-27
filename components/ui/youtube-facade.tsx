"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type YouTubeFacadeProps = {
  /** The id from the video's URL, e.g. dQw4w9WgXcQ. */
  videoId: string;
  /** Shown as the frame's accessible title and under the play button. */
  title: string;
  playLabel: string;
  className?: string;
};

/**
 * A YouTube player that costs nothing until it's used.
 *
 * Embedding YouTube directly pulls roughly a megabyte of player code into
 * every page load, whether or not anyone presses play. This shows the video's
 * own thumbnail with a play button and only loads the real player on click,
 * which keeps the page fast for the visitors who never watch.
 *
 * Uses youtube-nocookie.com, so YouTube does not set tracking cookies unless
 * the visitor actually starts the video.
 */
export function YouTubeFacade({
  videoId,
  title,
  playLabel,
  className,
}: YouTubeFacadeProps) {
  const [playing, setPlaying] = useState(false);

  return (
    <div
      className={cn(
        "relative aspect-video w-full overflow-hidden border border-[var(--hairline)] bg-[var(--surface)]",
        className,
      )}
    >
      {playing ? (
        <iframe
          src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="absolute inset-0 h-full w-full"
        />
      ) : (
        <button
          type="button"
          onClick={() => setPlaying(true)}
          aria-label={`${playLabel}: ${title}`}
          className="group absolute inset-0 h-full w-full cursor-pointer"
        >
          <Image
            src={`https://i.ytimg.com/vi/${videoId}/maxresdefault.jpg`}
            alt=""
            fill
            sizes="(min-width: 1024px) 1024px, 100vw"
            className="object-cover transition-opacity duration-300 group-hover:opacity-90"
          />
          {/* Square play mark rather than YouTube's pill, to match the site. */}
          <span
            aria-hidden="true"
            className="absolute inset-0 flex items-center justify-center"
          >
            <span className="flex h-16 w-16 items-center justify-center border border-[var(--border-interactive)] bg-[var(--bg)]/80 transition-colors duration-200 group-hover:border-[var(--accent)]">
              <svg
                viewBox="0 0 24 24"
                className="ml-0.5 h-5 w-5 fill-[var(--text)] transition-colors group-hover:fill-[var(--accent)]"
              >
                <path d="M8 5v14l11-7z" />
              </svg>
            </span>
          </span>
          <span className="label absolute bottom-0 left-0 right-0 bg-[var(--bg)]/85 px-4 py-3 text-left !text-[var(--text-muted)]">
            {title}
          </span>
        </button>
      )}
    </div>
  );
}
