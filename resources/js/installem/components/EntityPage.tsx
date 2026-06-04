import { ReactNode, useMemo, useState, useEffect, useRef, FormEvent, Fragment } from "react";
const FragmentRow = Fragment;
import { createPortal } from "react-dom";
import { Plus, Search, MoreVertical, Pencil, Trash2, ChevronLeft, ChevronRight, ChevronDown, X, ChevronUp, Eye, Tag, Hash, MapPin, Phone, Mail, Globe, User, Calendar, Wallet, FileText, Building2, Truck, Shield, ToggleLeft, AlignLeft, Type, CheckSquare, Box, Layers, CircleDollarSign, Percent, AlertTriangle, Link2, Download, Share2 } from "lucide-react";
import { Link, useRouter } from "@tanstack/react-router";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge, Avatar, ui, EntityTableHead, Th } from "@/components/ui-kit";
import { useEntityStore, Entity } from "@/lib/useEntityStore";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { NotifyDialog } from "@/components/NotifyDialog";
import { useToast } from "@/components/Toaster";

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}

export type FieldType = "text" | "number" | "select" | "textarea" | "date" | "tel" | "email" | "checkbox" | "variants";

export type VariantSchema = { name: string; label: string; type: "text" | "number"; placeholder?: string };

export type Field = {
  name: string;
  label: string;
  type: FieldType;
  options?: string[];
  placeholder?: string;
  required?: boolean;
  defaultValue?: any;
  fullWidth?: boolean;
  /** For type "variants": which checkbox field toggles visibility */
  showWhen?: { field: string; equals: any };
  /** For type "variants": column schema for each variant row */
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
  customForm?: (props: { initial?: T; onClose: () => void; onSubmit: (values: Record<string, any>) => void; isEdit: boolean }) => ReactNode;
  documentView?: (
    item: T,
    ctx: { close: () => void; onEdit?: () => void; onDelete?: () => void },
  ) => ReactNode;
  notifyOnSave?: {
    audiences: string[];
    eventLabel: string;
    buildMessage: (item: Record<string, any>, isEdit: boolean) => string;
  };
  headerSlot?: ReactNode;
  /** Rendered at the far end of the toolbar (after filters), pushed right with ml-auto. */
  toolbarEndSlot?: ReactNode;
  extraRowActions?: (item: T, close: () => void) => ReactNode;
  filters?: { key: string; label: string; options?: string[] }[];
  initialSearch?: string;
  /** Called (debounced) when the user types in the search box. Use this to
   *  push `q` into the URL so the current view is shareable / bookmarkable. */
  onSearchChange?: (q: string) => void;
  /** When true, renders a "Copy link" button next to the search box. */
  shareableLink?: boolean;
  /** Hook to mutate the form values right before they are persisted.
   *  Receives the existing record on edit (undefined on create). Useful for
   *  delta-vs-overwrite rules like the Opening Stock save mode. */
  transformOnSave?: (values: Record<string, any>, existing?: T) => Record<string, any>;
  hideAdd?: boolean;
};

export function EntityPage<T extends Entity>(props: EntityPageProps<T>) {
  return (
    <AppShell>
      <EntityPageInner {...props} />
    </AppShell>
  );
}

export function EntityPageContent<T extends Entity>(props: EntityPageProps<T>) {
  return <EntityPageInner {...props} />;
}

