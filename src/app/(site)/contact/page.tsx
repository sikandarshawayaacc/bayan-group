import type { Metadata } from "next";
import Link from "next/link";
import { Clock, Mail, MapPin, Phone } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { getSettings, one } from "@/lib/db";
import { EnquiryForm } from "@/components/EnquiryForm";
import { PageHero } from "@/components/ui";
import { divisions } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "اتصل بنا" : "Contact",
    description: locale === "ar" ? "تواصل مع مجموعة بيان — الدوحة، قطر." : "Contact BAYAN GROUP in Doha, Qatar. Enquiries are acknowledged with a reference number within one business day.",
    alternates: { canonical: "/contact" },
  };
}

export default async function ContactPage({ searchParams }: { searchParams: Promise<{ division?: string; product?: string }> }) {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const s = getSettings();
  const sp = await searchParams;
  const division = divisions.find((d) => d.slug === sp.division)?.slug ?? "";
  const product = sp.product ? one<{ id: number; name: string; category: string }>("SELECT id,name,category FROM products WHERE slug = ? AND active = 1", [sp.product]) : undefined;
  const productDivision = product
    ? { "Enterprise Software": "technologies", "Digital Transformation": "technologies", Advisory: "advisory", Trading: "trading", Investments: "investments" }[product.category] ?? ""
    : "";

  return (
    <>
      <PageHero
        eyebrow={tr("section.contact")}
        title={locale === "ar" ? "لنبدأ بمحادثة واضحة." : "Let’s start with a clear conversation."}
        lead={locale === "ar"
          ? "أخبرنا بالقرار أو المشكلة التي تواجهها. نرد خلال يوم عمل واحد برقم مرجعي وخطوة تالية واضحة."
          : "Tell us the decision or problem in front of you. We reply within one business day with a reference number and a clear next step."}
        breadcrumb={[{ href: "/contact", label: tr("nav.contact") }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.2fr_0.8fr]">
          <div>
            <h2 className="text-xl font-bold text-navy">{locale === "ar" ? "نموذج الاستفسار" : "Enquiry form"}</h2>
            <p className="mt-2 text-[0.85rem] text-muted">
              {locale === "ar" ? "الحقول المعلّمة بـ * مطلوبة. تُخزَّن الطلبات في قاعدة البيانات ويُرسل تأكيد بالبريد." : "Fields marked * are required. Submissions are stored in the database and acknowledged by email."}
            </p>
            <div className="mt-8">
              <EnquiryForm locale={locale} variant="contact" defaultDivision={division || productDivision} productId={product?.id} />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-md border border-line bg-ivory p-6">
              <h2 className="text-[0.95rem] font-bold text-navy">{locale === "ar" ? "معلومات التواصل" : "Contact details"}</h2>
              <ul className="mt-4 space-y-4 text-[0.85rem] text-muted">
                <li className="flex gap-3"><MapPin size={17} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" /><span>{locale === "ar" ? s.address_ar : s.address_en}</span></li>
                <li className="flex gap-3"><Mail size={17} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" /><a href={`mailto:${s.email}`} className="hover:text-navy">{s.email}</a></li>
                <li className="flex gap-3"><Phone size={17} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" /><a href={`tel:${s.phone.replace(/\s/g, "")}`} dir="ltr" className="hover:text-navy">{s.phone}</a></li>
                <li className="flex gap-3"><Clock size={17} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" /><span>{locale === "ar" ? s.hours_ar : s.hours_en}</span></li>
              </ul>
            </div>

            <div className="rounded-md border border-line p-6">
              <h2 className="text-[0.95rem] font-bold text-navy">{locale === "ar" ? "اختر القسم مباشرة" : "Go straight to a division"}</h2>
              <ul className="mt-4 space-y-2 text-[0.83rem]">
                {divisions.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/divisions/${d.slug}`} className="flex items-center gap-2 text-muted hover:text-teal-dark">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.accent }} aria-hidden="true" />
                      {d.name[locale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-md border border-line bg-navy p-6 text-white">
              <h2 className="text-[0.95rem] font-bold">{locale === "ar" ? "تفضل الاستشارة؟" : "Prefer a consultation?"}</h2>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-white/60">
                {locale === "ar" ? "استخدم نموذج الاستشارة لإضافة الإطار الزمني ونطاق الميزانية." : "Use the consultation form to add your timeline and budget range."}
              </p>
              <Link href="/consultation" className="btn btn-primary btn-sm mt-4 w-full">{tr("nav.consultation")}</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
