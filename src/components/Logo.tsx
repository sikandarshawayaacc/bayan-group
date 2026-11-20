import Link from "next/link";

export function Logo({ light = false, compact = false }: { light?: boolean; compact?: boolean }) {
  return (
    <Link href="/" aria-label="BAYAN GROUP — home" className="inline-flex items-center gap-2.5 shrink-0">
      <svg width="34" height="34" viewBox="0 0 40 40" aria-hidden="true" className="shrink-0">
        <rect x="1" y="1" width="38" height="38" rx="7" fill={light ? "#ffffff" : "#172B3A"} />
        <path d="M20 7.5 32.5 20 20 32.5 7.5 20Z" fill="none" stroke={light ? "#172B3A" : "#ffffff"} strokeWidth="1.4" opacity="0.5" />
        <path d="M20 13 27 20 20 27 13 20Z" fill="#239A96" />
        <path d="M20 17.2 22.8 20 20 22.8 17.2 20Z" fill={light ? "#172B3A" : "#ffffff"} />
        <path d="M20 7.5v5.5M20 27v5.5" stroke="#B69A63" strokeWidth="1.6" strokeLinecap="round" />
      </svg>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className={`text-[1.05rem] font-extrabold tracking-[0.18em] ${light ? "text-white" : "text-navy"}`}>BAYAN</span>
          <span className={`mt-1 text-[0.55rem] font-semibold tracking-[0.34em] ${light ? "text-white/70" : "text-muted"}`}>GROUP</span>
        </span>
      )}
    </Link>
  );
}
