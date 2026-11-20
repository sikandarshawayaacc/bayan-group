import { NextResponse } from "next/server";
import { LOCALE_COOKIE } from "@/lib/i18n";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const to = url.searchParams.get("to") === "ar" ? "ar" : "en";
  const nextParam = url.searchParams.get("next") || "/";
  const next = nextParam.startsWith("/") && !nextParam.startsWith("//") ? nextParam : "/";
  const res = NextResponse.redirect(new URL(next, url.origin));
  res.cookies.set(LOCALE_COOKIE, to, {
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  });
  return res;
}
