import { DatabaseSync } from "node:sqlite";
import { mkdirSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

const dbPath = process.env.DATABASE_PATH || join(process.cwd(), "data", "bayan.db");

type Cache = { db?: DatabaseSync };
const g = globalThis as unknown as { __bayanDb?: Cache };
const cache: Cache = (g.__bayanDb ??= {});

export function getDb(): DatabaseSync {
  if (!cache.db) {
    mkdirSync(dirname(dbPath), { recursive: true });
    const db = new DatabaseSync(dbPath);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
    db.exec("PRAGMA busy_timeout = 5000");
    const schema = readFileSync(join(process.cwd(), "database", "schema.sql"), "utf8");
    db.exec(schema);
    cache.db = db;
  }
  return cache.db;
}

export type Param = string | number | bigint | null | Uint8Array;

// node:sqlite returns null-prototype rows, which cannot cross into Client Components.
const plain = <T>(row: unknown): T => ({ ...(row as object) }) as T;

export function all<T = Record<string, unknown>>(sql: string, params: Param[] = []): T[] {
  return getDb().prepare(sql).all(...params).map((row) => plain<T>(row));
}

export function one<T = Record<string, unknown>>(sql: string, params: Param[] = []): T | undefined {
  const row = getDb().prepare(sql).get(...params);
  return row === undefined ? undefined : plain<T>(row);
}

export function run(sql: string, params: Param[] = []) {
  return getDb().prepare(sql).run(...params);
}

export function getSetting(key: string, fallback = ""): string {
  const row = one<{ value: string }>("SELECT value FROM settings WHERE key = ?", [key]);
  return row?.value ?? fallback;
}

export function getSettings(prefix = ""): Record<string, string> {
  const rows = all<{ key: string; value: string }>("SELECT key, value FROM settings WHERE key LIKE ?", [`${prefix}%`]);
  return Object.fromEntries(rows.map((r) => [r.key, r.value]));
}

export function setSetting(key: string, value: string) {
  run(
    "INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')",
    [key, value],
  );
}

const REF_TABLES = new Set(["enquiries", "rfqs", "projects"]);

export function reference(prefix: string, table = "enquiries"): string {
  const safe = REF_TABLES.has(table) ? table : "enquiries";
  const year = new Date().getFullYear();
  const row = one<{ n: number }>(`SELECT COUNT(*) AS n FROM ${safe} WHERE ref LIKE ?`, [`${prefix}-${year}-%`]);
  const seq = String((row?.n ?? 0) + 1).padStart(4, "0");
  return `${prefix}-${year}-${seq}`;
}
