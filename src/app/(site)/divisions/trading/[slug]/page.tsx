import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Check, ShieldAlert } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { all, one } from "@/lib/db";
import { PageHero } from "@/components/ui";
import { RfqForm } from "@/components/RfqForm";

export const dynamic = "force-dynamic";

type Product = {
  id: number; slug: string; name: string; category: string; sku: string | null;
  summary: string | null; description: string | null; specs: string | null;
  price_note: string | null; image: string | null;
};

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const p = one<Product>("SELECT * FROM products WHERE slug = ? AND active = 1", [slug]);
  if (!p) return { title: "Product not found" };
  return {
    title: p.name,
    description: p.summary ?? undefined,
    alternates: { canonical: `/divisions/trading/${p.slug}` },
    openGraph: { title: p.name, description: p.summary ?? undefined },
  };
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const p = one<Product>("SELECT * FROM products WHERE slug = ? AND active = 1", [slug]);
  if (!p) notFound();

  const specs = (p.specs ?? "").split("|").map((s) => s.trim()).filter(Boolean);
  const related = all<Product>(
    "SELECT id,slug,name,category,sku,summary,price_note FROM products WHERE active = 1 AND category = ? AND id != ? ORDER BY featured DESC, sort LIMIT 3",
    [p.category, p.id],
  );
  const options = all<{ id: number; name: string; sku: string | null }>(
    "SELECT id,name,sku FROM products WHERE active = 1 ORDER BY sort",
  );

  return (
    <>
      <PageHero
        eyebrow={p.category}
        title={p.name}
        lead={p.summary ?? undefined}
        breadcrumb={[
          { href: "/divisions", label: tr("nav.divisions") },
          { href: "/divisions/trading", label: locale === "ar" ? "بيان للتجارة" : "BAYAN Trading" },
          { href: `/divisions/trading/${p.slug}`, label: p.name },
        ]}
      >
        <div className="flex flex-wrap items-center gap-4 text-[0.78rem] text-white/60">
          {p.sku && <span className="font-mono" dir="ltr">{p.sku}</span>}
          {p.price_note && <span className="rounded border border-white/15 px-2 py-1 text-white/80">{p.price_note}</span>}
        </div>
      </PageHero>

      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <div className="prose-bayan max-w-2xl">
              <p>{p.description ?? p.summary}</p>
            </div>

            {specs.length > 0 && (
              <div className="mt-8">
                <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted">{locale === "ar" ? "المواصفات" : "Specification"}</h2>
                <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                  {specs.map((spec) => (
                    <li key={spec} className="flex items-start gap-2 rounded border border-line bg-ivory px-3 py-2 text-[0.8rem] text-navy">
                      <Check size={14} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" />
                      {spec}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <p className="mt-8 flex items-start gap-2 rounded-md border border-line bg-light/60 p-4 text-[0.78rem] leading-relaxed text-muted">
              <ShieldAlert size={16} className="mt-0.5 shrink-0 text-gold" aria-hidden="true" />
              {locale === "ar"
                ? "هذه القائمة إرشادية. تُؤكد المواصفات والمنشأ ومدة التسليم والسعر في عرض مكتوب قبل قبول الطلب. لا تُعالج مدفوعات على هذا الموقع."
                : "This listing is indicative. Specification, origin, lead time and price are confirmed in a written quotation before an order is accepted. No payments are processed on this site."}
            </p>

            <Link href="/divisions/trading#catalogue" className="mt-8 inline-flex items-center gap-1.5 text-[0.8rem] font-semibold text-teal-dark hover:underline">
              <ArrowLeft size={14} className="rtl:rotate-180" aria-hidden="true" /> {locale === "ar" ? "كل المنتجات" : "All products"}
            </Link>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-line bg-ivory p-6">
              <h2 className="text-[1rem] font-bold text-navy">{locale === "ar" ? "طلب عرض سعر" : "Request a quotation"}</h2>
              <p className="mt-1 text-[0.8rem] text-muted">
                {locale === "ar" ? "أرسل الكمية والتاريخ المطلوب. نرد بعرض مكتوب." : "Send quantity and required date. We respond with a written quotation."}
              </p>
              <div className="mt-5">
                <RfqForm locale={locale} products={options} productId={p.id} />
              </div>
            </div>

            <div className="rounded-lg border border-line p-6">
              <h2 className="text-[0.92rem] font-bold text-navy">{locale === "ar" ? "استفسار غير تجاري؟" : "A non-commercial question?"}</h2>
              <p className="mt-1 text-[0.8rem] leading-relaxed text-muted">
                {locale === "ar" ? "استخدم نموذج التواصل وسنوجهك للشخص المناسب." : "Use the contact form and we will route it to the right person."}
              </p>
              <Link href={`/contact?product=${p.slug}`} className="btn btn-ghost btn-sm mt-3 w-full">{tr("nav.contact")}</Link>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="border-t border-line bg-light py-14">
          <div className="container-x">
            <h2 className="text-[0.75rem] font-bold uppercase tracking-[0.16em] text-muted">{locale === "ar" ? "منتجات ذات صلة" : "Related products"}</h2>
            <div className="mt-6 grid gap-4 md:grid-cols-3">
              {related.map((r) => (
                <Link key={r.slug} href={`/divisions/trading/${r.slug}`} className="card card-hover group p-5">
                  <span className="badge bg-white text-muted">{r.category}</span>
                  <h3 className="mt-3 text-[0.92rem] font-bold text-navy group-hover:text-teal-dark">{r.name}</h3>
                  <p className="mt-2 text-[0.78rem] leading-relaxed text-muted">{r.summary}</p>
                  <p className="mt-3 text-[0.72rem] font-medium text-gold">{r.price_note}</p>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  );
}
