"use client";

import { useMemo, useState } from "react";
import type { Locale } from "@/lib/dictionary";

const fmt = (value: number, locale: Locale) =>
  new Intl.NumberFormat(locale === "ar" ? "ar-QA" : "en-QA", { style: "currency", currency: "QAR", maximumFractionDigits: 0 }).format(value);

export function InvestmentCalculator({ locale }: { locale: Locale }) {
  const ar = locale === "ar";
  const [initial, setInitial] = useState(100000);
  const [monthly, setMonthly] = useState(5000);
  const [rate, setRate] = useState(6);
  const [years, setYears] = useState(10);

  const result = useMemo(() => {
    const months = Math.max(1, Math.min(40, years)) * 12;
    const r = rate / 100 / 12;
    const growth = Math.pow(1 + r, months);
    const fromInitial = initial * growth;
    const fromMonthly = r === 0 ? monthly * months : monthly * ((growth - 1) / r);
    const contributed = initial + monthly * months;
    return { total: fromInitial + fromMonthly, contributed, gain: fromInitial + fromMonthly - contributed, months };
  }, [initial, monthly, rate, years]);

  const fields = [
    { label: ar ? "المبلغ الأولي" : "Initial amount", value: initial, set: setInitial, min: 0, max: 10_000_000, step: 5000 },
    { label: ar ? "الإضافة الشهرية" : "Monthly contribution", value: monthly, set: setMonthly, min: 0, max: 200_000, step: 500 },
    { label: ar ? "العائد السنوي المفترض %" : "Assumed annual return %", value: rate, set: setRate, min: 0, max: 20, step: 0.5 },
    { label: ar ? "المدة بالسنوات" : "Years", value: years, set: setYears, min: 1, max: 40, step: 1 },
  ];

  return (
    <div className="rounded-lg border border-line bg-white p-6 md:p-8">
      <h3 className="text-lg font-bold text-navy">{ar ? "حاسبة النمو التوضيحية" : "Illustrative growth calculator"}</h3>
      <p className="mt-1 text-[0.8rem] text-muted">
        {ar ? "تُطبق معادلة الفائدة المركبة شهرياً على مدخلاتك. النتيجة توضيحية وليست توقعاً." : "Applies monthly compounding to your inputs. The output is illustrative, not a forecast."}
      </p>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {fields.map((f) => (
          <div className="field" key={f.label}>
            <label className="label" htmlFor={`calc-${f.label}`}>{f.label}</label>
            <input
              id={`calc-${f.label}`}
              type="number"
              min={f.min}
              max={f.max}
              step={f.step}
              value={f.value}
              onChange={(e) => f.set(Math.max(f.min, Math.min(f.max, Number(e.target.value) || 0)))}
              className="input"
              dir="ltr"
            />
            <input
              type="range"
              min={f.min}
              max={f.max}
              step={f.step}
              value={f.value}
              onChange={(e) => f.set(Number(e.target.value))}
              className="mt-1 w-full accent-[#239A96]"
              aria-label={`${f.label} slider`}
            />
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-3 rounded-md border border-line bg-ivory p-5 sm:grid-cols-3" aria-live="polite">
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted">{ar ? "إجمالي المساهمات" : "Total contributed"}</p>
          <p className="mt-1 text-lg font-bold text-navy" dir="ltr">{fmt(result.contributed, locale)}</p>
        </div>
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted">{ar ? "نمو افتراضي" : "Illustrative growth"}</p>
          <p className="mt-1 text-lg font-bold text-teal-dark" dir="ltr">{fmt(result.gain, locale)}</p>
        </div>
        <div>
          <p className="text-[0.7rem] uppercase tracking-[0.12em] text-muted">{ar ? "القيمة بعد المدة" : "Value at end"}</p>
          <p className="mt-1 text-lg font-bold text-navy" dir="ltr">{fmt(result.total, locale)}</p>
        </div>
      </div>

      <div className="mt-4 rounded border border-line p-4 text-[0.72rem] leading-relaxed text-muted">
        <p className="font-semibold text-navy">{ar ? "المعادلة والافتراضات" : "Formula and assumptions"}</p>
        <p className="mt-1" dir="ltr">FV = P × (1 + r)ⁿ + C × ((1 + r)ⁿ − 1) ÷ r</p>
        <p className="mt-1">
          {ar
            ? "حيث P المبلغ الأولي، C الإضافة الشهرية، r = العائد السنوي ÷ ١٢، n = عدد الأشهر. لا تُحتسب رسوم أو ضرائب أو تضخم. العائد ثابت افتراضياً ولا يمثل أداءً فعلياً."
            : "Where P is the initial amount, C the monthly contribution, r = annual return ÷ 12 and n = months. Fees, taxes and inflation are not modelled. The return is held constant by assumption and does not represent actual performance."}
        </p>
        <p className="mt-2 font-medium text-error">
          {ar ? "ليست نصيحة استثمارية ولا ضماناً. قد تنخفض قيمة الاستثمارات." : "Not investment advice and not a guarantee. Investments can fall in value."}
        </p>
      </div>
    </div>
  );
}
