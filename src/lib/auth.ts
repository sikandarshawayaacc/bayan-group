import { cookies, headers } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import { all, one, run } from "./db";

export const SESSION_COOKIE = "bayan_session";
const SESSION_DAYS = 7;
export const STAFF_ROLES = ["super_admin", "editor", "division_manager", "sales"] as const;
export type Role = "super_admin" | "editor" | "division_manager" | "sales" | "client";

export type User = {
  id: number;
  email: string;
  name: string;
  role: Role;
  division: string | null;
  company: string | null;
  phone: string | null;
  locale: string;
  active: number;
  created_at: string;
  last_login_at: string | null;
};

export { hashPassword, verifyPassword } from "./password";

const tokenHash = (token: string) => createHash("sha256").update(token).digest("hex");

export async function createSession(userId: number) {
  const token = randomBytes(32).toString("hex");
  const h = await headers();
  const expires = new Date(Date.now() + SESSION_DAYS * 86_400_000);
  run(
    "INSERT INTO sessions (token_hash,user_id,expires_at,ip,user_agent) VALUES (?,?,?,?,?)",
    [
      tokenHash(token),
      userId,
      expires.toISOString(),
      h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
      h.get("user-agent")?.slice(0, 250) ?? null,
    ],
  );
  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires,
  });
  return token;
}

export async function destroySession() {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) run("DELETE FROM sessions WHERE token_hash = ?", [tokenHash(token)]);
  jar.delete(SESSION_COOKIE);
}

export async function getCurrentUser(): Promise<User | null> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  const row = one<User>(
    `SELECT u.* FROM sessions s JOIN users u ON u.id = s.user_id
     WHERE s.token_hash = ? AND s.expires_at > datetime('now') AND u.active = 1`,
    [tokenHash(token)],
  );
  return row ?? null;
}

export async function requireUser(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/portal/login");
  return user;
}

export async function requireStaff(): Promise<User> {
  const user = await getCurrentUser();
  if (!user) redirect("/admin/login");
  if (!STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number])) redirect("/portal");
  return user;
}

export function isStaff(user: User | null): boolean {
  return !!user && STAFF_ROLES.includes(user.role as (typeof STAFF_ROLES)[number]);
}

export function canWrite(user: User): boolean {
  return user.role !== "client";
}

export async function audit(userId: number | null, action: string, entity: string, entityId: string | number | null, detail = "") {
  const h = await headers();
  run(
    "INSERT INTO audit_log (user_id,action,entity,entity_id,detail,ip) VALUES (?,?,?,?,?,?)",
    [userId, action, entity, entityId === null ? null : String(entityId), detail.slice(0, 500), h.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null],
  );
}

/** Fixed-window limiter backed by SQLite. Returns false when the caller is over the limit. */
export function rateLimit(key: string, limit: number, windowSeconds: number): boolean {
  const now = Date.now();
  const row = one<{ count: number; window_start: string }>("SELECT count, window_start FROM rate_limits WHERE key = ?", [key]);
  if (!row) {
    run("INSERT INTO rate_limits (key,count,window_start) VALUES (?,1,?)", [key, new Date(now).toISOString()]);
    return true;
  }
  if (now - new Date(row.window_start).getTime() > windowSeconds * 1000) {
    run("UPDATE rate_limits SET count = 1, window_start = ? WHERE key = ?", [new Date(now).toISOString(), key]);
    return true;
  }
  if (row.count >= limit) return false;
  run("UPDATE rate_limits SET count = count + 1 WHERE key = ?", [key]);
  return true;
}

export function staffUsers() {
  return all<Pick<User, "id" | "name" | "role">>(
    "SELECT id, name, role FROM users WHERE role != 'client' AND active = 1 ORDER BY name",
  );
}
