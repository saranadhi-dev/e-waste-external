import {
  HomeIcon,
  PackageIcon,
  PlusIcon,
  SettingsIcon,
  BoltIcon,
} from "@/components/ui/icons";
import type { NavItem } from "@/types/ui";

export const appName = "E-Waste Collection";

export const mainNavigation: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: HomeIcon,
  },
  {
    label: "E-Waste Items",
    href: "/ewaste",
    icon: PackageIcon,
  },
  {
    label: "Add Entry",
    href: "/ewaste/add",
    icon: PlusIcon,
  },
  {
    label: "Live Pricing",
    href: "/pricing",
    icon: BoltIcon,
  },
];

export const secondaryNavigation: NavItem[] = [
  {
    label: "Store Profile",
    href: "/settings",
    icon: SettingsIcon,
  },
];
