/**
 * Centralized Design Tokens - Typography
 * Extracted from reference CSS hierarchy
 */
export const typography = {
  fontFamily: {
    sans: "var(--font-sans, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif)",
    mono: "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace",
  },
  fontSize: {
    caption: {
      fontSize: "0.75rem",
      lineHeight: "1rem",
    },
    body: {
      fontSize: "0.875rem",
      lineHeight: "1.375rem",
    },
    cardTitle: {
      fontSize: "0.9375rem",
      lineHeight: "1.5rem",
      fontWeight: "500",
    },
    sectionTitle: {
      fontSize: "1.0rem",
      lineHeight: "1.75rem",
      fontWeight: "500",
    },
    pageTitle: {
      fontSize: "1.5rem",
      lineHeight: "2rem",
      fontWeight: "600",
      letterSpacing: "-0.015em",
    },
    display: {
      fontSize: "2rem",
      lineHeight: "2.5rem",
      fontWeight: "700",
      letterSpacing: "-0.025em",
    },
  },
  fontWeight: {
    normal: "400",
    medium: "500",
    semibold: "600",
    bold: "700",
  },
} as const;

export type TypographyToken = typeof typography;
