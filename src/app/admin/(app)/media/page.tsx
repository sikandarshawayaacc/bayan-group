import Image from "next/image";
import { Trash2 } from "lucide-react";
import { all } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { deleteMedia } from "@/app/actions/admin";
import { AdminEmpty, PageHead, Panel, formatDate } from "@/components/admin/AdminUI";
import { MediaUpload } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

type Media = { id: number; filename: string; original_name: string; mime: string; size: number; alt: string | null; created_at: string; uploader: string | null };

export default async function MediaPage() {
  await requireStaff();
  const media = all<Media>(
    "SELECT m.*,u.name AS uploader FROM media m LEFT JOIN users u ON u.id = m.uploaded_by ORDER BY m.created_at DESC LIMIT 300",
  );

  return (
    <>
      <PageHead title="Media Library" subtitle={`${media.length} image${media.length === 1 ? "" : "s"} · stored in public/uploads and served from /uploads/`} />

      <Panel title="Upload" className="mb-6">
        <MediaUpload />
      </Panel>

      {media.length === 0 ? (
        <AdminEmpty title="No media yet" body="Upload a PNG or JPG. Use the copy button to get the path for a CMS field." />
      ) : (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {media.map((m) => (
            <li key={m.id} className="overflow-hidden rounded-md border border-line bg-white">
              <div className="relative aspect-[4/3] bg-light">
                <Image src={`/uploads/${m.filename}`} alt={m.alt ?? m.original_name} fill sizes="(max-width: 768px) 50vw, 240px" className="object-cover" />
              </div>
              <div className="p-3">
                <p className="truncate text-[0.78rem] font-semibold text-navy">{m.original_name}</p>
                <p className="mt-0.5 text-[0.68rem] text-muted">{(m.size / 1024).toFixed(0)} KB · {formatDate(m.created_at)}</p>
                <div className="mt-2 flex items-center justify-between gap-2">
                  <code className="truncate rounded bg-light px-1.5 py-1 text-[0.64rem] text-muted" dir="ltr">/uploads/{m.filename}</code>
                  <form action={deleteMedia}>
                    <input type="hidden" name="id" value={m.id} />
                    <button type="submit" aria-label={`Delete ${m.original_name}`} className="rounded border border-line p-1.5 text-muted hover:border-error/40 hover:text-error">
                      <Trash2 size={12} aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </>
  );
}
