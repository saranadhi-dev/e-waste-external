/**
 * Centralized Design Tokens - Colors
 * Strict Black and White Theme with clean neutral grey scales
 */
export const colors = {
  background: "#ffffff",
  foreground: "#0a0a0a",
  card: {
    DEFAULT: "#ffffff",
    foreground: "#0a0a0a",
  },
  primary: {
    DEFAULT: "#0a0a0a",
    foreground: "#fafafa",
    hover: "#27272a",
  },
  secondary: {
    DEFAULT: "#f4f4f5",
    foreground: "#18181b",
    hover: "#e4e4e7",
  },
  muted: {
    DEFAULT: "#f4f4f5",
    foreground: "#6b6b73",
  },
  border: "#e4e4e7",
  input: "#d4d4d8",
  ring: "#0a0a0a",
  sidebar: "#fafafa",
  destructive: {
    DEFAULT: "#dc2626",
    foreground: "#ffffff",
    hover: "#b91c1c",
  },
  status: {
    pending: {
      bg: "#f4f4f5",
      text: "#52525b",
      border: "#d4d4d8",
    },
    under_review: {
      bg: "#f4f4f5",
      text: "#18181b",
      border: "#a1a1aa",
    },
    approved: {
      bg: "#18181b",
      text: "#fafafa",
      border: "#18181b",
    },
    rejected: {
      bg: "#fef2f2",
      text: "#dc2626",
      border: "#fecaca",
    },
    purchased: {
      bg: "#0a0a0a",
      text: "#ffffff",
      border: "#0a0a0a",
    },
  },
} as const;

export type ColorToken = typeof colors;
