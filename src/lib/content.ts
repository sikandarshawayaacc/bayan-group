export type Bi = { en: string; ar: string };
export type DivisionSlug = "technologies" | "advisory" | "trading" | "investments";

export type Division = {
  slug: DivisionSlug;
  name: Bi;
  short: Bi;
  tagline: Bi;
  intro: Bi;
  description: Bi[];
  services: { title: Bi; body: Bi }[];
  capabilities: Bi[];
  approach: Bi[];
  accent: string;
};

const b = (en: string, ar: string): Bi => ({ en, ar });

export const divisions: Division[] = [
  {
    slug: "technologies",
    name: b("BAYAN Technologies", "بيان للتقنية"),
    short: b("Technology", "التقنية"),
    tagline: b("Systems that fit how you actually work.", "أنظمة تناسب طريقة عملك الفعلية."),
    intro: b(
      "ERP implementation, custom development and process automation — delivered with documentation you can maintain.",
      "تنفيذ أنظمة تخطيط الموارد والتطوير المخصص وأتمتة العمليات، مع وثائق يمكنك صيانتها.",
    ),
    description: [
      b(
        "We implement and support Odoo for organisations that have outgrown spreadsheets but do not want a two-year transformation programme. Engagements start with a process audit, not a licence quote.",
        "ننفذ وندعم Odoo للمؤسسات التي تجاوزت جداول البيانات ولا تريد برنامج تحول يستمر عامين. تبدأ المشاركة بتدقيق العمليات لا بعرض سعر ترخيص.",
      ),
      b(
        "Every deployment includes a data ownership map, a named super-user per department, written configuration decisions and a documented upgrade path. If we cannot support a requirement without breaking future upgrades, we say so before the contract, not after.",
        "يشمل كل تنفيذ خريطة ملكية بيانات ومستخدمًا رئيسيًا لكل إدارة وقرارات إعداد مكتوبة ومسار ترقية موثقًا. وإذا تعذر تلبية متطلب دون الإضرار بالترقيات المستقبلية، نقول ذلك قبل العقد لا بعده.",
      ),
    ],
    services: [
      { title: b("Odoo ERP implementation", "تنفيذ Odoo"), body: b("Discovery, configuration, data migration, training and go-live support across finance, sales, inventory, manufacturing and HR.", "الاستكشاف والإعداد وترحيل البيانات والتدريب ودعم الإطلاق عبر المالية والمبيعات والمخزون والتصنيع والموارد البشرية.") },
      { title: b("Custom modules & reports", "وحدات وتقارير مخصصة"), body: b("Maintainable Python and OWL modules, QWeb PDF reports and integrations built to your operating model.", "وحدات Python وOWL قابلة للصيانة وتقارير QWeb PDF وتكاملات مبنية على نموذج تشغيلك.") },
      { title: b("Data migration", "ترحيل البيانات"), body: b("Cleansing, mapping and reconciliation with a signed-off completeness report before cutover.", "تنظيف وربط ومطابقة مع تقرير اكتمال معتمد قبل التحويل.") },
      { title: b("Process automation", "أتمتة العمليات"), body: b("Approvals, document flows and integrations that remove duplicate entry and shorten cycle time.", "موافقات وتدفقات مستندات وتكاملات تزيل الإدخال المكرر وتختصر زمن الدورة.") },
      { title: b("Support & maintenance", "الدعم والصيانة"), body: b("Defined response targets, security patching, enhancement hours and a monthly service review.", "أهداف استجابة محددة وتحديثات أمنية وساعات تطوير ومراجعة خدمة شهرية.") },
      { title: b("Upgrade readiness", "الجاهزية للترقية"), body: b("Audit of customisations, dependency mapping and a tested upgrade plan for the next major version.", "تدقيق التخصيصات وربط التبعيات وخطة ترقية مختبرة للإصدار الرئيسي القادم.") },
    ],
    capabilities: [
      b("Odoo 17–19 implementation and migration", "تنفيذ وترحيل Odoo 17–19"),
      b("Finance, sales, inventory, MRP and HR", "المالية والمبيعات والمخزون والتصنيع والموارد البشرية"),
      b("Arabic RTL interfaces and reports", "واجهات وتقارير عربية من اليمين إلى اليسار"),
      b("Role-based access and audit trails", "وصول قائم على الأدوار ومسارات تدقيق"),
      b("Third-party and banking integrations", "تكاملات مع أطراف ثالثة والبنوك"),
      b("Cloud or on-premise deployment", "نشر سحابي أو داخلي"),
    ],
    approach: [
      b("Audit the process before quoting software.", "تدقيق العملية قبل تسعير البرنامج."),
      b("Configure for differentiation, standardise everything else.", "الإعداد لما يميزك وتوحيد ما عدا ذلك."),
      b("Document every decision and every customisation.", "توثيق كل قرار وكل تخصيص."),
      b("Train named super-users, then hand over.", "تدريب مستخدمين رئيسيين بالاسم ثم التسليم."),
    ],
    accent: "#239A96",
  },
  {
    slug: "advisory",
    name: b("BAYAN Advisory", "بيان للاستشارات"),
    short: b("Advisory", "الاستشارات"),
    tagline: b("Decisions you can defend.", "قرارات قابلة للدفاع عنها."),
    intro: b(
      "Financial modelling, feasibility, governance and market entry support for boards and founders.",
      "نمذجة مالية ودراسات جدوى وحوكمة ودعم دخول الأسواق لمجالس الإدارة والمؤسسين.",
    ),
    description: [
      b(
        "Advisory work is judged by whether a decision improves, not by the thickness of the deck. We build models with visible assumptions, test them against downside cases, and write a recommendation with conditions attached.",
        "يُقاس عمل الاستشارات بتحسن القرار لا بعدد صفحات العرض. نبني نماذج بافتراضات ظاهرة ونختبرها بسيناريوهات سلبية ونكتب توصية بشروط.",
      ),
      b(
        "We do not replace auditors, lawyers or licensed tax advisers. Where an engagement touches a regulated area, we say so and work alongside the appropriately licensed provider.",
        "لا نستبدل المدققين أو المحامين أو مستشاري الضرائب المرخصين. وحين تمس المشاركة مجالاً منظمًا، نوضح ذلك ونعمل مع المزود المرخص.",
      ),
    ],
    services: [
      { title: b("Financial modelling", "النمذجة المالية"), body: b("Three-statement models, scenario analysis and a documented assumptions register.", "نماذج القوائم الثلاث وتحليل السيناريوهات وسجل افتراضات موثق.") },
      { title: b("Feasibility studies", "دراسات الجدوى"), body: b("Market sizing, cost structure, unit economics and a go/no-go recommendation.", "حجم السوق وهيكل التكلفة واقتصاديات الوحدة وتوصية بالمضي أو التوقف.") },
      { title: b("Governance & risk", "الحوكمة والمخاطر"), body: b("Policy frameworks, control matrices, risk registers and a 90-day remediation roadmap.", "أطر سياسات ومصفوفات رقابة وسجلات مخاطر وخطة معالجة لـ٩٠ يوماً.") },
      { title: b("Market entry (GCC)", "دخول السوق الخليجي"), body: b("Demand assessment, licensing route, partner shortlist and phased entry costs.", "تقييم الطلب ومسار الترخيص وقائمة شركاء وتكاليف دخول مرحلية.") },
      { title: b("Performance review", "مراجعة الأداء"), body: b("Margin, cash conversion and working-capital diagnosis with prioritised actions.", "تشخيص الهامش والتحويل النقدي ورأس المال العامل مع إجراءات مرتبة بالأولوية.") },
      { title: b("Board reporting", "تقارير مجلس الإدارة"), body: b("A consistent monthly pack that separates performance, position and forward risk.", "حزمة شهرية موحدة تفصل الأداء والمركز والمخاطر المستقبلية.") },
    ],
    capabilities: [
      b("Three-statement and project finance models", "نماذج القوائم الثلاث وتمويل المشاريع"),
      b("Scenario and sensitivity analysis", "تحليل السيناريوهات والحساسية"),
      b("Control design and walkthrough testing", "تصميم الرقابة واختبار المسارات"),
      b("GCC market and licensing research", "بحث السوق والترخيص في الخليج"),
      b("Working-capital and cash-flow review", "مراجعة رأس المال العامل والتدفق النقدي"),
      b("Board-ready documentation", "وثائق جاهزة لمجلس الإدارة"),
    ],
    approach: [
      b("State the decision before building the model.", "تحديد القرار قبل بناء النموذج."),
      b("Put every assumption on one page with an owner.", "وضع كل افتراض في صفحة واحدة مع مسؤول."),
      b("Test the downside before the upside.", "اختبار السيناريو السلبي قبل الإيجابي."),
      b("Recommend with conditions, not adjectives.", "التوصية بشروط لا بصفات."),
    ],
    accent: "#B69A63",
  },
  {
    slug: "trading",
    name: b("BAYAN Trading", "بيان للتجارة"),
    short: b("Trading", "التجارة"),
    tagline: b("Specified, sourced, documented.", "مواصفات ومصادر وتوثيق."),
    intro: b(
      "Industrial, safety and office supplies with documented origin, agreed specifications and quotation-based pricing.",
      "مستلزمات صناعية وسلامة ومكتبية بمنشأ موثق ومواصفات متفق عليها وأسعار بعروض.",
    ),
    description: [
      b(
        "Our trading division supplies organisations that need consistency more than the lowest one-off price. Every quotation names the specification, country of origin, lead time and Incoterm.",
        "يورد قسم التجارة للمؤسسات التي تحتاج الاتساق أكثر من أرخص سعر لمرة واحدة. كل عرض سعر يحدد المواصفات والمنشأ ومدة التسليم وشرط التسليم الدولي.",
      ),
      b(
        "Listings on this site are indicative. Availability, substitution rules and pricing are confirmed in a written quotation before an order is accepted. We do not process payments on this website.",
        "القوائم في هذا الموقع إرشادية. يُؤكد التوفر وقواعد الاستبدال والسعر في عرض مكتوب قبل قبول الطلب. لا نعالج المدفوعات على هذا الموقع.",
      ),
    ],
    services: [
      { title: b("Industrial supplies", "المستلزمات الصناعية"), body: b("Consumables, fasteners, electrical items and workshop supplies with datasheets.", "مستلزمات ومسامير ومواد كهربائية وتجهيزات ورش مع نشرات فنية.") },
      { title: b("Safety & PPE", "السلامة ومعدات الوقاية"), body: b("Certified personal protective equipment with batch traceability.", "معدات وقاية شخصية معتمدة مع تتبع الدفعات.") },
      { title: b("Office & facilities", "المكتب والمرافق"), body: b("Recurring consumables, furniture and facility maintenance items.", "مستلزمات متكررة وأثاث ومواد صيانة المرافق.") },
      { title: b("Equipment sourcing", "توريد المعدات"), body: b("Specification confirmation, comparable quotes, inspection and freight coordination.", "تأكيد المواصفات وعروض مقارنة والتفتيش وتنسيق الشحن.") },
      { title: b("Supplier qualification", "تأهيل الموردين"), body: b("Licence, capacity and traceability checks before a first order.", "فحص الترخيص والقدرة والتتبع قبل أول طلب.") },
      { title: b("Replenishment programmes", "برامج إعادة التوريد"), body: b("Scheduled supply with pre-approved substitutes and consolidated invoicing.", "توريد مجدول ببدائل معتمدة مسبقاً وفواتير موحدة.") },
    ],
    capabilities: [
      b("Documented country of origin", "منشأ موثق"),
      b("Specification sheets on request", "نشرات مواصفات عند الطلب"),
      b("Pre-shipment inspection", "تفتيش قبل الشحن"),
      b("FOB, CIF and DDP terms", "شروط FOB وCIF وDDP"),
      b("Batch and serial traceability", "تتبع الدفعات والأرقام التسلسلية"),
      b("Consolidated monthly invoicing", "فواتير شهرية موحدة"),
    ],
    approach: [
      b("Confirm the specification in writing first.", "تأكيد المواصفات كتابةً أولاً."),
      b("Quote comparable options, not one price.", "تقديم خيارات قابلة للمقارنة لا سعر واحد."),
      b("Agree inspection and Incoterms before shipment.", "الاتفاق على التفتيش وشروط التسليم قبل الشحن."),
      b("Name an account contact and an escalation path.", "تحديد مسؤول حساب ومسار تصعيد."),
    ],
    accent: "#176E70",
  },
  {
    slug: "investments",
    name: b("BAYAN Investments", "بيان للاستثمار"),
    short: b("Investments", "الاستثمار"),
    tagline: b("Research and review. No promises.", "بحث ومراجعة. بلا وعود."),
    intro: b(
      "Portfolio review, investment memoranda and diligence support — informational, never a guarantee.",
      "مراجعة المحافظ ومذكرات الاستثمار ودعم التدقيق، لأغراض معلوماتية دون أي ضمان.",
    ),
    description: [
      b(
        "This division prepares research and decision documents. We do not hold client assets, do not manage portfolios on a discretionary basis, and do not promise returns.",
        "يُعد هذا القسم أبحاثًا ووثائق قرار. لا نحتفظ بأصول العملاء ولا ندير المحافظ بشكل تقديري ولا نعد بعوائد.",
      ),
      b(
        "Calculators on this site are illustrative. They apply the formula and assumptions shown on screen to the inputs you provide. They are not forecasts, advice or an offer of any financial product.",
        "الحاسبات في هذا الموقع توضيحية. تطبق المعادلة والافتراضات المعروضة على مدخلاتك. وهي ليست توقعات ولا استشارة ولا عرضاً لأي منتج مالي.",
      ),
    ],
    services: [
      { title: b("Portfolio review", "مراجعة المحفظة"), body: b("Allocation, concentration, currency exposure and liquidity against stated objectives.", "التوزيع والتركيز والتعرض للعملات والسيولة مقابل الأهداف المعلنة.") },
      { title: b("Investment memorandum", "مذكرة الاستثمار"), body: b("A consistent structure covering thesis, market, financials, risks and open diligence.", "بنية موحدة تغطي الفرضية والسوق والمالية والمخاطر والتدقيق المفتوح.") },
      { title: b("Diligence support", "دعم التدقيق"), body: b("Question lists, document trackers and red-flag summaries for internal review.", "قوائم أسئلة ومتابعة مستندات وملخصات إشارات حمراء للمراجعة الداخلية.") },
      { title: b("Scenario modelling", "نمذجة السيناريوهات"), body: b("Return, drawdown and liquidity scenarios with assumptions shown.", "سيناريوهات العائد والتراجع والسيولة مع عرض الافتراضات.") },
      { title: b("Family office reporting", "تقارير المكتب العائلي"), body: b("Consolidated multi-entity reporting with a documented basis of preparation.", "تقارير موحدة متعددة الكيانات بأساس إعداد موثق.") },
      { title: b("Editorial research", "البحث التحريري"), body: b("Sector notes and explainers written for decision-makers, with sources cited.", "ملاحظات قطاعية وشروحات لصناع القرار مع ذكر المصادر.") },
    ],
    capabilities: [
      b("Allocation and concentration analysis", "تحليل التوزيع والتركيز"),
      b("Currency and liquidity exposure", "التعرض للعملات والسيولة"),
      b("Return and drawdown scenarios", "سيناريوهات العائد والتراجع"),
      b("Documented diligence trails", "مسارات تدقيق موثقة"),
      b("Multi-entity consolidation", "توحيد متعدد الكيانات"),
      b("Sourced sector research", "بحث قطاعي بمصادر"),
    ],
    approach: [
      b("Write the objective and constraints first.", "كتابة الهدف والقيود أولاً."),
      b("Separate facts from judgements.", "فصل الحقائق عن الأحكام."),
      b("Show the downside, not only the base case.", "عرض السيناريو السلبي لا الأساسي فقط."),
      b("State clearly what we do not do.", "توضيح ما لا نفعله بوضوح."),
    ],
    accent: "#203C4B",
  },
];

