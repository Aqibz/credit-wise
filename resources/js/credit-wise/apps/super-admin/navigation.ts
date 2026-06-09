import {
  BarChart3,
  Building2,
  CreditCard,
  Flag,
  Headset,
  LayoutDashboard,
  LifeBuoy,
  ShieldCheck,
  Users,
} from "lucide-react";
import type { NavigationSection } from "@/shared/types";

export const SUPER_ADMIN_NAV_SECTIONS: NavigationSection[] = [
  {
    title: "Control Plane",
    items: [
      { label: "Dashboard", to: "/super-admin", icon: LayoutDashboard },
      { label: "Tenants", to: "/super-admin/tenants", icon: Building2 },
      { label: "Subscriptions", to: "/super-admin/subscriptions", icon: CreditCard },
      { label: "Feature Flags", to: "/super-admin/feature-flags", icon: Flag },
    ],
  },
  {
    title: "Operations",
    items: [
      { label: "Support Access", to: "/super-admin/support-access", icon: LifeBuoy },
      { label: "Support Tickets", to: "/super-admin/support", icon: Headset },
      { label: "Admins", to: "/super-admin/admins", icon: Users },
      { label: "Audit", to: "/super-admin/audit", icon: ShieldCheck },
      { label: "Reports", to: "/super-admin/reports", icon: BarChart3 },
    ],
  },
];