function EntityPageInner<T extends Entity>({
  title, description, storageKey, seed, fields, columns, kpis,
  searchKeys, addLabel, withAvatar, expandable, rowHref, addHref, editHref, customForm, documentView, notifyOnSave, headerSlot, toolbarEndSlot, extraRowActions, filters,
  initialSearch, onSearchChange, shareableLink, transformOnSave, hideAdd,
}: EntityPageProps<T>) {
  const { items, create, update, remove } = useEntityStore<T>(storageKey, seed);
  const router = useRouter();
  const toast = useToast();
  // Normalize URL `q` (treat undefined / "" / whitespace as no filter).
  const normalizedInitial = (initialSearch ?? "").trim();
  const [search, setSearch] = useState(normalizedInitial);
  // Sync with URL-driven initialSearch. When `q` is empty/undefined (deep link
  // back, manual URL edit, or "Reset"), clear the box AND collapse it AND reset
  // the page so stale results never linger.
  useEffect(() => {
    setSearch(normalizedInitial);
    setPage(1);
    if (!normalizedInitial) setSearchOpen(false);
  }, [normalizedInitial]);
  // Debounced URL sync so every keystroke isn't a navigation. Always pushes
  // the trimmed value — empty string tells the parent route to strip `q`.
  useEffect(() => {
    if (!onSearchChange) return;
    const next = search.trim();
    if (normalizedInitial === next) return;
    const id = setTimeout(() => onSearchChange(next), 250);
    return () => clearTimeout(id);
  }, [search, onSearchChange, normalizedInitial]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(5);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [actionFor, setActionFor] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState<boolean>(!!(initialSearch && initialSearch.length));
  useEffect(() => { if (initialSearch) setSearchOpen(true); }, [initialSearch]);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const [confirmDel, setConfirmDel] = useState<T | null>(null);
  const [notifyFor, setNotifyFor] = useState<{ item: Record<string, any>; isEdit: boolean } | null>(null);
  const [viewing, setViewing] = useState<T | null>(null);
  const [sort, setSort] = useState<{ key: string; dir: "asc" | "desc" } | null>(null);
  function toggleSort(key: string) {
    setPage(1);
    setSort((s) => {
      if (!s || s.key !== key) return { key, dir: "asc" };
      if (s.dir === "asc") return { key, dir: "desc" };
      return null;
    });
  }
  const entityName = title.replace(/s$/, "");

  const hasStatus = columns.some((c) => c.key === "status") || (items[0] && "status" in (items[0] as any));
  const statusOptions = useMemo(() => {
    if (!hasStatus) return [];
    const set = new Set<string>();
    items.forEach((it) => { const s = (it as any).status; if (s) set.add(String(s)); });
    return Array.from(set);
  }, [items, hasStatus]);

  const filterOptions = useMemo(() => {
    const out: Record<string, string[]> = {};
    (filters ?? []).forEach((f) => {
      if (f.options) { out[f.key] = f.options; return; }
      const set = new Set<string>();
      items.forEach((it) => { const v = (it as any)[f.key]; if (v != null && v !== "") set.add(String(v)); });
      out[f.key] = Array.from(set);
    });
    return out;
  }, [items, filters]);

  const filtered = useMemo(() => {
    let list = items;
    if (hasStatus && statusFilter !== "all") {
      list = list.filter((it) => String((it as any).status ?? "") === statusFilter);
    }
    for (const [k, v] of Object.entries(extraFilters)) {
      if (v && v !== "all") list = list.filter((it) => String((it as any)[k] ?? "") === v);
    }
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    const keys = searchKeys ?? (Object.keys(items[0] ?? {}) as (keyof T)[]);
    return list.filter((it) =>
      keys.some((k) => String(it[k] ?? "").toLowerCase().includes(q))
    );
  }, [items, search, searchKeys, statusFilter, hasStatus, extraFilters]);

  const sorted = useMemo(() => {
    if (!sort) return filtered;
    const { key, dir } = sort;
    const mult = dir === "asc" ? 1 : -1;
    return [...filtered].sort((a: any, b: any) => {
      const av = a?.[key];
      const bv = b?.[key];
      if (av == null && bv == null) return 0;
      if (av == null) return 1;
      if (bv == null) return -1;
      const an = typeof av === "number" ? av : Number(av);
      const bn = typeof bv === "number" ? bv : Number(bv);
      if (!Number.isNaN(an) && !Number.isNaN(bn) && typeof av !== "string" && typeof bv !== "string") {
        return (an - bn) * mult;
      }
      if (!Number.isNaN(an) && !Number.isNaN(bn) && /^-?\d+(\.\d+)?$/.test(String(av)) && /^-?\d+(\.\d+)?$/.test(String(bv))) {
        return (an - bn) * mult;
      }
      return String(av).localeCompare(String(bv), undefined, { numeric: true, sensitivity: "base" }) * mult;
    });
  }, [filtered, sort]);

  const totalPages = Math.max(1, Math.ceil(sorted.length / perPage));
  const safePage = Math.min(page, totalPages);
  const pageItems = sorted.slice((safePage - 1) * perPage, safePage * perPage);


  function openAdd() { setEditing(null); setOpen(true); }
  function openEdit(item: T) { setEditing(item); setOpen(true); setActionFor(null); }
  function askDelete(item: T) { setConfirmDel(item); setActionFor(null); }
  function doDelete() {
    if (!confirmDel) return;
    remove(confirmDel.id);
    toast.success(`${entityName} deleted`, "The record has been removed permanently.");
    setConfirmDel(null);
  }

  function onSubmit(values: Record<string, any>) {
    const isEdit = !!editing;
    const stamped = isEdit
      ? values
      : { ...values, time: values.time || nowTime(), createdAt: values.createdAt || new Date().toISOString() };
    const finalValues = transformOnSave
      ? transformOnSave(stamped, editing ?? undefined)
      : stamped;
    if (editing) {
      update(editing.id, finalValues as Partial<T>);
      toast.success(`${entityName} updated`, "Your changes have been saved.");
    } else {
      create(finalValues as Omit<T, "id">);
      toast.success(`${entityName} created`, "New record added successfully.");
    }
    setOpen(false);
    if (notifyOnSave) {
      setNotifyFor({ item: finalValues, isEdit });
    }
  }

  function downloadRow(item: T) {
    const blob = new Blob([JSON.stringify(item, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    const ref = (item as any).ref || (item as any).code || (item as any).id;
    a.download = `${entityName}-${ref}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success("Downloaded", `Record exported as JSON.`);
  }

  async function shareRow(item: T) {
    const ref = (item as any).ref || (item as any).code || (item as any).id;
    const shareUrl = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(String(ref))}`;
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share({ title: `${entityName} ${ref}`, url: shareUrl });
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied", "Share link copied to clipboard.");
    } catch { /* cancelled */ }
  }

  return (
    <>
      <PageHeader
        title={title}
        description={description}
      actions={
        !hideAdd && (addHref ? (
          <Link
            to={addHref as any}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm shadow-primary/30 hover:bg-primary/90"
          >
            <Plus className="h-4 w-4" /> {addLabel ?? `Add ${title.replace(/s$/, "")}`}
          </Link>
        ) : (
          <button onClick={openAdd} className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm shadow-primary/30 hover:bg-primary/90">
            <Plus className="h-4 w-4" /> {addLabel ?? `Add ${title.replace(/s$/, "")}`}
          </button>
        ))
      }
      />

      {headerSlot}

      {kpis && kpis.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 mb-6 items-stretch">
          {kpis.map((k, i) => (
            <StatCard key={i} label={k.label} value={k.compute(items)} hint={k.hint} icon={k.icon} tone={k.tone} />
          ))}
        </div>
      )}

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="inline-flex items-center h-10 rounded-lg border border-border bg-card overflow-hidden">
          <span className="px-3 h-full inline-flex items-center text-xs font-bold uppercase tracking-wider text-muted-foreground border-r border-border bg-muted/30">Show</span>
          <SafeSelect
            value={String(perPage)}
            onChange={(v) => { setPerPage(Number(v)); setPage(1); }}
            options={[5, 10, 25, 50].map((n) => ({ value: String(n), label: String(n) }))}
            className="h-10 px-3 bg-card text-sm font-bold border-0"
          />
        </div>
        <div className={`relative transition-all duration-200 ${searchOpen ? "flex-1 max-w-md" : "w-10"}`}>
          {searchOpen ? (
            <>
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input
                ref={searchInputRef}
                value={search}
                autoFocus
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                onBlur={() => { if (!search) setSearchOpen(false); }}
                onKeyDown={(e) => { if (e.key === "Escape") { setSearch(""); setSearchOpen(false); } }}
                placeholder={`Search ${title.toLowerCase()}…`}
                className="w-full h-10 pl-9 pr-9 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {search && (
                <button
                  type="button"
                  onClick={() => { setSearch(""); searchInputRef.current?.focus(); }}
                  className="absolute right-2 top-1/2 -translate-y-1/2 h-6 w-6 grid place-items-center rounded text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search"
              aria-label="Search"
              className="h-10 w-10 inline-flex items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:text-primary hover:border-primary/40"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>
        {shareableLink && (
          <button
            type="button"
            onClick={async () => {
              const url = typeof window !== "undefined" ? window.location.href : "";
              try {
                await navigator.clipboard.writeText(url);
                toast.show({ title: "Link copied — current view URL is on your clipboard", tone: "success" });
              } catch {
                toast.show({ title: `Could not copy link: ${url}`, tone: "warning" });
              }
            }}
            title="Copy shareable link to this view"
            className="h-10 px-3 inline-flex items-center gap-1.5 rounded-lg border border-border bg-card text-sm font-bold text-foreground hover:border-primary/40 hover:text-primary"
          >
            <Link2 className="h-4 w-4" /> Copy link
          </button>
        )}
        {hasStatus && statusOptions.length > 0 && (
          <SafeSelect
            value={statusFilter}
            onChange={(v) => { setStatusFilter(v); setPage(1); }}
            options={[{ value: "all", label: "All status" }, ...statusOptions.map((s) => ({ value: s, label: s }))]}
            className="h-10 px-3 rounded-lg border border-border bg-card text-sm font-medium"
          />
        )}
        {(filters ?? []).map((f) => (
          <SafeSelect
            key={f.key}
            value={extraFilters[f.key] ?? "all"}
            onChange={(v) => { setExtraFilters((s) => ({ ...s, [f.key]: v })); setPage(1); }}
            options={[{ value: "all", label: `All ${f.label}` }, ...(filterOptions[f.key] ?? []).map((o) => ({ value: o, label: o }))]}
            className="h-10 px-3 rounded-lg border border-border bg-card text-sm font-medium"
          />
        ))}
        {toolbarEndSlot && <div className="ml-auto flex items-center gap-2">{toolbarEndSlot}</div>}
      </div>

      {(() => {
        const chips: { key: string; label: string; value: string; onClear: () => void }[] = [];
        if (hasStatus && statusFilter !== "all") {
          chips.push({ key: "status", label: "Status", value: statusFilter, onClear: () => { setStatusFilter("all"); setPage(1); } });
        }
        (filters ?? []).forEach((f) => {
          const v = extraFilters[f.key];
          if (v && v !== "all") {
            chips.push({ key: f.key, label: f.label, value: v, onClear: () => { setExtraFilters((s) => { const n = { ...s }; delete n[f.key]; return n; }); setPage(1); } });
          }
        });
        if (chips.length === 0) return null;
        return (
          <div className="flex flex-wrap items-center gap-2 mb-4">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active filters:</span>
            {chips.map((c) => (
              <button
                key={c.key}
                onClick={c.onClear}
                className="inline-flex items-center gap-1.5 h-7 pl-2.5 pr-2 rounded-full bg-primary/10 text-primary text-xs font-semibold hover:bg-primary/20 transition-colors group"
              >
                <span className="text-muted-foreground">{c.label}:</span>
                <span>{c.value}</span>
                <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
              </button>
            ))}
            <button
              onClick={() => { setStatusFilter("all"); setExtraFilters({}); setPage(1); }}
              className="text-xs font-semibold text-muted-foreground hover:text-foreground underline-offset-2 hover:underline ml-1"
            >
              Clear all
            </button>
          </div>
        );
      })()}

      <div className="rounded-xl bg-card overflow-hidden border border-border/60 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <EntityTableHead>
              {expandable && <Th width="2rem" />}
              <Th width="3rem" className="px-4">SR#</Th>
              {columns.map((c) => (
                <Th
                  key={c.key}
                  className={c.className ?? ""}
                  sortable
                  sortDirection={sort?.key === c.key ? sort.dir : null}
                  onSort={() => toggleSort(c.key)}
                >
                  {c.header}
                </Th>
              ))}
              <Th width="4rem">Actions</Th>
            </EntityTableHead>
            <tbody className="divide-y divide-border">
              {pageItems.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + 2} className="px-4 py-12 text-center text-muted-foreground font-medium">
                    No records found. Click <span className="text-primary font-semibold">{addLabel ?? "Add"}</span> to create one.
                  </td>
                </tr>
              ) : pageItems.map((item, idx) => {
                const canExp = !!(expandable && expandable.canExpand(item));
                const isOpen = expanded.has(item.id);
                return (
                <FragmentRow key={item.id}>
                <tr className="hover:bg-muted/30 transition-colors">
                  {expandable && (
                    <td className="px-1 py-4">
                      {canExp ? (
                        <button
                          onClick={() => setExpanded((s) => (s.has(item.id) ? new Set() : new Set([item.id])))}
                          className={`h-7 w-7 grid place-items-center rounded-full border transition-all ${isOpen ? "bg-primary text-primary-foreground border-primary shadow-sm rotate-45" : "bg-background text-primary border-primary/40 hover:bg-primary/10 hover:border-primary"}`}
                          aria-label="Toggle variants"
                          title={isOpen ? "Collapse" : "Expand variants"}
                        >
                          <Plus className="h-4 w-4 transition-transform duration-200" strokeWidth={3} />
                        </button>
                      ) : <span className="inline-block h-7 w-7" />}
                    </td>
                  )}
                  <td className="px-4 py-4 text-muted-foreground font-medium">{(safePage - 1) * perPage + idx + 1}</td>
                  {columns.map((c, ci) => {
                    const k = c.key.toLowerCase();
                    const isStrong = /price|amount|total|balance|qty|quantity|stock|code|sku|cnic|phone|number|^id$/.test(k);
                    const cellIcon = (ci === 0 && withAvatar) || c.render || c.key === "status" ? null : pickCellIcon(c.key);
                    const rendered = c.render ? c.render(item) : String(item[c.key] ?? "");
                    const isFirstClickable = ci === 0 && !!documentView && !withAvatar;
                    return (
                    <td key={c.key} className={`px-2 py-4 ${isStrong ? "font-bold text-foreground" : "font-medium text-foreground"} ${c.className ?? ""}`}>
                      {ci === 0 && withAvatar ? (
                        <div className="flex items-center gap-3">
                          <Avatar name={String(item[withAvatar.nameKey] ?? "")} color={["primary","warning","destructive","info"][idx % 4] as any} />
                          <div>
                            {documentView ? (
                              <button
                                type="button"
                                onClick={() => setViewing(item)}
                                title="View document"
                                className="font-semibold text-primary hover:underline underline-offset-2 cursor-pointer text-left"
                              >
                                {c.render ? c.render(item) : String(item[c.key] ?? "")}
                              </button>
                            ) : withAvatar.nameHref ? (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); router.navigate({ to: withAvatar.nameHref!(item) }); }}
                                className="font-semibold text-foreground hover:text-primary hover:underline underline-offset-2 text-left cursor-pointer"
                              >
                                {c.render ? c.render(item) : String(item[c.key] ?? "")}
                              </button>
                            ) : (
                              <div className="font-semibold text-foreground">{c.render ? c.render(item) : String(item[c.key] ?? "")}</div>
                            )}
                            {withAvatar.subKey && <div className="text-xs text-muted-foreground font-medium mt-0.5">{String(item[withAvatar.subKey] ?? "")}</div>}
                          </div>
                        </div>
                      ) : isFirstClickable ? (
                        <button
                          type="button"
                          onClick={() => setViewing(item)}
                          title="View document"
                          className="inline-flex items-center gap-1.5 text-primary font-semibold hover:underline underline-offset-2 cursor-pointer"
                        >
                          {cellIcon && <span className="text-primary/70 shrink-0">{cellIcon}</span>}
                          <span>{rendered}</span>
                        </button>
                      ) : cellIcon ? (
                        <span className="inline-flex items-center gap-1.5">
                          <span className="text-muted-foreground/70 shrink-0">{cellIcon}</span>
                          <span>{rendered}</span>
                        </span>
                      ) : rendered}
                    </td>
                    );
                  })}

                  <td className="px-2 py-4 relative">
                    <RowActionMenu>
                      {rowHref && (
                        <button
                          onClick={() => { router.navigate({ to: rowHref(item) }); setActionFor(null); }}
                          className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2"
                        >
                          <Eye className="h-3.5 w-3.5" /> View Profile
                        </button>
                      )}
                      {documentView && (
                        <button onClick={() => { setViewing(item); setActionFor(null); }} className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2">
                          <Eye className="h-3.5 w-3.5" /> View Document
                        </button>
                      )}
                      {editHref ? (
                        <button
                          onClick={() => { router.navigate({ to: editHref(item) }); setActionFor(null); }}
                          className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2"
                        >
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                      ) : (
                        <button onClick={() => { openEdit(item); setActionFor(null); }} className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2">
                          <Pencil className="h-3.5 w-3.5" /> Edit
                        </button>
                      )}
                      <button onClick={() => { downloadRow(item); setActionFor(null); }} className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2">
                        <Download className="h-3.5 w-3.5" /> Download
                      </button>
                      <button onClick={() => { shareRow(item); setActionFor(null); }} className="w-full text-left px-3 py-2 text-sm font-medium hover:bg-muted flex items-center gap-2">
                        <Share2 className="h-3.5 w-3.5" /> Share
                      </button>
                      {extraRowActions && extraRowActions(item, () => setActionFor(null))}
                      <button onClick={() => { askDelete(item); setActionFor(null); }} className="w-full text-left px-3 py-2 text-sm font-medium text-destructive hover:bg-destructive/10 flex items-center gap-2">
                        <Trash2 className="h-3.5 w-3.5" /> Delete
                      </button>
                    </RowActionMenu>
                  </td>
                </tr>
                {expandable && canExp && isOpen && (
                  <tr className="bg-muted/20">
                    <td colSpan={columns.length + (expandable ? 4 : 3)} className="px-6 py-4">
                      {expandable.render(item)}
                    </td>
                  </tr>
                )}
                </FragmentRow>
                );
              })}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3 text-sm">
          <div className="text-muted-foreground font-medium">
            {filtered.length} record{filtered.length === 1 ? "" : "s"} • showing {pageItems.length}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-muted-foreground mr-2 font-medium">Page {safePage} of {totalPages}</span>
            <button disabled={safePage === 1} onClick={() => setPage((p) => Math.max(1, p - 1))} className="h-9 px-3 inline-flex items-center gap-1 rounded-md border border-border bg-card font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
              <ChevronLeft className="h-4 w-4" /> Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).slice(0, 5).map((n) => (
              <button key={n} onClick={() => setPage(n)} className={`h-9 w-9 grid place-items-center rounded-md font-semibold ${
                n === safePage ? "bg-primary text-primary-foreground shadow-sm shadow-primary/30" : "border border-border bg-card hover:bg-muted"
              }`}>{n}</button>
            ))}
            <button disabled={safePage === totalPages} onClick={() => setPage((p) => Math.min(totalPages, p + 1))} className="h-9 px-3 inline-flex items-center gap-1 rounded-md border border-border bg-card font-medium hover:bg-muted disabled:opacity-50 disabled:cursor-not-allowed">
              Next <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {open && (customForm ? (
        customForm({
          initial: editing ?? undefined,
          onClose: () => setOpen(false),
          onSubmit,
          isEdit: !!editing,
        })
      ) : (
        <FormModal
          title={editing ? `Edit ${title.replace(/s$/, "")}` : `Add ${title.replace(/s$/, "")}`}
          fields={fields}
          initial={editing ?? undefined}
          onClose={() => setOpen(false)}
          onSubmit={onSubmit}
        />
      ))}

      {viewing && documentView && documentView(viewing, {
        close: () => setViewing(null),
        onEdit: () => {
          const item = viewing;
          setViewing(null);
          if (editHref) router.navigate({ to: editHref(item) });
          else openEdit(item);
        },
        onDelete: () => {
          const item = viewing;
          setViewing(null);
          askDelete(item);
        },
      })}


      <ConfirmDialog
        open={!!confirmDel}
        title={`Delete this ${entityName.toLowerCase()}?`}
        description={
          <>
            You're about to permanently delete{" "}
            <span className="font-semibold text-foreground">
              {confirmDel ? String((confirmDel as any).name ?? (confirmDel as any).title ?? (confirmDel as any).event ?? confirmDel.id) : ""}
            </span>
            . This action cannot be undone.
          </>
        }
        confirmLabel={`Yes, delete ${entityName.toLowerCase()}`}
        onConfirm={doDelete}
        onCancel={() => setConfirmDel(null)}
      />

      {notifyOnSave && notifyFor && (
        <NotifyDialog
          open
          onClose={() => setNotifyFor(null)}
          title={`Notify about this ${entityName.toLowerCase()} change`}
          eventLabel={notifyOnSave.eventLabel}
          audiences={notifyOnSave.audiences}
          defaultMessage={notifyOnSave.buildMessage(notifyFor.item, notifyFor.isEdit)}
          onSend={({ channels, audience }: { channels: string[]; audience: string; message: string }) => {
            toast.success("Notification sent", `Sent to ${audience} via ${channels.join(", ")}.`);
          }}
        />
      )}
    </>
  );
}