export const divisionBySlug = (slug: string) => divisions.find((d) => d.slug === slug);

export const values = [
  { key: "clarity", icon: "eye" },
  { key: "intelligence", icon: "brain" },
  { key: "integrity", icon: "shield" },
  { key: "precision", icon: "target" },
  { key: "growth", icon: "trending" },
] as const;

export const processSteps = [1, 2, 3, 4] as const;

export const enquiryTypes = [
  { value: "general", en: "General enquiry", ar: "استفسار عام" },
  { value: "consultation", en: "Consultation request", ar: "طلب استشارة" },
  { value: "project", en: "New project", ar: "مشروع جديد" },
  { value: "support", en: "Existing client support", ar: "دعم عميل حالي" },
  { value: "partnership", en: "Partnership / supplier", ar: "شراكة / مورد" },
  { value: "careers", en: "Careers", ar: "وظائف" },
];

export const countries = [
  "Qatar", "Saudi Arabia", "United Arab Emirates", "Kuwait", "Bahrain", "Oman",
  "United Kingdom", "United States", "India", "Other",
];

export const odooModules = [
  "Finance & Accounting", "Sales & CRM", "Inventory & Warehousing", "Manufacturing (MRP)",
  "Purchase", "Human Resources", "Payroll", "Projects & Timesheets", "POS", "Website & eCommerce",
];

export const revenueBands = ["Under QAR 5m", "QAR 5m – 20m", "QAR 20m – 100m", "Over QAR 100m", "Prefer not to say"];

export const advisoryObjectives = [
  "Raise or restructure finance", "Assess a new market", "Improve margin and cash",
  "Strengthen governance", "Prepare for investment", "Other",
];

export const investmentObjectives = [
  "Review current allocation", "Prepare an investment memorandum", "Consolidate family reporting",
  "Assess liquidity needs", "Understand a sector", "Other",
];

export const riskLevels = [
  { value: "conservative", en: "Conservative", ar: "متحفظ" },
  { value: "balanced", en: "Balanced", ar: "متوازن" },
  { value: "growth", en: "Growth", ar: "نمو" },
];

export const horizons = ["1–3 years", "3–5 years", "5–10 years", "Over 10 years"];

export const productCategories = [
  "Enterprise Software", "Digital Transformation", "Advisory", "Trading", "Investments",
];

export const navDivisions = divisions.map((d) => ({ slug: d.slug, name: d.name, tagline: d.tagline }));
