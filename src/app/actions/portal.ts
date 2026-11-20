"use server";

import { revalidatePath } from "next/cache";
import { one, run } from "@/lib/db";
import { audit, requireUser } from "@/lib/auth";
import { savePrivate } from "@/lib/uploads";
import { getLocale } from "@/lib/i18n";

export type PortalState = { errors?: Record<string, string>; message?: string };

export async function sendClientMessage(_prev: PortalState, formData: FormData): Promise<PortalState> {
  const locale = await getLocale();
  const user = await requireUser();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { errors: { body: locale === "ar" ? "اكتب رسالة" : "Write a message" } };

  run("INSERT INTO messages (client_id,sender_id,body) VALUES (?,?,?)", [user.id, user.id, body.slice(0, 3000)]);
  await audit(user.id, "message_send", "message", null);
  revalidatePath("/portal/messages");
  return { message: locale === "ar" ? "أُرسلت الرسالة." : "Message sent." };
}

export async function uploadClientDocument(_prev: PortalState, formData: FormData): Promise<PortalState> {
  const locale = await getLocale();
  const user = await requireUser();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) {
    return { errors: { file: locale === "ar" ? "اختر ملفاً" : "Choose a file" } };
  }

  const projectId = Number(formData.get("projectId") ?? 0) || null;
  if (projectId && !one("SELECT id FROM projects WHERE id = ? AND client_id = ?", [projectId, user.id])) {
    return { errors: { projectId: locale === "ar" ? "المشروع غير موجود" : "Project not found" } };
  }

  try {
    const saved = await savePrivate(file);
    run(
      "INSERT INTO documents (project_id,client_id,name,filename,mime,size,uploaded_by) VALUES (?,?,?,?,?,?,?)",
      [projectId, user.id, saved.originalName, saved.filename, saved.mime, saved.size, user.id],
    );
    await audit(user.id, "document_upload", "document", saved.filename, saved.originalName);
    revalidatePath("/portal/documents");
    return { message: locale === "ar" ? "تم رفع المستند." : "Document uploaded." };
  } catch (error) {
    return { errors: { file: error instanceof Error ? error.message : "Upload failed." } };
  }
}

export async function deleteClientDocument(formData: FormData) {
  const user = await requireUser();
  const id = Number(formData.get("id") ?? 0);
  const doc = one<{ id: number; filename: string }>("SELECT id,filename FROM documents WHERE id = ? AND client_id = ?", [id, user.id]);
  if (doc) {
    run("DELETE FROM documents WHERE id = ?", [id]);
    await audit(user.id, "document_delete", "document", id, doc.filename);
  }
  revalidatePath("/portal/documents");
}
