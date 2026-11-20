import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { all } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Projects", robots: { index: false, follow: false } };

type Project = {
  id: number; ref: string; title: string; description: string | null; division: string;
  status: string; progress: number; start_date: string | null; due_date: string | null;
};

const fmt = (value: string | null, locale: string) =>
  value ? new Date(value).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB", { day: "numeric", month: "short", year: "numeric" }) : "—";

export default async function ProjectsPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const projects = all<Project>(
    "SELECT id,ref,title,description,division,status,progress,start_date,due_date FROM projects WHERE client_id = ? ORDER BY created_at DESC",
    [user.id],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[1.4rem] font-bold text-navy">{locale === "ar" ? "مشاريعي" : "My Projects"}</h1>
        <p className="mt-1 text-[0.83rem] text-muted">
          {locale === "ar" ? "حالة كل مشروع وتقدمه وتواريخه." : "Status, progress and dates for each engagement."}
        </p>
      </header>

      {projects.length === 0 ? (
        <EmptyState
          title={locale === "ar" ? "لا مشاريع بعد." : "No projects yet."}
          body={locale === "ar" ? "عند اعتماد العرض وتحويله إلى مشروع سيظهر هنا مع نسبة التقدم." : "Once a proposal is approved and becomes a project, it appears here with progress."}
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {projects.map((p) => (
            <article key={p.id} className="rounded-md border border-line bg-white p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-[0.95rem] font-bold text-navy">{p.title}</p>
                  <p className="mt-1 text-[0.72rem] text-muted"><span dir="ltr">{p.ref}</span> · {p.division}</p>
                </div>
                <span className="badge bg-light text-muted">{p.status.replace(/_/g, " ")}</span>
              </div>
              {p.description && <p className="mt-3 text-[0.82rem] leading-relaxed text-muted">{p.description}</p>}
              <div className="mt-4">
                <div className="flex items-center justify-between text-[0.72rem] text-muted">
                  <span>{locale === "ar" ? "التقدم" : "Progress"}</span>
                  <span>{p.progress}%</span>
                </div>
                <div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-light" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={p.title}>
                  <div className="h-full rounded-full bg-teal" style={{ width: `${p.progress}%` }} />
                </div>
              </div>
              <dl className="mt-4 grid grid-cols-2 gap-2 text-[0.72rem] text-muted">
                <div><dt>{locale === "ar" ? "البداية" : "Start"}</dt><dd className="text-navy">{fmt(p.start_date, locale)}</dd></div>
                <div><dt>{locale === "ar" ? "التسليم" : "Due"}</dt><dd className="text-navy">{fmt(p.due_date, locale)}</dd></div>
              </dl>
            </article>
          ))}
        </div>
      )}
    </div>
  );
}
