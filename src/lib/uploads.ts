import { mkdir, unlink, writeFile } from "node:fs/promises";
import { extname, join } from "node:path";
import { randomUUID } from "node:crypto";

const ALLOWED: Record<string, string[]> = {
  "application/pdf": [".pdf"],
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"],
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": [".xlsx"],
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
};

const MAGIC: Record<string, number[]> = {
  ".pdf": [0x25, 0x50, 0x44, 0x46],
  ".png": [0x89, 0x50, 0x4e, 0x47],
  ".jpg": [0xff, 0xd8, 0xff],
  ".docx": [0x50, 0x4b],
  ".xlsx": [0x50, 0x4b],
};

export const MAX_UPLOAD = 5 * 1024 * 1024;

export type SavedFile = { filename: string; originalName: string; mime: string; size: number; url: string };

export async function saveUpload(file: File): Promise<SavedFile> {
  return persist(file, join(process.cwd(), "public", "uploads"), "/uploads");
}

/** Enquiry attachments stay outside the public web root and are served only to staff. */
export async function savePrivate(file: File): Promise<SavedFile> {
  return persist(file, join(process.cwd(), "data", "private"), "/api/admin/attachments");
}

async function persist(file: File, dir: string, urlBase: string): Promise<SavedFile> {
  if (file.size === 0) throw new Error("The selected file is empty.");
  if (file.size > MAX_UPLOAD) throw new Error("Files must be 5 MB or smaller.");

  const original = file.name.replace(/[^\w.\- ()]/g, "_").slice(0, 120);
  const ext = extname(original).toLowerCase();
  const allowedExts = ALLOWED[file.type];
  if (!allowedExts || !allowedExts.includes(ext)) {
    throw new Error("Unsupported file type. Use PDF, DOCX, XLSX, PNG, JPG, TXT or CSV.");
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const magic = MAGIC[ext];
  if (magic && !magic.every((byte, i) => bytes[i] === byte)) {
    throw new Error("The file content does not match its extension.");
  }

  const filename = `${randomUUID()}${ext}`;
  await mkdir(dir, { recursive: true });
  await writeFile(join(dir, filename), bytes);
  return { filename, originalName: original, mime: file.type, size: file.size, url: `${urlBase}/${filename}` };
}

export async function deleteUpload(filename: string) {
  if (!/^[a-f0-9-]{36}\.[a-z0-9]+$/i.test(filename)) return;
  try {
    await unlink(join(process.cwd(), "public", "uploads", filename));
  } catch {
    // already gone
  }
}
