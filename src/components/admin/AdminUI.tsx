import Link from "next/link";
import type { ReactNode } from "react";

export function PageHead({ title, subtitle, action }: { title: string; subtitle?: string; action?: ReactNode }) {
  return (
    <header className="mb-6 flex flex-wrap items-end justify-between gap-3">
      <div>
        <h1 className="text-[1.45rem] font-bold text-navy">{title}</h1>
        {subtitle && <p className="mt-1 text-[0.83rem] text-muted">{subtitle}</p>}
      </div>
      {action}
    </header>
  );
}

export function StatCard({ label, value, note, href }: { label: string; value: number | string; note?: string; href?: string }) {
  const body = (
    <>
      <p className="text-[0.7rem] font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-2 text-[1.6rem] font-bold leading-none text-navy">{value}</p>
      {note && <p className="mt-1.5 text-[0.72rem] text-muted">{note}</p>}
    </>
  );
  return href ? (
    <Link href={href} className="block rounded-md border border-line bg-white p-5 transition-colors hover:border-teal/50">{body}</Link>
  ) : (
    <div className="rounded-md border border-line bg-white p-5">{body}</div>
  );
}

export function Panel({ title, action, children, className = "" }: { title?: string; action?: ReactNode; children: ReactNode; className?: string }) {
  return (
    <section className={`rounded-md border border-line bg-white ${className}`}>
      {(title || action) && (
        <div className="flex items-center justify-between gap-3 border-b border-line px-5 py-3">
          {title && <h2 className="text-[0.9rem] font-bold text-navy">{title}</h2>}
          {action}
        </div>
      )}
      <div className="p-5">{children}</div>
    </section>
  );
}

export function Pagination({ page, pages, base, params = {} }: {
  page: number;
  pages: number;
  base: string;
  params?: Record<string, string>;
}) {
  if (pages <= 1) return null;
  const href = (n: number) => {
    const query = new URLSearchParams({ ...params, page: String(n) });
    return `${base}?${query.toString()}`;
  };
  return (
    <nav aria-label="Pagination" className="mt-4 flex items-center justify-between gap-3 text-[0.78rem]">
      <span className="text-muted">Page {page} of {pages}</span>
      <div className="flex gap-2">
        {page > 1 && <Link href={href(page - 1)} className="rounded border border-line px-3 py-1.5 font-semibold text-navy hover:border-navy/30">Previous</Link>}
        {page < pages && <Link href={href(page + 1)} className="rounded border border-line px-3 py-1.5 font-semibold text-navy hover:border-navy/30">Next</Link>}
      </div>
    </nav>
  );
}

export function Th({ children, className = "" }: { children?: ReactNode; className?: string }) {
  return <th scope="col" className={`px-4 py-2.5 text-start text-[0.68rem] font-semibold uppercase tracking-[0.08em] text-muted ${className}`}>{children}</th>;
}

export function Td({ children, className = "", dir }: { children: ReactNode; className?: string; dir?: "ltr" | "rtl" }) {
  return <td dir={dir} className={`px-4 py-3 align-top ${className}`}>{children}</td>;
}

export function DataTable({ head, children }: { head: ReactNode; children: ReactNode }) {
  return (
    <div className="overflow-x-auto rounded-md border border-line bg-white">
      <table className="w-full min-w-[640px] text-[0.83rem]">
        <thead className="bg-light">{head}</thead>
        <tbody className="divide-y divide-line">{children}</tbody>
      </table>
    </div>
  );
}

export function AdminEmpty({ title, body }: { title: string; body?: string }) {
  return (
    <div className="rounded-md border border-dashed border-line bg-white px-6 py-10 text-center">
      <p className="text-[0.9rem] font-semibold text-navy">{title}</p>
      {body && <p className="mx-auto mt-1.5 max-w-md text-[0.8rem] text-muted">{body}</p>}
    </div>
  );
}

export function formatDate(value: string | null, withTime = false) {
  if (!value) return "—";
  return new Date(value).toLocaleString("en-GB", withTime
    ? { day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" }
    : { day: "2-digit", month: "short", year: "numeric" });
}

export const STATUS_TONE: Record<string, string> = {
  NEW: "bg-teal/10 text-teal-dark",
  REVIEWING: "bg-warning/15 text-[#a4772c]",
  CONTACTED: "bg-navy/8 text-navy",
  PROPOSAL_SENT: "bg-gold/15 text-[#8a7440]",
  APPROVED: "bg-success/10 text-success",
  IN_PROGRESS: "bg-success/10 text-success",
  COMPLETED: "bg-light text-muted",
  REJECTED: "bg-error/10 text-error",
  ARCHIVED: "bg-light text-muted",
  QUOTED: "bg-gold/15 text-[#8a7440]",
  WON: "bg-success/10 text-success",
  LOST: "bg-error/10 text-error",
  ON_HOLD: "bg-warning/15 text-[#a4772c]",
  published: "bg-success/10 text-success",
  draft: "bg-light text-muted",
};
