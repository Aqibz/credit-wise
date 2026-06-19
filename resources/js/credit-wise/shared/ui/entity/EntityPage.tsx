import { ReactNode, useMemo, useState, useEffect, useRef, Fragment } from "react";
const FragmentRow = Fragment;
import { Plus, Pencil, Trash2, Eye, Download, Share2 } from "lucide-react";
import { Link, useRouter } from "@/shared/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge, Avatar, EntityTableHead, Th, tableCellText } from "@/components/ui-kit";
import { useEntityStore, Entity } from "@/lib/state/useEntityStore";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { NotifyDialog } from "@/components/NotifyDialog";
import { useToast } from "@/components/Toaster";
import type { Column, EntityPageProps, Field, FieldType, Kpi, VariantSchema } from "./types";
import { RowActionMenu } from "./controls";
import { FormModal } from "./FormModal";
import { pickCellIcon } from "./icons";
import { EntityPagination } from "./EntityPagination";
import { EntityToolbar } from "./EntityToolbar";

function nowTime() {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", hour12: true });
}
export type { Column, EntityPageProps, Field, FieldType, Kpi, VariantSchema } from "./types";

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
  initialSearch, onSearchChange, initialStatusFilter, onStatusChange, shareableLink, transformOnSave, hideAdd,
}: EntityPageProps<T>) {
  const { items, create, update, remove } = useEntityStore<T>(storageKey, seed);
  const router = useRouter();
  const toast = useToast();
  // Normalize URL `q` (treat undefined / "" / whitespace as no filter).
  const normalizedInitial = (initialSearch ?? "").trim();
  const normalizedInitialStatus = (initialStatusFilter ?? "all").trim() || "all";
  const [search, setSearch] = useState(normalizedInitial);
  // Sync with URL-driven initialSearch. When `q` is empty/undefined (deep link
  // back, manual URL edit, or "Reset"), clear the box AND collapse it AND reset
  // the page so stale results never linger.
  useEffect(() => {
    setSearch(normalizedInitial);
    setPage(1);
    if (!normalizedInitial) setSearchOpen(false);
  }, [normalizedInitial]);
  useEffect(() => {
    setStatusFilter(normalizedInitialStatus);
    setPage(1);
  }, [normalizedInitialStatus]);
  // Debounced URL sync so every keystroke isn't a navigation. Always pushes
  // the trimmed value - empty string tells the parent route to strip `q`.
  useEffect(() => {
    if (!onSearchChange) return;
    const next = search.trim();
    if (normalizedInitial === next) return;
    const id = setTimeout(() => onSearchChange(next), 250);
    return () => clearTimeout(id);
  }, [search, onSearchChange, normalizedInitial]);
  const [page, setPage] = useState(1);
  const [perPage, setPerPage] = useState(25);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<T | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>(normalizedInitialStatus);
  const [extraFilters, setExtraFilters] = useState<Record<string, string>>({});
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [searchOpen, setSearchOpen] = useState<boolean>(!!(initialSearch && initialSearch.length));
  useEffect(() => { if (initialSearch) setSearchOpen(true); }, [initialSearch]);
  useEffect(() => {
    if (!onStatusChange) return;
    if (normalizedInitialStatus === statusFilter) return;
    onStatusChange(statusFilter);
  }, [statusFilter, onStatusChange, normalizedInitialStatus]);
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
  const menuItemClassName = "flex w-full items-center gap-2 rounded-lg px-3 py-2 text-left text-[13px] font-medium text-foreground transition-colors hover:bg-muted";
  const menuSectionLabelClassName = "px-3 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground";

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
  function openEdit(item: T) { setEditing(item); setOpen(true); }
  function askDelete(item: T) { setConfirmDel(item); }
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

      <EntityToolbar
        title={title}
        perPage={perPage}
        setPerPage={(value) => { setPerPage(value); setPage(1); }}
        search={search}
        setSearch={(value) => { setSearch(value); setPage(1); }}
        searchOpen={searchOpen}
        setSearchOpen={setSearchOpen}
        searchInputRef={searchInputRef}
        shareableLink={shareableLink}
        onCopyLink={async () => {
          const url = typeof window !== "undefined" ? window.location.href : "";
          try {
            await navigator.clipboard.writeText(url);
            toast.show({ title: "Link copied - current view URL is on your clipboard", tone: "success" });
          } catch {
            toast.show({ title: `Could not copy link: ${url}`, tone: "warning" });
          }
        }}
        hasStatus={!!hasStatus}
        status={statusFilter}
        statusOptions={statusOptions}
        setStatus={(value) => { setStatusFilter(value); setPage(1); }}
        filters={filters ?? []}
        filterOptions={filterOptions}
        extraFilters={extraFilters}
        setExtraFilter={(key, value) => { setExtraFilters((current) => ({ ...current, [key]: value })); setPage(1); }}
        clearExtraFilter={(key) => {
          setExtraFilters((current) => {
            const next = { ...current };
            delete next[key];
            return next;
          });
          setPage(1);
        }}
        clearAllFilters={() => { setStatusFilter("all"); setExtraFilters({}); setPage(1); }}
        toolbarEndSlot={toolbarEndSlot}
      />

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
                  <td className="px-4 py-4 text-[13px] font-medium text-muted-foreground">{(safePage - 1) * perPage + idx + 1}</td>
                  {columns.map((c, ci) => {
                    const k = c.key.toLowerCase();
                    const isStrong = /price|amount|total|balance|qty|quantity|stock|code|sku|cnic|phone|number|^id$/.test(k);
                    const cellIcon = (ci === 0 && withAvatar) || c.render || c.key === "status" ? null : pickCellIcon(c.key);
                    const rendered = c.render ? c.render(item) : String(item[c.key] ?? "");
                    const isFirstClickable = ci === 0 && !!documentView && !withAvatar;
                    return (
                    <td key={c.key} className={`px-2 py-4 text-[13px] leading-tight ${isStrong ? "font-semibold text-foreground" : "font-medium text-foreground"} ${c.className ?? ""}`}>
                      {ci === 0 && withAvatar ? (
                        <div className="flex items-center gap-3">
                          <Avatar name={String(item[withAvatar.nameKey] ?? "")} color={["primary","warning","destructive","info"][idx % 4] as any} />
                          <div className="min-w-0">
                            {documentView ? (
                              <button
                                type="button"
                                onClick={() => setViewing(item)}
                                title="View document"
                                className={`${tableCellText.primary} text-primary hover:underline underline-offset-2 cursor-pointer text-left`}
                              >
                                {c.render ? c.render(item) : String(item[c.key] ?? "")}
                              </button>
                            ) : withAvatar.nameHref ? (
                              <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); router.navigate({ to: withAvatar.nameHref!(item) }); }}
                                className={`${tableCellText.primary} hover:text-primary hover:underline underline-offset-2 text-left cursor-pointer`}
                              >
                                {c.render ? c.render(item) : String(item[c.key] ?? "")}
                              </button>
                            ) : (
                              <div className={tableCellText.primary}>{c.render ? c.render(item) : String(item[c.key] ?? "")}</div>
                            )}
                            {withAvatar.subKey && <div className={`${tableCellText.secondary} truncate mt-0.5`}>{String(item[withAvatar.subKey] ?? "")}</div>}
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
                      {({ close }) => (
                        <>
                          {rowHref && (
                            <button
                              onClick={() => { close(); router.navigate({ to: rowHref(item) }); }}
                              className={menuItemClassName}
                            >
                              <Eye className="h-3.5 w-3.5" /> View Profile
                            </button>
                          )}
                          {documentView && (
                            <button
                              onClick={() => { close(); setViewing(item); }}
                              className={menuItemClassName}
                            >
                              <Eye className="h-3.5 w-3.5" /> View Document
                            </button>
                          )}
                          {editHref ? (
                            <button
                              onClick={() => { close(); router.navigate({ to: editHref(item) }); }}
                              className={menuItemClassName}
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                          ) : (
                            <button
                              onClick={() => { close(); openEdit(item); }}
                              className={menuItemClassName}
                            >
                              <Pencil className="h-3.5 w-3.5" /> Edit
                            </button>
                          )}
                          <button
                            onClick={() => { close(); downloadRow(item); }}
                            className={menuItemClassName}
                          >
                            <Download className="h-3.5 w-3.5" /> Download
                          </button>
                          <button
                            onClick={() => { close(); shareRow(item); }}
                            className={menuItemClassName}
                          >
                            <Share2 className="h-3.5 w-3.5" /> Share
                          </button>
                          {extraRowActions ? (
                            <>
                              <div className="mx-1 my-1 h-px bg-border/70" />
                              <div className={menuSectionLabelClassName}>Quick Actions</div>
                              {extraRowActions(item, close, {
                                update: (patch) => {
                                  update(item.id, patch);
                                  toast.success(`${entityName} updated`, "The row action has been applied.");
                                },
                                entityName,
                              })}
                            </>
                          ) : null}
                          <div className="mx-1 mt-1 border-t border-border/70 pt-1.5">
                            <button
                              onClick={() => { close(); askDelete(item); }}
                              className="flex w-full items-center gap-2 rounded-lg border border-destructive/15 bg-destructive/5 px-3 py-2 text-left text-[13px] font-medium text-destructive transition-colors hover:bg-destructive/10"
                            >
                              <Trash2 className="h-3.5 w-3.5" /> Delete
                            </button>
                          </div>
                        </>
                      )}
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

        <EntityPagination
          filteredCount={filtered.length}
          visibleCount={pageItems.length}
          page={safePage}
          totalPages={totalPages}
          setPage={setPage}
        />
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



// Re-export for convenience
export { Badge };
