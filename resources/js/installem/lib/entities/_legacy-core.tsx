import { Package, Tag, Layers, Boxes, ArrowLeftRight, Barcode, FileText, Truck, ShoppingCart, ClipboardCheck, ShoppingBag, CreditCard, Calendar, AlertTriangle, Settings as SettingsIcon, HandCoins, Users, UserCheck, UserX, Wallet, Receipt, Banknote, BookOpen, Briefcase, Clock, DollarSign, TrendingUp, Building2, Target, Bell, Palette, HardDrive, MemoryStick, Ruler, Monitor, Wind, Zap, Type, Hash, CheckCircle2, XCircle, Hourglass, Ban, ShieldCheck, ShieldAlert, ShieldX, FileEdit, Inbox, RotateCcw, Send, PauseCircle, MinusCircle, type LucideIcon } from "lucide-react";
import { ReactNode, useState, useEffect } from "react";
import { Link } from "@tanstack/react-router";
import { Badge } from "@/components/ui-kit";
import { SupplierLink } from "@/components/SupplierLink";
import { RequirementsCell } from "@/components/RequirementsCell";
import { VariantMatrixCell } from "@/components/VariantMatrixCell";
import { ProductMatrixCell, ProductMatrixModal, ProductMatrixMenuAction } from "@/components/ProductMatrixCell";
import { PlanLinkedItemsAction } from "@/components/PlanLinkedItems";
import type { EntityPageProps, Field, Column, Kpi } from "@/components/EntityPage";
import { getOpeningSaveMode } from "@/components/OpeningSaveMode";

import { fmtPKR as Rs } from "@/lib/currency";

const STATUS_META: Record<string, { tone: "success" | "warning" | "destructive" | "muted" | "primary"; icon: LucideIcon }> = {
  Active: { tone: "success", icon: CheckCircle2 },
  Inactive: { tone: "muted", icon: PauseCircle },
  Pending: { tone: "warning", icon: Hourglass },
  Approved: { tone: "success", icon: ShieldCheck },
  Rejected: { tone: "destructive", icon: ShieldX },
  Overdue: { tone: "destructive", icon: AlertTriangle },
  Paid: { tone: "success", icon: CheckCircle2 },
  Draft: { tone: "muted", icon: FileEdit },
  Defaulter: { tone: "destructive", icon: ShieldAlert },
  Settled: { tone: "success", icon: CheckCircle2 },
  Repossessed: { tone: "warning", icon: RotateCcw },
  Cancelled: { tone: "muted", icon: Ban },
  Open: { tone: "primary", icon: Inbox },
  Closed: { tone: "muted", icon: MinusCircle },
  Received: { tone: "success", icon: CheckCircle2 },
  Submitted: { tone: "primary", icon: Send },
  Blacklisted: { tone: "destructive", icon: Ban },
  Verified: { tone: "success", icon: ShieldCheck },
  Unverified: { tone: "warning", icon: ShieldAlert },
  "Partially Received": { tone: "warning", icon: Hourglass },
  Void: { tone: "destructive", icon: XCircle },
  // Contracts funnel
  "Under Process": { tone: "primary", icon: FileEdit },
  "Under Verification": { tone: "warning", icon: ShieldCheck },
  "Under Approval": { tone: "warning", icon: Hourglass },
  // Blacklist recovery
  "In Recovery": { tone: "warning", icon: HandCoins },
  "Legal Action": { tone: "destructive", icon: ShieldAlert },
  "Written Off": { tone: "muted", icon: MinusCircle },
  Recovered: { tone: "success", icon: CheckCircle2 },
};

const STATUS_BADGE = (v: string): ReactNode => {
  const meta = STATUS_META[v] ?? { tone: "muted" as const, icon: MinusCircle };
  const Icon = meta.icon;
  return <Badge tone={meta.tone} icon={<Icon />}>{v}</Badge>;
};

// Generic helpers
const status = (options = ["Active", "Inactive"]): Field => ({ name: "status", label: "Status", type: "select", options, defaultValue: options[0] });
const text = (name: string, label: string, opts: Partial<Field> = {}): Field => ({ name, label, type: "text", ...opts });
const num = (name: string, label: string, opts: Partial<Field> = {}): Field => ({ name, label, type: "number", ...opts });
const sel = (name: string, label: string, options: string[], opts: Partial<Field> = {}): Field => ({ name, label, type: "select", options, ...opts });
const area = (name: string, label: string): Field => ({ name, label, type: "textarea", fullWidth: true });

const STATUS_KPI = <T extends { status?: string }>(label: string, value: string, tone: any, icon: ReactNode): Kpi<T> => ({
  label, hint: `Records with status: ${value}`, icon, tone,
  compute: (items) => items.filter((i) => i.status === value).length,
});

const TODAY_ISO = () => new Date().toISOString().slice(0, 10);
const ADD_DAYS = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return d.toISOString().slice(0, 10);
};

const DateTimeCell = ({ date, time }: { date?: string; time?: string }) => (
  <span className="inline-flex flex-col leading-tight">
    <span className="text-foreground font-medium">{date || "—"}</span>
    {time && <span className="text-[11px] text-muted-foreground font-medium">{time}</span>}
  </span>
);

const lookupPoDate = (poRef?: string): { date?: string; time?: string } => {
  if (!poRef || typeof window === "undefined") return {};
  try {
    const raw = window.localStorage.getItem("qcrm.po");
    if (!raw) return {};
    const arr = JSON.parse(raw);
    const found = Array.isArray(arr) ? arr.find((x: any) => x.ref === poRef) : null;
    return found ? { date: found.date, time: found.time } : {};
  } catch {
    return {};
  }
};

const RefWithDateCell = ({ refValue, lookup }: { refValue?: string; lookup: (ref?: string) => { date?: string; time?: string } }) => {
  const [info, setInfo] = useState<{ date?: string; time?: string }>({});
  useEffect(() => { setInfo(lookup(refValue)); }, [refValue, lookup]);
  if (!refValue) return <span className="text-muted-foreground">—</span>;
  const { date, time } = info;
  return (
    <span className="inline-flex flex-col leading-tight">
      <span className="text-foreground font-medium">{refValue}</span>
      {(date || time) && (
        <span className="text-[11px] text-muted-foreground font-medium">
          {date}{time ? ` • ${time}` : ""}
        </span>
      )}
    </span>
  );
};

export const brandsConfig: EntityPageProps<any> = {
  title: "Brands",
  description: "Manage product brands and their local distributors.",
  storageKey: "qcrm.brands",
  withAvatar: { nameKey: "name", subKey: "country" },
  searchKeys: ["name", "code", "country", "distributor"],
  kpis: [
    { label: "Total Brands", icon: <Tag className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active Brands", "Active", "success", <Tag className="h-5 w-5" />),
    { label: "Countries", icon: <Tag className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x) => x.country)).size },
    STATUS_KPI("Inactive", "Inactive", "warning", <Tag className="h-5 w-5" />),
  ],
  columns: [
    { key: "name", header: "Brand" },
    { key: "code", header: "Code" },
    { key: "country", header: "Country" },
    { key: "distributor", header: "Distributor" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Brand Name", { required: true }),
    text("code", "Brand Code", { required: true }),
    text("country", "Country of Origin"),
    text("distributor", "Local Distributor"),
    text("website", "Official Website"),
    status(),
  ],
  seed: [
    { id: "1", name: "Samsung", code: "SAM", country: "South Korea", distributor: "R&I Electronics", status: "Active" },
    { id: "2", name: "Gree", code: "GRE", country: "China", distributor: "DWP Group", status: "Active" },
    { id: "3", name: "Haier", code: "HAI", country: "China", distributor: "Haier Pakistan", status: "Active" },
    { id: "4", name: "Dawlance", code: "DAW", country: "Pakistan", distributor: "Dawlance Ltd", status: "Active" },
  ],

};

export const categoriesConfig: EntityPageProps<any> = {
  title: "Categories",
  description: "Organize products into categories and sub-categories.",
  storageKey: "qcrm.categories",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code"],
  kpis: [
    { label: "Total Categories", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Layers className="h-5 w-5" />),
    { label: "Avg Products", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: () => "—" },
    STATUS_KPI("Inactive", "Inactive", "warning", <Layers className="h-5 w-5" />),
  ],
  columns: [
    { key: "name", header: "Category" },
    { key: "code", header: "Code" },
    { key: "order", header: "Display Order" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Category Name", { required: true }),
    text("code", "Category Code", { required: true }),
    num("order", "Display Order", { defaultValue: 1 }),
    area("description", "Description"),
    status(),
  ],
  seed: [
    { id: "1", name: "Home Appliances", code: "HA", order: 1, status: "Active" },
    { id: "2", name: "Electronics", code: "EL", order: 2, status: "Active" },
    { id: "3", name: "Mobiles", code: "MOB", order: 3, status: "Active" },
    { id: "4", name: "Furniture", code: "FRN", order: 4, status: "Active" },
    { id: "5", name: "Motorcycles", code: "MTR", order: 5, status: "Active" },
  ],
};

export const subCategoriesConfig: EntityPageProps<any> = {
  title: "Sub-Categories",
  description: "Drill-down sub-categories under main categories.",
  storageKey: "qcrm.sub-categories",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "category"],
  kpis: [
    { label: "Total Sub-Categories", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Layers className="h-5 w-5" />),
    { label: "Parents Used", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.category)).size },
    STATUS_KPI("Inactive", "Inactive", "warning", <Layers className="h-5 w-5" />),
  ],
  columns: [
    { key: "name", header: "Sub-Category" },
    { key: "code", header: "Code" },
    { key: "category", header: "Parent Category" },
    { key: "order", header: "Display Order" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Sub-Category Name", { required: true }),
    text("code", "Code", { required: true }),
    sel("category", "Parent Category", ["Home Appliances", "Electronics", "Mobiles", "Furniture", "Motorcycles"], { required: true }),
    num("order", "Display Order", { defaultValue: 1 }),
    area("description", "Description"),
    status(),
  ],
  seed: [
    { id: "1", name: "Air Conditioners", code: "AC", category: "Home Appliances", order: 1, status: "Active" },
    { id: "2", name: "Refrigerators", code: "REF", category: "Home Appliances", order: 2, status: "Active" },
    { id: "3", name: "LED TVs", code: "LED", category: "Electronics", order: 1, status: "Active" },
    { id: "4", name: "Smartphones", code: "SMT", category: "Mobiles", order: 1, status: "Active" },
    { id: "5", name: "Sofas", code: "SOF", category: "Furniture", order: 1, status: "Active" },
  ],
};

