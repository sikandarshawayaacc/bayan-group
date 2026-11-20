import type { User } from "./auth";

const STATUSES = ["NEW", "REVIEWING", "CONTACTED", "PROPOSAL_SENT", "APPROVED", "IN_PROGRESS", "COMPLETED", "REJECTED", "ARCHIVED"];
const DIVISIONS = ["technologies", "advisory", "trading", "investments"];

export type EnquiryFilters = {
  q: string;
  status: string;
  division: string;
  from: string;
  to: string;
  sort: string;
  page: number;
  perPage: number;
};

/** Shared by the admin list and the CSV export so both always show the same rows. */
export function enquiryFilters(
  params: Record<string, string | string[] | undefined>,
  user: User,
): { filters: EnquiryFilters; where: string; order: string; values: (string | number)[] } {
  const first = (key: string) => {
    const value = params[key];
    return (Array.isArray(value) ? value[0] : value ?? "").trim();
  };

  const scoped = user.role === "division_manager" && user.division ? user.division : "";
  const status = STATUSES.includes(first("status")) ? first("status") : "";
  const division = scoped || (DIVISIONS.includes(first("division")) ? first("division") : "");
  const from = /^\d{4}-\d{2}-\d{2}$/.test(first("from")) ? first("from") : "";
  const to = /^\d{4}-\d{2}-\d{2}$/.test(first("to")) ? first("to") : "";

  const conditions: string[] = [];
  const values: (string | number)[] = [];

  if (first("q")) {
    conditions.push("(e.ref LIKE ? OR e.name LIKE ? OR e.email LIKE ? OR e.company LIKE ? OR e.subject LIKE ?)");
    const like = `%${first("q").slice(0, 80)}%`;
    values.push(like, like, like, like, like);
  }
  if (status) { conditions.push("e.status = ?"); values.push(status); }
  if (division) { conditions.push("e.division = ?"); values.push(division); }
  if (from) { conditions.push("e.created_at >= ?"); values.push(`${from} 00:00:00`); }
  if (to) { conditions.push("e.created_at <= ?"); values.push(`${to} 23:59:59`); }

  const sort = ["newest", "oldest", "priority"].includes(first("sort")) ? first("sort") : "newest";
  const order =
    sort === "oldest" ? "e.created_at ASC"
      : sort === "priority" ? "CASE e.priority WHEN 'high' THEN 0 WHEN 'normal' THEN 1 ELSE 2 END, e.created_at DESC"
        : "e.created_at DESC";

  return {
    filters: { q: first("q"), status, division, from, to, sort, page: Math.max(1, Number(first("page")) || 1), perPage: 20 },
    where: conditions.length ? `WHERE ${conditions.join(" AND ")}` : "",
    order,
    values,
  };
}

export const ENQUIRY_STATUSES = STATUSES;
