import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExternalLink, LogOut } from "lucide-react";
import { requireStaff } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { AdminNav } from "@/components/admin/AdminNav";
import { logout } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Admin", robots: { index: false, follow: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireStaff();
  if (user.role === "client") redirect("/portal");

  return (
    <div className="min-h-screen bg-light lg:flex">
      <aside className="shrink-0 bg-navy px-4 py-6 lg:sticky lg:top-0 lg:h-screen lg:w-[248px] lg:overflow-y-auto">
        <div className="px-1 pb-6">
          <Logo light />
          <p className="mt-3 text-[0.66rem] font-semibold uppercase tracking-[0.16em] text-white/35">Administration</p>
        </div>
        <AdminNav role={user.role} />
        <div className="mt-8 border-t border-white/10 pt-4">
          <p className="px-2.5 text-[0.78rem] font-semibold text-white">{user.name}</p>
          <p className="px-2.5 text-[0.68rem] uppercase tracking-[0.1em] text-white/40">{user.role.replace(/_/g, " ")}</p>
          <div className="mt-3 flex flex-col gap-1">
            <Link href="/" className="flex items-center gap-2 rounded px-2.5 py-2 text-[0.76rem] text-white/60 hover:bg-white/5 hover:text-white">
              <ExternalLink size={13} aria-hidden="true" /> View website
            </Link>
            <form action={logout}>
              <button type="submit" className="flex w-full items-center gap-2 rounded px-2.5 py-2 text-start text-[0.76rem] text-white/60 hover:bg-white/5 hover:text-white">
                <LogOut size={13} aria-hidden="true" /> Sign out
              </button>
            </form>
          </div>
        </div>
      </aside>

      <main id="main" className="min-w-0 flex-1 px-5 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
