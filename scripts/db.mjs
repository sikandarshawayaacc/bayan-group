#!/usr/bin/env node
import { DatabaseSync } from "node:sqlite";
import { randomBytes, randomUUID, scryptSync } from "node:crypto";
import { readFileSync, mkdirSync, writeFileSync, rmSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const dbPath = process.env.DATABASE_PATH || join(root, "data", "bayan.db");
mkdirSync(dirname(dbPath), { recursive: true });

export const hashPassword = (password) => {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, 64).toString("hex");
  return `scrypt$${salt}$${hash}`;
};

const db = new DatabaseSync(dbPath);
db.exec("PRAGMA foreign_keys = ON");
db.exec(readFileSync(join(root, "database", "schema.sql"), "utf8"));

const action = process.argv[2] || "migrate";

if (action === "reset") {
  for (const t of ["sessions", "password_resets", "enquiry_notes", "documents", "messages", "projects", "rfqs", "enquiries", "audit_log", "media", "products", "articles", "case_studies", "pages", "testimonials", "faqs", "settings", "users", "rate_limits"]) {
    db.exec(`DELETE FROM ${t}`);
  }
  db.exec("DELETE FROM sqlite_sequence");
  for (const folder of ["private", "outbox"]) {
    rmSync(join(dirname(dbPath), folder), { recursive: true, force: true });
  }
  console.log("Database cleared.");
}

