import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { AuthShell } from "@/components/AuthShell";
import { ForgotForm } from "@/components/AuthForms";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "ar" ? "إعادة تعيين كلمة المرور" : "Reset Password", robots: { index: false, follow: false } };
}

export default async function ForgotPage() {
  const locale = await getLocale();
  return (
    <AuthShell
      title={locale === "ar" ? "إعادة تعيين كلمة المرور" : "Reset your password"}
      subtitle={locale === "ar"
        ? "أدخل بريد حسابك وسنرسل رابطاً صالحاً لمدة ساعة."
        : "Enter your account email and we will send a link valid for one hour."}
    >
      <ForgotForm locale={locale} />
    </AuthShell>
  );
}
