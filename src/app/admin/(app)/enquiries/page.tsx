import Link from "next/link";
import { Download } from "lucide-react";
import { all, one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { enquiryFilters, ENQUIRY_STATUSES } from "@/lib/admin-query";
import { divisions } from "@/lib/content";
import { AdminEmpty, DataTable, PageHead, Pagination, STATUS_TONE, Td, Th, formatDate } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

type Row = {
  id: number; ref: string; name: string; company: string | null; email: string;
  division: string | null; subject: string | null; status: string; priority: string;
  created_at: string; assignee: string | null;
};

export default async function EnquiriesPage({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const user = await requireStaff();
  const params = await searchParams;
  const { filters, where, order, values } = enquiryFilters(params, user);

  const total = one<{ n: number }>(`SELECT COUNT(*) AS n FROM enquiries e ${where}`, values)?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / filters.perPage));
  const page = Math.min(filters.page, pages);

  const rows = all<Row>(
    `SELECT e.id,e.ref,e.name,e.company,e.email,e.division,e.subject,e.status,e.priority,e.created_at,u.name AS assignee
     FROM enquiries e LEFT JOIN users u ON u.id = e.assigned_to
     ${where} ORDER BY ${order} LIMIT ? OFFSET ?`,
    [...values, filters.perPage, (page - 1) * filters.perPage],
  );

  const exportQuery = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) {
    if (key !== "page" && key !== "perPage" && value) exportQuery.set(key, String(value));
  }

  return (
    <>
      <PageHead
        title="Leads & Enquiries"
        subtitle={`${total} record${total === 1 ? "" : "s"}${filters.division ? ` in ${filters.division}` : ""}`}
        action={
          <a href={`/api/admin/enquiries/export?${exportQuery.toString()}`} className="btn btn-ghost btn-sm">
            <Download size={14} aria-hidden="true" /> Export CSV
          </a>
        }
      />

      <form className="mb-5 grid gap-3 rounded-md border border-line bg-white p-4 md:grid-cols-[1.4fr_repeat(4,1fr)_auto]">
        <div className="field">
          <label className="label" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={filters.q} placeholder="Reference, name, email, company" className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={filters.status} className="input">
            <option value="">All</option>
            {ENQUIRY_STATUSES.map((s) => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="division">Division</label>
          <select id="division" name="division" defaultValue={filters.division} className="input" disabled={user.role === "division_manager"}>
            <option value="">All</option>
            {divisions.map((d) => <option key={d.slug} value={d.slug}>{d.name.en}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="from">From</label>
          <input id="from" name="from" type="date" defaultValue={filters.from} className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="to">To</label>
          <input id="to" name="to" type="date" defaultValue={filters.to} className="input" />
        </div>
        <div className="flex items-end gap-2">
          <div className="field flex-1">
            <label className="label" htmlFor="sort">Sort</label>
            <select id="sort" name="sort" defaultValue={filters.sort} className="input">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="priority">Priority</option>
            </select>
          </div>
          <button type="submit" className="btn btn-primary btn-sm">Filter</button>
        </div>
      </form>

      {rows.length === 0 ? (
        <AdminEmpty title="No enquiries match these filters" body="Clear the filters or widen the date range." />
      ) : (
        <DataTable head={<tr><Th>Reference</Th><Th>Contact</Th><Th>Division</Th><Th>Status</Th><Th>Priority</Th><Th>Owner</Th><Th>Received</Th></tr>}>
          {rows.map((r) => (
            <tr key={r.id} className="hover:bg-light/50">
              <Td>
                <Link href={`/admin/enquiries/${r.id}`} className="font-semibold text-teal-dark hover:underline" dir="ltr">{r.ref}</Link>
                <p className="text-[0.7rem] text-muted">{r.subject ?? "General enquiry"}</p>
              </Td>
              <Td>
                <p className="font-medium text-navy">{r.name}</p>
                <p className="text-[0.72rem] text-muted" dir="ltr">{r.email}</p>
                {r.company && <p className="text-[0.7rem] text-muted">{r.company}</p>}
              </Td>
              <Td className="text-muted">{r.division ?? "General"}</Td>
              <Td><span className={`badge ${STATUS_TONE[r.status] ?? "bg-light text-muted"}`}>{r.status.replace(/_/g, " ")}</span></Td>
              <Td className="text-[0.75rem] capitalize">
                <span className={r.priority === "high" ? "font-semibold text-error" : "text-muted"}>{r.priority}</span>
              </Td>
              <Td className="text-[0.75rem] text-muted">{r.assignee ?? "Unassigned"}</Td>
              <Td className="whitespace-nowrap text-[0.75rem] text-muted">{formatDate(r.created_at)}</Td>
            </tr>
          ))}
        </DataTable>
      )}

      <Pagination page={page} pages={pages} base="/admin/enquiries" params={{
        q: filters.q, status: filters.status, division: filters.division, from: filters.from, to: filters.to, sort: filters.sort,
      }} />
    </>
  );
}
