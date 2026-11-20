import { all } from "@/lib/db";
import { getCurrentUser, isStaff } from "@/lib/auth";
import { enquiryFilters } from "@/lib/admin-query";

export const dynamic = "force-dynamic";

type Row = {
  ref: string; created_at: string; kind: string; division: string | null; name: string; company: string | null;
  email: string; phone: string | null; country: string | null; subject: string | null; message: string;
  status: string; priority: string; assignee: string | null; source: string;
};

const cell = (value: string | null) => `"${(value ?? "").replace(/"/g, '""')}"`;

export async function GET(request: Request) {
  const user = await getCurrentUser();
  if (!user || !isStaff(user)) return new Response("Unauthorized", { status: 401 });
  const url = new URL(request.url);
  const params = Object.fromEntries(url.searchParams.entries());
  const { where, order, values } = enquiryFilters(params, user);

  const rows = all<Row>(
    `SELECT e.ref,e.created_at,e.kind,e.division,e.name,e.company,e.email,e.phone,e.country,e.subject,e.message,
            e.status,e.priority,e.source,u.name AS assignee
     FROM enquiries e LEFT JOIN users u ON u.id = e.assigned_to ${where} ORDER BY ${order} LIMIT 5000`,
    values,
  );

  const header = ["Reference", "Received", "Kind", "Division", "Name", "Company", "Email", "Phone", "Country", "Subject", "Message", "Status", "Priority", "Owner", "Source"];
  const lines = [
    header.map(cell).join(","),
    ...rows.map((r) => [r.ref, r.created_at, r.kind, r.division, r.name, r.company, r.email, r.phone, r.country, r.subject, r.message, r.status, r.priority, r.assignee, r.source].map(cell).join(",")),
  ];

  return new Response(lines.join("\r\n"), {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bayan-enquiries-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "private, no-store",
    },
  });
}