if (action === "seed" || action === "reset") {
  const adminEmail = process.env.ADMIN_EMAIL || "admin@bayan-group.qa";
  const adminPass = process.env.ADMIN_PASSWORD || "ChangeMe123!";
  const insertUser = db.prepare("INSERT INTO users (email,password_hash,name,role,division,company,phone) VALUES (?,?,?,?,?,?,?)");
  insertUser.run(adminEmail, hashPassword(adminPass), "BAYAN Administrator", "super_admin", null, "BAYAN GROUP", "+974 0000 0000");
  insertUser.run("editor@bayan-group.qa", hashPassword("Editor123!"), "Layla Al-Mansoori", "editor", null, "BAYAN GROUP", null);
  insertUser.run("client@example.com", hashPassword("Client123!"), "Omar Al-Kuwari", "client", null, "Al-Kuwari Trading W.L.L.", "+974 5555 1234");

  const settings = {
    company_name_en: "BAYAN GROUP",
    company_name_ar: "مجموعة بيان",
    tagline_en: "Clarity in Business. Confidence in Growth.",
    tagline_ar: "وضوح في الأعمال. ثقة في النمو.",
    email: "hello@bayan-group.qa",
    phone: "+974 0000 0000",
    whatsapp: "+97400000000",
    address_en: "Doha, State of Qatar",
    address_ar: "الدوحة، دولة قطر",
    hours_en: "Sunday – Thursday, 08:30 – 17:30 AST",
    hours_ar: "الأحد – الخميس، ٨:٣٠ – ١٧:٣٠ بتوقيت الدوحة",
    linkedin: "https://www.linkedin.com/company/bayan-group",
    instagram: "",
    x: "",
    legal_note_en: "BAYAN GROUP is a multi-disciplinary group. Registration, licence and address details are configured by the site administrator and must be verified before publication.",
    legal_note_ar: "مجموعة بيان مجموعة متعددة التخصصات. تُضاف بيانات السجل التجاري والترخيص والعنوان من لوحة الإدارة ويجب التحقق منها قبل النشر.",
    seo_title_en: "BAYAN GROUP — Clarity in Business. Confidence in Growth.",
    seo_title_ar: "مجموعة بيان — وضوح في الأعمال وثقة في النمو",
    seo_description_en: "BAYAN GROUP is a Qatar-based multi-disciplinary group spanning technology, advisory, trading and investments.",
    seo_description_ar: "مجموعة بيان مجموعة قطرية متعددة التخصصات تعمل في التقنية والاستشارات والتجارة والاستثمار.",
    maintenance: "0",
    email_notifications: "1",
  };
  const upsert = db.prepare("INSERT INTO settings (key,value) VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value, updated_at=datetime('now')");
  for (const [k, v] of Object.entries(settings)) upsert.run(k, v);

  const products = [
    ["odoo-erp-implementation", "Odoo ERP Implementation", "Enterprise Software", "BYN-TEC-001", "End-to-end Odoo deployment: discovery, configuration, data migration and go-live support.", "We implement Odoo 17–19 across finance, sales, inventory, manufacturing and HR. Engagements start with a process audit, then a scoped configuration and migration plan, followed by user training and post-go-live support.", "Deployment: cloud or on-premise|Modules: Finance, Sales, Inventory, MRP, HR|Users: 5–500|Languages: English, Arabic (RTL)", "Quoted per scope", null, 1, 1],
    ["odoo-custom-modules", "Odoo Custom Module Development", "Enterprise Software", "BYN-TEC-002", "Custom Odoo modules, reports and integrations built to your operating model.", "From QWeb reports and PDF templates to approval workflows and third-party integrations, we build maintainable modules that survive upgrades.", "Stack: Python, OWL, PostgreSQL|Upgrade path: documented|Testing: unit + acceptance|Handover: source + docs", "Quoted per module", null, 1, 1],
    ["odoo-support-retainer", "Odoo Support & Maintenance", "Enterprise Software", "BYN-TEC-003", "Monthly support with defined response targets, patching and enhancement hours.", "A named engineer, a ticketing channel and a monthly service review. Covers incident response, minor configuration, security patching and upgrade planning.", "Response targets: business hours|Channels: portal + email|Reporting: monthly|Contract: 3–12 months", "From QAR 4,500 / month", null, 1, 0],
    ["business-process-automation", "Business Process Automation", "Digital Transformation", "BYN-TEC-004", "Workflow automation across finance, procurement and operations.", "We map manual processes, remove duplicate data entry and automate approvals with measurable cycle-time targets.", "Discovery: 2 weeks|Delivery: 4–12 weeks|Integrations: ERP, banking, CRM|KPIs: cycle time, error rate", "Quoted per scope", null, 1, 0],
    ["financial-modelling", "Financial Modelling & Feasibility", "Advisory", "BYN-ADV-001", "Three-statement models, feasibility studies and scenario analysis for investment decisions.", "Model architecture, assumptions register, sensitivity tables and a board-ready summary. Delivered with a live model, not a static PDF.", "Horizon: 3–10 years|Scenarios: base, upside, downside|Outputs: model + memo|Review: two rounds", "From QAR 18,000", null, 1, 1],
    ["governance-risk", "Governance, Risk & Compliance", "Advisory", "BYN-ADV-002", "Policy frameworks, control matrices and risk registers sized to your organisation.", "We document the control environment, test design effectiveness and produce a remediation roadmap with owners and dates.", "Framework: COSO-aligned|Deliverables: policies, RACI, register|Testing: walkthroughs|Roadmap: 90-day", "Quoted per scope", null, 1, 0],
    ["market-entry", "Market Entry & Feasibility (GCC)", "Advisory", "BYN-ADV-003", "Structured assessment of demand, licensing path, partners and unit economics.", "A decision pack covering market sizing, competitive landscape, regulatory route and a phased entry plan with cost estimates.", "Coverage: Qatar + GCC|Research: primary + secondary|Output: decision pack|Workshop: included", "From QAR 25,000", null, 1, 0],
    ["industrial-supplies", "Industrial & Office Supplies", "Trading", "BYN-TRD-001", "Sourced consumables, safety items and office supplies with documented origin.", "Catalogue-based supply with quotation, delivery scheduling and batch traceability. Specification sheets available on request.", "Categories: safety, electrical, office|MOQ: case / pallet|Lead time: 5–15 days|Origin: documented", "Quoted per RFQ", null, 1, 1],
    ["equipment-sourcing", "Equipment Sourcing & Logistics", "Trading", "BYN-TRD-002", "Sourcing, inspection and delivery coordination for specialised equipment.", "We confirm specifications, obtain comparable quotes, coordinate inspection and manage freight and customs documentation.", "Inspection: pre-shipment|Incoterms: FOB / CIF / DDP|Documentation: full set|Warranty: per supplier", "Quoted per RFQ", null, 1, 1],
    ["facilities-consumables", "Facilities & Maintenance Consumables", "Trading", "BYN-TRD-003", "Recurring supply programmes for facilities teams.", "Scheduled replenishment with a named account contact, consolidated invoicing and substitute approval rules.", "Scheduling: monthly / quarterly|Substitutes: pre-approved|Invoicing: consolidated|Reporting: usage summary", "Quoted per RFQ", null, 1, 0],
    ["portfolio-review", "Portfolio Review & Allocation", "Investments", "BYN-INV-001", "A structured review of holdings, concentration and liquidity against stated objectives.", "We review asset allocation, currency exposure and liquidity needs, then document observations. No custody, no discretionary management and no guaranteed outcomes.", "Scope: review + memo|Custody: none|Advice: informational|Frequency: annual / semi-annual", "From QAR 12,000", null, 1, 1],
    ["investment-memorandum", "Investment Memorandum Preparation", "Investments", "BYN-INV-002", "Preparation of an investment memorandum for internal or partner review.", "We assemble the thesis, risks, financial summary and diligence questions into a consistent document format.", "Sections: thesis, market, financials, risk|Diligence: checklist|Format: editable|Review: two rounds", "From QAR 20,000", null, 1, 0],
  ];
  const insertProduct = db.prepare("INSERT INTO products (slug,name,category,sku,summary,description,specs,price_note,image,active,featured,sort) VALUES (?,?,?,?,?,?,?,?,?,?,?,?)");
  products.forEach((p, i) => insertProduct.run(...p, i));

  const articles = [
    ["erp-selection-gcc-2026", "Technology", "technologies", "Choosing an ERP in the GCC: five questions before you shortlist", "اختيار نظام تخطيط موارد المؤسسات في الخليج: خمسة أسئلة قبل الترشيح", "Most ERP projects fail at selection, not implementation. Five questions that separate a fit from a demo.", "معظم مشاريع تخطيط الموارد تفشل عند الاختيار لا عند التنفيذ. خمسة أسئلة تفرق بين الحل المناسب والعرض التجريبي.", "ERP selection is usually framed as a software comparison. In practice it is an operating-model decision.\n\n## 1. Which processes are genuinely differentiating?\n\nIf a process gives you an advantage, configure for it. If it does not, adopt the standard flow. Most failed projects customise everything and then cannot upgrade.\n\n## 2. Who owns the data?\n\nMigration is not an IT task. Every master data set needs a business owner who signs off on completeness and accuracy before cutover.\n\n## 3. What does a month-end close look like today?\n\nMap the current close step by step. If the software cannot reproduce the statutory reports your auditor expects, the project is not ready.\n\n## 4. How will change be absorbed?\n\nTraining hours per role, a named super-user per department, and a two-week hypercare window are not optional extras.\n\n## 5. What is the exit cost?\n\nAsk for data export formats, licence portability and upgrade pricing in writing. A system you cannot leave is a system you do not control.", "2026-09-02"],
    ["financial-model-assumptions", "Advisory", "advisory", "The assumptions register: the most valuable page in your financial model", "سجل الافتراضات: أهم صفحة في نموذجك المالي", "A model is only as credible as its assumptions. Here is how to document them so a board can challenge them.", "النموذج بجودة افتراضاته. إليك كيفية توثيقها حتى يتمكن مجلس الإدارة من مناقشتها.", "Every financial model contains dozens of assumptions. Most are buried in formulas where no reviewer will find them.\n\n## Keep one register\n\nList every input: price, volume, churn, salary inflation, payment terms, capex timing. For each, record the value, the source, the owner and the confidence level.\n\n## Separate fact from judgement\n\nContractual prices are facts. Conversion rates are judgements. Label them differently so reviewers know where to push.\n\n## Build scenarios from the register\n\nBase, upside and downside should differ only through named register entries, never through hidden hard-coded overrides.\n\n## Review quarterly\n\nAn assumption that was true at approval is not necessarily true today. Revisit the register on a fixed cadence and log changes with dates.", "2026-08-18"],
    ["supplier-qualification-checklist", "Trading", "trading", "Supplier qualification: a practical checklist for GCC procurement", "تأهيل الموردين: قائمة تحقق عملية للمشتريات في الخليج", "Price is the last thing to compare. Document these six items before you place a first order.", "السعر آخر ما يُقارن. وثّق هذه البنود الستة قبل أول طلب.", "A low quotation with unclear origin and no inspection is not a lower cost — it is deferred risk.\n\n## 1. Legal identity and authority\n\nTrade licence, authorised signatory and bank details verified through an independent channel.\n\n## 2. Specification conformance\n\nDatasheets with model numbers, not marketing brochures. Confirm tolerances and standards.\n\n## 3. Traceability\n\nBatch or serial numbers, country of origin and warranty terms in the purchase order.\n\n## 4. Inspection and acceptance\n\nAgree the inspection method before shipment. Photographic evidence for pre-shipment checks.\n\n## 5. Delivery and Incoterms\n\nName the Incoterm, the border point and who bears unloading. Ambiguity here becomes demurrage.\n\n## 6. Escalation path\n\nA named contact and a response time for defects. Test it once with a minor issue.", "2026-07-29"],
    ["investment-memo-structure", "Investments", "investments", "Writing an investment memorandum that survives scrutiny", "كتابة مذكرة استثمار تصمد أمام التدقيق", "A consistent memorandum structure makes weaknesses visible early — which is the point.", "بنية موحدة للمذكرة تجعل نقاط الضعف ظاهرة مبكراً، وهذا هو الهدف.", "A memorandum is not a pitch. It is a record of reasoning that a sceptical reader can test.\n\n## Structure\n\n1. Thesis in three sentences.\n2. Market and competitive position with sourced figures.\n3. Operating and financial history.\n4. Base, upside and downside cases.\n5. Key risks and mitigants.\n6. Diligence questions still open.\n7. Recommendation with conditions.\n\n## Rules\n\nEvery number has a source. Every projection has an assumption. Every risk has an owner. If a section is thin, say so rather than padding it.\n\n## Regulatory caution\n\nThis material is informational. It is not an offer, a solicitation or a guarantee of return, and it does not constitute regulated investment advice.", "2026-06-11"],
  ];
  const insertArticle = db.prepare("INSERT INTO articles (slug,category,division,title_en,title_ar,excerpt_en,excerpt_ar,body_en,body_ar,status,published_at) VALUES (?,?,?,?,?,?,?,?,?,?,?)");
  for (const a of articles) insertArticle.run(a[0], a[1], a[2], a[3], a[4], a[5], a[6], a[7], null, "published", a[8]);

  const cases = [
    ["distributor-erp-rollout", "Regional distributor", "technologies", "ERP rollout across three warehouses", "A Doha-based distributor ran sales, stock and finance on disconnected spreadsheets. We implemented a single Odoo instance covering three warehouses, with barcode receiving and a month-end close reduced from nine days to three.", "Baseline: 9-day close, 3 stock counts per year|Delivered: unified Odoo instance, 42 users trained|Result: 3-day close, weekly cycle counts|Timeline: 16 weeks", 1],
    ["family-office-model", "Family office", "advisory", "Consolidated reporting for a multi-entity group", "Six entities reported in three formats. We built a consolidation model with a documented assumptions register and a monthly pack that the board now reviews in one sitting.", "Entities: 6|Formats consolidated: 3|Deliverable: model + monthly pack|Review cycle: monthly", 2],
    ["safety-supply-programme", "Contracting group", "trading", "Recurring safety consumables programme", "Ad-hoc purchasing produced stock-outs and inconsistent specifications. We set a quarterly replenishment schedule with pre-approved substitutes and consolidated invoicing.", "Categories: 4|Lead time: 10 days average|Substitutions: pre-approved only|Invoicing: consolidated monthly", 3],
  ];
  const insertCase = db.prepare("INSERT INTO case_studies (slug,client_label,division,title,summary,body,results,status,sort) VALUES (?,?,?,?,?,?,?, 'published', ?)");
  cases.forEach((c) => insertCase.run(c[0], c[1], c[2], c[3], c[4], c[4], c[5], c[6]));

  const insertTestimonial = db.prepare("INSERT INTO testimonials (quote_en,quote_ar,author,role,company,sort) VALUES (?,?,?,?,?,?)");
  insertTestimonial.run("The team documented every assumption and showed us where the model was fragile. That honesty was more useful than a optimistic forecast.", "وثّق الفريق كل الافتراضات وأظهر لنا مواطن الهشاشة في النموذج. كانت هذه الصراحة أنفع من أي توقعات متفائلة.", "Managing Director", "Family office", "Doha", 1);
  insertTestimonial.run("Our close went from nine days to three. The difference was process discipline, not just software.", "انخفضت فترة الإقفال من تسعة أيام إلى ثلاثة. كان الفرق في انضباط العمليات وليس في البرنامج وحده.", "Finance Director", "Regional distributor", "Qatar", 2);

  const insertFaq = db.prepare("INSERT INTO faqs (question_en,question_ar,answer_en,answer_ar,division,sort) VALUES (?,?,?,?,?,?)");
  insertFaq.run("How quickly can an engagement start?", "متى يمكن أن يبدأ التعاون؟", "Most engagements begin within two weeks of a signed scope. Urgent support requests are triaged within one business day.", "تبدأ معظم المشاركات خلال أسبوعين من توقيع النطاق. تُصنَّف طلبات الدعم العاجلة خلال يوم عمل واحد.", null, 1);
  insertFaq.run("Do you work with clients outside Qatar?", "هل تعملون مع عملاء خارج قطر؟", "Yes. We work across the GCC and remotely with international clients, with on-site visits where the scope requires them.", "نعم. نعمل في دول الخليج وعن بُعد مع عملاء دوليين، مع زيارات ميدانية عند الحاجة.", null, 2);
  insertFaq.run("Can you take over an existing Odoo implementation?", "هل يمكنكم تولي تنفيذ Odoo قائم؟", "Yes. We start with a technical and process audit, document what exists, then agree a remediation plan before changing anything.", "نعم. نبدأ بتدقيق تقني وإجرائي، نوثّق الوضع القائم، ثم نتفق على خطة معالجة قبل أي تغيير.", "technologies", 3);
  insertFaq.run("Do you provide investment advice?", "هل تقدمون استشارات استثمارية؟", "No. BAYAN Investments provides research, modelling and review support. We do not hold client assets, manage portfolios on a discretionary basis, or guarantee returns.", "لا. تقدم بيان للاستثمار دعماً بحثياً ونمذجة ومراجعة. لا نحتفظ بأصول العملاء ولا ندير المحافظ بشكل تقديري ولا نضمن العوائد.", "investments", 4);

  const insertPage = db.prepare("INSERT INTO pages (slug,title_en,title_ar,body_en,body_ar,seo_title,seo_description,status) VALUES (?,?,?,?,?,?,?, 'published')");
  insertPage.run("privacy", "Privacy Policy", "سياسة الخصوصية", privacyBody(), privacyBodyAr(), "Privacy Policy — BAYAN GROUP", "How BAYAN GROUP collects, uses and protects personal data.");
  insertPage.run("terms", "Terms & Conditions", "الشروط والأحكام", termsBody(), termsBodyAr(), "Terms & Conditions — BAYAN GROUP", "The terms governing use of the BAYAN GROUP website and services.");
  insertPage.run("cookies", "Cookie Policy", "سياسة ملفات تعريف الارتباط", cookieBody(), cookieBodyAr(), "Cookie Policy — BAYAN GROUP", "How BAYAN GROUP uses cookies and similar technologies.");
  insertPage.run("regulatory", "Regulatory & Legal Disclosures", "الإفصاحات التنظيمية والقانونية", regulatoryBody(), regulatoryBodyAr(), "Regulatory & Legal Disclosures — BAYAN GROUP", "Important disclosures relating to BAYAN GROUP services.");

  const now = new Date().toISOString();
  db.prepare("INSERT INTO enquiries (ref,kind,division,name,company,email,phone,country,subject,message,status,priority,user_id,created_at,updated_at) VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,?,?)")
    .run("BYN-2026-0001", "contact", "technologies", "Omar Al-Kuwari", "Al-Kuwari Trading W.L.L.", "client@example.com", "+974 5555 1234", "Qatar", "Odoo implementation for trading", "We need Odoo for sales, stock and finance across two warehouses. Currently on spreadsheets.", "IN_PROGRESS", "high", 3, now, now);
  db.prepare("INSERT INTO projects (ref,client_id,division,title,description,status,progress,start_date,due_date) VALUES (?,?,?,?,?,?,?,?,?)")
    .run("BYN-PRJ-2026-0001", 3, "technologies", "Odoo implementation — Phase 1", "Finance, sales and inventory configuration with barcode receiving for two warehouses.", "IN_PROGRESS", 45, "2026-09-15", "2027-01-20");
  db.prepare("INSERT INTO messages (client_id,sender_id,body) VALUES (?,?,?)")
    .run(3, 1, "Phase 1 configuration is on track. The inventory workshop notes are in your documents area.");
  db.prepare("INSERT INTO messages (client_id,sender_id,body) VALUES (?,?,?)")
    .run(3, 3, "Thank you. We will review the notes before Thursday's session.");
  db.prepare("INSERT INTO media (filename,original_name,mime,size,alt,uploaded_by) VALUES (?,?,?,?,?,?)")
    .run("sample-brief.txt", "project-brief.txt", "text/plain", 2048, "Sample project brief", 1);
  const brief = "BAYAN GROUP — sample project brief\n\nReplace this file with real project documentation.\n";
  const privateDir = join(dirname(dbPath), "private");
  mkdirSync(privateDir, { recursive: true });
  const briefFile = `${randomUUID()}.txt`;
  writeFileSync(join(privateDir, briefFile), brief);
  db.prepare("INSERT INTO documents (project_id,client_id,name,filename,mime,size,uploaded_by) VALUES (?,?,?,?,?,?,?)")
    .run(1, 3, "Sample project brief", briefFile, "text/plain", Buffer.byteLength(brief), 1);

  console.log(`Seeded database at ${dbPath}`);
  console.log(`Admin: ${adminEmail} / ${adminPass}`);
  console.log("Client: client@example.com / Client123!");
}

