import { test } from "node:test";
import assert from "node:assert/strict";

const { renderMarkdown } = await import("../src/lib/markdown.ts");
const { t, tf, dir } = await import("../src/lib/dictionary.ts");
const { enquirySchema, rfqSchema, registerSchema } = await import("../src/lib/validation.ts");
const { enquiryFilters } = await import("../src/lib/admin-query.ts");

const validEnquiry = {
  name: "Test User",
  email: "test@example.com",
  phone: "+974 5555 0000",
  company: "Test W.L.L.",
  country: "Qatar",
  division: "technologies",
  kind: "general",
  subject: "ERP",
  message: "We need help selecting an ERP for three warehouses in Doha.",
  consent: "on",
  metadata: {},
};

test("markdown escapes raw HTML before formatting", () => {
  const html = renderMarkdown('<img src=x onerror="alert(1)">\n\n## Heading\n\n**bold**');
  assert.ok(!html.includes("<img"), "raw tag must be escaped");
  assert.ok(html.includes("&lt;img"));
  assert.ok(html.includes("<h2>Heading</h2>"));
  assert.ok(html.includes("<strong>bold</strong>"));
});

test("markdown only links http(s) and site-relative URLs", () => {
  const ok = renderMarkdown("[site](/contact) and [web](https://example.com)");
  assert.ok(ok.includes('href="/contact"'));
  assert.ok(ok.includes('href="https://example.com"'));
  const bad = renderMarkdown("[x](javascript:alert(1))");
  assert.ok(!bad.includes('href="javascript:'), "javascript: URLs must not become links");
});

test("locale dictionary returns both languages and falls back to the key", () => {
  assert.equal(t("en", "nav.home"), "Home");
  assert.equal(t("ar", "nav.home"), "الرئيسية");
  assert.equal(t("en", "missing.key"), "missing.key");
  assert.equal(dir("ar"), "rtl");
  assert.equal(tf("ar")("nav.contact"), "اتصل بنا");
});

test("enquiry validation accepts a complete submission", () => {
  assert.equal(enquirySchema.safeParse(validEnquiry).success, true);
});

test("enquiry validation rejects bad email, short message and missing consent", () => {
  const badEmail = enquirySchema.safeParse({ ...validEnquiry, email: "nope" });
  assert.equal(badEmail.success, false);
  assert.ok(badEmail.error.issues.some((i) => i.path.includes("email")));

  const short = enquirySchema.safeParse({ ...validEnquiry, message: "hi" });
  assert.equal(short.success, false);

  const noConsent = enquirySchema.safeParse({ ...validEnquiry, consent: undefined });
  assert.equal(noConsent.success, false);
});

test("enquiry validation rejects unknown divisions", () => {
  const result = enquirySchema.safeParse({ ...validEnquiry, division: "hr" });
  assert.equal(result.success, false);
});

test("RFQ validation requires quantity and consent", () => {
  const base = { name: "Test User", email: "t@example.com", phone: "+974 5555 0000", consent: "on" };
  assert.equal(rfqSchema.safeParse({ ...base, quantity: "10 units" }).success, true);
  assert.equal(rfqSchema.safeParse({ ...base, quantity: "" }).success, false);
  assert.equal(rfqSchema.safeParse({ name: "Test User", email: "t@example.com", phone: "+974 5555 0000", quantity: "10" }).success, false);
});

test("registration rejects mismatched passwords and short passwords", () => {
  const base = { name: "Test User", email: "t@example.com", phone: "", company: "", password: "longenough1", confirm: "longenough1" };
  assert.equal(registerSchema.safeParse(base).success, true);
  assert.equal(registerSchema.safeParse({ ...base, confirm: "different1" }).success, false);
  assert.equal(registerSchema.safeParse({ ...base, password: "short", confirm: "short" }).success, false);
});

test("admin enquiry filters scope division managers to their division", () => {
  const manager = { role: "division_manager", division: "advisory" };
  const asManager = enquiryFilters({ division: "trading" }, manager);
  assert.match(asManager.where, /e\.division = \?/);
  assert.deepEqual(asManager.values, ["advisory"]);

  const admin = { role: "super_admin", division: null };
  const asAdmin = enquiryFilters({ division: "trading" }, admin);
  assert.match(asAdmin.where, /e\.division = \?/);
  assert.deepEqual(asAdmin.values, ["trading"]);
});

test("admin enquiry filters ignore invalid dates and statuses", () => {
  const admin = { role: "super_admin", division: null };
  const result = enquiryFilters({ status: "DROP TABLE", from: "yesterday" }, admin);
  assert.equal(result.where, "");
  assert.deepEqual(result.values, []);
  assert.equal(result.order, "e.created_at DESC");
});

test("admin enquiry search escapes into a parameterised LIKE", () => {
  const admin = { role: "super_admin", division: null };
  const result = enquiryFilters({ q: "omar" }, admin);
  assert.match(result.where, /e\.ref LIKE \?/);
  assert.equal(result.values.length, 5);
  assert.ok(result.values.every((v) => v === "%omar%" || v === "omar"));
});
