import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { all, one } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { divisions } from "@/lib/content";
import { PageHero } from "@/components/ui";

export const dynamic = "force-dynamic";

type CaseRow = {
  id: number; slug: string; client_label: string; division: string;
  title: string; summary: string; body: string; results: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const c = one<CaseRow>("SELECT * FROM case_studies WHERE slug = ? AND status='published'", [slug]);
  if (!c) return { title: "Case study not found" };
  return {
    title: c.title,
    description: c.summary,
    alternates: { canonical: `/case-studies/${c.slug}` },
    openGraph: { title: c.title, description: c.summary },
  };
}

export default async function CaseStudyPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const c = one<CaseRow>("SELECT * FROM case_studies WHERE slug = ? AND status='published'", [slug]);
  if (!c) notFound();

  const d = divisions.find((x) => x.slug === c.division);
  const results = (c.results ?? "").split("|").map((r) => r.trim()).filter(Boolean);
  const more = all<CaseRow>(
    "SELECT id,slug,client_label,division,title,summary FROM case_studies WHERE status='published' AND slug != ? ORDER BY sort LIMIT 2",
    [c.slug],
  );

  return (
    <>
      <PageHero
        eyebrow={d ? d.short[locale] : c.division}
        title={c.title}
        lead={c.summary}
        breadcrumb={[
          { href: "/case-studies", label: locale === "ar" ? "دراسات الحالة" : "Case Studies" },
          { href: `/case-studies/${c.slug}`, label: c.client_label },
        ]}
      >
        <dl className="flex flex-wrap gap-x-10 gap-y-3 border-t border-white/10 pt-5 text-[0.78rem] text-white/60">
          <div><dt className="text-white/40">{locale === "ar" ? "العميل" : "Client"}</dt><dd className="mt-0.5 font-semibold text-white">{c.client_label}</dd></div>
          <div><dt className="text-white/40">{tr("nav.divisions")}</dt><dd className="mt-0.5 font-semibold text-white">{d?.name[locale] ?? c.division}</dd></div>
        </dl>
      </PageHero>

      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_300px]">
          <div>
            <div className="prose-bayan max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(c.body) }} />
            <Link href="/case-studies" className="mt-10 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-teal-dark hover:underline">
              <ArrowLeft size={14} className="rtl:rotate-180" aria-hidden="true" /> {locale === "ar" ? "كل دراسات الحالة" : "All case studies"}
            </Link>
          </div>

          <aside className="space-y-6">
            {results.length > 0 && (
              <div className="rounded-lg border border-line bg-ivory p-6">
                <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted">{locale === "ar" ? "النتيجة" : "At a glance"}</h2>
                <dl className="mt-4 space-y-3">
                  {results.map((r) => {
                    const [label, ...rest] = r.split(":");
                    return (
                      <div key={r}>
                        <dt className="text-[0.72rem] uppercase tracking-[0.08em] text-muted">{label}</dt>
                        <dd className="mt-0.5 text-[0.85rem] font-semibold text-navy">{rest.join(":").trim() || label}</dd>
                      </div>
                    );
                  })}
                </dl>
              </div>
            )}
            <div className="rounded-lg border border-line p-6">
              <h2 className="text-[0.95rem] font-bold text-navy">{locale === "ar" ? "مشاركة مشابهة؟" : "A comparable engagement?"}</h2>
              <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">
                {locale === "ar" ? "أخبرنا بالوضع الحالي وما تحتاج تغييره." : "Tell us the current state and what needs to change."}
              </p>
              <Link href={`/contact?division=${c.division}`} className="btn btn-primary btn-sm mt-4 w-full">{tr("nav.contact")}</Link>
            </div>
            <p className="text-[0.7rem] leading-relaxed text-muted">
              {locale === "ar"
                ? "النتائج تخص هذه المشاركة ولا تُعد ضماناً لنتائج مماثلة."
                : "Results relate to this engagement only and are not a guarantee of similar outcomes."}
            </p>
          </aside>
        </div>
      </section>

      {more.length > 0 && (
        <section className="border-t border-line bg-light py-14">
          <div className="container-x">
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-muted">{locale === "ar" ? "أعمال أخرى" : "More work"}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-2">
              {more.map((m) => (
                <Link key={m.slug} href={`/case-studies/${m.slug}`} className="card card-hover group p-6">
                  <span className="text-[0.68rem] uppercase tracking-[0.12em] text-muted">{m.client_label}</span>
                  <h3 className="mt-2 text-[1rem] font-bold text-navy group-hover:text-teal-dark">{m.title}</h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.74rem] font-semibold text-teal-dark">
                    {tr("cta.learn")} <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
