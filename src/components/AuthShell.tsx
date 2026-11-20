import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "./Logo";
import { getLocale } from "@/lib/i18n";

export async function AuthShell({
  title,
  subtitle,
  children,
  aside,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
  aside?: React.ReactNode;
}) {
  const locale = await getLocale();
  return (
    <div className="grid min-h-screen lg:grid-cols-[1fr_1.05fr]">
      <div className="flex flex-col bg-white">
        <div className="flex items-center justify-between px-6 py-6 md:px-12">
          <Logo />
          <Link href="/" className="inline-flex items-center gap-1.5 text-[0.78rem] font-semibold text-muted hover:text-navy">
            <ArrowLeft size={14} className="rtl:rotate-180" aria-hidden="true" />
            {locale === "ar" ? "الموقع" : "Website"}
          </Link>
        </div>
        <div className="flex flex-1 items-center justify-center px-6 pb-16 md:px-12">
          <div className="w-full max-w-md">
            <h1 className="text-[1.7rem] font-bold text-navy">{title}</h1>
            {subtitle && <p className="mt-2 text-[0.86rem] leading-relaxed text-muted">{subtitle}</p>}
            <div className="mt-8">{children}</div>
          </div>
        </div>
      </div>
      <aside className="relative hidden overflow-hidden bg-navy p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="absolute inset-0 grid-lines opacity-40" aria-hidden="true" />
        <div className="relative">
          <p className="eyebrow eyebrow-light">{locale === "ar" ? "بوابة العملاء" : "Client Portal"}</p>
          <p className="mt-4 max-w-md text-[1.6rem] font-bold leading-snug">
            {locale === "ar" ? "قراراتك ومشاريعك ومستنداتك في مكان واحد." : "Your decisions, projects and documents in one place."}
          </p>
        </div>
        <div className="relative max-w-md text-[0.85rem] leading-relaxed text-white/60">
          {aside ?? (
            <p>
              {locale === "ar"
                ? "الوصول محمي على مستوى الخادم. لا يمكن لأي عميل رؤية بيانات عميل آخر."
                : "Access is enforced on the server. No client can see another client's records."}
            </p>
          )}
        </div>
      </aside>
    </div>
  );
}
