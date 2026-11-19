import type { ComponentType } from "react";

export type ButtonVariant = "primary" | "secondary" | "destructive" | "ghost";
export type ButtonSize = "sm" | "md" | "icon";

export type IconProps = {
  size?: number | string;
  className?: string;
};

export type ModalAction = {
  label: string;
  onClick?: () => void;
  variant?: ButtonVariant;
  loading?: boolean;
  disabled?: boolean;
};

export type NavItem = {
  label: string;
  href: string;
  icon: ComponentType<IconProps>;
};
