import { all, one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { DataTable, PageHead, Pagination, Td, Th, formatDate } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

type Entry = { id: number; action: string; entity: string; entity_id: string | null; detail: string | null; ip: string | null; created_at: string; actor: string | null };

export default async function AuditPage({ searchParams }: { searchParams: Promise<{ page?: string; action?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const page = Math.max(1, Number(sp.page) || 1);
  const perPage = 40;
  const action = (sp.action ?? "").trim().slice(0, 40);
  const where = action ? "WHERE a.action LIKE ?" : "";
  const values = action ? [`%${action}%`] : [];

  const total = one<{ n: number }>(`SELECT COUNT(*) AS n FROM audit_log a ${where}`, values)?.n ?? 0;
  const pages = Math.max(1, Math.ceil(total / perPage));
  const rows = all<Entry>(
    `SELECT a.id,a.action,a.entity,a.entity_id,a.detail,a.ip,a.created_at,u.name AS actor
     FROM audit_log a LEFT JOIN users u ON u.id = a.user_id ${where} ORDER BY a.created_at DESC LIMIT ? OFFSET ?`,
    [...values, perPage, (page - 1) * perPage],
  );

  return (
    <>
      <PageHead title="Audit Log" subtitle={`${total} recorded event${total === 1 ? "" : "s"} · append-only record of staff and account activity`} />

      <form className="mb-5 flex items-end gap-3 rounded-md border border-line bg-white p-4">
        <div className="field max-w-[260px] flex-1">
          <label className="label" htmlFor="action">Action contains</label>
          <input id="action" name="action" defaultValue={action} placeholder="login, enquiry_update, settings_update" className="input" />
        </div>
        <button type="submit" className="btn btn-primary btn-sm">Filter</button>
      </form>

      <DataTable head={<tr><Th>When</Th><Th>User</Th><Th>Action</Th><Th>Entity</Th><Th>Detail</Th><Th>IP</Th></tr>}>
        {rows.map((r) => (
          <tr key={r.id}>
            <Td className="whitespace-nowrap text-[0.72rem] text-muted">{formatDate(r.created_at, true)}</Td>
            <Td className="text-[0.76rem] text-navy">{r.actor ?? "System"}</Td>
            <Td className="text-[0.72rem] font-medium text-navy">{r.action}</Td>
            <Td className="text-[0.72rem] text-muted">{r.entity}{r.entity_id ? ` #${r.entity_id}` : ""}</Td>
            <Td className="max-w-[280px] truncate text-[0.72rem] text-muted">{r.detail ?? "—"}</Td>
            <Td className="text-[0.7rem] text-muted" dir="ltr">{r.ip ?? "—"}</Td>
          </tr>
        ))}
      </DataTable>

      <Pagination page={page} pages={pages} base="/admin/audit" params={{ action }} />
    </>
  );
}
