import Link from "next/link";
import type { ReactNode } from "react";

export function SectionHeading({
  eyebrow,
  title,
  body,
  light = false,
  align = "start",
  action,
}: {
  eyebrow?: string;
  title: string;
  body?: string;
  light?: boolean;
  align?: "start" | "center";
  action?: ReactNode;
}) {
  return (
    <div className={`flex flex-col gap-5 ${align === "center" ? "items-center text-center" : "md:flex-row md:items-end md:justify-between"}`}>
      <div className={`max-w-2xl ${align === "center" ? "mx-auto" : ""}`}>
        {eyebrow && <p className={`eyebrow ${light ? "eyebrow-light" : ""}`}>{eyebrow}</p>}
        <h2 className={`mt-3 text-[var(--text-section)] font-bold ${light ? "text-white" : "text-navy"}`}>{title}</h2>
        {body && <p className={`mt-4 text-[var(--text-body)] leading-relaxed ${light ? "text-white/65" : "text-muted"}`}>{body}</p>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

export function PageHero({
  eyebrow,
  title,
  lead,
  breadcrumb,
  children,
  tone = "navy",
}: {
  eyebrow?: string;
  title: string;
  lead?: string;
  breadcrumb?: { href: string; label: string }[];
  children?: ReactNode;
  tone?: "navy" | "light";
}) {
  const light = tone === "light";
  return (
    <section className={light ? "border-b border-line bg-light" : "relative overflow-hidden bg-navy text-white"}>
      {!light && <div className="absolute inset-0 grid-lines opacity-40" aria-hidden="true" />}
      <div className="container-x relative py-14 md:py-20">
        {breadcrumb && (
          <nav aria-label="Breadcrumb" className={`mb-6 flex flex-wrap items-center gap-1.5 text-[0.72rem] ${light ? "text-muted" : "text-white/50"}`}>
            <Link href="/" className="hover:underline">{light ? "Home" : "Home"}</Link>
            {breadcrumb.map((b) => (
              <span key={b.href} className="flex items-center gap-1.5">
                <span aria-hidden="true">/</span>
                <Link href={b.href} className="hover:underline">{b.label}</Link>
              </span>
            ))}
          </nav>
        )}
        {eyebrow && <p className={`eyebrow ${light ? "" : "eyebrow-light"}`}>{eyebrow}</p>}
        <h1 className={`mt-3 max-w-4xl text-[clamp(2rem,4.2vw,3.6rem)] font-bold ${light ? "text-navy" : "text-white"}`}>{title}</h1>
        {lead && <p className={`mt-5 max-w-2xl text-[var(--text-body)] leading-relaxed ${light ? "text-muted" : "text-white/65"}`}>{lead}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
    </section>
  );
}

export function EmptyState({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-light/50 px-6 py-12 text-center">
      <p className="text-sm font-semibold text-navy">{title}</p>
      {body && <p className="mx-auto mt-2 max-w-md text-[0.82rem] text-muted">{body}</p>}
    </div>
  );
}

export function Badge({ children, tone = "neutral" }: { children: ReactNode; tone?: "neutral" | "success" | "warning" | "error" | "teal" }) {
  const tones = {
    neutral: "bg-light text-muted",
    success: "bg-[#21866b]/10 text-[#21866b]",
    warning: "bg-[#ca9845]/12 text-[#a4772c]",
    error: "bg-[#c65c58]/10 text-[#b04a46]",
    teal: "bg-teal/10 text-teal-dark",
  };
  return <span className={`badge ${tones[tone]}`}>{children}</span>;
}
