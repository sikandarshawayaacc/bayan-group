import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { all, one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { DataTable, Panel, STATUS_TONE, Td, Th, formatDate } from "@/components/admin/AdminUI";
import { ClientDocumentForm, ClientReplyForm } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

type Client = { id: number; name: string; email: string; company: string | null; phone: string | null; active: number; created_at: string; last_login_at: string | null };
type Project = { id: number; ref: string; title: string; division: string; status: string; progress: number; due_date: string | null };
type Doc = { id: number; name: string; size: number; created_at: string };
type Message = { id: number; body: string; created_at: string; sender: string; role: string };
type Enquiry = { id: number; ref: string; subject: string | null; status: string; created_at: string };

export default async function ClientDetail({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const id = Number((await params).id);
  if (!Number.isInteger(id)) notFound();

  const client = one<Client>("SELECT id,name,email,company,phone,active,created_at,last_login_at FROM users WHERE id = ? AND role = 'client'", [id]);
  if (!client) notFound();

  const projects = all<Project>("SELECT id,ref,title,division,status,progress,due_date FROM projects WHERE client_id = ? ORDER BY created_at DESC", [id]);
  const documents = all<Doc>("SELECT id,name,size,created_at FROM documents WHERE client_id = ? ORDER BY created_at DESC", [id]);
  const messages = all<Message>(
    "SELECT m.id,m.body,m.created_at,u.name AS sender,u.role FROM messages m JOIN users u ON u.id = m.sender_id WHERE m.client_id = ? ORDER BY m.created_at ASC",
    [id],
  );
  const enquiries = all<Enquiry>(
    "SELECT id,ref,subject,status,created_at FROM enquiries WHERE user_id = ? OR email = ? ORDER BY created_at DESC",
    [id, client.email],
  );

  return (
    <>
      <Link href="/admin/clients" className="mb-5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-navy">
        <ArrowLeft size={14} aria-hidden="true" /> All clients
      </Link>

      <header className="mb-6">
        <h1 className="text-[1.45rem] font-bold text-navy">{client.name}</h1>
        <p className="mt-1 text-[0.8rem] text-muted">
          {client.company ?? "—"} · <span dir="ltr">{client.email}</span> · member since {formatDate(client.created_at)}
        </p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <div className="space-y-6">
          <Panel title="Projects" className="[&>div]:p-0">
            {projects.length === 0 ? (
              <p className="p-5 text-[0.8rem] text-muted">
                No projects yet. <Link href="/admin/projects" className="font-semibold text-teal-dark hover:underline">Create one</Link>.
              </p>
            ) : (
              <DataTable head={<tr><Th>Reference</Th><Th>Project</Th><Th>Status</Th><Th>Progress</Th><Th>Due</Th></tr>}>
                {projects.map((p) => (
                  <tr key={p.id}>
                    <Td className="font-mono text-[0.72rem] text-muted" ><span dir="ltr">{p.ref}</span></Td>
                    <Td>
                      <p className="font-medium text-navy">{p.title}</p>
                      <p className="text-[0.7rem] text-muted">{p.division}</p>
                    </Td>
                    <Td><span className={`badge ${STATUS_TONE[p.status] ?? "bg-light text-muted"}`}>{p.status.replace(/_/g, " ")}</span></Td>
                    <Td className="text-[0.75rem] text-muted">{p.progress}%</Td>
                    <Td className="text-[0.72rem] text-muted">{formatDate(p.due_date)}</Td>
                  </tr>
                ))}
              </DataTable>
            )}
          </Panel>

          <Panel title={`Message thread (${messages.length})`}>
            <div className="max-h-80 space-y-3 overflow-y-auto">
              {messages.length === 0 ? (
                <p className="text-[0.8rem] text-muted">No messages yet.</p>
              ) : (
                messages.map((m) => (
                  <div key={m.id} className={`rounded px-3 py-2 ${m.role === "client" ? "bg-light" : "bg-teal/8"}`}>
                    <p className="text-[0.68rem] font-semibold text-muted">{m.sender} · {formatDate(m.created_at, true)}</p>
                    <p className="mt-1 whitespace-pre-line text-[0.82rem] text-navy/85">{m.body}</p>
                  </div>
                ))
              )}
            </div>
            <div className="mt-5 border-t border-line pt-4">
              <ClientReplyForm clientId={client.id} />
            </div>
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Account">
            <dl className="space-y-3 text-[0.82rem]">
              <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Email</dt><dd className="text-navy" dir="ltr">{client.email}</dd></div>
              <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Phone</dt><dd className="text-navy" dir="ltr">{client.phone ?? "—"}</dd></div>
              <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Status</dt><dd className="text-navy">{client.active ? "Active" : "Disabled"}</dd></div>
              <div><dt className="text-[0.68rem] uppercase tracking-[0.1em] text-muted">Last sign-in</dt><dd className="text-navy">{formatDate(client.last_login_at, true)}</dd></div>
            </dl>
            <Link href="/admin/users" className="btn btn-ghost btn-sm mt-4 w-full">Manage account</Link>
          </Panel>

          <Panel title={`Documents (${documents.length})`}>
            <ul className="space-y-2">
              {documents.length === 0 && <li className="text-[0.8rem] text-muted">No documents shared.</li>}
              {documents.map((d) => (
                <li key={d.id} className="flex items-center justify-between gap-2 border-b border-line pb-2 text-[0.78rem] last:border-0 last:pb-0">
                  <a href={`/api/portal/documents/${d.id}`} className="font-medium text-navy hover:text-teal-dark">{d.name}</a>
                  <span className="text-[0.68rem] text-muted">{formatDate(d.created_at)}</span>
                </li>
              ))}
            </ul>
            <div className="mt-4 border-t border-line pt-4">
              <ClientDocumentForm clientId={client.id} projects={projects.map((p) => ({ id: p.id, title: p.title }))} />
            </div>
          </Panel>

          <Panel title={`Enquiries (${enquiries.length})`} className="[&>div]:p-0">
            {enquiries.length === 0 ? (
              <p className="p-5 text-[0.8rem] text-muted">No enquiries from this client.</p>
            ) : (
              <DataTable head={<tr><Th>Reference</Th><Th>Status</Th><Th>Received</Th></tr>}>
                {enquiries.map((e) => (
                  <tr key={e.id}>
                    <Td>
                      <Link href={`/admin/enquiries/${e.id}`} className="font-semibold text-teal-dark hover:underline" dir="ltr">{e.ref}</Link>
                      <p className="text-[0.7rem] text-muted">{e.subject ?? "General"}</p>
                    </Td>
                    <Td><span className={`badge ${STATUS_TONE[e.status] ?? "bg-light text-muted"}`}>{e.status.replace(/_/g, " ")}</span></Td>
                    <Td className="text-[0.72rem] text-muted">{formatDate(e.created_at)}</Td>
                  </tr>
                ))}
              </DataTable>
            )}
          </Panel>
        </div>
      </div>
    </>
  );
}
