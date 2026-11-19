"use client";

import { useState, type ReactNode } from "react";

type TooltipProps = {
  label: string;
  /** When false, children render untouched (e.g. label already visible). */
  enabled?: boolean;
  children: ReactNode;
};

/**
 * Visual-only tooltip shown to the right of its trigger on hover/focus.
 */
export function Tooltip({ label, enabled = true, children }: TooltipProps) {
  const [pos, setPos] = useState<{ top: number; left: number } | null>(null);

  if (!enabled) return <>{children}</>;

  const show = (el: HTMLElement) => {
    const r = el.getBoundingClientRect();
    setPos({ top: r.top + r.height / 2, left: r.right + 8 });
  };

  return (
    <div
      onMouseEnter={(e) => show(e.currentTarget)}
      onMouseLeave={() => setPos(null)}
      onFocus={(e) => show(e.currentTarget)}
      onBlur={() => setPos(null)}
      onKeyDown={(e) => e.key === "Escape" && setPos(null)}
    >
      {children}
      {pos && (
        <span
          aria-hidden="true"
          style={{ top: pos.top, left: pos.left }}
          className="pointer-events-none fixed z-50 -translate-y-1/2 whitespace-nowrap rounded-md bg-foreground px-2 py-1 text-xs font-medium text-background shadow-sm"
        >
          {label}
        </span>
      )}
    </div>
  );
}
