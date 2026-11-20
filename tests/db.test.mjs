import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dir = mkdtempSync(join(tmpdir(), "bayan-test-"));
const dbPath = join(dir, "test.db");
process.env.DATABASE_PATH = dbPath;

const { all, one, getSetting, getSettings, setSetting, run, reference } = await import("../src/lib/db.ts");
const { hashPassword, verifyPassword } = await import("../src/lib/password.ts");

before(() => {
  execFileSync(process.execPath, [join(root, "scripts", "db.mjs"), "reset"], {
    env: { ...process.env, DATABASE_PATH: dbPath },
    stdio: "ignore",
  });
});

after(() => rmSync(dir, { recursive: true, force: true }));

test("seed populates products, articles, cases, pages and FAQs", () => {
  assert.ok(all("SELECT id FROM products").length >= 12);
  assert.equal(one("SELECT COUNT(*) AS n FROM articles WHERE status = 'published'").n, 4);
  assert.equal(one("SELECT COUNT(*) AS n FROM case_studies WHERE status = 'published'").n, 3);
  assert.deepEqual(
    all("SELECT slug FROM pages ORDER BY slug").map((p) => p.slug),
    ["cookies", "privacy", "regulatory", "terms"],
  );
  assert.ok(one("SELECT COUNT(*) AS n FROM faqs").n >= 4);
});

test("seed creates one super admin, an editor and a client", () => {
  assert.equal(one("SELECT role FROM users WHERE email = ?", ["admin@bayan-group.qa"]).role, "super_admin");
  assert.equal(one("SELECT role FROM users WHERE email = ?", ["editor@bayan-group.qa"]).role, "editor");
  assert.equal(one("SELECT role FROM users WHERE email = ?", ["client@example.com"]).role, "client");
});

test("password hashing round-trips and rejects wrong passwords", () => {
  const stored = hashPassword("CorrectHorse123");
  assert.match(stored, /^scrypt\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
  assert.equal(verifyPassword("CorrectHorse123", stored), true);
  assert.equal(verifyPassword("wrong", stored), false);
  assert.equal(verifyPassword("CorrectHorse123", "plaintext"), false);
  assert.equal(verifyPassword("CorrectHorse123", ""), false);
  assert.notEqual(hashPassword("CorrectHorse123"), stored);
});

test("seeded admin hash verifies against the documented password", () => {
  const row = one("SELECT password_hash FROM users WHERE email = ?", ["admin@bayan-group.qa"]);
  assert.equal(verifyPassword(process.env.ADMIN_PASSWORD || "ChangeMe123!", row.password_hash), true);
});

test("settings can be read, filtered and updated", () => {
  assert.equal(getSetting("company_name_en"), "BAYAN GROUP");
  assert.ok(Object.keys(getSettings("seo_")).length >= 4);
  setSetting("company_name_en", "BAYAN GROUP");
  assert.equal(getSetting("company_name_en"), "BAYAN GROUP");
});

test("queries return plain objects that can cross into client components", () => {
  const row = one("SELECT 1 AS value");
  assert.equal(Object.getPrototypeOf(row), Object.prototype);
  assert.equal(Object.getPrototypeOf(all("SELECT 1 AS value")[0]), Object.prototype);
});

test("reference numbers are unique and follow PREFIX-YYYY-NNNN", () => {
  const first = reference("TST", "enquiries");
  assert.match(first, /^TST-\d{4}-\d{4}$/);
  run("INSERT INTO enquiries (ref,name,email,message) VALUES (?,?,?,?)", [first, "Test", "t@example.com", "message"]);
  const second = reference("TST", "enquiries");
  assert.notEqual(second, first);
  assert.match(second, /^TST-\d{4}-\d{4}$/);
});

test("foreign keys are enforced", () => {
  assert.throws(() =>
    run("INSERT INTO projects (ref,client_id,division,title) VALUES (?,?,?,?)", ["BYN-PRJ-TEST-1", 99999, "technologies", "Bad FK"]),
  );
});
