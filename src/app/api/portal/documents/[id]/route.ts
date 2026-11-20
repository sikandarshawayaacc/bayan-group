import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { one, run } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const id = Number((await params).id);
  if (!Number.isInteger(id)) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const doc = one<{ filename: string; name: string; mime: string; client_id: number }>(
    "SELECT filename,name,mime,client_id FROM documents WHERE id = ?",
    [id],
  );
  if (!doc || (!isStaff(user) && doc.client_id !== user.id)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }
  if (!/^[a-f0-9-]{36}\.[a-z0-9]+$/i.test(doc.filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  try {
    const bytes = await readFile(join(process.cwd(), "data", "private", doc.filename));
    run(
      "INSERT INTO audit_log (user_id,action,entity,entity_id,detail) VALUES (?,?,?,?,?)",
      [user.id, "document_download", "document", id, doc.name],
    );
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": doc.mime,
        "Content-Disposition": `attachment; filename="${doc.name.replace(/[^\w.\- ()]/g, "_")}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }
}