// ===== Variant attribute helpers =====
const ATTRIBUTE_TYPE_META: Record<string, { icon: ReactNode; cls: string; label: string }> = {
  Color:    { icon: <Palette    className="h-3.5 w-3.5" />, cls: "bg-pink-500/15 text-pink-600 border-pink-500/30",       label: "Color"    },
  Storage:  { icon: <HardDrive  className="h-3.5 w-3.5" />, cls: "bg-blue-500/15 text-blue-600 border-blue-500/30",       label: "Storage"  },
  RAM:      { icon: <MemoryStick className="h-3.5 w-3.5" />, cls: "bg-violet-500/15 text-violet-600 border-violet-500/30", label: "RAM"      },
  Size:     { icon: <Ruler      className="h-3.5 w-3.5" />, cls: "bg-amber-500/15 text-amber-600 border-amber-500/30",     label: "Size"     },
  Capacity: { icon: <Wind       className="h-3.5 w-3.5" />, cls: "bg-cyan-500/15 text-cyan-600 border-cyan-500/30",        label: "Capacity" },
  Screen:   { icon: <Monitor    className="h-3.5 w-3.5" />, cls: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",label: "Screen"   },
  Power:    { icon: <Zap        className="h-3.5 w-3.5" />, cls: "bg-orange-500/15 text-orange-600 border-orange-500/30",  label: "Power"    },
  Number:   { icon: <Hash       className="h-3.5 w-3.5" />, cls: "bg-slate-500/15 text-slate-600 border-slate-500/30",     label: "Number"   },
  Text:     { icon: <Type       className="h-3.5 w-3.5" />, cls: "bg-slate-500/15 text-slate-600 border-slate-500/30",     label: "Text"     },
  Select:   { icon: <Layers     className="h-3.5 w-3.5" />, cls: "bg-primary/10 text-primary border-primary/30",           label: "Select"   },
};
const COLOR_SWATCH: Record<string, string> = {
  black: "#0a0a0a", white: "#ffffff", silver: "#c0c0c0", gray: "#9ca3af", grey: "#9ca3af",
  blue: "#2563eb", red: "#dc2626", gold: "#d4af37", green: "#16a34a", pink: "#ec4899",
  purple: "#9333ea", yellow: "#eab308", orange: "#f97316", brown: "#92400e", navy: "#1e3a8a",
  rose: "#f43f5e", beige: "#d6b48a", cream: "#fdf6e3", maroon: "#7f1d1d",
};
const getMeta = (type: string) => ATTRIBUTE_TYPE_META[type] || ATTRIBUTE_TYPE_META.Select;

export const variantAttributesConfig: EntityPageProps<any> = {
  title: "Variant Attributes",
  description: "Define attributes (Color, Storage, RAM, Size, Capacity) and their allowed values.",
  storageKey: "qcrm.variant-attributes",
  searchKeys: ["name", "code", "type"],
  kpis: [
    { label: "Total Attributes", icon: <Tag className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Tag className="h-5 w-5" />),
    { label: "Total Values", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: (i) => i.reduce((s: number, x: any) => s + (x.values ? String(x.values).split(",").length : 0), 0) },
    { label: "Required", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.required === "Yes").length },
  ],
  columns: [
    { key: "name", header: "Attribute", render: (i: any) => {
      const meta = getMeta(i.type);
      return (
        <div className="flex items-center gap-2">
          <span className={`h-9 w-9 rounded-lg border flex items-center justify-center ${meta.cls}`}>{meta.icon}</span>
          <div className="flex flex-col min-w-0">
            <span className="font-bold text-foreground text-sm">{i.name}</span>
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">{i.code}</span>
          </div>
        </div>
      );
    } },
    { key: "type", header: "Type", render: (i: any) => {
      const meta = getMeta(i.type);
      return (
        <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider ${meta.cls}`}>
          {meta.icon} {i.type}
        </span>
      );
    } },
    { key: "appliesTo", header: "Applies To", render: (i: any) => (
      <span className="inline-flex items-center gap-1 rounded-md bg-muted text-foreground text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
        <Package className="h-3 w-3" /> {i.appliesTo}
      </span>
    ) },
    { key: "values", header: "Values", render: (i: any) => {
      const vals = String(i.values || "").split(",").map((v) => v.trim()).filter(Boolean);
      const visible = vals.slice(0, 6);
      const overflow = vals.length - visible.length;
      const type = i.type;
      return (
        <div className="flex flex-wrap gap-1 max-w-md">
          {visible.map((v) => {
            // Color: render swatch + name
            if (type === "Color") {
              const swatch = COLOR_SWATCH[v.toLowerCase()] || "#94a3b8";
              return (
                <span key={v} className="inline-flex items-center gap-1 rounded-full border border-border bg-background pl-0.5 pr-2 py-0.5 text-[10px] font-semibold text-foreground">
                  <span className="h-4 w-4 rounded-full border border-border shadow-sm" style={{ backgroundColor: swatch }} />
                  {v}
                </span>
              );
            }
            if (type === "Storage") {
              return (
                <span key={v} className="inline-flex items-center gap-1 rounded-md border border-blue-500/30 bg-blue-500/10 text-blue-600 text-[10px] font-bold px-1.5 py-0.5">
                  <HardDrive className="h-3 w-3" /> {v}
                </span>
              );
            }
            if (type === "RAM") {
              return (
                <span key={v} className="inline-flex items-center gap-1 rounded-md border border-violet-500/30 bg-violet-500/10 text-violet-600 text-[10px] font-bold px-1.5 py-0.5">
                  <MemoryStick className="h-3 w-3" /> {v}
                </span>
              );
            }
            if (type === "Size") {
              return (
                <span key={v} className="inline-flex items-center gap-1 rounded-md border border-amber-500/30 bg-amber-500/10 text-amber-600 text-[10px] font-bold uppercase px-1.5 py-0.5">
                  <Ruler className="h-3 w-3" /> {v}
                </span>
              );
            }
            if (type === "Capacity") {
              return (
                <span key={v} className="inline-flex items-center gap-1 rounded-md border border-cyan-500/30 bg-cyan-500/10 text-cyan-600 text-[10px] font-bold px-1.5 py-0.5">
                  <Wind className="h-3 w-3" /> {v}
                </span>
              );
            }
            if (type === "Screen" || (i.code === "SCR")) {
              return (
                <span key={v} className="inline-flex items-center gap-1 rounded-md border border-emerald-500/30 bg-emerald-500/10 text-emerald-600 text-[10px] font-bold px-1.5 py-0.5">
                  <Monitor className="h-3 w-3" /> {v}
                </span>
              );
            }
            return (
              <span key={v} className="inline-flex items-center rounded-md bg-primary/10 text-primary text-[10px] font-bold px-1.5 py-0.5">{v}</span>
            );
          })}
          {overflow > 0 && (
            <span className="inline-flex items-center rounded-md border border-border bg-muted px-1.5 py-0.5 text-[10px] font-bold text-muted-foreground">
              +{overflow}
            </span>
          )}
        </div>
      );
    } },
    { key: "required", header: "Required", render: (i: any) => (
      i.required === "Yes" ? (
        <span className="inline-flex items-center gap-1 rounded-full bg-warning/15 text-warning text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
          <AlertTriangle className="h-3 w-3" /> Required
        </span>
      ) : (
        <span className="text-[11px] text-muted-foreground font-semibold uppercase tracking-wide">Optional</span>
      )
    ) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Attribute Name", { required: true, placeholder: "e.g. Color, RAM" }),
    text("code", "Code", { required: true, placeholder: "e.g. COLOR" }),
    sel("type", "Input Type", ["Color", "Storage", "RAM", "Size", "Capacity", "Screen", "Power", "Number", "Text", "Select"], { defaultValue: "Select" }),
    sel("appliesTo", "Applies To", ["All Products", "Electronics", "Mobiles", "Furniture", "Home Appliances"], { defaultValue: "All Products" }),
    sel("required", "Required", ["Yes", "No"], { defaultValue: "No" }),
    area("values", "Allowed Values (comma separated)"),
    status(),
  ],
  seed: [
    { id: "1", name: "Color",       code: "COLOR", type: "Color",    appliesTo: "All Products",    required: "No",  values: "Black, White, Silver, Blue, Red, Gold, Rose Gold, Navy", status: "Active" },
    { id: "2", name: "Storage",     code: "STG",   type: "Storage",  appliesTo: "Mobiles",         required: "Yes", values: "32 GB, 64 GB, 128 GB, 256 GB, 512 GB, 1 TB", status: "Active" },
    { id: "3", name: "RAM",         code: "RAM",   type: "RAM",      appliesTo: "Mobiles",         required: "Yes", values: "4 GB, 6 GB, 8 GB, 12 GB, 16 GB", status: "Active" },
    { id: "4", name: "Size",        code: "SIZE",  type: "Size",     appliesTo: "Furniture",       required: "No",  values: "Small, Medium, Large, XL, King, Queen", status: "Active" },
    { id: "5", name: "AC Capacity", code: "ACAP",  type: "Capacity", appliesTo: "Home Appliances", required: "Yes", values: "1 Ton, 1.5 Ton, 2 Ton, 2.5 Ton", status: "Active" },
    { id: "6", name: "Fridge Size", code: "FCAP",  type: "Capacity", appliesTo: "Home Appliances", required: "Yes", values: "9 CFT, 11 CFT, 13 CFT, 15 CFT, 18 CFT", status: "Active" },
    { id: "7", name: "Screen Size", code: "SCR",   type: "Screen",   appliesTo: "Electronics",     required: "No",  values: "32 inch, 43 inch, 55 inch, 65 inch, 75 inch", status: "Active" },
    { id: "8", name: "Power Type",  code: "PWR",   type: "Power",    appliesTo: "Home Appliances", required: "No",  values: "Inverter, Non-Inverter, Solar Hybrid", status: "Active" },
    { id: "9", name: "Engine CC",   code: "CC",    type: "Number",   appliesTo: "All Products",    required: "No",  values: "70cc, 100cc, 125cc, 150cc", status: "Active" },
  ],
};

export const productVariantsConfig: EntityPageProps<any> = {
  title: "Product Variants",
  description: "All product variants across catalog with stock, price and attributes.",
  storageKey: "qcrm.product-variants",
  withAvatar: { nameKey: "variant", subKey: "sku" },
  searchKeys: ["variant", "sku", "product", "color", "storage"],
  kpis: [
    { label: "Total Variants", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Layers className="h-5 w-5" />),
    { label: "Out of Stock", hint: "Variants with 0 stock", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive", compute: (i) => i.filter((x: any) => Number(x.stock) === 0).length },
    { label: "Stock Value", icon: <TrendingUp className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.price || 0) * Number(x.stock || 0), 0)) },
  ],
  columns: [
    { key: "variant", header: "Variant", render: (i: any) => {
      const colorMap: Record<string, string> = {
        white: "#ffffff", black: "#111111", silver: "#c0c0c0", gray: "#9ca3af", grey: "#9ca3af",
        red: "#ef4444", blue: "#3b82f6", green: "#22c55e", pink: "#ec4899", purple: "#a855f7",
        gold: "#d4af37", yellow: "#eab308", orange: "#f97316", brown: "#92400e",
      };
      const c = (i.color || "").toLowerCase().trim();
      const swatch = colorMap[c];
      return (
        <div className="flex items-center gap-2">
          {swatch && (
            <span
              className="inline-block h-4 w-4 rounded-full border border-border shadow-sm shrink-0"
              style={{ backgroundColor: swatch }}
              title={i.color}
            />
          )}
          <div className="flex flex-col">
            <span className="font-medium text-foreground">{i.variant}</span>
            {i.sku && <span className="text-[11px] text-muted-foreground">{i.sku}</span>}
          </div>
        </div>
      );
    } },
    { key: "product", header: "Product" },
    { key: "spec", header: "Specs", render: (i: any) => {
      const tags: { label: string; value: string; tone: string }[] = [];
      if (i.color) tags.push({ label: "Color", value: i.color, tone: "bg-muted text-foreground" });
      if (i.storage) tags.push({ label: "Storage", value: i.storage, tone: "bg-info/10 text-info" });
      if (i.ram) tags.push({ label: "RAM", value: i.ram, tone: "bg-primary/10 text-primary" });
      if (i.size) tags.push({ label: "Size", value: i.size, tone: "bg-warning/15 text-warning" });
      if (i.capacity) tags.push({ label: "Capacity", value: i.capacity, tone: "bg-success/15 text-success" });
      if (tags.length === 0) return <span className="text-muted-foreground text-xs">—</span>;
      return (
        <div className="flex flex-wrap gap-1">
          {tags.map((t, k) => (
            <span key={k} className={`inline-flex items-center gap-1 rounded-md px-1.5 py-0.5 text-[10px] font-semibold ${t.tone}`}>
              <span className="opacity-60 uppercase">{t.label}</span>
              <span>{t.value}</span>
            </span>
          ))}
        </div>
      );
    } },
    { key: "price", header: "Cash Price", render: (i: any) => <span className="font-semibold text-foreground">{Rs(i.price)}</span> },
    { key: "rental", header: "Installment", render: (i: any) => {
      try {
        const all = JSON.parse(localStorage.getItem("qcrm.products") || "[]");
        const parent = all.find((p: any) => p.name === i.product);
        const rental = Number(parent?.rental || 0);
        if (!rental) return <span className="text-muted-foreground text-xs">—</span>;
        return <span className="font-semibold text-primary">{Rs(rental)}<span className="text-[10px] text-muted-foreground font-normal">/mo</span></span>;
      } catch { return <span className="text-muted-foreground text-xs">—</span>; }
    } },
    { key: "stock", header: "Stock", render: (i: any) => {
      const s = Number(i.stock || 0);
      const tone = s === 0 ? "bg-destructive/15 text-destructive" : s <= 2 ? "bg-warning/15 text-warning" : "bg-success/15 text-success";
      return <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-bold ${tone}`}>{s === 0 ? "Out" : s}</span>;
    } },
    { key: "matrix", header: "Matrix", render: (i: any) => (
      <VariantMatrixCell variantName={i.variant} productName={i.product} variantPrice={Number(i.price || 0)} />
    ) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    sel("product", "Parent Product", ["Gree 1.5 Ton Inverter AC", "Samsung LED TV 55 Inch", "Haier Inverter Refrigerator", "Samsung Galaxy A55", "iPhone 15"], { required: true }),
    text("variant", "Variant Name", { required: true, placeholder: "e.g. 128GB — Black" }),
    text("sku", "SKU / Barcode", { required: true }),
    text("color", "Color"),
    text("storage", "Storage"),
    text("ram", "RAM"),
    text("size", "Size"),
    text("capacity", "Capacity"),
    num("price", "Price (Rs.)", { required: true }),
    num("cost", "Cost (Rs.)"),
    num("stock", "Stock", { defaultValue: 0 }),
    num("reorder", "Reorder Level", { defaultValue: 3 }),
    status(),
  ],
  seed: [
    { id: "1", product: "Gree 1.5 Ton Inverter AC", variant: "1.5 Ton — White", sku: "AC-15-GRE-WHT", color: "White", capacity: "1.5 Ton", price: 168000, cost: 145000, stock: 4, status: "Active" },
    { id: "2", product: "Gree 1.5 Ton Inverter AC", variant: "1.5 Ton — Black", sku: "AC-15-GRE-BLK", color: "Black", capacity: "1.5 Ton", price: 172000, cost: 148000, stock: 2, status: "Active" },
    { id: "3", product: "Haier Inverter Refrigerator", variant: "11 CFT — Silver", sku: "REF-11-HAI-SIL", color: "Silver", capacity: "11 CFT", price: 121500, cost: 105000, stock: 3, status: "Active" },
    { id: "4", product: "Haier Inverter Refrigerator", variant: "13 CFT — Black", sku: "REF-13-HAI-BLK", color: "Black", capacity: "13 CFT", price: 142000, cost: 122000, stock: 0, status: "Active" },
    { id: "5", product: "Samsung Galaxy A55", variant: "128GB / 8GB — Black", sku: "MOB-A55-128-BLK", color: "Black", storage: "128 GB", ram: "8 GB", price: 119000, cost: 102000, stock: 6, status: "Active" },
    { id: "6", product: "Samsung Galaxy A55", variant: "256GB / 8GB — Blue", sku: "MOB-A55-256-BLU", color: "Blue", storage: "256 GB", ram: "8 GB", price: 134000, cost: 115000, stock: 3, status: "Active" },
    { id: "7", product: "iPhone 15", variant: "128GB — Pink", sku: "MOB-IP15-128-PNK", color: "Pink", storage: "128 GB", ram: "6 GB", price: 339000, cost: 305000, stock: 2, status: "Active" },
  ],
};

import { BundleForm } from "@/components/BundleForm";

export const bundlesConfig: EntityPageProps<any> = {
  title: "Bundles / Sets",
  description: "Group multiple categories & variants as a single sellable bundle with optional time-limited discount.",
  storageKey: "qcrm.bundles",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "category"],
  kpis: [
    { label: "Total Bundles", icon: <Boxes className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Boxes className="h-5 w-5" />),
    { label: "Avg Items / Bundle", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: (i) => i.length ? (i.reduce((s: number, x: any) => s + (Array.isArray(x.items) ? x.items.length : 0), 0) / i.length).toFixed(1) : "0" },
    { label: "Avg Bundle Price", icon: <Tag className="h-5 w-5" />, tone: "primary", compute: (i) => i.length ? Rs(Math.round(i.reduce((s: number, x: any) => s + Number(x.bundlePrice || 0), 0) / i.length)) : "Rs. 0" },
  ],
  columns: [
    { key: "name", header: "Bundle Name" },
    { key: "code", header: "Code" },
    { key: "category", header: "Categories", render: (i: any) => (
      <div className="flex flex-wrap gap-1">
        {String(i.category || "").split(",").map((c: string, idx: number) => c.trim() && (
          <span key={idx} className="inline-flex items-center rounded-full bg-primary/10 text-primary text-[10px] font-semibold px-2 py-0.5">{c.trim()}</span>
        ))}
      </div>
    ) },
    { key: "items", header: "Items", render: (i: any) => `${Array.isArray(i.items) ? i.items.length : 0} items` },
    { key: "mrp", header: "MRP Total", render: (i: any) => Rs(i.mrp) },
    { key: "bundlePrice", header: "Bundle Price", render: (i: any) => Rs(i.bundlePrice) },
    { key: "discount", header: "Saving", render: (i: any) => {
      const save = Number(i.mrp || 0) - Number(i.bundlePrice || 0);
      const pct = Number(i.mrp) > 0 ? Math.round((save / Number(i.mrp)) * 100) : 0;
      return <span className="text-success font-semibold">{Rs(save)} ({pct}%)</span>;
    } },
    { key: "offer", header: "Offer", render: (i: any) => (
      <div className="flex flex-col gap-0.5 text-[11px]">
        {i.limitedTime && <span className="text-warning font-semibold">⏱ {i.startDate || "—"} → {i.endDate || "—"}</span>}
        <div className="flex gap-1">
          {i.applyOnCash && <span className="inline-flex items-center rounded bg-muted text-foreground px-1.5 py-0.5 font-medium">Cash</span>}
          {i.applyOnInstallment && <span className="inline-flex items-center rounded bg-muted text-foreground px-1.5 py-0.5 font-medium">Installment{Array.isArray(i.eligiblePlans) && i.eligiblePlans.length > 0 ? ` (${i.eligiblePlans.length})` : ""}</span>}
        </div>
      </div>
    ) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [],
  customForm: ({ initial, onClose, onSubmit, isEdit }) => (
    <BundleForm initial={initial} onClose={onClose} onSubmit={onSubmit} isEdit={isEdit} />
  ),
  seed: [
    { id: "1", name: "Living Room Combo", code: "BND-LR-01", category: "Home Appliances, Electronics", mrp: 320000, bundlePrice: 285000, status: "Active",
      applyOnCash: true, applyOnInstallment: true, eligiblePlans: ["12 Month Easy"], limitedTime: false,
      items: [
        { variantId: "1", product: "Gree 1.5 Ton Inverter AC", variant: "1.5 Ton — White", sku: "AC-15-GRE-WHT", category: "Home Appliances", price: 168000, qty: 1 },
        { variantId: "3", product: "Haier Inverter Refrigerator", variant: "11 CFT — Silver", sku: "REF-11-HAI-SIL", category: "Home Appliances", price: 121500, qty: 1 },
      ] },
    { id: "2", name: "Wedding Bundle", code: "BND-WED-01", category: "Home Appliances, Electronics, Mobiles", mrp: 580000, bundlePrice: 520000, status: "Active",
      applyOnCash: true, applyOnInstallment: false, eligiblePlans: [], limitedTime: true, startDate: "2026-05-01", endDate: "2026-12-31",
      items: [
        { variantId: "1", product: "Gree 1.5 Ton Inverter AC", variant: "1.5 Ton — White", sku: "AC-15-GRE-WHT", category: "Home Appliances", price: 168000, qty: 1 },
        { variantId: "3", product: "Haier Inverter Refrigerator", variant: "11 CFT — Silver", sku: "REF-11-HAI-SIL", category: "Home Appliances", price: 121500, qty: 1 },
        { variantId: "5", product: "Samsung Galaxy A55", variant: "128GB / 8GB — Black", sku: "MOB-A55-128-BLK", category: "Mobiles", price: 119000, qty: 1 },
      ] },
  ],
};

export const collectionsConfig: EntityPageProps<any> = {
  title: "Product Collections",
  description: "Group products into seasonal or themed collections like Winter, Summer, Eid, Back to School.",
  storageKey: "qcrm.collections",
  withAvatar: { nameKey: "name", subKey: "season" },
  searchKeys: ["name", "code", "season", "theme"],
  kpis: [
    { label: "Total Collections", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Layers className="h-5 w-5" />),
    { label: "Seasons", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.season)).size },
    { label: "Avg Products", icon: <Package className="h-5 w-5" />, tone: "primary", compute: (i) => i.length ? (i.reduce((s: number, x: any) => s + (Array.isArray(x.products) ? x.products.length : 0), 0) / i.length).toFixed(1) : "0" },
  ],
  columns: [
    { key: "name", header: "Collection" },
    { key: "code", header: "Code" },
    { key: "season", header: "Season", render: (i: any) => <Badge tone="primary">{i.season}</Badge> },
    { key: "theme", header: "Theme" },
    { key: "products", header: "Products", render: (i: any) => `${Array.isArray(i.products) ? i.products.length : 0} items` },
    { key: "startDate", header: "Start" },
    { key: "endDate", header: "End" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Collection Name", { required: true }),
    text("code", "Collection Code", { required: true }),
    sel("season", "Season", ["Winter", "Summer", "Spring", "Autumn", "Monsoon", "All Season"], { required: true }),
    sel("theme", "Theme / Occasion", ["Eid Special", "Ramadan", "Back to School", "Wedding Season", "New Year", "Independence Day", "Black Friday", "Clearance", "New Arrivals"]),
    { name: "startDate", label: "Start Date", type: "date" },
    { name: "endDate", label: "End Date", type: "date" },
    num("discount", "Collection Discount (%)"),
    area("description", "Description"),
    status(),
    {
      name: "products", label: "Products in Collection", type: "variants", fullWidth: true,
      variantSchema: [
        { name: "product", label: "Product", type: "text", placeholder: "e.g. Gree 1.5 Ton Inverter AC" },
        { name: "sku", label: "SKU", type: "text" },
        { name: "category", label: "Category", type: "text" },
      ],
    },
  ],
  seed: [
    { id: "1", name: "Summer Cooling Sale", code: "COL-SUM-25", season: "Summer", theme: "Clearance", startDate: "2026-04-01", endDate: "2026-08-31", discount: 15, status: "Active",
      products: [
        { product: "Gree 1.5 Ton Inverter AC", sku: "AC-15-GRE", category: "Air Conditioners" },
        { product: "Haier 1 Ton Split AC", sku: "AC-10-HAI", category: "Air Conditioners" },
        { product: "Pedestal Fan 24\"", sku: "FAN-PED-24", category: "Fans" },
      ] },
    { id: "2", name: "Winter Warmth", code: "COL-WIN-25", season: "Winter", theme: "New Arrivals", startDate: "2026-11-01", endDate: "2027-02-28", discount: 10, status: "Active",
      products: [
        { product: "Gas Heater 3-Burner", sku: "HTR-GAS-03", category: "Heaters" },
        { product: "Electric Blanket Double", sku: "BLK-ELC-02", category: "Home" },
        { product: "Geyser 35 Gallon", sku: "GYS-35", category: "Geysers" },
      ] },
    { id: "3", name: "Eid Special Bundle", code: "COL-EID-26", season: "All Season", theme: "Eid Special", startDate: "2026-03-15", endDate: "2026-04-15", discount: 20, status: "Active",
      products: [
        { product: "Samsung LED TV 55 Inch", sku: "LED-55-SAM", category: "Televisions" },
        { product: "Haier Inverter Refrigerator", sku: "REF-INV-HAI", category: "Refrigerators" },
      ] },
    { id: "4", name: "Back to School", code: "COL-BTS-26", season: "Autumn", theme: "Back to School", startDate: "2026-08-01", endDate: "2026-09-15", discount: 12, status: "Inactive",
      products: [
        { product: "HP Laptop 15s", sku: "LPT-HP-15S", category: "Laptops" },
      ] },
  ],
};

export const installmentMatrixConfig: EntityPageProps<any> = {
  title: "Installment Matrix",
  description: "Pre-defined tenure × down-payment matrix mapping monthly EMI for each product/category.",
  storageKey: "qcrm.installment-matrix",
  withAvatar: { nameKey: "product", subKey: "category" },
  searchKeys: ["product", "category", "plan"],
  kpis: [
    { label: "Matrix Rows", icon: <CreditCard className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <CreditCard className="h-5 w-5" />),
    { label: "Avg Markup", icon: <TrendingUp className="h-5 w-5" />, tone: "primary", compute: (i) => i.length ? Math.round(i.reduce((s: number, x: any) => s + Number(x.markup || 0), 0) / i.length) + "%" : "0%" },
    { label: "Max Tenure", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => Math.max(0, ...i.map((x: any) => Number(x.tenure || 0))) + " mo" },
  ],
  columns: [
    { key: "product", header: "Product / Category" },
    { key: "plan", header: "Plan" },
    { key: "tenure", header: "Tenure (mo)" },
    { key: "downPayment", header: "Down Payment %", render: (i: any) => `${i.downPayment}%` },
    { key: "markup", header: "Markup %", render: (i: any) => `${i.markup}%` },
    { key: "price", header: "Cash Price", render: (i: any) => Rs(i.price) },
    { key: "monthly", header: "Monthly EMI", render: (i: any) => Rs(i.monthly) },
    { key: "total", header: "Total Payable", render: (i: any) => Rs(i.total) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    sel("scope", "Apply To", ["Product", "Category", "All"], { defaultValue: "Product", required: true }),
    text("product", "Product / Category Name", { required: true }),
    text("variant", "Variant Name (optional)", { placeholder: "Leave empty to apply to all variants" }),
    sel("category", "Category", ["Home Appliances", "Electronics", "Mobiles", "Furniture", "Motorcycles"]),
    sel("plan", "Pricing Plan", ["Standard 12M", "Standard 18M", "Standard 24M", "Easy 36M", "Express 6M"]),
    num("tenure", "Tenure (months)", { required: true, defaultValue: 12 }),
    num("downPayment", "Down Payment %", { defaultValue: 20 }),
    num("markup", "Markup %", { defaultValue: 18 }),
    num("price", "Cash Price (Rs.)", { required: true }),
    num("monthly", "Monthly EMI (Rs.)", { required: true }),
    num("total", "Total Payable (Rs.)"),
    num("processingFee", "Processing Fee (Rs.)", { defaultValue: 1500 }),
    sel("approval", "Approval Required", ["Yes", "No"], { defaultValue: "Yes" }),
    status(),
  ],
  seed: [
    { id: "1", product: "Gree 1.5 Ton Inverter AC", category: "Home Appliances", plan: "Standard 12M", tenure: 12, downPayment: 20, markup: 18, price: 168000, monthly: 14700, total: 176400, status: "Active" },
    { id: "2", product: "Gree 1.5 Ton Inverter AC", category: "Home Appliances", plan: "Standard 18M", tenure: 18, downPayment: 25, markup: 22, price: 168000, monthly: 11200, total: 201600, status: "Active" },
    { id: "3", product: "Samsung LED TV 55 Inch", category: "Electronics", plan: "Standard 12M", tenure: 12, downPayment: 20, markup: 18, price: 149999, monthly: 13150, total: 157800, status: "Active" },
    { id: "4", product: "Samsung LED TV 55 Inch", category: "Electronics", plan: "Easy 36M", tenure: 36, downPayment: 30, markup: 32, price: 149999, monthly: 5500, total: 198000, status: "Active" },
    { id: "5", product: "Haier Inverter Refrigerator", category: "Home Appliances", plan: "Standard 12M", tenure: 12, downPayment: 20, markup: 16, price: 121500, monthly: 10650, total: 127800, status: "Active" },
    { id: "6", product: "Honda CD 70", category: "Motorcycles", plan: "Standard 24M", tenure: 24, downPayment: 25, markup: 24, price: 165000, monthly: 8500, total: 204000, status: "Active" },
  ],
};

export const productsConfig: EntityPageProps<any> = {
  title: "Products",
  description: "Manage your product catalog, pricing & installment plans.",
  storageKey: "qcrm.products",
  addHref: "/catalog/products/new",
  editHref: (i: any) => `/catalog/products/${i.id}/edit`,
  searchKeys: ["name", "sku", "category", "brand", "season", "theme"],
  filters: [
    { key: "season", label: "Season", options: ["All Season", "Winter", "Summer", "Spring", "Autumn", "Monsoon"] },
    { key: "theme", label: "Theme", options: ["None", "Eid Special", "Ramadan", "Black Friday", "Clearance", "New Arrivals", "Wedding Season", "Back to School"] },
  ],
  kpis: [
    { label: "Total Products", hint: "All products in inventory", icon: <Package className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Variants", hint: "Total variants across all products", icon: <Layers className="h-5 w-5" />, tone: "primary", compute: (i) => i.reduce((s: number, p: any) => s + (Array.isArray(p.variants) ? p.variants.length : 0), 0) },
    { label: "Price Range", hint: "Min – Max variant price", icon: <TrendingUp className="h-5 w-5" />, tone: "success", compute: (i) => {
      const prices: number[] = [];
      i.forEach((p: any) => {
        if (Array.isArray(p.variants) && p.variants.length) p.variants.forEach((v: any) => { if (Number(v.price) > 0) prices.push(Number(v.price)); });
        else if (Number(p.retail) > 0) prices.push(Number(p.retail));
      });
      if (!prices.length) return "—";
      const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : `${n}`;
      return `Rs. ${fmt(Math.min(...prices))} – ${fmt(Math.max(...prices))}`;
    } },
    { label: "Out of Stock", hint: "Currently unavailable", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive", compute: (i) => i.filter((p: any) => {
      const vs = Array.isArray(p.variants) ? p.variants.reduce((s: number, v: any) => s + Number(v.stock || 0), 0) : Number(p.inventory || 0);
      return vs === 0;
    }).length },
  ],
  columns: [
    { key: "name", header: "Product", render: (i: any) => {
      const variantStock = Array.isArray(i.variants) ? i.variants.reduce((s: number, v: any) => s + Number(v.stock || 0), 0) : 0;
      const totalStock = i.hasVariants ? variantStock : Number(i.inventory || 0);
      const oos = totalStock === 0;
      return (
        <div className={`flex items-center gap-2.5 ${oos ? "opacity-60" : ""}`}>
          {i.image ? (
            <img src={i.image} alt={i.name} className="h-9 w-9 rounded-md object-cover border border-border shrink-0" />
          ) : (
            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {(i.name || "?").charAt(0).toUpperCase()}
            </div>
          )}
          <div className="flex flex-col min-w-0">
            <span className={`font-medium text-foreground ${oos ? "line-through" : ""}`}>{i.name}</span>
            <span className="text-[11px] text-muted-foreground">{i.category}</span>
            {oos && (
              <span className="mt-1 inline-flex w-fit items-center rounded-full bg-destructive/15 text-destructive text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide">
                Out of Stock
              </span>
            )}
          </div>
        </div>
      );
    } },
    { key: "brand", header: "Brand" },
    { key: "variantCount", header: "Variants", render: (i: any) => {
      const variants = Array.isArray(i.variants) ? i.variants : [];
      const count = variants.length;
      const stock = count ? variants.reduce((s: number, v: any) => s + Number(v.stock || 0), 0) : Number(i.inventory || 0);
      const oosVariants = count ? variants.filter((v: any) => Number(v.stock || 0) === 0).length : 0;
      const inStockVariants = count - oosVariants;
      const allOOS = count > 0 && inStockVariants === 0;

      // No variants: simple stock pill
      if (!i.hasVariants || count === 0) {
        return (
          <div className="flex flex-col gap-1">
            <span className={`inline-flex w-fit items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${
              stock === 0
                ? "border-destructive/30 bg-destructive/10 text-destructive"
                : stock <= 5
                ? "border-warning/30 bg-warning/10 text-warning"
                : "border-success/30 bg-success/10 text-success"
            }`}>
              <span className={`h-1.5 w-1.5 rounded-full ${stock === 0 ? "bg-destructive" : stock <= 5 ? "bg-warning" : "bg-success"}`} />
              {stock === 0 ? "Out of Stock" : `${stock} units`}
            </span>
            <span className="text-[10px] text-muted-foreground">No variants</span>
          </div>
        );
      }

      // Show up to 3 variant mini-chips with image + name + stock dot
      const visible = variants.slice(0, 3);
      const overflow = count - visible.length;

      return (
        <div className="flex flex-col gap-1.5 max-w-[260px]">
          {/* Summary row */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className={`inline-flex w-fit items-center gap-1 rounded-md text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 ${
              allOOS ? "bg-destructive/15 text-destructive" : "bg-primary/10 text-primary"
            }`}>
              <Layers className="h-2.5 w-2.5" />
              {count} variant{count > 1 ? "s" : ""}
            </span>
            {allOOS ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-destructive/15 text-destructive text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-destructive" /> All OOS
              </span>
            ) : oosVariants > 0 ? (
              <span className="inline-flex items-center gap-1 rounded-md bg-warning/15 text-warning text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                {oosVariants} OOS · {inStockVariants} live
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 rounded-md bg-success/15 text-success text-[10px] font-bold px-1.5 py-0.5 uppercase tracking-wide">
                <span className="h-1.5 w-1.5 rounded-full bg-success" /> {stock} in stock
              </span>
            )}
          </div>

          {/* Variant chips */}
          <div className="flex flex-wrap gap-1">
            {visible.map((v: any, idx: number) => {
              const vStock = Number(v.stock || 0);
              const oos = vStock === 0;
              const name = v.name || v.variant || `V${idx + 1}`;
              return (
                <span
                  key={idx}
                  title={`${name} · ${oos ? "Out of stock" : `${vStock} units`}`}
                  className={`inline-flex items-center gap-1 rounded-full border pl-0.5 pr-1.5 py-0.5 text-[10px] font-semibold ${
                    oos
                      ? "border-destructive/30 bg-destructive/10 text-destructive line-through opacity-70"
                      : vStock <= 2
                      ? "border-warning/30 bg-warning/10 text-warning"
                      : "border-border bg-background text-foreground"
                  }`}
                >
                  {v.image ? (
                    <img src={v.image} alt="" className="h-3.5 w-3.5 rounded-full object-cover" />
                  ) : (
                    <span className="h-3.5 w-3.5 rounded-full bg-muted text-[8px] font-bold text-muted-foreground flex items-center justify-center">
                      {name.charAt(0).toUpperCase()}
                    </span>
                  )}
                  <span className="max-w-[80px] truncate">{name}</span>
                  <span className={`ml-0.5 text-[9px] font-bold ${oos ? "" : "text-muted-foreground"}`}>
                    {oos ? "0" : vStock}
                  </span>
                </span>
              );
            })}
            {overflow > 0 && (
              <span className="inline-flex items-center rounded-full border border-border bg-muted px-2 py-0.5 text-[10px] font-bold text-muted-foreground">
                +{overflow} more
              </span>
            )}
          </div>
        </div>
      );
    } },
    { key: "priceRange", header: "Price Range", render: (i: any) => {
      const prices: number[] = [];
      if (Array.isArray(i.variants) && i.variants.length) {
        i.variants.forEach((v: any) => { if (Number(v.price) > 0) prices.push(Number(v.price)); });
      }
      if (!prices.length && Number(i.retail) > 0) prices.push(Number(i.retail));
      if (!prices.length) return <span className="text-xs text-muted-foreground">—</span>;
      const fmt = (n: number) => n >= 100000 ? `${(n/100000).toFixed(1)}L` : n >= 1000 ? `${(n/1000).toFixed(0)}K` : `${n}`;
      const min = Math.min(...prices), max = Math.max(...prices);
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-foreground text-sm">
            {min === max ? `Rs. ${fmt(min)}` : `Rs. ${fmt(min)} – ${fmt(max)}`}
          </span>
          <span className="text-[10px] text-muted-foreground">Cash price</span>
        </div>
      );
    } },
    { key: "emiFrom", header: "EMI Starts From", render: (i: any) => {
      const r = Number(i.rental || 0);
      if (!r) return <span className="text-xs text-muted-foreground">— <span className="opacity-60">No plan</span></span>;
      return (
        <div className="flex flex-col">
          <span className="font-semibold text-success text-sm">Rs. {r.toLocaleString()}</span>
          <span className="text-[10px] text-muted-foreground">per month</span>
        </div>
      );
    } },
    { key: "feature", header: "Feature", render: (i: any) => {
      const tags: { label: string; cls: string }[] = [];
      if (i.season && i.season !== "All Season") {
        const map: Record<string, string> = {
          Winter: "bg-sky-500/15 text-sky-600 border-sky-500/30",
          Summer: "bg-amber-500/15 text-amber-600 border-amber-500/30",
          Spring: "bg-emerald-500/15 text-emerald-600 border-emerald-500/30",
          Autumn: "bg-orange-500/15 text-orange-600 border-orange-500/30",
          Monsoon: "bg-indigo-500/15 text-indigo-600 border-indigo-500/30",
        };
        tags.push({ label: i.season, cls: map[i.season] || "bg-muted text-foreground border-border" });
      }
      if (i.theme && i.theme !== "None") {
        tags.push({ label: i.theme, cls: "bg-primary/10 text-primary border-primary/30" });
      }
      if (!tags.length) return <span className="text-xs text-muted-foreground">—</span>;
      return (
        <div className="flex flex-wrap gap-1 max-w-[180px]">
          {tags.map((t, idx) => (
            <span key={idx} className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide ${t.cls}`}>
              {t.label}
            </span>
          ))}
        </div>
      );
    } },
    { key: "status", header: "Status", render: (i: any) => {
      const variantStock = Array.isArray(i.variants) ? i.variants.reduce((s: number, v: any) => s + Number(v.stock || 0), 0) : 0;
      const totalStock = i.hasVariants ? variantStock : Number(i.inventory || 0);
      if (totalStock === 0) {
        return (
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/15 text-destructive text-[10px] font-bold px-2 py-1 uppercase tracking-wide">
            <span className="h-1.5 w-1.5 rounded-full bg-destructive" />
            Out of Stock
          </span>
        );
      }
      return STATUS_BADGE(i.status);
    } },
  ],
  fields: [
    text("name", "Product Name", { required: true }),
    text("sku", "SKU / Barcode", { required: true }),
    text("image", "Image URL", { placeholder: "https://..." }),
    sel("category", "Category", ["Home Appliances", "Electronics", "Mobiles", "Furniture", "Motorcycles"], { required: true }),
    sel("brand", "Brand", ["Samsung", "Gree", "Haier", "Dawlance", "Sony", "Honda"], { required: true }),
    num("retail", "Retail Price (Rs.)", { required: true }),
    num("rental", "Installment Price (Rs. / month)"),
    num("cost", "Cost Price (Rs.)"),
    num("inventory", "Opening Stock", { defaultValue: 0 }),
    num("reorder", "Reorder Level", { defaultValue: 5 }),
    text("warranty", "Warranty (months)"),
    status(),
    { name: "hasVariants", label: "This product has variants (size / color / model)", type: "checkbox", defaultValue: false },
    {
      name: "variants", label: "Variants", type: "variants", showWhen: { field: "hasVariants", equals: true },
      variantSchema: [
        { name: "name", label: "Variant Name", type: "text", placeholder: "e.g. 1.5 Ton — White" },
        { name: "sku", label: "SKU", type: "text", placeholder: "e.g. AC-15-WHT" },
        { name: "image", label: "Image URL", type: "text", placeholder: "https://..." },
        { name: "price", label: "Price (Rs.)", type: "number" },
        { name: "stock", label: "Stock", type: "number" },
      ],
    },
  ],
  expandable: {
    canExpand: (i: any) => i.hasVariants && Array.isArray(i.variants) && i.variants.length > 0,
    render: (i: any) => {
      const variants = (i.variants as any[]) || [];
      const totalStock = variants.reduce((s, v) => s + Number(v.stock || 0), 0);
      const oosCount = variants.filter((v) => Number(v.stock || 0) === 0).length;
      const productEmi = Number(i.rental || 0);
      return (
        <div className="space-y-2">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <div className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-2">
              <Layers className="h-3.5 w-3.5 text-primary" />
              Variants of <span className="text-foreground">{i.name}</span>
            </div>
            <div className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-wider">
              <span className="inline-flex items-center gap-1 rounded-md bg-primary/10 text-primary px-1.5 py-0.5">
                {variants.length} total
              </span>
              <span className="inline-flex items-center gap-1 rounded-md bg-success/10 text-success px-1.5 py-0.5">
                {totalStock} units
              </span>
              {oosCount > 0 && (
                <span className="inline-flex items-center gap-1 rounded-md bg-destructive/10 text-destructive px-1.5 py-0.5">
                  {oosCount} OOS
                </span>
              )}
            </div>
          </div>
          <div className="overflow-hidden rounded-lg border border-border bg-card shadow-sm">
            <table className="w-full text-sm">
              <thead className="bg-muted/40 text-[10px] uppercase tracking-wider font-bold text-muted-foreground">
                <tr>
                  <th className="text-left px-3 py-2">Variant</th>
                  <th className="text-left px-3 py-2">Spec / SKU</th>
                  <th className="text-right px-3 py-2">Cash Price</th>
                  <th className="text-right px-3 py-2">Installment</th>
                  <th className="text-center px-3 py-2">Stock</th>
                  <th className="text-center px-3 py-2">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {variants.map((v, k) => {
                  const stock = Number(v.stock || 0);
                  const oos = stock === 0;
                  const low = stock > 0 && stock <= 2;
                  const price = Number(v.price || i.retail || 0);
                  // Pro-rate product EMI by variant price ratio (approx) when no per-variant EMI
                  const baseRetail = Number(i.retail || 0);
                  const emi = v.rental
                    ? Number(v.rental)
                    : productEmi && baseRetail > 0
                    ? Math.ceil(((productEmi * price) / baseRetail) / 10) * 10
                    : 0;
                  // Spec extracted from name after dash, fallback to brand
                  const spec = (v.name || "").includes("—") ? (v.name || "").split("—").slice(1).join("—").trim() : (v.spec || i.brand || "—");
                  return (
                    <tr key={k} className={oos ? "opacity-70 bg-destructive/[0.03]" : "hover:bg-muted/30"}>
                      <td className="px-3 py-2">
                        <div className="flex items-center gap-2">
                          {v.image ? (
                            <img src={v.image} alt={v.name} className="h-9 w-9 rounded-md object-cover border border-border" />
                          ) : (
                            <div className="h-9 w-9 rounded-md bg-gradient-to-br from-primary/20 to-primary/5 text-primary flex items-center justify-center font-bold text-xs">
                              {(v.name || "?").charAt(0).toUpperCase()}
                            </div>
                          )}
                          <div className="flex flex-col min-w-0">
                            <span className={`font-bold text-foreground text-sm ${oos ? "line-through" : ""}`}>{(v.name || "").split("—")[0].trim() || v.name}</span>
                            <span className="text-[11px] font-semibold text-muted-foreground/90 uppercase tracking-wide">{i.brand}</span>
                          </div>
                        </div>
                      </td>
                      <td className="px-3 py-2">
                        <div className="flex flex-col">
                          <span className="text-xs text-foreground font-medium">{spec}</span>
                          <span className="text-[10px] text-muted-foreground font-mono">{v.sku || "—"}</span>
                        </div>
                      </td>
                      <td className="px-3 py-2 text-right">
                        <span className="font-bold text-foreground text-sm">{Rs(price)}</span>
                      </td>
                      <td className="px-3 py-2 text-right">
                        {emi > 0 ? (
                          <div className="flex flex-col items-end">
                            <span className="font-bold text-primary text-sm">{Rs(emi)}</span>
                            <span className="text-[9px] text-muted-foreground uppercase tracking-wider">per month</span>
                          </div>
                        ) : (
                          <span className="text-[10px] text-muted-foreground">No plan</span>
                        )}
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center gap-1 rounded-md text-[11px] font-bold px-2 py-0.5 ${
                          oos ? "bg-destructive/15 text-destructive" : low ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${oos ? "bg-destructive" : low ? "bg-warning" : "bg-success"}`} />
                          {stock}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-center">
                        <span className={`inline-flex items-center rounded-full text-[10px] font-bold px-2 py-0.5 uppercase tracking-wide ${
                          oos ? "bg-destructive/15 text-destructive" : low ? "bg-warning/15 text-warning" : "bg-success/15 text-success"
                        }`}>
                          {oos ? "Out of Stock" : low ? "Low Stock" : "In Stock"}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      );
    },
  },
  seed: [
    { id: "1", name: "Gree 1.5 Ton Inverter AC", sku: "AC-15-GRE", category: "Home Appliances", brand: "Gree", retail: 168000, rental: 5200, cost: 145000, inventory: 6, reorder: 5, status: "Active",
      hasVariants: true, variants: [
        { name: "1.5 Ton — White", sku: "AC-15-GRE-WHT", price: 168000, stock: 4 },
        { name: "1.5 Ton — Black", sku: "AC-15-GRE-BLK", price: 172000, stock: 2 },
      ] },
    { id: "2", name: "Samsung LED TV 55 Inch", sku: "LED-55-SAM", category: "Electronics", brand: "Samsung", retail: 149999, rental: 4500, cost: 130000, inventory: 8, reorder: 5, status: "Active" },
    { id: "3", name: "Haier Inverter Refrigerator", sku: "REF-INV-HAI", category: "Home Appliances", brand: "Haier", retail: 121500, rental: 3600, cost: 105000, inventory: 5, reorder: 5, status: "Active", season: "Summer", theme: "New Arrivals",
      hasVariants: true, variants: [
        { name: "11 CFT — Silver", spec: "11 Cubic Feet · Silver", sku: "REF-11-HAI-SIL", price: 121500, stock: 3 },
        { name: "13 CFT — Silver", spec: "13 Cubic Feet · Silver", sku: "REF-13-HAI-SIL", price: 138000, stock: 2 },
        { name: "13 CFT — Black", spec: "13 Cubic Feet · Black", sku: "REF-13-HAI-BLK", price: 142000, stock: 0 },
      ] },
  ],
  extraRowActions: (item: any, close: () => void) => (
    <ProductMatrixMenuAction productName={item.name} productPrice={Number(item.retail || 0)} close={close} />
  ),
};

export const pricingPlansConfig: EntityPageProps<any> = {
  title: "Pricing Plans",
  description: "Configure tenure, markup, fees and penalty rules.",
  storageKey: "qcrm.pricing",
  searchKeys: ["name", "applicable"],
  kpis: [
    { label: "Total Plans", icon: <CreditCard className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <CreditCard className="h-5 w-5" />),
    { label: "Max Tenure", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => Math.max(0, ...i.map((x: any) => Number(x.tenure || 0))) + " mo" },
    { label: "Avg Rental Rate", icon: <TrendingUp className="h-5 w-5" />, tone: "primary", compute: (i) => i.length ? Math.round(i.reduce((s: number, x: any) => s + Number(x.markup || 0), 0) / i.length) + "%" : "0%" },
  ],
  columns: [
    { key: "name", header: "Plan", render: (i: any) => {
      const tenureBand = Number(i.tenure || 0);
      const tone = tenureBand <= 6 ? { bg: "from-emerald-500/15 to-emerald-500/5", ic: "text-emerald-600" }
        : tenureBand <= 12 ? { bg: "from-primary/15 to-primary/5", ic: "text-primary" }
        : { bg: "from-purple-500/15 to-purple-500/5", ic: "text-purple-600" };
      return (
        <div className="flex items-center gap-3 min-w-[200px]">
          <div className={`h-10 w-10 rounded-xl bg-gradient-to-br ${tone.bg} grid place-items-center shrink-0 border border-border/50`}>
            <CreditCard className={`h-4 w-4 ${tone.ic}`} />
          </div>
          <div className="min-w-0">
            <div className="font-bold text-foreground text-sm">{i.name}</div>
            <div className="text-[11px] text-muted-foreground font-medium">{i.applicable || "All Products"}</div>
          </div>
        </div>
      );
    } },
    { key: "tenure", header: "Tenure", render: (i: any) => (
      <span className="inline-flex items-center rounded px-2 py-0.5 bg-muted text-muted-foreground text-xs font-medium tabular-nums">
        {i.tenure} mo
      </span>
    ) },
    { key: "downPayment", header: "Down Payment", render: (i: any) => (
      <div className="flex flex-col">
        <span className="text-sm font-semibold text-foreground tabular-nums">
          {i.downType === "%" ? `${i.downPayment}%` : Rs(i.downPayment)}
        </span>
        <span className="text-[10px] font-medium uppercase tracking-tighter text-muted-foreground">
          {i.downType === "%" ? "Of cash price" : "Fixed"}
        </span>
      </div>
    ) },
    { key: "markup", header: "Rental Rate", render: (i: any) => (
      <span className="text-sm font-semibold text-foreground tabular-nums">{Number(i.markup).toFixed(2)}%</span>
    ) },
    { key: "products", header: "Products", render: (i: any) => (
      <div className="flex items-center gap-1.5 text-muted-foreground">
        <Package className="h-3.5 w-3.5 opacity-40" strokeWidth={2} />
        <span className="text-sm tabular-nums">{Number(i.products || 0)}</span>
      </div>
    ) },
    { key: "activeContracts", header: "Active Contracts", render: (i: any) => (
      <span className="text-sm font-medium text-foreground/80 tabular-nums">{Number(i.activeContracts || 0)}</span>
    ) },


    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Plan Name", { required: true }),
    sel("applicable", "Applies To", ["All Products", "Home Appliances", "Electronics", "Mobiles", "Motorcycles"]),
    num("tenure", "Tenure (months)", { required: true, defaultValue: 12 }),
    sel("downType", "Down Payment Type", ["Fixed", "%"], { defaultValue: "%" }),
    num("downPayment", "Down Payment Value", { defaultValue: 20 }),
    num("markup", "Rental Rate %", { defaultValue: 18 }),
    num("fee", "Processing Fee (Rs.)", { defaultValue: 1500 }),
    num("penalty", "Penalty per Day (Rs.)", { defaultValue: 100 }),
    num("graceDays", "Grace Days", { defaultValue: 3 }),
    sel("guarantor", "Guarantor Required", ["Yes", "No"], { defaultValue: "Yes" }),
    sel("approval", "Approval Required", ["Yes", "No"], { defaultValue: "Yes" }),
    status(),
  ],
  seed: [
    { id: "1", name: "6 Month Standard", applicable: "All Products", tenure: 6, downType: "%", downPayment: 30, markup: 12, fee: 1500, penalty: 100, graceDays: 3, guarantor: "Yes", approval: "Yes", products: 124, activeContracts: 38, status: "Active" },
    { id: "2", name: "12 Month Easy", applicable: "Home Appliances", tenure: 12, downType: "%", downPayment: 20, markup: 18, fee: 2500, penalty: 150, graceDays: 5, guarantor: "Yes", approval: "Yes", products: 76, activeContracts: 152, status: "Active" },
    { id: "3", name: "24 Month Premium", applicable: "Motorcycles", tenure: 24, downType: "%", downPayment: 25, markup: 28, fee: 5000, penalty: 200, graceDays: 7, guarantor: "Yes", approval: "Yes", products: 18, activeContracts: 64, status: "Active" },
  ],
  extraRowActions: (item: any, close: () => void) => (
    <PlanLinkedItemsAction plan={item} close={close} />
  ),
};

// ============ INVENTORY ============

export const stockConfig: EntityPageProps<any> = {
  title: "Stock List",
  description: "Branch and warehouse stock at a glance.",
  storageKey: "qcrm.stock",
  withAvatar: { nameKey: "product", subKey: "sku" },
  searchKeys: ["product", "sku", "branch"],
  kpis: [
    { label: "SKUs Tracked", icon: <Boxes className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total Units", icon: <Boxes className="h-5 w-5" />, tone: "success", compute: (i) => i.reduce((s: number, x: any) => s + Number(x.qty || 0), 0) },
    { label: "Low Stock", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => Number(x.qty) > 0 && Number(x.qty) <= 5).length },
    { label: "Stock Value", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.qty || 0) * Number(x.cost || 0), 0)) },
  ],
  columns: [
    { key: "product", header: "Product" },
    { key: "branch", header: "Branch" },
    { key: "qty", header: "Quantity" },
    { key: "cost", header: "Unit Cost", render: (i: any) => Rs(i.cost) },
    { key: "value", header: "Stock Value", render: (i: any) => Rs(Number(i.qty) * Number(i.cost)) },
    { key: "rack", header: "Rack" },
  ],
  fields: [
    text("product", "Product", { required: true }),
    text("sku", "SKU", { required: true }),
    sel("branch", "Branch", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Main Warehouse"]),
    num("qty", "Quantity", { required: true, defaultValue: 0 }),
    num("cost", "Unit Cost (Rs.)"),
    text("rack", "Rack / Shelf"),
  ],
  seed: [
    { id: "1", product: "Gree 1.5 Ton Inverter AC", sku: "AC-15-GRE", branch: "Model Town", qty: 6, cost: 145000, rack: "A-01" },
    { id: "2", product: "Samsung LED TV 55 Inch", sku: "LED-55-SAM", branch: "Gulberg", qty: 8, cost: 130000, rack: "B-04" },
    { id: "3", product: "Haier Inverter Refrigerator", sku: "REF-INV-HAI", branch: "Main Warehouse", qty: 5, cost: 105000, rack: "C-12" },
  ],
};

export const transfersConfig: EntityPageProps<any> = {
  title: "Stock Transfers",
  description: "Move stock between branches and warehouses.",
  storageKey: "qcrm.transfers",
  withAvatar: { nameKey: "ref", subKey: "date" },
  searchKeys: ["ref", "from", "to", "product"],
  kpis: [
    { label: "Total Transfers", icon: <ArrowLeftRight className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Pending", "Pending", "warning", <ArrowLeftRight className="h-5 w-5" />),
    STATUS_KPI("Received", "Received", "success", <ArrowLeftRight className="h-5 w-5" />),
    { label: "Units Moved", icon: <Boxes className="h-5 w-5" />, tone: "primary", compute: (i) => i.reduce((s: number, x: any) => s + Number(x.qty || 0), 0) },
  ],
  columns: [
    { key: "ref", header: "Reference" },
    { key: "date", header: "Date" },
    { key: "from", header: "From" },
    { key: "to", header: "To" },
    { key: "product", header: "Product" },
    { key: "qty", header: "Qty" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Reference #", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    sel("from", "From", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Main Warehouse"], { required: true }),
    sel("to", "To", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Main Warehouse"], { required: true }),
    text("product", "Product", { required: true }),
    num("qty", "Quantity", { required: true }),
    sel("status", "Status", ["Pending", "Received", "Cancelled"], { defaultValue: "Pending" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "TRF-1001", date: "2026-05-04", from: "Main Warehouse", to: "Model Town", product: "Samsung LED TV 55", qty: 4, status: "Received" },
    { id: "2", ref: "TRF-1002", date: "2026-05-06", from: "Main Warehouse", to: "Gulberg", product: "Gree 1.5 Ton AC", qty: 2, status: "Pending" },
  ],
};

export const serialsConfig: EntityPageProps<any> = {
  title: "Serial / IMEI Tracking",
  description: "Track every serialized item across its lifecycle.",
  storageKey: "qcrm.serials",
  withAvatar: { nameKey: "product", subKey: "serial" },
  searchKeys: ["serial", "product", "customer", "branch"],
  kpis: [
    { label: "Serials Tracked", icon: <Barcode className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("In Stock", "In Stock", "success", <Barcode className="h-5 w-5" />),
    STATUS_KPI("Sold", "Sold", "primary", <Barcode className="h-5 w-5" />),
    STATUS_KPI("Repossessed", "Repossessed", "warning", <Barcode className="h-5 w-5" />),
  ],
  columns: [
    { key: "product", header: "Product" },
    { key: "branch", header: "Branch" },
    { key: "customer", header: "Customer" },
    { key: "saleDate", header: "Sale Date" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("serial", "Serial / IMEI", { required: true }),
    text("product", "Product", { required: true }),
    sel("branch", "Branch", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Main Warehouse"]),
    text("customer", "Customer (if sold)"),
    { name: "saleDate", label: "Sale Date", type: "date" },
    sel("status", "Status", ["In Stock", "Sold", "Repossessed", "Damaged", "Returned"], { defaultValue: "In Stock" }),
  ],
  seed: [
    { id: "1", serial: "356789012345671", product: "Samsung LED TV 55", branch: "Model Town", customer: "—", saleDate: "", status: "In Stock" },
    { id: "2", serial: "GRE-AC-998812", product: "Gree 1.5 Ton AC", branch: "Gulberg", customer: "Imran Ali", saleDate: "2026-04-22", status: "Sold" },
  ],
};

export const gatePassConfig: EntityPageProps<any> = {
  title: "Gate Pass",
  description: "Issue and verify gate passes for goods movement.",
  storageKey: "qcrm.gatepass.v2",
  withAvatar: { nameKey: "ref", subKey: "type" },
  searchKeys: ["ref", "party", "vehicle"],
  kpis: [
    { label: "Total Passes", icon: <FileText className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Outward", icon: <FileText className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.type === "Outward").length },
    { label: "Inward", icon: <FileText className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.type === "Inward").length },
    STATUS_KPI("Pending", "Pending", "warning", <FileText className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Pass #" },
    { key: "type", header: "Type" },
    { key: "party", header: "Party" },
    { key: "vehicle", header: "Vehicle" },
    { key: "driver", header: "Driver" },
    { key: "date", header: "Date" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Pass #", { required: true }),
    sel("type", "Type", ["Outward", "Inward", "Returnable", "Non-Returnable"], { required: true }),
    text("party", "Party Name"),
    text("vehicle", "Vehicle #"),
    text("driver", "Driver Name"),
    text("driverCnic", "Driver CNIC"),
    { name: "date", label: "Date", type: "date" },
    area("purpose", "Purpose"),
    sel("status", "Status", ["Pending", "Approved", "Closed"], { defaultValue: "Pending" }),
  ],
  seed: [
    { id: "1", ref: "GP-2001", type: "Outward", party: "Imran Ali (DEL-9001)", vehicle: "LEH-1234", driver: "Asif Khan", date: TODAY_ISO(), status: "Closed" },
    { id: "2", ref: "GP-2002", type: "Outward", party: "Sara Khan (DEL-9002)", vehicle: "LES-5621", driver: "Bilal Hussain", date: TODAY_ISO(), status: "Approved" },
    { id: "3", ref: "GP-2003", type: "Outward", party: "Ali Raza (DEL-9003)", vehicle: "LEH-1234", driver: "Asif Khan", date: ADD_DAYS(1), status: "Pending" },
    { id: "4", ref: "GP-2005", type: "Outward", party: "Adnan Pervaiz (DEL-9005)", vehicle: "KHI-8899", driver: "Tariq Mahmood", date: ADD_DAYS(2), status: "Pending" },
    { id: "5", ref: "GP-2006", type: "Outward", party: "Fatima Noor (DEL-9006)", vehicle: "LEB-2245", driver: "Naveed Akhtar", date: ADD_DAYS(-1), status: "Closed" },
    { id: "6", ref: "GP-2007", type: "Outward", party: "Bilal Khan (DEL-9007)", vehicle: "LES-5621", driver: "Bilal Hussain", date: TODAY_ISO(), status: "Approved" },
  ],
};

export const warehousesConfig: EntityPageProps<any> = {
  title: "Warehouses",
  description: "Branches and warehouses with capacity, in-charge and contact info.",
  storageKey: "qcrm.warehouses",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "city", "incharge"],
  kpis: [
    { label: "Total Warehouses", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Building2 className="h-5 w-5" />),
    { label: "Total Capacity", icon: <Boxes className="h-5 w-5" />, tone: "primary", compute: (i) => i.reduce((s: number, x: any) => s + Number(x.capacity || 0), 0).toLocaleString() + " units" },
    { label: "Cities Covered", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.city)).size },
  ],
  columns: [
    { key: "name", header: "Warehouse" },
    { key: "code", header: "Code" },
    { key: "city", header: "City" },
    { key: "type", header: "Type" },
    { key: "incharge", header: "In-charge" },
    { key: "capacity", header: "Capacity" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Warehouse Name", { required: true }),
    text("code", "Code", { required: true }),
    sel("type", "Type", ["Main Warehouse", "Branch Store", "Transit Hub", "Cold Storage"], { defaultValue: "Branch Store" }),
    text("city", "City"),
    text("incharge", "In-charge"),
    text("phone", "Contact Phone"),
    num("capacity", "Capacity (units)"),
    area("address", "Address"),
    status(),
  ],
  seed: [
    { id: "1", name: "Main Warehouse", code: "WH-MAIN", type: "Main Warehouse", city: "Lahore", incharge: "Tariq Mehmood", phone: "+92 300 1112233", capacity: 5000, status: "Active" },
    { id: "2", name: "Model Town Store", code: "WH-MT", type: "Branch Store", city: "Lahore", incharge: "Ahsan Iqbal", phone: "+92 300 4445566", capacity: 800, status: "Active" },
    { id: "3", name: "Gulberg Outlet", code: "WH-GB", type: "Branch Store", city: "Lahore", incharge: "Sana Khan", phone: "+92 300 7778899", capacity: 600, status: "Active" },
    { id: "4", name: "Karachi Transit Hub", code: "WH-KHI", type: "Transit Hub", city: "Karachi", incharge: "Bilal Ahmad", phone: "+92 321 1234567", capacity: 2000, status: "Active" },
  ],
};

export const openingStockConfig: EntityPageProps<any> = {
  title: "Opening Stock",
  description: "Initial stock balances entered for products at the start of a period.",
  storageKey: "qcrm.opening-stock",
  withAvatar: { nameKey: "product", subKey: "sku" },
  searchKeys: ["product", "sku", "warehouse"],
  kpis: [
    { label: "Total Entries", icon: <Boxes className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total Units", icon: <Boxes className="h-5 w-5" />, tone: "success", compute: (i) => i.reduce((s: number, x: any) => s + Number(x.qty || 0), 0) },
    { label: "Opening Value", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.qty || 0) * Number(x.cost || 0), 0)) },
    { label: "Warehouses", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.warehouse)).size },
  ],
  columns: [
    { key: "product", header: "Product" },
    { key: "sku", header: "SKU" },
    { key: "warehouse", header: "Warehouse" },
    { key: "date", header: "As of Date" },
    { key: "qty", header: "Quantity" },
    { key: "cost", header: "Unit Cost", render: (i: any) => Rs(i.cost) },
    { key: "value", header: "Value", render: (i: any) => Rs(Number(i.qty) * Number(i.cost)) },
  ],
  fields: [
    text("product", "Product", { required: true }),
    text("sku", "SKU", { required: true }),
    sel("warehouse", "Warehouse", ["Main Warehouse", "Model Town Store", "Gulberg Outlet", "Karachi Transit Hub"], { required: true }),
    { name: "date", label: "As of Date", type: "date", required: true },
    num("qty", "Opening Quantity", { required: true, defaultValue: 0 }),
    num("cost", "Unit Cost (Rs.)"),
    area("notes", "Notes"),
  ],
  // Per-save behavior for the `qty` column. The toggle in the header writes
  // `qcrm.opening-stock.save-mode` and we honor it here:
  //   - "overwrite" (default): qty replaces the previous value
  //   - "delta": entered qty is added to the existing record's qty (edit only;
  //     creates always store the entered value as-is)
  transformOnSave: (values, existing) => {
    if (!existing) return values;
    const mode = getOpeningSaveMode();
    if (mode !== "delta") return values;
    const prev = Number(existing.qty || 0);
    const delta = Number(values.qty || 0);
    return { ...values, qty: prev + delta };
  },
  seed: [
    { id: "1", product: "Gree 1.5 Ton Inverter AC", sku: "AC-15-GRE", warehouse: "Main Warehouse", date: "2026-01-01", qty: 25, cost: 145000 },
    { id: "2", product: "Samsung LED TV 55 Inch", sku: "LED-55-SAM", warehouse: "Main Warehouse", date: "2026-01-01", qty: 18, cost: 130000 },
    { id: "3", product: "Haier Inverter Refrigerator", sku: "REF-INV-HAI", warehouse: "Model Town Store", date: "2026-01-01", qty: 12, cost: 105000 },
    { id: "4", product: "Samsung Galaxy A55", sku: "MOB-A55", warehouse: "Gulberg Outlet", date: "2026-01-01", qty: 30, cost: 102000 },
  ],
};

export const stockAdjustmentConfig: EntityPageProps<any> = {
  title: "Stock Adjustment",
  description: "Increase or decrease stock with a reason — shrinkage, found, correction.",
  storageKey: "qcrm.stock-adjustments",
  withAvatar: { nameKey: "ref", subKey: "product" },
  searchKeys: ["ref", "product", "warehouse", "reason"],
  kpis: [
    { label: "Total Adjustments", icon: <ArrowLeftRight className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Increase", icon: <TrendingUp className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.type === "Increase").reduce((s: number, x: any) => s + Number(x.qty || 0), 0) },
    { label: "Decrease", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.type === "Decrease").reduce((s: number, x: any) => s + Number(x.qty || 0), 0) },
    STATUS_KPI("Approved", "Approved", "success", <ClipboardCheck className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Adj #" },
    { key: "date", header: "Date" },
    { key: "product", header: "Product" },
    { key: "warehouse", header: "Warehouse" },
    { key: "type", header: "Type" },
    { key: "qty", header: "Qty" },
    { key: "reason", header: "Reason" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Adjustment #", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    text("product", "Product", { required: true }),
    sel("warehouse", "Warehouse", ["Main Warehouse", "Model Town Store", "Gulberg Outlet", "Karachi Transit Hub"], { required: true }),
    sel("type", "Adjustment Type", ["Increase", "Decrease"], { required: true, defaultValue: "Decrease" }),
    num("qty", "Quantity", { required: true }),
    sel("reason", "Reason", ["Shrinkage", "Found Stock", "Counting Error", "Damage", "Theft", "Expired", "Other"], { defaultValue: "Counting Error" }),
    sel("status", "Status", ["Pending", "Approved", "Rejected"], { defaultValue: "Pending" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "ADJ-1001", date: "2026-05-04", product: "Samsung Galaxy A55", warehouse: "Gulberg Outlet", type: "Decrease", qty: 1, reason: "Theft", status: "Approved" },
    { id: "2", ref: "ADJ-1002", date: "2026-05-05", product: "Gree 1.5 Ton AC", warehouse: "Main Warehouse", type: "Increase", qty: 2, reason: "Found Stock", status: "Approved" },
    { id: "3", ref: "ADJ-1003", date: "2026-05-07", product: "Haier Refrigerator", warehouse: "Model Town Store", type: "Decrease", qty: 1, reason: "Damage", status: "Pending" },
  ],
};

export const physicalAuditConfig: EntityPageProps<any> = {
  title: "Physical Audit",
  description: "Periodic physical stock count vs system stock with variance tracking.",
  storageKey: "qcrm.audits",
  withAvatar: { nameKey: "ref", subKey: "warehouse" },
  searchKeys: ["ref", "warehouse", "auditor"],
  kpis: [
    { label: "Total Audits", icon: <ClipboardCheck className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("In Progress", "In Progress", "warning", <Clock className="h-5 w-5" />),
    STATUS_KPI("Completed", "Completed", "success", <ClipboardCheck className="h-5 w-5" />),
    { label: "Total Variance", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.reduce((s: number, x: any) => s + Math.abs(Number(x.variance || 0)), 0) },
  ],
  columns: [
    { key: "ref", header: "Audit #" },
    { key: "date", header: "Date" },
    { key: "warehouse", header: "Warehouse" },
    { key: "auditor", header: "Auditor" },
    { key: "skuCount", header: "SKUs Counted" },
    { key: "system", header: "System Qty" },
    { key: "physical", header: "Physical Qty" },
    { key: "variance", header: "Variance" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Audit #", { required: true }),
    { name: "date", label: "Audit Date", type: "date", required: true },
    sel("warehouse", "Warehouse", ["Main Warehouse", "Model Town Store", "Gulberg Outlet", "Karachi Transit Hub"], { required: true }),
    text("auditor", "Auditor Name"),
    num("skuCount", "SKUs Counted"),
    num("system", "System Quantity"),
    num("physical", "Physical Quantity"),
    num("variance", "Variance (+/-)"),
    sel("status", "Status", ["Scheduled", "In Progress", "Completed", "Cancelled"], { defaultValue: "Scheduled" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "AUD-2001", date: "2026-04-30", warehouse: "Main Warehouse", auditor: "Tariq Mehmood", skuCount: 145, system: 1280, physical: 1276, variance: -4, status: "Completed" },
    { id: "2", ref: "AUD-2002", date: "2026-05-06", warehouse: "Gulberg Outlet", auditor: "Sana Khan", skuCount: 78, system: 420, physical: 418, variance: -2, status: "In Progress" },
  ],
};

export const damagedStockConfig: EntityPageProps<any> = {
  title: "Damaged Stock",
  description: "Track damaged, defective and write-off stock with disposal status.",
  storageKey: "qcrm.damaged-stock",
  withAvatar: { nameKey: "product", subKey: "sku" },
  searchKeys: ["product", "sku", "warehouse", "reason"],
  kpis: [
    { label: "Total Items", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive", compute: (i) => i.length },
    { label: "Damaged Units", icon: <Boxes className="h-5 w-5" />, tone: "warning", compute: (i) => i.reduce((s: number, x: any) => s + Number(x.qty || 0), 0) },
    { label: "Loss Value", icon: <Wallet className="h-5 w-5" />, tone: "destructive", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.qty || 0) * Number(x.cost || 0), 0)) },
    STATUS_KPI("Written Off", "Written Off", "muted", <FileText className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Ref #" },
    { key: "date", header: "Date" },
    { key: "product", header: "Product" },
    { key: "warehouse", header: "Warehouse" },
    { key: "qty", header: "Damaged Qty" },
    { key: "reason", header: "Reason" },
    { key: "cost", header: "Unit Cost", render: (i: any) => Rs(i.cost) },
    { key: "loss", header: "Total Loss", render: (i: any) => Rs(Number(i.qty) * Number(i.cost)) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Reference #", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    text("product", "Product", { required: true }),
    text("sku", "SKU"),
    sel("warehouse", "Warehouse", ["Main Warehouse", "Model Town Store", "Gulberg Outlet", "Karachi Transit Hub"], { required: true }),
    num("qty", "Damaged Quantity", { required: true }),
    sel("reason", "Reason", ["In Transit", "Mishandling", "Manufacturing Defect", "Water Damage", "Expired", "Other"], { defaultValue: "Mishandling" }),
    num("cost", "Unit Cost (Rs.)"),
    sel("status", "Status", ["Pending Inspection", "Repairable", "Returned to Supplier", "Written Off"], { defaultValue: "Pending Inspection" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "DMG-3001", date: "2026-05-03", product: "Samsung LED TV 55", sku: "LED-55-SAM", warehouse: "Main Warehouse", qty: 1, reason: "Mishandling", cost: 130000, status: "Returned to Supplier" },
    { id: "2", ref: "DMG-3002", date: "2026-05-05", product: "Haier Refrigerator", sku: "REF-INV-HAI", warehouse: "Model Town Store", qty: 1, reason: "In Transit", cost: 105000, status: "Pending Inspection" },
    { id: "3", ref: "DMG-3003", date: "2026-05-06", product: "Microwave Oven", sku: "MW-25L", warehouse: "Gulberg Outlet", qty: 2, reason: "Water Damage", cost: 18000, status: "Written Off" },
  ],
};

export const barcodeLabelsConfig: EntityPageProps<any> = {
  title: "Barcode Labels",
  description: "Generate and print barcode labels for products and variants.",
  storageKey: "qcrm.barcode-labels",
  withAvatar: { nameKey: "product", subKey: "sku" },
  searchKeys: ["product", "sku", "barcode"],
  kpis: [
    { label: "Total Labels", icon: <Barcode className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Labels to Print", icon: <Barcode className="h-5 w-5" />, tone: "warning", compute: (i) => i.reduce((s: number, x: any) => s + Number(x.copies || 0), 0) },
    STATUS_KPI("Printed", "Printed", "success", <ClipboardCheck className="h-5 w-5" />),
    STATUS_KPI("Pending", "Pending", "warning", <Clock className="h-5 w-5" />),
  ],
  columns: [
    { key: "product", header: "Product" },
    { key: "sku", header: "SKU" },
    { key: "barcode", header: "Barcode" },
    { key: "size", header: "Label Size" },
    { key: "copies", header: "Copies" },
    { key: "showPrice", header: "Show Price" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("product", "Product", { required: true }),
    text("sku", "SKU", { required: true }),
    text("barcode", "Barcode / EAN"),
    sel("size", "Label Size", ["Small (30x20mm)", "Medium (50x30mm)", "Large (75x50mm)", "Shelf Tag"], { defaultValue: "Medium (50x30mm)" }),
    sel("format", "Format", ["Code 128", "EAN-13", "QR Code", "UPC"], { defaultValue: "Code 128" }),
    num("copies", "Number of Copies", { defaultValue: 1 }),
    sel("showPrice", "Show Price", ["Yes", "No"], { defaultValue: "Yes" }),
    sel("showName", "Show Product Name", ["Yes", "No"], { defaultValue: "Yes" }),
    sel("status", "Status", ["Pending", "Printed"], { defaultValue: "Pending" }),
  ],
  seed: [
    { id: "1", product: "Gree 1.5 Ton Inverter AC", sku: "AC-15-GRE", barcode: "8901234567890", size: "Medium (50x30mm)", copies: 10, showPrice: "Yes", status: "Printed" },
    { id: "2", product: "Samsung LED TV 55 Inch", sku: "LED-55-SAM", barcode: "8901234567891", size: "Large (75x50mm)", copies: 5, showPrice: "Yes", status: "Pending" },
    { id: "3", product: "Samsung Galaxy A55", sku: "MOB-A55", barcode: "8901234567892", size: "Small (30x20mm)", copies: 25, showPrice: "No", status: "Pending" },
  ],
};

export const lowStockAlertsConfig: EntityPageProps<any> = {
  title: "Low Stock Alerts",
  description: "Products at or below their reorder level — restock priorities.",
  storageKey: "qcrm.low-stock-alerts",
  withAvatar: { nameKey: "product", subKey: "sku" },
  searchKeys: ["product", "sku", "warehouse"],
  kpis: [
    { label: "Alerts", icon: <Bell className="h-5 w-5" />, tone: "warning", compute: (i) => i.length },
    { label: "Out of Stock", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive", compute: (i) => i.filter((x: any) => Number(x.qty) === 0).length },
    { label: "Critical (≤2)", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive", compute: (i) => i.filter((x: any) => Number(x.qty) > 0 && Number(x.qty) <= 2).length },
    { label: "Reorder Needed", icon: <ShoppingCart className="h-5 w-5" />, tone: "warning", compute: (i) => i.reduce((s: number, x: any) => s + Math.max(0, Number(x.reorder || 0) - Number(x.qty || 0)), 0) },
  ],
  columns: [
    { key: "product", header: "Product" },
    { key: "sku", header: "SKU" },
    { key: "warehouse", header: "Warehouse" },
    { key: "qty", header: "Current Qty" },
    { key: "reorder", header: "Reorder Level" },
    { key: "needed", header: "Need to Order", render: (i: any) => Math.max(0, Number(i.reorder || 0) - Number(i.qty || 0)) },
    { key: "supplier", header: "Preferred Supplier", render: (i: any) => <SupplierLink name={i.supplier} /> },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(Number(i.qty) === 0 ? "Overdue" : "Pending") },
  ],
  fields: [
    text("product", "Product", { required: true }),
    text("sku", "SKU", { required: true }),
    sel("warehouse", "Warehouse", ["Main Warehouse", "Model Town Store", "Gulberg Outlet", "Karachi Transit Hub"], { required: true }),
    num("qty", "Current Quantity", { required: true, defaultValue: 0 }),
    num("reorder", "Reorder Level", { required: true, defaultValue: 5 }),
    sel("supplier", "Preferred Supplier", ["DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd"]),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", product: "Haier Inverter Refrigerator", sku: "REF-13-HAI-BLK", warehouse: "Main Warehouse", qty: 0, reorder: 5, supplier: "Haier International" },
    { id: "2", product: "Gree 1.5 Ton AC — Black", sku: "AC-15-GRE-BLK", warehouse: "Gulberg Outlet", qty: 2, reorder: 6, supplier: "DWP Group" },
    { id: "3", product: "iPhone 15 — 128GB", sku: "MOB-IP15-128-PNK", warehouse: "Model Town Store", qty: 2, reorder: 4, supplier: "R&I Electronics" },
    { id: "4", product: "Samsung Galaxy A55 — Blue", sku: "MOB-A55-256-BLU", warehouse: "Gulberg Outlet", qty: 3, reorder: 6, supplier: "R&I Electronics" },
    { id: "5", product: "Microwave Oven", sku: "MW-25L", warehouse: "Main Warehouse", qty: 1, reorder: 5, supplier: "Dawlance Ltd" },
  ],
};

// ============ LOGISTICS ============

export const vehicleRegistrationConfig: EntityPageProps<any> = {
  title: "Vehicle Registration",
  description: "Company-owned and contracted vehicles for delivery, recovery and logistics.",
  storageKey: "qcrm.vehicles",
  withAvatar: { nameKey: "regNo", subKey: "type" },
  searchKeys: ["regNo", "type", "driver", "owner"],
  kpis: [
    { label: "Total Vehicles", icon: <Truck className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Truck className="h-5 w-5" />),
    { label: "Owned", icon: <Truck className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.ownership === "Owned").length },
    { label: "Contracted", icon: <Truck className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.ownership === "Contracted").length },
  ],
  columns: [
    { key: "regNo", header: "Registration #" },
    { key: "type", header: "Type" },
    { key: "make", header: "Make / Model" },
    { key: "ownership", header: "Ownership" },
    { key: "driver", header: "Driver" },
    { key: "capacity", header: "Capacity" },
    { key: "fitnessExpiry", header: "Fitness Expiry" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("regNo", "Registration #", { required: true, placeholder: "LEH-1234" }),
    sel("type", "Vehicle Type", ["Truck", "Pickup", "Van", "Mini Truck", "Loader", "Bike", "Car"], { required: true }),
    text("make", "Make / Model", { placeholder: "e.g. Suzuki Ravi 2022" }),
    sel("ownership", "Ownership", ["Owned", "Contracted", "Leased"], { defaultValue: "Owned" }),
    text("owner", "Owner / Vendor"),
    text("driver", "Assigned Driver"),
    text("driverPhone", "Driver Phone"),
    text("capacity", "Capacity (Tons / Units)"),
    text("fuel", "Fuel Type"),
    { name: "fitnessExpiry", label: "Fitness Expiry", type: "date" },
    { name: "insuranceExpiry", label: "Insurance Expiry", type: "date" },
    { name: "tokenExpiry", label: "Token Tax Expiry", type: "date" },
    status(),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", regNo: "LEH-1234", type: "Pickup", make: "Suzuki Ravi 2022", ownership: "Owned", owner: "CreditWise", driver: "Asif Khan", driverPhone: "+92 300 1234567", capacity: "0.8 Ton", fuel: "Petrol", fitnessExpiry: "2027-03-15", insuranceExpiry: "2026-12-01", tokenExpiry: "2026-08-30", status: "Active" },
    { id: "2", regNo: "LES-5621", type: "Mini Truck", make: "Hino 300 2021", ownership: "Owned", owner: "CreditWise", driver: "Bilal Hussain", driverPhone: "+92 321 7654321", capacity: "3 Ton", fuel: "Diesel", fitnessExpiry: "2026-09-10", insuranceExpiry: "2026-11-15", tokenExpiry: "2026-07-20", status: "Active" },
    { id: "3", regNo: "KHI-8899", type: "Truck", make: "Isuzu NPR 2019", ownership: "Contracted", owner: "TCS Logistics", driver: "Rashid Ali", driverPhone: "+92 333 9988776", capacity: "5 Ton", fuel: "Diesel", fitnessExpiry: "2026-06-30", insuranceExpiry: "2026-10-01", tokenExpiry: "2026-09-15", status: "Active" },
    { id: "4", regNo: "LEB-2245", type: "Bike", make: "Honda CD-70", ownership: "Owned", owner: "CreditWise", driver: "Recovery Team", driverPhone: "+92 345 1112233", capacity: "—", fuel: "Petrol", fitnessExpiry: "2027-01-20", insuranceExpiry: "2026-12-30", tokenExpiry: "2026-08-15", status: "Active" },
  ],
};

// ============ PURCHASES ============

export const suppliersConfig: EntityPageProps<any> = {
  title: "Suppliers",
  description: "Supplier directory, contracts and ledgers.",
  storageKey: "qcrm.suppliers",
  addHref: "/purchases/suppliers/new",
  rowHref: (i: any) => `/purchases/suppliers/${i.id}`,
  editHref: (i: any) => `/purchases/suppliers/${i.id}/edit`,
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "phone", "ntn"],
  kpis: [
    { label: "Total Suppliers", icon: <Truck className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Truck className="h-5 w-5" />),
    { label: "Total Payable", icon: <Wallet className="h-5 w-5" />, tone: "warning", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.balance || 0), 0)) },
    { label: "Local Suppliers", icon: <Truck className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.type === "Local").length },
  ],
  columns: [
    {
      key: "name",
      header: "Supplier Name",
      render: (i: any) => (
        <a
          href={`/purchases/suppliers/${i.id}`}
          onClick={(e) => e.stopPropagation()}
          className="font-medium text-primary hover:underline"
        >
          {i.name}
        </a>
      ),
    },
    { key: "category", header: "Category" },
    {
      key: "phone",
      header: "Contact",
      render: (i: any) => (
        <span className="inline-flex flex-col leading-tight">
          <span className="font-medium text-foreground">{i.phone || "—"}</span>
          {i.email && <span className="text-xs text-muted-foreground font-medium">{i.email}</span>}
        </span>
      ),
    },
    { key: "balance", header: "Balance Due", render: (i: any) => <span className="font-medium text-foreground">{Rs(i.balance)}</span> },
    { key: "paymentTerms", header: "Payment Terms", render: (i: any) => i.paymentTerms || "—" },
    {
      key: "nextDue",
      header: "Next Due",
      render: (i: any) => {
        const terms = String(i.paymentTerms || "");
        const balance = Number(i.balance || 0);
        if (!balance) return <span className="text-muted-foreground">—</span>;
        const m = terms.match(/(\d+)/);
        if (!m) return <span className="text-muted-foreground">—</span>;
        const base = i.lastBillDate ? new Date(i.lastBillDate) : new Date();
        base.setDate(base.getDate() + Number(m[1]));
        const due = base.toISOString().slice(0, 10);
        const overdue = new Date(due) < new Date(new Date().toISOString().slice(0, 10));
        return (
          <span className="inline-flex flex-col leading-tight">
            <span className={`font-medium ${overdue ? "text-destructive" : "text-foreground"}`}>{Rs(balance)}</span>
            <span className="text-[11px] text-muted-foreground">{due}</span>
          </span>
        );
      },
    },
  ],
  fields: [
    text("name", "Supplier Name", { required: true }),
    text("code", "Code"),
    sel("category", "Category / Provides", [
      "Air Conditioners", "Refrigerators", "LED TVs", "Washing Machines",
      "Microwave Ovens", "Deep Freezers", "Water Dispensers", "Small Appliances",
      "Mobile Phones", "Laptops & IT", "Generators / UPS", "Spare Parts & Accessories",
      "Mixed / Multi-Category",
    ], { required: true }),
    text("phone", "Phone"),
    text("email", "Email"),
    text("ntn", "NTN"),
    text("strn", "STRN"),
    sel("type", "Type", ["Local", "Import"], { defaultValue: "Local" }),
    num("balance", "Balance Due (Rs.)", { defaultValue: 0 }),
    sel("paymentTerms", "Payment Terms", ["Advance", "COD", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60"], { defaultValue: "Net 30" }),
    { name: "lastBillDate", label: "Last Bill Date", type: "date" },
    area("address", "Address"),
    status(),
  ],
  seed: [
    { id: "1", name: "DWP Group", code: "SUP-001", category: "Air Conditioners", phone: "+92 42 35880100", email: "ap@dwp.com.pk", ntn: "1234567-8", type: "Local", balance: 850000, paymentTerms: "Net 30", lastBillDate: "2026-05-02", status: "Active" },
    { id: "2", name: "R&I Electronics", code: "SUP-002", category: "LED TVs", phone: "+92 21 34567890", email: "billing@rielectronics.pk", ntn: "9876543-2", type: "Local", balance: 320000, paymentTerms: "Net 15", lastBillDate: "2026-05-05", status: "Active" },
    { id: "3", name: "Haier International", code: "SUP-003", category: "Mixed / Multi-Category", phone: "+86 532 8893", email: "export@haier.com", ntn: "—", type: "Import", balance: 1250000, paymentTerms: "Net 60", lastBillDate: "2026-04-20", status: "Active" },
  ],
};

export const purchaseOrdersConfig: EntityPageProps<any> = {
  title: "Purchase Orders",
  description: "Create and approve purchase orders.",
  storageKey: "qcrm.po",
  addHref: "/purchases/orders/new",
  editHref: (i: any) => `/purchases/orders/${i.id}/edit`,
  withAvatar: { nameKey: "ref", subKey: "supplier" },
  searchKeys: ["ref", "supplier"],
  filters: [
    { key: "status", label: "Status", options: ["Draft", "Pending", "Approved", "Partially Received", "Received", "Closed", "Cancelled", "Void"] },
    { key: "branch", label: "Branch", options: ["Main Warehouse", "Model Town", "Gulberg", "DHA Phase 5", "Johar Town"] },
  ],
  kpis: [
    { label: "Total POs", icon: <ShoppingCart className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Pending", "Pending", "warning", <ShoppingCart className="h-5 w-5" />),
    STATUS_KPI("Approved", "Approved", "success", <ClipboardCheck className="h-5 w-5" />),
    { label: "PO Value", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
  ],
  columns: [
    { key: "ref", header: "PO #" },
    { key: "date", header: "Date", render: (i: any) => <DateTimeCell date={i.date} time={i.time} /> },
    { key: "branch", header: "Branch" },
    { key: "items", header: "Items", render: (i: any) => <span className="tabular-nums text-muted-foreground">{i.items ?? 0}</span> },
    { key: "expectedDelivery", header: "Expected Delivery", render: (i: any) => <span className="text-muted-foreground">{i.expectedDelivery ?? "—"}</span> },
    { key: "paymentTerms", header: "Payment Terms", render: (i: any) => <span className="text-muted-foreground">{i.paymentTerms ?? "—"}</span> },
    { key: "amount", header: "Amount", render: (i: any) => <span className="tabular-nums font-medium">{Rs(i.amount)}</span> },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "PO Number", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    text("time", "Time"),
    sel("supplier", "Supplier", ["DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd"], { required: true }),
    sel("branch", "Branch", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Main Warehouse"]),
    num("items", "Items / Line Count"),
    { name: "expectedDelivery", label: "Expected Delivery", type: "date" },
    sel("paymentTerms", "Payment Terms", ["Net 15", "Net 30", "Net 45", "Net 60", "Advance", "COD"], { defaultValue: "Net 30" }),
    num("amount", "Amount (Rs.)", { required: true }),
    sel("status", "Status", ["Draft", "Pending", "Approved", "Partially Received", "Received", "Closed", "Cancelled", "Void"], { defaultValue: "Pending" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "PO-3001", date: "2026-05-01", time: "09:42 AM", supplier: "DWP Group", branch: "Main Warehouse", items: 12, expectedDelivery: "2026-05-12", paymentTerms: "Net 30", amount: 1450000, status: "Approved" },
    { id: "2", ref: "PO-3002", date: "2026-05-04", time: "02:15 PM", supplier: "R&I Electronics", branch: "Main Warehouse", items: 5, expectedDelivery: "2026-05-15", paymentTerms: "Net 15", amount: 780000, status: "Pending" },
  ],
};

export const grnConfig: EntityPageProps<any> = {
  title: "Goods Received Notes",
  description: "Receive vendor shipments into warehouse with quality check, batch & serial tracking.",
  storageKey: "qcrm.grn.v2",
  addHref: "/purchases/grn/new",
  withAvatar: { nameKey: "ref" },
  searchKeys: ["ref", "po", "supplier", "warehouse", "invoice", "receivedBy"],
  filters: [
    { key: "status", label: "Status", options: ["Draft", "In Transit", "Pending QC", "Partially Received", "Received", "Disputed", "Closed"] },
    { key: "warehouse", label: "Warehouse", options: ["Main Warehouse", "Model Town DC", "Gulberg Hub", "DHA Phase 5", "Johar Town", "Karachi Port"] },
    { key: "supplier", label: "Supplier", options: ["DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd", "PEL", "TCL Pakistan"] },
    { key: "qc", label: "QC Result", options: ["Pending", "Passed", "Failed", "Partial"] },
  ],
  kpis: [
    { label: "Total GRNs", hint: "All goods received notes", icon: <ClipboardCheck className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total This Month", hint: "GRNs created this month", icon: <Truck className="h-5 w-5" />, tone: "primary", compute: (i) => {
      const now = new Date(); const ym = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
      return i.filter((x: any) => (x.date || "").startsWith(ym)).length;
    } },
    { label: "Received", hint: "Fully received shipments", icon: <ClipboardCheck className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.status === "Received" || x.status === "Closed").length },
    { label: "Partially Received", hint: "Short / partial receipts", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.status === "Partially Received").length },
  ],
  columns: [
    { key: "ref", header: "GRN #", render: (i: any) => (
      <div>
        <div className="font-semibold text-foreground">{i.ref}</div>
        {(i.dateTime || i.date) && <div className="text-xs text-muted-foreground font-medium mt-0.5">{i.dateTime || `${i.date}${i.time ? ` • ${i.time}` : ""}`}</div>}
      </div>
    ) },
    { key: "po", header: "PO #", render: (i: any) => (
      <div>
        <div className="font-semibold text-foreground">{i.po || "—"}</div>
        {(i.dateTime || i.date) && <div className="text-xs text-muted-foreground font-medium mt-0.5">{i.dateTime || `${i.date}${i.time ? ` • ${i.time}` : ""}`}</div>}
      </div>
    ) },
    { key: "supplier", header: "Supplier", render: (i: any) => <SupplierLink name={i.supplier} /> },
    { key: "warehouse", header: "Warehouse" },
    { key: "qty", header: "Qty (Recv/Ord)", render: (i: any) => (
      <span className="text-xs font-mono">{Number(i.receivedQty || 0).toLocaleString()} / {Number(i.orderedQty || 0).toLocaleString()}</span>
    ) },
    { key: "receivedBy", header: "Received By" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "GRN Number", { required: true }),
    text("po", "PO Reference"),
    text("invoice", "Vendor Invoice / DC #"),
    sel("supplier", "Supplier", ["DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd", "PEL", "TCL Pakistan"]),
    sel("warehouse", "Receiving Warehouse", ["Main Warehouse", "Model Town DC", "Gulberg Hub", "DHA Phase 5", "Johar Town", "Karachi Port"], { required: true }),
    { name: "date", label: "Receive Date", type: "date", required: true },
    text("vehicle", "Vehicle / Transporter"),
    text("driver", "Driver Name & CNIC"),
    text("gatePass", "Gate Pass #"),
    text("receivedBy", "Received By", { defaultValue: "Ahmed Hassan" }),
    num("orderedQty", "Ordered Qty"),
    num("receivedQty", "Received Qty"),
    num("damagedQty", "Damaged / Short Qty"),
    num("amount", "Receipt Value (Rs.)"),
    sel("qc", "QC Result", ["Pending", "Passed", "Failed", "Partial"], { defaultValue: "Pending" }),
    sel("status", "Status", ["Draft", "In Transit", "Pending QC", "Partially Received", "Received", "Disputed", "Closed"], { defaultValue: "Pending QC" }),
    area("notes", "Receiving Notes / Discrepancies"),
  ],
  seed: [
    { id: "1", ref: "GRN-4001", po: "PO-3001", invoice: "INV-DWP-882", supplier: "DWP Group", warehouse: "Main Warehouse", date: "2026-05-12", time: "09:30 AM", dateTime: "2026-05-12 • 09:30 AM", vehicle: "LEC-2241 (Daewoo)", driver: "Asif Mehmood — 35202-XXXX", gatePass: "GP-1187", receivedBy: "Hamza Tariq", orderedQty: 24, receivedQty: 24, damagedQty: 0, itemsCount: 6, receivedCount: 6, amount: 1450000, qc: "Passed", status: "Received" },
    { id: "2", ref: "GRN-4002", po: "PO-3002", invoice: "INV-RI-1043", supplier: "R&I Electronics", warehouse: "Model Town DC", date: "2026-05-13", time: "11:15 AM", dateTime: "2026-05-13 • 11:15 AM", vehicle: "LES-7780 (Hino)", driver: "Naveed Akhtar — 42101-XXXX", gatePass: "GP-1188", receivedBy: "Sana Iqbal", orderedQty: 18, receivedQty: 16, damagedQty: 2, itemsCount: 5, receivedCount: 5, amount: 780000, qc: "Partial", status: "Partially Received" },
    { id: "3", ref: "GRN-4003", po: "PO-3005", invoice: "INV-HAIER-552", supplier: "Haier International", warehouse: "Karachi Port", date: "2026-05-14", time: "02:45 PM", dateTime: "2026-05-14 • 02:45 PM", vehicle: "TLC-9912 (Container)", driver: "Imran Shah — 42201-XXXX", gatePass: "GP-1190", receivedBy: "Bilal Khan", orderedQty: 60, receivedQty: 60, damagedQty: 0, itemsCount: 12, receivedCount: 12, amount: 4250000, qc: "Pending", status: "Pending QC" },
    { id: "4", ref: "GRN-4004", po: "PO-3007", invoice: "INV-DAW-221", supplier: "Dawlance Ltd", warehouse: "Gulberg Hub", date: "2026-05-14", time: "04:20 PM", dateTime: "2026-05-14 • 04:20 PM", vehicle: "LEB-4471 (Shehzore)", driver: "Tariq Mehmood — 35201-XXXX", gatePass: "GP-1191", receivedBy: "Ayesha Noor", orderedQty: 30, receivedQty: 0, damagedQty: 0, itemsCount: 8, receivedCount: 0, amount: 0, qc: "Pending", status: "In Transit" },
    { id: "5", ref: "GRN-4005", po: "PO-3009", invoice: "INV-PEL-118", supplier: "PEL", warehouse: "Main Warehouse", date: "2026-05-11", time: "10:05 AM", dateTime: "2026-05-11 • 10:05 AM", vehicle: "LEH-1188 (Mazda)", driver: "Faisal Iqbal — 35202-XXXX", gatePass: "GP-1184", receivedBy: "Hamza Tariq", orderedQty: 40, receivedQty: 38, damagedQty: 2, itemsCount: 10, receivedCount: 10, amount: 1860000, qc: "Failed", status: "Disputed", notes: "2 units of refrigerator dented; awaiting supplier credit note." },
    { id: "6", ref: "GRN-4006", po: "PO-3011", invoice: "INV-TCL-770", supplier: "TCL Pakistan", warehouse: "DHA Phase 5", date: "2026-05-10", time: "01:30 PM", dateTime: "2026-05-10 • 01:30 PM", vehicle: "LXR-3320 (Hilux)", driver: "Owais Ali — 42102-XXXX", gatePass: "GP-1180", receivedBy: "Sana Iqbal", orderedQty: 22, receivedQty: 22, damagedQty: 0, itemsCount: 7, receivedCount: 7, amount: 1180000, qc: "Passed", status: "Closed" },
    { id: "7", ref: "GRN-4007", po: "PO-3013", invoice: "INV-DWP-905", supplier: "DWP Group", warehouse: "Johar Town", date: "2026-05-09", time: "08:50 AM", dateTime: "2026-05-09 • 08:50 AM", vehicle: "LEH-2255 (Suzuki)", driver: "Kashif Raza — 35203-XXXX", gatePass: "GP-1178", receivedBy: "Bilal Khan", orderedQty: 12, receivedQty: 12, damagedQty: 0, itemsCount: 4, receivedCount: 4, amount: 540000, qc: "Passed", status: "Received" },
    { id: "8", ref: "GRN-4008", po: "PO-3015", supplier: "Haier International", warehouse: "Main Warehouse", date: "2026-05-15", time: "—", dateTime: "2026-05-15 • Pending", vehicle: "—", driver: "—", gatePass: "—", receivedBy: "Ahmed Hassan", orderedQty: 50, receivedQty: 0, damagedQty: 0, itemsCount: 14, receivedCount: 0, amount: 0, qc: "Pending", status: "Draft" },
  ],
};

export const purchaseReturnsConfig: EntityPageProps<any> = {
  title: "Purchase Returns",
  description: "Return goods to supplier with stock deduction and adjustment.",
  storageKey: "qcrm.purchase-returns",
  addHref: "/purchases/returns/new",
  withAvatar: { nameKey: "ref", subKey: "supplier" },
  searchKeys: ["ref", "supplier", "grn"],
  kpis: [
    { label: "Total Returns", icon: <ArrowLeftRight className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Pending", "Pending", "warning", <ArrowLeftRight className="h-5 w-5" />),
    STATUS_KPI("Approved", "Approved", "success", <ClipboardCheck className="h-5 w-5" />),
    { label: "Return Value", icon: <Wallet className="h-5 w-5" />, tone: "warning", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
  ],
  columns: [
    { key: "ref", header: "Return #" },
    { key: "date", header: "Date & Time", render: (i: any) => <DateTimeCell date={i.date} time={i.time} /> },
    { key: "supplier", header: "Supplier", render: (i: any) => <SupplierLink name={i.supplier} /> },
    { key: "grn", header: "GRN Ref" },
    { key: "reason", header: "Reason" },
    { key: "qty", header: "Qty" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Return Number", { required: true }),
    { name: "date", label: "Return Date", type: "date", required: true },
    text("time", "Time"),
    sel("supplier", "Supplier", ["DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd"], { required: true }),
    text("grn", "GRN Reference"),
    sel("reason", "Reason", ["Damaged", "Wrong Item", "Quality Issue", "Excess Supply", "Expired"], { defaultValue: "Damaged" }),
    num("qty", "Quantity"),
    num("amount", "Amount (Rs.)", { required: true }),
    sel("status", "Status", ["Draft", "Pending", "Approved", "Rejected"], { defaultValue: "Pending" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "PR-5001", date: "2026-05-06", time: "11:20 AM", supplier: "DWP Group", grn: "GRN-4001", reason: "Damaged", qty: 2, amount: 84000, status: "Approved" },
    { id: "2", ref: "PR-5002", date: "2026-05-07", time: "03:48 PM", supplier: "R&I Electronics", grn: "GRN-4002", reason: "Wrong Item", qty: 1, amount: 24000, status: "Pending" },
  ],
};

export const billsConfig: EntityPageProps<any> = {
  title: "Bills / Purchase Invoices",
  description: "Supplier invoices, outstanding payables and due dates.",
  storageKey: "qcrm.bills",
  addHref: "/purchases/bills/new",
  editHref: (i: any) => `/purchases/bills/${i.id}/edit`,
  withAvatar: { nameKey: "ref", subKey: "supplier" },
  searchKeys: ["ref", "supplier", "po"],
  kpis: [
    {
      label: "Due in 3 Days",
      icon: <AlertTriangle className="h-5 w-5" />,
      tone: "destructive",
      compute: (i) => {
        const now = new Date();
        const cutoff = new Date();
        cutoff.setDate(now.getDate() + 3);
        return Rs(
          i.reduce((s: number, x: any) => {
            if (!x.due || x.status === "Paid" || x.status === "Cancelled") return s;
            const d = new Date(x.due);
            if (d >= now && d <= cutoff) return s + Number(x.outstanding || 0);
            return s;
          }, 0),
        );
      },
    },
    {
      label: "Due in 30 Days",
      icon: <Clock className="h-5 w-5" />,
      tone: "warning",
      compute: (i) => {
        const now = new Date();
        const cutoff = new Date();
        cutoff.setDate(now.getDate() + 30);
        return Rs(
          i.reduce((s: number, x: any) => {
            if (!x.due || x.status === "Paid" || x.status === "Cancelled") return s;
            const d = new Date(x.due);
            if (d >= now && d <= cutoff) return s + Number(x.outstanding || 0);
            return s;
          }, 0),
        );
      },
    },
    {
      label: "Total Outstanding",
      icon: <Wallet className="h-5 w-5" />,
      tone: "primary",
      compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.outstanding || 0), 0)),
    },
    STATUS_KPI("Paid", "Paid", "success", <ClipboardCheck className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Bill #" },
    { key: "date", header: "Date & Time", render: (i: any) => <DateTimeCell date={i.date} time={i.time} /> },
    { key: "supplier", header: "Supplier", render: (i: any) => <SupplierLink name={i.supplier} /> },
    { key: "po", header: "PO Ref", render: (i: any) => <RefWithDateCell refValue={i.po} lookup={lookupPoDate} /> },
    { key: "due", header: "Due Date" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "outstanding", header: "Outstanding", render: (i: any) => Rs(i.outstanding) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Bill / Invoice #", { required: true }),
    { name: "date", label: "Bill Date", type: "date", required: true },
    text("time", "Time"),
    sel("supplier", "Supplier", ["DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd"], { required: true }),
    text("po", "PO Reference"),
    { name: "due", label: "Due Date", type: "date" },
    num("amount", "Bill Amount (Rs.)", { required: true }),
    num("outstanding", "Outstanding (Rs.)"),
    sel("status", "Status", ["Draft", "Open", "Partially Paid", "Paid", "Overdue", "Cancelled"], { defaultValue: "Open" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "BIL-7001", date: "2026-05-02", time: "10:05 AM", supplier: "DWP Group", po: "PO-3001", due: "2026-06-01", amount: 1450000, outstanding: 600000, status: "Partially Paid" },
    { id: "2", ref: "BIL-7002", date: "2026-04-15", time: "04:32 PM", supplier: "R&I Electronics", po: "PO-3002", due: "2026-05-01", amount: 780000, outstanding: 780000, status: "Overdue" },
    { id: "3", ref: "BIL-7003", date: "2026-04-20", time: "11:50 AM", supplier: "Haier International", po: "PO-3003", due: "2026-05-20", amount: 1250000, outstanding: 0, status: "Paid" },
  ],
};

export const paymentsMadeConfig: EntityPageProps<any> = {
  title: "Payments Made",
  description: "Vendor payments — partial, full and advance payments.",
  storageKey: "qcrm.payments-made",
  addHref: "/purchases/payments/new",
  editHref: (i: any) => `/purchases/payments/${i.id}/edit`,
  withAvatar: { nameKey: "ref", subKey: "supplier" },
  searchKeys: ["ref", "supplier", "bill"],
  kpis: [
    { label: "Total Payments", icon: <Banknote className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total Paid", icon: <Wallet className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    { label: "This Month", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => {
      const now = new Date(); const m = now.getMonth(); const y = now.getFullYear();
      return Rs(i.filter((x: any) => { const d = new Date(x.date); return d.getMonth() === m && d.getFullYear() === y; }).reduce((s: number, x: any) => s + Number(x.amount || 0), 0));
    } },
    { label: "Avg Payment", icon: <CreditCard className="h-5 w-5" />, tone: "warning", compute: (i) => {
      if (!i.length) return Rs(0);
      return Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0) / i.length);
    } },
  ],
  columns: [
    { key: "ref", header: "Payment #" },
    { key: "date", header: "Date & Time", render: (i: any) => <DateTimeCell date={i.date} time={i.time} /> },
    { key: "supplier", header: "Supplier", render: (i: any) => <SupplierLink name={i.supplier} /> },
    { key: "bill", header: "Bill Ref" },
    { key: "method", header: "Method" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
  ],
  fields: [
    text("ref", "Payment Number", { required: true }),
    { name: "date", label: "Payment Date", type: "date", required: true },
    text("time", "Time"),
    sel("supplier", "Supplier", ["DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd"], { required: true }),
    text("bill", "Bill Reference"),
    sel("type", "Payment Type", ["Partial", "Full", "Advance"], { defaultValue: "Partial" }),
    sel("method", "Method", ["Cash", "Bank Transfer", "Cheque", "Online"], { defaultValue: "Bank Transfer" }),
    num("amount", "Amount (Rs.)", { required: true }),
    sel("status", "Status", ["Pending", "Paid", "Cancelled"], { defaultValue: "Paid" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "PAY-8001", date: "2026-05-05", time: "12:18 PM", supplier: "DWP Group", bill: "BIL-7001", method: "Bank Transfer", type: "Partial", amount: 850000, status: "Paid" },
    { id: "2", ref: "PAY-8002", date: "2026-05-06", time: "09:55 AM", supplier: "Haier International", bill: "BIL-7003", method: "Bank Transfer", type: "Full", amount: 1250000, status: "Paid" },
    { id: "3", ref: "PAY-8003", date: "2026-05-07", time: "03:11 PM", supplier: "Dawlance Ltd", bill: "—", method: "Cheque", type: "Advance", amount: 300000, status: "Paid" },
  ],
};

export const expensesConfig: EntityPageProps<any> = {
  title: "Expenses",
  description: "All operating expenses — one-time and recurring (rent, salaries, utilities, freight).",
  storageKey: "qcrm.expenses",
  addHref: "/purchases/expenses/new",
  editHref: (i: any) => `/purchases/expenses/${i.id}/edit`,
  withAvatar: { nameKey: "ref", subKey: "category" },
  searchKeys: ["ref", "category", "vendor", "description"],
  kpis: [
    { label: "Total Expenses", icon: <Receipt className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total Amount", icon: <Wallet className="h-5 w-5" />, tone: "warning", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    { label: "Cash Payments", icon: <Banknote className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.paymentMode === "Cash").length },
    STATUS_KPI("Pending", "Pending", "warning", <Clock className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Voucher #" },
    { key: "date", header: "Date & Time", render: (i: any) => <DateTimeCell date={i.date} time={i.time} /> },
    { key: "category", header: "Category" },
    { key: "vendor", header: "Vendor / Payee" },
    { key: "type", header: "Type" },
    { key: "paymentMode", header: "Payment Mode" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Voucher #", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    text("time", "Time"),
    sel("category", "Category", ["Freight", "Loading", "Utilities", "Fuel", "Rent", "Salaries", "Internet", "Electricity", "Maintenance", "Office Supplies", "Other"], { required: true }),
    text("vendor", "Vendor / Payee"),
    sel("type", "Type", ["One-time", "Recurring"], { defaultValue: "One-time" }),
    sel("paymentMode", "Payment Mode", ["Cash", "Bank"], { defaultValue: "Cash" }),
    num("amount", "Amount (Rs.)", { required: true }),
    { name: "nextDue", label: "Next Due Date", type: "date" },
    sel("reminder", "Auto Reminder", ["Yes", "No"], { defaultValue: "No" }),
    sel("status", "Status", ["Pending", "Paid", "Cancelled"], { defaultValue: "Paid" }),
    area("description", "Description"),
  ],
  seed: [
    { id: "1", ref: "EXP-9001", date: "2026-05-01", time: "08:30 AM", category: "Freight", vendor: "TCS Logistics", type: "One-time", paymentMode: "Cash", amount: 18500, status: "Paid" },
    { id: "2", ref: "EXP-9002", date: "2026-05-01", time: "10:00 AM", category: "Rent", vendor: "Model Town Landlord", type: "Recurring", paymentMode: "Bank", amount: 250000, nextDue: "2026-06-01", reminder: "Yes", status: "Paid" },
    { id: "3", ref: "EXP-9003", date: "2026-05-03", time: "11:45 AM", category: "Salaries", vendor: "Payroll Run", type: "Recurring", paymentMode: "Bank", amount: 1450000, nextDue: "2026-06-03", reminder: "Yes", status: "Paid" },
    { id: "4", ref: "EXP-9004", date: "2026-05-04", time: "02:20 PM", category: "Internet", vendor: "Nayatel", type: "Recurring", paymentMode: "Bank", amount: 12500, nextDue: "2026-06-04", reminder: "Yes", status: "Paid" },
    { id: "5", ref: "EXP-9005", date: "2026-05-05", time: "04:15 PM", category: "Electricity", vendor: "LESCO", type: "Recurring", paymentMode: "Bank", amount: 78000, nextDue: "2026-06-05", reminder: "Yes", status: "Pending" },
    { id: "6", ref: "EXP-9006", date: "2026-05-06", time: "09:25 AM", category: "Fuel", vendor: "PSO Card", type: "One-time", paymentMode: "Cash", amount: 8500, status: "Paid" },
    { id: "7", ref: "EXP-9007", date: "2026-05-07", time: "05:40 PM", category: "Loading", vendor: "Daily Labor", type: "One-time", paymentMode: "Cash", amount: 4200, status: "Paid" },
  ],
};

export const supplierLedgerConfig: EntityPageProps<any> = {
  title: "Supplier Ledger",
  description: "Vendor payable, advance, credit/debit history and running balance.",
  storageKey: "qcrm.supplier-ledger",
  withAvatar: { nameKey: "supplier", subKey: "ref" },
  searchKeys: ["supplier", "ref", "type"],
  kpis: [
    { label: "Total Entries", icon: <BookOpen className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total Debit", icon: <TrendingUp className="h-5 w-5" />, tone: "destructive", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.debit || 0), 0)) },
    { label: "Total Credit", icon: <TrendingUp className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.credit || 0), 0)) },
    { label: "Net Payable", icon: <Wallet className="h-5 w-5" />, tone: "warning", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.credit || 0) - Number(x.debit || 0), 0)) },
  ],
  columns: [
    { key: "date", header: "Date" },
    { key: "supplier", header: "Supplier", render: (i: any) => <SupplierLink name={i.supplier} /> },
    { key: "ref", header: "Reference" },
    { key: "type", header: "Type" },
    { key: "description", header: "Description" },
    { key: "debit", header: "Debit", render: (i: any) => Rs(i.debit) },
    { key: "credit", header: "Credit", render: (i: any) => Rs(i.credit) },
    { key: "balance", header: "Balance", render: (i: any) => Rs(i.balance) },
  ],
  fields: [
    { name: "date", label: "Date", type: "date", required: true },
    sel("supplier", "Supplier", ["DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd"], { required: true }),
    text("ref", "Reference #", { required: true }),
    sel("type", "Entry Type", ["Bill", "Payment", "Return", "Advance", "Adjustment"], { defaultValue: "Bill" }),
    num("debit", "Debit (Rs.)", { defaultValue: 0 }),
    num("credit", "Credit (Rs.)", { defaultValue: 0 }),
    num("balance", "Running Balance (Rs.)"),
    area("description", "Description"),
  ],
  seed: [
    { id: "1", date: "2026-05-02", supplier: "DWP Group", ref: "BIL-7001", type: "Bill", description: "Inverter AC stock receive", debit: 0, credit: 1450000, balance: 1450000 },
    { id: "2", date: "2026-05-05", supplier: "DWP Group", ref: "PAY-8001", type: "Payment", description: "Partial payment via bank", debit: 850000, credit: 0, balance: 600000 },
    { id: "3", date: "2026-05-06", supplier: "DWP Group", ref: "PR-5001", type: "Return", description: "Damaged units returned", debit: 84000, credit: 0, balance: 516000 },
    { id: "4", date: "2026-04-15", supplier: "R&I Electronics", ref: "BIL-7002", type: "Bill", description: "LED TV stock", debit: 0, credit: 780000, balance: 780000 },
    { id: "5", date: "2026-04-20", supplier: "Haier International", ref: "BIL-7003", type: "Bill", description: "Refrigerator import", debit: 0, credit: 1250000, balance: 1250000 },
    { id: "6", date: "2026-05-06", supplier: "Haier International", ref: "PAY-8002", type: "Payment", description: "Full payment via bank", debit: 1250000, credit: 0, balance: 0 },
    { id: "7", date: "2026-05-07", supplier: "Dawlance Ltd", ref: "PAY-8003", type: "Advance", description: "Advance for upcoming PO", debit: 300000, credit: 0, balance: -300000 },
  ],
};

// ============ SALES ============

export const salesConfig: EntityPageProps<any> = {
  title: "Sales",
  description: "All sales — cash and installment.",
  storageKey: "qcrm.sales",
  addHref: "/sales/invoices/new",
  addLabel: "Add Sale",
  withAvatar: { nameKey: "invoice", subKey: "customer" },
  searchKeys: ["invoice", "customer", "salesman"],
  kpis: [
    { label: "Total Sales", icon: <ShoppingBag className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Cash Sales", icon: <Banknote className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.type === "Cash").length },
    { label: "Installment Sales", icon: <CreditCard className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.type === "Installment").length },
    { label: "Total Revenue", icon: <Wallet className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
  ],
  columns: [
    { key: "invoice", header: "Invoice #" },
    { key: "date", header: "Date" },
    { key: "customer", header: "Customer" },
    { key: "type", header: "Type" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "salesman", header: "Salesman" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("invoice", "Invoice #", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    text("customer", "Customer", { required: true }),
    sel("type", "Sale Type", ["Cash", "Installment"], { required: true, defaultValue: "Cash" }),
    text("product", "Product"),
    num("amount", "Amount (Rs.)", { required: true }),
    text("salesman", "Salesman"),
    sel("branch", "Branch", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town"]),
    sel("status", "Status", ["Draft", "Approved", "Paid", "Cancelled"], { defaultValue: "Approved" }),
  ],
  seed: [
    { id: "1", invoice: "INV-7001", date: "2026-05-07", customer: "Imran Ali", type: "Cash", product: "Samsung LED TV 55", amount: 149999, salesman: "Bilal", branch: "Model Town", status: "Paid" },
    { id: "2", invoice: "INV-7002", date: "2026-05-07", customer: "Sara Khan", type: "Installment", product: "Gree 1.5 Ton AC", amount: 168000, salesman: "Usman", branch: "Gulberg", status: "Approved" },
  ],
};

export const cashSaleConfig: EntityPageProps<any> = {
  ...salesConfig,
  title: "Cash Sales",
  description: "Quick cash invoices with FBR integration ready.",
  storageKey: "qcrm.cashsales",
  seed: salesConfig.seed.filter((s: any) => s.type === "Cash"),
};

export const installmentSaleConfig: EntityPageProps<any> = {
  title: "New Installment Sale",
  description: "Create installment contracts with KYC, guarantor & schedule.",
  storageKey: "qcrm.instSales",
  withAvatar: { nameKey: "customer", subKey: "cnic" },
  searchKeys: ["customer", "cnic", "product"],
  kpis: [
    { label: "Total Contracts", icon: <CreditCard className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Pending Approval", "Pending", "warning", <ClipboardCheck className="h-5 w-5" />),
    STATUS_KPI("Active", "Active", "success", <CreditCard className="h-5 w-5" />),
    { label: "Total Financed", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.financed || 0), 0)) },
  ],
  columns: [
    { key: "customer", header: "Customer" },
    { key: "product", header: "Product" },
    { key: "totalPrice", header: "Total", render: (i: any) => Rs(i.totalPrice) },
    { key: "down", header: "Down", render: (i: any) => Rs(i.down) },
    { key: "tenure", header: "Tenure", render: (i: any) => `${i.tenure} mo` },
    { key: "monthly", header: "Monthly", render: (i: any) => Rs(i.monthly) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("customer", "Customer Name", { required: true }),
    text("cnic", "CNIC", { required: true, placeholder: "XXXXX-XXXXXXX-X" }),
    text("phone", "Phone"),
    text("guarantor", "Guarantor Name"),
    text("guarantorCnic", "Guarantor CNIC"),
    text("product", "Product", { required: true }),
    num("totalPrice", "Total Price (Rs.)", { required: true }),
    num("down", "Down Payment (Rs.)", { required: true }),
    num("tenure", "Tenure (months)", { required: true, defaultValue: 12 }),
    num("monthly", "Monthly Installment (Rs.)", { required: true }),
    num("financed", "Financed Amount (Rs.)"),
    sel("status", "Status", ["Pending", "Approved", "Active", "Settled", "Defaulter", "Cancelled"], { defaultValue: "Pending" }),
  ],
  seed: [
    { id: "1", customer: "Sara Khan", cnic: "35202-1234567-8", phone: "+92 300 1234567", guarantor: "Ali Khan", guarantorCnic: "35202-7654321-1", product: "Gree 1.5 Ton AC", totalPrice: 198000, down: 40000, financed: 158000, tenure: 12, monthly: 13500, status: "Active" },
  ],
};

export const hpCasesConfig: EntityPageProps<any> = {
  title: "Contracts",
  description: "Hire Purchase / installment contracts — funnel, approvals, KYC, schedule and lifecycle.",
  storageKey: "qcrm.hp-cases",
  addHref: "/contracts/new",
  addLabel: "New Contract",
  withAvatar: { nameKey: "ref", subKey: "customer" },
  searchKeys: ["ref", "customer", "cnic", "product"],
  kpis: [
    { label: "Total Contracts", icon: <CreditCard className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <CreditCard className="h-5 w-5" />),
    STATUS_KPI("In Funnel", "Under Process", "warning", <ClipboardCheck className="h-5 w-5" />),
    { label: "Portfolio Value", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.financed || 0), 0)) },
  ],
  columns: [
    { key: "ref", header: "Contract #" },
    { key: "customer", header: "Customer" },
    { key: "product", header: "Product" },
    { key: "totalPrice", header: "Price", render: (i: any) => Rs(i.totalPrice) },
    { key: "down", header: "Down", render: (i: any) => Rs(i.down) },
    { key: "tenure", header: "Tenure", render: (i: any) => `${i.tenure} mo` },
    { key: "monthly", header: "EMI", render: (i: any) => Rs(i.monthly) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Contract #", { required: true }),
    text("customer", "Customer", { required: true }),
    text("cnic", "CNIC"),
    text("guarantor", "Guarantor"),
    text("product", "Product", { required: true }),
    num("totalPrice", "Total Price (Rs.)", { required: true }),
    num("down", "Down Payment (Rs.)", { required: true }),
    num("financed", "Financed (Rs.)"),
    num("tenure", "Tenure (months)", { defaultValue: 12 }),
    num("monthly", "Monthly EMI (Rs.)"),
    { name: "startDate", label: "Start Date", type: "date" },
    sel("status", "Status",
      ["Under Process", "Under Verification", "Under Approval", "Approved", "Rejected", "Active", "Settled", "Defaulter", "Cancelled", "Repossessed"],
      { defaultValue: "Under Process" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "HP-2001", customer: "Sara Khan", cnic: "35202-1234567-8", guarantor: "Ali Khan", product: "Gree 1.5 Ton AC", totalPrice: 198000, down: 40000, financed: 158000, tenure: 12, monthly: 13500, startDate: "2026-04-01", status: "Active" },
    { id: "2", ref: "HP-2002", customer: "Ahmed Raza", cnic: "35202-9876543-2", guarantor: "Imran Raza", product: "Samsung LED TV 55", totalPrice: 165000, down: 35000, financed: 130000, tenure: 10, monthly: 13800, startDate: "2026-03-15", status: "Active" },
    { id: "3", ref: "HP-2003", customer: "Sara Khan", cnic: "35202-1234567-8", guarantor: "Ali Khan", product: "Haier Refrigerator", totalPrice: 142000, down: 30000, financed: 112000, tenure: 12, monthly: 9800, startDate: "2026-05-01", status: "Under Approval" },
    { id: "4", ref: "HP-2004", customer: "Faisal Mehmood", cnic: "35202-1112223-3", guarantor: "—", product: "Honda 70 Bike", totalPrice: 165000, down: 25000, financed: 140000, tenure: 18, monthly: 8500, startDate: "2025-10-10", status: "Defaulter" },
    { id: "5", ref: "HP-2005", customer: "Hira Tariq", cnic: "35202-3344556-1", guarantor: "Tariq Mehmood", product: "Dawlance Microwave", totalPrice: 58000, down: 10000, financed: 48000, tenure: 6, monthly: 8200, startDate: "2026-05-12", status: "Under Process" },
    { id: "6", ref: "HP-2006", customer: "Adnan Pervaiz", cnic: "35202-7788991-0", guarantor: "Bilal Pervaiz", product: "Infinix Note 30 Pro", totalPrice: 78000, down: 15000, financed: 63000, tenure: 9, monthly: 7100, startDate: "2026-05-08", status: "Under Verification" },
    { id: "7", ref: "HP-2007", customer: "Fatima Noor", cnic: "35202-4422111-7", guarantor: "Noor Ahmed", product: "Orient Washing Machine", totalPrice: 92000, down: 18000, financed: 74000, tenure: 10, monthly: 7600, startDate: "2026-05-15", status: "Approved" },
    { id: "8", ref: "HP-2008", customer: "Bilal Khan", cnic: "35202-1199883-4", guarantor: "—", product: "HP Pavilion Laptop", totalPrice: 235000, down: 50000, financed: 185000, tenure: 18, monthly: 11000, startDate: "2026-04-20", status: "Rejected" },
    { id: "9", ref: "HP-2009", customer: "Rashid Mehmood", cnic: "35202-5566778-9", guarantor: "Junaid Khan", product: 'Samsung 55" Crystal UHD', totalPrice: 178000, down: 35000, financed: 143000, tenure: 12, monthly: 12000, startDate: "2024-08-01", status: "Settled" },
  ],
};

export const deliveriesConfig: EntityPageProps<any> = {
  title: "Deliveries",
  description: "Outbound deliveries to customers — schedule, vehicle, driver and proof of delivery.",
  storageKey: "qcrm.deliveries.v2",
  withAvatar: { nameKey: "ref", subKey: "customer" },
  searchKeys: ["ref", "customer", "invoice", "driver"],
  kpis: [
    { label: "Total Deliveries", icon: <Truck className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Scheduled", "Scheduled", "warning", <Calendar className="h-5 w-5" />),
    STATUS_KPI("Delivered", "Delivered", "success", <ClipboardCheck className="h-5 w-5" />),
    STATUS_KPI("Failed", "Failed", "destructive", <AlertTriangle className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Delivery #" },
    { key: "invoice", header: "Invoice / Case" },
    { key: "customer", header: "Customer" },
    { key: "address", header: "Address" },
    { key: "scheduled", header: "Scheduled" },
    { key: "vehicle", header: "Vehicle" },
    { key: "driver", header: "Driver" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Delivery #", { required: true }),
    text("invoice", "Invoice / HP Case Ref"),
    text("customer", "Customer", { required: true }),
    area("address", "Delivery Address"),
    { name: "scheduled", label: "Scheduled Date", type: "date" },
    sel("vehicle", "Vehicle", ["LEH-1234", "LES-5621", "KHI-8899", "LEB-2245"]),
    text("driver", "Driver"),
    text("contact", "Contact #"),
    sel("status", "Status", ["Pending", "Scheduled", "In Transit", "Delivered", "Failed", "Returned"], { defaultValue: "Pending" }),
    text("gatePass", "Gate Pass #"),
    { name: "deliveredAt", label: "Delivered At", type: "date" },
    text("podBy", "Received By (POD)"),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "DEL-9001", invoice: "INV-7001", customer: "Imran Ali", address: "House 12, Model Town", scheduled: TODAY_ISO(), vehicle: "LEH-1234", driver: "Asif Khan", status: "Delivered", gatePass: "GP-2001", deliveredAt: TODAY_ISO(), podBy: "Imran Ali" },
    { id: "2", ref: "DEL-9002", invoice: "INV-7002", customer: "Sara Khan", address: "Block C, Gulberg", scheduled: TODAY_ISO(), vehicle: "LES-5621", driver: "Bilal Hussain", status: "In Transit", gatePass: "GP-2002" },
    { id: "3", ref: "DEL-9003", invoice: "INV-7003", customer: "Ali Raza", address: "Street 5, DHA 5", scheduled: ADD_DAYS(1), vehicle: "LEH-1234", driver: "Asif Khan", status: "Scheduled", gatePass: "GP-2003" },
    { id: "4", ref: "DEL-9004", invoice: "INV-7004", customer: "Hira Tariq", address: "DHA Phase 5, Lahore", scheduled: "", vehicle: "", driver: "", status: "Pending" },
    { id: "5", ref: "DEL-9005", invoice: "INV-7005", customer: "Adnan Pervaiz", address: "Model Town, Lahore", scheduled: ADD_DAYS(2), vehicle: "KHI-8899", driver: "Tariq Mahmood", status: "Scheduled", gatePass: "GP-2005" },
    { id: "6", ref: "DEL-9006", invoice: "INV-7006", customer: "Fatima Noor", address: "F-11 Markaz, Islamabad", scheduled: ADD_DAYS(-1), vehicle: "LEB-2245", driver: "Naveed Akhtar", status: "Failed", gatePass: "GP-2006" },
    { id: "7", ref: "DEL-9007", invoice: "INV-7007", customer: "Bilal Khan", address: "Johar Town, Lahore", scheduled: TODAY_ISO(), vehicle: "LES-5621", driver: "Bilal Hussain", status: "In Transit", gatePass: "GP-2007" },
    { id: "8", ref: "DEL-9008", invoice: "INV-7008", customer: "Sadia Shah", address: "Garden Town, Lahore", scheduled: "", vehicle: "", driver: "", status: "Pending" },
  ],
};

export const salesReturnsConfig: EntityPageProps<any> = {
  title: "Sales Returns",
  description: "Customer returns with reason, restock and refund tracking.",
  storageKey: "qcrm.sales-returns",
  withAvatar: { nameKey: "ref", subKey: "customer" },
  searchKeys: ["ref", "customer", "invoice", "product"],
  kpis: [
    { label: "Total Returns", icon: <ArrowLeftRight className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Refunded Amount", icon: <Wallet className="h-5 w-5" />, tone: "warning", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    STATUS_KPI("Approved", "Approved", "success", <ClipboardCheck className="h-5 w-5" />),
    STATUS_KPI("Pending", "Pending", "warning", <Clock className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Return #" },
    { key: "date", header: "Date" },
    { key: "invoice", header: "Invoice" },
    { key: "customer", header: "Customer" },
    { key: "product", header: "Product" },
    { key: "qty", header: "Qty" },
    { key: "reason", header: "Reason" },
    { key: "amount", header: "Refund", render: (i: any) => Rs(i.amount) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Return #", { required: true }),
    { name: "date", label: "Return Date", type: "date", required: true },
    text("invoice", "Invoice / Case Ref"),
    text("customer", "Customer", { required: true }),
    text("product", "Product"),
    num("qty", "Quantity", { defaultValue: 1 }),
    sel("reason", "Reason", ["Defective", "Wrong Item", "Customer Cancelled", "Damaged on Delivery", "Buyer's Remorse", "Other"], { defaultValue: "Defective" }),
    num("amount", "Refund Amount (Rs.)"),
    sel("refundMethod", "Refund Method", ["Cash", "Bank Transfer", "Credit Note", "Replacement"], { defaultValue: "Credit Note" }),
    sel("status", "Status", ["Pending", "Approved", "Rejected", "Refunded"], { defaultValue: "Pending" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "SR-4001", date: "2026-05-06", invoice: "INV-7001", customer: "Imran Ali", product: "Samsung LED TV 55", qty: 1, reason: "Defective", amount: 149999, refundMethod: "Replacement", status: "Approved" },
    { id: "2", ref: "SR-4002", date: "2026-05-07", invoice: "HP-2001", customer: "Sara Khan", product: "Microwave Oven", qty: 1, reason: "Wrong Item", amount: 24000, refundMethod: "Credit Note", status: "Pending" },
  ],
};

export const receiptsConfig: EntityPageProps<any> = {
  title: "Receipts / Payments Received",
  description: "All money received from customers — cash sales, EMI collections, advances.",
  storageKey: "qcrm.receipts",
  withAvatar: { nameKey: "ref", subKey: "customer" },
  searchKeys: ["ref", "customer", "invoice", "method"],
  kpis: [
    { label: "Total Receipts", icon: <Receipt className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total Received", icon: <Wallet className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    { label: "Today", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.filter((x: any) => x.date === new Date().toISOString().slice(0,10)).reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    STATUS_KPI("Pending", "Pending", "warning", <Clock className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Receipt #" },
    { key: "date", header: "Date" },
    { key: "customer", header: "Customer" },
    { key: "invoice", header: "Against" },
    { key: "type", header: "Type" },
    { key: "method", header: "Method" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "collectedBy", header: "Collected By" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Receipt #", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    text("customer", "Customer", { required: true }),
    text("invoice", "Invoice / Case Ref"),
    sel("type", "Receipt Type", ["Cash Sale", "EMI / Installment", "Down Payment", "Advance", "Refund Reversal"], { defaultValue: "EMI / Installment" }),
    sel("method", "Method", ["Cash", "Bank Transfer", "Cheque", "EasyPaisa", "JazzCash", "Card"], { defaultValue: "Cash" }),
    num("amount", "Amount (Rs.)", { required: true }),
    text("collectedBy", "Collected By"),
    sel("status", "Status", ["Pending", "Cleared", "Bounced", "Cancelled"], { defaultValue: "Cleared" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "RCP-6001", date: "2026-05-07", customer: "Imran Ali", invoice: "INV-7001", type: "Cash Sale", method: "Cash", amount: 149999, collectedBy: "Bilal", status: "Cleared" },
    { id: "2", ref: "RCP-6002", date: "2026-05-07", customer: "Sara Khan", invoice: "HP-2001", type: "EMI / Installment", method: "EasyPaisa", amount: 13500, collectedBy: "Recovery Agent", status: "Cleared" },
    { id: "3", ref: "RCP-6003", date: "2026-05-06", customer: "Sara Khan", invoice: "HP-2001", type: "Down Payment", method: "Bank Transfer", amount: 40000, collectedBy: "Counter", status: "Cleared" },
    { id: "4", ref: "RCP-6004", date: "2026-05-05", customer: "Ahmed Raza", invoice: "HP-2002", type: "EMI / Installment", method: "JazzCash", amount: 13800, collectedBy: "Recovery Agent", status: "Cleared" },
    { id: "5", ref: "RCP-6005", date: "2026-05-08", customer: "Sara Khan", invoice: "HP-2001", type: "EMI / Installment", method: "Cash", amount: 13500, collectedBy: "Bilal", status: "Pending" },
  ],
};

export const paymentsReceivedConfig: EntityPageProps<any> = {
  title: "Payments Received",
  description: "Installment collections received against active contracts.",
  addLabel: "Record Payment",
  storageKey: "qcrm.payments-received",
  addHref: "/payments-received/new",
  editHref: (i: any) => `/payments-received/${i.id}/edit`,
  withAvatar: {
    nameKey: "ref",
    subKey: "at",
  },
  searchKeys: ["ref", "contract", "customer", "customerId", "mode"],
  kpis: [
    { label: "Total Payments", icon: <Receipt className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total Collected", icon: <Wallet className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.paid || 0), 0)) },
    { label: "This Month", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => {
      const now = new Date(); const m = now.getMonth(); const y = now.getFullYear();
      return Rs(i.filter((x: any) => { const d = new Date(x.date); return d.getMonth() === m && d.getFullYear() === y; }).reduce((s: number, x: any) => s + Number(x.paid || 0), 0));
    } },
    { label: "Outstanding Due", icon: <Clock className="h-5 w-5" />, tone: "warning", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Math.max(0, Number(x.due || 0) - Number(x.paid || 0)), 0)) },
  ],
  columns: [
    { key: "ref", header: "Payment #" },
    {
      key: "contract",
      header: "Contract #",
      render: (i: any) => (
        <Link
          to="/contracts"
          onClick={(e) => e.stopPropagation()}
          className="font-semibold text-primary hover:underline"
          title="View contract"
        >
          {i.contract}
        </Link>
      ),
    },
    {
      key: "customer",
      header: "Customer",
      render: (i: any) => (
        <div className="leading-tight">
          <div className="font-semibold text-foreground">{i.customer}</div>
          {i.customerId && <div className="text-xs text-muted-foreground font-medium mt-0.5">{i.customerId}</div>}
        </div>
      ),
    },
    { key: "installment", header: "Installment" },
    { key: "due", header: "Due", render: (i: any) => Rs(i.due) },
    { key: "paid", header: "Paid", render: (i: any) => Rs(i.paid) },
    { key: "mode", header: "Mode" },
    { key: "collectedBy", header: "Collected By" },
  ],
  fields: [
    text("ref", "Payment #", { required: true }),
    { name: "date", label: "Payment Date", type: "date", required: true },
    text("contract", "Contract #", { required: true }),
    text("customer", "Customer", { required: true }),
    text("customerId", "Customer ID"),
    text("installment", "Installment (e.g. 3 of 12)"),
    num("due", "Due Amount (Rs.)"),
    num("paid", "Paid Amount (Rs.)", { required: true }),
    sel("mode", "Mode", ["Cash", "Bank Transfer", "Cheque", "EasyPaisa", "JazzCash", "Card"], { defaultValue: "Cash" }),
    text("reference", "Reference #"),
    text("collectedBy", "Collected By"),
    sel("status", "Status", ["Pending", "Cleared", "Bounced", "Cancelled"], { defaultValue: "Cleared" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "PR-9001", date: "2026-05-01", at: "2026-05-01 · 12:18 PM", contract: "HP-2001", customer: "Sara Khan", customerId: "CUS-1001", installment: "2 of 12", due: 13500, paid: 13500, mode: "EasyPaisa", reference: "EP-44812", collectedBy: "Recovery Agent", status: "Cleared" },
    { id: "2", ref: "PR-9002", date: "2026-05-03", at: "2026-05-03 · 09:55 AM", contract: "HP-2002", customer: "Ahmed Raza", customerId: "CUS-1002", installment: "3 of 10", due: 13800, paid: 13800, mode: "JazzCash", reference: "JC-90112", collectedBy: "Recovery Agent", status: "Cleared" },
    { id: "3", ref: "PR-9003", date: "2026-05-05", at: "2026-05-05 · 03:11 PM", contract: "HP-2001", customer: "Sara Khan", customerId: "CUS-1001", installment: "3 of 12", due: 13500, paid: 10000, mode: "Cash", collectedBy: "Bilal", status: "Cleared" },
    { id: "4", ref: "PR-9004", date: "2026-05-08", at: "2026-05-08 · 11:02 AM", contract: "HP-2004", customer: "Faisal Mehmood", customerId: "CUS-1004", installment: "8 of 18", due: 8500, paid: 8500, mode: "Bank Transfer", reference: "HBL-7781", collectedBy: "Counter", status: "Pending" },
    { id: "5", ref: "PR-9005", date: "2026-05-10", at: "2026-05-10 · 04:45 PM", contract: "HP-2009", customer: "Rashid Mehmood", customerId: "CUS-1009", installment: "12 of 12", due: 12000, paid: 12000, mode: "Cheque", reference: "CHQ-22310", collectedBy: "Counter", status: "Cleared" },
  ],
};

export const salesTeamConfig: EntityPageProps<any> = {
  title: "Sales Team",
  description: "Sales staff, branches, targets and commissions.",
  storageKey: "qcrm.sales-team",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "branch", "role"],
  kpis: [
    { label: "Team Members", icon: <Users className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <UserCheck className="h-5 w-5" />),
    { label: "Total MTD Sales", icon: <TrendingUp className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.mtdSales || 0), 0)) },
    { label: "Avg Achievement", icon: <Target className="h-5 w-5" />, tone: "primary", compute: (i) => i.length ? Math.round(i.reduce((s: number, x: any) => s + (Number(x.mtdSales) / Math.max(1, Number(x.target))) * 100, 0) / i.length) + "%" : "0%" },
  ],
  columns: [
    { key: "name", header: "Name" },
    { key: "role", header: "Role" },
    { key: "branch", header: "Branch" },
    { key: "phone", header: "Phone" },
    { key: "target", header: "Target", render: (i: any) => Rs(i.target) },
    { key: "mtdSales", header: "MTD Sales", render: (i: any) => Rs(i.mtdSales) },
    { key: "pct", header: "%", render: (i: any) => `${Math.round((Number(i.mtdSales) / Math.max(1, Number(i.target))) * 100)}%` },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Full Name", { required: true }),
    text("code", "Employee Code"),
    sel("role", "Role", ["Sales Executive", "Senior Sales", "Sales Manager", "Branch Manager", "Sales Trainer"], { required: true }),
    sel("branch", "Branch", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Main Warehouse"], { required: true }),
    text("phone", "Phone"),
    text("email", "Email"),
    num("target", "Monthly Target (Rs.)", { required: true }),
    num("mtdSales", "MTD Sales (Rs.)", { defaultValue: 0 }),
    num("commission", "Commission % ", { defaultValue: 2 }),
    status(),
  ],
  seed: [
    { id: "1", name: "Bilal Ahmed", code: "SLS-001", role: "Senior Sales", branch: "Model Town", phone: "+92 300 1112233", target: 1500000, mtdSales: 1280000, commission: 3, status: "Active" },
    { id: "2", name: "Usman Tariq", code: "SLS-002", role: "Sales Executive", branch: "Gulberg", phone: "+92 321 4445566", target: 1000000, mtdSales: 920000, commission: 2.5, status: "Active" },
    { id: "3", name: "Sana Khan", code: "SLS-003", role: "Branch Manager", branch: "DHA Phase 5", phone: "+92 333 7778899", target: 2500000, mtdSales: 2100000, commission: 4, status: "Active" },
    { id: "4", name: "Ahsan Iqbal", code: "SLS-004", role: "Sales Executive", branch: "Johar Town", phone: "+92 345 1234567", target: 1000000, mtdSales: 480000, commission: 2, status: "Active" },
  ],
};

export const salesTargetsConfig: EntityPageProps<any> = {
  title: "Sales Targets",
  description: "Monthly and quarterly sales targets by employee, branch and product line.",
  storageKey: "qcrm.sales-targets",
  withAvatar: { nameKey: "name", subKey: "period" },
  searchKeys: ["name", "type", "period"],
  kpis: [
    { label: "Active Targets", icon: <Target className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Avg Achievement", icon: <TrendingUp className="h-5 w-5" />, tone: "success", compute: (i) => i.length ? Math.round(i.reduce((s: number, x: any) => s + (Number(x.achieved) / Math.max(1, Number(x.target))) * 100, 0) / i.length) + "%" : "0%" },
    { label: "100%+", icon: <Target className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => Number(x.achieved) >= Number(x.target)).length },
    { label: "Below 80%", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => (Number(x.achieved) / Math.max(1, Number(x.target))) < 0.8).length },
  ],
  columns: [
    { key: "name", header: "Assignee" },
    { key: "type", header: "Type" },
    { key: "period", header: "Period" },
    { key: "target", header: "Target", render: (i: any) => Rs(i.target) },
    { key: "achieved", header: "Achieved", render: (i: any) => Rs(i.achieved) },
    { key: "pct", header: "%", render: (i: any) => `${Math.round((Number(i.achieved) / Math.max(1, Number(i.target))) * 100)}%` },
    { key: "incentive", header: "Incentive", render: (i: any) => Rs(i.incentive) },
  ],
  fields: [
    text("name", "Assignee (Employee/Branch)", { required: true }),
    sel("type", "Target Type", ["Employee", "Branch", "Product Line", "Region"], { required: true }),
    text("period", "Period", { placeholder: "May 2026" }),
    num("target", "Target Amount (Rs.)", { required: true }),
    num("achieved", "Achieved Amount (Rs.)", { defaultValue: 0 }),
    num("incentive", "Incentive (Rs.)"),
  ],
  seed: [
    { id: "1", name: "Bilal Ahmed", type: "Employee", period: "May 2026", target: 1500000, achieved: 1280000, incentive: 18000 },
    { id: "2", name: "Model Town", type: "Branch", period: "May 2026", target: 5000000, achieved: 4280000, incentive: 25000 },
    { id: "3", name: "Sana Khan", type: "Employee", period: "May 2026", target: 2500000, achieved: 2100000, incentive: 22000 },
    { id: "4", name: "Mobiles", type: "Product Line", period: "May 2026", target: 3500000, achieved: 3650000, incentive: 30000 },
  ],
};

// ============ INSTALLMENTS ============

export const installmentsActiveConfig: EntityPageProps<any> = {
  title: "Active Installments",
  description: "All running installment contracts.",
  storageKey: "qcrm.instActive",
  withAvatar: { nameKey: "customer", subKey: "contract" },
  searchKeys: ["customer", "contract", "cnic"],
  kpis: [
    { label: "Active Contracts", icon: <CreditCard className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.status === "Active").length },
    { label: "Receivable", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.balance || 0), 0)) },
    STATUS_KPI("Overdue", "Overdue", "destructive", <AlertTriangle className="h-5 w-5" />),
    STATUS_KPI("Settled", "Settled", "success", <CreditCard className="h-5 w-5" />),
  ],
  columns: [
    { key: "contract", header: "Contract #" },
    { key: "customer", header: "Customer" },
    { key: "product", header: "Product" },
    { key: "balance", header: "Balance", render: (i: any) => Rs(i.balance) },
    { key: "nextDue", header: "Next Due" },
    { key: "monthly", header: "Monthly", render: (i: any) => Rs(i.monthly) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("contract", "Contract #", { required: true }),
    text("customer", "Customer", { required: true }),
    text("cnic", "CNIC"),
    text("product", "Product"),
    num("balance", "Outstanding (Rs.)"),
    { name: "nextDue", label: "Next Due Date", type: "date" },
    num("monthly", "Monthly (Rs.)"),
    sel("status", "Status", ["Active", "Overdue", "Settled", "Defaulter", "Repossessed"], { defaultValue: "Active" }),
  ],
  seed: [
    { id: "1", contract: "INS-9001", customer: "Sara Khan", cnic: "35202-1234567-8", product: "Gree 1.5 Ton AC", balance: 145000, nextDue: "2026-06-01", monthly: 13500, status: "Active" },
    { id: "2", contract: "INS-9002", customer: "Ahmed Raza", cnic: "35202-9876543-2", product: "Samsung TV 55", balance: 88000, nextDue: "2026-05-03", monthly: 11000, status: "Overdue" },
  ],
};

export const installmentsTodayConfig: EntityPageProps<any> = {
  title: "Today's Collections",
  description: "Receipts due today with quick payment actions.",
  storageKey: "qcrm.instToday",
  withAvatar: { nameKey: "customer", subKey: "contract" },
  searchKeys: ["customer", "contract"],
  kpis: [
    { label: "Due Today", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Collected", icon: <Banknote className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.status === "Paid").length },
    { label: "Pending", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.status === "Pending").length },
    { label: "Amount Due", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
  ],
  columns: [
    { key: "contract", header: "Contract" },
    { key: "customer", header: "Customer" },
    { key: "phone", header: "Phone" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "agent", header: "Agent" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("contract", "Contract #", { required: true }),
    text("customer", "Customer", { required: true }),
    text("phone", "Phone"),
    num("amount", "Amount (Rs.)", { required: true }),
    text("agent", "Recovery Agent"),
    sel("status", "Status", ["Pending", "Paid", "Promise", "Failed"], { defaultValue: "Pending" }),
  ],
  seed: [
    { id: "1", contract: "INS-9001", customer: "Sara Khan", phone: "+92 300 1234567", amount: 13500, agent: "Bilal Ahmed", status: "Paid" },
    { id: "2", contract: "INS-9003", customer: "Imran Ali", phone: "+92 321 9988776", amount: 11000, agent: "Sana Khan", status: "Pending" },
  ],
};

export const installmentsOverdueConfig: EntityPageProps<any> = {
  title: "Overdue & Defaulters",
  description: "Risk dashboard for overdue contracts.",
  storageKey: "qcrm.instOverdue",
  withAvatar: { nameKey: "customer", subKey: "contract" },
  searchKeys: ["customer", "contract", "cnic"],
  kpis: [
    { label: "Overdue Cases", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive", compute: (i) => i.length },
    { label: "Total Overdue", icon: <Wallet className="h-5 w-5" />, tone: "destructive", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    STATUS_KPI("Defaulters", "Defaulter", "destructive", <UserX className="h-5 w-5" />),
    { label: "Avg Days Late", icon: <Clock className="h-5 w-5" />, tone: "warning", compute: (i) => i.length ? Math.round(i.reduce((s: number, x: any) => s + Number(x.days || 0), 0) / i.length) : 0 },
  ],
  columns: [
    { key: "contract", header: "Contract" },
    { key: "customer", header: "Customer" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "days", header: "Days Late" },
    { key: "agent", header: "Agent" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("contract", "Contract #", { required: true }),
    text("customer", "Customer", { required: true }),
    text("cnic", "CNIC"),
    num("amount", "Overdue Amount (Rs.)", { required: true }),
    num("days", "Days Late", { required: true }),
    text("agent", "Recovery Agent"),
    sel("status", "Status", ["Overdue", "Defaulter", "Legal", "Repossessed"], { defaultValue: "Overdue" }),
    area("remarks", "Remarks"),
  ],
  seed: [
    { id: "1", contract: "INS-9002", customer: "Ahmed Raza", cnic: "35202-9876543-2", amount: 22000, days: 12, agent: "Bilal Ahmed", status: "Overdue" },
    { id: "2", contract: "INS-9007", customer: "Faisal Mehmood", cnic: "35202-1112223-3", amount: 65000, days: 47, agent: "Usman Tariq", status: "Defaulter" },
  ],
};

export const installmentPlansConfig: EntityPageProps<any> = { ...pricingPlansConfig, title: "Installment Plans", addLabel: "Add Installment Plan", addHref: "/installments/plans/new" };

// ============ RECOVERY ============

export const recoveryAgentsConfig: EntityPageProps<any> = {
  title: "Recovery Agents",
  description: "Field agents, areas and capacity.",
  storageKey: "qcrm.agents",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "area", "phone"],
  kpis: [
    { label: "Total Agents", icon: <HandCoins className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <HandCoins className="h-5 w-5" />),
    { label: "Areas Covered", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.area)).size },
    { label: "Avg Recovery", icon: <Wallet className="h-5 w-5" />, tone: "success", compute: (i) => i.length ? Rs(Math.round(i.reduce((s: number, x: any) => s + Number(x.recovered || 0), 0) / i.length)) : Rs(0) },
  ],
  columns: [
    { key: "name", header: "Agent" },
    { key: "phone", header: "Phone" },
    { key: "area", header: "Area" },
    { key: "branch", header: "Branch" },
    { key: "recovered", header: "Recovered (M)", render: (i: any) => Rs(i.recovered) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Full Name", { required: true }),
    text("code", "Code"),
    text("phone", "Phone", { required: true }),
    text("cnic", "CNIC"),
    text("area", "Assigned Area"),
    sel("branch", "Branch", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town"]),
    num("recovered", "Recovered This Month (Rs.)", { defaultValue: 0 }),
    status(),
  ],
  seed: [
    { id: "1", name: "Bilal Ahmed", code: "RA-01", phone: "+92 300 1112233", area: "Model Town", branch: "Model Town", recovered: 425000, status: "Active" },
    { id: "2", name: "Sana Khan", code: "RA-02", phone: "+92 301 4445566", area: "Gulberg", branch: "Gulberg", recovered: 289000, status: "Active" },
    { id: "3", name: "Usman Tariq", code: "RA-03", phone: "+92 302 7778899", area: "Johar Town", branch: "Johar Town", recovered: 131000, status: "Active" },
  ],
};

export const recoveryDailyConfig: EntityPageProps<any> = {
  title: "Daily Recovery Sheet",
  description: "Visit log, collections and approvals.",
  storageKey: "qcrm.recoveryDaily",
  withAvatar: { nameKey: "customer", subKey: "contract" },
  searchKeys: ["customer", "contract", "agent"],
  kpis: [
    { label: "Visits Today", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Collected", icon: <Wallet className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.collected || 0), 0)) },
    { label: "Failed", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive", compute: (i) => i.filter((x: any) => x.visit === "Failed").length },
    { label: "Promise to Pay", icon: <Clock className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.visit === "Promise").length },
  ],
  columns: [
    { key: "contract", header: "Contract" },
    { key: "customer", header: "Customer" },
    { key: "agent", header: "Agent" },
    { key: "due", header: "Due", render: (i: any) => Rs(i.due) },
    { key: "collected", header: "Collected", render: (i: any) => Rs(i.collected) },
    { key: "visit", header: "Visit" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("contract", "Contract #", { required: true }),
    text("customer", "Customer", { required: true }),
    text("agent", "Agent", { required: true }),
    num("due", "Due Amount (Rs.)", { required: true }),
    num("collected", "Collected (Rs.)", { defaultValue: 0 }),
    sel("visit", "Visit Status", ["Collected", "Promise", "Failed", "Not Available", "Refused"], { defaultValue: "Collected" }),
    sel("status", "Approval", ["Pending", "Approved", "Rejected"], { defaultValue: "Pending" }),
    area("remarks", "Remarks"),
  ],
  seed: [
    { id: "1", contract: "INS-9001", customer: "Sara Khan", agent: "Bilal Ahmed", due: 13500, collected: 13500, visit: "Collected", status: "Approved" },
    { id: "2", contract: "INS-9002", customer: "Ahmed Raza", agent: "Bilal Ahmed", due: 11000, collected: 0, visit: "Promise", status: "Pending" },
  ],
};

export const recoveryShortfallsConfig: EntityPageProps<any> = {
  title: "Recovery Shortfalls",
  description: "Approve agent liability and salary deductions.",
  storageKey: "qcrm.shortfalls",
  withAvatar: { nameKey: "agent", subKey: "contract" },
  searchKeys: ["agent", "customer", "contract"],
  kpis: [
    { label: "Open Cases", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.status === "Pending").length },
    { label: "Total Shortfall", icon: <Wallet className="h-5 w-5" />, tone: "destructive", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    STATUS_KPI("Approved", "Approved", "success", <ClipboardCheck className="h-5 w-5" />),
    STATUS_KPI("Reversed", "Reversed", "primary", <ClipboardCheck className="h-5 w-5" />),
  ],
  columns: [
    { key: "agent", header: "Agent" },
    { key: "customer", header: "Customer" },
    { key: "contract", header: "Contract" },
    { key: "amount", header: "Shortfall", render: (i: any) => Rs(i.amount) },
    { key: "reason", header: "Reason" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("agent", "Agent", { required: true }),
    text("customer", "Customer", { required: true }),
    text("contract", "Contract #"),
    num("amount", "Amount (Rs.)", { required: true }),
    text("reason", "Reason"),
    sel("status", "Status", ["Pending", "Approved", "Deducted", "Reversed", "Waived"], { defaultValue: "Pending" }),
    area("remarks", "Manager Remarks"),
  ],
  seed: [
    { id: "1", agent: "Bilal Ahmed", customer: "Faisal Mehmood", contract: "INS-9007", amount: 22000, reason: "Customer absconded", status: "Pending" },
  ],
};

// ============ CUSTOMERS ============

export const customersConfig: EntityPageProps<any> = {
  title: "Customers",
  description: "All customers with CNIC, KYC and risk score.",
  storageKey: "qcrm.customers",
  addHref: "/customers/new",
  rowHref: (i: any) => `/customers/${i.id}`,
  editHref: (i: any) => `/customers/${i.id}/edit`,
  withAvatar: { nameKey: "name", subKey: "cnic", nameHref: (i: any) => `/customers/${i.id}` },
  searchKeys: ["name", "cnic", "phone", "area", "city"],
  kpis: [
    { label: "Total Customers", icon: <Users className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <UserCheck className="h-5 w-5" />),
    STATUS_KPI("Blacklisted", "Blacklisted", "destructive", <UserX className="h-5 w-5" />),
    { label: "High Risk", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => Number(x.risk) >= 70).length },
  ],
  columns: [
    { key: "name", header: "Customer", render: (i: any) => {
      const v = String(i.verification || "");
      const tick = v === "Verified"
        ? { cls: "text-sky-500", title: "Fully verified" }
        : v === "Partial"
        ? { cls: "text-amber-500", title: "Partially verified" }
        : null;
      return (
        <span className="inline-flex items-center gap-1">
          <span>{i.name || "—"}</span>
          {tick && (
            <svg viewBox="0 0 24 24" className={`h-4 w-4 shrink-0 ${tick.cls}`} aria-label={tick.title}>
              <title>{tick.title}</title>
              <path fill="currentColor" d="M12 2l2.39 1.74 2.94-.34 1.2 2.71 2.71 1.2-.34 2.94L22.66 12l-1.76 2.39.34 2.94-2.71 1.2-1.2 2.71-2.94-.34L12 22.66l-2.39-1.76-2.94.34-1.2-2.71-2.71-1.2.34-2.94L1.34 12l1.76-2.39-.34-2.94 2.71-1.2 1.2-2.71 2.94.34L12 2z"/>
              <path fill="#fff" d="M10.6 15.4l-3-3 1.4-1.4 1.6 1.6 4.4-4.4 1.4 1.4z"/>
            </svg>
          )}
        </span>
      );
    } },
    { key: "phone", header: "Phone", render: (i: any) => <span className="font-medium text-foreground">{i.phone || "—"}</span> },
    { key: "area", header: "Area / City", render: (i: any) => (
      <div className="flex flex-col leading-tight">
        <span className="font-medium text-foreground">{i.area || "—"}</span>
        <span className="text-xs text-muted-foreground font-medium mt-0.5">{i.city || "—"}</span>
      </div>
    ) },
    { key: "receivable", header: "Receivable", render: (i: any) => {
      const v = Number(i.receivable || 0);
      const overdue = Number(i.overdue || 0);
      return (
        <div className="flex flex-col leading-tight">
          <span className={`font-semibold tabular-nums ${v > 0 ? "text-foreground" : "text-muted-foreground"}`}>{v > 0 ? Rs(v) : "—"}</span>
          {overdue > 0 && (
            <span className="text-[11px] text-destructive font-semibold mt-0.5">{Rs(overdue)} overdue</span>
          )}
        </div>
      );
    } },
    { key: "assignedTo", header: "Assigned To", render: (i: any) => {
      const name = String(i.assignedTo || "").trim();
      if (!name) return <span className="text-muted-foreground">—</span>;
      const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
      return (
        <div className="flex items-center gap-2 min-w-0">
          <span className="h-6 w-6 shrink-0 rounded-full grid place-items-center text-[10px] font-bold bg-primary-soft text-primary">{initials}</span>
          <div className="flex flex-col leading-tight min-w-0">
            <span className="font-medium text-foreground truncate">{name}</span>
            {i.assignedRole && <span className="text-[11px] text-muted-foreground font-medium truncate">{i.assignedRole}</span>}
          </div>
        </div>
      );
    } },
    { key: "credit", header: "Credit Score", render: (i: any) => {
      const v = Number(i.credit || 0);
      if (v <= 0) return <span className="text-muted-foreground">—</span>;
      const color = v >= 750 ? "text-emerald-600"
                  : v >= 650 ? "text-primary"
                  : v >= 550 ? "text-amber-600"
                  :            "text-destructive";
      return <span className={`font-semibold tabular-nums ${color}`}>{v}</span>;
    } },
    { key: "status", header: "Status", render: (i: any) => {
      const s = String(i.status || "");
      const level = s === "Blacklisted" ? { dot: "bg-destructive", text: "text-destructive", ring: "ring-destructive/30" }
                  : s === "Inactive"    ? { dot: "bg-muted-foreground", text: "text-muted-foreground", ring: "ring-border" }
                  :                       { dot: "bg-success", text: "text-success", ring: "ring-success/30" };
      return (
        <span className={`inline-flex items-center gap-1.5 rounded-full bg-background px-2 py-0.5 text-[11px] font-bold uppercase tracking-wide ring-1 ${level.ring} ${level.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${level.dot}`} />
          {s || "—"}
        </span>
      );
    } },
  ],
  fields: [
    text("name", "Full Name", { required: true }),
    text("father", "Father / Husband Name"),
    text("cnic", "CNIC", { required: true, placeholder: "XXXXX-XXXXXXX-X" }),
    text("phone", "Mobile", { required: true }),
    text("whatsapp", "WhatsApp"),
    text("email", "Email"),
    text("area", "Area / Zone"),
    text("city", "City"),
    text("occupation", "Occupation"),
    num("income", "Monthly Income (Rs.)"),
    num("receivable", "Outstanding Receivable (Rs.)", { defaultValue: 0 }),
    num("overdue", "Overdue Amount (Rs.)", { defaultValue: 0 }),
    text("assignedTo", "Assigned To (Officer)"),
    sel("assignedRole", "Officer Role", ["Sales Officer", "Recovery Officer", "Relationship Mgr", "Branch Manager"], { defaultValue: "Sales Officer" }),
    num("credit", "Credit Score (300-850)", { defaultValue: 650 }),
    num("risk", "Risk Score (0-100)", { defaultValue: 30 }),
    sel("verification", "KYC Verification", ["Verified", "Partial", "Unverified"], { defaultValue: "Unverified" }),
    sel("status", "Status", ["Active", "Inactive", "Blacklisted"], { defaultValue: "Active" }),
    area("address", "Current Address"),
  ],
  seed: [
    { id: "1", name: "Sara Khan", father: "Imran Khan", cnic: "35202-1234567-8", phone: "+92 300 1234567", whatsapp: "+92 300 1234567", email: "sara.khan@email.com", area: "Model Town", city: "Lahore", address: "12-C, Model Town Link Road, Lahore", occupation: "Teacher", income: 85000, receivable: 145000, overdue: 0, assignedTo: "Bilal Ahmed", assignedRole: "Sales Officer", credit: 720, risk: 25, verification: "Verified", status: "Active" },
    { id: "2", name: "Ahmed Raza", father: "Raza Hussain", cnic: "35202-9876543-2", phone: "+92 321 9988776", whatsapp: "+92 321 9988776", email: "", area: "Johar Town", city: "Lahore", address: "45-B, Johar Town Block E, Lahore", occupation: "Shopkeeper", income: 65000, receivable: 78000, overdue: 13500, assignedTo: "Hira Saleem", assignedRole: "Recovery Officer", credit: 580, risk: 55, verification: "Partial", status: "Active" },
    { id: "3", name: "Faisal Mehmood", father: "Mehmood Ali", cnic: "35202-1112223-3", phone: "+92 302 7778899", whatsapp: "", email: "", area: "DHA", city: "Karachi", address: "House 88, Street 12, DHA Phase 5, Karachi", occupation: "Driver", income: 45000, receivable: 65000, overdue: 65000, assignedTo: "Tariq Mahmood", assignedRole: "Recovery Officer", credit: 420, risk: 82, verification: "Unverified", status: "Blacklisted" },
    { id: "4", name: "Nadia Bibi", father: "Aslam Khan", cnic: "35202-4445556-7", phone: "+92 333 1122334", whatsapp: "+92 333 1122334", email: "nadia.bibi@email.com", area: "Gulberg", city: "Lahore", address: "78-A, Gulberg III, Near Liberty Market, Lahore", occupation: "Doctor", income: 180000, receivable: 0, overdue: 0, assignedTo: "Bilal Ahmed", assignedRole: "Sales Officer", credit: 810, risk: 15, verification: "Verified", status: "Active" },
    { id: "5", name: "Kamran Abbas", father: "Abbas Ali", cnic: "35202-6667778-9", phone: "+92 345 5566778", whatsapp: "", email: "kamran.a@outlook.com", area: "Bahria Town", city: "Islamabad", address: "Plot 45, Sector C, Bahria Town, Islamabad", occupation: "Business Owner", income: 250000, receivable: 320000, overdue: 45000, assignedTo: "Sana Tariq", assignedRole: "Relationship Mgr", credit: 670, risk: 42, verification: "Verified", status: "Active" },
    { id: "6", name: "Rukhsana Parveen", father: "Ghulam Rasool", cnic: "35202-8889990-1", phone: "+92 312 3344556", whatsapp: "+92 312 3344556", email: "", area: "Wapda Town", city: "Lahore", address: "House 5, Block B, Wapda Town, Lahore", occupation: "Government", income: 72000, receivable: 95000, overdue: 0, assignedTo: "Bilal Ahmed", assignedRole: "Sales Officer", credit: 695, risk: 35, verification: "Partial", status: "Active" },
    { id: "7", name: "Zeshan Haider", father: "Haider Abbas", cnic: "35202-2223334-5", phone: "+92 301 9988776", whatsapp: "", email: "zeshan.h@gmail.com", area: "Faisal Town", city: "Lahore", address: "22-D, Faisal Town, Near Dina Nath Chowk, Lahore", occupation: "Freelancer", income: 55000, receivable: 0, overdue: 0, assignedTo: "", assignedRole: "", credit: 0, risk: 0, verification: "Unverified", status: "Inactive" },
    { id: "8", name: "Farhan Qureshi", father: "Qureshi Ahmad", cnic: "35202-5556667-8", phone: "+92 304 2233445", whatsapp: "+92 304 2233445", email: "", area: "Gulshan-e-Iqbal", city: "Karachi", address: "Flat 3B, Block 7, Gulshan-e-Iqbal, Karachi", occupation: "Engineer", income: 120000, receivable: 210000, overdue: 88000, assignedTo: "Hira Saleem", assignedRole: "Recovery Officer", credit: 490, risk: 68, verification: "Partial", status: "Active" },
  ],
};

export const guarantorsConfig: EntityPageProps<any> = {
  title: "Guarantors",
  description: "Co-signers backing customer contracts — KYC, linked contracts and exposure.",
  storageKey: "qcrm.guarantors",
  withAvatar: { nameKey: "name", subKey: "cnic" },
  searchKeys: ["name", "cnic", "phone", "customer", "caseRef", "city"],
  filters: [
    { key: "status", label: "KYC Status" },
    { key: "relation", label: "Relation" },
    { key: "contractStatus", label: "Contract Status" },
  ],
  kpis: [
    { label: "Total Guarantors", icon: <UserCheck className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("KYC Verified", "Verified", "success", <ShieldCheck className="h-5 w-5" />),
    STATUS_KPI("Pending Verification", "Pending", "warning", <Hourglass className="h-5 w-5" />),
    {
      label: "Active Exposure",
      hint: "Sum of financed amount on contracts currently active",
      icon: <Wallet className="h-5 w-5" />,
      tone: "primary",
      compute: (i) => Rs(
        i.filter((x: any) => x.contractStatus === "Active")
         .reduce((s: number, x: any) => s + Number(x.exposure || 0), 0)
      ),
    },
  ],
  columns: [
    { key: "name", header: "Guarantor" },
    {
      key: "phone",
      header: "Contact",
      render: (i: any) => (
        <div className="leading-tight">
          <div className="text-sm font-medium text-foreground">{i.phone || "—"}</div>
          <div className="text-[11px] text-muted-foreground">{i.city || "—"}</div>
        </div>
      ),
    },
    {
      key: "customer",
      header: "For Customer",
      render: (i: any) => (
        <div className="leading-tight">
          <div className="text-sm font-medium text-foreground">{i.customer || "—"}</div>
          <div className="text-[11px] text-muted-foreground">{i.relation || "—"}</div>
        </div>
      ),
    },
    {
      key: "caseRef",
      header: "Contract",
      render: (i: any) => i.caseRef ? (
        <Link
          to="/contracts"
          className="inline-flex flex-col leading-tight font-mono text-primary hover:underline"
        >
          <span className="text-sm font-semibold">{i.caseRef}</span>
          <span className="text-[11px] text-muted-foreground font-sans">
            {i.contractStatus || "—"}
          </span>
        </Link>
      ) : <span className="text-muted-foreground text-xs">Unlinked</span>,
    },
    {
      key: "exposure",
      header: "Exposure",
      render: (i: any) => (
        <div className="leading-tight text-right">
          <div className="text-sm font-semibold text-foreground">{Rs(i.exposure || 0)}</div>
          <div className="text-[11px] text-muted-foreground">{i.tenure ? `${i.tenure} mo` : "—"}</div>
        </div>
      ),
    },
    { key: "status", header: "KYC", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Guarantor Name", { required: true }),
    text("cnic", "CNIC", { required: true }),
    text("phone", "Mobile", { required: true }),
    text("altPhone", "Alternate Phone"),
    text("city", "City / Area"),
    text("occupation", "Occupation"),
    num("income", "Monthly Income (Rs.)"),
    sel("relation", "Relation to Customer",
      ["Father", "Brother", "Husband", "Son", "Friend", "Colleague", "Relative", "Employer", "Other"],
      { defaultValue: "Brother" }),
    text("customer", "For Customer", { required: true }),
    text("caseRef", "Linked Contract #"),
    num("exposure", "Exposure / Financed (Rs.)"),
    num("tenure", "Tenure (months)"),
    sel("contractStatus", "Contract Status",
      ["Under Process", "Under Verification", "Under Approval", "Approved", "Active", "Settled", "Defaulter", "Rejected", "Cancelled"],
      { defaultValue: "Under Process" }),
    sel("status", "KYC Status", ["Verified", "Pending", "Rejected"], { defaultValue: "Pending" }),
    { name: "verifiedAt", label: "Verified On", type: "date" },
    text("verifiedBy", "Verified By"),
    area("address", "Residential Address"),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", name: "Ali Khan", cnic: "35202-7654321-1", phone: "+92 333 1112233", altPhone: "+92 42 35870011", city: "Lahore", occupation: "Mechanical Engineer", income: 185000, relation: "Brother", customer: "Sara Khan", caseRef: "HP-2001", exposure: 158000, tenure: 12, contractStatus: "Active", status: "Verified", verifiedAt: "2026-03-28", verifiedBy: "Tariq (Verifier)", address: "House 22-B, Gulberg III, Lahore" },
    { id: "2", name: "Imran Raza", cnic: "35202-9988770-3", phone: "+92 300 4455667", city: "Lahore", occupation: "Govt. Officer (Grade 17)", income: 220000, relation: "Father", customer: "Ahmed Raza", caseRef: "HP-2002", exposure: 130000, tenure: 10, contractStatus: "Active", status: "Verified", verifiedAt: "2026-03-12", verifiedBy: "Nadia (KYC)", address: "Street 5, Model Town, Lahore" },
    { id: "3", name: "Ali Khan", cnic: "35202-7654321-1", phone: "+92 333 1112233", city: "Lahore", occupation: "Mechanical Engineer", income: 185000, relation: "Brother", customer: "Sara Khan", caseRef: "HP-2003", exposure: 112000, tenure: 12, contractStatus: "Under Approval", status: "Pending", address: "House 22-B, Gulberg III, Lahore" },
    { id: "4", name: "Tariq Mehmood", cnic: "35202-3344556-9", phone: "+92 321 7788990", city: "Faisalabad", occupation: "Shop Owner", income: 140000, relation: "Father", customer: "Hira Tariq", caseRef: "HP-2005", exposure: 48000, tenure: 6, contractStatus: "Under Process", status: "Pending", address: "Peoples Colony, Faisalabad" },
    { id: "5", name: "Bilal Pervaiz", cnic: "35202-7788991-2", phone: "+92 345 1239876", city: "Lahore", occupation: "Software Developer", income: 250000, relation: "Brother", customer: "Adnan Pervaiz", caseRef: "HP-2006", exposure: 63000, tenure: 9, contractStatus: "Under Verification", status: "Verified", verifiedAt: "2026-05-10", verifiedBy: "Nadia (KYC)", address: "DHA Phase 5, Lahore" },
    { id: "6", name: "Noor Ahmed", cnic: "35202-4422111-5", phone: "+92 333 9988770", city: "Islamabad", occupation: "Doctor", income: 320000, relation: "Father", customer: "Fatima Noor", caseRef: "HP-2007", exposure: 74000, tenure: 10, contractStatus: "Approved", status: "Verified", verifiedAt: "2026-05-14", verifiedBy: "Hassan (Manager)", address: "F-11/3, Islamabad" },
    { id: "7", name: "Junaid Khan", cnic: "35202-5566778-2", phone: "+92 300 2233445", city: "Karachi", occupation: "Bank Manager", income: 280000, relation: "Friend", customer: "Rashid Mehmood", caseRef: "HP-2009", exposure: 143000, tenure: 12, contractStatus: "Settled", status: "Verified", verifiedAt: "2024-07-22", verifiedBy: "Tariq (Verifier)", address: "Block 4, Clifton, Karachi" },
    { id: "8", name: "Saad Iqbal", cnic: "35202-6677889-1", phone: "+92 321 5544332", city: "Lahore", occupation: "Teacher", income: 95000, relation: "Colleague", customer: "Bilal Khan", caseRef: "HP-2008", exposure: 185000, tenure: 18, contractStatus: "Rejected", status: "Rejected", verifiedAt: "2026-04-25", verifiedBy: "Hassan (Manager)", notes: "Income too low for exposure requested.", address: "Johar Town, Lahore" },
  ],
};

export const blacklistConfig: EntityPageProps<any> = {
  title: "Blacklist",
  description: "Defaulters, absconders and customers blocked from future contracts.",
  storageKey: "qcrm.blacklist",
  withAvatar: { nameKey: "name", subKey: "cnic" },
  searchKeys: ["name", "cnic", "phone", "caseRef", "city", "reason"],
  filters: [
    { key: "reason", label: "Reason" },
    { key: "severity", label: "Severity" },
    { key: "recoveryStatus", label: "Recovery" },
  ],
  kpis: [
    { label: "Blacklisted", icon: <UserX className="h-5 w-5" />, tone: "destructive", compute: (i) => i.length },
    {
      label: "Outstanding Loss",
      hint: "Principal written off, not yet recovered",
      icon: <Wallet className="h-5 w-5" />,
      tone: "destructive",
      compute: (i) => Rs(i.reduce((s: number, x: any) => s + Math.max(0, Number(x.loss || 0) - Number(x.recovered || 0)), 0)),
    },
    {
      label: "Recovered",
      hint: "Amount recovered from blacklisted accounts",
      icon: <HandCoins className="h-5 w-5" />,
      tone: "success",
      compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.recovered || 0), 0)),
    },
    {
      label: "Legal Action",
      hint: "Cases under legal proceedings",
      icon: <ShieldAlert className="h-5 w-5" />,
      tone: "warning",
      compute: (i) => i.filter((x: any) => x.recoveryStatus === "Legal Action").length,
    },
  ],
  columns: [
    { key: "name", header: "Customer" },
    {
      key: "phone",
      header: "Contact",
      render: (i: any) => (
        <div className="leading-tight">
          <div className="text-sm font-medium text-foreground">{i.phone || "—"}</div>
          <div className="text-[11px] text-muted-foreground">{i.city || "—"}</div>
        </div>
      ),
    },
    {
      key: "caseRef",
      header: "Contract",
      render: (i: any) => i.caseRef ? (
        <Link to="/contracts" className="inline-flex flex-col leading-tight font-mono text-primary hover:underline">
          <span className="text-sm font-semibold">{i.caseRef}</span>
          <span className="text-[11px] text-muted-foreground font-sans">{i.product || "—"}</span>
        </Link>
      ) : <span className="text-muted-foreground text-xs">—</span>,
    },
    {
      key: "reason",
      header: "Reason",
      render: (i: any) => (
        <div className="leading-tight">
          <div className="text-sm font-medium text-foreground">{i.reason}</div>
          <div className="text-[11px] text-muted-foreground">
            {i.severity ? `${i.severity} severity` : ""}{i.daysOverdue ? ` • ${i.daysOverdue}d overdue` : ""}
          </div>
        </div>
      ),
    },
    {
      key: "loss",
      header: "Loss / Recovered",
      render: (i: any) => {
        const loss = Number(i.loss || 0);
        const rec = Number(i.recovered || 0);
        const pct = loss > 0 ? Math.min(100, Math.round((rec / loss) * 100)) : 0;
        return (
          <div className="leading-tight min-w-[140px]">
            <div className="flex items-center justify-between gap-2">
              <span className="text-sm font-semibold text-destructive">{Rs(loss)}</span>
              <span className="text-[11px] text-muted-foreground">{pct}%</span>
            </div>
            <div className="mt-1 h-1.5 rounded-full bg-muted overflow-hidden">
              <div className="h-full bg-success" style={{ width: `${pct}%` }} />
            </div>
            <div className="text-[11px] text-success mt-0.5">Recovered {Rs(rec)}</div>
          </div>
        );
      },
    },
    { key: "date", header: "Blocked", render: (i: any) => (
      <div className="leading-tight">
        <div className="text-sm text-foreground">{i.date || "—"}</div>
        <div className="text-[11px] text-muted-foreground">by {i.blockedBy || "—"}</div>
      </div>
    ) },
  ],
  fields: [
    text("name", "Customer Name", { required: true }),
    text("cnic", "CNIC", { required: true }),
    text("phone", "Mobile"),
    text("city", "City / Area"),
    text("caseRef", "Defaulted Contract #"),
    text("product", "Product"),
    num("loss", "Loss Amount (Rs.)", { required: true }),
    num("recovered", "Recovered (Rs.)", { defaultValue: 0 }),
    num("daysOverdue", "Days Overdue"),
    sel("reason", "Reason",
      ["Cheque Bounced", "Absconded", "Wilful Default", "Repeated Late Payment", "Fraudulent Documents", "Repossession Failed", "Other"],
      { defaultValue: "Cheque Bounced" }),
    sel("severity", "Severity", ["Low", "Medium", "High", "Critical"], { defaultValue: "High" }),
    sel("recoveryStatus", "Recovery Status",
      ["Pending", "In Recovery", "Legal Action", "Written Off", "Recovered"],
      { defaultValue: "Pending" }),
    text("blockedBy", "Blocked By"),
    { name: "date", label: "Blocked On", type: "date" },
    area("notes", "Notes / Action Log"),
  ],
  seed: [
    { id: "1", name: "Faisal Mehmood", cnic: "35202-1112223-3", phone: "+92 333 8877665", city: "Lahore", caseRef: "HP-2004", product: "Honda 70 Bike", loss: 95000, recovered: 30000, daysOverdue: 124, reason: "Cheque Bounced", severity: "High", recoveryStatus: "Legal Action", blockedBy: "Manager Tariq", date: "2026-04-12", notes: "3 cheques bounced • absconded after 4th installment. Legal notice issued 2026-05-01." },
    { id: "2", name: "Kashif Iqbal", cnic: "35202-9988776-5", phone: "+92 300 1122334", city: "Faisalabad", caseRef: "HP-1987", product: "LG Inverter AC", loss: 142000, recovered: 0, daysOverdue: 210, reason: "Absconded", severity: "Critical", recoveryStatus: "In Recovery", blockedBy: "Recovery Officer Hassan", date: "2026-02-28", notes: "Customer left registered address. Field agent tracing." },
    { id: "3", name: "Naveed Akhtar", cnic: "35202-5544332-1", phone: "+92 321 4567890", city: "Lahore", caseRef: "HP-1942", product: "Samsung Refrigerator", loss: 68000, recovered: 68000, daysOverdue: 0, reason: "Wilful Default", severity: "Medium", recoveryStatus: "Recovered", blockedBy: "Manager Tariq", date: "2025-11-15", notes: "Fully settled via guarantor. Still blacklisted from future contracts." },
    { id: "4", name: "Imran Sheikh", cnic: "35202-7766554-3", phone: "+92 345 9988776", city: "Karachi", caseRef: "HP-1856", product: "Honda CD-70", loss: 78000, recovered: 12000, daysOverdue: 165, reason: "Fraudulent Documents", severity: "Critical", recoveryStatus: "Legal Action", blockedBy: "Compliance — Nadia", date: "2025-12-04", notes: "Fake CNIC photocopy submitted. FIR registered." },
    { id: "5", name: "Rizwan Ali", cnic: "35202-3344556-7", phone: "+92 333 2211009", city: "Multan", caseRef: "HP-1799", product: "Dawlance Microwave", loss: 24000, recovered: 6000, daysOverdue: 95, reason: "Repeated Late Payment", severity: "Low", recoveryStatus: "In Recovery", blockedBy: "Recovery Officer Hassan", date: "2026-03-22" },
    { id: "6", name: "Shahid Hussain", cnic: "35202-1199887-6", phone: "+92 300 5566778", city: "Lahore", caseRef: "HP-1721", product: "Infinix Hot 30", loss: 38000, recovered: 0, daysOverdue: 280, reason: "Repossession Failed", severity: "High", recoveryStatus: "Written Off", blockedBy: "Manager Tariq", date: "2025-08-19", notes: "Product not traceable. Written off in FY closing." },
  ],
};

// ============ ACCOUNTS ============

export const coaConfig: EntityPageProps<any> = {
  title: "Chart of Accounts",
  description: "Multi-branch chart of accounts.",
  storageKey: "qcrm.coa",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "type"],
  kpis: [
    { label: "Total Accounts", icon: <BookOpen className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Assets", icon: <Wallet className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.type === "Asset").length },
    { label: "Liabilities", icon: <Wallet className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.type === "Liability").length },
    { label: "Income / Expense", icon: <TrendingUp className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.type === "Income" || x.type === "Expense").length },
  ],
  columns: [
    { key: "code", header: "Code" },
    { key: "name", header: "Account" },
    { key: "type", header: "Type" },
    { key: "parent", header: "Parent" },
    { key: "balance", header: "Balance", render: (i: any) => Rs(i.balance) },
  ],
  fields: [
    text("code", "Account Code", { required: true }),
    text("name", "Account Name", { required: true }),
    sel("type", "Type", ["Asset", "Liability", "Equity", "Income", "Expense"], { required: true }),
    text("parent", "Parent Account"),
    num("balance", "Opening Balance (Rs.)", { defaultValue: 0 }),
  ],
  seed: [
    { id: "1", code: "1010", name: "Cash in Hand", type: "Asset", parent: "Current Assets", balance: 850000 },
    { id: "2", code: "1020", name: "Bank - HBL Main", type: "Asset", parent: "Current Assets", balance: 4200000 },
    { id: "3", code: "1100", name: "Customer Receivables", type: "Asset", parent: "Current Assets", balance: 8950000 },
    { id: "4", code: "2010", name: "Supplier Payables", type: "Liability", parent: "Current Liabilities", balance: 2200000 },
    { id: "5", code: "4010", name: "Cash Sales", type: "Income", parent: "Sales Revenue", balance: 12500000 },
    { id: "6", code: "4020", name: "Installment Sales", type: "Income", parent: "Sales Revenue", balance: 18900000 },
  ],
};

export const vouchersConfig: EntityPageProps<any> = {
  title: "Vouchers",
  description: "Journal, payment, receipt and contra vouchers.",
  storageKey: "qcrm.vouchers",
  withAvatar: { nameKey: "ref", subKey: "type" },
  searchKeys: ["ref", "narration"],
  kpis: [
    { label: "Total Vouchers", icon: <Receipt className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Receipts", icon: <Receipt className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.type === "Receipt").length },
    { label: "Payments", icon: <Receipt className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.type === "Payment").length },
    { label: "Total Amount", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
  ],
  columns: [
    { key: "ref", header: "Voucher #" },
    { key: "type", header: "Type" },
    { key: "date", header: "Date" },
    { key: "narration", header: "Narration" },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Voucher #", { required: true }),
    sel("type", "Type", ["Journal", "Payment", "Receipt", "Contra"], { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    text("narration", "Narration", { fullWidth: true }),
    num("amount", "Amount (Rs.)", { required: true }),
    sel("status", "Status", ["Draft", "Approved", "Posted"], { defaultValue: "Posted" }),
  ],
  seed: [
    { id: "1", ref: "RV-5001", type: "Receipt", date: "2026-05-07", narration: "Installment receipt — Sara Khan", amount: 13500, status: "Posted" },
    { id: "2", ref: "PV-5002", type: "Payment", date: "2026-05-06", narration: "Supplier payment — DWP Group", amount: 450000, status: "Posted" },
  ],
};

export const cashBankConfig: EntityPageProps<any> = {
  title: "Cash & Bank",
  description: "Cash book, bank book and reconciliation.",
  storageKey: "qcrm.cashbank",
  withAvatar: { nameKey: "name", subKey: "type" },
  searchKeys: ["name", "type"],
  kpis: [
    { label: "Total Accounts", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Cash Balance", icon: <Banknote className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.filter((x: any) => x.type === "Cash").reduce((s: number, x: any) => s + Number(x.balance || 0), 0)) },
    { label: "Bank Balance", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.filter((x: any) => x.type === "Bank").reduce((s: number, x: any) => s + Number(x.balance || 0), 0)) },
    { label: "Total Liquid", icon: <DollarSign className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.balance || 0), 0)) },
  ],
  columns: [
    { key: "name", header: "Account" },
    { key: "type", header: "Type" },
    { key: "branch", header: "Branch" },
    { key: "accountNo", header: "A/C #" },
    { key: "balance", header: "Balance", render: (i: any) => Rs(i.balance) },
  ],
  fields: [
    text("name", "Account Name", { required: true }),
    sel("type", "Type", ["Cash", "Bank"], { required: true }),
    sel("branch", "Branch", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Head Office"]),
    text("accountNo", "Account / Vault #"),
    num("balance", "Current Balance (Rs.)"),
  ],
  seed: [
    { id: "1", name: "Cash - Model Town", type: "Cash", branch: "Model Town", accountNo: "VAULT-MT", balance: 285000 },
    { id: "2", name: "HBL Main A/C", type: "Bank", branch: "Head Office", accountNo: "1234-5678-9012", balance: 4200000 },
    { id: "3", name: "Meezan Business", type: "Bank", branch: "Head Office", accountNo: "9876-5432-1098", balance: 1850000 },
  ],
};

export const accountsReportsConfig: EntityPageProps<any> = {
  title: "Financial Reports",
  description: "P&L, balance sheet, cash flow and aging snapshots.",
  storageKey: "qcrm.finReports",
  withAvatar: { nameKey: "name", subKey: "period" },
  searchKeys: ["name", "period"],
  kpis: [
    { label: "Reports", icon: <BookOpen className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "This Month P&L", icon: <TrendingUp className="h-5 w-5" />, tone: "success", compute: () => Rs(2_850_000) },
    { label: "YTD Revenue", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: () => Rs(31_400_000) },
    { label: "Net Profit %", icon: <TrendingUp className="h-5 w-5" />, tone: "success", compute: () => "18.4%" },
  ],
  columns: [
    { key: "name", header: "Report" },
    { key: "period", header: "Period" },
    { key: "generatedBy", header: "Generated By" },
    { key: "date", header: "Date" },
  ],
  fields: [
    sel("name", "Report Type", ["Profit & Loss", "Balance Sheet", "Cash Flow", "Trial Balance", "Customer Aging", "Supplier Aging"], { required: true }),
    text("period", "Period", { placeholder: "May 2026" }),
    text("generatedBy", "Generated By"),
    { name: "date", label: "Date", type: "date" },
  ],
  seed: [
    { id: "1", name: "Profit & Loss", period: "April 2026", generatedBy: "Ahmed Hassan", date: "2026-05-01" },
    { id: "2", name: "Balance Sheet", period: "Q1 2026", generatedBy: "Ahmed Hassan", date: "2026-04-05" },
  ],
};

// ============ HR ============

export const employeesConfig: EntityPageProps<any> = {
  title: "Employees",
  description: "Employee directory and documents.",
  storageKey: "qcrm.employees",
  addHref: "/hr/employees/new",
  rowHref: (i: any) => `/hr/employees/${i.id}`,
  editHref: (i: any) => `/hr/employees/${i.id}/edit`,
  withAvatar: { nameKey: "name", subKey: "designation", nameHref: (i: any) => `/hr/employees/${i.id}` },
  searchKeys: ["name", "code", "cnic", "designation"],
  kpis: [
    { label: "Total Staff", icon: <Briefcase className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <UserCheck className="h-5 w-5" />),
    { label: "Total Salary", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.salary || 0), 0)) },
    { label: "Branches", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.branch)).size },
  ],
  columns: [
    { key: "name", header: "Employee" },
    { key: "designation", header: "Designation" },
    { key: "branch", header: "Branch" },
    { key: "phone", header: "Phone" },
    { key: "salary", header: "Salary", render: (i: any) => Rs(i.salary) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Full Name", { required: true }),
    text("code", "Employee Code", { required: true }),
    text("cnic", "CNIC"),
    text("phone", "Phone"),
    sel("designation", "Designation", ["Branch Manager", "Salesman", "Cashier", "Recovery Agent", "Accountant", "Inventory Manager", "HR Manager"]),
    sel("branch", "Branch", ["Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Head Office"]),
    num("salary", "Basic Salary (Rs.)"),
    { name: "joinDate", label: "Join Date", type: "date" },
    status(),
  ],
  seed: [
    { id: "1", name: "Bilal Ahmed", code: "EMP-001", phone: "+92 300 1112233", designation: "Recovery Agent", branch: "Model Town", salary: 55000, status: "Active" },
    { id: "2", name: "Sana Khan", code: "EMP-002", phone: "+92 301 4445566", designation: "Recovery Agent", branch: "Gulberg", salary: 52000, status: "Active" },
    { id: "3", name: "Tariq Mahmood", code: "EMP-003", phone: "+92 333 9988776", designation: "Branch Manager", branch: "Model Town", salary: 120000, status: "Active" },
  ],
};

export const attendanceConfig: EntityPageProps<any> = {
  title: "Attendance",
  description: "Daily attendance and leaves.",
  storageKey: "qcrm.attendance",
  withAvatar: { nameKey: "employee", subKey: "date" },
  searchKeys: ["employee", "date"],
  kpis: [
    { label: "Records", icon: <Clock className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Present", icon: <UserCheck className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.status === "Present").length },
    { label: "Absent", icon: <UserX className="h-5 w-5" />, tone: "destructive", compute: (i) => i.filter((x: any) => x.status === "Absent").length },
    { label: "Leave", icon: <Calendar className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.status === "Leave").length },
  ],
  columns: [
    { key: "employee", header: "Employee" },
    { key: "date", header: "Date" },
    { key: "checkIn", header: "Check In" },
    { key: "checkOut", header: "Check Out" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("employee", "Employee", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    text("checkIn", "Check In", { placeholder: "09:00" }),
    text("checkOut", "Check Out", { placeholder: "18:00" }),
    sel("status", "Status", ["Present", "Absent", "Leave", "Late", "Half Day"], { defaultValue: "Present" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", employee: "Bilal Ahmed", date: "2026-05-08", checkIn: "09:05", checkOut: "18:20", status: "Present" },
    { id: "2", employee: "Sana Khan", date: "2026-05-08", checkIn: "—", checkOut: "—", status: "Leave" },
  ],
};

export const payrollConfig: EntityPageProps<any> = {
  title: "Payroll",
  description: "Salary setup, allowances and deductions.",
  storageKey: "qcrm.payroll",
  withAvatar: { nameKey: "employee", subKey: "month" },
  searchKeys: ["employee", "month"],
  kpis: [
    { label: "Payroll Runs", icon: <DollarSign className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Total Payable", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.net || 0), 0)) },
    STATUS_KPI("Paid", "Paid", "success", <DollarSign className="h-5 w-5" />),
    STATUS_KPI("Pending", "Pending", "warning", <Clock className="h-5 w-5" />),
  ],
  columns: [
    { key: "employee", header: "Employee" },
    { key: "month", header: "Month" },
    { key: "basic", header: "Basic", render: (i: any) => Rs(i.basic) },
    { key: "allowances", header: "Allowances", render: (i: any) => Rs(i.allowances) },
    { key: "deductions", header: "Deductions", render: (i: any) => Rs(i.deductions) },
    { key: "net", header: "Net Pay", render: (i: any) => Rs(i.net) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("employee", "Employee", { required: true }),
    text("month", "Month", { required: true, placeholder: "May 2026" }),
    num("basic", "Basic Salary", { required: true }),
    num("allowances", "Allowances", { defaultValue: 0 }),
    num("deductions", "Deductions", { defaultValue: 0 }),
    num("net", "Net Pay", { required: true }),
    sel("status", "Status", ["Pending", "Approved", "Paid"], { defaultValue: "Pending" }),
  ],
  seed: [
    { id: "1", employee: "Bilal Ahmed", month: "April 2026", basic: 55000, allowances: 12000, deductions: 5000, net: 62000, status: "Paid" },
    { id: "2", employee: "Tariq Mahmood", month: "April 2026", basic: 120000, allowances: 25000, deductions: 8000, net: 137000, status: "Paid" },
  ],
};

export const commissionsConfig: EntityPageProps<any> = {
  title: "Commissions",
  description: "Sales and recovery commissions.",
  storageKey: "qcrm.commissions",
  withAvatar: { nameKey: "employee", subKey: "type" },
  searchKeys: ["employee", "type"],
  kpis: [
    { label: "Total Commissions", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    { label: "Sales Commission", icon: <ShoppingBag className="h-5 w-5" />, tone: "success", compute: (i) => Rs(i.filter((x: any) => x.type === "Sales").reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    { label: "Recovery Commission", icon: <HandCoins className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.filter((x: any) => x.type === "Recovery").reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    STATUS_KPI("Pending", "Pending", "warning", <Clock className="h-5 w-5" />),
  ],
  columns: [
    { key: "employee", header: "Employee" },
    { key: "type", header: "Type" },
    { key: "month", header: "Month" },
    { key: "base", header: "Base", render: (i: any) => Rs(i.base) },
    { key: "rate", header: "Rate", render: (i: any) => `${i.rate}%` },
    { key: "amount", header: "Amount", render: (i: any) => Rs(i.amount) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("employee", "Employee", { required: true }),
    sel("type", "Type", ["Sales", "Recovery", "Target Bonus"], { required: true }),
    text("month", "Month"),
    num("base", "Base Amount (Rs.)"),
    num("rate", "Rate %"),
    num("amount", "Commission (Rs.)", { required: true }),
    sel("status", "Status", ["Pending", "Approved", "Paid"], { defaultValue: "Pending" }),
  ],
  seed: [
    { id: "1", employee: "Bilal Ahmed", type: "Recovery", month: "April 2026", base: 425000, rate: 2, amount: 8500, status: "Paid" },
    { id: "2", employee: "Usman Salesman", type: "Sales", month: "April 2026", base: 1200000, rate: 1, amount: 12000, status: "Approved" },
  ],
};

export const departmentsConfig: EntityPageProps<any> = {
  title: "Departments",
  description: "Organizational departments and heads.",
  storageKey: "qcrm.departments",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "head"],
  kpis: [
    { label: "Total Departments", icon: <Briefcase className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Briefcase className="h-5 w-5" />),
    { label: "Total Employees", icon: <Users className="h-5 w-5" />, tone: "primary", compute: (i) => i.reduce((s: number, x: any) => s + Number(x.headcount || 0), 0) },
    { label: "Heads Assigned", icon: <UserCheck className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.head).length },
  ],
  columns: [
    { key: "name", header: "Department" },
    { key: "code", header: "Code" },
    { key: "head", header: "Department Head" },
    { key: "headcount", header: "Headcount" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Department Name", { required: true }),
    text("code", "Code", { required: true }),
    text("head", "Department Head"),
    num("headcount", "Headcount", { defaultValue: 0 }),
    area("description", "Description"),
    status(),
  ],
  seed: [
    { id: "1", name: "Sales", code: "SLS", head: "Tariq Mahmood", headcount: 14, status: "Active" },
    { id: "2", name: "Recovery", code: "REC", head: "Bilal Ahmed", headcount: 8, status: "Active" },
    { id: "3", name: "Accounts", code: "ACC", head: "Usman Ali", headcount: 4, status: "Active" },
    { id: "4", name: "Inventory", code: "INV", head: "Faisal Khan", headcount: 6, status: "Active" },
  ],
};

export const designationsConfig: EntityPageProps<any> = {
  title: "Designations",
  description: "Job titles and grades.",
  storageKey: "qcrm.designations",
  withAvatar: { nameKey: "title", subKey: "department" },
  searchKeys: ["title", "department", "grade"],
  kpis: [
    { label: "Total Designations", icon: <UserCheck className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <UserCheck className="h-5 w-5" />),
    { label: "Departments Covered", icon: <Briefcase className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.department)).size },
    { label: "Avg Min Salary", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.length ? i.reduce((s: number, x: any) => s + Number(x.minSalary || 0), 0) / i.length : 0) },
  ],
  columns: [
    { key: "title", header: "Designation" },
    { key: "department", header: "Department" },
    { key: "grade", header: "Grade" },
    { key: "minSalary", header: "Min Salary", render: (i: any) => Rs(i.minSalary) },
    { key: "maxSalary", header: "Max Salary", render: (i: any) => Rs(i.maxSalary) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("title", "Title", { required: true }),
    sel("department", "Department", ["Sales", "Recovery", "Accounts", "Inventory", "HR", "Admin"]),
    sel("grade", "Grade", ["G1", "G2", "G3", "G4", "G5", "Manager", "Senior Manager"]),
    num("minSalary", "Min Salary"),
    num("maxSalary", "Max Salary"),
    status(),
  ],
  seed: [
    { id: "1", title: "Branch Manager", department: "Sales", grade: "Manager", minSalary: 100000, maxSalary: 180000, status: "Active" },
    { id: "2", title: "Salesman", department: "Sales", grade: "G2", minSalary: 35000, maxSalary: 60000, status: "Active" },
    { id: "3", title: "Recovery Agent", department: "Recovery", grade: "G2", minSalary: 40000, maxSalary: 70000, status: "Active" },
    { id: "4", title: "Accountant", department: "Accounts", grade: "G3", minSalary: 60000, maxSalary: 110000, status: "Active" },
  ],
};

export const shiftsConfig: EntityPageProps<any> = {
  title: "Shifts",
  description: "Work shifts and timings.",
  storageKey: "qcrm.shifts",
  withAvatar: { nameKey: "name", subKey: "type" },
  searchKeys: ["name", "type"],
  kpis: [
    { label: "Total Shifts", icon: <Clock className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Clock className="h-5 w-5" />),
    { label: "Day Shifts", icon: <Clock className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.type === "Day").length },
    { label: "Night Shifts", icon: <Clock className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.type === "Night").length },
  ],
  columns: [
    { key: "name", header: "Shift" },
    { key: "type", header: "Type" },
    { key: "startTime", header: "Start" },
    { key: "endTime", header: "End" },
    { key: "breakMins", header: "Break (min)" },
    { key: "weekOff", header: "Week Off" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Shift Name", { required: true }),
    sel("type", "Type", ["Day", "Evening", "Night", "Rotating"]),
    text("startTime", "Start Time", { placeholder: "09:00" }),
    text("endTime", "End Time", { placeholder: "18:00" }),
    num("breakMins", "Break Minutes", { defaultValue: 60 }),
    text("weekOff", "Week Off Day", { placeholder: "Sunday" }),
    status(),
  ],
  seed: [
    { id: "1", name: "General Shift", type: "Day", startTime: "09:00", endTime: "18:00", breakMins: 60, weekOff: "Sunday", status: "Active" },
    { id: "2", name: "Evening Shift", type: "Evening", startTime: "14:00", endTime: "23:00", breakMins: 45, weekOff: "Friday", status: "Active" },
    { id: "3", name: "Night Shift", type: "Night", startTime: "22:00", endTime: "07:00", breakMins: 60, weekOff: "Sunday", status: "Active" },
  ],
};

export const holidayCalendarConfig: EntityPageProps<any> = {
  title: "Holiday Calendar",
  description: "Public and company holidays.",
  storageKey: "qcrm.holidays",
  withAvatar: { nameKey: "name", subKey: "date" },
  searchKeys: ["name", "type"],
  kpis: [
    { label: "Total Holidays", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Public", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.type === "Public").length },
    { label: "Religious", icon: <Calendar className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.type === "Religious").length },
    { label: "Company", icon: <Calendar className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.type === "Company").length },
  ],
  columns: [
    { key: "name", header: "Holiday" },
    { key: "date", header: "Date" },
    { key: "type", header: "Type" },
    { key: "paid", header: "Paid" },
    { key: "notes", header: "Notes" },
  ],
  fields: [
    text("name", "Holiday Name", { required: true }),
    { name: "date", label: "Date", type: "date", required: true },
    sel("type", "Type", ["Public", "Religious", "Company", "Optional"]),
    sel("paid", "Paid Holiday", ["Yes", "No"], { defaultValue: "Yes" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", name: "Eid-ul-Fitr", date: "2026-03-21", type: "Religious", paid: "Yes", notes: "3 days holiday" },
    { id: "2", name: "Independence Day", date: "2026-08-14", type: "Public", paid: "Yes", notes: "" },
    { id: "3", name: "Annual Day", date: "2026-12-15", type: "Company", paid: "Yes", notes: "Office closed" },
  ],
};

export const leavesConfig: EntityPageProps<any> = {
  title: "Leaves",
  description: "Employee leave requests and balances.",
  storageKey: "qcrm.leaves",
  withAvatar: { nameKey: "employee", subKey: "type" },
  searchKeys: ["employee", "type", "status"],
  kpis: [
    { label: "Total Requests", icon: <Calendar className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Approved", "Approved", "success", <UserCheck className="h-5 w-5" />),
    STATUS_KPI("Pending", "Pending", "warning", <Clock className="h-5 w-5" />),
    STATUS_KPI("Rejected", "Rejected", "destructive", <UserX className="h-5 w-5" />),
  ],
  columns: [
    { key: "employee", header: "Employee" },
    { key: "type", header: "Leave Type" },
    { key: "fromDate", header: "From" },
    { key: "toDate", header: "To" },
    { key: "days", header: "Days" },
    { key: "reason", header: "Reason" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("employee", "Employee", { required: true }),
    sel("type", "Leave Type", ["Casual", "Sick", "Annual", "Unpaid", "Maternity", "Hajj"], { required: true }),
    { name: "fromDate", label: "From Date", type: "date", required: true },
    { name: "toDate", label: "To Date", type: "date", required: true },
    num("days", "Days"),
    text("reason", "Reason"),
    sel("status", "Status", ["Pending", "Approved", "Rejected"], { defaultValue: "Pending" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", employee: "Sana Khan", type: "Sick", fromDate: "2026-05-08", toDate: "2026-05-08", days: 1, reason: "Fever", status: "Approved" },
    { id: "2", employee: "Bilal Ahmed", type: "Casual", fromDate: "2026-05-12", toDate: "2026-05-13", days: 2, reason: "Family event", status: "Pending" },
  ],
};

export const loanManagementConfig: EntityPageProps<any> = {
  title: "Loan Management",
  description: "Employee loans and repayments.",
  storageKey: "qcrm.emp_loans",
  withAvatar: { nameKey: "employee", subKey: "purpose" },
  searchKeys: ["employee", "purpose", "status"],
  kpis: [
    { label: "Total Disbursed", icon: <HandCoins className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.amount || 0), 0)) },
    { label: "Outstanding", icon: <Wallet className="h-5 w-5" />, tone: "warning", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.balance || 0), 0)) },
    STATUS_KPI("Active", "Active", "primary", <HandCoins className="h-5 w-5" />),
    STATUS_KPI("Settled", "Settled", "success", <UserCheck className="h-5 w-5" />),
  ],
  columns: [
    { key: "employee", header: "Employee" },
    { key: "purpose", header: "Purpose" },
    { key: "amount", header: "Loan Amount", render: (i: any) => Rs(i.amount) },
    { key: "installment", header: "Monthly", render: (i: any) => Rs(i.installment) },
    { key: "tenure", header: "Tenure" },
    { key: "balance", header: "Balance", render: (i: any) => Rs(i.balance) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("employee", "Employee", { required: true }),
    sel("purpose", "Purpose", ["Medical", "Education", "Wedding", "Home", "Vehicle", "Personal"]),
    num("amount", "Loan Amount", { required: true }),
    num("installment", "Monthly Installment"),
    text("tenure", "Tenure", { placeholder: "12 months" }),
    num("balance", "Outstanding Balance"),
    { name: "issueDate", label: "Issue Date", type: "date" },
    sel("status", "Status", ["Pending", "Active", "Settled", "Defaulter"], { defaultValue: "Active" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", employee: "Bilal Ahmed", purpose: "Medical", amount: 100000, installment: 10000, tenure: "10 months", balance: 60000, issueDate: "2026-01-10", status: "Active" },
    { id: "2", employee: "Sana Khan", purpose: "Wedding", amount: 200000, installment: 20000, tenure: "10 months", balance: 0, issueDate: "2025-06-15", status: "Settled" },
  ],
};

export const hrAssetsConfig: EntityPageProps<any> = {
  title: "Assets",
  description: "Company assets assigned to employees.",
  storageKey: "qcrm.hr_assets",
  withAvatar: { nameKey: "name", subKey: "category" },
  searchKeys: ["name", "category", "assignedTo", "serial"],
  kpis: [
    { label: "Total Assets", icon: <Boxes className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Assigned", icon: <UserCheck className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.assignedTo).length },
    { label: "Available", icon: <Boxes className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => !x.assignedTo).length },
    { label: "Total Value", icon: <Wallet className="h-5 w-5" />, tone: "primary", compute: (i) => Rs(i.reduce((s: number, x: any) => s + Number(x.value || 0), 0)) },
  ],
  columns: [
    { key: "name", header: "Asset" },
    { key: "category", header: "Category" },
    { key: "serial", header: "Serial / Tag" },
    { key: "assignedTo", header: "Assigned To" },
    { key: "issueDate", header: "Issued On" },
    { key: "value", header: "Value", render: (i: any) => Rs(i.value) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Asset Name", { required: true }),
    sel("category", "Category", ["Laptop", "Mobile", "SIM", "Vehicle", "Furniture", "Uniform", "Tools", "Other"]),
    text("serial", "Serial / Tag #"),
    text("assignedTo", "Assigned To"),
    { name: "issueDate", label: "Issue Date", type: "date" },
    num("value", "Asset Value (Rs.)"),
    sel("status", "Status", ["Active", "Returned", "Damaged", "Lost"], { defaultValue: "Active" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", name: "HP ProBook 450", category: "Laptop", serial: "HP-23-4421", assignedTo: "Tariq Mahmood", issueDate: "2025-08-12", value: 185000, status: "Active" },
    { id: "2", name: "Samsung A14", category: "Mobile", serial: "IMEI-558899", assignedTo: "Bilal Ahmed", issueDate: "2025-11-02", value: 42000, status: "Active" },
    { id: "3", name: "Honda CD-70", category: "Vehicle", serial: "LEH-2299", assignedTo: "", issueDate: "", value: 165000, status: "Active" },
  ],
};

export const exitManagementConfig: EntityPageProps<any> = {
  title: "Exit Management",
  description: "Resignations, terminations and final settlements.",
  storageKey: "qcrm.exits",
  withAvatar: { nameKey: "employee", subKey: "type" },
  searchKeys: ["employee", "type", "status"],
  kpis: [
    { label: "Total Exits", icon: <UserX className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Resignations", icon: <UserX className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.type === "Resignation").length },
    { label: "Terminations", icon: <UserX className="h-5 w-5" />, tone: "destructive", compute: (i) => i.filter((x: any) => x.type === "Termination").length },
    { label: "Final Settled", icon: <Wallet className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.status === "Settled").length },
  ],
  columns: [
    { key: "employee", header: "Employee" },
    { key: "type", header: "Exit Type" },
    { key: "exitDate", header: "Exit Date" },
    { key: "reason", header: "Reason" },
    { key: "finalSettlement", header: "Final Pay", render: (i: any) => Rs(i.finalSettlement) },
    { key: "clearance", header: "Clearance", render: (i: any) => STATUS_BADGE(i.clearance) },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("employee", "Employee", { required: true }),
    sel("type", "Exit Type", ["Resignation", "Termination", "Retirement", "Absconded", "End of Contract"], { required: true }),
    { name: "noticeDate", label: "Notice Date", type: "date" },
    { name: "exitDate", label: "Exit Date", type: "date", required: true },
    text("reason", "Reason"),
    num("finalSettlement", "Final Settlement (Rs.)"),
    sel("clearance", "Clearance", ["Pending", "Approved", "Rejected"], { defaultValue: "Pending" }),
    sel("status", "Status", ["Open", "Settled", "Closed"], { defaultValue: "Open" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", employee: "Asad Iqbal", type: "Resignation", noticeDate: "2026-04-01", exitDate: "2026-04-30", reason: "Better opportunity", finalSettlement: 78000, clearance: "Approved", status: "Settled" },
    { id: "2", employee: "Junaid Latif", type: "Termination", noticeDate: "2026-03-15", exitDate: "2026-03-15", reason: "Misconduct", finalSettlement: 0, clearance: "Pending", status: "Open" },
  ],
};

export const hrSettingsConfig: EntityPageProps<any> = {
  title: "HR Settings",
  description: "Leave policies, attendance rules and HR configuration.",
  storageKey: "qcrm.hr_settings",
  withAvatar: { nameKey: "key", subKey: "category" },
  searchKeys: ["key", "category"],
  kpis: [
    { label: "Total Settings", icon: <SettingsIcon className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Categories", icon: <SettingsIcon className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.category)).size },
    STATUS_KPI("Active", "Active", "success", <SettingsIcon className="h-5 w-5" />),
    STATUS_KPI("Inactive", "Inactive", "warning", <SettingsIcon className="h-5 w-5" />),
  ],
  columns: [
    { key: "key", header: "Setting" },
    { key: "category", header: "Category" },
    { key: "value", header: "Value" },
    { key: "description", header: "Description" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("key", "Setting Key", { required: true }),
    sel("category", "Category", ["Leave Policy", "Attendance", "Payroll", "Probation", "Loan Policy", "General"]),
    text("value", "Value", { required: true }),
    area("description", "Description"),
    status(),
  ],
  seed: [
    { id: "1", key: "Annual Leaves", category: "Leave Policy", value: "20 days", description: "Per year per employee", status: "Active" },
    { id: "2", key: "Casual Leaves", category: "Leave Policy", value: "10 days", description: "Per year per employee", status: "Active" },
    { id: "3", key: "Sick Leaves", category: "Leave Policy", value: "8 days", description: "Per year per employee", status: "Active" },
    { id: "4", key: "Late Mark After", category: "Attendance", value: "09:15", description: "Mark late if check-in after this time", status: "Active" },
    { id: "5", key: "Probation Period", category: "Probation", value: "3 months", description: "Standard probation duration", status: "Active" },
    { id: "6", key: "Max Loan Amount", category: "Loan Policy", value: "Rs. 500,000", description: "Maximum staff loan", status: "Active" },
  ],
};

// ============ BRANCHES / TARGETS / NOTIFICATIONS / SETTINGS ============

export const branchesConfig: EntityPageProps<any> = {
  title: "Branches",
  description: "All shops and warehouses.",
  storageKey: "qcrm.branches",
  withAvatar: { nameKey: "name", subKey: "code" },
  searchKeys: ["name", "code", "city"],
  kpis: [
    { label: "Total Branches", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <Building2 className="h-5 w-5" />),
    { label: "Cities", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.city)).size },
    { label: "Shops", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.type === "Shop").length },
  ],
  columns: [
    { key: "name", header: "Branch" },
    { key: "type", header: "Type" },
    { key: "city", header: "City" },
    { key: "manager", header: "Manager" },
    { key: "phone", header: "Phone" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Branch Name", { required: true }),
    text("code", "Branch Code", { required: true }),
    sel("type", "Type", ["Shop", "Warehouse", "Head Office", "Service Center"], { defaultValue: "Shop" }),
    text("city", "City"),
    text("province", "Province"),
    text("manager", "Manager"),
    text("phone", "Phone"),
    area("address", "Address"),
    status(),
  ],
  seed: [
    { id: "1", name: "Model Town", code: "BR-MT", type: "Shop", city: "Lahore", province: "Punjab", manager: "Tariq Mahmood", phone: "+92 42 35888100", status: "Active" },
    { id: "2", name: "Gulberg", code: "BR-GB", type: "Shop", city: "Lahore", province: "Punjab", manager: "Asif Ali", phone: "+92 42 35777200", status: "Active" },
    { id: "3", name: "Main Warehouse", code: "WH-01", type: "Warehouse", city: "Lahore", province: "Punjab", manager: "Imran Sheikh", phone: "+92 42 36666300", status: "Active" },
  ],
};

export const targetsConfig: EntityPageProps<any> = {
  title: "Targets & Commissions",
  description: "Sales and recovery targets, achievement and slabs.",
  storageKey: "qcrm.targets",
  withAvatar: { nameKey: "name", subKey: "period" },
  searchKeys: ["name", "type"],
  kpis: [
    { label: "Active Targets", icon: <Target className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Avg Achievement", icon: <TrendingUp className="h-5 w-5" />, tone: "success", compute: (i) => i.length ? Math.round(i.reduce((s: number, x: any) => s + (Number(x.achieved) / Math.max(1, Number(x.target))) * 100, 0) / i.length) + "%" : "0%" },
    { label: "100%+", icon: <Target className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => Number(x.achieved) >= Number(x.target)).length },
    { label: "Below 80%", icon: <AlertTriangle className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => (Number(x.achieved) / Math.max(1, Number(x.target))) < 0.8).length },
  ],
  columns: [
    { key: "name", header: "Assignee" },
    { key: "type", header: "Type" },
    { key: "period", header: "Period" },
    { key: "target", header: "Target", render: (i: any) => Rs(i.target) },
    { key: "achieved", header: "Achieved", render: (i: any) => Rs(i.achieved) },
    { key: "pct", header: "%", render: (i: any) => `${Math.round((Number(i.achieved) / Math.max(1, Number(i.target))) * 100)}%` },
    { key: "incentive", header: "Incentive", render: (i: any) => Rs(i.incentive) },
  ],
  fields: [
    text("name", "Assignee (Employee/Branch)", { required: true }),
    sel("type", "Target Type", ["Sales", "Recovery", "Branch", "Product"], { required: true }),
    text("period", "Period", { placeholder: "May 2026" }),
    num("target", "Target Amount (Rs.)", { required: true }),
    num("achieved", "Achieved Amount (Rs.)", { defaultValue: 0 }),
    num("incentive", "Incentive (Rs.)"),
  ],
  seed: [
    { id: "1", name: "Model Town", type: "Branch", period: "May 2026", target: 5000000, achieved: 4280000, incentive: 25000 },
    { id: "2", name: "Bilal Ahmed", type: "Recovery", period: "May 2026", target: 600000, achieved: 425000, incentive: 5000 },
  ],
};

export const reportsListConfig: EntityPageProps<any> = {
  title: "Reports",
  description: "Operational and financial reports library.",
  storageKey: "qcrm.reportsList",
  withAvatar: { nameKey: "name", subKey: "module" },
  searchKeys: ["name", "module"],
  kpis: [
    { label: "Total Reports", icon: <BookOpen className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Sales", icon: <ShoppingBag className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.module === "Sales").length },
    { label: "Inventory", icon: <Boxes className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.module === "Inventory").length },
    { label: "Finance", icon: <Wallet className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.module === "Finance").length },
  ],
  columns: [
    { key: "name", header: "Report" },
    { key: "module", header: "Module" },
    { key: "frequency", header: "Frequency" },
    { key: "lastRun", header: "Last Run" },
  ],
  fields: [
    text("name", "Report Name", { required: true }),
    sel("module", "Module", ["Sales", "Inventory", "Installments", "Finance", "HR", "Customers", "Recovery"]),
    sel("frequency", "Frequency", ["Daily", "Weekly", "Monthly", "Yearly", "On-demand"], { defaultValue: "On-demand" }),
    { name: "lastRun", label: "Last Run", type: "date" },
  ],
  seed: [
    { id: "1", name: "Daily Sales Summary", module: "Sales", frequency: "Daily", lastRun: "2026-05-08" },
    { id: "2", name: "Stock Movement Report", module: "Inventory", frequency: "Weekly", lastRun: "2026-05-05" },
    { id: "3", name: "Installment Collection Report", module: "Installments", frequency: "Daily", lastRun: "2026-05-08" },
    { id: "4", name: "Defaulter Report", module: "Installments", frequency: "Weekly", lastRun: "2026-05-04" },
    { id: "5", name: "Profit & Loss", module: "Finance", frequency: "Monthly", lastRun: "2026-05-01" },
    { id: "6", name: "Branch Profitability", module: "Finance", frequency: "Monthly", lastRun: "2026-05-01" },
  ],
};

export const notificationsConfig: EntityPageProps<any> = {
  title: "Notification Rules",
  description: "SMS, WhatsApp and email alert rules.",
  storageKey: "qcrm.notifications",
  withAvatar: { nameKey: "event", subKey: "channel" },
  searchKeys: ["event", "channel"],
  kpis: [
    { label: "Active Rules", icon: <Bell className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.status === "Active").length },
    { label: "SMS", icon: <Bell className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.channel === "SMS").length },
    { label: "WhatsApp", icon: <Bell className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.channel === "WhatsApp").length },
    { label: "Email", icon: <Bell className="h-5 w-5" />, tone: "primary", compute: (i) => i.filter((x: any) => x.channel === "Email").length },
  ],
  columns: [
    { key: "event", header: "Event" },
    { key: "channel", header: "Channel" },
    { key: "audience", header: "Audience" },
    { key: "template", header: "Template" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    sel("event", "Event", ["Installment Due Tomorrow", "Installment Overdue", "Payment Received", "Cheque Bounced", "Low Stock", "Salary Processed"], { required: true }),
    sel("channel", "Channel", ["SMS", "WhatsApp", "Email"], { required: true }),
    sel("audience", "Audience", ["Customer", "Recovery Agent", "Branch Manager", "Tenant Owner"]),
    text("template", "Template Name"),
    status(),
  ],
  seed: [
    { id: "1", event: "Installment Due Tomorrow", channel: "SMS", audience: "Customer", template: "due_tomorrow", status: "Active" },
    { id: "2", event: "Installment Overdue", channel: "WhatsApp", audience: "Customer", template: "overdue_v2", status: "Active" },
    { id: "3", event: "Payment Received", channel: "SMS", audience: "Customer", template: "receipt_thanks", status: "Active" },
  ],
};

export const settingsConfig: EntityPageProps<any> = {
  title: "Settings & Users",
  description: "Users, roles, integrations and preferences.",
  storageKey: "qcrm.users",
  withAvatar: { nameKey: "name", subKey: "email" },
  searchKeys: ["name", "email", "role"],
  kpis: [
    { label: "Total Users", icon: <Users className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Active", "Active", "success", <UserCheck className="h-5 w-5" />),
    { label: "Admins", icon: <SettingsIcon className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.role?.includes("Admin") || x.role?.includes("Owner")).length },
    { label: "Branches Linked", icon: <Building2 className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.branch)).size },
  ],
  columns: [
    { key: "name", header: "User" },
    { key: "email", header: "Email" },
    { key: "role", header: "Role" },
    { key: "branch", header: "Branch" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Full Name", { required: true }),
    text("email", "Email", { required: true }),
    sel("role", "Role", ["Tenant Owner", "Head Office Admin", "Branch Manager", "Salesman", "Recovery Manager", "Recovery Agent", "Accountant", "Inventory Manager", "Cashier", "HR Manager", "Auditor"]),
    sel("branch", "Branch", ["All", "Model Town", "Gulberg", "DHA Phase 5", "Johar Town", "Head Office"]),
    text("phone", "Phone"),
    status(),
  ],
  seed: [
    { id: "1", name: "Ahmed Hassan", email: "ahmed@creditwise.pk", role: "Tenant Owner", branch: "All", phone: "+92 300 0000001", status: "Active" },
    { id: "2", name: "Tariq Mahmood", email: "tariq@creditwise.pk", role: "Branch Manager", branch: "Model Town", phone: "+92 333 9988776", status: "Active" },
  ],
};

export const masterSettingsConfig: EntityPageProps<any> = {
  title: "Master Settings",
  description: "Company profile, currencies, tax rules and core master data.",
  storageKey: "qcrm.master_settings",
  withAvatar: { nameKey: "key", subKey: "category" },
  searchKeys: ["key", "category", "value"],
  kpis: [
    { label: "Total Settings", icon: <SettingsIcon className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Categories", icon: <SettingsIcon className="h-5 w-5" />, tone: "primary", compute: (i) => new Set(i.map((x: any) => x.category)).size },
    STATUS_KPI("Active", "Active", "success", <SettingsIcon className="h-5 w-5" />),
    STATUS_KPI("Inactive", "Inactive", "warning", <SettingsIcon className="h-5 w-5" />),
  ],
  columns: [
    { key: "key", header: "Setting" },
    { key: "category", header: "Category" },
    { key: "value", header: "Value" },
    { key: "description", header: "Description" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("key", "Setting Key", { required: true }),
    sel("category", "Category", ["Company Profile", "Currency", "Tax", "Invoice", "Numbering", "Email", "SMS", "Print"]),
    text("value", "Value", { required: true }),
    area("description", "Description"),
    status(),
  ],
  seed: [
    { id: "1", key: "Company Name", category: "Company Profile", value: "CreditWise (Pvt) Ltd", description: "Legal company name on invoices", status: "Active" },
    { id: "2", key: "Base Currency", category: "Currency", value: "PKR (Rs.)", description: "Default reporting currency", status: "Active" },
    { id: "3", key: "GST / Sales Tax", category: "Tax", value: "18%", description: "Standard sales tax rate", status: "Active" },
    { id: "4", key: "Withholding Tax", category: "Tax", value: "4.5%", description: "On non-filer suppliers", status: "Active" },
    { id: "5", key: "Invoice Prefix", category: "Numbering", value: "INV-", description: "Sales invoice prefix", status: "Active" },
    { id: "6", key: "PO Prefix", category: "Numbering", value: "PO-", description: "Purchase order prefix", status: "Active" },
    { id: "7", key: "Fiscal Year Start", category: "Company Profile", value: "01-July", description: "Pakistan fiscal year", status: "Active" },
    { id: "8", key: "Default Print Size", category: "Print", value: "A4", description: "Invoice print size", status: "Active" },
  ],
};

export const integrationSettingsConfig: EntityPageProps<any> = {
  title: "Integration Settings",
  description: "Third-party integrations and API connections.",
  storageKey: "qcrm.integrations",
  withAvatar: { nameKey: "name", subKey: "type" },
  searchKeys: ["name", "type", "provider"],
  kpis: [
    { label: "Total Integrations", icon: <SettingsIcon className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    { label: "Connected", icon: <UserCheck className="h-5 w-5" />, tone: "success", compute: (i) => i.filter((x: any) => x.status === "Connected").length },
    { label: "Disconnected", icon: <UserX className="h-5 w-5" />, tone: "warning", compute: (i) => i.filter((x: any) => x.status === "Disconnected").length },
    { label: "Errors", icon: <AlertTriangle className="h-5 w-5" />, tone: "destructive", compute: (i) => i.filter((x: any) => x.status === "Error").length },
  ],
  columns: [
    { key: "name", header: "Integration" },
    { key: "type", header: "Type" },
    { key: "provider", header: "Provider" },
    { key: "endpoint", header: "Endpoint" },
    { key: "lastSync", header: "Last Sync" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("name", "Integration Name", { required: true }),
    sel("type", "Type", ["Payment Gateway", "SMS", "Email", "WhatsApp", "Accounting", "E-Commerce", "Logistics", "API"]),
    text("provider", "Provider", { required: true }),
    text("endpoint", "Endpoint / URL"),
    text("apiKey", "API Key", { placeholder: "••••••••" }),
    { name: "lastSync", label: "Last Sync", type: "date" },
    sel("status", "Status", ["Connected", "Disconnected", "Error", "Pending"], { defaultValue: "Disconnected" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", name: "JazzCash Payments", type: "Payment Gateway", provider: "JazzCash", endpoint: "api.jazzcash.com.pk", lastSync: "2026-05-07", status: "Connected" },
    { id: "2", name: "EasyPaisa Wallet", type: "Payment Gateway", provider: "EasyPaisa", endpoint: "api.easypaisa.com.pk", lastSync: "2026-05-07", status: "Connected" },
    { id: "3", name: "Bulk SMS", type: "SMS", provider: "Branded SMS PK", endpoint: "api.brandedsms.pk", lastSync: "2026-05-08", status: "Connected" },
    { id: "4", name: "WhatsApp Business", type: "WhatsApp", provider: "Meta Cloud API", endpoint: "graph.facebook.com", lastSync: "2026-05-06", status: "Error" },
    { id: "5", name: "QuickBooks Sync", type: "Accounting", provider: "QuickBooks Online", endpoint: "quickbooks.api.intuit.com", lastSync: "", status: "Disconnected" },
  ],
};

// ============ SUPPORT ============

export const supportTicketsConfig: EntityPageProps<any> = {
  title: "Support Tickets",
  description: "Internal & customer-raised support requests with priority and SLA tracking.",
  storageKey: "qcrm.support.tickets",
  withAvatar: { nameKey: "ref", subKey: "subject" },
  searchKeys: ["ref", "subject", "customer", "assignee", "category"],
  kpis: [
    { label: "Total Tickets", icon: <FileText className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Open", "Open", "primary", <Clock className="h-5 w-5" />),
    STATUS_KPI("In Progress", "In Progress", "warning", <Clock className="h-5 w-5" />),
    STATUS_KPI("Resolved", "Resolved", "success", <ClipboardCheck className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Ticket #" },
    { key: "subject", header: "Subject" },
    { key: "customer", header: "Customer" },
    { key: "category", header: "Category" },
    { key: "priority", header: "Priority", render: (i: any) => STATUS_BADGE(i.priority) },
    { key: "assignee", header: "Assignee" },
    { key: "createdAt", header: "Created" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Ticket #", { required: true }),
    text("subject", "Subject", { required: true }),
    text("customer", "Customer"),
    text("phone", "Phone"),
    sel("category", "Category", ["Billing", "Installments", "Delivery", "Product", "Account", "Other"], { defaultValue: "Other" }),
    sel("priority", "Priority", ["Low", "Medium", "High", "Critical"], { defaultValue: "Medium" }),
    text("assignee", "Assignee"),
    { name: "createdAt", label: "Created", type: "date" },
    sel("status", "Status", ["Open", "In Progress", "Pending", "Resolved", "Closed"], { defaultValue: "Open" }),
    area("description", "Description"),
  ],
  seed: [
    { id: "1", ref: "TKT-5001", subject: "Wrong EMI deducted", customer: "Sara Khan", phone: "+92 300 1234567", category: "Billing", priority: "High", assignee: "Asma Tariq", createdAt: TODAY_ISO(), status: "Open" },
    { id: "2", ref: "TKT-5002", subject: "Need duplicate receipt", customer: "Imran Ali", phone: "+92 321 2233445", category: "Billing", priority: "Low", assignee: "Hassan Raza", createdAt: ADD_DAYS(-1), status: "Resolved" },
    { id: "3", ref: "TKT-5003", subject: "Delivery delayed 4 days", customer: "Hira Tariq", phone: "+92 333 5566778", category: "Delivery", priority: "High", assignee: "Bilal Hussain", createdAt: ADD_DAYS(-2), status: "In Progress" },
    { id: "4", ref: "TKT-5004", subject: "Login OTP not received", customer: "Ahmed Raza", phone: "+92 345 6677889", category: "Account", priority: "Medium", assignee: "Asma Tariq", createdAt: ADD_DAYS(-3), status: "Closed" },
    { id: "5", ref: "TKT-5005", subject: "Reschedule installment", customer: "Faisal Mehmood", phone: "+92 312 9988776", category: "Installments", priority: "Medium", assignee: "Hassan Raza", createdAt: ADD_DAYS(-4), status: "Pending" },
  ],
};

export const customerComplaintsConfig: EntityPageProps<any> = {
  title: "Customer Complaints",
  description: "Formal customer complaints with severity, root cause and resolution tracking.",
  storageKey: "qcrm.support.complaints",
  withAvatar: { nameKey: "ref", subKey: "customer" },
  searchKeys: ["ref", "customer", "subject", "category"],
  kpis: [
    { label: "Total Complaints", icon: <AlertTriangle className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("New", "New", "primary", <Bell className="h-5 w-5" />),
    STATUS_KPI("Investigating", "Investigating", "warning", <Clock className="h-5 w-5" />),
    STATUS_KPI("Resolved", "Resolved", "success", <ClipboardCheck className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Complaint #" },
    { key: "customer", header: "Customer" },
    { key: "subject", header: "Subject" },
    { key: "category", header: "Category" },
    { key: "severity", header: "Severity", render: (i: any) => STATUS_BADGE(i.severity) },
    { key: "channel", header: "Channel" },
    { key: "filedOn", header: "Filed" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Complaint #", { required: true }),
    text("customer", "Customer", { required: true }),
    text("phone", "Phone"),
    text("subject", "Subject", { required: true }),
    sel("category", "Category", ["Service", "Product Quality", "Staff Behavior", "Pricing", "Delivery", "Recovery Agent", "Other"], { defaultValue: "Service" }),
    sel("severity", "Severity", ["Low", "Medium", "High", "Critical"], { defaultValue: "Medium" }),
    sel("channel", "Channel", ["Phone", "Email", "Walk-in", "WhatsApp", "Social Media", "Web"], { defaultValue: "Phone" }),
    { name: "filedOn", label: "Filed On", type: "date" },
    text("assignee", "Assigned To"),
    sel("status", "Status", ["New", "Investigating", "Pending", "Resolved", "Closed", "Escalated"], { defaultValue: "New" }),
    area("description", "Description"),
    area("resolution", "Resolution Notes"),
  ],
  seed: [
    { id: "1", ref: "CMP-3001", customer: "Sadia Shah", phone: "+92 300 4455667", subject: "Delivery boy was rude", category: "Staff Behavior", severity: "High", channel: "Phone", filedOn: TODAY_ISO(), assignee: "HR Team", status: "Investigating" },
    { id: "2", ref: "CMP-3002", customer: "Ahmed Raza", phone: "+92 321 1122334", subject: "AC stopped working in 7 days", category: "Product Quality", severity: "Critical", channel: "WhatsApp", filedOn: ADD_DAYS(-1), assignee: "Service Mgr", status: "New" },
    { id: "3", ref: "CMP-3003", customer: "Imran Ali", phone: "+92 333 9988776", subject: "Recovery agent visited at midnight", category: "Recovery Agent", severity: "High", channel: "Email", filedOn: ADD_DAYS(-3), assignee: "Compliance", status: "Escalated" },
    { id: "4", ref: "CMP-3004", customer: "Fatima Noor", phone: "+92 345 1234567", subject: "Hidden charges in invoice", category: "Pricing", severity: "Medium", channel: "Walk-in", filedOn: ADD_DAYS(-5), assignee: "Branch Mgr", status: "Resolved" },
    { id: "5", ref: "CMP-3005", customer: "Bilal Khan", phone: "+92 312 6677889", subject: "Wrong product delivered", category: "Delivery", severity: "Medium", channel: "Phone", filedOn: ADD_DAYS(-2), assignee: "Logistics", status: "Pending" },
  ],
};

export const warrantyClaimsConfig: EntityPageProps<any> = {
  title: "Warranty Claims",
  description: "Product warranty claims — verification, dispatch to brand and replacement tracking.",
  storageKey: "qcrm.support.warranty",
  withAvatar: { nameKey: "ref", subKey: "product" },
  searchKeys: ["ref", "customer", "product", "brand", "serial", "invoice"],
  kpis: [
    { label: "Total Claims", icon: <ClipboardCheck className="h-5 w-5" />, tone: "primary", compute: (i) => i.length },
    STATUS_KPI("Submitted", "Submitted", "primary", <FileText className="h-5 w-5" />),
    STATUS_KPI("Approved", "Approved", "success", <ClipboardCheck className="h-5 w-5" />),
    STATUS_KPI("Rejected", "Rejected", "destructive", <AlertTriangle className="h-5 w-5" />),
  ],
  columns: [
    { key: "ref", header: "Claim #" },
    { key: "customer", header: "Customer" },
    { key: "product", header: "Product" },
    { key: "brand", header: "Brand" },
    { key: "serial", header: "Serial #" },
    { key: "invoice", header: "Invoice" },
    { key: "issue", header: "Issue" },
    { key: "claimedOn", header: "Claimed" },
    { key: "status", header: "Status", render: (i: any) => STATUS_BADGE(i.status) },
  ],
  fields: [
    text("ref", "Claim #", { required: true }),
    text("customer", "Customer", { required: true }),
    text("phone", "Phone"),
    text("invoice", "Invoice / HP Case Ref"),
    text("product", "Product", { required: true }),
    text("brand", "Brand"),
    text("serial", "Serial #"),
    { name: "purchaseDate", label: "Purchase Date", type: "date" },
    sel("warrantyType", "Warranty Type", ["Manufacturer", "Extended", "Store"], { defaultValue: "Manufacturer" }),
    text("issue", "Reported Issue"),
    { name: "claimedOn", label: "Claimed On", type: "date" },
    sel("resolution", "Resolution", ["Repair", "Replacement", "Refund", "Pending Decision"], { defaultValue: "Pending Decision" }),
    sel("status", "Status", ["Submitted", "Under Review", "Approved", "Dispatched to Brand", "Resolved", "Rejected"], { defaultValue: "Submitted" }),
    area("notes", "Notes"),
  ],
  seed: [
    { id: "1", ref: "WC-4001", customer: "Sara Khan", phone: "+92 300 1234567", invoice: "INV-7002", product: "Gree 1.5 Ton AC", brand: "Gree", serial: "GR-AC-99821", purchaseDate: ADD_DAYS(-45), warrantyType: "Manufacturer", issue: "Cooling not working", claimedOn: TODAY_ISO(), resolution: "Repair", status: "Under Review" },
    { id: "2", ref: "WC-4002", customer: "Ahmed Raza", phone: "+92 321 2233445", invoice: "INV-7004", product: "Samsung LED TV 55", brand: "Samsung", serial: "SM-TV-44521", purchaseDate: ADD_DAYS(-90), warrantyType: "Manufacturer", issue: "Display flicker", claimedOn: ADD_DAYS(-2), resolution: "Replacement", status: "Approved" },
    { id: "3", ref: "WC-4003", customer: "Imran Ali", phone: "+92 333 5566778", invoice: "INV-7001", product: "Haier Refrigerator", brand: "Haier", serial: "HR-RF-77812", purchaseDate: ADD_DAYS(-200), warrantyType: "Extended", issue: "Compressor noise", claimedOn: ADD_DAYS(-5), resolution: "Repair", status: "Dispatched to Brand" },
    { id: "4", ref: "WC-4004", customer: "Faisal Mehmood", phone: "+92 312 9988776", invoice: "INV-7008", product: "Honda 70 Bike", brand: "Honda", serial: "HD-BK-22134", purchaseDate: ADD_DAYS(-15), warrantyType: "Manufacturer", issue: "Self start failure", claimedOn: ADD_DAYS(-1), resolution: "Repair", status: "Submitted" },
    { id: "5", ref: "WC-4005", customer: "Hira Tariq", phone: "+92 345 6677889", invoice: "INV-7003", product: "Dawlance Microwave", brand: "Dawlance", serial: "DW-MW-11456", purchaseDate: ADD_DAYS(-400), warrantyType: "Manufacturer", issue: "Outside warranty period", claimedOn: ADD_DAYS(-7), resolution: "Pending Decision", status: "Rejected" },
  ],
};
