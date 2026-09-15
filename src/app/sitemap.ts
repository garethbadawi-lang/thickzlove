import type { MetadataRoute } from "next";
import { siteConfig } from "@/data/site-config";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = siteConfig.seo.siteUrl;
  const paths = [
    "",
    "/services",
    "/booking",
    "/availability",
    "/gallery",
    "/about",
    "/etiquette",
    "/faq",
    "/contact",
    "/terms",
    "/privacy",
  ];

  return paths.map((path) => ({
    url: `${base}${path}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: path === "" ? 1 : 0.7,
  }));
}
