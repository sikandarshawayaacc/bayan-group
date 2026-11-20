import Link from "next/link";
import { ArrowRight, ArrowUpRight, Brain, Eye, ShieldCheck, Target, TrendingUp } from "lucide-react";
import { divisions, processSteps, values } from "@/lib/content";
import { getLocale, t } from "@/lib/i18n";
import { all } from "@/lib/db";
import { Reveal } from "@/components/Reveal";
import { DivisionIcon } from "@/components/DivisionIcon";
import { SectionHeading } from "@/components/ui";

export const dynamic = "force-dynamic";

const valueIcons = { eye: Eye, brain: Brain, shield: ShieldCheck, target: Target, trending: TrendingUp } as const;

type Article = { slug: string; category: string; title_en: string; title_ar: string | null; excerpt_en: string | null; excerpt_ar: string | null; published_at: string };
type CaseRow = { slug: string; division: string; client_label: string; title: string; summary: string };

export default async function HomePage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const articles = all<Article>("SELECT slug,category,title_en,title_ar,excerpt_en,excerpt_ar,published_at FROM articles WHERE status='published' ORDER BY published_at DESC LIMIT 3");
  const cases = all<CaseRow>("SELECT slug,division,client_label,title,summary FROM case_studies WHERE status='published' ORDER BY sort LIMIT 3");

  return (
    <>
      {/* Hero */}
      <section className="relative overflow-hidden bg-navy text-white">
        <div className="absolute inset-0 grid-lines opacity-50" aria-hidden="true" />
        <div className="absolute -end-24 -top-24 h-[520px] w-[520px] rounded-full bg-teal/10 blur-3xl" aria-hidden="true" />
        <div className="container-x relative grid items-center gap-14 py-16 md:py-24 lg:grid-cols-[1.05fr_0.95fr] lg:py-28">
          <div>
            <p className="eyebrow eyebrow-light">{tr("home.eyebrow")}</p>
            <h1 className="mt-5 max-w-[15ch] text-[var(--text-hero)] font-extrabold leading-[1.04] tracking-[-0.03em]">
              {tr("home.title")}
            </h1>
            <p className="mt-6 max-w-xl text-[var(--text-body)] leading-relaxed text-white/65">{tr("home.subtitle")}</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/consultation" className="btn btn-primary">
                {tr("nav.consultation")} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link href="/divisions" className="btn btn-outline">{tr("cta.explore")}</Link>
            </div>
            <dl className="mt-12 flex flex-wrap gap-x-10 gap-y-4 border-t border-white/10 pt-6 text-[0.72rem] uppercase tracking-[0.14em] text-white/40">
              <div><dt className="sr-only">Divisions</dt><dd>Four divisions</dd></div>
              <div><dt className="sr-only">Location</dt><dd>Doha · Qatar</dd></div>
              <div><dt className="sr-only">Languages</dt><dd>English · العربية</dd></div>
            </dl>
          </div>

          <div className="relative mx-auto aspect-square w-full max-w-[460px]" aria-hidden="true">
            <svg viewBox="0 0 400 400" className="h-full w-full">
              <defs>
                <linearGradient id="heroGlow" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#239A96" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#B69A63" stopOpacity="0.05" />
                </linearGradient>
              </defs>
              {/* Slowly rotating ring + label group */}
              <g className="hero-rotate">
                <circle cx="200" cy="200" r="176" fill="none" stroke="#ffffff14" />
                <circle cx="200" cy="200" r="132" fill="none" stroke="#ffffff1a" />
                <circle cx="200" cy="200" r="88" fill="none" stroke="#ffffff22" />
                <g stroke="#ffffff33" strokeWidth="1">
                  <path d="M200 24v64M200 312v64M24 200h60M316 200h60" />
                </g>
                <g fill="#8FD3CF">
                  <circle cx="200" cy="24" r="3" />
                  <circle cx="376" cy="200" r="3" />
                  <circle cx="200" cy="376" r="3" />
                  <circle cx="24" cy="200" r="3" />
                </g>
                <g fill="#ffffff" fontSize="9" letterSpacing="3" opacity="0.6" fontFamily="Manrope, sans-serif" textAnchor="middle">
                  <text x="200" y="62">TECHNOLOGY</text>
                  <text x="338" y="204">INVEST</text>
                  <text x="200" y="346">ADVISORY</text>
                  <text x="62" y="204">TRADING</text>
                </g>
              </g>
              {/* Static diamond layers */}
              <path d="M200 24 376 200 200 376 24 200Z" fill="url(#heroGlow)" stroke="#239A9666" />
              <path d="M200 84 316 200 200 316 84 200Z" fill="none" stroke="#ffffff2e" />
              <path d="M200 138 262 200 200 262 138 200Z" fill="#172B3A" stroke="#239A96" strokeWidth="1.5" />
              <path d="M200 172 228 200 200 228 172 200Z" fill="#B69A63" />
              {/* (travelling dot removed) */}
            </svg>
          </div>
        </div>
      </section>

      {/* Corporate intro */}
      <section className="border-b border-line bg-white">
        <div className="container-x grid gap-12 py-16 md:py-24 lg:grid-cols-[0.85fr_1.15fr]">
          <Reveal>
            <p className="eyebrow">{locale === "ar" ? "المجموعة" : "The group"}</p>
            <h2 className="mt-4 text-[var(--text-section)] font-bold text-navy">{tr("home.intro.title")}</h2>
          </Reveal>
          <Reveal delay={80}>
            <p className="text-[var(--text-body)] leading-relaxed text-muted">{tr("home.intro.body")}</p>
            <div className="mt-8 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {divisions.map((d) => (
                <Link key={d.slug} href={`/divisions/${d.slug}`} className="group flex flex-col gap-2 rounded-md border border-line p-3 transition-colors hover:border-teal/50 hover:bg-light/50">
                  <span className="h-1 w-6 rounded-full" style={{ background: d.accent }} aria-hidden="true" />
                  <span className="text-[0.78rem] font-bold text-navy group-hover:text-teal-dark">{d.short[locale]}</span>
                </Link>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Divisions */}
      <section className="bg-ivory py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow={tr("nav.divisions")} title={tr("home.divisions.title")} body={tr("home.divisions.body")}
            action={<Link href="/divisions" className="btn btn-ghost btn-sm">{tr("cta.all")} <ArrowRight size={14} aria-hidden="true" /></Link>} />
          <div className="mt-12 grid gap-5 md:grid-cols-2">
            {divisions.map((d, i) => (
              <Reveal key={d.slug} delay={i * 70}>
                <Link href={`/divisions/${d.slug}`} className="card card-hover group flex h-full flex-col p-7">
                  <div className="flex items-start justify-between">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md" style={{ background: `${d.accent}14`, color: d.accent }}>
                      <DivisionIcon slug={d.slug} size={21} />
                    </span>
                    <ArrowUpRight size={18} className="text-muted transition-transform group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-hover:text-teal-dark" aria-hidden="true" />
                  </div>
                  <h3 className="mt-6 text-xl font-bold text-navy">{d.name[locale]}</h3>
                  <p className="mt-2 text-[0.85rem] font-medium text-teal-dark">{d.tagline[locale]}</p>
                  <p className="mt-4 flex-1 text-[0.85rem] leading-relaxed text-muted">{d.intro[locale]}</p>
                  <ul className="mt-6 flex flex-wrap gap-1.5">
                    {d.services.slice(0, 3).map((s) => (
                      <li key={s.title.en} className="rounded border border-line bg-white px-2 py-1 text-[0.68rem] font-medium text-muted">{s.title[locale]}</li>
                    ))}
                  </ul>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Why BAYAN */}
      <section className="bg-navy py-16 text-white md:py-24">
        <div className="container-x">
          <SectionHeading light eyebrow={locale === "ar" ? "مبادئنا" : "Principles"} title={tr("home.why.title")} body={tr("home.why.body")} />
          <div className="mt-12 grid gap-px overflow-hidden rounded-md border border-white/10 bg-white/10 sm:grid-cols-2 lg:grid-cols-5">
            {values.map((v, i) => {
              const Icon = valueIcons[v.icon];
              return (
                <Reveal key={v.key} delay={i * 60} className="h-full">
                  <div className="flex h-full flex-col bg-navy p-6">
                    <Icon size={20} className="text-teal" aria-hidden="true" />
                    <h3 className="mt-5 text-[0.95rem] font-bold">{tr(`value.${v.key}`)}</h3>
                    <p className="mt-2 text-[0.78rem] leading-relaxed text-white/55">{tr(`value.${v.key}.body`)}</p>
                  </div>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* Process */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow={locale === "ar" ? "المنهج" : "Method"} title={tr("home.process.title")} body={tr("home.process.body")} />
          <div className="mt-12 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {processSteps.map((n, i) => (
              <Reveal key={n} delay={i * 80}>
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

      {/* Insights */}
      <section className="border-y border-line bg-ivory py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow={tr("nav.insights")} title={tr("home.insights.title")} body={tr("home.insights.body")}
            action={<Link href="/insights" className="btn btn-ghost btn-sm">{tr("cta.all")} <ArrowRight size={14} aria-hidden="true" /></Link>} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {articles.map((a, i) => (
              <Reveal key={a.slug} delay={i * 70}>
                <Link href={`/insights/${a.slug}`} className="card card-hover group flex h-full flex-col p-6">
                  <span className="badge bg-teal/10 text-teal-dark">{a.category}</span>
                  <h3 className="mt-4 text-[1.02rem] font-bold leading-snug text-navy group-hover:text-teal-dark">{locale === "ar" && a.title_ar ? a.title_ar : a.title_en}</h3>
                  <p className="mt-2 flex-1 text-[0.8rem] leading-relaxed text-muted">{locale === "ar" && a.excerpt_ar ? a.excerpt_ar : a.excerpt_en}</p>
                  <span className="mt-4 text-[0.7rem] font-medium text-muted">{new Date(a.published_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB", { year: "numeric", month: "short", day: "numeric" })}</span>
                </Link>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Case studies */}
      <section className="bg-white py-16 md:py-24">
        <div className="container-x">
          <SectionHeading eyebrow={locale === "ar" ? "أعمالنا" : "Work"} title={tr("home.cases.title")} body={tr("home.cases.body")}
            action={<Link href="/case-studies" className="btn btn-ghost btn-sm">{tr("cta.all")} <ArrowRight size={14} aria-hidden="true" /></Link>} />
          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {cases.map((c, i) => {
              const d = divisions.find((x) => x.slug === c.division);
              return (
                <Reveal key={c.slug} delay={i * 70}>
                  <Link href={`/case-studies/${c.slug}`} className="group block h-full rounded-md border border-line p-6 transition-colors hover:border-teal/50">
                    <div className="flex items-center justify-between text-[0.68rem] uppercase tracking-[0.12em] text-muted">
                      <span>{d?.short[locale] ?? c.division}</span>
                      <span>{c.client_label}</span>
                    </div>
                    <h3 className="mt-4 text-[1rem] font-bold text-navy group-hover:text-teal-dark">{c.title}</h3>
                    <p className="mt-2 line-clamp-3 text-[0.8rem] leading-relaxed text-muted">{c.summary}</p>
                    <span className="mt-4 inline-flex items-center gap-1 text-[0.75rem] font-semibold text-teal-dark">{tr("cta.learn")} <ArrowRight size={13} aria-hidden="true" /></span>
                  </Link>
                </Reveal>
              );
            })}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-light py-16 md:py-20">
        <div className="container-x flex flex-col items-start justify-between gap-8 rounded-lg border border-line bg-white p-8 md:flex-row md:items-center md:p-12">
          <div className="max-w-2xl">
            <p className="eyebrow">{tr("section.enquiry")}</p>
            <h2 className="mt-3 text-[clamp(1.6rem,2.6vw,2.3rem)] font-bold text-navy">
              {locale === "ar" ? "أخبرنا بالقرار الذي تواجهه." : "Tell us the decision you are facing."}
            </h2>
            <p className="mt-3 text-[0.9rem] leading-relaxed text-muted">
              {locale === "ar"
                ? "نرد خلال يوم عمل واحد برقم مرجعي ومتابعة واضحة، لا بعرض تجاري عام."
                : "We reply within one business day with a reference number and a clear next step — not a generic sales deck."}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <Link href="/contact" className="btn btn-dark">{tr("cta.talk")} <ArrowRight size={15} aria-hidden="true" /></Link>
            <Link href="/consultation" className="btn btn-ghost">{tr("nav.consultation")}</Link>
          </div>
        </div>
      </section>
    </>
  );
}
