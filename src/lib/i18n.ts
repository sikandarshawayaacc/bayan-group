import { cookies } from "next/headers";
import type { Locale } from "./dictionary";
import { LOCALE_COOKIE } from "./dictionary";

export * from "./dictionary";

export async function getLocale(): Promise<Locale> {
  const jar = await cookies();
  return jar.get(LOCALE_COOKIE)?.value === "ar" ? "ar" : "en";
}
