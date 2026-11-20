"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Globe, Menu, UserRound, X } from "lucide-react";
import { Logo } from "./Logo";
import { divisions } from "@/lib/content";
import { t, type Locale } from "@/lib/dictionary";

type HeaderUser = { name: string; role: string } | null;

export function Header({ locale, user }: { locale: Locale; user: HeaderUser }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mega, setMega] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [mobileDivisions, setMobileDivisions] = useState(false);
  const megaRef = useRef<HTMLDivElement>(null);
  const tr = (k: string) => t(locale, k);

  const transparent = pathname === "/" && !scrolled && !mega && !mobile;
  const other = locale === "en" ? "ar" : "en";
  const switchHref = `/api/locale?to=${other}&next=${encodeURIComponent(pathname || "/")}`;
  // A locale change must reload the document so <html lang/dir> is replaced.
  const switchLocale = (event: React.MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const next = `${window.location.pathname}${window.location.search}`;
    // Server redirect only: the document must reload so <html lang/dir> is replaced.
    // eslint-disable-next-line @next/next/no-location-assign-relative-destination
    window.location.assign(`/api/locale?to=${other}&next=${encodeURIComponent(next)}`);
  };
  const isStaff = user && user.role !== "client";
  const accountHref = !user ? "/portal/login" : isStaff ? "/admin" : "/portal";
  const accountLabel = !user ? tr("nav.login") : isStaff ? tr("nav.admin") : tr("nav.portal");

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = mobile ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [mobile]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMega(false); setMobile(false); }
    };
    const onClick = (e: MouseEvent) => {
      if (megaRef.current && !megaRef.current.contains(e.target as Node)) setMega(false);
    };
    document.addEventListener("keydown", onKey);
    document.addEventListener("mousedown", onClick);
    return () => { document.removeEventListener("keydown", onKey); document.removeEventListener("mousedown", onClick); };
  }, []);

  const navLink = (href: string, label: string) => {
    const active = href === "/" ? pathname === "/" : pathname.startsWith(href);
    return (
      <Link
        href={href}
        className={`relative py-2 text-[0.82rem] font-semibold tracking-wide transition-colors ${
          transparent ? "text-white/85 hover:text-white" : "text-navy/80 hover:text-teal-dark"
        } ${active ? (transparent ? "text-white" : "text-teal-dark") : ""}`}
      >
        {label}
        {active && <span className="absolute inset-x-0 -bottom-0.5 h-[2px] bg-teal" aria-hidden="true" />}
      </Link>
    );
  };

  return (
    <>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:start-2 focus:z-[100] focus:bg-navy focus:px-4 focus:py-2 focus:text-white">
        Skip to content
      </a>
      <header
        onClickCapture={(event) => {
          if ((event.target as HTMLElement).closest("a")) {
            setMega(false);
            setMobile(false);
          }
        }}
        className={`sticky top-0 z-50 transition-colors duration-300 ${
          transparent ? "bg-navy/85 backdrop-blur-sm border-b border-white/10" : "bg-white/97 backdrop-blur border-b border-line"
        }`}
      >
        <div className="container-x flex h-[82px] items-center justify-between gap-6">
          <Logo light={transparent} />

          <nav aria-label="Primary" className="hidden items-center gap-7 lg:flex">
            {navLink("/", tr("nav.home"))}
            {navLink("/about", tr("nav.about"))}
            <div className="relative" ref={megaRef}>
              <button
                type="button"
                aria-expanded={mega}
                aria-controls="mega-divisions"
                onClick={() => setMega((v) => !v)}
                onMouseEnter={() => setMega(true)}
                className={`flex items-center gap-1 py-2 text-[0.82rem] font-semibold tracking-wide transition-colors ${
                  transparent ? "text-white/85 hover:text-white" : "text-navy/80 hover:text-teal-dark"
                } ${pathname.startsWith("/divisions") ? (transparent ? "text-white" : "text-teal-dark") : ""}`}
              >
                {tr("nav.divisions")}
                <ChevronDown size={14} className={`transition-transform ${mega ? "rotate-180" : ""}`} aria-hidden="true" />
              </button>
              {mega && (
                <div
                  id="mega-divisions"
                  onMouseLeave={() => setMega(false)}
                  className="absolute start-1/2 top-full z-50 mt-1 w-[min(92vw,900px)] -translate-x-1/2 rounded-lg border border-line bg-white p-6 shadow-[0_30px_60px_-30px_rgba(23,43,58,0.35)] rtl:translate-x-1/2"
                >
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                    {divisions.map((d) => (
                      <Link key={d.slug} href={`/divisions/${d.slug}`} className="group rounded-md border border-transparent p-3 transition-colors hover:border-line hover:bg-light/60">
                        <span className="block h-1 w-7 rounded-full" style={{ background: d.accent }} aria-hidden="true" />
                        <span className="mt-3 block text-[0.86rem] font-bold text-navy group-hover:text-teal-dark">{d.name[locale]}</span>
                        <span className="mt-1 block text-[0.76rem] leading-relaxed text-muted">{d.tagline[locale]}</span>
                      </Link>
                    ))}
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-line pt-4">
                    <p className="text-[0.78rem] text-muted">{locale === "ar" ? "قسم واحد أو أكثر، بمعيار واحد." : "One division or several, under one standard."}</p>
                    <Link href="/divisions" className="text-[0.78rem] font-semibold text-teal-dark hover:underline">
                      {locale === "ar" ? "عرض جميع الأقسام" : "View all divisions"} →
                    </Link>
                  </div>
                </div>
              )}
            </div>
            {navLink("/insights", tr("nav.insights"))}
            {navLink("/careers", tr("nav.careers"))}
          </nav>

          <div className="hidden items-center gap-3 lg:flex">
            <a
              href={switchHref}
              onClick={switchLocale}
              hrefLang={other}
              aria-label={locale === "en" ? "Switch to Arabic" : "التبديل إلى الإنجليزية"}
              className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-[0.75rem] font-semibold ${
                transparent ? "text-white/80 hover:text-white" : "text-muted hover:text-navy"
              }`}
            >
              <Globe size={14} aria-hidden="true" />
              {tr("nav.language")}
            </a>
            <Link
              href={accountHref}
              className={`flex items-center gap-1.5 rounded px-2 py-1.5 text-[0.78rem] font-semibold ${
                transparent ? "text-white/85 hover:text-white" : "text-navy/80 hover:text-teal-dark"
              }`}
            >
              <UserRound size={14} aria-hidden="true" />
              {accountLabel}
            </Link>
            <Link href="/contact" className={`btn btn-sm ${transparent ? "btn-outline" : "btn-dark"}`}>
              {tr("nav.contact")}
            </Link>
          </div>

          <div className="flex items-center gap-2 lg:hidden">
            <a href={switchHref} onClick={switchLocale} hrefLang={other} className={`rounded px-2 py-1.5 text-[0.72rem] font-bold ${transparent ? "text-white" : "text-navy"}`} aria-label="Switch language">
              {other.toUpperCase()}
            </a>
            <button
              type="button"
              onClick={() => setMobile(true)}
              aria-expanded={mobile}
              aria-controls="mobile-menu"
              aria-label={tr("nav.menu")}
              className={`rounded p-2 ${transparent ? "text-white" : "text-navy"}`}
            >
              <Menu size={22} aria-hidden="true" />
            </button>
          </div>
        </div>
      </header>

      {mobile && (
        <div id="mobile-menu" className="fixed inset-0 z-[60] flex flex-col bg-navy text-white lg:hidden" role="dialog" aria-modal="true" aria-label={tr("nav.menu")}>
          <div className="container-x flex h-[82px] items-center justify-between">
            <Logo light />
            <button type="button" onClick={() => setMobile(false)} aria-label={tr("nav.close")} className="rounded p-2 text-white">
              <X size={24} aria-hidden="true" />
            </button>
          </div>
          <nav aria-label="Mobile" className="container-x flex-1 overflow-y-auto pb-10">
            <ul className="divide-y divide-white/10 border-y border-white/10">
              {[
                ["/", tr("nav.home")],
                ["/about", tr("nav.about")],
                ["/insights", tr("nav.insights")],
                ["/case-studies", locale === "ar" ? "دراسات الحالة" : "Case Studies"],
                ["/careers", tr("nav.careers")],
                ["/contact", tr("nav.contact")],
                ["/consultation", tr("nav.consultation")],
                ["/portal", tr("nav.portal")],
              ].map(([href, label]) => (
                <li key={href}>
                  <Link href={href} className="block py-4 text-lg font-semibold text-white/90 hover:text-white">{label}</Link>
                </li>
              ))}
              <li>
                <button
                  type="button"
                  onClick={() => setMobileDivisions((v) => !v)}
                  aria-expanded={mobileDivisions}
                  className="flex w-full items-center justify-between py-4 text-lg font-semibold text-white/90"
                >
                  {tr("nav.divisions")}
                  <ChevronDown size={18} className={`transition-transform ${mobileDivisions ? "rotate-180" : ""}`} aria-hidden="true" />
                </button>
                {mobileDivisions && (
                  <ul className="mb-3 space-y-1 ps-3">
                    <li><Link href="/divisions" className="block py-2 text-sm text-white/70 hover:text-white">{locale === "ar" ? "جميع الأقسام" : "All divisions"}</Link></li>
                    {divisions.map((d) => (
                      <li key={d.slug}>
                        <Link href={`/divisions/${d.slug}`} className="flex items-center gap-2 py-2 text-sm text-white/70 hover:text-white">
                          <span className="h-1.5 w-1.5 rounded-full" style={{ background: d.accent }} aria-hidden="true" />
                          {d.name[locale]}
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            </ul>
            <div className="mt-8 flex flex-col gap-3">
              <Link href={accountHref} className="btn btn-primary w-full">{accountLabel}</Link>
              <a href={switchHref} onClick={switchLocale} hrefLang={other} className="btn btn-outline w-full">{tr("nav.language")}</a>
            </div>
            <p className="mt-8 text-xs leading-relaxed text-white/50">
              {locale === "ar" ? "الدوحة، دولة قطر" : "Doha, State of Qatar"}
            </p>
          </nav>
        </div>
      )}
    </>
  );
}
