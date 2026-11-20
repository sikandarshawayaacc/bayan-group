import Link from "next/link";
import { all } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { AdminEmpty, DataTable, PageHead, Td, Th, formatDate } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

type Client = {
  id: number; name: string; email: string; company: string | null; phone: string | null;
  active: number; created_at: string; last_login_at: string | null;
  enquiries: number; projects: number; documents: number;
};

export default async function ClientsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requireStaff();
  const q = (await searchParams).q?.trim() ?? "";
  const like = `%${q.slice(0, 80)}%`;

  const clients = all<Client>(
    `SELECT u.id,u.name,u.email,u.company,u.phone,u.active,u.created_at,u.last_login_at,
       (SELECT COUNT(*) FROM enquiries e WHERE e.user_id = u.id OR e.email = u.email) AS enquiries,
       (SELECT COUNT(*) FROM projects p WHERE p.client_id = u.id) AS projects,
       (SELECT COUNT(*) FROM documents d WHERE d.client_id = u.id) AS documents
     FROM users u WHERE u.role = 'client' AND (? = '' OR u.name LIKE ? OR u.email LIKE ? OR u.company LIKE ?)
     ORDER BY u.created_at DESC`,
    [q, like, like, like],
  );

  return (
    <>
      <PageHead title="Clients" subtitle={`${clients.length} portal account${clients.length === 1 ? "" : "s"}`} />

      <form className="mb-5 flex gap-3 rounded-md border border-line bg-white p-4">
        <div className="field flex-1">
          <label className="label" htmlFor="q">Search clients</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, email or company" className="input" />
        </div>
        <div className="flex items-end"><button type="submit" className="btn btn-primary btn-sm">Search</button></div>
      </form>

      {clients.length === 0 ? (
        <AdminEmpty title="No clients found" body="Client accounts are created when someone registers on the portal, or from Users & Permissions." />
      ) : (
        <DataTable head={<tr><Th>Client</Th><Th>Contact</Th><Th>Activity</Th><Th>Status</Th><Th>Last sign-in</Th><Th /></tr>}>
          {clients.map((c) => (
            <tr key={c.id} className="hover:bg-light/50">
              <Td>
                <Link href={`/admin/clients/${c.id}`} className="font-semibold text-navy hover:text-teal-dark">{c.name}</Link>
                <p className="text-[0.72rem] text-muted">{c.company ?? "—"}</p>
              </Td>
              <Td>
                <p className="text-[0.75rem] text-navy" dir="ltr">{c.email}</p>
                <p className="text-[0.72rem] text-muted" dir="ltr">{c.phone ?? "—"}</p>
              </Td>
              <Td className="text-[0.72rem] text-muted">
                {c.enquiries} enquiries · {c.projects} projects · {c.documents} documents
              </Td>
              <Td>
                <span className={`badge ${c.active ? "bg-success/10 text-success" : "bg-light text-muted"}`}>{c.active ? "Active" : "Disabled"}</span>
              </Td>
              <Td className="text-[0.72rem] text-muted">{formatDate(c.last_login_at)}</Td>
              <Td><Link href={`/admin/clients/${c.id}`} className="text-[0.75rem] font-semibold text-teal-dark hover:underline">Open</Link></Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
