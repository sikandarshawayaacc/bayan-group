import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return { title: locale === "ar" ? "تسجيل الدخول" : "Client Login", robots: { index: false, follow: false } };
}

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ next?: string; reset?: string }> }) {
  const user = await getCurrentUser();
  if (user) redirect(user.role === "client" ? "/portal" : "/admin");
  const locale = await getLocale();
  const sp = await searchParams;

  return (
    <AuthShell
      title={locale === "ar" ? "تسجيل الدخول" : "Sign in"}
      subtitle={locale === "ar"
        ? "استخدم بريدك الإلكتروني وكلمة المرور للوصول إلى بوابة العملاء."
        : "Use your email and password to access the client portal."}
    >
      <LoginForm
        locale={locale}
        next={sp.next}
        notice={sp.reset ? (locale === "ar" ? "تم تعيين كلمة المرور. سجّل الدخول." : "Password set. Please sign in.") : undefined}
      />
    </AuthShell>
  );
}
