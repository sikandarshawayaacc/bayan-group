"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { all, one, run, setSetting, getSetting } from "@/lib/db";
import { audit, canWrite, hashPassword, requireStaff } from "@/lib/auth";
import { saveUpload, savePrivate, deleteUpload } from "@/lib/uploads";

export type AdminState = { errors?: Record<string, string>; message?: string };

const str = (form: FormData, key: string, max = 500) => String(form.get(key) ?? "").trim().slice(0, max);
const num = (form: FormData, key: string, fallback = 0) => {
  const n = Number(form.get(key));
  return Number.isFinite(n) ? n : fallback;
};
const slugify = (value: string) =>
  value.toLowerCase().normalize("NFKD").replace(/[^\w\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 90) ||
  `item-${Date.now()}`;

async function guard() {
  const user = await requireStaff();
  if (!canWrite(user)) redirect("/portal");
  return user;
}

async function ownerOnly() {
  const user = await requireStaff();
  if (user.role !== "super_admin") redirect("/admin");
  return user;
}

function scopeDivision(user: { role: string; division: string | null }) {
  return user.role === "division_manager" && user.division ? user.division : null;
}

export async function updateEnquiry(formData: FormData) {
  const user = await guard();
  const id = num(formData, "id");
  const enquiry = one<{ id: number; ref: string; division: string | null }>("SELECT id,ref,division FROM enquiries WHERE id = ?", [id]);
  const scoped = scopeDivision(user);
  if (!enquiry || (scoped && enquiry.division !== scoped)) return;

  const status = str(formData, "status", 20);
  const priority = str(formData, "priority", 10);
  const assignee = num(formData, "assigned_to") || null;
  const allowedStatus = ["NEW", "REVIEWING", "CONTACTED", "PROPOSAL_SENT", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED", "ARCHIVED"];
  const allowedPriority = ["low", "normal", "high"];
  if (!allowedStatus.includes(status) || !allowedPriority.includes(priority)) return;

  run(
    "UPDATE enquiries SET status = ?, priority = ?, assigned_to = ?, updated_at = datetime('now') WHERE id = ?",
    [status, priority, assignee, id],
  );
  await audit(user.id, "enquiry_update", "enquiry", id, `${enquiry.ref} → ${status}/${priority}`);
  revalidatePath(`/admin/enquiries/${id}`);
  revalidatePath("/admin/enquiries");
  revalidatePath("/admin");
}

export async function addEnquiryNote(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await guard();
  const id = num(formData, "id");
  const body = str(formData, "body", 3000);
  if (!body) return { errors: { body: "Write a note first." } };
  if (!one("SELECT id FROM enquiries WHERE id = ?", [id])) return { errors: { body: "Enquiry not found." } };

  run("INSERT INTO enquiry_notes (enquiry_id,user_id,body) VALUES (?,?,?)", [id, user.id, body]);
  run("UPDATE enquiries SET updated_at = datetime('now') WHERE id = ?", [id]);
  await audit(user.id, "enquiry_note", "enquiry", id, body.slice(0, 120));
  revalidatePath(`/admin/enquiries/${id}`);
  return { message: "Note added." };
}

export async function saveProject(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await guard();
  const id = num(formData, "id");
  const title = str(formData, "title", 160);
  const clientId = num(formData, "client_id");
  const division = str(formData, "division", 40);
  const status = str(formData, "status", 20);
  const progress = Math.min(100, Math.max(0, num(formData, "progress")));
  const description = str(formData, "description", 3000);
  const startDate = str(formData, "start_date", 20) || null;
  const dueDate = str(formData, "due_date", 20) || null;

  if (!title || !clientId || !division) return { errors: { title: "Title, client and division are required." } };
  if (!["APPROVED", "IN_PROGRESS", "COMPLETED", "ON_HOLD"].includes(status)) return { errors: { status: "Invalid status." } };
  if (!one("SELECT id FROM users WHERE id = ? AND role = 'client'", [clientId])) return { errors: { client_id: "Client not found." } };

  if (id) {
    run(
      `UPDATE projects SET client_id=?,division=?,title=?,description=?,status=?,progress=?,start_date=?,due_date=?,updated_at=datetime('now') WHERE id=?`,
      [clientId, division, title, description || null, status, progress, startDate, dueDate, id],
    );
    await audit(user.id, "project_update", "project", id, title);
  } else {
    const year = new Date().getFullYear();
    const n = one<{ n: number }>("SELECT COUNT(*) AS n FROM projects WHERE ref LIKE ?", [`BYN-PRJ-${year}-%`])?.n ?? 0;
    const ref = `BYN-PRJ-${year}-${String(n + 1).padStart(4, "0")}`;
    const result = run(
      `INSERT INTO projects (ref,client_id,division,title,description,status,progress,start_date,due_date) VALUES (?,?,?,?,?,?,?,?,?)`,
      [ref, clientId, division, title, description || null, status, progress, startDate, dueDate],
    );
    const newId = Number(result.lastInsertRowid);
    await audit(user.id, "project_create", "project", newId, title);
    revalidatePath("/admin/projects");
    redirect(`/admin/projects?edit=${newId}`);
  }
  revalidatePath("/admin/projects");
  return { message: "Project saved." };
}

export async function deleteProject(formData: FormData) {
  const user = await guard();
  const id = num(formData, "id");
  run("DELETE FROM projects WHERE id = ?", [id]);
  await audit(user.id, "project_delete", "project", id);
  revalidatePath("/admin/projects");
}

export async function saveProduct(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await guard();
  const id = num(formData, "id");
  const name = str(formData, "name", 160);
  const category = str(formData, "category", 60);
  const summary = str(formData, "summary", 400);
  const description = str(formData, "description", 4000);
  const specs = str(formData, "specs", 1000);
  const priceNote = str(formData, "price_note", 100);
  const sku = str(formData, "sku", 40) || null;
  const active = formData.get("active") === "on" ? 1 : 0;
  const featured = formData.get("featured") === "on" ? 1 : 0;
  const slug = str(formData, "slug", 90) || slugify(name);
  if (!name || !category) return { errors: { name: "Name and category are required." } };
  if (!/^[a-z0-9-]+$/.test(slug)) return { errors: { slug: "Use lowercase letters, numbers and hyphens." } };
  if (one("SELECT id FROM products WHERE slug = ? AND id != ?", [slug, id])) return { errors: { slug: "That slug is already used." } };

  if (id) {
    run(
      "UPDATE products SET slug=?,name=?,category=?,sku=?,summary=?,description=?,specs=?,price_note=?,active=?,featured=? WHERE id=?",
      [slug, name, category, sku, summary || null, description || null, specs || null, priceNote || null, active, featured, id],
    );
    await audit(user.id, "product_update", "product", id, name);
  } else {
    const result = run(
      "INSERT INTO products (slug,name,category,sku,summary,description,specs,price_note,active,featured,sort) VALUES (?,?,?,?,?,?,?,?,?,?,?)",
      [slug, name, category, sku, summary || null, description || null, specs || null, priceNote || null, active, featured, num(formData, "sort")],
    );
    const newId = Number(result.lastInsertRowid);
    await audit(user.id, "product_create", "product", newId, name);
    revalidatePath("/admin/products");
    revalidatePath("/divisions/trading");
    redirect(`/admin/products?edit=${newId}`);
  }
  revalidatePath("/admin/products");
  revalidatePath("/divisions/trading");
  return { message: "Product saved." };
}

export async function deleteProduct(formData: FormData) {
  const user = await guard();
  const id = num(formData, "id");
  run("DELETE FROM products WHERE id = ?", [id]);
  await audit(user.id, "product_delete", "product", id);
  revalidatePath("/admin/products");
  revalidatePath("/divisions/trading");
}

export async function updateRfq(formData: FormData) {
  const user = await guard();
  const id = num(formData, "id");
  const status = str(formData, "status", 20);
  if (!["NEW", "REVIEWING", "QUOTED", "WON", "LOST"].includes(status)) return;
  run("UPDATE rfqs SET status = ? WHERE id = ?", [status, id]);
  await audit(user.id, "rfq_update", "rfq", id, status);
  revalidatePath("/admin/rfqs");
}

export async function saveArticle(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await guard();
  const id = num(formData, "id");
  const titleEn = str(formData, "title_en", 200);
  const titleAr = str(formData, "title_ar", 200);
  const category = str(formData, "category", 60);
  const division = str(formData, "division", 40) || null;
  const excerptEn = str(formData, "excerpt_en", 400);
  const excerptAr = str(formData, "excerpt_ar", 400);
  const bodyEn = str(formData, "body_en", 40000);
  const bodyAr = str(formData, "body_ar", 40000);
  const status = str(formData, "status", 20) === "published" ? "published" : "draft";
  const slug = str(formData, "slug", 100) || slugify(titleEn);

  if (!titleEn || !category || !bodyEn) return { errors: { title_en: "English title, category and body are required." } };
  if (!/^[a-z0-9-]+$/.test(slug)) return { errors: { slug: "Use lowercase letters, numbers and hyphens." } };
  if (one("SELECT id FROM articles WHERE slug = ? AND id != ?", [slug, id])) return { errors: { slug: "That slug is already used." } };

  const publishedAt = status === "published" ? new Date().toISOString().slice(0, 10) : null;
  if (id) {
    run(
      `UPDATE articles SET slug=?,category=?,division=?,title_en=?,title_ar=?,excerpt_en=?,excerpt_ar=?,body_en=?,body_ar=?,status=?,
       published_at=COALESCE(published_at, ?), updated_at=datetime('now') WHERE id=?`,
      [slug, category, division, titleEn, titleAr || null, excerptEn || null, excerptAr || null, bodyEn, bodyAr || null, status, publishedAt, id],
    );
    await audit(user.id, "article_update", "article", id, titleEn);
  } else {
    const result = run(
      `INSERT INTO articles (slug,category,division,title_en,title_ar,excerpt_en,excerpt_ar,body_en,body_ar,status,published_at,author)
       VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
      [slug, category, division, titleEn, titleAr || null, excerptEn || null, excerptAr || null, bodyEn, bodyAr || null, status, publishedAt, user.name],
    );
    const newId = Number(result.lastInsertRowid);
    await audit(user.id, "article_create", "article", newId, titleEn);
    revalidatePath("/admin/articles");
    revalidatePath("/insights");
    redirect(`/admin/articles/${newId}`);
  }
  revalidatePath("/admin/articles");
  revalidatePath("/insights");
  return { message: "Article saved." };
}

export async function deleteArticle(formData: FormData) {
  const user = await guard();
  const id = num(formData, "id");
  run("DELETE FROM articles WHERE id = ?", [id]);
  await audit(user.id, "article_delete", "article", id);
  revalidatePath("/admin/articles");
  revalidatePath("/insights");
}

export async function savePage(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await guard();
  const id = num(formData, "id");
  const titleEn = str(formData, "title_en", 200);
  const titleAr = str(formData, "title_ar", 200);
  const bodyEn = str(formData, "body_en", 40000);
  const bodyAr = str(formData, "body_ar", 40000);
  const seoTitle = str(formData, "seo_title", 200);
  const seoDescription = str(formData, "seo_description", 320);
  const status = str(formData, "status", 20) === "draft" ? "draft" : "published";
  if (!titleEn || !bodyEn) return { errors: { title_en: "English title and body are required." } };

  run(
    `UPDATE pages SET title_en=?,title_ar=?,body_en=?,body_ar=?,seo_title=?,seo_description=?,status=?,updated_at=datetime('now') WHERE id=?`,
    [titleEn, titleAr || null, bodyEn, bodyAr || null, seoTitle || null, seoDescription || null, status, id],
  );
  await audit(user.id, "page_update", "page", id, titleEn);
  revalidatePath("/admin/pages");
  return { message: "Page saved." };
}

export async function uploadMedia(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await guard();
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { errors: { file: "Choose a file." } };
  try {
    const saved = await saveUpload(file);
    if (!saved.mime.startsWith("image/")) {
      await deleteUpload(saved.filename);
      return { errors: { file: "Media library accepts images only." } };
    }
    run(
      "INSERT INTO media (filename,original_name,mime,size,alt,uploaded_by) VALUES (?,?,?,?,?,?)",
      [saved.filename, saved.originalName, saved.mime, saved.size, str(formData, "alt", 200) || null, user.id],
    );
    await audit(user.id, "media_upload", "media", saved.filename, saved.originalName);
    revalidatePath("/admin/media");
    return { message: "Image uploaded." };
  } catch (error) {
    return { errors: { file: error instanceof Error ? error.message : "Upload failed." } };
  }
}

export async function deleteMedia(formData: FormData) {
  const user = await guard();
  const id = num(formData, "id");
  const row = one<{ filename: string }>("SELECT filename FROM media WHERE id = ?", [id]);
  if (row) {
    await deleteUpload(row.filename);
    run("DELETE FROM media WHERE id = ?", [id]);
    await audit(user.id, "media_delete", "media", id, row.filename);
  }
  revalidatePath("/admin/media");
}

export async function saveUser(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await ownerOnly();
  const id = num(formData, "id");
  const name = str(formData, "name", 120);
  const email = str(formData, "email", 200).toLowerCase();
  const role = str(formData, "role", 30);
  const division = str(formData, "division", 40) || null;
  const company = str(formData, "company", 160) || null;
  const phone = str(formData, "phone", 40) || null;
  const password = String(formData.get("password") ?? "");
  const active = formData.get("active") === "on" ? 1 : 0;

  if (!name || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) return { errors: { email: "Enter a name and a valid email." } };
  if (!["super_admin", "editor", "division_manager", "sales", "client"].includes(role)) return { errors: { role: "Invalid role." } };
  if (password && password.length < 10) return { errors: { password: "Use at least 10 characters." } };
  if (one("SELECT id FROM users WHERE email = ? AND id != ?", [email, id])) return { errors: { email: "That email is already registered." } };

  if (id) {
    // Never let an administrator remove their own access.
    const disable = id === user.id ? 1 : active;
    run(
      "UPDATE users SET name=?,email=?,role=?,division=?,company=?,phone=?,active=? WHERE id=?",
      [name, email, role, division, company, phone, disable, id],
    );
    if (password) run("UPDATE users SET password_hash=? WHERE id=?", [hashPassword(password), id]);
    await audit(user.id, "user_update", "user", id, email);
  } else {
    if (password.length < 10) return { errors: { password: "Set a password of at least 10 characters." } };
    const result = run(
      "INSERT INTO users (email,password_hash,name,role,division,company,phone,active) VALUES (?,?,?,?,?,?,?,?)",
      [email, hashPassword(password), name, role, division, company, phone, active],
    );
    const newId = Number(result.lastInsertRowid);
    await audit(user.id, "user_create", "user", newId, email);
    revalidatePath("/admin/users");
    redirect(`/admin/users?edit=${newId}`);
  }
  revalidatePath("/admin/users");
  return { message: "User saved." };
}

export async function saveSettings(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await ownerOnly();
  const allowed = new Set(
    all<{ key: string }>("SELECT key FROM settings").map((r) => r.key),
  );
  let saved = 0;
  for (const [key, value] of formData.entries()) {
    if (!key.startsWith("s_") || typeof value !== "string") continue;
    const settingKey = key.slice(2);
    if (!allowed.has(settingKey)) continue;
    setSetting(settingKey, value.slice(0, 2000));
    saved += 1;
  }
  await audit(user.id, "settings_update", "settings", null, `${saved} keys`);
  revalidatePath("/admin/settings");
  revalidatePath("/admin/seo");
  revalidatePath("/");
  return { message: `Saved ${saved} settings.` };
}

export async function replyToClient(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await guard();
  const clientId = num(formData, "client_id");
  const body = str(formData, "body", 3000);
  if (!body) return { errors: { body: "Write a message first." } };
  if (!one("SELECT id FROM users WHERE id = ? AND role = 'client'", [clientId])) return { errors: { body: "Client not found." } };
  run("INSERT INTO messages (client_id,sender_id,body) VALUES (?,?,?)", [clientId, user.id, body]);
  await audit(user.id, "message_staff", "message", clientId, body.slice(0, 100));
  revalidatePath(`/admin/clients/${clientId}`);
  return { message: "Reply sent to the client portal." };
}

export async function staffUploadDocument(_prev: AdminState, formData: FormData): Promise<AdminState> {
  const user = await guard();
  const clientId = num(formData, "client_id");
  const projectId = num(formData, "project_id") || null;
  const file = formData.get("file");
  if (!(file instanceof File) || file.size === 0) return { errors: { file: "Choose a file." } };
  if (!one("SELECT id FROM users WHERE id = ? AND role = 'client'", [clientId])) return { errors: { file: "Client not found." } };
  if (projectId && !one("SELECT id FROM projects WHERE id = ? AND client_id = ?", [projectId, clientId])) {
    return { errors: { file: "Project does not belong to this client." } };
  }

  try {
    const saved = await savePrivate(file);
    run(
      "INSERT INTO documents (project_id,client_id,name,filename,mime,size,uploaded_by) VALUES (?,?,?,?,?,?,?)",
      [projectId, clientId, saved.originalName, saved.filename, saved.mime, saved.size, user.id],
    );
    await audit(user.id, "document_staff_upload", "document", clientId, saved.originalName);
    revalidatePath(`/admin/clients/${clientId}`);
    return { message: "Document shared with the client." };
  } catch (error) {
    return { errors: { file: error instanceof Error ? error.message : "Upload failed." } };
  }
}

export async function sendTestEmail(_prev: AdminState, formData: FormData): Promise<AdminState> {
  await ownerOnly();
  const to = str(formData, "to", 200);
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(to)) return { errors: { to: "Enter a valid email address." } };
  const { sendMail } = await import("@/lib/email");
  const delivered = await sendMail({ to, subject: "BAYAN GROUP email test", text: "This is a test message from the BAYAN GROUP administrator." });
  const outbox = getSetting("email_notifications") === "1";
  return {
    message: delivered
      ? `Message handed to the configured provider for ${to}.`
      : `No provider configured — the message was written to data/outbox (notifications ${outbox ? "enabled" : "disabled"}).`,
  };
}
