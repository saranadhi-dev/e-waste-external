import { NavigationItem } from "@/components/layout/navigation-item";
import { Logo } from "@/components/layout/logo";
import { SidebarUser } from "@/components/layout/sidebar-user";
import { LivePrices } from "@/components/layout/live-prices";
import { Button } from "@/components/ui/button";
import { SidebarIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";
import type { NavItem } from "@/types/ui";

export type SidebarProps = {
  appName: string;
  mainItems: NavItem[];
  secondaryItems: NavItem[];
  user: { name: string; email: string };
  collapsed?: boolean;
  onToggleCollapsed?: () => void;
  onNavigate?: () => void;
  onLogout?: () => void;
};

export function SidebarContent({
  appName,
  mainItems,
  secondaryItems,
  user,
  collapsed = false,
  onToggleCollapsed,
  onNavigate,
  onLogout,
}: SidebarProps) {
  return (
    <div className="flex h-full min-h-0 flex-col p-3">
      <div
        className={cn(
          "flex items-center px-1.5",
          collapsed ? "flex-col gap-2" : "h-12 justify-between gap-2",
        )}
      >
        <Logo name={appName} showName={!collapsed} />
        {onToggleCollapsed && (
          <Button
            variant="ghost"
            size="icon"
            className="size-9"
            onClick={onToggleCollapsed}
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            aria-expanded={!collapsed}
          >
            <SidebarIcon />
          </Button>
        )}
      </div>

      <nav aria-label="Main" className="mt-4 flex-1 overflow-y-auto">
        <ul className="flex flex-col gap-1">
          {mainItems.map((item) => (
            <li key={item.href}>
              <NavigationItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
            </li>
          ))}
        </ul>
      </nav>

      {/* Live E-Waste Prices Section */}
      <div className="shrink-0">
        <LivePrices collapsed={collapsed} />
      </div>

      <div className="mt-2 flex flex-col gap-1 border-t border-border pt-3">
        <nav aria-label="Secondary">
          <ul className="flex flex-col gap-1">
            {secondaryItems.map((item) => (
              <li key={item.href}>
                <NavigationItem item={item} collapsed={collapsed} onNavigate={onNavigate} />
              </li>
            ))}
          </ul>
        </nav>
        {/* <SidebarUser
          name={user.name}
          email={user.email}
          collapsed={collapsed}
          onLogout={onLogout}
        /> */}
      </div>
    </div>
  );
}

export function Sidebar(props: SidebarProps) {
  return (
    <aside
      aria-label="Sidebar"
      style={{ width: props.collapsed ? "4.5rem" : "16rem" }}
      className="sticky top-0 hidden h-dvh shrink-0 border-r border-border bg-sidebar transition-[width] duration-200 ease-out md:block"
    >
      <SidebarContent {...props} />
    </aside>
  );
}
