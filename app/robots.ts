import type { MetadataRoute } from "next";
import { IS_PUBLIC_SITE, SITE_URL } from "@/lib/site";

export default function robots(): MetadataRoute.Robots {
  // Temporary/feedback deployments are kept out of search engines entirely.
  if (!IS_PUBLIC_SITE) {
    return { rules: { userAgent: "*", disallow: "/" } };
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
