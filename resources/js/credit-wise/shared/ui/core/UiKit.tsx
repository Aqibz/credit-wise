import { ReactNode, ThHTMLAttributes, HTMLAttributes, CSSProperties } from "react";
import { Link, useLocation } from "@/shared/navigation";
import {
  Home, ChevronRight, MoreHorizontal, ChevronUp, ChevronDown, ChevronsUpDown,
  Boxes, ShoppingCart, Users, BookOpen, Wallet, Truck, ShieldCheck,
  Briefcase, Building2, Bell, Target, FileText, Settings, BarChart3, type LucideIcon,
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

/**
 * UI tokens â€” single source of truth for repeated class strings.
 * Edit here once instead of hunting through every component.
 */
export const ui = {
  // text colors
  textMuted:       "text-muted-foreground",
  textMutedSoft:   "text-muted-foreground/80",
  textMutedFaint:  "text-muted-foreground/40",
  textBody:        "text-foreground",
  textPrimary:     "text-primary",
  // surfaces & borders
  surfaceCard:     "bg-card",
  surfaceMutedHover: "hover:bg-muted/60",
  border:          "border border-border/50",
  borderBottom:    "border-b border-border/60",
  // shadow rhythm â€” minimal SaaS feel (subtle, almost flat)
  shadowCard:      "shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]",
  shadowCardHover: "hover:shadow-[0_2px_6px_-1px_rgba(16,24,40,0.06)]",
  // typography sizes used in headers
  textCrumb:       "text-[11.5px] xl:text-[12px]",
  textTitle:       "text-[20px] xl:text-[22px] 2xl:text-[24px] font-semibold tracking-tight",
  textDesc:        "text-[13px] xl:text-[13.5px]",
  // Single eyebrow ramp â€” softer, more SaaS-like (less shouty)
  labelEyebrow:    "text-[11px] font-semibold uppercase tracking-[0.08em] leading-tight",
  textKpiLabel:    "text-[11.5px] font-medium uppercase tracking-[0.06em] leading-tight",
  textKpiValue:    "text-[26px] xl:text-[28px] leading-none font-semibold tracking-tight tabular-nums",
  textKpiHint:     "text-[12px] leading-snug",
  // focus ring (locked: same on every interactive card / link / button surface)
  focusRing:       "focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background",
  // Interactive card states â€” subtle hover lift, no scale
  interactiveCard: "cursor-pointer transition-colors duration-150 ease-out " +
                   "hover:border-primary/30 hover:bg-muted/20 " +
                   "group-focus-visible:border-primary/40",
  // ===== Admin tables â€” single locked header style =====
  // Apply to <thead>: background + underline + base color
  // Apply to <thead>: bg, underline, base color, AND auto-stamp typography
  // on every descendant <th> so legacy tables stay consistent without rewrites.
  tableHeadRow:    "bg-muted/30 border-b border-border text-muted-foreground " +
                   "[&_th]:text-[11px] [&_th]:font-semibold [&_th]:uppercase " +
                   "[&_th]:tracking-[0.06em] [&_th]:leading-tight",
  // Apply to every <th>: same eyebrow ramp + alignment + padding
  tableHeadCell:   "text-[11px] font-semibold uppercase tracking-[0.06em] leading-tight text-left px-2 py-3",
} as const;

const CRUMB_MAX_CH = 22; // truncate single crumb labels longer than this
const COLLAPSE_AFTER = 4; // when crumbs exceed this, collapse middle ones

function truncate(label: string, max = CRUMB_MAX_CH) {
  return label.length > max ? label.slice(0, max - 1).trimEnd() + "â€¦" : label;
}

function CrumbLabel({ label, className }: { label: string; className?: string }) {
  const truncated = truncate(label);
  const isTruncated = truncated !== label;
  const node = <span className={`max-w-[160px] xl:max-w-[220px] truncate inline-block align-bottom ${className ?? ""}`}>{truncated}</span>;
  if (!isTruncated) return node;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{node}</TooltipTrigger>
      <TooltipContent side="bottom" className="text-xs">{label}</TooltipContent>
    </Tooltip>
  );
}

// Top-level segments that group child pages but have no index route of their own.
// Their crumb should render as plain text (not a broken link).
const NON_NAVIGABLE_SEGMENTS = new Set([
  "purchases", "hr", "inventory", "recovery", "accounts",
  "catalog", "logistics", "audit-logs", "platforms", "security",
  "branches", "targets", "notifications",
]);

