import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { PageHead, Panel } from "@/components/admin/AdminUI";
import { ArticleEditor } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

type Article = {
  id: number; slug: string; category: string; division: string | null; title_en: string; title_ar: string | null;
  excerpt_en: string | null; excerpt_ar: string | null; body_en: string; body_ar: string | null; status: string;
};

export default async function ArticleEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const { id } = await params;
  const isNew = id === "new";
  const article = isNew ? undefined : one<Article>("SELECT * FROM articles WHERE id = ?", [Number(id) || 0]);
  if (!isNew && !article) notFound();

  return (
    <>
      <Link href="/admin/articles" className="mb-5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-navy">
        <ArrowLeft size={14} aria-hidden="true" /> All articles
      </Link>

      <PageHead
        title={isNew ? "New article" : "Edit article"}
        subtitle={isNew ? "Drafts are only visible to staff until published." : `/${article!.slug} · ${article!.status}`}
        action={article?.status === "published" ? (
          <Link href={`/insights/${article.slug}`} className="btn btn-ghost btn-sm"><ExternalLink size={14} aria-hidden="true" /> View live</Link>
        ) : undefined}
      />

      <Panel>
        <ArticleEditor article={article} />
      </Panel>
    </>
  );
}
