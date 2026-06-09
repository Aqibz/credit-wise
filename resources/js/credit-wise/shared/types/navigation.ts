import type { LucideIcon } from "lucide-react";

export type NavigationBadge = "new" | "beta" | "none";

export type NavigationChild = {
  label: string;
  to?: string;
  badge?: number;
  statusBadge?: NavigationBadge;
  search?: Record<string, string>;
  children?: NavigationChild[];
  header?: boolean;
};

export type NavigationItem = {
  label: string;
  to?: string;
  icon: LucideIcon;
  badge?: number;
  statusBadge?: NavigationBadge;
  search?: Record<string, string>;
  children?: NavigationChild[];
};

export type NavigationSection = {
  title: string;
  items: NavigationItem[];
};
