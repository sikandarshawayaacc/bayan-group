import type { MetadataRoute } from "next";
import { all } from "@/lib/db";
import { divisions } from "@/lib/content";

const site = () => process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const base = site().replace(/\/$/, "");
  const now = new Date();

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/about`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/divisions`, changeFrequency: "monthly", priority: 0.9 },
    { url: `${base}/insights`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${base}/case-studies`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/careers`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${base}/contact`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/consultation`, changeFrequency: "yearly", priority: 0.8 },
    { url: `${base}/privacy`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/terms`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/cookies`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${base}/regulatory`, changeFrequency: "yearly", priority: 0.3 },
  ];

  const divisionRoutes: MetadataRoute.Sitemap = divisions.map((d) => ({
    url: `${base}/divisions/${d.slug}`,
    changeFrequency: "monthly",
    priority: 0.85,
  }));

  const products = all<{ slug: string }>("SELECT slug FROM products WHERE active = 1 ORDER BY sort");
  const articles = all<{ slug: string; updated_at: string }>("SELECT slug,updated_at FROM articles WHERE status = 'published'");
  const cases = all<{ slug: string }>("SELECT slug FROM case_studies WHERE status = 'published'");
  const pages = all<{ slug: string; updated_at: string }>("SELECT slug,updated_at FROM pages WHERE status = 'published'");

  return [
    ...staticRoutes,
    ...divisionRoutes,
    ...products.map((p) => ({ url: `${base}/divisions/trading/${p.slug}`, changeFrequency: "monthly" as const, priority: 0.6 })),
    ...articles.map((a) => ({ url: `${base}/insights/${a.slug}`, lastModified: new Date(a.updated_at), changeFrequency: "yearly" as const, priority: 0.6 })),
    ...cases.map((c) => ({ url: `${base}/case-studies/${c.slug}`, changeFrequency: "yearly" as const, priority: 0.5 })),
    ...pages
      .filter((p) => !["privacy", "terms", "cookies", "regulatory"].includes(p.slug))
      .map((p) => ({ url: `${base}/${p.slug}`, lastModified: new Date(p.updated_at), changeFrequency: "yearly" as const, priority: 0.4 })),
  ].map((entry) => ({ lastModified: now, ...entry }));
}
