import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { divisions } from "@/lib/content";
import { getLocale, t } from "@/lib/i18n";
import { PageHero } from "@/components/ui";
import { DivisionIcon } from "@/components/DivisionIcon";
import { Reveal } from "@/components/Reveal";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "أقسامنا" : "Our Divisions",
    description: locale === "ar"
      ? "أربعة أقسام: التقنية والاستشارات والتجارة والاستثمار، بمعيار واحد للتوثيق والمراجعة."
      : "Four divisions — technology, advisory, trading and investments — under one standard of documentation and review.",
    alternates: { canonical: "/divisions" },
  };
}

export default async function DivisionsPage() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);

  return (
    <>
      <PageHero
        eyebrow={tr("nav.divisions")}
        title={locale === "ar" ? "أربعة أقسام. مجموعة واحدة مسؤولة." : "Four divisions. One accountable group."}
        lead={locale === "ar"
          ? "يمكنك التعامل مع قسم واحد أو عدة أقسام. يبقى النطاق والمسؤولية والتقارير واضحة في كل الحالات."
          : "Engage one division or several. Scope, ownership and reporting stay clear either way."}
        breadcrumb={[{ href: "/divisions", label: tr("nav.divisions") }]}
      />

      <section className="bg-white py-14 md:py-20">
        <div className="container-x space-y-6">
          {divisions.map((d, i) => (
            <Reveal key={d.slug} delay={i * 60}>
              <article className="grid gap-8 rounded-lg border border-line p-6 md:p-9 lg:grid-cols-[0.9fr_1.1fr]">
                <div>
                  <div className="flex items-center gap-3">
                    <span className="flex h-11 w-11 items-center justify-center rounded-md" style={{ background: `${d.accent}14`, color: d.accent }}>
                      <DivisionIcon slug={d.slug} size={21} />
                    </span>
                    <span className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-muted">{d.short[locale]}</span>
                  </div>
                  <h2 className="mt-5 text-2xl font-bold text-navy">{d.name[locale]}</h2>
                  <p className="mt-2 text-[0.9rem] font-medium text-teal-dark">{d.tagline[locale]}</p>
                  <p className="mt-4 text-[0.85rem] leading-relaxed text-muted">{d.intro[locale]}</p>
                  <Link href={`/divisions/${d.slug}`} className="btn btn-ghost btn-sm mt-6">
                    {tr("cta.explore")} <ArrowRight size={14} aria-hidden="true" />
                  </Link>
                </div>
                <div>
                  <h3 className="text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">{tr("section.services")}</h3>
                  <ul className="mt-3 grid gap-2 sm:grid-cols-2">
                    {d.services.map((s) => (
                      <li key={s.title.en} className="rounded border border-line bg-ivory/60 px-3 py-2 text-[0.78rem] font-medium text-navy">{s.title[locale]}</li>
                    ))}
                  </ul>
                  <h3 className="mt-6 text-[0.7rem] font-bold uppercase tracking-[0.14em] text-muted">{tr("section.capabilities")}</h3>
                  <ul className="mt-3 flex flex-wrap gap-1.5">
                    {d.capabilities.slice(0, 4).map((c) => (
                      <li key={c.en} className="rounded bg-light px-2 py-1 text-[0.7rem] text-muted">{c[locale]}</li>
                    ))}
                  </ul>
                </div>
              </article>
            </Reveal>
          ))}
        </div>
      </section>
    </>
  );
}