// Section icons rendered alongside the segment label in breadcrumbs.
const SEGMENT_ICONS: Record<string, LucideIcon> = {
  inventory: Boxes,
  purchases: ShoppingCart,
  hr: Briefcase,
  recovery: Wallet,
  accounts: BookOpen,
  catalog: FileText,
  logistics: Truck,
  "audit-logs": ShieldCheck,
  platforms: Building2,
  security: ShieldCheck,
  branches: Building2,
  targets: Target,
  notifications: Bell,
  settings: Settings,
  reports: BarChart3,
  customers: Users,
};

export function Breadcrumbs({ title }: { title: string }) {
  const { pathname } = useLocation();
  const parts = pathname.split("/").filter(Boolean);
  const allCrumbs = parts.map((p, i) => ({
    raw: p,
    label: p.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
    to: "/" + parts.slice(0, i + 1).join("/"),
  }));
  if (allCrumbs.length) allCrumbs[allCrumbs.length - 1].label = title;

  // Collapse middle crumbs when path is long
  let collapsed: typeof allCrumbs | null = null;
  let visible = allCrumbs;
  if (allCrumbs.length > COLLAPSE_AFTER) {
    const first = allCrumbs.slice(0, 1);
    const last = allCrumbs.slice(-2);
    collapsed = allCrumbs.slice(1, -2);
    visible = [...first, ...last];
  }

  const renderCrumb = (c: { raw: string; label: string; to: string }, isLast: boolean) => {
    const isNonNav = NON_NAVIGABLE_SEGMENTS.has(c.raw);
    const SegIcon = SEGMENT_ICONS[c.raw];
    const iconNode = SegIcon ? <SegIcon className="h-3.5 w-3.5 shrink-0" strokeWidth={2.25} /> : null;
    if (isLast) {
      return (
        <span className={`inline-flex items-center gap-1 ${ui.textBody} font-bold`}>
          {iconNode}
          <CrumbLabel label={c.label} className={`${ui.textBody} font-bold`} />
        </span>
      );
    }
    if (isNonNav) {
      return (
        <span className={`inline-flex items-center gap-1 ${ui.textBody} font-semibold`}>
          {iconNode}
          <CrumbLabel label={c.label} className={`${ui.textBody} font-semibold`} />
        </span>
      );
    }
    return (
      <Link to={c.to} className={`inline-flex items-center gap-1 ${ui.textMuted} hover:${ui.textBody} transition-colors`}>
        {iconNode}
        <CrumbLabel label={c.label} />
      </Link>
    );
  };

  return (
    <TooltipProvider delayDuration={200}>
      <nav className={`flex items-center gap-1.5 ${ui.textCrumb} ${ui.textMuted} flex-nowrap min-w-0 overflow-hidden`}>
        <Link to="/" className={`inline-flex items-center gap-1 ${ui.textPrimary} font-semibold hover:opacity-80 transition-opacity shrink-0`}>
          <Home className="h-3.5 w-3.5" />
          <span>Dashboard</span>
        </Link>
        {visible.map((c, i) => {
          const isLast = i === visible.length - 1;
          const showCollapseHere = collapsed && i === 1;
          return (
            <span key={c.to} className="inline-flex items-center gap-1.5 min-w-0">
              <ChevronRight className={`h-3 w-3 ${ui.textMutedFaint} shrink-0`} />
              {showCollapseHere && (
                <>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <button type="button" className={`inline-flex items-center px-1 rounded ${ui.surfaceMutedHover} text-muted-foreground/70 shrink-0`} aria-label="Show hidden breadcrumbs">
                        <MoreHorizontal className="h-3.5 w-3.5" />
                      </button>
                    </TooltipTrigger>
                    <TooltipContent side="bottom" className="text-xs max-w-xs">
                      {collapsed!.map((h) => h.label).join(" / ")}
                    </TooltipContent>
                  </Tooltip>
                  <ChevronRight className={`h-3 w-3 ${ui.textMutedFaint} shrink-0`} />
                </>
              )}
              {renderCrumb(c, isLast)}
            </span>
          );
        })}
      </nav>
    </TooltipProvider>
  );
}

