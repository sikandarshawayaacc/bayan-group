"use client";

import Link from "next/link";
import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { login, register, forgotPassword, resetPassword, type AuthState } from "@/app/actions/auth";
import { t, type Locale } from "@/lib/dictionary";

function Alert({ state }: { state: AuthState }) {
  const err = state.errors ?? {};
  return (
    <>
      {state.message && (
        <div role="alert" className="rounded border border-warning/40 bg-warning/10 px-4 py-3 text-[0.82rem] text-[#8a6420]">{state.message}</div>
      )}
      {Object.keys(err).length > 0 && (
        <div role="alert" className="rounded border border-error/30 bg-error/5 px-4 py-3 text-[0.82rem] text-error">
          {Object.values(err)[0]}
        </div>
      )}
    </>
  );
}

function Field({
  name,
  label,
  type = "text",
  required,
  autoComplete,
  error,
  hint,
}: {
  name: string;
  label: string;
  type?: string;
  required?: boolean;
  autoComplete?: string;
  error?: string;
  hint?: string;
}) {
  return (
    <div className="field">
      <label className="label" htmlFor={name}>{label} {required && <span className="text-error" aria-hidden="true">*</span>}</label>
      <input
        id={name}
        name={name}
        type={type}
        required={required}
        autoComplete={autoComplete}
        className="input"
        dir={type === "email" ? "ltr" : undefined}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
      />
      {hint && <p className="hint">{hint}</p>}
      {error && <p className="error-text" id={`${name}-error`}>{error}</p>}
    </div>
  );
}

export function LoginForm({ locale, next, notice }: { locale: Locale; next?: string; notice?: string }) {
  const tr = (k: string) => t(locale, k);
  const [state, action, pending] = useActionState<AuthState, FormData>(login, {});
  const err = state.errors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      {next && <input type="hidden" name="next" value={next} />}
      {notice && <div className="rounded border border-success/30 bg-success/5 px-4 py-3 text-[0.82rem] text-success">{notice}</div>}
      <Alert state={state} />
      <Field name="email" label={tr("form.email")} type="email" required autoComplete="email" error={err.email} />
      <Field name="password" label={tr("form.password")} type="password" required autoComplete="current-password" error={err.password} />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> {tr("cta.sending")}</> : <>{tr("form.login")} <ArrowRight size={15} aria-hidden="true" /></>}
      </button>
      <div className="flex items-center justify-between text-[0.78rem]">
        <Link href="/portal/forgot" className="font-semibold text-teal-dark hover:underline">{tr("form.forgot")}</Link>
        <Link href="/portal/register" className="text-muted hover:text-navy">{tr("form.register")}</Link>
      </div>
    </form>
  );
}

export function RegisterForm({ locale }: { locale: Locale }) {
  const tr = (k: string) => t(locale, k);
  const [state, action, pending] = useActionState<AuthState, FormData>(register, {});
  const err = state.errors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <Alert state={state} />
      <Field name="name" label={tr("form.name")} required autoComplete="name" error={err.name} />
      <Field name="email" label={tr("form.email")} type="email" required autoComplete="email" error={err.email} />
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="company" label={tr("form.company")} autoComplete="organization" error={err.company} />
        <Field name="phone" label={tr("form.phone")} type="tel" autoComplete="tel" error={err.phone} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <Field name="password" label={tr("form.password")} type="password" required autoComplete="new-password" hint={locale === "ar" ? "١٠ أحرف على الأقل" : "At least 10 characters"} error={err.password} />
        <Field name="confirm" label={tr("form.confirmPassword")} type="password" required autoComplete="new-password" error={err.confirm} />
      </div>
      <label className="flex items-start gap-2.5 text-[0.78rem] leading-relaxed text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#239A96]" />
        <span>{tr("form.consent")}</span>
      </label>
      {err.consent && <p className="error-text">{err.consent}</p>}
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> {tr("cta.sending")}</> : <>{tr("form.register")} <ArrowRight size={15} aria-hidden="true" /></>}
      </button>
      <p className="text-center text-[0.78rem] text-muted">
        {locale === "ar" ? "لديك حساب؟ " : "Already have an account? "}
        <Link href="/portal/login" className="font-semibold text-teal-dark hover:underline">{tr("form.login")}</Link>
      </p>
    </form>
  );
}

export function ForgotForm({ locale }: { locale: Locale }) {
  const tr = (k: string) => t(locale, k);
  const [state, action, pending] = useActionState<AuthState, FormData>(forgotPassword, {});
  return (
    <form action={action} className="space-y-4" noValidate>
      <Alert state={state} />
      <Field name="email" label={tr("form.email")} type="email" required autoComplete="email" />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> {tr("cta.sending")}</> : <>{locale === "ar" ? "إرسال رابط إعادة التعيين" : "Send reset link"} <ArrowRight size={15} aria-hidden="true" /></>}
      </button>
      <p className="text-center text-[0.78rem] text-muted">
        <Link href="/portal/login" className="font-semibold text-teal-dark hover:underline">{locale === "ar" ? "العودة لتسجيل الدخول" : "Back to sign in"}</Link>
      </p>
    </form>
  );
}

export function ResetForm({ locale, token }: { locale: Locale; token: string }) {
  const tr = (k: string) => t(locale, k);
  const [state, action, pending] = useActionState<AuthState, FormData>(resetPassword, {});
  const err = state.errors ?? {};
  return (
    <form action={action} className="space-y-4" noValidate>
      <input type="hidden" name="token" value={token} />
      <Alert state={state} />
      <Field name="password" label={tr("form.newPassword")} type="password" required autoComplete="new-password" hint={locale === "ar" ? "١٠ أحرف على الأقل" : "At least 10 characters"} error={err.password} />
      <Field name="confirm" label={tr("form.confirmPassword")} type="password" required autoComplete="new-password" error={err.confirm} />
      <button type="submit" className="btn btn-primary w-full" disabled={pending}>
        {pending ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> {tr("cta.sending")}</> : <>{locale === "ar" ? "تعيين كلمة المرور" : "Set new password"} <ArrowRight size={15} aria-hidden="true" /></>}
      </button>
    </form>
  );
}