function pickCellIcon(key: string) {
  const n = key.toLowerCase();
  const cls = "h-3.5 w-3.5";
  if (/phone|mobile|tel|contact/.test(n)) return <Phone className={cls} />;
  if (/email|mail/.test(n)) return <Mail className={cls} />;
  if (/web|url|site|link/.test(n)) return <Globe className={cls} />;
  if (/(address|location|city|area|country|origin)/.test(n)) return <MapPin className={cls} />;
  if (/date|day|month|year|expiry|due/.test(n)) return <Calendar className={cls} />;
  if (/(price|amount|balance|cost|salary|payable|receivable|total|value)/.test(n)) return <CircleDollarSign className={cls} />;
  if (/qty|quantity|stock|units/.test(n)) return <Box className={cls} />;
  if (/(code|sku|ref|^no$|^id$|cnic|ntn|strn|barcode)/.test(n)) return <Hash className={cls} />;
  if (/branch|warehouse|store|outlet/.test(n)) return <Building2 className={cls} />;
  if (/owner|user|head|manager|guarantor|employee|agent/.test(n)) return <User className={cls} />;
  if (/discount|percent|rate|tax/.test(n)) return <Percent className={cls} />;
  return null;
}

function pickFieldIcon(name: string, type: FieldType) {
  const n = name.toLowerCase();
  const cls = "h-3.5 w-3.5";
  if (/(^name$|title|brand|product|supplier|customer|company)/.test(n)) return <Tag className={cls} />;
  if (/(code|sku|ref|number|^no$|cnic|ntn|strn)/.test(n)) return <Hash className={cls} />;
  if (/(country|address|location|city|area|origin)/.test(n)) return <MapPin className={cls} />;
  if (/phone|mobile|tel|contact/.test(n)) return <Phone className={cls} />;
  if (/email|mail/.test(n)) return <Mail className={cls} />;
  if (/web|url|site|link/.test(n)) return <Globe className={cls} />;
  if (/warranty|guarantee|policy/.test(n)) return <Shield className={cls} />;
  if (/branch|warehouse|store|outlet/.test(n)) return <Building2 className={cls} />;
  if (/status|active|enable/.test(n)) return <ToggleLeft className={cls} />;
  if (/date|day|month|year/.test(n)) return <Calendar className={cls} />;
  if (/(price|amount|balance|cost|salary|fee)/.test(n)) return <CircleDollarSign className={cls} />;
  if (/qty|quantity|stock|units/.test(n)) return <Box className={cls} />;
  if (/discount|percent|rate|tax/.test(n)) return <Percent className={cls} />;
  if (/note|description|remark|detail/.test(n)) return <AlignLeft className={cls} />;
  if (/owner|user|person|head|manager|guarantor/.test(n)) return <User className={cls} />;
  if (type === "checkbox") return <CheckSquare className={cls} />;
  if (type === "select") return <Layers className={cls} />;
  if (type === "textarea") return <AlignLeft className={cls} />;
  if (type === "number") return <Hash className={cls} />;
  return <Type className={cls} />;
}

