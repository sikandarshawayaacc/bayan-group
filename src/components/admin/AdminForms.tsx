"use client";

import { useActionState } from "react";
import { Loader2, Save } from "lucide-react";
import type { ReactNode } from "react";
import {
  addEnquiryNote,
  saveArticle,
  savePage,
  saveProduct,
  saveProject,
  saveSettings,
  saveUser,
  sendTestEmail,
  staffUploadDocument,
  uploadMedia,
  replyToClient,
  type AdminState,
} from "@/app/actions/admin";

type Action = (prev: AdminState, formData: FormData) => Promise<AdminState>;

export function ActionForm({
  action,
  children,
  submit = "Save",
  hidden,
  className = "space-y-4",
  compact = false,
}: {
  action: Action;
  children: ReactNode;
  submit?: string;
  hidden?: Record<string, string | number>;
  className?: string;
  compact?: boolean;
}) {
  const [state, formAction, pending] = useActionState<AdminState, FormData>(action, {});
  const errors = state.errors ?? {};
  return (
    <form action={formAction} className={className}>
      {hidden && Object.entries(hidden).map(([k, v]) => <input key={k} type="hidden" name={k} value={v} />)}
      {state.message && <p role="status" className="rounded border border-success/30 bg-success/5 px-3 py-2 text-[0.78rem] text-success">{state.message}</p>}
      {Object.keys(errors).length > 0 && (
        <ul role="alert" className="rounded border border-error/30 bg-error/5 px-3 py-2 text-[0.78rem] text-error">
          {Object.entries(errors).map(([k, v]) => <li key={k}>{v}</li>)}
        </ul>
      )}
      {children}
      <button type="submit" className={`btn btn-primary ${compact ? "btn-sm" : ""}`} disabled={pending}>
        {pending ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Save size={15} aria-hidden="true" />}
        {submit}
      </button>
    </form>
  );
}

