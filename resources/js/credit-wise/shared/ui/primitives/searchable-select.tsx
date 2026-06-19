"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Check, ChevronDown, Search } from "lucide-react";

import { cn } from "@/lib/helpers/utils";
import { getFieldStateClass } from "@/shared/lib/form-validation";
import {
  dropdownMenuItemActiveClass,
  dropdownMenuItemClass,
  dropdownMenuItemIdleClass,
  dropdownMenuSearchShellClass,
  dropdownMenuSurfaceClass,
} from "@/shared/ui/primitives/dropdown-theme";

export type SearchableSelectOption = {
  value: string;
  label: string;
  secondaryLabel?: string;
  keywords?: string[];
};

type SearchableSelectProps = {
  value: string;
  onChange: (value: string) => void;
  options: SearchableSelectOption[];
  showSelectedSecondaryLabel?: boolean;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyMessage?: string;
  disabled?: boolean;
  className?: string;
  invalid?: boolean;
  onBlur?: () => void;
};

export function SearchableSelect({
  value,
  onChange,
  options,
  showSelectedSecondaryLabel = true,
  placeholder = "Select...",
  searchPlaceholder = "Search...",
  emptyMessage = "No matches found.",
  disabled,
  className,
  invalid,
  onBlur,
}: SearchableSelectProps) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const rootRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const blurNotifiedRef = useRef(false);

  const selected = options.find((option) => option.value === value);
  const normalizedQuery = query.trim().toLowerCase();

  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((option) => {
      const haystack = [
        option.label,
        option.value,
        ...(option.keywords ?? []),
      ]
        .join(" ")
        .toLowerCase();

      return haystack.includes(normalizedQuery);
    });
  }, [normalizedQuery, options]);

  useEffect(() => {
    if (!open) return;
    blurNotifiedRef.current = false;

    const handlePointerDown = (event: MouseEvent) => {
      if (rootRef.current && !rootRef.current.contains(event.target as Node)) {
        setOpen(false);
        if (!blurNotifiedRef.current) {
          blurNotifiedRef.current = true;
          onBlur?.();
        }
      }
    };

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
        if (!blurNotifiedRef.current) {
          blurNotifiedRef.current = true;
          onBlur?.();
        }
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onBlur]);

  useEffect(() => {
    if (!open) {
      setQuery("");
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      searchRef.current?.focus();
      searchRef.current?.select();
    });

    return () => window.cancelAnimationFrame(frame);
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative w-full", className)}>
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        aria-invalid={invalid || undefined}
        className={cn(
          "flex min-h-9 w-full items-center justify-between rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-[13px] transition",
          "focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50",
          "disabled:cursor-not-allowed disabled:opacity-60",
          getFieldStateClass(invalid),
          open && "border-primary/50 ring-2 ring-primary/30",
        )}
      >
        <span className="min-w-0 flex-1">
          {selected ? (
            <span className="block min-w-0">
              <span className="block truncate text-[13px] font-normal text-slate-900">{selected.label}</span>
              {showSelectedSecondaryLabel && selected.secondaryLabel ? (
                <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
                  {selected.secondaryLabel}
                </span>
              ) : null}
            </span>
          ) : (
            <span className="block truncate text-[13px] font-normal text-slate-400">{placeholder}</span>
          )}
        </span>
        <ChevronDown className={cn("ml-3 h-4 w-4 shrink-0 text-slate-500 transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className={cn("absolute left-0 right-0 top-[calc(100%+6px)] z-[110]", dropdownMenuSurfaceClass)}>
          <div className="border-b border-border/70 px-1.5 pb-1.5">
            <div className={dropdownMenuSearchShellClass}>
              <Search className="h-3.5 w-3.5 text-muted-foreground/70" />
              <input
                ref={searchRef}
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder={searchPlaceholder}
                className="h-full w-full border-0 bg-transparent p-0 text-[13px] font-normal text-foreground placeholder:text-[13px] placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-0"
              />
            </div>
          </div>

          <div className="max-h-64 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
                if (!blurNotifiedRef.current) {
                  blurNotifiedRef.current = true;
                  onBlur?.();
                }
              }}
              className={cn(
                dropdownMenuItemClass,
                !value ? dropdownMenuItemActiveClass : "text-muted-foreground hover:bg-muted/60",
              )}
            >
              <span className="flex-1 truncate">{placeholder}</span>
              {!value && <Check className="h-3.5 w-3.5" />}
            </button>

            {filteredOptions.length ? (
              filteredOptions.map((option) => {
                const active = option.value === value;

                return (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      onChange(option.value);
                      setOpen(false);
                      if (!blurNotifiedRef.current) {
                        blurNotifiedRef.current = true;
                        onBlur?.();
                      }
                    }}
                    className={cn(
                      dropdownMenuItemClass,
                      active ? dropdownMenuItemActiveClass : dropdownMenuItemIdleClass,
                    )}
                  >
                    <span className="flex-1 min-w-0">
                      <span className="block truncate">{option.label}</span>
                      {option.secondaryLabel ? (
                        <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
                          {option.secondaryLabel}
                        </span>
                      ) : null}
                    </span>
                    {active && <Check className="h-3.5 w-3.5" />}
                  </button>
                );
              })
            ) : (
              <div className="px-3 py-3 text-[13px] font-normal text-muted-foreground">{emptyMessage}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
