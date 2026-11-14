
import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/+$/, "") ??
    (process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : null);

  if (!siteUrl) {
    throw new Error(
      "NEXT_PUBLIC_SITE_URL must be configured to generate robots.txt."
    );
  }

  return {
    rules: {
      userAgent: "*",
      allow: [
        "/",
        "/blog/",
        "/practice/",
        "/voyage/",
        "/community/kraken/",
      ],
      disallow: [
        "/api/",
        "/dashboard/",
        "/dock/",
        "/login",
        "/signup",
        "/blog/studio/",
      ],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
    host: siteUrl,
  };
}
