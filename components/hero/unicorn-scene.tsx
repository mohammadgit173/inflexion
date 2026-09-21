"use client";

import Image from "next/image";
import { useEffect, useId, useRef, useState } from "react";
import { useReducedMotion } from "motion/react";
import { useTranslations } from "next-intl";

const SCRIPT_SRC =
  "https://cdn.jsdelivr.net/gh/hiunicornstudio/unicornstudio.js@v1.4.33/dist/unicornStudio.umd.js";
const SCRIPT_ID = "unicorn-studio-sdk";
const PROJECT_ID = "whwOGlfJ5Rz2rHaEUgHl";

type UnicornScene = { destroy?: () => void };
type UnicornStudioSDK = {
  init?: () => void;
  addScene?: (opts: Record<string, unknown>) => Promise<UnicornScene>;
};

declare global {
  interface Window {
    UnicornStudio?: UnicornStudioSDK;
  }
}

/** One <script> tag for the whole app, however many times this mounts. */
let scriptPromise: Promise<void> | null = null;

function loadUnicornScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.UnicornStudio) return Promise.resolve();
  if (scriptPromise) return scriptPromise;

  scriptPromise = new Promise<void>((resolve, reject) => {
    const existing = document.getElementById(
      SCRIPT_ID,
    ) as HTMLScriptElement | null;

    if (existing) {
      existing.addEventListener("load", () => resolve(), { once: true });
      existing.addEventListener(
        "error",
        () => reject(new Error("unicorn sdk failed")),
        { once: true },
      );
      return;
    }

    const script = document.createElement("script");
    script.id = SCRIPT_ID;
    script.src = SCRIPT_SRC;
    script.async = true;
    script.onload = () => resolve();
    script.onerror = () => {
      // Allow a later mount to retry rather than caching the failure forever.
      scriptPromise = null;
      reject(new Error("unicorn sdk failed"));
    };
    document.head.appendChild(script);
  });

  return scriptPromise;
}

/**
 * Without a WebGL context the vendor SDK throws while building its renderer
 * and leaves an empty box — a real case (hardware acceleration off, older
 * devices, some headless browsers), not a hypothetical.
 */
function hasWebGL(): boolean {
  try {
    const canvas = document.createElement("canvas");
    return Boolean(
      canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"),
    );
  } catch {
    return false;
  }
}

/**
 * Opt-out switch for the animated scene on phones and tablets.
 *
 * Default is ON, matching the brief ("the scene must be VISIBLE on phones").
 * Set NEXT_PUBLIC_HERO_SCENE_MOBILE=false to serve the static poster below
 * 1024px instead — the WebGL scene is what holds mobile Lighthouse
 * performance down, and this is the lever that trades one for the other.
 */
const SCENE_ON_MOBILE = process.env.NEXT_PUBLIC_HERO_SCENE_MOBILE !== "false";

/**
 * Skip the scene on devices that would struggle with it, or where the user
 * has asked for less data. The poster stays in its place, so nothing breaks —
 * these visitors simply get the static hero.
 */
function sceneWorthRunning(): boolean {
  if (!SCENE_ON_MOBILE && window.matchMedia("(max-width: 1023px)").matches) {
    return false;
  }
  const nav = navigator as Navigator & {
    connection?: { saveData?: boolean };
    deviceMemory?: number;
  };
  if (nav.connection?.saveData) return false;
  if (typeof nav.deviceMemory === "number" && nav.deviceMemory <= 2) return false;
  if (
    typeof nav.hardwareConcurrency === "number" &&
    nav.hardwareConcurrency <= 2
  ) {
    return false;
  }
  return true;
}

/**
 * Render resolution. The vendor default of 1.5 makes a ~2100px-wide canvas on
 * a phone; capping at 1 there cuts the per-frame shader cost substantially
 * with no visible difference at that size.
 */
function sceneDpi(): number {
  const small = window.matchMedia("(max-width: 1023px)").matches;
  return Math.min(window.devicePixelRatio || 1, small ? 1 : 1.5);
}

/** Run after the browser is idle, so scene setup never competes with paint. */
function whenIdle(cb: () => void): () => void {
  if (typeof window.requestIdleCallback === "function") {
    const id = window.requestIdleCallback(cb, { timeout: 2500 });
    return () => window.cancelIdleCallback(id);
  }
  const id = window.setTimeout(cb, 400);
  return () => window.clearTimeout(id);
}

