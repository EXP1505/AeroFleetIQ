"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutGrid,
  ClipboardList,
  Boxes,
  GitCompareArrows,
  Share2,
  RefreshCw,
  BookOpenText,
  Plane,
} from "lucide-react";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/", label: "Fleet Overview", icon: LayoutGrid },
  { href: "/recommendations", label: "Recommendations", icon: ClipboardList },
  { href: "/spares", label: "Spares & Resources", icon: Boxes },
  { href: "/decision-engine", label: "Decision Engine", icon: GitCompareArrows },
  { href: "/digital-thread", label: "Digital Thread", icon: Share2 },
  { href: "/learning", label: "Closed-Loop Learning", icon: RefreshCw },
  { href: "/methodology", label: "KPI & Methodology", icon: BookOpenText },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden md:flex w-60 flex-col border-r border-border bg-surface shrink-0">
      <div className="flex items-center gap-2 px-5 py-4 border-b border-border">
        <div className="flex size-8 items-center justify-center rounded-md bg-accent-soft text-accent">
          <Plane className="size-4" />
        </div>
        <div>
          <div className="text-sm font-semibold tracking-tight">AeroFleetIQ</div>
          <div className="text-[10px] text-muted font-tabular">SIH26249 · Team Leviathan</div>
        </div>
      </div>

      <nav className="flex-1 overflow-y-auto scrollbar-thin px-3 py-4 space-y-1">
        {NAV_ITEMS.map((item) => {
          const active = item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-3 py-2 text-sm transition-colors",
                active ? "bg-accent-soft text-accent" : "text-muted hover:bg-surface-2 hover:text-foreground"
              )}
            >
              <Icon className="size-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div className="px-4 py-3 border-t border-border text-[10px] text-muted leading-relaxed">
        Prototype UI. Models to be trained on NASA C-MAPSS/PCoE, then validated on authorised fleet data.
      </div>
    </aside>
  );
}
