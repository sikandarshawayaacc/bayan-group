import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { NextResponse } from "next/server";
import { one } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";

export const dynamic = "force-dynamic";

/** Staff-only access to enquiry attachments, which are stored outside the web root. */
export async function GET(_request: Request, { params }: { params: Promise<{ filename: string }> }) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user)) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { filename } = await params;
  if (!/^[a-f0-9-]{36}\.[a-z0-9]+$/i.test(filename)) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const linked = one<{ ref: string }>("SELECT ref FROM enquiries WHERE metadata LIKE ?", [`%${filename}%`]);
  if (!linked) return NextResponse.json({ error: "Not found" }, { status: 404 });

  try {
    const bytes = await readFile(join(process.cwd(), "data", "private", filename));
    return new NextResponse(new Uint8Array(bytes), {
      headers: {
        "Content-Type": filename.endsWith(".pdf") ? "application/pdf" : "application/octet-stream",
        "Content-Disposition": `attachment; filename="${linked.ref}${filename.slice(filename.lastIndexOf("."))}"`,
        "Cache-Control": "private, no-store",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch {
    return NextResponse.json({ error: "File unavailable" }, { status: 404 });
  }
}
