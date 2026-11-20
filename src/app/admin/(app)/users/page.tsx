import Link from "next/link";
import { redirect } from "next/navigation";
import { Pencil } from "lucide-react";
import { all, one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { divisions } from "@/lib/content";
import { UserEditor } from "@/components/admin/AdminForms";
import { DataTable, PageHead, Panel, Td, Th, formatDate } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

type UserRow = {
  id: number; name: string; email: string; role: string; division: string | null;
  company: string | null; phone: string | null; active: number; last_login_at: string | null;
};

const ROLE_LABEL: Record<string, string> = {
  super_admin: "Super admin",
  editor: "Editor",
  division_manager: "Division manager",
  sales: "Sales / BD",
  client: "Client",
};

export default async function UsersAdmin({ searchParams }: { searchParams: Promise<{ edit?: string; role?: string }> }) {
  const me = await requireStaff();
  if (me.role !== "super_admin") redirect("/admin");

  const sp = await searchParams;
  const editId = Number(sp.edit) || 0;
  const roleFilter = Object.keys(ROLE_LABEL).includes(sp.role ?? "") ? sp.role ?? "" : "";

  const users = all<UserRow>(
    `SELECT id,name,email,role,division,company,phone,active,last_login_at FROM users
     WHERE (? = '' OR role = ?) ORDER BY CASE role WHEN 'super_admin' THEN 0 WHEN 'editor' THEN 1 WHEN 'division_manager' THEN 2 WHEN 'sales' THEN 3 ELSE 4 END, name`,
    [roleFilter, roleFilter],
  );
  const editing = editId ? one<UserRow>("SELECT * FROM users WHERE id = ?", [editId]) : undefined;

  return (
    <>
      <PageHead
        title="Users & Permissions"
        subtitle="Access is enforced on the server for every route and action. Only super admins can change roles."
      />

      <form className="mb-5 flex items-end gap-3 rounded-md border border-line bg-white p-4">
        <div className="field max-w-[240px] flex-1">
          <label className="label" htmlFor="role">Role</label>
          <select id="role" name="role" defaultValue={roleFilter} className="input">
            <option value="">All roles</option>
            {Object.entries(ROLE_LABEL).map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </div>
        <button type="submit" className="btn btn-primary btn-sm">Filter</button>
      </form>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <DataTable head={<tr><Th>User</Th><Th>Role</Th><Th>Division</Th><Th>State</Th><Th>Last sign-in</Th><Th /></tr>}>
          {users.map((u) => (
            <tr key={u.id} className="hover:bg-light/50">
              <Td>
                <p className="font-medium text-navy">{u.name}{u.id === me.id && <span className="ms-1.5 text-[0.66rem] font-semibold uppercase tracking-wide text-teal-dark">you</span>}</p>
                <p className="text-[0.7rem] text-muted" dir="ltr">{u.email}</p>
              </Td>
              <Td className="text-[0.75rem] text-muted">{ROLE_LABEL[u.role] ?? u.role}</Td>
              <Td className="text-[0.75rem] text-muted">{u.division ?? "—"}</Td>
              <Td><span className={`badge ${u.active ? "bg-success/10 text-success" : "bg-light text-muted"}`}>{u.active ? "Active" : "Disabled"}</span></Td>
              <Td className="text-[0.72rem] text-muted">{formatDate(u.last_login_at)}</Td>
              <Td>
                <Link href={`/admin/users?edit=${u.id}`} aria-label={`Edit ${u.name}`} className="inline-flex rounded border border-line p-1.5 text-muted hover:border-teal/50 hover:text-teal-dark">
                  <Pencil size={13} aria-hidden="true" />
                </Link>
              </Td>
            </tr>
          ))}
        </DataTable>

        <Panel title={editing ? `Edit ${editing.name}` : "Create user"}>
          <UserEditor
            user={editing}
            divisions={divisions.map((d) => ({ value: d.slug, label: d.name.en }))}
          />
          {editing && <Link href="/admin/users" className="mt-3 inline-block text-[0.75rem] font-semibold text-muted hover:text-navy">Cancel edit</Link>}
        </Panel>
      </div>
    </>
  );
}
