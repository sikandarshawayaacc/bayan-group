"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Inbox,
  FolderKanban,
  FileText,
  MessageSquare,
  UserRound,
  ShieldCheck,
} from "lucide-react";
import type { Locale } from "@/lib/dictionary";

const items = [
  { href: "/portal", key: "portal.overview", icon: LayoutDashboard },
  { href: "/portal/enquiries", key: "portal.enquiries", icon: Inbox },
  { href: "/portal/projects", key: "portal.projects", icon: FolderKanban },
  { href: "/portal/documents", key: "portal.documents", icon: FileText },
  { href: "/portal/messages", key: "portal.messages", icon: MessageSquare },
  { href: "/portal/profile", key: "portal.profile", icon: UserRound },
  { href: "/portal/security", key: "portal.security", icon: ShieldCheck },
];

export function PortalNav({ locale, labels }: { locale: Locale; labels: Record<string, string> }) {
  const pathname = usePathname();
  return (
    <nav aria-label={locale === "ar" ? "أقسام البوابة" : "Portal sections"} className="flex gap-1 overflow-x-auto lg:flex-col">
      {items.map((item) => {
        const Icon = item.icon;
        const active = item.href === "/portal" ? pathname === "/portal" : pathname.startsWith(item.href);
        return (
          <Link
            key={item.href}
            href={item.href}
            aria-current={active ? "page" : undefined}
            className={`flex shrink-0 items-center gap-2.5 rounded-md px-3 py-2.5 text-[0.83rem] font-medium transition-colors ${
              active ? "bg-teal/10 text-teal-dark" : "text-muted hover:bg-light hover:text-navy"
            }`}
          >
            <Icon size={16} aria-hidden="true" />
            {labels[item.key] ?? item.key}
          </Link>
        );
      })}
    </nav>
  );
}
