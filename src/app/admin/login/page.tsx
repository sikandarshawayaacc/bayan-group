import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { getLocale } from "@/lib/i18n";
import { AuthShell } from "@/components/AuthShell";
import { LoginForm } from "@/components/AuthForms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Staff Login", robots: { index: false, follow: false } };

export default async function AdminLoginPage() {
  const user = await getCurrentUser();
  if (user) redirect(isStaff(user) ? "/admin" : "/portal");
  const locale = await getLocale();

  return (
    <AuthShell
      title={locale === "ar" ? "دخول الفريق" : "Staff sign in"}
      subtitle={locale === "ar" ? "هذه المساحة مخصصة لفريق مجموعة بيان." : "This area is restricted to the BAYAN GROUP team."}
      aside={
        <p>
          {locale === "ar"
            ? "كل إجراء إداري يُسجَّل في سجل التدقيق مع المستخدم والوقت."
            : "Every administrative action is written to the audit log with the user and timestamp."}
        </p>
      }
    >
      <LoginForm locale={locale} next="/admin" />
    </AuthShell>
  );
}
