"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { submitEnquiry, type FormState } from "@/app/actions/enquiry";
import { divisions, enquiryTypes, countries, odooModules, revenueBands, advisoryObjectives, investmentObjectives, riskLevels, horizons } from "@/lib/content";
import { t, type Locale } from "@/lib/dictionary";

type Variant = "contact" | "technologies" | "advisory" | "investments" | "consultation";

export function EnquiryForm({
  locale,
  variant = "contact",
  defaultDivision = "",
  defaultKind = "general",
  compact = false,
  productId,
}: {
  locale: Locale;
  variant?: Variant;
  defaultDivision?: string;
  defaultKind?: string;
  compact?: boolean;
  productId?: number;
}) {
  const tr = (k: string) => t(locale, k);
  const [state, action, pending] = useActionState<FormState, FormData>(submitEnquiry, {});
  const err = state.errors ?? {};
  const ar = locale === "ar";
  const input = (name: string, label: string, opts: { required?: boolean; type?: string; autoComplete?: string; placeholder?: string; hint?: string } = {}) => (
    <div className="field">
      <label className="label" htmlFor={name}>
        {label} {opts.required ? <span className="text-error" aria-hidden="true">*</span> : <span className="text-muted font-normal">({tr("form.optional")})</span>}
      </label>
      <input
        id={name}
        name={name}
        type={opts.type ?? "text"}
        required={opts.required}
        autoComplete={opts.autoComplete}
        placeholder={opts.placeholder}
        aria-invalid={!!err[name]}
        aria-describedby={err[name] ? `${name}-error` : undefined}
        className="input"
        dir={opts.type === "email" || opts.type === "tel" ? "ltr" : undefined}
      />
      {opts.hint && <p className="hint">{opts.hint}</p>}
      {err[name] && <p className="error-text" id={`${name}-error`}>{err[name]}</p>}
    </div>
  );

  return (
    <form action={action} className="space-y-5" noValidate>
      {productId && <input type="hidden" name="productId" value={productId} />}
      {state.message && (
        <div role="alert" className="rounded border border-warning/40 bg-warning/10 px-4 py-3 text-[0.82rem] text-[#8a6420]">{state.message}</div>
      )}
      {Object.keys(err).length > 0 && (
        <div role="alert" className="rounded border border-error/30 bg-error/5 px-4 py-3 text-[0.82rem] text-error">
          {ar ? "يرجى تصحيح الحقول المحددة." : "Please correct the highlighted fields."}
        </div>
      )}

      <div className={`grid gap-4 ${compact ? "" : "sm:grid-cols-2"}`}>
        {input("name", tr("form.name"), { required: true, autoComplete: "name" })}
        {input("company", tr("form.company"), { autoComplete: "organization" })}
        {input("email", tr("form.email"), { required: true, type: "email", autoComplete: "email" })}
        {input("phone", tr("form.phone"), { type: "tel", autoComplete: "tel" })}
        {!compact && (
          <div className="field">
            <label className="label" htmlFor="country">{tr("form.country")}</label>
            <select id="country" name="country" className="select" defaultValue="Qatar" aria-invalid={!!err.country}>
              {countries.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        )}
        <div className="field">
          <label className="label" htmlFor="division">{tr("form.division")}</label>
          <select id="division" name="division" className="select" defaultValue={defaultDivision} aria-invalid={!!err.division}>
            <option value="">{tr("form.select")}</option>
            {divisions.map((d) => <option key={d.slug} value={d.slug}>{d.name[locale]}</option>)}
          </select>
        </div>
        {!compact && (
          <div className="field">
            <label className="label" htmlFor="kind">{tr("form.type")}</label>
            <select id="kind" name="kind" className="select" defaultValue={defaultKind}>
              {enquiryTypes.map((e) => <option key={e.value} value={e.value}>{ar ? e.ar : e.en}</option>)}
            </select>
          </div>
        )}
        {compact && <input type="hidden" name="kind" value={defaultKind} />}
      </div>

      {variant === "technologies" && (
        <fieldset className="rounded-md border border-line p-4">
          <legend className="px-1 text-[0.8rem] font-semibold text-navy">{tr("form.module")}</legend>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {odooModules.map((m) => (
              <label key={m} className="flex items-center gap-2 text-[0.82rem] text-muted">
                <input type="checkbox" name="meta_modules" value={m} className="h-4 w-4 accent-[#239A96]" /> {m}
              </label>
            ))}
          </div>
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            {input("meta_users", tr("form.users"), { placeholder: ar ? "مثال: 25" : "e.g. 25" })}
            {input("meta_current_system", tr("form.currentSystem"), { placeholder: ar ? "جداول بيانات، نظام قديم…" : "Spreadsheets, legacy ERP…" })}
          </div>
        </fieldset>
      )}

      {variant === "advisory" && (
        <fieldset className="grid gap-4 rounded-md border border-line p-4 sm:grid-cols-2">
          <legend className="px-1 text-[0.8rem] font-semibold text-navy">{ar ? "سياق الاستشارة" : "Advisory context"}</legend>
          <div className="field">
            <label className="label" htmlFor="meta_revenue">{tr("form.revenue")}</label>
            <select id="meta_revenue" name="meta_revenue" className="select" defaultValue="">
              <option value="">{tr("form.select")}</option>
              {revenueBands.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="meta_objective">{tr("form.objective")}</label>
            <select id="meta_objective" name="meta_objective" className="select" defaultValue="">
              <option value="">{tr("form.select")}</option>
              {advisoryObjectives.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <p className="sm:col-span-2 text-[0.72rem] leading-relaxed text-muted">
            {ar
              ? "مخرجات الاستشارات دعم للقرار ولا تحل محل استشارة قانونية أو ضريبية أو تدقيقية مرخصة."
              : "Advisory outputs are decision support and do not replace licensed legal, tax or audit advice."}
          </p>
        </fieldset>
      )}

      {variant === "investments" && (
        <fieldset className="grid gap-4 rounded-md border border-line p-4 sm:grid-cols-3">
          <legend className="px-1 text-[0.8rem] font-semibold text-navy">{ar ? "سياق الاستثمار" : "Investment context"}</legend>
          <div className="field">
            <label className="label" htmlFor="meta_objective">{tr("form.objective")}</label>
            <select id="meta_objective" name="meta_objective" className="select" defaultValue="">
              <option value="">{tr("form.select")}</option>
              {investmentObjectives.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="meta_risk">{tr("form.risk")}</label>
            <select id="meta_risk" name="meta_risk" className="select" defaultValue="">
              <option value="">{tr("form.select")}</option>
              {riskLevels.map((r) => <option key={r.value} value={r.value}>{ar ? r.ar : r.en}</option>)}
            </select>
          </div>
          <div className="field">
            <label className="label" htmlFor="meta_horizon">{tr("form.horizon")}</label>
            <select id="meta_horizon" name="meta_horizon" className="select" defaultValue="">
              <option value="">{tr("form.select")}</option>
              {horizons.map((r) => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <p className="sm:col-span-3 text-[0.72rem] leading-relaxed text-muted">
            {ar
              ? "لا نحتفظ بأصول العملاء ولا نضمن عوائد. هذا النموذج لطلب بحث أو مراجعة، وليس عرضاً لشراء أي منتج مالي."
              : "We do not hold client assets and do not guarantee returns. This form requests research or review; it is not an offer to buy any financial product."}
          </p>
        </fieldset>
      )}

      {variant === "consultation" && (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="field">
            <label className="label" htmlFor="meta_timeline">{ar ? "الإطار الزمني" : "Timeline"}</label>
            <select id="meta_timeline" name="meta_timeline" className="select" defaultValue="">
              <option value="">{tr("form.select")}</option>
              {["Within 2 weeks", "1–2 months", "This quarter", "Exploratory"].map((x) => <option key={x} value={x}>{x}</option>)}
            </select>
          </div>
          {input("meta_budget", ar ? "نطاق الميزانية (اختياري)" : "Budget range (optional)", { placeholder: ar ? "مثال: ٢٠–٥٠ ألف" : "e.g. QAR 20k–50k" })}
        </div>
      )}

      <div className="field">
        <label className="label" htmlFor="subject">{tr("form.subject")}</label>
        <input id="subject" name="subject" className="input" aria-invalid={!!err.subject} maxLength={180} />
      </div>

      <div className="field">
        <label className="label" htmlFor="message">
          {tr("form.message")} <span className="text-error" aria-hidden="true">*</span>
        </label>
        <textarea id="message" name="message" rows={5} required className="textarea" aria-invalid={!!err.message} aria-describedby={err.message ? "message-error" : undefined} />
        {err.message && <p className="error-text" id="message-error">{err.message}</p>}
      </div>

      {!compact && (
        <div className="field">
          <label className="label" htmlFor="attachment">{tr("form.attachment")}</label>
          <input id="attachment" name="attachment" type="file" accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg,.txt,.csv" className="input file:me-3 file:rounded file:border-0 file:bg-light file:px-3 file:py-1.5 file:text-[0.75rem] file:font-semibold file:text-navy" aria-invalid={!!err.attachment} />
          {err.attachment && <p className="error-text">{err.attachment}</p>}
        </div>
      )}

      <label className="flex items-start gap-2.5 text-[0.78rem] leading-relaxed text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#239A96]" aria-invalid={!!err.consent} />
        <span>{tr("form.consent")}</span>
      </label>
      {err.consent && <p className="error-text">{err.consent}</p>}

      <button type="submit" className="btn btn-primary w-full sm:w-auto" disabled={pending}>
        {pending ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> {tr("cta.sending")}</> : <>{tr("cta.submit")} <ArrowRight size={15} aria-hidden="true" /></>}
      </button>
      <p className="text-[0.7rem] text-muted">
        {ar ? "نستخدم بياناتك للرد على هذا الاستفسار فقط. راجع سياسة الخصوصية." : "We use your details only to respond to this enquiry. See the Privacy Policy."}
      </p>
    </form>
  );
}
