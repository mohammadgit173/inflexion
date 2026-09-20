import { ImageResponse } from "next/og";
import { getTranslations } from "next-intl/server";
import { routing, type Locale } from "@/i18n/routing";

export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Inflexion";

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

/**
 * Open Graph card, generated at build time per locale. Mirrors the site's
 * dark technical framing: hairline border, corner brackets, mono labels.
 */
export default async function OpengraphImage({
  params,
}: {
  params: Promise<{ locale: Locale }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "hero" });
  const tMeta = await getTranslations({ locale, namespace: "meta" });

  const bg = "#0A0A0B";
  const text = "#FFFFFF";
  const muted = "rgba(255,255,255,0.70)";
  const hairline = "rgba(255,255,255,0.20)";
  const accent = "#5BA7E8";

  const bracket = (pos: Record<string, number>) => ({
    position: "absolute" as const,
    width: 34,
    height: 34,
    border: `1px solid ${hairline}`,
    ...pos,
  });

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: bg,
          color: text,
          padding: 64,
          fontFamily: "sans-serif",
          position: "relative",
        }}
      >
        {/* Corner brackets — only two edges each, so they read as brackets */}
        <div style={{ ...bracket({ top: 40, left: 40 }), borderRight: "none", borderBottom: "none" }} />
        <div style={{ ...bracket({ top: 40, right: 40 }), borderLeft: "none", borderBottom: "none" }} />
        <div style={{ ...bracket({ bottom: 40, left: 40 }), borderRight: "none", borderTop: "none" }} />
        <div style={{ ...bracket({ bottom: 40, right: 40 }), borderLeft: "none", borderTop: "none" }} />

        <div style={{ display: "flex", fontSize: 20, letterSpacing: 8, color: muted }}>
          INFLEXION
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 28 }}>
            <span style={{ fontSize: 17, letterSpacing: 3, color: "rgba(255,255,255,0.47)" }}>
              001
            </span>
            <span style={{ display: "flex", width: 120, height: 1, background: hairline }} />
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 62,
              lineHeight: 1.1,
              letterSpacing: -1.5,
              maxWidth: 940,
            }}
          >
            {t("headline")}
          </div>

          <div
            style={{
              display: "flex",
              fontSize: 25,
              lineHeight: 1.45,
              color: muted,
              maxWidth: 860,
              marginTop: 26,
            }}
          >
            {tMeta("ogAlt")}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            borderTop: `1px solid ${hairline}`,
            paddingTop: 22,
            fontSize: 17,
            letterSpacing: 3,
            color: "rgba(255,255,255,0.47)",
          }}
        >
          <span>{t("labels.left")}</span>
          <span style={{ color: accent }}>{t("labels.center")}</span>
          <span>{t("labels.right")}</span>
        </div>
      </div>
    ),
    size,
  );
}
