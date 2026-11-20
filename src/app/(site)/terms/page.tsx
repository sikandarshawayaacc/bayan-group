import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "الشروط والأحكام" : "Terms & Conditions",
    alternates: { canonical: "/terms" },
  };
}

export default function Page() {
  return <LegalPage slug="terms" fallbackTitle="Terms & Conditions" />;
}
