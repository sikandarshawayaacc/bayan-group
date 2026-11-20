import type { Metadata } from "next";
import Link from "next/link";
import { CalendarClock, CheckCircle2, FileText, Users } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { getSettings } from "@/lib/db";
import { PageHero, SectionHeading } from "@/components/ui";
import { EnquiryForm } from "@/components/EnquiryForm";
import { divisions } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "اطلب استشارة" : "Request a Consultation",
    description: locale === "ar"
      ? "اطلب استشارة مع مجموعة بيان. أخبرنا بالقرار والإطار الزمني ونطاق الميزانية، ونرد بخطوة تالية واضحة."
      : "Request a consultation with BAYAN GROUP. Tell us the decision, timeline and budget range, and we respond with a clear next step.",
    alternates: { canonical: "/consultation" },
  };
}

export default async function ConsultationPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const s = getSettings();

  const steps = [
    {
      icon: FileText,
      en: "You describe the decision, not the solution.",
      ar: "تصف القرار لا الحل.",
      bodyEn: "A short brief is enough. We will ask for documents only when they change the answer.",
      bodyAr: "يكفي موجز قصير. نطلب المستندات فقط عندما تغير الإجابة.",
    },
    {
      icon: Users,
      en: "We name the person who will do the work.",
      ar: "نحدد من سيقوم بالعمل بالاسم.",
      bodyEn: "No handover to an unnamed delivery team after the pitch.",
      bodyAr: "لا تسليم لفريق تنفيذ مجهول بعد العرض.",
    },
    {
      icon: CalendarClock,
      en: "You get a scope, a price and a date.",
      ar: "تحصل على نطاق وسعر وموعد.",
      bodyEn: "Or a clear no, with the reason. Both are useful.",
      bodyAr: "أو رفض واضح مع السبب. كلاهما مفيد.",
    },
    {
      icon: CheckCircle2,
      en: "Nothing starts before written acceptance.",
      ar: "لا يبدأ شيء قبل قبول مكتوب.",
      bodyEn: "No verbal commitments, no work outside the agreed scope.",
      bodyAr: "لا التزامات شفهية ولا عمل خارج النطاق المتفق عليه.",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={tr("nav.consultation")}
        title={locale === "ar" ? "استشارة تبدأ بسؤال واضح." : "A consultation that starts with a clear question."}
        lead={locale === "ar"
          ? "أخبرنا بالقرار الذي تواجهه والإطار الزمني. نرد خلال يوم عمل واحد إما بنطاق مقترح أو بسؤال يوضح الصورة."
          : "Tell us the decision in front of you and your timeline. We respond within one business day with either a proposed scope or the question that clarifies it."}
        breadcrumb={[{ href: "/consultation", label: tr("nav.consultation") }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <h2 className="text-xl font-bold text-navy">{locale === "ar" ? "نموذج الاستشارة" : "Consultation request"}</h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
              {locale === "ar"
                ? "الحقول المعلّمة بـ * مطلوبة. تُخزَّن الطلبات في قاعدة البيانات ويُرسل تأكيد بالبريد مع رقم مرجعي."
                : "Fields marked * are required. Requests are stored in the database and acknowledged by email with a reference number."}
            </p>
            <div className="mt-8">
              <EnquiryForm locale={locale} variant="consultation" defaultKind="consultation" />
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-lg border border-line bg-ivory p-6">
              <SectionHeading eyebrow={locale === "ar" ? "ما يحدث بعد ذلك" : "What happens next"} title={locale === "ar" ? "أربع خطوات، بلا مفاجآت." : "Four steps, no surprises."} />
              <ol className="mt-6 space-y-4">
                {steps.map((step) => {
                  const Icon = step.icon;
                  return (
                    <li key={step.en} className="flex gap-3">
                      <Icon size={17} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" />
                      <div>
                        <p className="text-[0.85rem] font-semibold text-navy">{locale === "ar" ? step.ar : step.en}</p>
                        <p className="mt-0.5 text-[0.78rem] leading-relaxed text-muted">{locale === "ar" ? step.bodyAr : step.bodyEn}</p>
                      </div>
                    </li>
                  );
                })}
              </ol>
            </div>

            <div className="rounded-lg border border-line p-6">
              <p className="text-[0.75rem] font-bold uppercase tracking-[0.14em] text-muted">{locale === "ar" ? "اختر القسم" : "Choose a division"}</p>
              <ul className="mt-3 space-y-2 text-[0.83rem]">
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

            <div className="rounded-lg border border-line bg-navy p-6 text-white">
              <p className="text-[0.9rem] font-bold">{locale === "ar" ? "تفضل التواصل المباشر؟" : "Prefer to write directly?"}</p>
              <p className="mt-2 text-[0.8rem] leading-relaxed text-white/60">{s.email} · {locale === "ar" ? s.hours_ar : s.hours_en}</p>
              <Link href="/contact" className="btn btn-primary btn-sm mt-4">{tr("nav.contact")}</Link>
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
