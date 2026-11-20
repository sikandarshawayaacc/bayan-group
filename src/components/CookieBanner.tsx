"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { t, type Locale } from "@/lib/dictionary";

const KEY = "bayan_cookie_consent";

export function CookieBanner({ locale }: { locale: Locale }) {
  const [open, setOpen] = useState(false);
  const tr = (k: string) => t(locale, k);

  useEffect(() => {
    // Consent lives in localStorage, which is only readable after hydration.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!localStorage.getItem(KEY)) setOpen(true);
    const reopen = () => setOpen(true);
    window.addEventListener("bayan-cookie-open", reopen);
    return () => window.removeEventListener("bayan-cookie-open", reopen);
  }, []);

  if (!open) return null;

  const choose = (value: "all" | "essential") => {
    localStorage.setItem(KEY, value);
    document.cookie = `bayan_cookie_consent=${value}; path=/; max-age=31536000; samesite=lax`;
    setOpen(false);
  };

  return (
    <div role="dialog" aria-label={tr("cookie.title")} className="fixed inset-x-0 bottom-0 z-[70] border-t border-line bg-white p-4 shadow-[0_-12px_40px_-20px_rgba(23,43,58,0.35)]">
      <div className="container-x flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="max-w-3xl">
          <p className="text-sm font-bold text-navy">{tr("cookie.title")}</p>
          <p className="mt-1 text-[0.78rem] leading-relaxed text-muted">
            {tr("cookie.body")}{" "}
            <Link href="/cookies" className="underline hover:text-navy">{tr("footer.cookiePolicy")}</Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-2">
          <button type="button" onClick={() => choose("essential")} className="btn btn-ghost btn-sm">{tr("cookie.decline")}</button>
          <button type="button" onClick={() => choose("all")} className="btn btn-primary btn-sm">{tr("cookie.accept")}</button>
        </div>
      </div>
    </div>
  );
}
