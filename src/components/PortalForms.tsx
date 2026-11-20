"use client";

import { useActionState } from "react";
import { Loader2, Send, Upload } from "lucide-react";
import {
  sendClientMessage,
  uploadClientDocument,
  type PortalState,
} from "@/app/actions/portal";
import { changePassword, updateProfile, type AuthState } from "@/app/actions/auth";
import { t, type Locale } from "@/lib/dictionary";

function Notice({ state }: { state: PortalState | AuthState }) {
  return (
    <>
      {state.message && (
        <div role="status" className="rounded border border-success/30 bg-success/5 px-3 py-2 text-[0.8rem] text-success">{state.message}</div>
      )}
      {state.errors && Object.keys(state.errors).length > 0 && (
        <p role="alert" className="error-text">{Object.values(state.errors)[0]}</p>
      )}
    </>
  );
}

export function MessageComposer({ locale }: { locale: Locale }) {
  const [state, action, pending] = useActionState<PortalState, FormData>(sendClientMessage, {});
  return (
    <form action={action} className="space-y-3">
      <Notice state={state} />
      <div className="field">
        <label className="label" htmlFor="body">{t(locale, "form.message")}</label>
        <textarea id="body" name="body" rows={3} required maxLength={3000} className="input" placeholder={locale === "ar" ? "اكتب رسالتك…" : "Write your message…"} />
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Send size={15} aria-hidden="true" />}
        {locale === "ar" ? "إرسال" : "Send"}
      </button>
    </form>
  );
}

export function DocumentUpload({ locale, projects }: { locale: Locale; projects: { id: number; title: string }[] }) {
  const [state, action, pending] = useActionState<PortalState, FormData>(uploadClientDocument, {});
  return (
    <form action={action} className="space-y-3">
      <Notice state={state} />
      {projects.length > 0 && (
        <div className="field">
          <label className="label" htmlFor="projectId">{locale === "ar" ? "المشروع (اختياري)" : "Project (optional)"}</label>
          <select id="projectId" name="projectId" className="input" defaultValue="">
            <option value="">{locale === "ar" ? "بدون مشروع" : "No project"}</option>
            {projects.map((p) => <option key={p.id} value={p.id}>{p.title}</option>)}
          </select>
        </div>
      )}
      <div className="field">
        <label className="label" htmlFor="file">{t(locale, "form.attachment")}</label>
        <input id="file" name="file" type="file" required className="input file:mr-3 file:rounded file:border-0 file:bg-navy file:px-3 file:py-1.5 file:text-[0.75rem] file:font-semibold file:text-white" />
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending ? <Loader2 size={15} className="animate-spin" aria-hidden="true" /> : <Upload size={15} aria-hidden="true" />}
        {locale === "ar" ? "رفع المستند" : "Upload document"}
      </button>
    </form>
  );
}

export function ProfileForm({
  locale,
  user,
}: {
  locale: Locale;
  user: { name: string; email: string; company: string | null; phone: string | null };
}) {
  const [state, action, pending] = useActionState<AuthState, FormData>(updateProfile, {});
  const err = state.errors ?? {};
  return (
    <form action={action} className="space-y-4">
      <Notice state={state} />
      <div className="field">
        <label className="label" htmlFor="name">{t(locale, "form.name")}</label>
        <input id="name" name="name" defaultValue={user.name} required className="input" aria-invalid={!!err.name} />
        {err.name && <p className="error-text">{err.name}</p>}
      </div>
      <div className="field">
        <label className="label" htmlFor="email-readonly">{t(locale, "form.email")}</label>
        <input id="email-readonly" value={user.email} readOnly disabled className="input bg-light text-muted" dir="ltr" />
        <p className="hint">{locale === "ar" ? "لتغيير البريد تواصل مع فريق الحسابات." : "Contact the accounts team to change your email."}</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label className="label" htmlFor="company">{t(locale, "form.company")}</label>
          <input id="company" name="company" defaultValue={user.company ?? ""} className="input" />
        </div>
        <div className="field">
          <label className="label" htmlFor="phone">{t(locale, "form.phone")}</label>
          <input id="phone" name="phone" type="tel" defaultValue={user.phone ?? ""} className="input" dir="ltr" />
        </div>
      </div>
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
        {t(locale, "form.save")}
      </button>
    </form>
  );
}

export function PasswordForm({ locale }: { locale: Locale }) {
  const [state, action, pending] = useActionState<AuthState, FormData>(changePassword, {});
  const err = state.errors ?? {};
  const field = (name: string, label: string, autoComplete: string) => (
    <div className="field">
      <label className="label" htmlFor={name}>{label}</label>
      <input id={name} name={name} type="password" required autoComplete={autoComplete} className="input" aria-invalid={!!err[name]} />
      {err[name] && <p className="error-text">{err[name]}</p>}
    </div>
  );
  return (
    <form action={action} className="space-y-4">
      <Notice state={state} />
      {field("current", locale === "ar" ? "كلمة المرور الحالية" : "Current password", "current-password")}
      {field("password", t(locale, "form.newPassword"), "new-password")}
      {field("confirm", t(locale, "form.confirmPassword"), "new-password")}
      <button type="submit" className="btn btn-primary btn-sm" disabled={pending}>
        {pending && <Loader2 size={15} className="animate-spin" aria-hidden="true" />}
        {locale === "ar" ? "تحديث كلمة المرور" : "Update password"}
      </button>
    </form>
  );
}
