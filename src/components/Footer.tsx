import Link from "next/link";
import { Mail, MapPin, Phone } from "lucide-react";
import { getSettings } from "@/lib/db";
import { t, type Locale } from "@/lib/dictionary";
import { divisions } from "@/lib/content";
import { Logo } from "./Logo";
import { CookieSettingsButton } from "./CookieSettingsButton";

export function Footer({ locale }: { locale: Locale }) {
  const s = getSettings();
  const tr = (k: string) => t(locale, k);
  const year = new Date().getFullYear();
  const legal = locale === "ar" ? s.legal_note_ar : s.legal_note_en;

  return (
    <footer className="bg-navy text-white">
      <div className="container-x grid gap-10 py-16 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
        <div>
          <Logo light />
          <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
            {locale === "ar" ? s.tagline_ar : s.tagline_en}
          </p>
          <ul className="mt-6 space-y-3 text-sm text-white/70">
            <li className="flex items-start gap-2.5">
              <MapPin size={15} className="mt-1 shrink-0 text-teal" aria-hidden="true" />
              <span>{locale === "ar" ? s.address_ar : s.address_en}</span>
            </li>
            <li className="flex items-start gap-2.5">
              <Mail size={15} className="mt-1 shrink-0 text-teal" aria-hidden="true" />
              <a href={`mailto:${s.email}`} className="hover:text-white">{s.email}</a>
            </li>
            <li className="flex items-start gap-2.5">
              <Phone size={15} className="mt-1 shrink-0 text-teal" aria-hidden="true" />
              <a href={`tel:${s.phone.replace(/\s/g, "")}`} className="hover:text-white" dir="ltr">{s.phone}</a>
            </li>
          </ul>
        </div>

        <nav aria-label={tr("footer.divisions")}>
          <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/40">{tr("footer.divisions")}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.83rem]">
            {divisions.map((d) => (
              <li key={d.slug}><Link href={`/divisions/${d.slug}`} className="text-white/70 hover:text-white">{d.name[locale]}</Link></li>
            ))}
            <li><Link href="/divisions" className="text-white/70 hover:text-white">{locale === "ar" ? "نظرة عامة" : "Divisions overview"}</Link></li>
          </ul>
        </nav>

        <nav aria-label={tr("footer.company")}>
          <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/40">{tr("footer.company")}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.83rem]">
            {[
              ["/about", tr("nav.about")],
              ["/insights", tr("nav.insights")],
              ["/case-studies", locale === "ar" ? "دراسات الحالة" : "Case Studies"],
              ["/careers", tr("nav.careers")],
              ["/contact", tr("nav.contact")],
              ["/consultation", tr("nav.consultation")],
              ["/portal", tr("nav.portal")],
            ].map(([href, label]) => (
              <li key={href}><Link href={href} className="text-white/70 hover:text-white">{label}</Link></li>
            ))}
          </ul>
        </nav>

        <nav aria-label={tr("footer.legal")}>
          <h2 className="text-[0.7rem] font-bold uppercase tracking-[0.18em] text-white/40">{tr("footer.legal")}</h2>
          <ul className="mt-4 space-y-2.5 text-[0.83rem]">
            {[
              ["/privacy", tr("footer.privacy")],
              ["/terms", tr("footer.terms")],
              ["/cookies", tr("footer.cookiePolicy")],
              ["/regulatory", tr("footer.regulatory")],
            ].map(([href, label]) => (
              <li key={href}><Link href={href} className="text-white/70 hover:text-white">{label}</Link></li>
            ))}
            <li><CookieSettingsButton label={tr("footer.cookies")} /></li>
          </ul>
          {(s.linkedin || s.instagram || s.x) && (
            <div className="mt-5 flex gap-3 text-[0.75rem]">
              {s.linkedin && <a href={s.linkedin} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">LinkedIn</a>}
              {s.instagram && <a href={s.instagram} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">Instagram</a>}
              {s.x && <a href={s.x} target="_blank" rel="noopener noreferrer" className="text-white/60 hover:text-white">X</a>}
            </div>
          )}
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="container-x flex flex-col gap-3 py-6 text-[0.72rem] leading-relaxed text-white/45 md:flex-row md:items-start md:justify-between">
          <p>© {year} {locale === "ar" ? s.company_name_ar : s.company_name_en}. {tr("footer.rights")}</p>
          <p className="max-w-2xl md:text-end">{legal}</p>
        </div>
      </div>
    </footer>
  );
}
