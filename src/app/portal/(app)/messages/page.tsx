import type { Metadata } from "next";
import { getLocale } from "@/lib/i18n";
import { all, run } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { EmptyState } from "@/components/ui";
import { MessageComposer } from "@/components/PortalForms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "Messages", robots: { index: false, follow: false } };

type Message = { id: number; body: string; sender_id: number; sender: string; role: string; created_at: string };

export default async function MessagesPage() {
  const user = await requireUser();
  const locale = await getLocale();

  // Opening the thread is the read receipt for staff replies.
  run("UPDATE messages SET read_at = datetime('now') WHERE client_id = ? AND sender_id != ? AND read_at IS NULL", [user.id, user.id]);

  const messages = all<Message>(
    `SELECT m.id,m.body,m.sender_id,u.name AS sender,u.role,m.created_at
     FROM messages m JOIN users u ON u.id = m.sender_id
     WHERE m.client_id = ? ORDER BY m.created_at ASC`,
    [user.id],
  );

  return (
    <div className="space-y-6">
      <header>
        <h1 className="text-[1.4rem] font-bold text-navy">{locale === "ar" ? "الرسائل" : "Messages"}</h1>
        <p className="mt-1 text-[0.83rem] text-muted">
          {locale === "ar" ? "محادثة مباشرة مع فريق الحسابات." : "A direct thread with your account team."}
        </p>
      </header>

      <section className="rounded-md border border-line bg-white">
        <div className="max-h-[28rem] space-y-3 overflow-y-auto p-5">
          {messages.length === 0 ? (
            <EmptyState title={locale === "ar" ? "لا رسائل بعد." : "No messages yet."} body={locale === "ar" ? "اكتب أدناه لبدء المحادثة." : "Write below to start the conversation."} />
          ) : (
            messages.map((m) => {
              const mine = m.sender_id === user.id;
              return (
                <div key={m.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-[85%] rounded-lg px-4 py-2.5 ${mine ? "bg-navy text-white" : "bg-light text-navy"}`}>
                    <p className={`text-[0.68rem] font-semibold uppercase tracking-[0.08em] ${mine ? "text-white/50" : "text-muted"}`}>
                      {mine ? (locale === "ar" ? "أنت" : "You") : `${m.sender}${m.role !== "client" ? ` · ${m.role.replace(/_/g, " ")}` : ""}`}
                    </p>
                    <p className="mt-1 whitespace-pre-line text-[0.84rem] leading-relaxed">{m.body}</p>
                    <p className={`mt-1 text-[0.65rem] ${mine ? "text-white/40" : "text-muted"}`}>
                      {new Date(m.created_at).toLocaleString(locale === "ar" ? "ar-QA" : "en-GB", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              );
            })
          )}
        </div>
        <div className="border-t border-line p-5">
          <MessageComposer locale={locale} />
        </div>
      </section>
    </div>
  );
}
