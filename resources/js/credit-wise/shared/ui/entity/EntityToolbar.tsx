import type { ReactNode, RefObject } from "react";
import { Link2, Search, X } from "lucide-react";
import { SafeSelect } from "./controls";

type Filter = {
  key: string;
  label: string;
  options?: string[];
};

type ActiveFilter = {
  key: string;
  label: string;
  value: string;
  onClear: () => void;
};

export function EntityToolbar({
  title,
  perPage,
  setPerPage,
  search,
  setSearch,
  searchOpen,
  setSearchOpen,
  searchInputRef,
  shareableLink,
  onCopyLink,
  hasStatus,
  status,
  statusOptions,
  setStatus,
  filters,
  filterOptions,
  extraFilters,
  setExtraFilter,
  clearExtraFilter,
  clearAllFilters,
  toolbarEndSlot,
}: {
  title: string;
  perPage: number;
  setPerPage: (value: number) => void;
  search: string;
  setSearch: (value: string) => void;
  searchOpen: boolean;
  setSearchOpen: (value: boolean) => void;
  searchInputRef: RefObject<HTMLInputElement | null>;
  shareableLink?: boolean;
  onCopyLink: () => void;
  hasStatus: boolean;
  status: string;
  statusOptions: string[];
  setStatus: (value: string) => void;
  filters: Filter[];
  filterOptions: Record<string, string[]>;
  extraFilters: Record<string, string>;
  setExtraFilter: (key: string, value: string) => void;
  clearExtraFilter: (key: string) => void;
  clearAllFilters: () => void;
  toolbarEndSlot?: ReactNode;
}) {
  const activeFilters: ActiveFilter[] = [];

  if (hasStatus && status !== "all") {
    activeFilters.push({ key: "status", label: "Status", value: status, onClear: () => setStatus("all") });
  }

  filters.forEach((filter) => {
    const value = extraFilters[filter.key];
    if (value && value !== "all") {
      activeFilters.push({
        key: filter.key,
        label: filter.label,
        value,
        onClear: () => clearExtraFilter(filter.key),
      });
    }
  });

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div className="inline-flex h-10 items-center overflow-hidden rounded-lg border border-border bg-card">
          <span className="inline-flex h-full items-center border-r border-border bg-muted/30 px-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Show
          </span>
          <SafeSelect
            value={String(perPage)}
            onChange={(value) => setPerPage(Number(value))}
            options={[5, 10, 25, 50].map((value) => ({ value: String(value), label: String(value) }))}
            className="h-10 border-0 bg-card px-3 text-sm font-bold"
          />
        </div>

        <div className={`relative transition-all duration-200 ${searchOpen ? "max-w-md flex-1" : "w-10"}`}>
          {searchOpen ? (
            <>
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <input
                ref={searchInputRef}
                value={search}
                autoFocus
                onChange={(event) => setSearch(event.target.value)}
                onBlur={() => {
                  if (!search) setSearchOpen(false);
                }}
                onKeyDown={(event) => {
                  if (event.key === "Escape") {
                    setSearch("");
                    setSearchOpen(false);
                  }
                }}
                placeholder={`Search ${title.toLowerCase()}...`}
                className="h-10 w-full rounded-lg border border-border bg-card pl-9 pr-9 text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
              />
              {search ? (
                <button
                  type="button"
                  onClick={() => {
                    setSearch("");
                    searchInputRef.current?.focus();
                  }}
                  className="absolute right-2 top-1/2 grid h-6 w-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted/60 hover:text-foreground"
                  aria-label="Clear search"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              ) : null}
            </>
          ) : (
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              title="Search"
              aria-label="Search"
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-primary"
            >
              <Search className="h-4 w-4" />
            </button>
          )}
        </div>

        {shareableLink ? (
          <button
            type="button"
            onClick={onCopyLink}
            title="Copy shareable link to this view"
            className="inline-flex h-10 items-center gap-1.5 rounded-lg border border-border bg-card px-3 text-sm font-bold text-foreground hover:border-primary/40 hover:text-primary"
          >
            <Link2 className="h-4 w-4" /> Copy link
          </button>
        ) : null}

        {hasStatus && statusOptions.length > 0 ? (
          <SafeSelect
            value={status}
            onChange={setStatus}
            options={[{ value: "all", label: "All status" }, ...statusOptions.map((value) => ({ value, label: value }))]}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium"
          />
        ) : null}

        {filters.map((filter) => (
          <SafeSelect
            key={filter.key}
            value={extraFilters[filter.key] ?? "all"}
            onChange={(value) => setExtraFilter(filter.key, value)}
            options={[
              { value: "all", label: `All ${filter.label}` },
              ...(filterOptions[filter.key] ?? []).map((value) => ({ value, label: value })),
            ]}
            className="h-10 rounded-lg border border-border bg-card px-3 text-sm font-medium"
          />
        ))}

        {toolbarEndSlot ? <div className="ml-auto flex items-center gap-2">{toolbarEndSlot}</div> : null}
      </div>

      {activeFilters.length > 0 ? (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Active filters:</span>
          {activeFilters.map((filter) => (
            <button
              key={filter.key}
              onClick={filter.onClear}
              className="group inline-flex h-7 items-center gap-1.5 rounded-full bg-primary/10 pl-2.5 pr-2 text-xs font-semibold text-primary transition-colors hover:bg-primary/20"
            >
              <span className="text-muted-foreground">{filter.label}:</span>
              <span>{filter.value}</span>
              <X className="h-3 w-3 opacity-60 group-hover:opacity-100" />
            </button>
          ))}
          <button
            onClick={clearAllFilters}
            className="ml-1 text-xs font-semibold text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          >
            Clear all
          </button>
        </div>
      ) : null}
    </>
  );
}
