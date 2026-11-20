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

type Article = {
  id: number; slug: string; category: string; division: string | null;
  title_en: string; title_ar: string | null; excerpt_en: string | null; excerpt_ar: string | null;
  body_en: string; body_ar: string | null; author: string | null; published_at: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const a = one<Article>("SELECT * FROM articles WHERE slug = ? AND status='published'", [slug]);
  if (!a) return { title: "Article not found" };
  const locale = await getLocale();
  const title = locale === "ar" && a.title_ar ? a.title_ar : a.title_en;
  const description = (locale === "ar" && a.excerpt_ar ? a.excerpt_ar : a.excerpt_en) ?? undefined;
  return {
    title,
    description,
    alternates: { canonical: `/insights/${a.slug}` },
    openGraph: { type: "article", title, description, publishedTime: a.published_at ?? undefined },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const a = one<Article>("SELECT * FROM articles WHERE slug = ? AND status='published'", [slug]);
  if (!a) notFound();

  const title = locale === "ar" && a.title_ar ? a.title_ar : a.title_en;
  const body = locale === "ar" && a.body_ar ? a.body_ar : a.body_en;
  const division = divisions.find((d) => d.slug === a.division);
  const more = all<Article>(
    "SELECT id,slug,category,division,title_en,title_ar,excerpt_en,excerpt_ar,author,published_at FROM articles WHERE status='published' AND slug != ? ORDER BY published_at DESC LIMIT 3",
    [a.slug],
  );

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: a.title_en,
    datePublished: a.published_at,
    author: { "@type": "Organization", name: a.author ?? "BAYAN Editorial" },
    publisher: { "@type": "Organization", name: "BAYAN GROUP" },
  };

  return (
    <>
      <PageHero
        eyebrow={a.category}
        title={title}
        lead={locale === "ar" && a.excerpt_ar ? a.excerpt_ar : a.excerpt_en ?? undefined}
        breadcrumb={[
          { href: "/insights", label: tr("nav.insights") },
          { href: `/insights/${a.slug}`, label: a.category },
        ]}
      >
        <div className="flex flex-wrap items-center gap-3 text-[0.75rem] text-white/55">
          {a.published_at && (
            <time dateTime={a.published_at}>
              {new Date(a.published_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB", { year: "numeric", month: "long", day: "numeric" })}
            </time>
          )}
          {a.author && <><span aria-hidden="true">·</span><span>{a.author}</span></>}
          {division && (
            <>
              <span aria-hidden="true">·</span>
              <Link href={`/divisions/${division.slug}`} className="hover:text-white">{division.name[locale]}</Link>
            </>
          )}
        </div>
      </PageHero>

      <article className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_260px]">
          <div className="prose-bayan max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />

          <aside className="space-y-6 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-line bg-ivory p-5">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted">{tr("section.enquiry")}</p>
              <p className="mt-2 text-[0.83rem] leading-relaxed text-muted">
                {locale === "ar" ? "تريد مناقشة ما ورد في هذا المقال؟" : "Want to discuss what this article raises?"}
              </p>
              <Link href="/contact" className="btn btn-primary btn-sm mt-4 w-full">{tr("nav.contact")}</Link>
            </div>
            {division && (
              <div className="rounded-md border border-line p-5">
                <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted">{tr("nav.divisions")}</p>
                <Link href={`/divisions/${division.slug}`} className="mt-2 block text-[0.88rem] font-semibold text-navy hover:text-teal-dark">
                  {division.name[locale]}
                </Link>
                <p className="mt-1 text-[0.78rem] text-muted">{division.tagline[locale]}</p>
              </div>
            )}
            <Link href="/insights" className="inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-teal-dark hover:underline">
              <ArrowLeft size={14} className="rtl:rotate-180" aria-hidden="true" /> {locale === "ar" ? "كل المقالات" : "All articles"}
            </Link>
          </aside>
        </div>
      </article>

      {more.length > 0 && (
        <section className="border-t border-line bg-light py-14">
          <div className="container-x">
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-muted">{locale === "ar" ? "اقرأ أيضاً" : "Read next"}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {more.map((m) => (
                <Link key={m.slug} href={`/insights/${m.slug}`} className="card card-hover group p-5">
                  <span className="badge bg-white text-muted">{m.category}</span>
                  <h3 className="mt-3 text-[0.92rem] font-bold text-navy group-hover:text-teal-dark">
                    {locale === "ar" && m.title_ar ? m.title_ar : m.title_en}
                  </h3>
                  <span className="mt-3 inline-flex items-center gap-1 text-[0.74rem] font-semibold text-teal-dark">
                    {tr("cta.learn")} <ArrowRight size={12} aria-hidden="true" />
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
    </>
  );
}
