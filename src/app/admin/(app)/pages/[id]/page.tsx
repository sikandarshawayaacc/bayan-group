import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { PageHead, Panel } from "@/components/admin/AdminUI";
import { PageEditor } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

type Page = {
  id: number; slug: string; title_en: string; title_ar: string | null; body_en: string; body_ar: string | null;
  seo_title: string | null; seo_description: string | null; status: string;
};

export default async function PageEditorPage({ params }: { params: Promise<{ id: string }> }) {
  await requireStaff();
  const page = one<Page>("SELECT * FROM pages WHERE id = ?", [Number((await params).id) || 0]);
  if (!page) notFound();

  return (
    <>
      <Link href="/admin/pages" className="mb-5 inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-navy">
        <ArrowLeft size={14} aria-hidden="true" /> All pages
      </Link>
      <PageHead title={page.title_en} subtitle={`Editing /${page.slug} · Markdown is supported and rendered safely.`} />
      <Panel>
        <PageEditor page={page} />
      </Panel>
    </>
  );
}
