import type { LucideIcon } from "lucide-react";

export type ReportFrequency = "Daily" | "Weekly" | "Monthly" | "On-demand";

export type Report = {
  id: string;
  name: string;
  description: string;
  frequency: ReportFrequency;
};

export type ModuleTab = {
  id: string;
  label: string;
  icon: LucideIcon;
  reports: Report[];
};

export type ReportExtras = {
  warehouse?: string;
  product?: string;
  fromDate?: string;
  toDate?: string;
};
