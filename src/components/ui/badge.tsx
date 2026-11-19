import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

export type BadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "pending"
  | "under_review"
  | "approved"
  | "rejected"
  | "purchased";

const variants: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  secondary: "bg-secondary text-secondary-foreground border border-border",
  outline: "border border-border text-foreground bg-transparent",
  destructive: "bg-destructive/10 text-destructive border border-destructive/20",
  pending: "bg-secondary text-secondary-foreground border border-border",
  under_review: "bg-muted text-foreground border border-border font-medium",
  approved: "bg-primary text-primary-foreground font-medium",
  rejected: "bg-destructive/10 text-destructive border border-destructive/30",
  purchased: "bg-primary text-primary-foreground font-semibold",
};

export function Badge({
  variant = "default",
  className,
  ...props
}: HTMLAttributes<HTMLSpanElement> & { variant?: BadgeVariant }) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium tracking-wide capitalize",
        variants[variant],
        className,
      )}
      {...props}
    />
  );
}
