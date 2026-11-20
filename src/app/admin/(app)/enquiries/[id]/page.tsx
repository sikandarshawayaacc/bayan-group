import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, Paperclip } from "lucide-react";
import { all, one } from "@/lib/db";
import { requireStaff, staffUsers } from "@/lib/auth";
import { updateEnquiry } from "@/app/actions/admin";
import { ENQUIRY_STATUSES } from "@/lib/admin-query";
import { DataTable, Panel, STATUS_TONE, Td, Th, formatDate } from "@/components/admin/AdminUI";
import { EnquiryNoteForm } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

type Enquiry = {
  id: number; ref: string; kind: string; division: string | null; name: string; company: string | null;
  email: string; phone: string | null; country: string | null; subject: string | null; message: string;
  metadata: string | null; status: string; priority: string; assigned_to: number | null; source: string;
  locale: string; created_at: string; updated_at: string; product: string | null;
};
type Note = { id: number; body: string; created_at: string; author: string | null };
type Activity = { action: string; detail: string | null; created_at: string; actor: string | null };

export default async function EnquiryDetail({ params }: { params: Promise<{ id: string }> }) {
  const user = await requireStaff();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const enquiry = one<Enquiry>(
    `SELECT e.*, p.name AS product FROM enquiries e LEFT JOIN products p ON p.id = e.product_id WHERE e.id = ?`,
    [id],
  );
  if (!enquiry) notFound();
  if (user.role === "division_manager" && user.division && enquiry.division !== user.division) notFound();

  let meta: Record<string, string> = {};
  try {
    meta = enquiry.metadata ? JSON.parse(enquiry.metadata) : {};
  } catch {
    meta = {};
  }

  const notes = all<Note>(
    "SELECT n.id,n.body,n.created_at,u.name AS author FROM enquiry_notes n LEFT JOIN users u ON u.id = n.user_id WHERE n.enquiry_id = ? ORDER BY n.created_at DESC",
    [id],
  );
  const activity = all<Activity>(
    `SELECT a.action,a.detail,a.created_at,u.name AS actor FROM audit_log a LEFT JOIN users u ON u.id = a.user_id
     WHERE a.entity = 'enquiry' AND a.entity_id = ? ORDER BY a.created_at DESC LIMIT 25`,
    [String(id)],
  );
  const staff = staffUsers();

  const metaEntries = Object.entries(meta).filter(([key]) => !["attachment", "attachmentName"].includes(key));

  return (
    <>
      <div className="mb-5">
        <Link href="/admin/enquiries" className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-navy">
          <ArrowLeft size={14} aria-hidden="true" /> All enquiries
        </Link>
      </div>

      <header className="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-[1.45rem] font-bold text-navy">{enquiry.subject ?? "General enquiry"}</h1>
          <p className="mt-1 text-[0.8rem] text-muted">
            <span dir="ltr" className="font-mono">{enquiry.ref}</span> · {enquiry.kind} · {formatDate(enquiry.created_at, true)} · {enquiry.locale.toUpperCase()} · via {enquiry.source}
          </p>
        </div>
        <span className={`badge ${STATUS_TONE[enquiry.status] ?? "bg-light text-muted"}`}>{enquiry.status.replace(/_/g, " ")}</span>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.55fr_1fr]">
        <div className="space-y-6">
          <Panel title="Message">
            <p className="whitespace-pre-line text-[0.86rem] leading-relaxed text-navy/85">{enquiry.message}</p>

            {meta.attachment && (
              <a href={`/api/admin/attachments/${meta.attachment}`} className="mt-5 inline-flex items-center gap-2 rounded border border-line px-3 py-2 text-[0.78rem] font-semibold text-navy hover:border-teal/50">
                <Paperclip size={14} aria-hidden="true" />
                {meta.attachmentName ?? "Attachment"}
              </a>
            )}

            {metaEntries.length > 0 && (
              <dl className="mt-6 grid gap-2 border-t border-line pt-4 text-[0.78rem] sm:grid-cols-2">
                {metaEntries.map(([key, value]) => (
                  <div key={key}>
                    <dt className="text-[0.68rem] font-semibold uppercase tracking-[0.1em] text-muted">{key.replace(/_/g, " ")}</dt>
                    <dd className="text-navy">{value}</dd>
                  </div>
                ))}
              </dl>
            )}
          </Panel>

          <Panel title={`Internal notes (${notes.length})`}>
            <EnquiryNoteForm id={enquiry.id} />
            {notes.length > 0 && (
              <ul className="mt-6 space-y-4 border-t border-line pt-4">
                {notes.map((n) => (
                  <li key={n.id}>
                    <p className="whitespace-pre-line text-[0.82rem] leading-relaxed text-navy/85">{n.body}</p>
                    <p className="mt-1 text-[0.68rem] text-muted">{n.author ?? "System"} · {formatDate(n.created_at, true)}</p>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          <Panel title="Activity" className="[&>div]:p-0">
            {activity.length === 0 ? (
              <p className="p-5 text-[0.8rem] text-muted">No recorded activity yet. Status changes, assignments and notes appear here.</p>
            ) : (
              <DataTable head={<tr><Th>When</Th><Th>Who</Th><Th>Action</Th><Th>Detail</Th></tr>}>
                {activity.map((a, i) => (
                  <tr key={`${a.created_at}-${i}`}>
                    <Td className="whitespace-nowrap text-[0.72rem] text-muted">{formatDate(a.created_at, true)}</Td>
                    <Td className="text-[0.75rem] text-navy">{a.actor ?? "System"}</Td>
                    <Td className="text-[0.72rem] text-muted">{a.action.replace(/_/g, " ")}</Td>
                    <Td className="text-[0.72rem] text-muted">{a.detail ?? "—"}</Td>
                  </tr>
                ))}
              </DataTable>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Contact">
            <dl className="space-y-3 text-[0.82rem]">
              <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Name</dt><dd className="font-medium text-navy">{enquiry.name}</dd></div>
              <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Email</dt><dd><a href={`mailto:${enquiry.email}`} className="text-teal-dark hover:underline" dir="ltr">{enquiry.email}</a></dd></div>
              {enquiry.phone && <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Phone</dt><dd><a href={`tel:${enquiry.phone}`} className="text-navy hover:underline" dir="ltr">{enquiry.phone}</a></dd></div>}
              {enquiry.company && <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Company</dt><dd className="text-navy">{enquiry.company}</dd></div>}
              {enquiry.country && <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Country</dt><dd className="text-navy">{enquiry.country}</dd></div>}
              <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Division</dt><dd className="text-navy">{enquiry.division ?? "General"}</dd></div>
              {enquiry.product && <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Product</dt><dd className="text-navy">{enquiry.product}</dd></div>}
            </dl>
          </Panel>

          <Panel title="Pipeline">
            <form key={enquiry.updated_at} action={updateEnquiry} className="space-y-4">
              <input type="hidden" name="id" value={enquiry.id} />
              <div className="field">
                <label className="label" htmlFor="status">Status</label>
                <select id="status" name="status" defaultValue={enquiry.status} className="input">
                  {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="priority">Priority</label>
                <select id="priority" name="priority" defaultValue={enquiry.priority} className="input">
                  {["low", "normal", "high"].map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>
              <div className="field">
                <label className="label" htmlFor="assigned_to">Assigned to</label>
                <select id="assigned_to" name="assigned_to" defaultValue={enquiry.assigned_to ?? ""} className="input">
                  <option value="">Unassigned</option>
                  {staff.map((s) => <option key={s.id} value={s.id}>{s.name} · {s.role.replace(/_/g, " ")}</option>)}
                </select>
              </div>
              <button type="submit" className="btn btn-primary btn-sm w-full">Update enquiry</button>
            </form>
            <p className="mt-3 text-[0.68rem] text-muted">Last updated {formatDate(enquiry.updated_at, true)}.</p>
          </Panel>

          <Panel title="Reply to the client">
            <p className="text-[0.78rem] leading-relaxed text-muted">
              Replies go to <span className="font-medium text-navy" dir="ltr">{enquiry.email}</span> from the configured sender. The acknowledgement email already confirmed receipt of <span className="font-mono" dir="ltr">{enquiry.ref}</span>.
            </p>
            <a href={`mailto:${enquiry.email}?subject=${encodeURIComponent(`Re: ${enquiry.ref} — ${enquiry.subject ?? "BAYAN GROUP"}`)}`} className="btn btn-ghost btn-sm mt-3 w-full">Compose email</a>
          </Panel>
        </div>
      </div>
    </>
  );
}
