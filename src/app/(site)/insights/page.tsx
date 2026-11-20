import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { all } from "@/lib/db";
import { PageHero, EmptyState } from "@/components/ui";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "الرؤى والموارد" : "Insights & Resources",
    description: locale === "ar"
      ? "ملاحظات عملية من مشاركات حقيقية في التقنية والاستشارات والتجارة والاستثمار."
      : "Practical notes from live engagements across technology, advisory, trading and investments.",
    alternates: { canonical: "/insights" },
  };
}

type Article = {
  id: number; slug: string; category: string; division: string | null;
  title_en: string; title_ar: string | null; excerpt_en: string | null; excerpt_ar: string | null;
  author: string | null; published_at: string | null;
};

export default async function InsightsPage({ searchParams }: { searchParams: Promise<{ category?: string; q?: string }> }) {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const sp = await searchParams;
  const category = (sp.category ?? "").trim();
  const q = (sp.q ?? "").trim();

  const categories = all<{ category: string }>("SELECT DISTINCT category FROM articles WHERE status='published' ORDER BY category");
  const articles = all<Article>(
    `SELECT id,slug,category,division,title_en,title_ar,excerpt_en,excerpt_ar,author,published_at
     FROM articles WHERE status='published'
       AND (? = '' OR category = ?)
       AND (? = '' OR title_en LIKE ? OR title_ar LIKE ? OR excerpt_en LIKE ?)
     ORDER BY published_at DESC LIMIT 60`,
    [category, category, q, `%${q}%`, `%${q}%`, `%${q}%`],
  );

  const href = (next: { category?: string; q?: string }) => {
    const params = new URLSearchParams();
    if (next.category) params.set("category", next.category);
    if (next.q) params.set("q", next.q);
    const qs = params.toString();
    return `/insights${qs ? `?${qs}` : ""}`;
  };

  return (
    <>
      <PageHero
        eyebrow={tr("nav.insights")}
        title={locale === "ar" ? "ملاحظات من العمل، لا حشو فكري." : "Notes from the work, not thought-leadership filler."}
        lead={locale === "ar"
          ? "نكتب عما نراه في المشاركات: ما ينجح، وما يفشل، وكيف تعرف الفرق قبل أن تلتزم."
          : "We write about what we see in engagements: what works, what fails, and how to tell the difference before you commit."}
        breadcrumb={[{ href: "/insights", label: tr("nav.insights") }]}
      />

      <section className="bg-white py-12 md:py-16">
        <div className="container-x">
          <form method="get" className="flex flex-col gap-3 rounded-md border border-line bg-ivory p-4 sm:flex-row sm:items-end">
            <div className="field flex-1">
              <label className="label" htmlFor="q">{tr("form.search")}</label>
              <input id="q" name="q" defaultValue={q} className="input" placeholder={locale === "ar" ? "ابحث في المقالات" : "Search articles"} />
            </div>
            {category && <input type="hidden" name="category" value={category} />}
            <button type="submit" className="btn btn-dark">{tr("form.search")}</button>
            {(q || category) && <Link href="/insights" className="btn btn-ghost">{locale === "ar" ? "مسح" : "Clear"}</Link>}
          </form>

          <div className="mt-6 flex flex-wrap gap-2">
            <Link href={href({ q })} className={`badge ${category ? "bg-light text-muted" : "bg-navy text-white"}`}>{locale === "ar" ? "الكل" : "All"}</Link>
            {categories.map((c) => (
              <Link key={c.category} href={href({ category: c.category, q })} className={`badge ${category === c.category ? "bg-navy text-white" : "bg-light text-muted hover:text-navy"}`}>
                {c.category}
              </Link>
            ))}
          </div>

          {articles.length === 0 ? (
            <div className="mt-8">
              <EmptyState title={locale === "ar" ? "لا مقالات مطابقة." : "No articles match."} body={locale === "ar" ? "جرّب بحثاً أوسع أو أزل عامل التصفية." : "Try a broader search or remove the filter."} />
            </div>
          ) : (
            <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {articles.map((a, i) => (
                <Reveal key={a.id} delay={i * 40} className="h-full">
                  <Link href={`/insights/${a.slug}`} className="card card-hover group flex h-full flex-col p-6">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge bg-teal/10 text-teal-dark">{a.category}</span>
                      {a.published_at && (
                        <time dateTime={a.published_at} className="text-[0.68rem] text-muted">
                          {new Date(a.published_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB", { year: "numeric", month: "short", day: "numeric" })}
                        </time>
                      )}
                    </div>
                    <h2 className="mt-4 text-[1.02rem] font-bold leading-snug text-navy group-hover:text-teal-dark">
                      {locale === "ar" && a.title_ar ? a.title_ar : a.title_en}
                    </h2>
                    <p className="mt-2 flex-1 text-[0.82rem] leading-relaxed text-muted">
                      {locale === "ar" && a.excerpt_ar ? a.excerpt_ar : a.excerpt_en}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-teal-dark">
                      {tr("cta.learn")} <ArrowRight size={13} aria-hidden="true" />
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