export function UnicornScene({ className = "" }: { className?: string }) {
  const t = useTranslations("hero");
  const reduceMotion = useReducedMotion();
  const [live, setLive] = useState(false);
  const hostRef = useRef<HTMLDivElement>(null);
  // useId gives a stable id across server and client render.
  const rawId = useId();
  const elementId = `unicorn-${rawId.replace(/[^a-zA-Z0-9]/g, "")}`;

  useEffect(() => {
    if (reduceMotion) return;

    let cancelled = false;
    let scene: UnicornScene | undefined;

    /*
     * Deferred to idle deliberately. Initialising the scene eagerly put ~2.9s
     * of shader/texture work on the main thread before first paint and pushed
     * LCP past 6s. The poster below is already on screen by then, so nothing
     * is missing while this waits.
     */
    const cancelIdle = whenIdle(() => {
      if (cancelled) return;

      Promise.resolve()
        .then(() => {
          if (!hasWebGL()) throw new Error("no webgl");
          if (!sceneWorthRunning()) throw new Error("device opted out");
          return loadUnicornScript();
        })
        .then(() => {
          if (cancelled) return;
          const sdk = window.UnicornStudio;
          if (!sdk) throw new Error("sdk missing");

          if (typeof sdk.addScene === "function") {
            return sdk
              .addScene({
                elementId,
                projectId: PROJECT_ID,
                scale: 1,
                dpi: sceneDpi(),
                lazyLoad: false,
              })
              .then((s) => {
                if (cancelled) {
                  s?.destroy?.();
                  return;
                }
                scene = s;
                setLive(true);
              });
          }

          sdk.init?.();
          setLive(true);
        })
        .catch(() => {
          // Blocked CDN, no WebGL, or a vendor error — the poster stays put.
        });
    });

    return () => {
      cancelled = true;
      cancelIdle();
      scene?.destroy?.();
    };
  }, [reduceMotion, elementId]);

  return (
    <div
      className={`relative h-full w-full overflow-hidden ${className}`}
      // Drops the scene's own flat field (black in dark, white after the
      // invert in light) so only the line work sits on --bg. Without this the
      // hero reads as a panel edge against the warm off-white page.
      style={{ mixBlendMode: "var(--hero-blend)" as React.CSSProperties["mixBlendMode"] }}
    >
      {/*
        Stage: poster and live scene share one box so they always line up.
        Below lg it is wider than the screen and shifted so the figure lands
        centred and larger; from lg it simply fills the hero. See .scene-stage
        in globals.css for the geometry.
      */}
      <div className="scene-stage absolute">
      {/*
        Poster frame. Rendered server-side and marked priority so it is in the
        initial HTML and requested immediately — when it was gated behind a
        client-side state flip, its LCP load delay was 5.1s. next/image serves
        it at roughly 13KB. It also IS the permanent content under
        prefers-reduced-motion and whenever the scene cannot run.
      */}
      <div
        className={`absolute inset-0 transition-opacity duration-700 ${
          live ? "opacity-0" : "opacity-100"
        }`}
      >
        <Image
          src="/hero-fallback.png"
          alt={t("fallbackAlt")}
          fill
          priority
          sizes="100vw"
          // The stage has the capture's exact aspect ratio, so this is an
          // uncropped fit; the stage itself does the centring on mobile.
          className="object-cover"
          style={{ filter: "var(--hero-filter)" }}
        />
      </div>

      {/*
        The scene element is rendered taller than its container (.scene-host),
        so content anchored to the canvas bottom falls past the visible area.
        Done this way rather than painting a panel over it: the scene's own
        background is pure black, which matches --bg in neither theme, so an
        overlay would show as a faint rectangle.
      */}
      {!reduceMotion && (
        <div
          ref={hostRef}
          id={elementId}
          data-us-project={PROJECT_ID}
          aria-hidden="true"
          // Height comes from .scene-host (globals.css): a fixed extra strip on
          // desktop, a proportional one below lg. Either way the badge drawn at
          // the canvas bottom ends up outside the visible area.
          className="scene-host absolute inset-x-0 top-0"
          style={{ filter: "var(--hero-filter)" }}
        />
      )}
      </div>
    </div>
  );
}
