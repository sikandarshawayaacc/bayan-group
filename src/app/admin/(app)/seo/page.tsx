import Link from "next/link";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import { PageHead, Panel } from "@/components/admin/AdminUI";
import { SettingsEditor } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

export default async function SeoPage() {
  const user = await requireStaff();
  if (user.role !== "super_admin") redirect("/admin");
  const settings = getSettings();

  return (
    <>
      <PageHead title="SEO Settings" subtitle="Default metadata for every page that does not override it." />

      <div className="space-y-6">
        <Panel title="Default metadata">
          <SettingsEditor
            settings={settings}
            fields={[
              { key: "seo_title_en", label: "Default title (English)", multiline: true },
              { key: "seo_title_ar", label: "Default title (Arabic)", multiline: true },
              { key: "seo_description_en", label: "Default description (English)", multiline: true },
              { key: "seo_description_ar", label: "Default description (Arabic)", multiline: true },
            ]}
          />
        </Panel>

        <Panel title="Generated files">
          <ul className="space-y-2 text-[0.82rem]">
            <li><Link href="/sitemap.xml" className="font-semibold text-teal-dark hover:underline">/sitemap.xml</Link> <span className="text-muted">— published pages, divisions, articles and case studies</span></li>
            <li><Link href="/robots.txt" className="font-semibold text-teal-dark hover:underline">/robots.txt</Link> <span className="text-muted">— disallows /admin, /portal and /api</span></li>
            <li><Link href="/llms.txt" className="font-semibold text-teal-dark hover:underline">/llms.txt</Link> <span className="text-muted">— machine-readable summary for AI assistants</span></li>
          </ul>
          <p className="mt-4 text-[0.75rem] leading-relaxed text-muted">
            Every page sets a canonical URL and Open Graph tags. The organisation schema in the root layout reads the
            company name, email and phone from these settings.
          </p>
        </Panel>
      </div>
    </>
  );
}
