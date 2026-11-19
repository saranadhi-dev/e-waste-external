"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { SidebarContent, type SidebarProps } from "@/components/layout/sidebar";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { cn } from "@/lib/utils";

type MobileNavigationProps = Omit<SidebarProps, "collapsed" | "onToggleCollapsed" | "onNavigate"> & {
  open: boolean;
  onClose: () => void;
};

export function MobileNavigation({ open, onClose, ...sidebar }: MobileNavigationProps) {
  const pathname = usePathname();
  const closeRef = useRef<HTMLButtonElement>(null);

  // Close after route change
  useEffect(() => {
    onClose();
  }, [pathname, onClose]);

  // Escape, scroll lock, focus in / restore
  useEffect(() => {
    if (!open) return;
    const previous = document.activeElement as HTMLElement | null;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = overflow;
      previous?.focus?.();
    };
  }, [open, onClose]);

  return (
    <div className="md:hidden" inert={!open}>
      <div
        aria-hidden="true"
        onClick={onClose}
        className={cn(
          "fixed inset-0 z-40 bg-foreground/40 backdrop-blur-xs transition-opacity duration-200",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 max-w-[85vw] border-r border-border bg-sidebar shadow-lg transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <Button
          ref={closeRef}
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 z-10 size-9"
          onClick={onClose}
          aria-label="Close menu"
        >
          <CloseIcon />
        </Button>
        <SidebarContent {...sidebar} onNavigate={onClose} />
      </div>
    </div>
  );
}
