"use server";

import { createHash, randomBytes } from "node:crypto";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { one, run } from "@/lib/db";
import {
  createSession,
  destroySession,
  getCurrentUser,
  hashPassword,
  rateLimit,
  requireUser,
  verifyPassword,
  audit,
} from "@/lib/auth";
import { loginSchema, registerSchema, passwordSchema, fieldErrors } from "@/lib/validation";
import { getLocale } from "@/lib/i18n";
import { sendMail } from "@/lib/email";

export type AuthState = { errors?: Record<string, string>; message?: string };

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

async function ip() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

function safeNext(next: string | null, fallback: string) {
  if (next && next.startsWith("/") && !next.startsWith("//")) return next;
  return fallback;
}

export async function login(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale();
  const address = await ip();
  if (!rateLimit(`login:${address}`, 8, 300)) {
    return { message: locale === "ar" ? "محاولات كثيرة. حاول بعد خمس دقائق." : "Too many attempts. Try again in five minutes." };
  }

  const parsed = loginSchema.safeParse({ email: formData.get("email"), password: formData.get("password") });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const user = one<{ id: number; password_hash: string; role: string; active: number }>(
    "SELECT id,password_hash,role,active FROM users WHERE email = ?",
    [parsed.data.email],
  );
  if (!user || !verifyPassword(parsed.data.password, user.password_hash)) {
    return { message: locale === "ar" ? "البريد الإلكتروني أو كلمة المرور غير صحيحة." : "Email or password is incorrect." };
  }
  if (!user.active) {
    return { message: locale === "ar" ? "هذا الحساب غير نشط. تواصل مع المسؤول." : "This account is not active. Contact the administrator." };
  }

  await createSession(user.id);
  run("UPDATE users SET last_login_at = datetime('now') WHERE id = ?", [user.id]);
  await audit(user.id, "login", "user", user.id);

  const fallback = user.role === "client" ? "/portal" : "/admin";
  redirect(safeNext(formData.get("next") as string | null, fallback));
}

export async function register(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale();
  const address = await ip();
  if (!rateLimit(`register:${address}`, 5, 3600)) {
    return { message: locale === "ar" ? "محاولات كثيرة. حاول لاحقاً." : "Too many attempts. Try again later." };
  }

  const parsed = registerSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    company: formData.get("company") ?? "",
    phone: formData.get("phone") ?? "",
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  if (formData.get("consent") !== "on") {
    return { errors: { consent: locale === "ar" ? "يرجى قبول سياسة الخصوصية" : "Please accept the Privacy Policy" } };
  }
  if (one("SELECT id FROM users WHERE email = ?", [parsed.data.email])) {
    return { errors: { email: locale === "ar" ? "يوجد حساب بهذا البريد بالفعل." : "An account with this email already exists." } };
  }

  const result = run(
    "INSERT INTO users (email,password_hash,name,role,company,phone) VALUES (?,?,?,?,?,?)",
    [parsed.data.email, hashPassword(parsed.data.password), parsed.data.name, "client", parsed.data.company || null, parsed.data.phone || null],
  );
  const id = Number(result.lastInsertRowid);
  await createSession(id);
  await audit(id, "register", "user", id);
  redirect("/portal");
}

export async function logout() {
  const user = await getCurrentUser();
  if (user) await audit(user.id, "logout", "user", user.id);
  await destroySession();
  redirect("/");
}

