import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { all } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { PasswordForm } from "@/components/PortalForms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Password & Security", robots: { index: false, follow: false } };

type Session = { created_at: string; expires_at: string; ip: string | null; user_agent: string | null };

export default async function SecurityPage() {
  const user = await requireUser();
  const locale = await getLocale();
  const sessions = all<Session>(
    "SELECT created_at,expires_at,ip,user_agent FROM sessions WHERE user_id = ? AND expires_at > datetime('now') ORDER BY created_at DESC LIMIT 8",
    [user.id],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[1.4rem] font-bold text-navy">{locale === "ar" ? "كلمة المرور والأمان" : "Password & security"}</h1>
        <p className="mt-1 text-[0.83rem] text-muted">
          {locale === "ar" ? "تغيير كلمة المرور ينهي الجلسات الأخرى المفتوحة على حسابك." : "Changing your password signs out other open sessions on your account."}
        </p>
      </header>

      <section className="rounded-md border border-line bg-white p-6">
        <h2 className="mb-4 text-[0.9rem] font-bold text-navy">{locale === "ar" ? "تغيير كلمة المرور" : "Change password"}</h2>
        <PasswordForm locale={locale} />
      </section>

      <section className="rounded-md border border-line bg-white p-6">
        <h2 className="text-[0.9rem] font-bold text-navy">{locale === "ar" ? "الجلسات النشطة" : "Active sessions"}</h2>
        <ul className="mt-4 space-y-3">
          {sessions.map((s) => (
            <li key={s.created_at + (s.ip ?? "")} className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3 text-[0.78rem] last:border-0 last:pb-0">
              <div>
                <p className="font-semibold text-navy">{s.user_agent?.slice(0, 70) ?? (locale === "ar" ? "جهاز غير معروف" : "Unknown device")}</p>
                <p className="text-[0.7rem] text-muted" dir="ltr">{s.ip ?? "—"}</p>
              </div>
              <p className="text-[0.7rem] text-muted">
                {new Date(s.created_at).toLocaleString(locale === "ar" ? "ar-QA" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
              </p>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-[0.72rem] leading-relaxed text-muted">
          {locale === "ar"
            ? "تنتهي الجلسات تلقائياً بعد سبعة أيام. إذا لاحظت جهازاً لا تعرفه، غيّر كلمة المرور وأبلغنا."
            : "Sessions expire after seven days. If you see a device you do not recognise, change your password and tell us."}
        </p>
      </section>
    </div>
  );
}
