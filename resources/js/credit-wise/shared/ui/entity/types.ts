import type { ReactNode } from "react";
import type { Entity } from "@/lib/state/useEntityStore";

export type FieldType = "text" | "number" | "select" | "textarea" | "date" | "tel" | "email" | "checkbox" | "variants";

export type VariantSchema = { name: string; label: string; type: "text" | "number"; placeholder?: string };

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: unknown;
  fullWidth?: boolean;
  showWhen?: { field: string; equals: unknown };
  variantSchema?: VariantSchema[];
};

export type Column<T> = {
  key: string;
  header: string;
  render?: (item: T) => ReactNode;
  className?: string;
};

export type Kpi<T> = {
  label: string;
  hint?: string;
  icon: ReactNode;
  tone?: "primary" | "success" | "warning" | "destructive";
  compute: (items: T[]) => string | number;
};

export type EntityPageProps<T extends Entity> = {
  title: string;
  description?: string;
  storageKey: string;
  seed: T[];
  fields: Field[];
  columns: Column<T>[];
  kpis?: Kpi<T>[];
  searchKeys?: (keyof T)[];
  addLabel?: string;
  withAvatar?: { nameKey: keyof T; subKey?: keyof T; nameHref?: (item: T) => string };
  expandable?: { canExpand: (item: T) => boolean; render: (item: T) => ReactNode };
  rowHref?: (item: T) => string;
  addHref?: string;
  editHref?: (item: T) => string;
  customForm?: (props: { initial?: T; onClose: () => void; onSubmit: (values: Record<string, unknown>) => void; isEdit: boolean }) => ReactNode;
  documentView?: (item: T, ctx: { close: () => void; onEdit?: () => void; onDelete?: () => void }) => ReactNode;
  notifyOnSave?: {
    audiences: string[];
    eventLabel: string;
    buildMessage: (item: Record<string, unknown>, isEdit: boolean) => string;
  };
  headerSlot?: ReactNode;
  toolbarEndSlot?: ReactNode;
  extraRowActions?: (
    item: T,
    close: () => void,
    helpers?: { update: (patch: Partial<T>) => void; entityName: string },
  ) => ReactNode;
  filters?: { key: string; label: string; options?: string[] }[];
  initialSearch?: string;
  onSearchChange?: (query: string) => void;
  initialStatusFilter?: string;
  onStatusChange?: (status: string) => void;
  shareableLink?: boolean;
  transformOnSave?: (values: Record<string, unknown>, existing?: T) => Record<string, unknown>;
  hideAdd?: boolean;
};