export function PageHeader({ title, description, actions, icon }: { title: string; description?: string; actions?: ReactNode; icon?: ReactNode }) {
  return (
    <div className={`mb-5 xl:mb-6 pb-4 xl:pb-5 ${ui.borderBottom}`}>
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="min-w-0">
          <h1 className={`${ui.textTitle} ${ui.textBody} leading-tight inline-flex items-center gap-2`}>
            {icon && (
              <span className="text-primary inline-flex items-center [&_svg]:h-6 [&_svg]:w-6 [&_svg]:stroke-[1.75]">
                {icon}
              </span>
            )}
            <span>{title}</span>
          </h1>
          {description && <p className={`${ui.textDesc} ${ui.textMuted} mt-1 max-w-2xl leading-relaxed`}>{description}</p>}
        </div>
        {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
      </div>
    </div>
  );
}

export function StatCard({
  label, value, hint, icon, tone = "primary", to, valueClassName,
}: {
  label: string; value: string | number | ReactNode; hint?: string; icon: ReactNode;
  tone?: "primary" | "success" | "warning" | "destructive" | "muted";
  to?: string;
  valueClassName?: string;
}) {
  const toneMap = {
    primary:     { chip: "bg-primary/10 text-primary" },
    success:     { chip: "bg-success/15 text-success" },
    warning:     { chip: "bg-warning/20 text-warning-foreground" },
    destructive: { chip: "bg-destructive/10 text-destructive" },
    muted:       { chip: "bg-muted text-muted-foreground" },
  } as const;
  const t = toneMap[tone] ?? toneMap.primary;
  const interactive = to ? ui.interactiveCard : "";
  const inner = (
    <div className={`relative rounded-xl ${ui.surfaceCard} p-5 h-full ${ui.shadowCard} ${ui.border} ${interactive}`}>
      <div className="flex items-center justify-between gap-3 mb-4">
        <div className={`${ui.textKpiLabel} ${ui.textMuted}`}>{label}</div>
        <div
          className={`shrink-0 h-8 w-8 rounded-lg grid place-items-center ${t.chip} [&_svg]:h-4 [&_svg]:w-4 [&_svg]:stroke-[2]`}
        >
          {icon}
        </div>
      </div>
      <div className={`${ui.textKpiValue} ${valueClassName ?? ui.textBody}`}>{value}</div>
      {hint && <div className={`${ui.textKpiHint} ${ui.textMuted} mt-1.5 truncate`}>{hint}</div>}
    </div>
  );
  if (to) {
    return (
      <Link
        to={to as any}
        className={`group block rounded-xl ${ui.focusRing}`}
      >
        {inner}
      </Link>
    );
  }
  return <div className="group">{inner}</div>;
}

/**
 * Skeleton placeholder that mirrors the StatCard layout exactly.
 * Use one per expected card while data is loading:
 *   {loading
 *     ? <StatCardSkeleton />
 *     : <StatCard label=... value=... icon=... />}
 *
 * Or render a row with <StatCardSkeletonGrid count={4} />.
 */
export function StatCardSkeleton() {
  return (
    <div
      role="status"
      aria-busy="true"
      aria-label="Loading"
      className={`relative overflow-hidden rounded-xl ${ui.surfaceCard} p-4 xl:p-5 h-full ${ui.shadowCard} ${ui.border}`}
    >
      <span aria-hidden className="absolute left-0 top-0 bottom-0 w-1 bg-muted" />
      <div className="relative flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1 space-y-2.5">
          <div className="h-3 w-20 rounded bg-muted animate-pulse" />
          <div className="h-7 w-24 rounded bg-muted animate-pulse" />
          <div className="h-3 w-28 rounded bg-muted/70 animate-pulse" />
        </div>
        <div className="h-11 w-11 shrink-0 rounded-xl bg-muted animate-pulse" />
      </div>
      <span className="sr-only">Loadingâ€¦</span>
    </div>
  );
}

export function StatCardSkeletonGrid({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xl:gap-4">
      {Array.from({ length: count }).map((_, i) => <StatCardSkeleton key={i} />)}
    </div>
  );
}

export function Badge({
  children,
  tone = "success",
  icon,
}: {
  children: ReactNode;
  tone?: "success" | "warning" | "destructive" | "muted" | "primary";
  icon?: ReactNode;
}) {
  const map = {
    success:     "bg-success/10 text-success border-success/25",
    warning:     "bg-warning/15 text-warning-foreground border-warning/30",
    destructive: "bg-destructive/10 text-destructive border-destructive/25",
    muted:       "bg-muted text-muted-foreground border-border",
    primary:     "bg-primary/10 text-primary border-primary/20",
  } as const;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-[3px] text-[11.5px] font-medium leading-none whitespace-nowrap ${map[tone]}`}
    >
      {icon && (
        <span className="[&_svg]:h-3 [&_svg]:w-3 [&_svg]:stroke-[2.5] inline-flex">
          {icon}
        </span>
      )}
      {children}
    </span>
  );
}

export function Avatar({ name, color = "primary" }: { name: string; color?: "primary" | "warning" | "destructive" | "info" }) {
  const initials = name.split(" ").map((p) => p[0]).slice(0, 2).join("").toUpperCase();
  const map = {
    primary: "bg-primary-soft text-primary",
    warning: "bg-warning/25 text-warning-foreground",
    destructive: "bg-destructive/15 text-destructive",
    info: "bg-info/20 text-info",
  } as const;
  return (
    <div className={`h-9 w-9 shrink-0 rounded-full grid place-items-center text-xs font-semibold ${map[color]}`}>
      {initials}
    </div>
  );
}

/**
 * Shared admin-table header building blocks.
 * Locks bg, underline, type ramp, alignment, and padding so every entity
 * page renders identical headers without repeating Tailwind strings.
 *
 *   <EntityTableHead>
 *     <Th width="3rem">SR#</Th>
 *     <Th>Name</Th>
 *     <Th align="right">Amount</Th>
 *     <Th width="4rem">Actions</Th>
 *   </EntityTableHead>
 */
export type SortDirection = "asc" | "desc" | null;

type ThProps = Omit<ThHTMLAttributes<HTMLTableCellElement>, "align"> & {
  align?: "left" | "right" | "center";
  width?: string | number;
  /** Hide on small screens */
  hideOnMobile?: boolean;
  /** Mark column as sortable â€” renders a sort icon and click/keyboard handler. */
  sortable?: boolean;
  /** Current sort state for THIS column. null = not active. */
  sortDirection?: SortDirection;
  /** Called when user clicks/Enter/Space on a sortable header. */
  onSort?: () => void;
};

export function Th({
  align = "left",
  width,
  hideOnMobile,
  sortable,
  sortDirection = null,
  onSort,
  className = "",
  style,
  children,
  ...rest
}: ThProps) {
  const alignClass =
    align === "right" ? "text-right" : align === "center" ? "text-center" : "text-left";
  const justify =
    align === "right" ? "justify-end" : align === "center" ? "justify-center" : "justify-start";
  const ariaSort: "ascending" | "descending" | "none" | undefined = sortable
    ? sortDirection === "asc" ? "ascending" : sortDirection === "desc" ? "descending" : "none"
    : undefined;

  const SortIcon = !sortable
    ? null
    : sortDirection === "asc"
      ? ChevronUp
      : sortDirection === "desc"
        ? ChevronDown
        : ChevronsUpDown;

  return (
    <th
      scope="col"
      aria-sort={ariaSort}
      {...rest}
      style={width !== undefined ? { width, ...style } : style}
      className={`${ui.tableHeadCell} ${alignClass} ${hideOnMobile ? "hidden md:table-cell" : ""} ${className}`}
    >
      {sortable ? (
        <button
          type="button"
          onClick={onSort}
          className={`inline-flex items-center gap-1 w-full ${justify} ${ui.tableHeadCell} !p-0 !text-inherit cursor-pointer select-none rounded ${ui.focusRing} hover:text-foreground transition-colors ${sortDirection ? "text-foreground" : ""}`}
        >
          <span>{children}</span>
          {SortIcon && (
            <SortIcon
              aria-hidden
              className={`h-3.5 w-3.5 shrink-0 transition-opacity ${sortDirection ? "opacity-100" : "opacity-40 group-hover:opacity-70"}`}
              strokeWidth={2.25}
            />
          )}
        </button>
      ) : (
        children
      )}
    </th>
  );
}

type EntityTableHeadProps = HTMLAttributes<HTMLTableSectionElement> & {
  /** Render a single <tr> automatically; set false to control rows manually. */
  withRow?: boolean;
  /**
   * Stick the header to the top of the nearest scrollable ancestor (usually
   * the table's overflow-auto wrapper). Adds an opaque background so rows
   * don't show through the translucent default head color. Pass a number to
   * offset from the top in pixels (e.g. when a toolbar sits above the table).
   */
  sticky?: boolean;
  stickyOffset?: number;
};

export function EntityTableHead({
  withRow = true,
  sticky = false,
  stickyOffset = 0,
  className = "",
  children,
  ...rest
}: EntityTableHeadProps) {
  // Sticky must be applied to <th> cells (thead position:sticky is unreliable
  // across browsers). Force an opaque bg so scrolled rows don't bleed through.
  const stickyClasses = sticky
    ? "[&>tr>th]:sticky [&>tr>th]:top-0 [&>tr>th]:z-10 [&>tr>th]:bg-muted [&>tr>th]:shadow-[0_1px_0_0_var(--border)]"
    : "";
  const stickyStyle =
    sticky && stickyOffset
      ? ({ ["--entity-thead-top" as any]: `${stickyOffset}px` } as CSSProperties)
      : undefined;
  return (
    <thead
      {...rest}
      style={{ ...(stickyStyle ?? {}), ...(rest.style ?? {}) }}
      className={`${ui.tableHeadRow} ${
        sticky && stickyOffset ? "[&>tr>th]:top-[var(--entity-thead-top)]" : ""
      } ${stickyClasses} ${className}`}
    >
      {withRow ? <tr>{children}</tr> : children}
    </thead>
  );
}
