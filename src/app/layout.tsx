import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { getLocale, dir } from "@/lib/i18n";
import { getSettings } from "@/lib/db";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

export async function generateMetadata(): Promise<Metadata> {
  const s = getSettings();
  const locale = await getLocale();
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  return {
    metadataBase: new URL(site),
    title: {
      default: locale === "ar" ? s.seo_title_ar : s.seo_title_en,
      template: `%s — ${locale === "ar" ? s.company_name_ar : s.company_name_en}`,
    },
    description: locale === "ar" ? s.seo_description_ar : s.seo_description_en,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      siteName: locale === "ar" ? s.company_name_ar : s.company_name_en,
      title: locale === "ar" ? s.seo_title_ar : s.seo_title_en,
      description: locale === "ar" ? s.seo_description_ar : s.seo_description_en,
      locale: locale === "ar" ? "ar_QA" : "en_QA",
    },
    robots: { index: true, follow: true },
    icons: { icon: "/favicon.svg" },
  };
}

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const s = getSettings();
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: s.company_name_en,
    alternateName: s.company_name_ar,
    url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
    email: s.email,
    telephone: s.phone,
    address: { "@type": "PostalAddress", addressLocality: "Doha", addressCountry: "QA" },
    description: s.seo_description_en,
  };

  return (
    <html lang={locale} dir={dir(locale)} className={manrope.variable}>
      <body className="min-h-screen bg-white text-ink antialiased">
        {children}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />
      </body>
    </html>
  );
}
