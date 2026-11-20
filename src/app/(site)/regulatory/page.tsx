import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { LegalPage } from "@/components/LegalPage";

export const dynamic = "force-dynamic";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  return {
    title: locale === "ar" ? "الإفصاحات التنظيمية والقانونية" : "Regulatory & Legal Disclosures",
    alternates: { canonical: "/regulatory" },
  };
}

export default function Page() {
  return <LegalPage slug="regulatory" fallbackTitle="Regulatory & Legal Disclosures" />;
}
