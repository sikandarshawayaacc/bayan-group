import type { Metadata } from "next";
import { Download, Trash2 } from "lucide-react";
import { getLocale } from "@/lib/i18n";
import { all } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/ui";
import { DocumentUpload } from "@/components/PortalForms";
import { deleteClientDocument } from "@/app/actions/portal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Documents", robots: { index: false, follow: false } };

type Doc = {
  id: number; name: string; mime: string; size: number; created_at: string;
  project: string | null; uploader: string | null;
};

const kb = (size: number) => (size > 1024 * 1024 ? `${(size / 1024 / 1024).toFixed(1)} MB` : `${Math.max(1, Math.round(size / 1024))} KB`);

export default async function DocumentsPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const docs = all<Doc>(
    `SELECT d.id,d.name,d.mime,d.size,d.created_at,p.title AS project,u.name AS uploader
     FROM documents d LEFT JOIN projects p ON p.id = d.project_id LEFT JOIN users u ON u.id = d.uploaded_by
     WHERE d.client_id = ? ORDER BY d.created_at DESC`,
    [user.id],
  );
  const projects = all<{ id: number; title: string }>(
    "SELECT id,title FROM projects WHERE client_id = ? AND status != 'COMPLETED' ORDER BY created_at DESC",
    [user.id],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[1.4rem] font-bold text-navy">{locale === "ar" ? "المستندات" : "Documents"}</h1>
        <p className="mt-1 text-[0.83rem] text-muted">
          {locale === "ar" ? "ملفات مشتركة مع فريقك. التخزين خاص ولا يمكن الوصول إليه إلا من حسابك." : "Files shared with your team. Storage is private and reachable only from your account."}
        </p>
      </header>

      <section className="rounded-md border border-line bg-white p-5">
        <h2 className="text-[0.9rem] font-bold text-navy">{locale === "ar" ? "رفع مستند" : "Upload a document"}</h2>
        <p className="mb-4 mt-1 text-[0.78rem] text-muted">{locale === "ar" ? "PDF أو DOCX أو XLSX أو صورة، بحد أقصى ٥ ميجابايت." : "PDF, DOCX, XLSX or image, up to 5 MB."}</p>
        <DocumentUpload locale={locale} projects={projects} />
      </section>

      {docs.length === 0 ? (
        <EmptyState title={locale === "ar" ? "لا مستندات." : "No documents."} body={locale === "ar" ? "ارفع أول مستند أعلاه." : "Upload your first document above."} />
      ) : (
        <div className="overflow-hidden rounded-md border border-line bg-white">
          <table className="w-full text-start text-[0.82rem]">
            <thead className="bg-light text-[0.7rem] uppercase tracking-[0.1em] text-muted">
              <tr>
                <th scope="col" className="px-4 py-3 text-start font-semibold">{locale === "ar" ? "الملف" : "File"}</th>
                <th scope="col" className="hidden px-4 py-3 text-start font-semibold sm:table-cell">{locale === "ar" ? "المشروع" : "Project"}</th>
                <th scope="col" className="hidden px-4 py-3 text-start font-semibold md:table-cell">{locale === "ar" ? "التاريخ" : "Date"}</th>
                <th scope="col" className="px-4 py-3 text-end font-semibold">{locale === "ar" ? "إجراء" : "Action"}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-line">
              {docs.map((d) => (
                <tr key={d.id}>
                  <td className="px-4 py-3">
                    <p className="font-semibold text-navy">{d.name}</p>
                    <p className="text-[0.7rem] text-muted">{kb(d.size)} · {d.uploader ?? "—"}</p>
                  </td>
                  <td className="hidden px-4 py-3 text-muted sm:table-cell">{d.project ?? "—"}</td>
                  <td className="hidden px-4 py-3 text-muted md:table-cell">{new Date(d.created_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB")}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <a href={`/api/portal/documents/${d.id}`} className="inline-flex items-center gap-1 rounded border border-line px-2.5 py-1.5 text-[0.72rem] font-semibold text-navy hover:border-navy/30">
                        <Download size={13} aria-hidden="true" /> {locale === "ar" ? "تنزيل" : "Download"}
                      </a>
                      <form action={deleteClientDocument}>
                        <input type="hidden" name="id" value={d.id} />
                        <button type="submit" aria-label={locale === "ar" ? "حذف" : "Delete"} className="rounded border border-line p-1.5 text-muted hover:border-error/40 hover:text-error">
                          <Trash2 size={13} aria-hidden="true" />
                        </button>
                      </form>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
