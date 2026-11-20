import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Eye, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { all, getSettings } from "@/lib/db";
import { divisions, processSteps, values } from "@/lib/content";
import { PageHero, SectionHeading } from "@/components/ui";
import { Reveal } from "@/components/Reveal";
import { DivisionIcon } from "@/components/DivisionIcon";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "عن المجموعة" : "About",
    description: locale === "ar"
      ? "مجموعة بيان: مجموعة قطرية متعددة التخصصات تجمع التقنية والاستشارات والتجارة والاستثمار تحت معيار واحد للتوثيق والمراجعة."
      : "BAYAN GROUP is a Qatar-based multi-disciplinary group bringing technology, advisory, trading and investment capability under one standard of documentation and review.",
    alternates: { canonical: "/about" },
  };
}

const valueIcons = { eye: Eye, brain: Brain, shield: ShieldCheck, target: Target, trending: TrendingUp } as const;
type Testimonial = { id: number; quote_en: string; quote_ar: string | null; author: string; role: string | null; company: string | null };

export default async function AboutPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const s = getSettings();
  const testimonials = all<Testimonial>("SELECT id,quote_en,quote_ar,author,role,company FROM testimonials WHERE active = 1 ORDER BY sort LIMIT 4");

  return (
    <>
      <PageHero
        eyebrow={tr("nav.about")}
        title={locale === "ar" ? "بيان تعني الوضوح." : "BAYAN means clarity."}
        lead={locale === "ar"
          ? "مجموعة قطرية متعددة التخصصات. نبني قرارات أفضل بالتقنية والاستشارات والتجارة والاستثمار، تحت معيار واحد للتوثيق والمراجعة."
          : "A Qatar-based multi-disciplinary group. We improve decisions through technology, advisory, trading and investment capability — under one standard of documentation and review."}
        breadcrumb={[{ href: "/about", label: tr("nav.about") }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="container-x grid gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="eyebrow">{locale === "ar" ? "لماذا وُجدنا" : "Why we exist"}</p>
            <h2 className="mt-4 text-[var(--text-section)] font-bold text-navy">
              {locale === "ar" ? "أصعب جزء في القرار ليس البيانات." : "The hardest part of a decision is rarely the data."}
            </h2>
          </Reveal>
          <Reveal delay={80}>
            <div className="space-y-4 text-[var(--text-body)] leading-relaxed text-muted">
              <p>
                {locale === "ar"
                  ? "معظم المؤسسات لا تعاني نقص المعلومات، بل صعوبة معرفة أي المعلومات تهم، وأي الافتراضات هشة، وما الخطوة التالية. بنينا المجموعة حول هذه الملاحظة."
                  : "Most organisations do not suffer from a shortage of information. They struggle to know which facts matter, which assumptions are fragile, and what to do next. We built the group around that observation."}
              </p>
              <p>
                {locale === "ar"
                  ? "يعمل كل قسم في تخصصه — التقنية والاستشارات والتجارة والاستثمار — لكنه يلتزم بنفس المعيار: نطاق مكتوب، افتراضات معلنة، ملكية واضحة، وتسليم يمكنك تشغيله دوننا."
                  : "Each division works in its own discipline — technology, advisory, trading and investments — but commits to the same standard: written scope, stated assumptions, named ownership, and a handover you can run without us."}
              </p>
              <p>
                {locale === "ar"
                  ? "لا نختلق مؤهلات أو تراخيص أو نتائج. تُدار بيانات الشركة والترخيص والعنوان من لوحة الإدارة وتُنشر كما هي معتمدة."
                  : "We do not invent credentials, licences or outcomes. Company registration, licence and address details are maintained by the administrator and published only as approved."}
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="border-y border-line bg-ivory py-14 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow={tr("nav.divisions")} title={tr("home.divisions.title")} body={tr("home.divisions.body")} />
          <div className="mt-10 grid gap-4 md:grid-cols-2">
            {divisions.map((d, i) => (
              <Reveal key={d.slug} delay={i * 60}>
                <Link href={`/divisions/${d.slug}`} className="card card-hover group flex h-full gap-4 p-6">
                  <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-md" style={{ background: `${d.accent}14`, color: d.accent }}>
                    <DivisionIcon slug={d.slug} size={20} />
                  </span>
                  <span>
                    <span className="block text-[0.98rem] font-bold text-navy group-hover:text-teal-dark">{d.name[locale]}</span>
                    <span className="mt-1 block text-[0.82rem] leading-relaxed text-muted">{d.tagline[locale]}</span>
                  </span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-navy py-14 text-white md:py-20">
        <div className="container-x">
          <SectionHeading light eyebrow={locale === "ar" ? "مبادئنا" : "Principles"} title={tr("home.why.title")} body={tr("home.why.body")} />
          <div className="mt-10 grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((v) => {
              const Icon = valueIcons[v.icon];
              return (
                <div key={v.key} className="bg-navy p-6">
                  <Icon size={20} className="text-teal" aria-hidden="true" />
                  <h3 className="mt-4 text-[0.95rem] font-bold">{tr(`value.${v.key}`)}</h3>
                  <p className="mt-2 text-[0.78rem] leading-relaxed text-white/55">{tr(`value.${v.key}.body`)}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="bg-white py-14 md:py-20">
        <div className="container-x">
          <SectionHeading eyebrow={locale === "ar" ? "المنهج" : "Method"} title={tr("home.process.title")} body={tr("home.process.body")} />
          <div className="mt-10 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((n, i) => (
              <Reveal key={n} delay={i * 70}>
                <div className="relative border-t-2 border-line pt-6">
                  <span className="absolute -top-px start-0 h-[2px] w-10 bg-teal" aria-hidden="true" />
                  <span className="font-mono text-[0.72rem] font-bold tracking-[0.2em] text-gold">0{n}</span>
                  <h3 className="mt-3 text-lg font-bold text-navy">{tr(`step.${n}`)}</h3>
                  <p className="mt-2 text-[0.83rem] leading-relaxed text-muted">{tr(`step.${n}.body`)}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {testimonials.length > 0 && (
        <section className="border-y border-line bg-light py-14 md:py-20">
          <div className="container-x">
            <SectionHeading eyebrow={locale === "ar" ? "آراء" : "In their words"} title={locale === "ar" ? "ما يقوله العملاء" : "What clients say"} body={locale === "ar" ? "منشورة بإذن، ومجهولة الهوية حيث يلزم." : "Published with permission, anonymised where required."} />
            <div className="mt-10 grid gap-5 md:grid-cols-2">
              {testimonials.map((q) => (
                <blockquote key={q.id} className="card p-6">
                  <p className="text-[0.92rem] leading-relaxed text-navy">“{locale === "ar" && q.quote_ar ? q.quote_ar : q.quote_en}”</p>
                  <footer className="mt-4 text-[0.75rem] text-muted">
                    <span className="font-semibold text-navy">{q.author}</span>
                    {q.role ? ` · ${q.role}` : ""}{q.company ? ` · ${q.company}` : ""}
                  </footer>
                </blockquote>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="bg-white py-14 md:py-20">
        <div className="container-x flex flex-col items-start justify-between gap-6 rounded-lg border border-line bg-ivory p-8 md:flex-row md:items-center md:p-10">
          <div className="max-w-2xl">
            <h2 className="text-[clamp(1.5rem,2.4vw,2.1rem)] font-bold text-navy">
              {locale === "ar" ? "تحدث مع المجموعة، لا مع قسم واحد فقط." : "Talk to the group, not just one division."}
            </h2>
            <p className="mt-2 text-[0.88rem] leading-relaxed text-muted">
              {locale === "ar" ? s.address_ar : s.address_en} · {s.email}
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Link href="/contact" className="btn btn-dark">{tr("nav.contact")} <ArrowRight size={15} aria-hidden="true" /></Link>
            <Link href="/consultation" className="btn btn-ghost">{tr("nav.consultation")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
