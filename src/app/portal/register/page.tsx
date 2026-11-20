import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { RegisterForm } from "@/components/AuthForms";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "ar" ? "إنشاء حساب" : "Create Account", robots: { index: false, follow: false } };
}

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "client" ? "/portal" : "/admin");
  const locale = await getLocale();

  return (
    <AuthShell
      title={locale === "ar" ? "إنشاء حساب" : "Create an account"}
      subtitle={locale === "ar"
        ? "حساب البوابة متاح للعملاء والمؤسسات التي تعمل مع المجموعة."
        : "Portal accounts are for clients and organisations working with the group."}
    >
      <RegisterForm locale={locale} />
    </AuthShell>
  );
}
