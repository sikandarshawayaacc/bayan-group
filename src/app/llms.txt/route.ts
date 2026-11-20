import { all, getSettings } from "@/lib/db";
import { divisions, values, processSteps } from "@/lib/content";
import { t } from "@/lib/i18n";

export const dynamic = "force-dynamic";

/** A concise, machine-readable map of the site for AI assistants and agents. */
export function GET() {
  const s = getSettings();
  const base = (process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000").replace(/\/$/, "");
  const articles = all<{ slug: string; title_en: string; excerpt_en: string | null }>(
    "SELECT slug,title_en,excerpt_en FROM articles WHERE status = 'published' ORDER BY published_at DESC LIMIT 20",
  );
  const cases = all<{ slug: string; title: string; summary: string }>(
    "SELECT slug,title,summary FROM case_studies WHERE status = 'published' ORDER BY sort",
  );

  const lines = [
    `# ${s.company_name_en}`,
    "",
    `> ${s.tagline_en}`,
    "",
    s.seo_description_en,
    "",
    `Contact: ${s.email} · ${s.phone} · ${s.address_en}`,
    `Hours: ${s.hours_en}`,
    "",
    "## Divisions",
    ...divisions.map((d) => `- [${d.name.en}](${base}/divisions/${d.slug}): ${d.intro.en}`),
    "",
    "## Approach",
    ...processSteps.map((n) => `- ${n}. ${t("en", `step.${n}`)}: ${t("en", `step.${n}.body`)}`),
    "",
    "## Principles",
    ...values.map((v) => `- ${t("en", `value.${v.key}`)}: ${t("en", `value.${v.key}.body`)}`),
    "",
    "## Key pages",
    `- [Home](${base}/)`,
    `- [About](${base}/about)`,
    `- [Divisions](${base}/divisions)`,
    `- [Insights](${base}/insights)`,
    `- [Case studies](${base}/case-studies)`,
    `- [Careers](${base}/careers)`,
    `- [Contact](${base}/contact)`,
    `- [Request a consultation](${base}/consultation)`,
    `- [Client portal](${base}/portal/login)`,
    "",
    "## Published insights",
    ...(articles.length
      ? articles.map((a) => `- [${a.title_en}](${base}/insights/${a.slug}): ${a.excerpt_en ?? ""}`)
      : ["- No published articles yet."]),
    "",
    "## Case studies",
    ...(cases.length
      ? cases.map((c) => `- [${c.title}](${base}/case-studies/${c.slug}): ${c.summary}`)
      : ["- None published."]),
    "",
    "## Legal",
    `- [Privacy Policy](${base}/privacy)`,
    `- [Terms & Conditions](${base}/terms)`,
    `- [Cookie Policy](${base}/cookies)`,
    `- [Regulatory & Legal Disclosures](${base}/regulatory)`,
    "",
  ];

  return new Response(lines.join("\n"), {
    headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "public, max-age=3600" },
  });
}
