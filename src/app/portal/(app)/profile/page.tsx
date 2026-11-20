import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { requireUser } from "@/lib/auth";
import { ProfileForm } from "@/components/PortalForms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Profile", robots: { index: false, follow: false } };

export default async function ProfilePage() {
  const user = await requireUser();
  const locale = await getLocale();

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[1.4rem] font-bold text-navy">{locale === "ar" ? "الملف الشخصي" : "Profile"}</h1>
        <p className="mt-1 text-[0.83rem] text-muted">
          {locale === "ar" ? "بيانات التواصل المستخدمة في المراسلات والمستندات." : "Contact details used for correspondence and documents."}
        </p>
      </header>

      <section className="rounded-md border border-line bg-white p-6">
        <ProfileForm locale={locale} user={{ name: user.name, email: user.email, company: user.company, phone: user.phone }} />
      </section>

      <section className="rounded-md border border-line bg-white p-6">
        <h2 className="text-[0.9rem] font-bold text-navy">{locale === "ar" ? "بيانات الحساب" : "Account"}</h2>
        <dl className="mt-4 grid gap-3 text-[0.8rem] sm:grid-cols-3">
          <div>
            <dt className="text-muted">{locale === "ar" ? "تاريخ الإنشاء" : "Member since"}</dt>
            <dd className="font-semibold text-navy">{new Date(user.created_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB")}</dd>
          </div>
          <div>
            <dt className="text-muted">{locale === "ar" ? "آخر دخول" : "Last sign-in"}</dt>
            <dd className="font-semibold text-navy">{user.last_login_at ? new Date(user.last_login_at).toLocaleDateString(locale === "ar" ? "ar-QA" : "en-GB") : "—"}</dd>
          </div>
          <div>
            <dt className="text-muted">{locale === "ar" ? "نوع الحساب" : "Account type"}</dt>
            <dd className="font-semibold text-navy">{locale === "ar" ? "عميل" : "Client"}</dd>
          </div>
        </dl>
      </section>
    </div>
  );
}
