import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, FileText, ShieldAlert } from "lucide-react";
import { divisionBySlug, divisions } from "@/lib/content";
import { getLocale, t } from "@/lib/i18n";
import { all } from "@/lib/db";
import { PageHero, SectionHeading, EmptyState } from "@/components/ui";
import { EnquiryForm } from "@/components/EnquiryForm";
import { AdvisoryAssessment } from "@/components/AdvisoryAssessment";
import { InvestmentCalculator } from "@/components/InvestmentCalculator";
import { Reveal } from "@/components/Reveal";
import { DivisionIcon } from "@/components/DivisionIcon";

export const dynamic = "force-dynamic";

type Faq = { id: number; question_en: string; question_ar: string | null; answer_en: string; answer_ar: string | null };
type Article = { slug: string; category: string; title_en: string; title_ar: string | null; excerpt_en: string | null; excerpt_ar: string | null; published_at: string };
type Product = { id: number; slug: string; name: string; category: string; sku: string | null; summary: string | null; price_note: string | null };

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const locale = await getLocale();
  const d = divisionBySlug(slug);
  if (!d) return { title: "Division not found" };
  return {
    title: d.name[locale],
    description: d.intro[locale],
    alternates: { canonical: `/divisions/${d.slug}` },
    openGraph: { title: d.name[locale], description: d.intro[locale] },
  };
}

