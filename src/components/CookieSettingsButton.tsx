"use client";

export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => {
        localStorage.removeItem("bayan_cookie_consent");
        window.dispatchEvent(new Event("bayan-cookie-open"));
      }}
      className="text-start text-white/70 hover:text-white"
    >
      {label}
    </button>
  );
}
