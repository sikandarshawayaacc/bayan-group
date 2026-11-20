import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";

type Mail = { to: string; subject: string; text: string; html?: string; replyTo?: string };

const from = () => process.env.EMAIL_FROM || "BAYAN GROUP <no-reply@bayan-group.qa>";

/**
 * Sends through Resend when RESEND_API_KEY is set. Otherwise writes an .eml
 * file to data/outbox so the flow is verifiable without external credentials.
 */
export async function sendMail(mail: Mail): Promise<{ ok: boolean; transport: string; detail?: string }> {
  if (process.env.RESEND_API_KEY) {
    try {
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: from(),
          to: [mail.to],
          subject: mail.subject,
          text: mail.text,
          html: mail.html,
          reply_to: mail.replyTo,
        }),
      });
      if (!res.ok) return { ok: false, transport: "resend", detail: `${res.status} ${await res.text()}` };
      return { ok: true, transport: "resend" };
    } catch (error) {
      return { ok: false, transport: "resend", detail: String(error) };
    }
  }

  try {
    const dir = join(process.cwd(), "data", "outbox");
    await mkdir(dir, { recursive: true });
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const body = [
      `From: ${from()}`,
      `To: ${mail.to}`,
      `Subject: ${mail.subject}`,
      mail.replyTo ? `Reply-To: ${mail.replyTo}` : "",
      "MIME-Version: 1.0",
      'Content-Type: text/plain; charset="utf-8"',
      "",
      mail.text,
    ].filter(Boolean).join("\r\n");
    await writeFile(join(dir, `${id}.eml`), body, "utf8");
    return { ok: true, transport: "log" };
  } catch (error) {
    return { ok: false, transport: "log", detail: String(error) };
  }
}

export function acknowledgement(ref: string, name: string, locale: "en" | "ar", summary: string) {
  const site = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  if (locale === "ar") {
    return {
      subject: `تأكيد الاستلام — ${ref}`,
      text: `مرحباً ${name},\n\nاستلمنا طلبك برقم المرجع ${ref}.\n\n${summary}\n\nسيتواصل معك أحد أعضاء الفريق خلال يوم عمل واحد.\n\nمجموعة بيان\n${site}`,
    };
  }
  return {
    subject: `We received your enquiry — ${ref}`,
    text: `Hello ${name},\n\nWe have received your enquiry. Your reference is ${ref}.\n\n${summary}\n\nA member of the team will respond within one business day.\n\nBAYAN GROUP\n${site}`,
  };
}

export function internalNotification(ref: string, kind: string, name: string, email: string, message: string) {
  return {
    subject: `[${kind.toUpperCase()}] ${ref} — ${name}`,
    text: `New ${kind} submission.\n\nReference: ${ref}\nName: ${name}\nEmail: ${email}\n\n${message}`,
  };
}