export async function forgotPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale();
  const address = await ip();
  if (!rateLimit(`forgot:${address}`, 4, 900)) {
    return { message: locale === "ar" ? "محاولات كثيرة. حاول لاحقاً." : "Too many attempts. Try again later." };
  }
  const email = String(formData.get("email") ?? "").trim();
  const user = one<{ id: number; name: string }>("SELECT id,name FROM users WHERE email = ? AND active = 1", [email]);

  if (user) {
    const token = randomBytes(32).toString("hex");
    run("INSERT INTO password_resets (token_hash,user_id,expires_at) VALUES (?,?,?)", [
      tokenHash(token),
      user.id,
      new Date(Date.now() + 3_600_000).toISOString(),
    ]);
    const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
    const link = `${site}/portal/reset?token=${token}`;
    await sendMail({
      to: email,
      subject: locale === "ar" ? "إعادة تعيين كلمة المرور" : "Reset your BAYAN password",
      text:
        locale === "ar"
          ? `مرحباً ${user.name},\n\nاستخدم الرابط التالي لإعادة تعيين كلمة المرور خلال ساعة:\n${link}\n\nإن لم تطلب ذلك، تجاهل الرسالة.`
          : `Hello ${user.name},\n\nUse this link to reset your password within one hour:\n${link}\n\nIf you did not request this, ignore this message.`,
    });
  }

  return {
    message:
      locale === "ar"
        ? "إذا وُجد حساب، فقد أُرسل رابط إعادة التعيين إلى البريد."
        : "If an account exists, a reset link has been sent to that email.",
  };
}

export async function resetPassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale();
  const token = String(formData.get("token") ?? "");
  const password = String(formData.get("password") ?? "");
  const confirm = String(formData.get("confirm") ?? "");

  if (password.length < 10) {
    return { errors: { password: locale === "ar" ? "استخدم ١٠ أحرف على الأقل" : "Use at least 10 characters" } };
  }
  if (password !== confirm) {
    return { errors: { confirm: locale === "ar" ? "كلمتا المرور غير متطابقتين" : "Passwords do not match" } };
  }

  const row = one<{ user_id: number }>(
    "SELECT user_id FROM password_resets WHERE token_hash = ? AND used_at IS NULL AND expires_at > datetime('now')",
    [tokenHash(token)],
  );
  if (!row) {
    return { message: locale === "ar" ? "الرابط غير صالح أو منتهي." : "This reset link is invalid or has expired." };
  }

  run("UPDATE users SET password_hash = ? WHERE id = ?", [hashPassword(password), row.user_id]);
  run("UPDATE password_resets SET used_at = datetime('now') WHERE token_hash = ?", [tokenHash(token)]);
  run("DELETE FROM sessions WHERE user_id = ?", [row.user_id]);
  await audit(row.user_id, "password_reset", "user", row.user_id);
  redirect("/portal/login?reset=1");
}

export async function changePassword(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale();
  const user = await requireUser();
  const parsed = passwordSchema.safeParse({
    current: formData.get("current"),
    password: formData.get("password"),
    confirm: formData.get("confirm"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };

  const row = one<{ password_hash: string }>("SELECT password_hash FROM users WHERE id = ?", [user.id]);
  if (!row || !verifyPassword(parsed.data.current, row.password_hash)) {
    return { errors: { current: locale === "ar" ? "كلمة المرور الحالية غير صحيحة" : "Current password is incorrect" } };
  }

  run("UPDATE users SET password_hash = ? WHERE id = ?", [hashPassword(parsed.data.password), user.id]);
  run("DELETE FROM sessions WHERE user_id = ?", [user.id]);
  await audit(user.id, "password_change", "user", user.id);
  await createSession(user.id);
  return { message: locale === "ar" ? "تم تحديث كلمة المرور وتسجيل الخروج من الجلسات الأخرى." : "Password updated. Other sessions have been signed out." };
}

export async function updateProfile(_prev: AuthState, formData: FormData): Promise<AuthState> {
  const locale = await getLocale();
  const user = await requireUser();
  const name = String(formData.get("name") ?? "").trim();
  const company = String(formData.get("company") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim();
  if (name.length < 2) {
    return { errors: { name: locale === "ar" ? "أدخل اسمك الكامل" : "Enter your full name" } };
  }
  run("UPDATE users SET name = ?, company = ?, phone = ? WHERE id = ?", [name.slice(0, 120), company.slice(0, 160) || null, phone.slice(0, 40) || null, user.id]);
  await audit(user.id, "profile_update", "user", user.id);
  return { message: locale === "ar" ? "تم حفظ الملف الشخصي." : "Profile saved." };
}
