"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { useReducedMotion } from "motion/react";
import { useTheme } from "next-themes";
import { cn } from "@/lib/utils";

/**
 * Animated blurred light beams, drawn on a canvas that fills its container.
 *
 * Adapted from the 21st.dev "Beams Background" component. Changes from the
 * original, all needed to use it as a section background on this site:
 *
 * - Renders `children` (the original declared the prop but ignored it and
 *   always showed its own demo headline).
 * - Sizes to its container via ResizeObserver, not to the browser window.
 * - Draws in CSS pixels throughout. The original seeded beams in device-pixel
 *   coordinates but drew them in CSS pixels, so on high-DPI screens most beams
 *   started off-canvas.
 * - One CSS blur instead of a per-beam ctx.filter blur every frame (a
 *   CPU-bound software blur) plus a CSS blur on top.
 * - The backdrop-filter overlay is gone: its opacity peaked at ~15% of 5%
 *   black, so it was invisible, and it was the costliest part.
 * - Pauses off-screen and in hidden tabs; draws a single still frame under
 *   prefers-reduced-motion.
 * - Theme-aware: no forced dark background, and lighter-weight beams on the
 *   light theme.
 * - Beam colours narrowed to the site's cold technical blue. The original
 *   ranged cyan to violet — set HUE_MIN = 190 and HUE_SPAN = 70 to restore it.
 */

interface BeamsBackgroundProps {
  className?: string;
  children?: ReactNode;
  intensity?: "subtle" | "medium" | "strong";
}

interface Beam {
  x: number;
  y: number;
  width: number;
  length: number;
  angle: number;
  speed: number;
  opacity: number;
  hue: number;
  pulse: number;
  pulseSpeed: number;
}

const OPACITY = { subtle: 0.7, medium: 0.85, strong: 1 } as const;

const HUE_MIN = 198;
const HUE_SPAN = 22;

function createBeam(width: number, height: number): Beam {
  return {
    x: Math.random() * width * 1.5 - width * 0.25,
    y: Math.random() * height * 1.5 - height * 0.25,
    width: 30 + Math.random() * 60,
    length: height * 2.5,
    angle: -35 + Math.random() * 10,
    speed: 0.6 + Math.random() * 1.2,
    opacity: 0.12 + Math.random() * 0.16,
    hue: HUE_MIN + Math.random() * HUE_SPAN,
    pulse: Math.random() * Math.PI * 2,
    pulseSpeed: 0.02 + Math.random() * 0.03,
  };
}

export function BeamsBackground({
  className,
  children,
  intensity = "strong",
}: BeamsBackgroundProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reduceMotion = useReducedMotion();
  const { resolvedTheme } = useTheme();
  const isLight = resolvedTheme === "light";

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Darker, fainter beams on the light theme so they read as a tint rather
    // than a glow on the off-white page.
    const lightness = isLight ? 50 : 65;
    const themeOpacity = isLight ? 0.55 : 1;

    let width = 1;
    let height = 1;
    let beams: Beam[] = [];
    let frame = 0;
    let running = false;
    let onScreen = true;

    function drawBeam(c: CanvasRenderingContext2D, beam: Beam) {
      c.save();
      c.translate(beam.x, beam.y);
      c.rotate((beam.angle * Math.PI) / 180);

      const a =
        beam.opacity *
        (0.8 + Math.sin(beam.pulse) * 0.2) *
        OPACITY[intensity] *
        themeOpacity;
      const color = (alpha: number) =>
        `hsla(${beam.hue}, 85%, ${lightness}%, ${alpha})`;

      const gradient = c.createLinearGradient(0, 0, 0, beam.length);
      gradient.addColorStop(0, color(0));
      gradient.addColorStop(0.1, color(a * 0.5));
      gradient.addColorStop(0.4, color(a));
      gradient.addColorStop(0.6, color(a));
      gradient.addColorStop(0.9, color(a * 0.5));
      gradient.addColorStop(1, color(0));

      c.fillStyle = gradient;
      c.fillRect(-beam.width / 2, 0, beam.width, beam.length);
      c.restore();
    }

    function draw() {
      ctx!.clearRect(0, 0, width, height);
      for (const beam of beams) drawBeam(ctx!, beam);
    }

    function resetBeam(beam: Beam, index: number, total: number) {
      const column = index % 3;
      const spacing = width / 3;
      beam.y = height + 100;
      beam.x =
        column * spacing + spacing / 2 + (Math.random() - 0.5) * spacing * 0.5;
      beam.width = 100 + Math.random() * 100;
      beam.speed = 0.5 + Math.random() * 0.4;
      beam.hue = HUE_MIN + (index * HUE_SPAN) / total;
      beam.opacity = 0.2 + Math.random() * 0.1;
    }

    function resize() {
      const rect = container!.getBoundingClientRect();
      width = Math.max(1, Math.round(rect.width));
      height = Math.max(1, Math.round(rect.height));
      // 1:1 backing store on purpose: the canvas is heavily blurred, so extra
      // device pixels would be invisible and only cost fill-rate.
      canvas!.width = width;
      canvas!.height = height;
      const count = width < 768 ? 14 : 30;
      beams = Array.from({ length: count }, () => createBeam(width, height));
      draw();
    }

    function step() {
      beams.forEach((beam, i) => {
        beam.y -= beam.speed;
        beam.pulse += beam.pulseSpeed;
        if (beam.y + beam.length < -100) resetBeam(beam, i, beams.length);
      });
      draw();
      frame = requestAnimationFrame(step);
    }

    function start() {
      if (running || reduceMotion) return;
      running = true;
      frame = requestAnimationFrame(step);
    }

    function stop() {
      running = false;
      cancelAnimationFrame(frame);
    }

    const sync = () => (onScreen && !document.hidden ? start() : stop());

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(container);

    const visibility = new IntersectionObserver(([entry]) => {
      onScreen = entry.isIntersecting;
      sync();
    });
    visibility.observe(container);

    document.addEventListener("visibilitychange", sync);

    resize();
    sync();

    return () => {
      stop();
      resizeObserver.disconnect();
      visibility.disconnect();
      document.removeEventListener("visibilitychange", sync);
    };
  }, [intensity, isLight, reduceMotion]);

  return (
    <div
      ref={containerRef}
      className={cn("relative w-full overflow-hidden", className)}
    >
      <canvas
        ref={canvasRef}
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 h-full w-full"
        // Roughly the combined strength of the original's 35px canvas blur
        // plus 15px CSS blur, done once on the compositor.
        style={{ filter: "blur(38px)" }}
      />
      {children ? <div className="relative z-10">{children}</div> : null}
    </div>
  );
}
