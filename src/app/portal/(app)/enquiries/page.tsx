import type { Metadata } from "next";
import Link from "next/link";
import { getLocale, t } from "@/lib/i18n";
import { all } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/ui";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "My Enquiries", robots: { index: false, follow: false } };

type Row = {
  id: number; ref: string; kind: string; division: string | null; subject: string | null;
  message: string; status: string; priority: string; created_at: string; updated_at: string;
  product: string | null;
};

const STATUS_TONE: Record<string, string> = {
  NEW: "bg-teal/10 text-teal-dark",
  REVIEWING: "bg-warning/12 text-[#a4772c]",
  CONTACTED: "bg-navy/8 text-navy",
  PROPOSAL_SENT: "bg-gold/15 text-[#8a7440]",
  APPROVED: "bg-success/10 text-success",
  IN_PROGRESS: "bg-success/10 text-success",
  COMPLETED: "bg-light text-muted",
  REJECTED: "bg-error/10 text-error",
  ARCHIVED: "bg-light text-muted",
};

export default async function EnquiriesPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);

  const rows = all<Row>(
    `SELECT e.id,e.ref,e.kind,e.division,e.subject,e.message,e.status,e.priority,e.created_at,e.updated_at,p.name AS product
     FROM enquiries e LEFT JOIN products p ON p.id = e.product_id
     WHERE e.user_id = ? OR e.email = ? ORDER BY e.created_at DESC`,
    [user.id, user.email],
  );

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="text-[1.4rem] font-bold text-navy">{tr("portal.enquiries")}</h1>
          <p className="mt-1 text-[0.83rem] text-muted">
            {locale === "ar" ? "كل استفسار له رقم مرجعي وحالة محدثة." : "Each enquiry carries a reference number and a live status."}
          </p>
        </div>
        <Link href="/consultation" className="btn btn-primary btn-sm">{tr("nav.consultation")}</Link>
      </header>

      {rows.length === 0 ? (
        <EmptyState
          title={locale === "ar" ? "لا توجد استفسارات بعد." : "No enquiries yet."}
          body={locale === "ar" ? "أرسل طلباً من صفحة التواصل أو اطلب استشارة، وسيظهر هنا برقم مرجعي." : "Send a request from the contact page or request a consultation, and it will appear here with a reference number."}
        />
      ) : (
        <div className="space-y-3">
          {rows.map((r) => (
            <details key={r.id} className="group rounded-md border border-line bg-white">
              <summary className="flex cursor-pointer flex-wrap items-center justify-between gap-3 p-5 [&::-webkit-details-marker]:hidden">
                <div className="min-w-0">
                  <p className="truncate text-[0.9rem] font-semibold text-navy">{r.subject ?? r.product ?? r.ref}</p>
                  <p className="mt-1 text-[0.72rem] text-muted">
                    <span dir="ltr">{r.ref}</span> · {new Date(r.created_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB")}
                    {r.division ? ` · ${r.division}` : ""}
                  </p>
                </div>
                <span className={`badge ${STATUS_TONE[r.status] ?? "bg-light text-muted"}`}>{r.status.replace(/_/g, " ")}</span>
              </summary>
              <div className="border-t border-line px-5 py-4">
                <p className="whitespace-pre-line text-[0.84rem] leading-relaxed text-navy/80">{r.message}</p>
                <dl className="mt-4 grid gap-2 text-[0.72rem] text-muted sm:grid-cols-3">
                  <div><dt className="inline font-semibold">{locale === "ar" ? "النوع: " : "Type: "}</dt><dd className="inline">{r.kind}</dd></div>
                  <div><dt className="inline font-semibold">{locale === "ar" ? "الأولوية: " : "Priority: "}</dt><dd className="inline">{r.priority}</dd></div>
                  <div><dt className="inline font-semibold">{locale === "ar" ? "آخر تحديث: " : "Updated: "}</dt><dd className="inline">{new Date(r.updated_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB")}</dd></div>
                </dl>
                <p className="mt-4 text-[0.75rem] text-muted">
                  {locale === "ar" ? "للاستفسار عن هذه الحالة استخدم " : "To discuss this request use "}
                  <Link href="/portal/messages" className="font-semibold text-teal-dark hover:underline">{tr("portal.messages")}</Link>.
                </p>
              </div>
            </details>
          ))}
        </div>
      )}
    </div>
  );
}
