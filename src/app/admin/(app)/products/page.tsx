import Link from "next/link";
import { Pencil, Trash2 } from "lucide-react";
import { all, one } from "@/lib/db";
import { requireStaff } from "@/lib/auth";
import { deleteProduct } from "@/app/actions/admin";
import { AdminEmpty, DataTable, PageHead, Panel, Td, Th } from "@/components/admin/AdminUI";
import { ProductEditor } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

type Product = {
  id: number; slug: string; name: string; category: string; sku: string | null; summary: string | null;
  description: string | null; specs: string | null; price_note: string | null; active: number; featured: number;
};

export default async function ProductsAdmin({ searchParams }: { searchParams: Promise<{ edit?: string; q?: string }> }) {
  await requireStaff();
  const sp = await searchParams;
  const editId = Number(sp.edit) || 0;
  const q = sp.q?.trim() ?? "";
  const like = `%${q.slice(0, 80)}%`;

  const products = all<Product>(
    "SELECT * FROM products WHERE (? = '' OR name LIKE ? OR sku LIKE ? OR category LIKE ?) ORDER BY sort, name",
    [q, like, like, like],
  );
  const editing = editId ? one<Product>("SELECT * FROM products WHERE id = ?", [editId]) : undefined;

  return (
    <>
      <PageHead title="Product Catalogue" subtitle={`${products.length} item${products.length === 1 ? "" : "s"} · shown on the Trading catalogue`} />

      <form className="mb-5 flex gap-3 rounded-md border border-line bg-white p-4">
        <div className="field flex-1">
          <label className="label" htmlFor="q">Search</label>
          <input id="q" name="q" defaultValue={q} placeholder="Name, SKU or category" className="input" />
        </div>
        <div className="flex items-end"><button type="submit" className="btn btn-primary btn-sm">Search</button></div>
      </form>

      <div className="grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <div>
          {products.length === 0 ? (
            <AdminEmpty title="No products" body="Add the first catalogue item from the form on the right." />
          ) : (
            <DataTable head={<tr><Th>Product</Th><Th>Category</Th><Th>Price note</Th><Th>State</Th><Th /></tr>}>
              {products.map((p) => (
                <tr key={p.id} className="hover:bg-light/50">
                  <Td>
                    <Link href={`/divisions/trading/${p.slug}`} className="font-medium text-navy hover:text-teal-dark">{p.name}</Link>
                    <p className="font-mono text-[0.68rem] text-muted" dir="ltr">{p.sku ?? "—"}</p>
                  </Td>
                  <Td className="text-[0.75rem] text-muted">{p.category}</Td>
                  <Td className="text-[0.75rem] text-muted">{p.price_note ?? "—"}</Td>
                  <Td>
                    <span className={`badge ${p.active ? "bg-success/10 text-success" : "bg-light text-muted"}`}>{p.active ? "Visible" : "Hidden"}</span>
                    {!!p.featured && <span className="badge ms-1 bg-gold/15 text-[#8a7440]">Featured</span>}
                  </Td>
                  <Td>
                    <div className="flex items-center gap-2">
                      <Link href={`/admin/products?edit=${p.id}`} aria-label={`Edit ${p.name}`} className="rounded border border-line p-1.5 text-muted hover:border-teal/50 hover:text-teal-dark">
                        <Pencil size={13} aria-hidden="true" />
                      </Link>
                      <form action={deleteProduct}>
                        <input type="hidden" name="id" value={p.id} />
                        <button type="submit" aria-label={`Delete ${p.name}`} className="rounded border border-line p-1.5 text-muted hover:border-error/40 hover:text-error">
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

        <Panel title={editing ? `Edit ${editing.name}` : "New product"}>
          <ProductEditor product={editing} />
          {editing && <Link href="/admin/products" className="mt-3 inline-block text-[0.75rem] font-semibold text-muted hover:text-navy">Cancel edit</Link>}
        </Panel>
      </div>
    </>
  );
}
