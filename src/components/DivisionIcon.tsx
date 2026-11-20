import { Cpu, LineChart, Landmark, PackageSearch } from "lucide-react";
import type { DivisionSlug } from "@/lib/content";

const ICONS = {
  technologies: Cpu,
  advisory: LineChart,
  trading: PackageSearch,
  investments: Landmark,
} as const;

export function DivisionIcon({ slug, size = 20, className = "" }: { slug: DivisionSlug; size?: number; className?: string }) {
  const Icon = ICONS[slug];
  return <Icon size={size} className={className} aria-hidden="true" />;
}
