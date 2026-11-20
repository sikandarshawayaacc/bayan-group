"use client";

import { useActionState } from "react";
import { ArrowRight, Loader2 } from "lucide-react";
import { submitRfq, type FormState } from "@/app/actions/enquiry";
import { t, type Locale } from "@/lib/dictionary";

type Product = { id: number; name: string; sku: string | null };

export function RfqForm({ locale, products, productId }: { locale: Locale; products: Product[]; productId?: number }) {
  const tr = (k: string) => t(locale, k);
  const [state, action, pending] = useActionState<FormState, FormData>(submitRfq, {});
  const err = state.errors ?? {};

  return (
    <form action={action} className="space-y-4" noValidate>
      {state.message && <div role="alert" className="rounded border border-warning/40 bg-warning/10 px-4 py-3 text-[0.82rem] text-[#8a6420]">{state.message}</div>}
      {Object.keys(err).length > 0 && (
        <div role="alert" className="rounded border border-error/30 bg-error/5 px-4 py-3 text-[0.82rem] text-error">{tr("msg.error")}</div>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="field">
          <label className="label" htmlFor="rfq-product">{locale === "ar" ? "المنتج" : "Product"} <span className="text-error">*</span></label>
          <select id="rfq-product" name="productId" className="select" defaultValue={productId ?? ""} required aria-invalid={!!err.productId}>
            <option value="">{tr("form.select")}</option>
            {products.map((p) => <option key={p.id} value={p.id}>{p.name}{p.sku ? ` — ${p.sku}` : ""}</option>)}
          </select>
        </div>
        <div className="field">
          <label className="label" htmlFor="rfq-quantity">{tr("form.quantity")} <span className="text-error">*</span></label>
          <input id="rfq-quantity" name="quantity" className="input" required placeholder={locale === "ar" ? "مثال: ٥٠ صندوقاً" : "e.g. 50 cases"} aria-invalid={!!err.quantity} />
          {err.quantity && <p className="error-text">{err.quantity}</p>}
        </div>
        <div className="field">
          <label className="label" htmlFor="rfq-name">{tr("form.name")} <span className="text-error">*</span></label>
          <input id="rfq-name" name="name" className="input" required autoComplete="name" aria-invalid={!!err.name} />
          {err.name && <p className="error-text">{err.name}</p>}
        </div>
        <div className="field">
          <label className="label" htmlFor="rfq-company">{tr("form.company")}</label>
          <input id="rfq-company" name="company" className="input" autoComplete="organization" />
        </div>
        <div className="field">
          <label className="label" htmlFor="rfq-email">{tr("form.email")} <span className="text-error">*</span></label>
          <input id="rfq-email" name="email" type="email" dir="ltr" className="input" required autoComplete="email" aria-invalid={!!err.email} />
          {err.email && <p className="error-text">{err.email}</p>}
        </div>
        <div className="field">
          <label className="label" htmlFor="rfq-phone">{tr("form.phone")}</label>
          <input id="rfq-phone" name="phone" type="tel" dir="ltr" className="input" autoComplete="tel" />
        </div>
        <div className="field">
          <label className="label" htmlFor="rfq-date">{tr("form.targetDate")}</label>
          <input id="rfq-date" name="targetDate" type="date" className="input" />
        </div>
      </div>
      <div className="field">
        <label className="label" htmlFor="rfq-notes">{tr("form.notes")}</label>
        <textarea id="rfq-notes" name="notes" rows={3} className="textarea" placeholder={locale === "ar" ? "المواصفات، البدائل المقبولة، موقع التسليم…" : "Specifications, acceptable substitutes, delivery location…"} />
      </div>
      <label className="flex items-start gap-2.5 text-[0.78rem] leading-relaxed text-muted">
        <input type="checkbox" name="consent" required className="mt-0.5 h-4 w-4 accent-[#239A96]" />
        <span>{tr("form.consent")}</span>
      </label>
      {err.consent && <p className="error-text">{err.consent}</p>}
      <button type="submit" className="btn btn-primary" disabled={pending}>
        {pending ? <><Loader2 size={16} className="animate-spin" aria-hidden="true" /> {tr("cta.sending")}</> : <>{locale === "ar" ? "إرسال طلب عرض السعر" : "Send RFQ"} <ArrowRight size={15} aria-hidden="true" /></>}
      </button>
      <p className="text-[0.7rem] text-muted">
        {locale === "ar" ? "الأسعار والتوفر يُؤكدان في عرض مكتوب. لا تُعالج مدفوعات على هذا الموقع." : "Pricing and availability are confirmed in a written quotation. No payments are processed on this site."}
      </p>
    </form>
  );
}
