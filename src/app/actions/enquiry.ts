"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { one, reference, run, getSetting } from "@/lib/db";
import { enquirySchema, rfqSchema, fieldErrors } from "@/lib/validation";
import { getCurrentUser, rateLimit } from "@/lib/auth";
import { savePrivate } from "@/lib/uploads";
import { sendMail, acknowledgement, internalNotification } from "@/lib/email";
import { getLocale } from "@/lib/i18n";

export type FormState = { errors?: Record<string, string>; message?: string };

async function clientIp() {
  const h = await headers();
  return h.get("x-forwarded-for")?.split(",")[0]?.trim() || h.get("x-real-ip") || "local";
}

export async function submitEnquiry(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = await getLocale();
  const ip = await clientIp();
  if (!rateLimit(`enquiry:${ip}`, 5, 600)) {
    return { message: locale === "ar" ? "طلبات كثيرة. يرجى المحاولة بعد بضع دقائق." : "Too many submissions. Please try again in a few minutes." };
  }

  const metadata: Record<string, string> = {};
  for (const key of new Set(formData.keys())) {
    if (!key.startsWith("meta_")) continue;
    const values = formData.getAll(key).filter((v): v is string => typeof v === "string" && !!v.trim());
    if (values.length) metadata[key.slice(5)] = values.join(", ").slice(0, 500);
  }

  const parsed = enquirySchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    country: formData.get("country") ?? "",
    division: formData.get("division") ?? "",
    kind: formData.get("kind") ?? "contact",
    subject: formData.get("subject") ?? "",
    message: formData.get("message"),
    consent: formData.get("consent"),
    productId: formData.get("productId") || undefined,
    metadata,
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const data = parsed.data;

  let attachment: { filename: string; name: string } | null = null;
  const file = formData.get("attachment");
  if (file instanceof File && file.size > 0) {
    try {
      const saved = await savePrivate(file);
      attachment = { filename: saved.filename, name: saved.originalName };
    } catch (error) {
      return { errors: { attachment: error instanceof Error ? error.message : "Upload failed." } };
    }
  }

  const ref = reference("BYN", "enquiries");
  const meta = { ...data.metadata, ...(attachment ? { attachment: attachment.filename, attachmentName: attachment.name } : {}) };
  const user = await getCurrentUser();

  run(
    `INSERT INTO enquiries (ref,kind,division,name,company,email,phone,country,subject,message,product_id,metadata,locale,source,user_id)
     VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?,'website',?)`,
    [
      ref, data.kind, data.division || null, data.name, data.company || null, data.email,
      data.phone || null, data.country || null, data.subject || null, data.message,
      data.productId ?? null, JSON.stringify(meta), locale, user?.id ?? null,
    ],
  );

  const ack = acknowledgement(ref, data.name, locale, data.subject || data.message.slice(0, 120));
  await sendMail({ to: data.email, subject: ack.subject, text: ack.text, replyTo: getSetting("email") });
  const internal = internalNotification(ref, data.kind, data.name, data.email, data.message);
  await sendMail({ to: getSetting("email"), subject: internal.subject, text: internal.text });

  redirect(`/confirmation?ref=${encodeURIComponent(ref)}`);
}

export async function submitRfq(_prev: FormState, formData: FormData): Promise<FormState> {
  const locale = await getLocale();
  const ip = await clientIp();
  if (!rateLimit(`rfq:${ip}`, 5, 600)) {
    return { message: locale === "ar" ? "طلبات كثيرة. يرجى المحاولة بعد بضع دقائق." : "Too many submissions. Please try again in a few minutes." };
  }
  const parsed = rfqSchema.safeParse({
    name: formData.get("name"),
    email: formData.get("email"),
    phone: formData.get("phone") ?? "",
    company: formData.get("company") ?? "",
    productId: formData.get("productId") || undefined,
    quantity: formData.get("quantity"),
    targetDate: formData.get("targetDate") ?? "",
    notes: formData.get("notes") ?? "",
    consent: formData.get("consent"),
  });
  if (!parsed.success) return { errors: fieldErrors(parsed.error) };
  const data = parsed.data;

  const ref = reference("RFQ", "rfqs");
  run(
    "INSERT INTO rfqs (ref,product_id,name,company,email,phone,quantity,target_date,notes) VALUES (?,?,?,?,?,?,?,?,?)",
    [ref, data.productId ?? null, data.name, data.company || null, data.email, data.phone || null, data.quantity, data.targetDate || null, data.notes || null],
  );

  const product = data.productId
    ? one<{ name: string }>("SELECT name FROM products WHERE id = ?", [data.productId])
    : undefined;
  const ack = acknowledgement(ref, data.name, locale, product ? `${product.name} × ${data.quantity}` : data.quantity);
  await sendMail({ to: data.email, subject: ack.subject, text: ack.text, replyTo: getSetting("email") });
  const internal = internalNotification(ref, "rfq", data.name, data.email, `Quantity: ${data.quantity}\n${data.notes ?? ""}`);
  await sendMail({ to: getSetting("email"), subject: internal.subject, text: internal.text });

  redirect(`/confirmation?ref=${encodeURIComponent(ref)}&kind=rfq`);
}