export default async function DivisionPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ q?: string; category?: string }>;
}) {
  const { slug } = await params;
  const sp = await searchParams;
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const d = divisionBySlug(slug);
  if (!d) notFound();

  const faqs = all<Faq>("SELECT id,question_en,question_ar,answer_en,answer_ar FROM faqs WHERE active=1 AND (division IS NULL OR division = ?) ORDER BY sort", [d.slug]);
  const articles = all<Article>("SELECT slug,category,title_en,title_ar,excerpt_en,excerpt_ar,published_at FROM articles WHERE status='published' AND division = ? ORDER BY published_at DESC LIMIT 3", [d.slug]);
  const variant = d.slug === "technologies" || d.slug === "advisory" || d.slug === "investments" ? d.slug : "contact";

  const q = (sp.q ?? "").trim();
  const category = (sp.category ?? "").trim();
  const products = d.slug === "trading"
    ? all<Product>(
        `SELECT id,slug,name,category,sku,summary,price_note FROM products
         WHERE active = 1 AND category IN ('Trading','Enterprise Software','Advisory','Investments')
           AND (? = '' OR name LIKE ? OR summary LIKE ? OR sku LIKE ?)
           AND (? = '' OR category = ?)
         ORDER BY featured DESC, sort LIMIT 24`,
        [q, `%${q}%`, `%${q}%`, `%${q}%`, category, category],
      )
    : [];
  const tradingCategories = d.slug === "trading"
    ? all<{ category: string }>("SELECT DISTINCT category FROM products WHERE active = 1 ORDER BY category")
    : [];

  return (
    <>
      <PageHero
        eyebrow={d.short[locale]}
        title={d.name[locale]}
        lead={d.intro[locale]}
        breadcrumb={[{ href: "/divisions", label: tr("nav.divisions") }, { href: `/divisions/${d.slug}`, label: d.name[locale] }]}
      >
        <div className="flex flex-wrap gap-3">
          <a href="#enquiry" className="btn btn-primary">{tr("section.enquiry")} <ArrowRight size={15} aria-hidden="true" /></a>
          <Link href="/case-studies" className="btn btn-outline">{locale === "ar" ? "دراسات الحالة" : "Case studies"}</Link>
        </div>
      </PageHero>

      {/* Intro + capabilities */}
      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <Reveal>
            <p className="text-[0.9rem] font-semibold text-teal-dark">{d.tagline[locale]}</p>
            <div className="mt-4 space-y-4 text-[var(--text-body)] leading-relaxed text-muted">
              {d.description.map((p) => <p key={p.en}>{p[locale]}</p>)}
            </div>
          </Reveal>
          <Reveal delay={80}>
            <div className="rounded-lg border border-line bg-ivory p-6">
              <div className="flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded" style={{ background: `${d.accent}16`, color: d.accent }}>
                  <DivisionIcon slug={d.slug} size={19} />
                </span>
                <h2 className="text-[0.95rem] font-bold text-navy">{tr("section.capabilities")}</h2>
              </div>
              <ul className="mt-5 space-y-2.5">
                {d.capabilities.map((c) => (
                  <li key={c.en} className="flex items-start gap-2 text-[0.83rem] text-muted">
                    <Check size={15} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" />
                    {c[locale]}
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      {/* Services */}
      <section className="border-y border-line bg-ivory py-14 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow={tr("section.services")} title={locale === "ar" ? "ما نقدمه في هذا القسم" : "What this division delivers"} />
          <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {d.services.map((s, i) => (
              <Reveal key={s.title.en} delay={i * 50} className="h-full">
                <article className="card h-full p-6">
                  <span className="font-mono text-[0.68rem] font-bold tracking-[0.18em] text-gold">0{i + 1}</span>
                  <h3 className="mt-3 text-[0.98rem] font-bold text-navy">{s.title[locale]}</h3>
                  <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">{s.body[locale]}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Division-specific tools */}
      {d.slug === "advisory" && (
        <section className="bg-white py-14 md:py-20">
          <div className="container-x grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <SectionHeading eyebrow={locale === "ar" ? "أداة" : "Tool"} title={locale === "ar" ? "أين تبدأ؟" : "Where would you start?"} body={locale === "ar" ? "أجب عن خمسة أسئلة لتحصل على قراءة أولية قبل أن تطلب استشارة." : "Answer five questions for an initial read before requesting a consultation."} />
              <div className="mt-6 flex items-start gap-3 rounded-md border border-line bg-light/60 p-4 text-[0.78rem] leading-relaxed text-muted">
                <FileText size={17} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" />
                <p>{locale === "ar" ? "التقييم لا يُخزَّن ولا يُرسل. النتيجة إرشادية وتُستخدم فقط لبدء الحوار." : "The assessment is not stored or transmitted. It is indicative and only used to frame the conversation."}</p>
              </div>
            </div>
            <AdvisoryAssessment locale={locale} />
          </div>
        </section>
      )}

      {d.slug === "investments" && (
        <section className="bg-white py-14 md:py-20">
          <div className="container-x grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <InvestmentCalculator locale={locale} />
            <div>
              <SectionHeading eyebrow={locale === "ar" ? "حدود واضحة" : "Clear boundaries"} title={locale === "ar" ? "ما لا نفعله." : "What we do not do."} />
              <ul className="mt-6 space-y-3 text-[0.85rem] leading-relaxed text-muted">
                {(locale === "ar"
                  ? ["لا نحتفظ بأصول العملاء ولا نعمل كأمين.", "لا ندير محافظ بشكل تقديري.", "لا نضمن عائداً ولا نقدم عرضاً لشراء منتج مالي.", "لا نستبدل المستشار المالي المرخص أو المدقق."]
                  : ["We do not hold client assets or act as custodian.", "We do not manage portfolios on a discretionary basis.", "We do not guarantee returns or offer any financial product for sale.", "We do not replace a licensed financial adviser or auditor."]
                ).map((x) => (
                  <li key={x} className="flex items-start gap-2">
                    <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
                    {x}
                  </li>
                ))}
              </ul>
              <Link href="/regulatory" className="mt-6 inline-flex text-[0.8rem] font-semibold text-teal-dark hover:underline">
                {tr("footer.regulatory")} →
              </Link>
            </div>
          </div>
        </section>
      )}

      {d.slug === "trading" && (
        <section className="bg-white py-14 md:py-20" id="catalogue">
          <div className="container-x">
            <SectionHeading
              eyebrow={locale === "ar" ? "الكتالوج" : "Catalogue"}
              title={locale === "ar" ? "منتجات وخدمات قابلة للتسعير" : "Products available for quotation"}
              body={locale === "ar" ? "القوائم إرشادية. أكد المواصفات والسعر في عرض مكتوب." : "Listings are indicative. Confirm specification and price in a written quotation."}
              action={<a href="#rfq" className="btn btn-dark btn-sm">{locale === "ar" ? "طلب عرض سعر" : "Request a quotation"}</a>}
            />
            <form method="get" className="mt-8 flex flex-col gap-3 rounded-md border border-line bg-ivory p-4 sm:flex-row sm:items-end">
              <div className="field flex-1">
                <label className="label" htmlFor="q">{tr("form.search")}</label>
                <input id="q" name="q" defaultValue={q} className="input" placeholder={locale === "ar" ? "ابحث بالاسم أو الرمز" : "Search by name or SKU"} />
              </div>
              <div className="field sm:w-56">
                <label className="label" htmlFor="category">{tr("form.category")}</label>
                <select id="category" name="category" defaultValue={category} className="select">
                  <option value="">{locale === "ar" ? "كل الفئات" : "All categories"}</option>
                  {tradingCategories.map((c) => <option key={c.category} value={c.category}>{c.category}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-dark">{tr("form.filter")}</button>
              {(q || category) && <Link href="/divisions/trading#catalogue" className="btn btn-ghost">{locale === "ar" ? "مسح" : "Clear"}</Link>}
            </form>

            {products.length === 0 ? (
              <div className="mt-6"><EmptyState title={locale === "ar" ? "لا منتجات مطابقة." : "No products match."} body={locale === "ar" ? "جرّب بحثاً أوسع أو أرسل طلب عرض سعر مباشرة." : "Try a broader search or send an RFQ directly."} /></div>
            ) : (
              <div className="mt-6 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {products.map((p) => (
                  <article key={p.id} className="card flex h-full flex-col p-5">
                    <div className="flex items-center justify-between gap-2">
                      <span className="badge bg-teal/10 text-teal-dark">{p.category}</span>
                      {p.sku && <span className="font-mono text-[0.66rem] text-muted" dir="ltr">{p.sku}</span>}
                    </div>
                    <h3 className="mt-3 text-[0.95rem] font-bold text-navy">{p.name}</h3>
                    <p className="mt-2 flex-1 text-[0.8rem] leading-relaxed text-muted">{p.summary}</p>
                    <p className="mt-3 text-[0.72rem] font-medium text-gold">{p.price_note}</p>
                    <div className="mt-4 flex gap-2">
                      <Link href={`/divisions/trading/${p.slug}`} className="btn btn-ghost btn-sm flex-1">{tr("cta.learn")}</Link>
                      <Link href={`/contact?product=${p.slug}`} className="btn btn-primary btn-sm flex-1">{locale === "ar" ? "استفسار" : "Enquire"}</Link>
                    </div>
                  </article>
                ))}
              </div>
            )}
            <p className="mt-6 flex items-start gap-2 text-[0.72rem] leading-relaxed text-muted">
              <ShieldAlert size={14} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
              {locale === "ar" ? "لا تُعالج المدفوعات على هذا الموقع. الأسعار والتوفر يُؤكدان كتابةً." : "No payments are processed on this site. Pricing and availability are confirmed in writing."}
            </p>
          </div>
        </section>
      )}

      {/* Approach */}
      <section className="border-y border-line bg-navy py-14 text-white md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <SectionHeading light eyebrow={locale === "ar" ? "المنهج" : "Approach"} title={tr("section.approach")} body={locale === "ar" ? "أربعة التزامات نطبقها في كل مشاركة." : "Four commitments we apply to every engagement."} />
          <ol className="grid gap-4 sm:grid-cols-2">
            {d.approach.map((a, i) => (
              <li key={a.en} className="rounded-md border border-white/10 bg-white/[0.03] p-5">
                <span className="font-mono text-[0.68rem] font-bold tracking-[0.18em] text-gold">0{i + 1}</span>
                <p className="mt-2 text-[0.88rem] leading-relaxed text-white/80">{a[locale]}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* FAQ */}
      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[0.7fr_1.3fr]">
          <SectionHeading eyebrow={tr("section.faq")} title={locale === "ar" ? "أسئلة متكررة" : "Questions we are asked"} />
          <div className="divide-y divide-line border-y border-line">
            {faqs.map((f) => (
              <details key={f.id} className="group py-4">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-[0.9rem] font-semibold text-navy">
                  {locale === "ar" && f.question_ar ? f.question_ar : f.question_en}
                  <span className="text-teal-dark transition-transform group-open:rotate-45" aria-hidden="true">+</span>
                </summary>
                <p className="mt-3 max-w-2xl text-[0.84rem] leading-relaxed text-muted">{locale === "ar" && f.answer_ar ? f.answer_ar : f.answer_en}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Enquiry */}
      <section id="enquiry" className="border-t border-line bg-ivory py-14 md:py-20">
        <div className="container-x grid gap-10 lg:grid-cols-[0.8fr_1.2fr]">
          <div>
            <SectionHeading eyebrow={tr("section.enquiry")} title={locale === "ar" ? `تحدث مع ${d.short[locale]}` : `Talk to ${d.short[locale]}`} body={locale === "ar" ? "نرد خلال يوم عمل واحد برقم مرجعي وخطوة تالية." : "We respond within one business day with a reference number and a next step."} />
            <div className="mt-6 rounded-md border border-line bg-white p-5 text-[0.78rem] leading-relaxed text-muted">
              <p className="font-semibold text-navy">{locale === "ar" ? "ماذا يحدث بعد الإرسال؟" : "What happens after you submit?"}</p>
              <ol className="mt-2 list-decimal space-y-1 ps-4">
                <li>{locale === "ar" ? "يُخزَّن الطلب ويُرسل تأكيد بالبريد." : "The request is stored and an acknowledgement is emailed."}</li>
                <li>{locale === "ar" ? "يُسند إلى مسؤول في القسم." : "It is assigned to a named owner in the division."}</li>
                <li>{locale === "ar" ? "نتواصل بأسئلة محددة أو نطاق مقترح." : "We respond with specific questions or a proposed scope."}</li>
              </ol>
            </div>
            {d.slug === "trading" && (
              <div id="rfq" className="mt-6 rounded-md border border-line bg-white p-5">
                <p className="text-[0.85rem] font-bold text-navy">{locale === "ar" ? "طلب عرض سعر" : "Request a quotation"}</p>
                <p className="mt-1 text-[0.78rem] text-muted">{locale === "ar" ? "استخدم نموذج عرض السعر في صفحة المنتج أو الكتالوج." : "Use the RFQ form on a product page or in the catalogue."}</p>
                <Link href="/divisions/trading#catalogue" className="btn btn-ghost btn-sm mt-3">{locale === "ar" ? "تصفح الكتالوج" : "Browse catalogue"}</Link>
              </div>
            )}
          </div>
          <div className="rounded-lg border border-line bg-white p-6 md:p-8">
            <EnquiryForm locale={locale} variant={variant} defaultDivision={d.slug} defaultKind={d.slug === "investments" ? "consultation" : "project"} />
          </div>
        </div>
      </section>

      {/* Related + other divisions */}
      <section className="bg-white py-14 md:py-20">
        <div className="container-x">
          {articles.length > 0 && (
            <>
              <SectionHeading eyebrow={tr("nav.insights")} title={tr("section.related")} action={<Link href="/insights" className="btn btn-ghost btn-sm">{tr("cta.all")}</Link>} />
              <div className="mt-8 grid gap-4 md:grid-cols-3">
                {articles.map((a) => (
                  <Link key={a.slug} href={`/insights/${a.slug}`} className="card card-hover group p-5">
                    <span className="badge bg-light text-muted">{a.category}</span>
                    <h3 className="mt-3 text-[0.92rem] font-bold text-navy group-hover:text-teal-dark">{locale === "ar" && a.title_ar ? a.title_ar : a.title_en}</h3>
                    <p className="mt-2 text-[0.78rem] text-muted">{locale === "ar" && a.excerpt_ar ? a.excerpt_ar : a.excerpt_en}</p>
                  </Link>
                ))}
              </div>
            </>
          )}
          <div className="mt-12 border-t border-line pt-8">
            <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">{locale === "ar" ? "أقسام أخرى" : "Other divisions"}</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {divisions.filter((x) => x.slug !== d.slug).map((x) => (
                <Link key={x.slug} href={`/divisions/${x.slug}`} className="inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-[0.8rem] font-medium text-navy hover:border-teal/50 hover:text-teal-dark">
                  <span className="h-1.5 w-1.5 rounded-full" style={{ background: x.accent }} aria-hidden="true" />
                  {x.name[locale]}
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
