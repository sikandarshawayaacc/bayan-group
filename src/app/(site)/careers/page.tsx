import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, FileText, Globe2, GraduationCap } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { PageHero, SectionHeading } from "@/components/ui";
import { EnquiryForm } from "@/components/EnquiryForm";
import { divisions } from "@/lib/content";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "الوظائف" : "Careers",
    description: locale === "ar"
      ? "اعمل مع مجموعة بيان. نراجع الطلبات الاستباقية في التقنية والاستشارات والتجارة والاستثمار."
      : "Work with BAYAN GROUP. We review speculative applications across technology, advisory, trading and investments.",
    alternates: { canonical: "/careers" },
  };
}

export default async function CareersPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);

  const points = [
    {
      icon: FileText,
      en: "A written scope for every role, with named reporting lines.",
      ar: "نطاق مكتوب لكل دور مع خط إبلاغ محدد بالاسم.",
    },
    {
      icon: GraduationCap,
      en: "Development time budgeted, not promised as an afterthought.",
      ar: "وقت للتطوير ضمن الميزانية، لا وعداً لاحقاً.",
    },
    {
      icon: Globe2,
      en: "English and Arabic working environments, with real bilingual delivery.",
      ar: "بيئات عمل بالإنجليزية والعربية مع تسليم ثنائي اللغة فعلي.",
    },
    {
      icon: CheckCircle2,
      en: "No invented job titles. What you are hired for is what you do.",
      ar: "لا مسميات وظيفية منمقة. ما تُعيَّن له هو ما تعمله.",
    },
  ];

  return (
    <>
      <PageHero
        eyebrow={tr("nav.careers")}
        title={locale === "ar" ? "اعمل على قرارات لها وزن." : "Work on decisions that carry weight."}
        lead={locale === "ar"
          ? "نوظف ببطء وبمعيار واضح. إن لم يكن هناك دور معلن الآن، نراجع الطلبات الاستباقية الجادة."
          : "We hire slowly and against a clear standard. If no role is listed right now, we still review serious speculative applications."}
        breadcrumb={[{ href: "/careers", label: tr("nav.careers") }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div>
            <SectionHeading
              eyebrow={locale === "ar" ? "الوظائف المتاحة" : "Open roles"}
              title={locale === "ar" ? "لا وظائف معلنة حالياً." : "No roles are listed at present."}
              body={locale === "ar"
                ? "بدلاً من نشر أدوار وهمية، نراجع الطلبات الاستباقية عند الحاجة. أرسل سيرتك وما تريد العمل عليه تحديداً."
                : "Rather than post placeholder roles, we review speculative applications when a need arises. Send your CV and be specific about the work you want to do."}
            />
            <div className="mt-8 grid gap-3">
              {points.map((p) => {
                const Icon = p.icon;
                return (
                  <div key={p.en} className="flex items-start gap-3 rounded-md border border-line p-4">
                    <Icon size={17} className="mt-0.5 shrink-0 text-teal-dark" aria-hidden="true" />
                    <p className="text-[0.83rem] leading-relaxed text-muted">{locale === "ar" ? p.ar : p.en}</p>
                  </div>
                );
              })}
            </div>

            <div className="mt-8 rounded-md border border-line bg-ivory p-5">
              <p className="text-[0.8rem] font-bold text-navy">{locale === "ar" ? "الأقسام" : "Divisions"}</p>
              <ul className="mt-3 flex flex-wrap gap-1.5">
                {divisions.map((d) => (
                  <li key={d.slug}>
                    <Link href={`/divisions/${d.slug}`} className="inline-flex items-center gap-1.5 rounded border border-line bg-white px-2 py-1 text-[0.72rem] font-medium text-muted hover:text-teal-dark">
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.accent }} aria-hidden="true" />
                      {d.short[locale]}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="rounded-lg border border-line bg-white p-6 md:p-8">
            <h2 className="text-xl font-bold text-navy">{locale === "ar" ? "طلب استباقي" : "Speculative application"}</h2>
            <p className="mt-2 text-[0.85rem] leading-relaxed text-muted">
              {locale === "ar"
                ? "أخبرنا بالدور الذي تبحث عنه وما قدمته من قبل. أرفق سيرتك الذاتية بصيغة PDF أو DOCX (بحد أقصى ٥ ميجابايت)."
                : "Tell us the role you are looking for and what you have delivered before. Attach your CV as PDF or DOCX (max 5 MB)."}
            </p>
            <div className="mt-6">
              <EnquiryForm locale={locale} variant="contact" defaultKind="careers" compact />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
