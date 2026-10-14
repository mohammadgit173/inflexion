import type { MetadataRoute } from "next";
import { SITE_URL } from "@/lib/site";

/**
 * The home, events and privacy pages, each in both locales.
 * French is unprefixed (the default locale), English lives under /en.
 *
 * The booking confirmation page is deliberately absent: it is noindex, and a
 * "thanks for booking" page has nothing to offer anyone arriving from search.
 */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();

  return [
    {
      url: `${SITE_URL}/`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          fr: `${SITE_URL}/`,
          en: `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/en`,
      lastModified,
      changeFrequency: "monthly",
      priority: 1,
      alternates: {
        languages: {
          fr: `${SITE_URL}/`,
          en: `${SITE_URL}/en`,
        },
      },
    },
    {
      url: `${SITE_URL}/evenements`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${SITE_URL}/evenements`,
          en: `${SITE_URL}/en/events`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/events`,
      lastModified,
      changeFrequency: "weekly",
      priority: 0.8,
      alternates: {
        languages: {
          fr: `${SITE_URL}/evenements`,
          en: `${SITE_URL}/en/events`,
        },
      },
    },
    {
      url: `${SITE_URL}/confidentialite`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          fr: `${SITE_URL}/confidentialite`,
          en: `${SITE_URL}/en/privacy`,
        },
      },
    },
    {
      url: `${SITE_URL}/en/privacy`,
      lastModified,
      changeFrequency: "yearly",
      priority: 0.3,
      alternates: {
        languages: {
          fr: `${SITE_URL}/confidentialite`,
          en: `${SITE_URL}/en/privacy`,
        },
      },
    },
  ];
}
