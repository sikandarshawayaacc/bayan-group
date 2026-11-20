"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Inbox, Cpu, Compass, Truck, TrendingUp, Users, FolderKanban,
  Package, FileQuestion, Newspaper, ImageIcon, FileText, UserCog, Settings, Search, ScrollText,
} from "lucide-react";

const groups = [
  {
    label: "Workspace",
    items: [
      { href: "/admin", label: "Overview", icon: LayoutDashboard },
      { href: "/admin/enquiries", label: "Leads & Enquiries", icon: Inbox },
    ],
  },
  {
    label: "Divisions",
    items: [
      { href: "/admin/enquiries?division=technologies", label: "Technologies", icon: Cpu },
      { href: "/admin/enquiries?division=advisory", label: "Advisory", icon: Compass },
      { href: "/admin/enquiries?division=trading", label: "Trading", icon: Truck },
      { href: "/admin/enquiries?division=investments", label: "Investments", icon: TrendingUp },
    ],
  },
  {
    label: "Delivery",
    items: [
      { href: "/admin/clients", label: "Clients", icon: Users },
      { href: "/admin/projects", label: "Projects", icon: FolderKanban },
      { href: "/admin/products", label: "Product Catalogue", icon: Package },
      { href: "/admin/rfqs", label: "RFQs", icon: FileQuestion },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/articles", label: "Articles", icon: Newspaper },
      { href: "/admin/media", label: "Media Library", icon: ImageIcon },
      { href: "/admin/pages", label: "Website Pages", icon: FileText },
    ],
  },
  {
    label: "Administration",
    items: [
      { href: "/admin/users", label: "Users & Permissions", icon: UserCog },
      { href: "/admin/settings", label: "Website Settings", icon: Settings },
      { href: "/admin/seo", label: "SEO Settings", icon: Search },
      { href: "/admin/audit", label: "Audit Log", icon: ScrollText },
    ],
  },
];

export function AdminNav({ role }: { role: string }) {
  const pathname = usePathname();
  return (
    <nav aria-label="Admin sections" className="space-y-5">
      {groups
        .filter((g) => g.label !== "Administration" || role === "super_admin")
        .map((group) => (
          <div key={group.label}>
            <p className="px-2.5 pb-1.5 text-[0.62rem] font-bold uppercase tracking-[0.16em] text-white/35">{group.label}</p>
            <ul className="space-y-0.5">
              {group.items.map((item) => {
                const Icon = item.icon;
                const active =
                  item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href.split("?")[0]) && !item.href.includes("?");
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={`flex items-center gap-2.5 rounded px-2.5 py-2 text-[0.79rem] transition-colors ${
                        active ? "bg-white/10 font-semibold text-white" : "text-white/65 hover:bg-white/5 hover:text-white"
                      }`}
                    >
                      <Icon size={14} aria-hidden="true" />
                      {item.label}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
    </nav>
  );
}
