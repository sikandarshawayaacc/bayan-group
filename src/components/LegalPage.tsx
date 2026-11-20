import Link from "next/link";
import { notFound } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { one } from "@/lib/db";
import { renderMarkdown } from "@/lib/markdown";
import { PageHero } from "@/components/ui";

type Page = { slug: string; title_en: string; title_ar: string | null; body_en: string; body_ar: string | null; updated_at: string };

export async function LegalPage({ slug, fallbackTitle }: { slug: string; fallbackTitle: string }) {
  const locale = await getLocale();
  const page = one<Page>("SELECT slug,title_en,title_ar,body_en,body_ar,updated_at FROM pages WHERE slug = ? AND status='published'", [slug]);
  if (!page) notFound();

  const title = locale === "ar" && page.title_ar ? page.title_ar : page.title_en || fallbackTitle;
  const body = locale === "ar" && page.body_ar ? page.body_ar : page.body_en;
  const updated = new Date(page.updated_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB", { year: "numeric", month: "long", day: "numeric" });

  return (
    <>
      <PageHero
        eyebrow={locale === "ar" ? "قانوني" : "Legal"}
        title={title}
        lead={locale === "ar" ? `آخر تحديث: ${updated}` : `Last updated ${updated}`}
        breadcrumb={[{ href: `/${slug}`, label: title }]}
      />
      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1fr_260px]">
          <article className="prose-bayan max-w-3xl" dangerouslySetInnerHTML={{ __html: renderMarkdown(body) }} />
          <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
            <div className="rounded-md border border-line bg-ivory p-5">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted">{locale === "ar" ? "صفحات قانونية" : "Legal pages"}</p>
              <ul className="mt-3 space-y-2 text-[0.82rem]">
                {[
                  ["/privacy", locale === "ar" ? "سياسة الخصوصية" : "Privacy Policy"],
                  ["/terms", locale === "ar" ? "الشروط والأحكام" : "Terms & Conditions"],
                  ["/cookies", locale === "ar" ? "سياسة ملفات الارتباط" : "Cookie Policy"],
                  ["/regulatory", locale === "ar" ? "الإفصاحات التنظيمية" : "Regulatory & Legal Disclosures"],
                ].map(([href, label]) => (
                  <li key={href}>
                    <Link href={href} className={href === `/${slug}` ? "font-semibold text-teal-dark" : "text-muted hover:text-navy"}>{label}</Link>
                  </li>
                ))}
              </ul>
            </div>
            <p className="text-[0.7rem] leading-relaxed text-muted">
              {locale === "ar"
                ? "هذه الصفحة معلومات عامة ولا تُعد استشارة قانونية. تُدار البيانات التنظيمية من لوحة الإدارة."
                : "This page is general information and not legal advice. Regulatory details are maintained by the administrator."}
            </p>
          </aside>
        </div>
      </section>
    </>
  );
}
