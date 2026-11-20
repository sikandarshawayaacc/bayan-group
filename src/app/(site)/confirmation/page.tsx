import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { getLocale, t } from "@/lib/i18n";
import { one } from "@/lib/db";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Enquiry received", robots: { index: false, follow: false } };

export default async function ConfirmationPage({ searchParams }: { searchParams: Promise<{ ref?: string; kind?: string }> }) {
  const locale = await getLocale();
  const tr = (k: string) => t(locale, k);
  const { ref = "", kind = "enquiry" } = await searchParams;
  const valid = /^(BYN|RFQ)-\d{4}-\d{4}$/.test(ref);
  const record = valid
    ? kind === "rfq"
      ? one<{ ref: string; created_at: string }>("SELECT ref, created_at FROM rfqs WHERE ref = ?", [ref])
      : one<{ ref: string; created_at: string }>("SELECT ref, created_at FROM enquiries WHERE ref = ?", [ref])
    : undefined;

  return (
    <section className="bg-white py-16 md:py-24">
      <div className="container-x max-w-3xl">
        <div className="rounded-lg border border-line bg-ivory p-8 md:p-12">
          <CheckCircle2 size={34} className="text-success" aria-hidden="true" />
          <h1 className="mt-5 text-[clamp(1.7rem,3vw,2.4rem)] font-bold text-navy">
            {locale === "ar" ? "تم استلام طلبك." : "Your request has been received."}
          </h1>
          {record ? (
            <>
              <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
                {locale === "ar" ? "رقم المرجع الخاص بك هو" : "Your reference number is"}{" "}
                <strong className="font-mono text-navy" dir="ltr">{record.ref}</strong>.{" "}
                {locale === "ar"
                  ? "احتفظ به للمتابعة. أرسلنا رسالة تأكيد إلى بريدك الإلكتروني، وسيتواصل معك الفريق خلال يوم عمل واحد."
                  : "Keep it for follow-up. We have emailed a confirmation, and the team will respond within one business day."}
              </p>
              <dl className="mt-6 grid gap-3 rounded-md border border-line bg-white p-4 text-[0.8rem] sm:grid-cols-2">
                <div><dt className="text-muted">{locale === "ar" ? "المرجع" : "Reference"}</dt><dd className="mt-0.5 font-semibold text-navy" dir="ltr">{record.ref}</dd></div>
                <div><dt className="text-muted">{locale === "ar" ? "تاريخ الاستلام" : "Received"}</dt><dd className="mt-0.5 font-semibold text-navy">{new Date(record.created_at).toLocaleString(locale === "ar" ? "ar-QA" : "en-GB")}</dd></div>
              </dl>
            </>
          ) : (
            <p className="mt-4 text-[0.95rem] leading-relaxed text-muted">
              {locale === "ar" ? "لم نعثر على هذا المرجع. إذا أرسلت طلباً ولم تستلم تأكيداً، تواصل معنا مباشرة." : "We could not find that reference. If you submitted a request and received no confirmation, contact us directly."}
            </p>
          )}
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/" className="btn btn-dark">{locale === "ar" ? "العودة للرئيسية" : "Back to home"}</Link>
            <Link href="/insights" className="btn btn-ghost">{tr("nav.insights")}</Link>
            <Link href="/contact" className="btn btn-ghost">{tr("nav.contact")}</Link>
          </div>
        </div>
        <p className="mt-6 text-[0.75rem] leading-relaxed text-muted">
          {locale === "ar"
            ? "لا تعرض هذه الصفحة أي بيانات شخصية. يتم التحقق من المرجع فقط."
            : "This page never displays personal data — it only verifies that the reference exists."}
        </p>
      </div>
    </section>
  );
}
