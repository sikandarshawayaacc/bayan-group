import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { getSettings } from "@/lib/db";
import { PageHead, Panel } from "@/components/admin/AdminUI";
import { SettingsEditor, TestEmailForm } from "@/components/admin/AdminForms";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const user = await requireStaff();
  if (user.role !== "super_admin") redirect("/admin");
  const settings = getSettings();

  return (
    <>
      <PageHead title="Website Settings" subtitle="These values control the header, footer and contact details across both languages." />

      <div className="space-y-6">
        <Panel title="Company">
          <SettingsEditor
            settings={settings}
            fields={[
              { key: "company_name_en", label: "Company name (English)" },
              { key: "company_name_ar", label: "Company name (Arabic)" },
              { key: "tagline_en", label: "Tagline (English)", multiline: true },
              { key: "tagline_ar", label: "Tagline (Arabic)", multiline: true },
              { key: "legal_note_en", label: "Legal note (English)", multiline: true, hint: "Shown in the footer. Do not state a registration number until it is verified." },
              { key: "legal_note_ar", label: "Legal note (Arabic)", multiline: true },
            ]}
          />
        </Panel>

        <Panel title="Contact">
          <SettingsEditor
            settings={settings}
            fields={[
              { key: "email", label: "Public email" },
              { key: "phone", label: "Phone" },
              { key: "whatsapp", label: "WhatsApp number" },
              { key: "address_en", label: "Address (English)", multiline: true, hint: "A real street address must be verified before it is published." },
              { key: "address_ar", label: "Address (Arabic)", multiline: true },
              { key: "hours_en", label: "Opening hours (English)" },
              { key: "hours_ar", label: "Opening hours (Arabic)" },
            ]}
          />
        </Panel>

        <Panel title="Social profiles">
          <SettingsEditor
            settings={settings}
            fields={[
              { key: "linkedin", label: "LinkedIn URL", hint: "Leave blank to hide the icon in the footer." },
              { key: "instagram", label: "Instagram URL" },
              { key: "x", label: "X (Twitter) URL" },
            ]}
          />
        </Panel>

        <Panel title="Email delivery">
          <div className="mb-4 rounded border border-line bg-light/60 p-3 text-[0.78rem] text-muted">
            <p>
              Provider: <span className="font-semibold text-navy">{process.env.RESEND_API_KEY ? "Resend (HTTP API)" : "Local outbox fallback"}</span>
              {" · "}Sender: <span className="font-mono" dir="ltr">{process.env.EMAIL_FROM || "BAYAN GROUP <onboarding@resend.dev>"}</span>
            </p>
            <p className="mt-1">
              Without an API key, messages are written to <code>data/outbox</code> so every flow stays verifiable in development.
            </p>
          </div>
          <TestEmailForm />
        </Panel>

        <Panel title="Operations">
          <SettingsEditor
            settings={settings}
            fields={[
              { key: "email_notifications", label: "Internal notifications (1 = on, 0 = off)" },
              { key: "maintenance", label: "Maintenance flag (1 = on, 0 = off)", hint: "Recorded as a setting; no public maintenance mode is enabled." },
            ]}
          />
        </Panel>
      </div>
    </>
  );
}