function privacyBody() {
  return `## 1. Who we are\n\nThis website is operated by BAYAN GROUP. Company registration, licence and address details are maintained by the site administrator and published in the footer and Regulatory & Legal Disclosures page.\n\n## 2. What we collect\n\n- Contact details you submit through enquiry, consultation, RFQ or careers forms.\n- Account details if you register for the Client Portal.\n- Documents and messages you upload or send through the portal.\n- Technical data such as IP address, browser type and pages visited.\n\n## 3. Why we process it\n\nTo respond to enquiries, deliver contracted services, operate client accounts, meet legal obligations and improve the website. We rely on consent, contract performance and legitimate interests as applicable.\n\n## 4. Sharing\n\nWe share data with service providers that host the website, deliver email and store files, under written terms. We do not sell personal data.\n\n## 5. Retention\n\nEnquiry records are kept for 24 months unless a contract requires longer. Portal records are kept while the account is active and for 12 months afterwards. Uploaded documents are deleted on request where no legal retention duty applies.\n\n## 6. Your rights\n\nYou may request access, correction, deletion, restriction or portability, and withdraw consent at any time by writing to the contact address in the footer. You may also complain to the relevant data protection authority.\n\n## 7. Security\n\nAccess is role-based and server-enforced. Passwords are stored as salted hashes. Sessions expire. Administrative actions are logged.\n\n## 8. Changes\n\nWe will publish material changes on this page and update the effective date.`;
}
function privacyBodyAr() {
  return `## ١. من نحن\n\nيدار هذا الموقع بواسطة مجموعة بيان. تُحفظ بيانات السجل التجاري والترخيص والعنوان لدى مسؤول الموقع وتُنشر في التذييل وصفحة الإفصاحات التنظيمية.\n\n## ٢. ما نجمعه\n\n- بيانات التواصل التي ترسلها عبر نماذج الاستفسار أو الاستشارة أو طلب عرض السعر أو التوظيف.\n- بيانات الحساب عند التسجيل في بوابة العملاء.\n- المستندات والرسائل التي ترفعها أو ترسلها عبر البوابة.\n- بيانات تقنية مثل عنوان IP ونوع المتصفح والصفحات التي تمت زيارتها.\n\n## ٣. أسباب المعالجة\n\nللرد على الاستفسارات وتنفيذ الخدمات المتعاقد عليها وإدارة حسابات العملاء والوفاء بالالتزامات القانونية وتحسين الموقع.\n\n## ٤. المشاركة\n\nنشارك البيانات مع مزودي الخدمات الذين يستضيفون الموقع ويوصلون البريد ويخزنون الملفات بموجب شروط مكتوبة. لا نبيع البيانات الشخصية.\n\n## ٥. الاحتفاظ\n\nتُحفظ سجلات الاستفسار ٢٤ شهراً ما لم يتطلب العقد مدة أطول. تُحفظ سجلات البوابة أثناء نشاط الحساب و١٢ شهراً بعد ذلك.\n\n## ٦. حقوقك\n\nيمكنك طلب الوصول أو التصحيح أو الحذف أو التقييد أو النقل وسحب الموافقة في أي وقت عبر عنوان التواصل في التذييل.\n\n## ٧. الأمن\n\nالوصول قائم على الأدوار ويُفرض من الخادم. تُخزن كلمات المرور كتجزئات مملّحة. تنتهي الجلسات. تُسجل الإجراءات الإدارية.\n\n## ٨. التغييرات\n\nسننشر التغييرات الجوهرية في هذه الصفحة ونحدّث تاريخ السريان.`;
}
function termsBody() {
  return `## 1. Acceptance\n\nBy using this website you agree to these terms. If you do not agree, do not use the site.\n\n## 2. Website content\n\nContent is provided for general information. It does not constitute professional, legal, tax or investment advice and should not be relied upon without a written engagement.\n\n## 3. Enquiries and quotations\n\nSubmitting a form does not create a contract. A binding relationship arises only from a signed scope or written acceptance of a quotation.\n\n## 4. Client Portal\n\nYou are responsible for keeping credentials confidential and for activity under your account. Notify us immediately of unauthorised access. We may suspend accounts that breach these terms.\n\n## 5. Intellectual property\n\nThe site, brand and content are owned by BAYAN GROUP or its licensors. You may not copy or republish material without written permission.\n\n## 6. Acceptable use\n\nNo unlawful use, no attempts to gain unauthorised access, no automated scraping that degrades the service, no uploading of malicious files.\n\n## 7. Liability\n\nTo the extent permitted by law, we exclude liability for indirect or consequential loss arising from use of the website. Nothing excludes liability that cannot lawfully be excluded.\n\n## 8. Governing law\n\nThe laws of the State of Qatar apply. Courts of Qatar have jurisdiction, subject to any mandatory provision to the contrary.\n\n## 9. Changes\n\nWe may update these terms. Continued use after publication constitutes acceptance.`;
}
function termsBodyAr() {
  return `## ١. القبول\n\nباستخدامك هذا الموقع فإنك توافق على هذه الشروط. إذا لم توافق، يُرجى عدم استخدام الموقع.\n\n## ٢. محتوى الموقع\n\nالمحتوى لأغراض المعلومات العامة ولا يشكل استشارة مهنية أو قانونية أو ضريبية أو استثمارية.\n\n## ٣. الاستفسارات وعروض الأسعار\n\nإرسال النموذج لا ينشئ عقداً. تنشأ العلاقة الملزمة فقط من نطاق موقّع أو قبول كتابي لعرض سعر.\n\n## ٤. بوابة العملاء\n\nأنت مسؤول عن سرية بيانات الدخول وعن النشاط تحت حسابك. أبلغنا فوراً عن أي وصول غير مصرح به.\n\n## ٥. الملكية الفكرية\n\nالموقع والعلامة والمحتوى مملوكة لمجموعة بيان أو مرخّصيها. لا يجوز النسخ أو إعادة النشر دون إذن كتابي.\n\n## ٦. الاستخدام المقبول\n\nيُحظر الاستخدام غير القانوني ومحاولات الوصول غير المصرح به والجمع الآلي الذي يضر بالخدمة ورفع الملفات الضارة.\n\n## ٧. المسؤولية\n\nنستبعد، بالقدر الذي يسمح به القانون، المسؤولية عن الخسائر غير المباشرة الناشئة عن استخدام الموقع.\n\n## ٨. القانون الحاكم\n\nتُطبق قوانين دولة قطر وتختص محاكمها، مع مراعاة أي حكم إلزامي مخالف.\n\n## ٩. التغييرات\n\nيجوز لنا تحديث هذه الشروط، ويُعد الاستخدام المستمر بعد النشر قبولاً بها.`;
}
function cookieBody() {
  return `## What cookies we use\n\n- **Essential** — session cookie for the Client Portal and admin panel. Required for sign-in. Cannot be disabled.\n- **Preference** — remembers your language (English/Arabic) and cookie consent choice.\n- **Analytics** — none are enabled by default. If enabled by the administrator, they will be listed here with retention periods.\n\n## Managing cookies\n\nYou can clear or block cookies in your browser. Blocking the essential session cookie prevents portal and admin sign-in.\n\n## Consent\n\nOn your first visit, a banner records your choice for non-essential cookies. You can change your choice at any time from the footer.`;
}
function cookieBodyAr() {
  return `## ملفات تعريف الارتباط المستخدمة\n\n- **أساسية** — ملف جلسة لبوابة العملاء ولوحة الإدارة، مطلوب لتسجيل الدخول ولا يمكن تعطيله.\n- **تفضيلات** — يتذكر اللغة (الإنجليزية/العربية) واختيار الموافقة على ملفات الارتباط.\n- **تحليلات** — لا تُفعّل افتراضياً. عند تفعيلها من الإدارة ستُدرج هنا مع مدد الاحتفاظ.\n\n## إدارة ملفات الارتباط\n\nيمكنك حذفها أو حظرها من المتصفح. حظر ملف الجلسة يمنع الدخول إلى البوابة ولوحة الإدارة.\n\n## الموافقة\n\nيسجل الشريط الظاهر عند أول زيارة اختيارك لملفات الارتباط غير الأساسية، ويمكنك تغييره من التذييل.`;
}
function regulatoryBody() {
  return `## Nature of services\n\nBAYAN GROUP operates through four divisions. Each division's services are delivered under a written scope. Website content is general information and is not an offer, solicitation or professional advice.\n\n## Investments\n\nBAYAN Investments provides research, modelling and review support. We do not hold client assets, do not operate a discretionary portfolio management service and do not guarantee any return. Any figures shown in calculators are illustrative and based on the inputs and assumptions displayed. Past performance is not a reliable indicator of future results.\n\n## Technology\n\nSoftware delivery is governed by the signed statement of work. Third-party platforms (including Odoo) are licensed by their respective owners; BAYAN GROUP is not the licensor.\n\n## Trading\n\nProduct listings are indicative. Specifications, origin, lead times and pricing are confirmed in a written quotation. Availability is not guaranteed until an order is accepted.\n\n## Advisory\n\nAdvisory outputs are decision support. They do not replace legal, tax, audit or regulated financial advice, which should be obtained from appropriately licensed providers.\n\n## Registrations and licences\n\nCompany registration number, trade licence, address and any regulatory approvals are maintained by the site administrator. Where a value is not yet published, it is intentionally left blank rather than invented.`;
}
function regulatoryBodyAr() {
  return `## طبيعة الخدمات\n\nتعمل مجموعة بيان عبر أربعة أقسام، وتُقدَّم خدمات كل قسم بموجب نطاق مكتوب. محتوى الموقع معلومات عامة وليس عرضاً أو دعوة أو استشارة مهنية.\n\n## الاستثمار\n\nتقدم بيان للاستثمار دعماً بحثياً ونمذجة ومراجعة. لا نحتفظ بأصول العملاء ولا ندير محافظ بشكل تقديري ولا نضمن أي عائد. الأرقام في الحاسبات توضيحية وتعتمد على المدخلات والافتراضات المعروضة.\n\n## التقنية\n\nيخضع تسليم البرمجيات لبيان العمل الموقّع. المنصات الخارجية (بما فيها Odoo) مرخّصة من مالكيها، ومجموعة بيان ليست الجهة المرخِّصة.\n\n## التجارة\n\nقوائم المنتجات إرشادية. تُؤكد المواصفات والمنشأ ومدد التسليم والأسعار في عرض سعر مكتوب.\n\n## الاستشارات\n\nمخرجات الاستشارات دعم للقرار ولا تحل محل الاستشارة القانونية أو الضريبية أو التدقيقية أو المالية المنظمة.\n\n## السجلات والتراخيص\n\nتُحفظ بيانات السجل التجاري والترخيص والعنوان والموافقات التنظيمية لدى مسؤول الموقع. وحيث لا تتوفر قيمة منشورة تُترك فارغة بدلاً من اختلاقها.`;
}
