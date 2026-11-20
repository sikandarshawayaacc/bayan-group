"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import type { Locale } from "@/lib/dictionary";

const questions = [
  {
    en: "Management accounts are closed and reviewed within 10 working days of month end.",
    ar: "تُقفل الحسابات الإدارية وتُراجع خلال ١٠ أيام عمل من نهاية الشهر.",
  },
  {
    en: "Major decisions have a written assumptions register with a named owner.",
    ar: "القرارات الكبرى لها سجل افتراضات مكتوب ومسؤول محدد بالاسم.",
  },
  {
    en: "A rolling 13-week cash forecast is maintained and reviewed weekly.",
    ar: "يُحتفظ بتوقع نقدي متجدد لـ١٣ أسبوعاً ويُراجع أسبوعياً.",
  },
  {
    en: "Each of the top five risks has an owner, a mitigation and a review date.",
    ar: "لكل من أعلى خمس مخاطر مسؤول وإجراء تخفيف وتاريخ مراجعة.",
  },
  {
    en: "The board pack separates performance, financial position and forward risk.",
    ar: "تفصل حزمة مجلس الإدارة بين الأداء والمركز المالي والمخاطر المستقبلية.",
  },
];

export function AdvisoryAssessment({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [answers, setAnswers] = useState<(number | null)[]>([null, null, null, null, null]);
  const done = answers.every((a) => a !== null);
  const score = useMemo(() => answers.reduce<number>((sum, a) => sum + (a ?? 0), 0), [answers]);

  const band = score >= 8
    ? { label: ar ? "أساس قوي" : "Strong foundation", tone: "text-success", body: ar ? "الأساسيات موجودة. التركيز التالي هو ربط القرارات بالافتراضات واختبار السيناريوهات السلبية." : "The fundamentals are in place. The next step is linking decisions to assumptions and testing downside scenarios." }
    : score >= 5
      ? { label: ar ? "فجوات محددة" : "Targeted gaps", tone: "text-warning", body: ar ? "بعض العناصر تعمل وأخرى لا. اختر عنصرين وأغلقهما قبل توسيع النطاق." : "Some elements work, others do not. Close two gaps before widening the scope." }
      : { label: ar ? "يحتاج أولوية" : "Priority attention", tone: "text-error", body: ar ? "ابدأ بالإقفال الشهري وتوقع النقد. القرارات الكبرى بلا أساس موثق تكلف أكثر من تكلفة الإصلاح." : "Start with the monthly close and a cash forecast. Decisions without a documented basis cost more than the fix." };

  return (
    <div className="rounded-lg border border-line bg-white p-6 md:p-8">
      <h3 className="text-lg font-bold text-navy">{ar ? "تقييم سريع للصحة المالية" : "Financial health check"}</h3>
      <p className="mt-1 text-[0.8rem] text-muted">
        {ar ? "خمسة أسئلة، تُحسب في متصفحك ولا تُرسل إلى الخادم." : "Five questions, scored in your browser. Nothing is sent to the server."}
      </p>
      <ol className="mt-6 space-y-5">
        {questions.map((q, i) => (
          <li key={q.en}>
            <p className="text-[0.83rem] font-medium text-navy">{i + 1}. {ar ? q.ar : q.en}</p>
            <div className="mt-2 flex flex-wrap gap-2">
              {[
                { v: 2, en: "Yes", ar: "نعم" },
                { v: 1, en: "Partly", ar: "جزئياً" },
                { v: 0, en: "No", ar: "لا" },
              ].map((o) => (
                <label key={o.v} className={`cursor-pointer rounded border px-3 py-1.5 text-[0.75rem] font-medium transition-colors ${answers[i] === o.v ? "border-teal bg-teal/10 text-teal-dark" : "border-line text-muted hover:border-navy/40"}`}>
                  <input
                    type="radio"
                    name={`q${i}`}
                    value={o.v}
                    checked={answers[i] === o.v}
                    onChange={() => setAnswers((prev) => prev.map((a, idx) => (idx === i ? o.v : a)))}
                    className="sr-only"
                  />
                  {ar ? o.ar : o.en}
                </label>
              ))}
            </div>
          </li>
        ))}
      </ol>
      <div className="mt-6 rounded-md border border-line bg-ivory p-4" aria-live="polite">
        {done ? (
          <>
            <p className="text-[0.75rem] uppercase tracking-[0.12em] text-muted">{ar ? "النتيجة" : "Result"} — {score}/10</p>
            <p className={`mt-1 text-lg font-bold ${band.tone}`}>{band.label}</p>
            <p className="mt-2 text-[0.82rem] leading-relaxed text-muted">{band.body}</p>
            <Link href="/contact?division=advisory" className="btn btn-primary btn-sm mt-4">{ar ? "ناقش النتيجة معنا" : "Discuss the result"}</Link>
          </>
        ) : (
          <p className="text-[0.8rem] text-muted">{ar ? "أجب عن الأسئلة الخمسة لعرض النتيجة." : "Answer all five questions to see a result."}</p>
        )}
      </div>
      <p className="mt-3 text-[0.68rem] leading-relaxed text-muted">
        {ar ? "هذا التقييم إرشادي وليس تدقيقاً ولا استشارة مالية منظمة." : "This is an indicative self-assessment, not an audit or regulated financial advice."}
      </p>
    </div>
  );
}
