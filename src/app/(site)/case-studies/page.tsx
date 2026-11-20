import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { all } from "@/lib/db";
import { divisions } from "@/lib/content";
import { PageHero, EmptyState } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "دراسات الحالة" : "Case Studies",
    description: locale === "ar"
      ? "أعمال مختارة من أقسام المجموعة، مجهولة الهوية افتراضياً وتُنشر التفاصيل بإذن."
      : "Selected work from across the group — anonymised by default, with detail shared by permission.",
    alternates: { canonical: "/case-studies" },
  };
}

type CaseRow = { id: number; slug: string; client_label: string; division: string; title: string; summary: string };

export default async function CaseStudiesPage({ searchParams }: { searchParams: Promise<{ division?: string }> }) {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const sp = await searchParams;
  const filter = divisions.find((d) => d.slug === sp.division)?.slug ?? "";
  const cases = all<CaseRow>(
    "SELECT id,slug,client_label,division,title,summary FROM case_studies WHERE status='published' AND (? = '' OR division = ?) ORDER BY sort, id",
    [filter, filter],
  );

  return (
    <>
      <PageHero
        eyebrow={locale === "ar" ? "أعمالنا" : "Our work"}
        title={locale === "ar" ? "ما تغير، وكيف." : "What changed, and how."}
        lead={locale === "ar"
          ? "لا ننشر أرقاماً بلا سياق. كل دراسة تذكر خط الأساس وما سلمناه وما كان النتيجة."
          : "We do not publish numbers without context. Each study states the baseline, what we delivered and what changed."}
        breadcrumb={[{ href: "/case-studies", label: locale === "ar" ? "دراسات الحالة" : "Case Studies" }]}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="container-x">
          <div className="flex flex-wrap gap-2">
            <Link href="/case-studies" className={`badge ${filter ? "bg-light text-muted" : "bg-navy text-white"}`}>{locale === "ar" ? "الكل" : "All"}</Link>
            {divisions.map((d) => (
              <Link key={d.slug} href={`/case-studies?division=${d.slug}`} className={`badge ${filter === d.slug ? "bg-navy text-white" : "bg-light text-muted hover:text-navy"}`}>
                {d.short[locale]}
              </Link>
            ))}
          </div>

          {cases.length === 0 ? (
            <div className="mt-8">
              <EmptyState title={locale === "ar" ? "لا دراسات في هذا القسم بعد." : "No studies in this division yet."} body={locale === "ar" ? "اطلع على جميع الأقسام أو تواصل معنا لمناقشة أعمال مشابهة." : "View all divisions or contact us to discuss comparable work."} />
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {cases.map((c, i) => {
                const d = divisions.find((x) => x.slug === c.division);
                return (
                  <Reveal key={c.id} delay={i * 50} className="h-full">
                    <Link href={`/case-studies/${c.slug}`} className="group flex h-full flex-col rounded-lg border border-line p-6 transition-colors hover:border-teal/50">
                      <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.12em] text-muted">
                        <span className="inline-flex items-center gap-1.5">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: d?.accent ?? "#697781" }} aria-hidden="true" />
                          {d?.short[locale] ?? c.division}
                        </span>
                        <span>{c.client_label}</span>
                      </div>
                      <h2 className="mt-4 text-[1.05rem] font-bold leading-snug text-navy group-hover:text-teal-dark">{c.title}</h2>
                      <p className="mt-2 flex-1 text-[0.82rem] leading-relaxed text-muted">{c.summary}</p>
                      <span className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-teal-dark">
                        {tr("cta.learn")} <ArrowRight size={13} aria-hidden="true" />
                      </span>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}

          <div className="mt-12 rounded-lg border border-line bg-ivory p-6 md:p-8">
            <p className="text-[0.82rem] leading-relaxed text-muted">
              <strong className="text-navy">{locale === "ar" ? "ملاحظة على الأرقام: " : "A note on the numbers: "}</strong>
              {locale === "ar"
                ? "النتائج المذكورة تخص المشاركة الموصوفة وليست ضماناً لنتائج مماثلة. تُنشر أسماء العملاء بإذن كتابي."
                : "Results refer to the engagement described and are not a guarantee of similar outcomes elsewhere. Client names are published only with written permission."}
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
