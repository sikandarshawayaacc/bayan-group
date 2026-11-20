import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { all, one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { deleteProject } from "@/app/actions/admin";
import { divisions } from "@/lib/content";
import { AdminEmpty, DataTable, PageHead, Panel, STATUS_TONE, Td, Th, formatDate } from "@/components/admin/AdminUI";
import { ProjectEditor } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

type Project = {
  id: number; ref: string; title: string; client_id: number; division: string; status: string;
  progress: number; description: string | null; start_date: string | null; due_date: string | null; client: string;
};

export default async function ProjectsAdmin({ searchParams }: { searchParams: Promise<{ edit?: string }> }) {
  await requireStaff();
  const editId = Number((await searchParams).edit) || 0;

  const projects = all<Project>(
    `SELECT p.*,u.name AS client FROM projects p JOIN users u ON u.id = p.client_id ORDER BY p.created_at DESC`,
  );
  const editing = editId ? one<Project>("SELECT * FROM projects WHERE id = ?", [editId]) : undefined;
  const clients = all<{ id: number; name: string }>("SELECT id,name FROM users WHERE role = 'client' AND active = 1 ORDER BY name");
  const divisionOptions = divisions.map((d) => ({ value: d.slug, label: d.name.en }));

  return (
    <>
      <PageHead title="Projects" subtitle={`${projects.length} project${projects.length === 1 ? "" : "s"} across client accounts`} />

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {projects.length === 0 ? (
            <AdminEmpty title="No projects yet" body="Create the first project from the form on the right." />
          ) : (
            <DataTable head={<tr><Th>Reference</Th><Th>Project</Th><Th>Client</Th><Th>Status</Th><Th>Progress</Th><Th /></tr>}>
              {projects.map((p) => (
                <tr key={p.id} className="hover:bg-light/50">
                  <Td className="whitespace-nowrap font-mono text-[0.72rem] text-muted"><span dir="ltr">{p.ref}</span></Td>
                  <Td>
                    <p className="font-medium text-navy">{p.title}</p>
                    <p className="text-[0.7rem] text-muted">{p.division} · due {formatDate(p.due_date)}</p>
                  </Td>
                  <Td className="text-[0.76rem] text-muted">{p.client}</Td>
                  <Td><span className={`badge ${STATUS_TONE[p.status] ?? "bg-light text-muted"}`}>{p.status.replace(/_/g, " ")}</span></Td>
                  <Td className="text-[0.75rem] text-muted">{p.progress}%</Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/projects?edit=${p.id}`} aria-label={`Edit ${p.title}`} className="rounded border border-line p-1.5 text-muted hover:border-teal/50 hover:text-teal-dark">
                        <Pencil size={13} aria-hidden="true" />
                      </Link>
                      <form action={deleteProject}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" aria-label={`Delete ${p.title}`} className="rounded border border-line p-1.5 text-muted hover:border-error/40 hover:text-error">
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </Td>
                </tr>
              ))}
            </DataTable>
          )}
        </div>

        <Panel title={editing ? `Edit ${editing.ref}` : "New project"}>
          {clients.length === 0 ? (
            <p className="text-[0.82rem] text-muted">Create a client account first from User &amp; Permissions or the portal.</p>
          ) : (
            <ProjectEditor
              project={editing ? {
                id: editing.id, title: editing.title, client_id: editing.client_id, division: editing.division,
                status: editing.status, progress: editing.progress, description: editing.description,
                start_date: editing.start_date, due_date: editing.due_date,
              } : undefined}
              clients={clients}
              divisions={divisionOptions}
            />
          )}
          {editing && <Link href="/admin/projects" className="mt-3 inline-block text-[0.75rem] font-semibold text-muted hover:text-navy">Cancel edit</Link>}
        </Panel>
      </div>
    </>
  );
}
