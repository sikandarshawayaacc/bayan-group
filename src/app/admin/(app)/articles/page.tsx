import Link from "next/link";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { all } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { deleteArticle } from "@/app/actions/admin";
import { AdminEmpty, DataTable, PageHead, STATUS_TONE, Td, Th, formatDate } from "@/components/admin/AdminUI";

export const dynamic = "force-dynamic";

type Article = {
  id: number; slug: string; title_en: string; category: string; division: string | null;
  status: string; published_at: string | null; updated_at: string;
};

export default async function ArticlesAdmin({ searchParams }: { searchParams: Promise<{ q?: string; status?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const q = sp.q?.trim() ?? "";
  const status = ["published", "draft"].includes(sp.status ?? "") ? sp.status! : "";
  const like = `%${q.slice(0, 80)}%`;

  const articles = all<Article>(
    `SELECT id,slug,title_en,category,division,status,published_at,updated_at FROM articles
     WHERE (? = '' OR title_en LIKE ? OR slug LIKE ? OR category LIKE ?) ${status ? "AND status = ?" : ""}
     ORDER BY COALESCE(published_at, updated_at) DESC LIMIT 200`,
    status ? [q, like, like, like, status] : [q, like, like, like],
  );

  return (
    <>
      <PageHead
        title="Articles"
        subtitle={`${articles.length} article${articles.length === 1 ? "" : "s"} · drafts stay out of the public site`}
        action={<Link href="/admin/articles/new" className="btn btn-primary btn-sm"><Plus size={14} aria-hidden="true" /> New article</Link>}
      />

      <form className="mb-5 grid gap-3 rounded-md border border-line bg-white p-4 sm:grid-cols-[1fr_200px_auto]">
        <div className="field">
          <label className="label" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Title, slug or category" className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="status">Status</label>
          <select id="status" name="status" defaultValue={status} className="input">
            <option value="">All</option>
            <option value="published">Published</option>
            <option value="draft">Draft</option>
          </select>
        </div>
        <div className="flex items-end"><button type="submit" className="btn btn-primary btn-sm">Filter</button></div>
      </form>

      {articles.length === 0 ? (
        <AdminEmpty title="No articles" body="Write the first insight article." />
      ) : (
        <DataTable head={<tr><Th>Title</Th><Th>Category</Th><Th>Division</Th><Th>Status</Th><Th>Published</Th><Th /></tr>}>
          {articles.map((a) => (
            <tr key={a.id} className="hover:bg-light/50">
              <Td>
                <Link href={`/admin/articles/${a.id}`} className="font-medium text-navy hover:text-teal-dark">{a.title_en}</Link>
                <p className="font-mono text-[0.68rem] text-muted" dir="ltr">/{a.slug}</p>
              </Td>
              <Td className="text-[0.75rem] text-muted">{a.category}</Td>
              <Td className="text-[0.75rem] text-muted">{a.division ?? "Group-wide"}</Td>
              <Td><span className={`badge ${STATUS_TONE[a.status]}`}>{a.status}</span></Td>
              <Td className="text-[0.72rem] text-muted">{formatDate(a.published_at)}</Td>
              <Td>
                <div className="flex items-center gap-2">
                  <Link href={`/admin/articles/${a.id}`} aria-label={`Edit ${a.title_en}`} className="rounded border border-line p-1.5 text-muted hover:border-teal/50 hover:text-teal-dark">
                    <Pencil size={13} aria-hidden="true" />
                  </Link>
                  <form action={deleteArticle}>
                    <input type="hidden" name="id" value={a.id} />
                    <button type="submit" aria-label={`Delete ${a.title_en}`} className="rounded border border-line p-1.5 text-muted hover:border-error/40 hover:text-error">
                      <Trash2 size={13} aria-hidden="true" />
                    </button>
                  </form>
                </div>
              </Td>
            </tr>
          ))}
        </DataTable>
      )}
    </>
  );
}