function FormModal({
  title, fields, initial, onClose, onSubmit,
}: {
  title: string;
  fields: Field[];
  initial?: Record<string, any>;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const v: Record<string, any> = {};
    fields.forEach((f) => {
      if (f.type === "checkbox") v[f.name] = initial?.[f.name] ?? f.defaultValue ?? false;
      else if (f.type === "variants") v[f.name] = initial?.[f.name] ?? [];
      else v[f.name] = initial?.[f.name] ?? f.defaultValue ?? (f.type === "number" ? 0 : "");
    });
    return v;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): Record<string, string> {
    const errs: Record<string, string> = {};
    fields.forEach((f) => {
      if (f.showWhen && values[f.showWhen.field] !== f.showWhen.equals) return;
      const val = values[f.name];
      if (f.required) {
        if (f.type === "number") {
          const n = Number(val);
          if (!Number.isFinite(n) || n <= 0) errs[f.name] = `${f.label} must be greater than 0`;
        } else if (f.type === "variants") {
          if (!Array.isArray(val) || val.length === 0) errs[f.name] = `Add at least one ${f.label.toLowerCase()}`;
        } else if (val == null || String(val).trim() === "") {
          errs[f.name] = `${f.label} is required`;
        }
      } else if (f.type === "number" && val !== "" && val != null) {
        const n = Number(val);
        if (!Number.isFinite(n) || n < 0) errs[f.name] = `${f.label} cannot be negative`;
      }
      if (f.type === "text" && typeof val === "string" && val.length > 200) {
        errs[f.name] = `${f.label} must be 200 characters or less`;
      }
    });
    return errs;
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const errs = validate();
    setErrors(errs);
    if (Object.keys(errs).length > 0) {
      const firstKey = Object.keys(errs)[0];
      const el = document.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null;
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }
    onSubmit(values);
  }

  const inputCls = "w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition";

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in" style={{ fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif" }} onClick={onClose}>
      <form
        onSubmit={handleSubmit}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 animate-scale-in"
        style={{ fontFamily: "inherit" }}
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-4 px-6 py-5 bg-gradient-to-r from-primary to-primary text-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur grid place-items-center ring-1 ring-white/25">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-tight">{title}</h2>
              <p className="text-[12px] text-white/80 mt-0.5">Fill in the details below</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg bg-white/15 hover:bg-white/25 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {fields.map((f) => {
              if (f.showWhen && values[f.showWhen.field] !== f.showWhen.equals) return null;
              const isFull = f.fullWidth || f.type === "textarea" || f.type === "variants" || f.type === "checkbox";
              const icon = pickFieldIcon(f.name, f.type);
              const err = errors[f.name];
              const errCls = err ? "border-rose-400 focus:ring-rose-200 focus:border-rose-400" : "";
              return (
              <div key={f.name} className={isFull ? "sm:col-span-2" : ""} data-field={f.name}>
                {f.type !== "checkbox" && f.type !== "variants" && (
                  <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-1.5">
                    <span className="text-slate-500">{icon}</span>
                    {f.label}
                    {f.required && <span className="text-rose-500">*</span>}
                  </label>
                )}
                {f.type === "checkbox" ? (
                  <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                    <input
                      type="checkbox"
                      checked={!!values[f.name]}
                      onChange={(e) => setValues((v) => ({ ...v, [f.name]: e.target.checked }))}
                      className="h-4 w-4 accent-primary"
                    />
                    <span className="text-slate-500">{icon}</span>
                    <span className="text-sm font-medium text-slate-700">{f.label}</span>
                  </label>
                ) : f.type === "variants" ? (
                  <VariantsEditor
                    schema={f.variantSchema ?? [
                      { name: "name", label: "Variant", type: "text", placeholder: "e.g. Red / 1.5 Ton" },
                      { name: "sku", label: "SKU", type: "text" },
                      { name: "price", label: "Price (Rs.)", type: "number" },
                      { name: "stock", label: "Stock", type: "number" },
                    ]}
                    value={Array.isArray(values[f.name]) ? values[f.name] : []}
                    onChange={(rows) => setValues((v) => ({ ...v, [f.name]: rows }))}
                  />
                ) : f.type === "select" ? (
                  <div className="relative">
                    <select
                      value={values[f.name] ?? ""}
                      onChange={(e) => { setValues((v) => ({ ...v, [f.name]: e.target.value })); if (err) setErrors((es) => { const n = { ...es }; delete n[f.name]; return n; }); }}
                      className={`${inputCls} ${errCls} appearance-none pr-9 cursor-pointer`}
                    >
                      <option value="">Select…</option>
                      {f.options?.map((o) => <option key={o} value={o}>{o}</option>)}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                  </div>
                ) : f.type === "textarea" ? (
                  <textarea
                    value={values[f.name] ?? ""}
                    onChange={(e) => { setValues((v) => ({ ...v, [f.name]: e.target.value })); if (err) setErrors((es) => { const n = { ...es }; delete n[f.name]; return n; }); }}
                    placeholder={f.placeholder}
                    rows={3}
                    className={`w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition ${errCls}`}
                  />
                ) : (
                  <input
                    type={f.type}
                    value={values[f.name] ?? ""}
                    onChange={(e) => { setValues((v) => ({ ...v, [f.name]: f.type === "number" ? Number(e.target.value) : e.target.value })); if (err) setErrors((es) => { const n = { ...es }; delete n[f.name]; return n; }); }}
                    placeholder={f.placeholder}
                    className={`${inputCls} ${errCls}`}
                  />
                )}
                {err && (
                  <p className="mt-1 text-xs font-medium text-rose-600 flex items-center gap-1">
                    <AlertTriangle className="h-3 w-3" /> {err}
                  </p>
                )}
              </div>
              );
            })}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-xs text-slate-500"><span className="text-rose-500">*</span> Required fields</span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-10 px-5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30">
              <Plus className="h-4 w-4" /> {initial ? "Save Changes" : `Create ${title.replace(/^(Add|Edit) /, "")}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

// Re-export for convenience
export { Badge };

function VariantsEditor({
  schema, value, onChange,
}: {
  schema: VariantSchema[];
  value: Array<Record<string, any>>;
  onChange: (rows: Array<Record<string, any>>) => void;
}) {
  const [openIdx, setOpenIdx] = useState<number | null>(value.length ? 0 : null);

  function add() {
    const blank: Record<string, any> = {};
    schema.forEach((s) => (blank[s.name] = s.type === "number" ? 0 : ""));
    onChange([...value, blank]);
    setOpenIdx(value.length);
  }
  function update(i: number, key: string, v: any) {
    const next = value.slice();
    next[i] = { ...next[i], [key]: v };
    onChange(next);
  }
  function remove(i: number) {
    const next = value.slice();
    next.splice(i, 1);
    onChange(next);
    setOpenIdx(null);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Variants ({value.length})</div>
        <button type="button" onClick={add} className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> Add Variant
        </button>
      </div>
      {value.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">No variants yet. Click "Add Variant" to create one.</div>
      ) : (
        <div className="space-y-2">
          {value.map((row, i) => {
            const open = openIdx === i;
            return (
              <div key={i} className="rounded-md border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIdx(open ? null : i)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">
                    {row[schema[0].name] || `Variant #${i + 1}`}
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-1">
                      {schema.slice(1, 3).map((s) => row[s.name]).filter(Boolean).join(" • ")}
                    </span>
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>
                {open && (
                  <div className="p-3 border-t border-border grid grid-cols-2 gap-3">
                    {schema.map((s) => (
                      <div key={s.name}>
                        <label className="block text-xs font-medium mb-1">{s.label}</label>
                        <input
                          type={s.type}
                          value={row[s.name] ?? ""}
                          onChange={(e) => update(i, s.name, s.type === "number" ? Number(e.target.value) : e.target.value)}
                          placeholder={s.placeholder}
                          className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                        />
                      </div>
                    ))}
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => remove(i)} className="h-8 px-3 inline-flex items-center gap-1 rounded-md border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function SafeSelect({
  value, onChange, options, className = "",
}: {
  value: string;
  onChange: (v: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((o) => o.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={`inline-flex items-center justify-between gap-2 cursor-pointer focus:outline-none ${className}`}
      >
        <span>{current}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className="absolute left-0 top-[calc(100%+4px)] z-[100] min-w-full rounded-lg border border-border bg-popover shadow-lg overflow-hidden p-1">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => { onChange(o.value); setOpen(false); }}
              className={`w-full text-left px-3 py-1.5 rounded-md text-sm font-medium hover:bg-muted whitespace-nowrap ${o.value === value ? "bg-primary/10 text-primary" : "text-foreground"}`}
            >
              {o.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function RowActionMenu({ children }: { children: ReactNode }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0 });
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: MouseEvent) => {
      const t = e.target as Node;
      if (buttonRef.current?.contains(t) || menuRef.current?.contains(t)) return;
      setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") setOpen(false); };
    document.addEventListener("pointerdown", onDoc, true);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const toggle = () => {
    const r = buttonRef.current?.getBoundingClientRect();
    if (r) setPos({ top: r.bottom + 6, left: Math.max(8, r.right - 192) });
    setOpen((v) => !v);
  };

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        onPointerDown={(e) => { e.preventDefault(); e.stopPropagation(); toggle(); }}
        className="h-8 w-8 grid place-items-center rounded-md border border-border bg-card hover:bg-muted"
      >
        <MoreVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && typeof document !== "undefined" && createPortal(
        <div
          ref={menuRef}
          style={{ top: pos.top, left: pos.left }}
          className="fixed z-[1000] w-48 rounded-lg border border-border bg-popover text-popover-foreground shadow-lg overflow-hidden"
          onClick={() => setOpen(false)}
        >
          {children}
        </div>,
        document.body,
      )}
    </>
  );
}
