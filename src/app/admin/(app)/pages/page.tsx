import Link from "next/link";
import { Pencil } from "lucide-react";
import { all } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { DataTable, PageHead, STATUS_TONE, Td, Th, formatDate } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

type Page = { id: number; slug: string; title_en: string; status: string; updated_at: string; seo_title: string | null };

export default async function PagesAdmin() {
  await requireStaff();
  const pages = all<Page>("SELECT id,slug,title_en,status,updated_at,seo_title FROM pages ORDER BY slug");

  return (
    <>
      <PageHead title="Website Pages" subtitle="Legal and policy pages rendered from the database at /privacy, /terms, /cookies and /regulatory." />

      <DataTable head={<tr><Th>Page</Th><Th>Path</Th><Th>Status</Th><Th>SEO title</Th><Th>Updated</Th><Th /></tr>}>
        {pages.map((p) => (
          <tr key={p.id} className="hover:bg-light/50">
            <Td className="font-medium text-navy">{p.title_en}</Td>
            <Td className="font-mono text-[0.72rem] text-muted" dir="ltr">/{p.slug}</Td>
            <Td><span className={`badge ${STATUS_TONE[p.status]}`}>{p.status}</span></Td>
            <Td className="max-w-[280px] truncate text-[0.75rem] text-muted">{p.seo_title ?? "—"}</Td>
            <Td className="text-[0.72rem] text-muted">{formatDate(p.updated_at)}</Td>
            <Td>
              <Link href={`/admin/pages/${p.id}`} aria-label={`Edit ${p.title_en}`} className="inline-flex rounded border border-line p-1.5 text-muted hover:border-teal/50 hover:text-teal-dark">
                <Pencil size={13} aria-hidden="true" />
              </Link>
            </Td>
          </tr>
        ))}
      </DataTable>
    </>
  );
}