export function AField({
  name,
  label,
  defaultValue,
  type = "text",
  required,
  placeholder,
  hint,
  readOnly,
  dir,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  type?: string;
  required?: boolean;
  placeholder?: string;
  hint?: string;
  readOnly?: boolean;
  dir?: "ltr" | "rtl";
}) {
  return (
    <div className="field">
      <label className="label" htmlFor={name}>{label}{required && <span className="text-error" aria-hidden="true"> *</span>}</label>
      <input id={name} name={name} type={type} defaultValue={defaultValue ?? ""} required={required} placeholder={placeholder} readOnly={readOnly} dir={dir} className={`input ${readOnly ? "bg-light text-muted" : ""}`} />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function ATextarea({
  name,
  label,
  defaultValue,
  rows = 4,
  required,
  hint,
  mono,
}: {
  name: string;
  label: string;
  defaultValue?: string | null;
  rows?: number;
  required?: boolean;
  hint?: string;
  mono?: boolean;
}) {
  return (
    <div className="field">
      <label className="label" htmlFor={name}>{label}{required && <span className="text-error" aria-hidden="true"> *</span>}</label>
      <textarea id={name} name={name} rows={rows} defaultValue={defaultValue ?? ""} required={required} className={`input ${mono ? "font-mono text-[0.78rem]" : ""}`} />
      {hint && <p className="hint">{hint}</p>}
    </div>
  );
}

export function ASelect({
  name,
  label,
  defaultValue,
  options,
}: {
  name: string;
  label: string;
  defaultValue?: string | number | null;
  options: { value: string | number; label: string }[];
}) {
  return (
    <div className="field">
      <label className="label" htmlFor={name}>{label}</label>
      <select id={name} name={name} defaultValue={defaultValue ?? ""} className="input">
        {options.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
      </select>
    </div>
  );
}

export function ACheck({ name, label, defaultChecked }: { name: string; label: string; defaultChecked?: boolean }) {
  return (
    <label className="flex items-center gap-2 text-[0.8rem] text-navy">
      <input type="checkbox" name={name} defaultChecked={defaultChecked} className="h-4 w-4 accent-[#239A96]" />
      {label}
    </label>
  );
}

export const EnquiryNoteForm = ({ id }: { id: number }) => (
  <ActionForm action={addEnquiryNote} hidden={{ id }} submit="Add note">
    <ATextarea name="body" label="Internal note" rows={3} required hint="Visible to staff only. Record calls, decisions and next steps." />
  </ActionForm>
);

export const ProjectEditor = ({ project, clients, divisions }: {
  project?: { id: number; title: string; client_id: number; division: string; status: string; progress: number; description: string | null; start_date: string | null; due_date: string | null };
  clients: { id: number; name: string }[];
  divisions: { value: string; label: string }[];
}) => (
  <ActionForm action={saveProject} hidden={project ? { id: project.id } : undefined} submit={project ? "Update project" : "Create project"}>
    <div className="grid gap-4 sm:grid-cols-2">
      <AField name="title" label="Title" defaultValue={project?.title} required />
      <ASelect name="client_id" label="Client" defaultValue={project?.client_id} options={[{ value: "", label: "Select a client" }, ...clients.map((c) => ({ value: c.id, label: c.name }))]} />
      <ASelect name="division" label="Division" defaultValue={project?.division} options={divisions} />
      <ASelect name="status" label="Status" defaultValue={project?.status ?? "IN_PROGRESS"} options={["APPROVED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"].map((s) => ({ value: s, label: s.replace(/_/g, " ") }))} />
      <AField name="progress" label="Progress %" type="number" defaultValue={project?.progress ?? 0} />
      <AField name="start_date" label="Start date" type="date" defaultValue={project?.start_date?.slice(0, 10)} />
      <AField name="due_date" label="Due date" type="date" defaultValue={project?.due_date?.slice(0, 10)} />
    </div>
    <ATextarea name="description" label="Scope summary" defaultValue={project?.description} rows={3} />
  </ActionForm>
);

export const ProductEditor = ({ product }: {
  product?: { id: number; slug: string; name: string; category: string; sku: string | null; summary: string | null; description: string | null; specs: string | null; price_note: string | null; active: number; featured: number };
}) => (
  <ActionForm action={saveProduct} hidden={product ? { id: product.id } : undefined} submit={product ? "Update product" : "Create product"}>
    <div className="grid gap-4 sm:grid-cols-2">
      <AField name="name" label="Name" defaultValue={product?.name} required />
      <ASelect name="category" label="Category" defaultValue={product?.category ?? "Trading"} options={["Trading", "Enterprise Software", "Digital Transformation", "Advisory", "Investments"].map((c) => ({ value: c, label: c }))} />
      <AField name="slug" label="Slug" defaultValue={product?.slug} hint="Leave blank to generate from the name." dir="ltr" />
      <AField name="sku" label="SKU" defaultValue={product?.sku} dir="ltr" />
      <AField name="price_note" label="Price note" defaultValue={product?.price_note} hint="e.g. Quoted per RFQ" />
    </div>
    <ATextarea name="summary" label="Summary" defaultValue={product?.summary} rows={2} />
    <ATextarea name="description" label="Description" defaultValue={product?.description} rows={4} />
    <ATextarea name="specs" label="Specifications" defaultValue={product?.specs} rows={2} hint="Separate each item with |" />
    <div className="flex gap-6">
      <ACheck name="active" label="Visible on the website" defaultChecked={product ? !!product.active : true} />
      <ACheck name="featured" label="Featured" defaultChecked={!!product?.featured} />
    </div>
  </ActionForm>
);

export const ArticleEditor = ({ article }: {
  article?: { id: number; slug: string; category: string; division: string | null; title_en: string; title_ar: string | null; excerpt_en: string | null; excerpt_ar: string | null; body_en: string; body_ar: string | null; status: string };
}) => (
  <ActionForm action={saveArticle} hidden={article ? { id: article.id } : undefined} submit={article ? "Update article" : "Create article"}>
    <div className="grid gap-4 sm:grid-cols-2">
      <AField name="title_en" label="Title (English)" defaultValue={article?.title_en} required />
      <AField name="title_ar" label="Title (Arabic)" defaultValue={article?.title_ar} dir="rtl" />
      <ASelect name="category" label="Category" defaultValue={article?.category ?? "Technology"} options={["Technology", "Advisory", "Trading", "Investments", "Operations"].map((c) => ({ value: c, label: c }))} />
      <ASelect name="division" label="Division" defaultValue={article?.division ?? ""} options={[{ value: "", label: "Group-wide" }, { value: "technologies", label: "Technologies" }, { value: "advisory", label: "Advisory" }, { value: "trading", label: "Trading" }, { value: "investments", label: "Investments" }]} />
      <AField name="slug" label="Slug" defaultValue={article?.slug} dir="ltr" hint="Leave blank to generate from the English title." />
      <ASelect name="status" label="Status" defaultValue={article?.status ?? "draft"} options={[{ value: "draft", label: "Draft" }, { value: "published", label: "Published" }]} />
    </div>
    <ATextarea name="excerpt_en" label="Excerpt (English)" defaultValue={article?.excerpt_en} rows={2} />
    <ATextarea name="excerpt_ar" label="Excerpt (Arabic)" defaultValue={article?.excerpt_ar} rows={2} />
    <ATextarea name="body_en" label="Body (English, Markdown)" defaultValue={article?.body_en} rows={12} required mono />
    <ATextarea name="body_ar" label="Body (Arabic, Markdown)" defaultValue={article?.body_ar} rows={10} mono />
  </ActionForm>
);

export const PageEditor = ({ page }: {
  page: { id: number; slug: string; title_en: string; title_ar: string | null; body_en: string; body_ar: string | null; seo_title: string | null; seo_description: string | null; status: string };
}) => (
  <ActionForm action={savePage} hidden={{ id: page.id }} submit="Save page">
    <div className="grid gap-4 sm:grid-cols-2">
      <AField name="title_en" label="Title (English)" defaultValue={page.title_en} required />
      <AField name="title_ar" label="Title (Arabic)" defaultValue={page.title_ar} dir="rtl" />
      <ASelect name="status" label="Status" defaultValue={page.status} options={[{ value: "published", label: "Published" }, { value: "draft", label: "Draft" }]} />
      <AField name="seo_title" label="SEO title" defaultValue={page.seo_title} />
    </div>
    <ATextarea name="seo_description" label="SEO description" defaultValue={page.seo_description} rows={2} />
    <ATextarea name="body_en" label="Body (English, Markdown)" defaultValue={page.body_en} rows={14} required mono />
    <ATextarea name="body_ar" label="Body (Arabic, Markdown)" defaultValue={page.body_ar} rows={12} mono />
  </ActionForm>
);

export const UserEditor = ({ user, divisions }: {
  user?: { id: number; name: string; email: string; role: string; division: string | null; company: string | null; phone: string | null; active: number };
  divisions: { value: string; label: string }[];
}) => (
  <ActionForm action={saveUser} hidden={user ? { id: user.id } : undefined} submit={user ? "Update user" : "Create user"}>
    <div className="grid gap-4 sm:grid-cols-2">
      <AField name="name" label="Name" defaultValue={user?.name} required />
      <AField name="email" label="Email" type="email" defaultValue={user?.email} required dir="ltr" />
      <ASelect name="role" label="Role" defaultValue={user?.role ?? "client"} options={[
        { value: "client", label: "Client" },
        { value: "sales", label: "Sales / BD" },
        { value: "division_manager", label: "Division manager" },
        { value: "editor", label: "Editor" },
        { value: "super_admin", label: "Super admin" },
      ]} />
      <ASelect name="division" label="Division (for division managers)" defaultValue={user?.division ?? ""} options={[{ value: "", label: "All divisions" }, ...divisions]} />
      <AField name="company" label="Company" defaultValue={user?.company} />
      <AField name="phone" label="Phone" defaultValue={user?.phone} dir="ltr" />
      <AField name="password" label={user ? "New password (optional)" : "Password"} type="password" hint="At least 10 characters. Leave blank to keep the current password." />
    </div>
    <ACheck name="active" label="Account active" defaultChecked={user ? !!user.active : true} />
  </ActionForm>
);

export const SettingsEditor = ({ settings, fields }: {
  settings: Record<string, string>;
  fields: { key: string; label: string; multiline?: boolean; hint?: string }[];
}) => (
  <ActionForm action={saveSettings} submit="Save settings">
    <div className="grid gap-4 sm:grid-cols-2">
      {fields.map((f) => (
        <div key={f.key} className={f.multiline ? "sm:col-span-2" : ""}>
          {f.multiline ? (
            <ATextarea name={`s_${f.key}`} label={f.label} defaultValue={settings[f.key] ?? ""} rows={3} hint={f.hint} />
          ) : (
            <AField name={`s_${f.key}`} label={f.label} defaultValue={settings[f.key] ?? ""} hint={f.hint} />
          )}
        </div>
      ))}
    </div>
  </ActionForm>
);

export const MediaUpload = () => (
  <ActionForm action={uploadMedia} submit="Upload image" compact>
    <div className="grid gap-3 sm:grid-cols-[1fr_1fr]">
      <div className="field">
        <label className="label" htmlFor="media-file">Image file</label>
        <input id="media-file" name="file" type="file" accept="image/png,image/jpeg" required className="input file:mr-3 file:rounded file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-[0.72rem] file:font-semibold file:text-white" />
      </div>
      <AField name="alt" label="Alt text" hint="Describe the image for screen readers." />
    </div>
  </ActionForm>
);

export const ClientReplyForm = ({ clientId }: { clientId: number }) => (
  <ActionForm action={replyToClient} hidden={{ client_id: clientId }} submit="Send reply">
    <ATextarea name="body" label="Reply in the client portal" rows={3} required />
  </ActionForm>
);

export const ClientDocumentForm = ({ clientId, projects }: { clientId: number; projects: { id: number; title: string }[] }) => (
  <ActionForm action={staffUploadDocument} hidden={{ client_id: clientId }} submit="Share document">
    <ASelect name="project_id" label="Project" defaultValue="" options={[{ value: "", label: "No project" }, ...projects.map((p) => ({ value: p.id, label: p.title }))]} />
    <div className="field">
      <label className="label" htmlFor="client-doc">File</label>
      <input id="client-doc" name="file" type="file" required className="input file:mr-3 file:rounded file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-[0.72rem] file:font-semibold file:text-white" />
    </div>
  </ActionForm>
);

export const TestEmailForm = () => (
  <ActionForm action={sendTestEmail} submit="Send test" compact>
    <AField name="to" label="Send a test email to" type="email" required dir="ltr" />
  </ActionForm>
);
