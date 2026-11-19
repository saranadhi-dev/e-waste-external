"use client";

import { Tooltip } from "@/components/ui/tooltip";
import { LogOutIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type SidebarUserProps = {
  name: string;
  email: string;
  collapsed?: boolean;
  onLogout?: () => void;
};

export function SidebarUser({ name, email, collapsed = false, onLogout }: SidebarUserProps) {
  const initials = (name || "Store Owner")
    .split(" ")
    .map((p) => p[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase() || "SO";

  return (
    <div className="flex items-center justify-between gap-2 rounded-lg p-1.5 hover:bg-muted/50 transition-colors">
      <Tooltip label={name || email} enabled={collapsed}>
        <div className="flex min-w-0 items-center gap-3">
          <span
            aria-hidden="true"
            className="grid size-8 shrink-0 place-items-center rounded-full bg-secondary text-xs font-semibold text-secondary-foreground border border-border"
          >
            {initials}
          </span>
          <div className={cn("min-w-0 flex-1", collapsed && "sr-only")}>
            <p className="truncate text-sm font-medium text-foreground">{name || "Store Owner"}</p>
            <p className="truncate text-xs text-muted-foreground">{email}</p>
          </div>
        </div>
      </Tooltip>
      {onLogout && !collapsed && (
        <button
          type="button"
          onClick={onLogout}
          title="Sign out"
          aria-label="Sign out"
          className="p-1.5 rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
        >
          <LogOutIcon className="size-4" />
        </button>
      )}
    </div>
  );
}
