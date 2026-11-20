#!/usr/bin/env node
/**
 * HTTP smoke test. Run against a started server: npm run build && npm start, then npm run smoke.
 * BASE_URL defaults to http://localhost:3000.
 */
const base = (process.env.BASE_URL || "http://localhost:3000").replace(/\/$/, "");

const pages = [
  ["/", "Clarity for Today"],
  ["/about", "BAYAN means clarity"],
  ["/divisions", "Four divisions"],
  ["/divisions/technologies", "BAYAN Technologies"],
  ["/divisions/advisory", "BAYAN Advisory"],
  ["/divisions/trading", "BAYAN Trading"],
  ["/divisions/investments", "BAYAN Investments"],
  ["/insights", "Insights"],
  ["/case-studies", "What changed"],
  ["/careers", "Careers"],
  ["/contact", "Let"],
  ["/consultation", "consultation"],
  ["/privacy", "Privacy Policy"],
  ["/terms", "Terms"],
  ["/cookies", "Cookie Policy"],
  ["/regulatory", "Regulatory"],
];

const generated = ["/sitemap.xml", "/robots.txt", "/llms.txt"];
const guarded = [
  ["/admin", "/admin/login"],
  ["/admin/enquiries", "/admin/login"],
  ["/portal", "/portal/login"],
  ["/portal/documents", "/portal/login"],
];

let failures = 0;
const check = async (label, fn) => {
  try {
    await fn();
    console.log(`ok   ${label}`);
  } catch (error) {
    failures += 1;
    console.error(`FAIL ${label}: ${error.message}`);
  }
};

for (const [path, marker] of pages) {
  await check(`GET ${path}`, async () => {
    const res = await fetch(`${base}${path}`, { redirect: "manual" });
    if (res.status !== 200) throw new Error(`status ${res.status}`);
    const html = await res.text();
    if (!html.includes(marker)) throw new Error(`missing expected text "${marker}"`);
    if (!/<html[^>]+lang="(en|ar)"/.test(html)) throw new Error("missing html lang");
    if (!html.includes('rel="canonical"')) throw new Error("missing canonical link");
  });
}

for (const path of generated) {
  await check(`GET ${path}`, async () => {
    const res = await fetch(`${base}${path}`);
    if (res.status !== 200) throw new Error(`status ${res.status}`);
    const body = await res.text();
    if (body.trim().length < 20) throw new Error("empty body");
  });
}

for (const [path, location] of guarded) {
  await check(`GUARD ${path}`, async () => {
    const res = await fetch(`${base}${path}`, { redirect: "manual" });
    if (res.status !== 307 && res.status !== 302 && res.status !== 303) throw new Error(`expected redirect, got ${res.status}`);
    const target = res.headers.get("location") || "";
    if (!target.includes(location)) throw new Error(`redirected to ${target}`);
  });
}

await check("GET /this-page-does-not-exist", async () => {
  const res = await fetch(`${base}/this-page-does-not-exist`, { redirect: "manual" });
  if (res.status !== 404) throw new Error(`expected 404, got ${res.status}`);
});

await check("GET /api/portal/documents/1 unauthenticated", async () => {
  const res = await fetch(`${base}/api/portal/documents/1`, { redirect: "manual" });
  if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
});

await check("POST form action is not a public API", async () => {
  const res = await fetch(`${base}/api/admin/enquiries/export`, { redirect: "manual" });
  if (res.status !== 401) throw new Error(`expected 401, got ${res.status}`);
});

await check("Arabic locale cookie renders RTL", async () => {
  const res = await fetch(`${base}/about`, { headers: { Cookie: "bayan_locale=ar" } });
  const html = await res.text();
  if (!html.includes('dir="rtl"')) throw new Error("missing dir=rtl");
  if (!html.includes('lang="ar"')) throw new Error("missing lang=ar");
});

if (failures) {
  console.error(`\n${failures} check(s) failed against ${base}`);
  process.exit(1);
}
console.log(`\nAll checks passed against ${base}`);
