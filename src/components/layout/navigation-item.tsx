"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tooltip } from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/ui";

type NavigationItemProps = {
  item: NavItem;
  collapsed?: boolean;
  onNavigate?: () => void;
};

export function NavigationItem({ item, collapsed = false, onNavigate }: NavigationItemProps) {
  const pathname = usePathname();
  const active =
    item.href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(item.href);
  const Icon = item.icon;

  return (
    <Tooltip label={item.label} enabled={collapsed}>
      <Link
        href={item.href}
        onClick={onNavigate}
        aria-current={active ? "page" : undefined}
        className={cn(
          "flex h-10 items-center gap-3 rounded-lg px-2.5 text-sm font-medium transition-colors",
          "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
          active
            ? "bg-primary text-primary-foreground font-semibold shadow-xs"
            : "text-muted-foreground hover:bg-muted hover:text-foreground",
        )}
      >
        <Icon className="size-5 shrink-0" />
        <span className={cn("truncate", collapsed && "sr-only")}>{item.label}</span>
      </Link>
    </Tooltip>
  );
}
