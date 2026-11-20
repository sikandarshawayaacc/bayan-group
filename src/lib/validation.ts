import { z } from "zod";

const email = z.string().trim().min(5).max(200).email("Enter a valid email address");
const phone = z.string().trim().max(40).optional().or(z.literal(""));

export const enquirySchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email,
  phone,
  company: z.string().trim().max(160).optional().or(z.literal("")),
  country: z.string().trim().max(80).optional().or(z.literal("")),
  division: z.enum(["", "technologies", "advisory", "trading", "investments"]).optional(),
  kind: z.enum(["general", "consultation", "project", "support", "partnership", "careers"]).default("general"),
  subject: z.string().trim().max(180).optional().or(z.literal("")),
  message: z.string().trim().min(10, "Tell us a little more (at least 10 characters)").max(5000),
  consent: z.literal("on", { message: "Please accept the Privacy Policy" }),
  productId: z.coerce.number().int().positive().optional(),
  metadata: z.record(z.string(), z.string()).optional(),
});

export const rfqSchema = z.object({
  name: z.string().trim().min(2, "Enter your full name").max(120),
  email,
  phone,
  company: z.string().trim().max(160).optional().or(z.literal("")),
  productId: z.coerce.number().int().positive().optional(),
  quantity: z.string().trim().min(1, "Enter a quantity").max(80),
  targetDate: z.string().trim().max(20).optional().or(z.literal("")),
  notes: z.string().trim().max(3000).optional().or(z.literal("")),
  consent: z.literal("on", { message: "Please accept the Privacy Policy" }),
});

export const loginSchema = z.object({
  email,
  password: z.string().min(1, "Enter your password").max(200),
});

export const registerSchema = z
  .object({
    name: z.string().trim().min(2, "Enter your full name").max(120),
    email,
    company: z.string().trim().max(160).optional().or(z.literal("")),
    phone,
    password: z.string().min(10, "Use at least 10 characters").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const passwordSchema = z
  .object({
    current: z.string().min(1, "Enter your current password"),
    password: z.string().min(10, "Use at least 10 characters").max(200),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, { message: "Passwords do not match", path: ["confirm"] });

export const productSchema = z.object({
  name: z.string().trim().min(2).max(160),
  slug: z.string().trim().min(2).max(160).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  category: z.string().trim().min(2).max(80),
  sku: z.string().trim().max(60).optional().or(z.literal("")),
  summary: z.string().trim().max(400).optional().or(z.literal("")),
  description: z.string().trim().max(6000).optional().or(z.literal("")),
  specs: z.string().trim().max(4000).optional().or(z.literal("")),
  priceNote: z.string().trim().max(120).optional().or(z.literal("")),
  image: z.string().trim().max(300).optional().or(z.literal("")),
  active: z.coerce.number().int().min(0).max(1).default(1),
  featured: z.coerce.number().int().min(0).max(1).default(0),
});

export const articleSchema = z.object({
  title_en: z.string().trim().min(3).max(240),
  title_ar: z.string().trim().max(240).optional().or(z.literal("")),
  slug: z.string().trim().min(3).max(160).regex(/^[a-z0-9-]+$/, "Lowercase letters, numbers and dashes only"),
  category: z.string().trim().min(2).max(60),
  division: z.string().trim().max(40).optional().or(z.literal("")),
  excerpt_en: z.string().trim().max(500).optional().or(z.literal("")),
  excerpt_ar: z.string().trim().max(500).optional().or(z.literal("")),
  body_en: z.string().trim().min(20).max(40000),
  body_ar: z.string().trim().max(40000).optional().or(z.literal("")),
  status: z.enum(["draft", "published"]).default("draft"),
});

export const projectSchema = z.object({
  clientId: z.coerce.number().int().positive(),
  division: z.string().trim().min(2).max(40),
  title: z.string().trim().min(3).max(200),
  description: z.string().trim().max(3000).optional().or(z.literal("")),
  status: z.enum(["APPROVED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"]).default("IN_PROGRESS"),
  progress: z.coerce.number().int().min(0).max(100).default(0),
  startDate: z.string().trim().max(20).optional().or(z.literal("")),
  dueDate: z.string().trim().max(20).optional().or(z.literal("")),
});

export const userSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email,
  role: z.enum(["super_admin", "editor", "division_manager", "sales", "client"]),
  division: z.string().trim().max(40).optional().or(z.literal("")),
  company: z.string().trim().max(160).optional().or(z.literal("")),
  phone,
  active: z.coerce.number().int().min(0).max(1).default(1),
  password: z.string().max(200).optional().or(z.literal("")),
});

export type EnquiryInput = z.infer<typeof enquirySchema>;
export type RfqInput = z.infer<typeof rfqSchema>;

export function fieldErrors(error: z.ZodError): Record<string, string> {
  const out: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = String(issue.path[0] ?? "form");
    if (!out[key]) out[key] = issue.message;
  }
  return out;
}
