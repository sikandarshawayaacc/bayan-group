import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { CookieBanner } from "@/components/CookieBanner";
import { getLocale } from "@/lib/i18n";
import { getCurrentUser } from "@/lib/auth";

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const user = await getCurrentUser();
  return (
    <div className="flex min-h-screen flex-col">
      <Header locale={locale} user={user ? { name: user.name, role: user.role } : null} />
      <main id="main" className="flex-1">{children}</main>
      <Footer locale={locale} />
      <CookieBanner locale={locale} />
    </div>
  );
}
