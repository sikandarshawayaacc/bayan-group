import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, FolderKanban, Inbox, MessageSquare } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { all, one } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Overview", robots: { index: false, follow: false } };

type Enquiry = { ref: string; subject: string | null; division: string | null; status: string; created_at: string };
type Project = { ref: string; title: string; division: string; status: string; progress: number; due_date: string | null };

const date = (value: string, locale: string) =>
  new Date(value).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB", { day: "numeric", month: "short", year: "numeric" });

export default async function PortalOverview() {
  const user = await requireUser();
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);

  const enquiries = one<{ n: number }>("SELECT COUNT(*) AS n FROM enquiries WHERE user_id = ? OR email = ?", [user.id, user.email])?.n ?? 0;
  const projects = one<{ n: number }>("SELECT COUNT(*) AS n FROM projects WHERE client_id = ?", [user.id])?.n ?? 0;
  const documents = one<{ n: number }>("SELECT COUNT(*) AS n FROM documents WHERE client_id = ?", [user.id])?.n ?? 0;
  const unread = one<{ n: number }>("SELECT COUNT(*) AS n FROM messages WHERE client_id = ? AND sender_id != ? AND read_at IS NULL", [user.id, user.id])?.n ?? 0;

  const recentEnquiries = all<Enquiry>(
    "SELECT ref,subject,division,status,created_at FROM enquiries WHERE user_id = ? OR email = ? ORDER BY created_at DESC LIMIT 4",
    [user.id, user.email],
  );
  const activeProjects = all<Project>(
    "SELECT ref,title,division,status,progress,due_date FROM projects WHERE client_id = ? ORDER BY created_at DESC LIMIT 3",
    [user.id],
  );

  const stats = [
    { href: "/portal/enquiries", label: tr("portal.enquiries"), value: enquiries, icon: Inbox },
    { href: "/portal/projects", label: tr("portal.projects"), value: projects, icon: FolderKanban },
    { href: "/portal/documents", label: tr("portal.documents"), value: documents, icon: FileText },
    { href: "/portal/messages", label: tr("portal.messages"), value: unread, icon: MessageSquare, note: locale === "ar" ? "غير مقروءة" : "unread" },
  ];

  return (
    <div className="space-y-8">
      <div className="rounded-md border border-line bg-white p-6">
        <p className="eyebrow">{tr("portal.title")}</p>
        <h1 className="mt-2 text-[1.5rem] font-bold text-navy">
          {locale === "ar" ? `مرحباً، ${user.name.split(" ")[0]}.` : `Welcome, ${user.name.split(" ")[0]}.`}
        </h1>
        <p className="mt-2 max-w-2xl text-[0.85rem] leading-relaxed text-muted">
          {locale === "ar"
            ? "هذه مساحة عملك مع المجموعة: الاستفسارات والمشاريع والمستندات والرسائل."
            : "This is your workspace with the group: enquiries, projects, documents and messages."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((s) => {
          const Icon = s.icon;
          return (
            <Link key={s.href} href={s.href} className="card card-hover p-5">
              <Icon size={18} className="text-teal-dark" aria-hidden="true" />
              <p className="mt-3 text-[1.7rem] font-bold leading-none text-navy">{s.value}</p>
              <p className="mt-1.5 text-[0.78rem] text-muted">
                {s.label}
                {s.note && s.value > 0 ? ` · ${s.note}` : ""}
              </p>
            </Link>
          );
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-md border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.95rem] font-bold text-navy">{tr("portal.enquiries")}</h2>
            <Link href="/portal/enquiries" className="text-[0.75rem] font-semibold text-teal-dark hover:underline">{tr("cta.all")}</Link>
          </div>
          <div className="mt-4 space-y-3">
            {recentEnquiries.length === 0 ? (
              <EmptyState title={locale === "ar" ? "لا توجد استفسارات بعد." : "No enquiries yet."} body={locale === "ar" ? "أرسل استفساراً من الموقع وسيظهر هنا." : "Send an enquiry from the website and it will appear here."} />
            ) : (
              recentEnquiries.map((e) => (
                <div key={e.ref} className="flex items-start justify-between gap-3 border-b border-line pb-3 last:border-0 last:pb-0">
                  <div>
                    <p className="text-[0.83rem] font-semibold text-navy">{e.subject ?? e.ref}</p>
                    <p className="mt-0.5 text-[0.72rem] text-muted"><span dir="ltr">{e.ref}</span> · {date(e.created_at, locale)}</p>
                  </div>
                  <span className="badge bg-light text-muted">{e.status.replace(/_/g, " ")}</span>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="rounded-md border border-line bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-[0.95rem] font-bold text-navy">{tr("portal.projects")}</h2>
            <Link href="/portal/projects" className="text-[0.75rem] font-semibold text-teal-dark hover:underline">{tr("cta.all")}</Link>
          </div>
          <div className="mt-4 space-y-4">
            {activeProjects.length === 0 ? (
              <EmptyState title={locale === "ar" ? "لا مشاريع نشطة." : "No active projects."} body={locale === "ar" ? "عند بدء العمل سيظهر تقدم المشروع هنا." : "Once work begins, project progress appears here."} />
            ) : (
              activeProjects.map((p) => (
                <div key={p.ref}>
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-[0.83rem] font-semibold text-navy">{p.title}</p>
                    <span className="text-[0.72rem] text-muted">{p.progress}%</span>
                  </div>
                  <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-light" role="progressbar" aria-valuenow={p.progress} aria-valuemin={0} aria-valuemax={100} aria-label={p.title}>
                    <div className="h-full rounded-full bg-teal" style={{ width: `${p.progress}%` }} />
                  </div>
                  <p className="mt-1.5 text-[0.72rem] text-muted">
                    <span dir="ltr">{p.ref}</span> · {p.status.replace(/_/g, " ")}
                    {p.due_date ? ` · ${date(p.due_date, locale)}` : ""}
                  </p>
                </div>
              ))
            )}
          </div>
        </section>
      </div>

      <Link href="/consultation" className="flex items-center justify-between gap-4 rounded-md bg-navy p-6 text-white">
        <div>
          <p className="text-[0.92rem] font-bold">{locale === "ar" ? "تحتاج إلى قرار جديد؟" : "A new decision to make?"}</p>
          <p className="mt-1 text-[0.8rem] text-white/60">{locale === "ar" ? "اطلب استشارة وسيُضاف الطلب إلى حسابك." : "Request a consultation and it will be attached to your account."}</p>
        </div>
        <ArrowRight size={18} className="shrink-0 text-teal rtl:rotate-180" aria-hidden="true" />
      </Link>
    </div>
  );
}
