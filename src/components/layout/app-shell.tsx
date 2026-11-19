"use client";

import { useCallback, useState, useSyncExternalStore, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/layout/logo";
import { MobileNavigation } from "@/components/layout/mobile-navigation";
import { Sidebar } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { MenuIcon } from "@/components/ui/icons";
import {
  appName,
  mainNavigation,
  secondaryNavigation,
} from "@/config/navigation";
import { logoutUser } from "@/lib/auth/client-auth";

const STORAGE_KEY = "sidebar-collapsed";
const LARGE = "(min-width: 1024px)";

function subscribeLarge(cb: () => void) {
  if (typeof window === "undefined") return () => {};
  const mq = window.matchMedia(LARGE);
  mq.addEventListener("change", cb);
  return () => mq.removeEventListener("change", cb);
}

const listeners = new Set<() => void>();

function readPreference(): boolean | null {
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved === null ? null : saved === "true";
  } catch {
    return null;
  }
}

function subscribePreference(cb: () => void) {
  listeners.add(cb);
  return () => void listeners.delete(cb);
}

function writePreference(value: boolean) {
  try {
    localStorage.setItem(STORAGE_KEY, String(value));
  } catch {}
  listeners.forEach((l) => l());
}

export interface AppShellProps {
  children: ReactNode;
  user?: {
    name?: string;
    email?: string;
  };
}

export function AppShell({ children, user }: AppShellProps) {
  const router = useRouter();
  const isLarge = useSyncExternalStore(
    subscribeLarge,
    () => (typeof window !== "undefined" ? window.matchMedia(LARGE).matches : true),
    () => true,
  );
  const preference = useSyncExternalStore(subscribePreference, readPreference, () => null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const closeDrawer = useCallback(() => setDrawerOpen(false), []);

  const collapsed = preference ?? !isLarge;
  const toggle = () => writePreference(!collapsed);

  const handleLogout = async () => {
    await logoutUser();
    router.push("/login");
    router.refresh();
  };

  const navUser = {
    name: user?.name || "Store Owner",
    email: user?.email || "",
  };

  const nav = {
    appName,
    mainItems: mainNavigation,
    secondaryItems: secondaryNavigation,
    user: navUser,
    onLogout: handleLogout,
  };

  return (
    <div className="flex min-h-dvh bg-background text-foreground">
      <a
        href="#main"
        className="sr-only z-50 rounded-lg bg-primary px-3 py-2 text-primary-foreground focus:not-sr-only focus:fixed focus:left-3 focus:top-3"
      >
        Skip to content
      </a>

      <Sidebar {...nav} collapsed={collapsed} onToggleCollapsed={toggle} />
      <MobileNavigation {...nav} open={drawerOpen} onClose={closeDrawer} />

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-border bg-background/95 px-4 backdrop-blur md:hidden">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              className="-ml-2 size-9"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              aria-expanded={drawerOpen}
            >
              <MenuIcon />
            </Button>
            <Logo name={appName} />
          </div>
        </header>
        <main
          id="main"
          className="mx-auto w-full max-w-[100rem] flex-1 px-4 py-6 sm:px-6 lg:px-8 lg:py-8"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
