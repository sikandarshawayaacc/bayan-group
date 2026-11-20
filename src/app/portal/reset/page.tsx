import type { Metadata } from "next";
import Link from "next/link";
import { getLocale } from "@/lib/i18n";
import { AuthShell } from "@/components/AuthShell";
import { ResetForm } from "@/components/AuthForms";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "ar" ? "تعيين كلمة مرور جديدة" : "Set New Password", robots: { index: false, follow: false } };
}

export default async function ResetPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const locale = await getLocale();
  const token = (await searchParams).token ?? "";

  return (
    <AuthShell
      title={locale === "ar" ? "تعيين كلمة مرور جديدة" : "Set a new password"}
      subtitle={locale === "ar"
        ? "اختر كلمة مرور لا تقل عن ١٠ أحرف. سيتم تسجيل الخروج من الجلسات الأخرى."
        : "Choose a password of at least 10 characters. Other sessions will be signed out."}
    >
      {token ? (
        <ResetForm locale={locale} token={token} />
      ) : (
        <div className="rounded border border-error/30 bg-error/5 px-4 py-3 text-[0.85rem] text-error">
          {locale === "ar" ? "الرابط لا يحتوي على رمز صالح." : "This link does not contain a valid token."}{" "}
          <Link href="/portal/forgot" className="font-semibold underline">{locale === "ar" ? "اطلب رابطاً جديداً" : "Request a new link"}</Link>
        </div>
      )}
    </AuthShell>
  );
}
