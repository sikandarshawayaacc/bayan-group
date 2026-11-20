import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft, LogOut } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { Logo } from "@/components/Logo";
import { PortalNav } from "@/components/PortalNav";
import { logout } from "@/app/actions/auth";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { robots: { index: false, follow: false } };

export default async function PortalLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/portal/login?next=/portal");
  if (isStaff(user)) redirect("/admin");

  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);

  const labels: Record<string, string> = {
    "portal.overview": tr("portal.overview"),
    "portal.enquiries": tr("portal.enquiries"),
    "portal.projects": tr("portal.projects"),
    "portal.documents": tr("portal.documents"),
    "portal.messages": tr("portal.messages"),
    "portal.profile": tr("portal.profile"),
    "portal.security": tr("portal.security"),
  };

  return (
    <div className="min-h-screen bg-light">
      <header className="border-b border-line bg-white">
        <div className="container-x flex items-center justify-between gap-4 py-4">
          <div className="flex items-center gap-5">
            <Logo />
            <span className="hidden rounded border border-line px-2 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.12em] text-muted sm:inline">
              {tr("portal.title")}
            </span>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/" className="hidden items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-navy sm:inline-flex">
              <ArrowLeft size={14} className="rtl:rotate-180" aria-hidden="true" />
              {locale === "ar" ? "الموقع" : "Website"}
            </Link>
            <form action={logout}>
              <button type="submit" className="inline-flex items-center gap-1.5 rounded border border-line px-3 py-1.5 text-[0.78rem] font-semibold text-navy hover:border-navy/30">
                <LogOut size={14} aria-hidden="true" />
                {tr("portal.logout")}
              </button>
            </form>
          </div>
        </div>
      </header>

      <div className="container-x grid gap-8 py-8 lg:grid-cols-[230px_1fr]">
        <aside>
          <div className="rounded-md border border-line bg-white p-3">
            <p className="px-3 pb-2 pt-1 text-[0.72rem] font-bold uppercase tracking-[0.12em] text-muted">
              {user.name}
            </p>
            <PortalNav locale={locale} labels={labels} />
          </div>
          {user.company && <p className="mt-3 px-1 text-[0.72rem] text-muted">{user.company}</p>}
        </aside>
        <main id="main" className="min-w-0">{children}</main>
      </div>
    </div>
  );
}
