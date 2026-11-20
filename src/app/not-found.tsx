import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";

export default async function NotFound() {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  return (
    <main className="flex min-h-screen items-center bg-navy text-white">
      <div className="container-x py-20">
        <p className="eyebrow eyebrow-light">404</p>
        <h1 className="mt-3 max-w-2xl text-[clamp(2rem,5vw,3.6rem)] font-bold">{tr("notfound.title")}</h1>
        <p className="mt-4 max-w-xl text-[0.95rem] leading-relaxed text-white/60">{tr("notfound.body")}</p>
        <div className="mt-8 flex flex-wrap gap-3">
          <Link href="/" className="btn btn-primary">{tr("nav.home")} <ArrowRight size={15} aria-hidden="true" /></Link>
          <Link href="/contact" className="btn btn-outline">{tr("nav.contact")}</Link>
        </div>
      </div>
    </main>
  );
}
