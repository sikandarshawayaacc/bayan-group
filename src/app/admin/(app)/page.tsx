import Link from "next/link";
import { all, one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { divisions } from "@/lib/content";
import { AdminEmpty, DataTable, PageHead, Panel, StatCard, STATUS_TONE, Td, Th, formatDate } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

type Recent = { id: number; ref: string; name: string; subject: string | null; division: string | null; status: string; priority: string; created_at: string };

export default async function AdminOverview() {
  const user = await requireStaff();
  const scoped = user.role === "division_manager" && user.division ? user.division : null;
  const scope = scoped ?? null;
  const where = scope ? "WHERE division = ?" : "";
  const p = scope ? [scope] : [];

  const count = (sql: string, params: (string | number)[] = []) => one<{ n: number }>(sql, params)?.n ?? 0;

  const total = count(`SELECT COUNT(*) AS n FROM enquiries ${where}`, p);
  const open = count(`SELECT COUNT(*) AS n FROM enquiries ${scope ? `${where} AND` : "WHERE"} status NOT IN ('COMPLETED','REJECTED','ARCHIVED')`, p);
  const week = count(`SELECT COUNT(*) AS n FROM enquiries ${scope ? `${where} AND` : "WHERE"} created_at >= datetime('now','-7 days')`, p);
  const proposals = count(`SELECT COUNT(*) AS n FROM enquiries ${scope ? `${where} AND` : "WHERE"} status = 'PROPOSAL_SENT'`, p);
  const clients = count("SELECT COUNT(*) AS n FROM users WHERE role = 'client' AND active = 1");
  const projects = count(`SELECT COUNT(*) AS n FROM projects ${where ? "WHERE division = ? AND" : "WHERE"} status IN ('APPROVED','IN_PROGRESS')`, p);
  const rfqs = count("SELECT COUNT(*) AS n FROM rfqs WHERE status IN ('NEW','REVIEWING')");
  const published = count("SELECT COUNT(*) AS n FROM articles WHERE status = 'published'");

  const recent = all<Recent>(
    `SELECT id,ref,name,subject,division,status,priority,created_at FROM enquiries ${where} ORDER BY created_at DESC LIMIT 8`,
    p,
  );
  const byDivision = all<{ division: string | null; n: number }>(
    "SELECT division, COUNT(*) AS n FROM enquiries GROUP BY division ORDER BY n DESC",
  );

  return (
    <>
      <PageHead
        title="Overview"
        subtitle={`Signed in as ${user.name} · ${user.role.replace(/_/g, " ")}${scoped ? ` · ${scoped}` : ""}`}
        action={<Link href="/admin/enquiries" className="btn btn-primary btn-sm">Open pipeline</Link>}
      />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total enquiries" value={total} note={`${week} in the last 7 days`} href="/admin/enquiries" />
        <StatCard label="Open" value={open} note={`${proposals} awaiting a decision`} href="/admin/enquiries?status=NEW" />
        <StatCard label="Active projects" value={projects} note={`${clients} active client accounts`} href="/admin/projects" />
        <StatCard label="RFQs to action" value={rfqs} note={`${published} published articles`} href="/admin/rfqs" />
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
        <Panel title="Latest enquiries" action={<Link href="/admin/enquiries" className="text-[0.75rem] font-semibold text-teal-dark hover:underline">View all</Link>} className="p-0 [&>div]:p-0">
          {recent.length === 0 ? (
            <div className="p-5"><AdminEmpty title="No enquiries yet" body="Website submissions appear here the moment they are stored." /></div>
          ) : (
            <DataTable head={<tr><Th>Reference</Th><Th>Contact</Th><Th>Division</Th><Th>Status</Th><Th>Received</Th></tr>}>
              {recent.map((r) => (
                <tr key={r.id} className="hover:bg-light/50">
                  <Td><Link href={`/admin/enquiries/${r.id}`} className="font-semibold text-teal-dark hover:underline" dir="ltr">{r.ref}</Link></Td>
                  <Td>
                    <p className="font-medium text-navy">{r.name}</p>
                    <p className="text-[0.72rem] text-muted">{r.subject ?? "—"}</p>
                  </Td>
                  <Td className="text-muted">{r.division ?? "General"}</Td>
                  <Td><span className={`badge ${STATUS_TONE[r.status] ?? "bg-light text-muted"}`}>{r.status.replace(/_/g, " ")}</span></Td>
                  <Td className="whitespace-nowrap text-[0.75rem] text-muted">{formatDate(r.created_at)}</Td>
                </tr>
              ))}
            </DataTable>
          )}
        </Panel>

        <div className="space-y-6">
          <Panel title="Enquiries by division">
            {byDivision.length === 0 ? (
              <p className="text-[0.8rem] text-muted">No data yet.</p>
            ) : (
              <ul className="space-y-3">
                {byDivision.map((row) => {
                  const max = Math.max(...byDivision.map((r) => r.n));
                  const label = divisions.find((d) => d.slug === row.division)?.name.en ?? (row.division ? row.division : "General");
                  return (
                    <li key={row.division ?? "general"}>
                      <div className="flex items-center justify-between text-[0.78rem]">
                        <span className="text-navy">{label}</span>
                        <span className="text-muted">{row.n}</span>
                      </div>
                      <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-light">
                        <div className="h-full rounded-full bg-teal" style={{ width: `${Math.round((row.n / max) * 100)}%` }} />
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </Panel>

          <Panel title="Quick actions">
            <ul className="space-y-2 text-[0.8rem]">
              {[
                ["/admin/articles/new", "Write an insight article"],
                ["/admin/projects", "Create or update a project"],
                ["/admin/products", "Add a catalogue product"],
                ["/admin/settings", "Edit company details and contact information"],
                ["/admin/media", "Upload media"],
              ].map(([href, label]) => (
                <li key={href}><Link href={href} className="text-muted hover:text-teal-dark hover:underline">{label}</Link></li>
              ))}
            </ul>
          </Panel>
        </div>
      </div>
    </>
  );
}
