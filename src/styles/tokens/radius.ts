/**
 * Centralized Design Tokens - Border Radius
 * Extracted from reference CSS design tokens
 */
export const radius = {
  none: "0",
  sm: "0.375rem",  // 6px
  md: "0.5rem",    // 8px (calc(var(--radius) - 2px))
  lg: "0.625rem",  // 10px (var(--radius))
  xl: "0.875rem",  // 14px (calc(var(--radius) + 4px))
  "2xl": "1rem",   // 16px
  full: "9999px",
} as const;

export type RadiusToken = typeof radius;
