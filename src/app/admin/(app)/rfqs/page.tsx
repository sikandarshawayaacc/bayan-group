import { Eye } from "lucide-react";
import { all } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { updateRfq } from "@/app/actions/admin";
import { AdminEmpty, DataTable, PageHead, STATUS_TONE, Td, Th, formatDate } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

type Rfq = {
  id: number; ref: string; name: string; company: string | null; email: string; phone: string | null;
  quantity: string | null; target_date: string | null; notes: string | null; status: string;
  created_at: string; product: string | null;
};

const STATUSES = ["NEW", "REVIEWING", "QUOTED", "WON", "LOST"];

export default async function RfqsPage({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  await requireStaff();
  const status = (await searchParams).status ?? "";
  const rows = all<Rfq>(
    `SELECT r.*,p.name AS product FROM rfqs r LEFT JOIN products p ON p.id = r.product_id
     ${STATUSES.includes(status) ? "WHERE r.status = ?" : ""} ORDER BY r.created_at DESC LIMIT 300`,
    STATUSES.includes(status) ? [status] : [],
  );

  return (
    <>
      <PageHead title="Requests for Quotation" subtitle={`${rows.length} RFQ${rows.length === 1 ? "" : "s"} · no payment is taken on the website`} />

      <form className="mb-5 flex items-end gap-3 rounded-md border border-line bg-white p-4">
        <div className="field max-w-[220px] flex-1">
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status} className="input">
            <option value="">All</option>
            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-sm">Filter</button>
      </form>

      {rows.length === 0 ? (
        <AdminEmpty title="No RFQs" body="Trading product pages submit quotations here." />
      ) : (
        <DataTable head={<tr><Th>Reference</Th><Th>Contact</Th><Th>Product</Th><Th>Quantity</Th><Th>Required by</Th><Th>Status</Th><Th>Received</Th></tr>}>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-light/50">
              <Td>
                <p className="font-mono text-[0.72rem] font-semibold text-navy" dir="ltr">{r.ref}</p>
                <p className="text-[0.68rem] text-muted">{formatDate(r.created_at)}</p>
              </Td>
              <Td>
                <p className="font-medium text-navy">{r.name}</p>
                <p className="text-[0.7rem] text-muted" dir="ltr">{r.email}</p>
                {r.company && <p className="text-[0.7rem] text-muted">{r.company}</p>}
                {r.phone && <p className="text-[0.7rem] text-muted" dir="ltr">{r.phone}</p>}
              </Td>
              <Td className="text-[0.75rem] text-muted">
                {r.product ?? "—"}
                {r.notes && (
                  <details className="mt-1">
                    <summary className="cursor-pointer text-[0.7rem] font-semibold text-teal-dark">Notes</summary>
                    <p className="mt-1 whitespace-pre-line text-[0.72rem] text-muted">{r.notes}</p>
                  </details>
                )}
              </Td>
              <Td className="text-[0.75rem] text-muted">{r.quantity ?? "—"}</Td>
              <Td className="text-[0.72rem] text-muted">{r.target_date ?? "—"}</Td>
              <Td>
                <span className={`badge ${STATUS_TONE[r.status] ?? "bg-light text-muted"}`}>{r.status}</span>
                <form action={updateRfq} className="mt-2 flex items-center gap-1">
                  <input type="hidden" name="id" value={r.id} />
                  <label className="sr-only" htmlFor={`status-${r.id}`}>Update status for {r.ref}</label>
                  <select id={`status-${r.id}`} name="status" defaultValue={r.status} className="rounded border border-line bg-white px-1.5 py-1 text-[0.7rem]">
                    {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                  </select>
                  <button type="submit" className="rounded border border-line px-2 py-1 text-[0.68rem] font-semibold text-navy hover:border-teal/50">Set</button>
                </form>
              </Td>
              <Td>
                <a href={`mailto:${r.email}?subject=${encodeURIComponent(`Re: ${r.ref}`)}`} className="inline-flex items-center gap-1 text-[0.72rem] font-semibold text-teal-dark hover:underline">
                  <Eye size={12} aria-hidden="true" /> Email
                </a>
              </Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
