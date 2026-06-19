import type { ReactNode } from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, MoreVertical } from "lucide-react";
import {
  dropdownMenuItemActiveClass,
  dropdownMenuItemClass,
  dropdownMenuItemIdleClass,
  dropdownMenuSurfaceClass,
} from "@/shared/ui/primitives/dropdown-theme";

export function SafeSelect({
  value,
  onChange,
  options,
  className = "",
}: {
  value: string;
  onChange: (value: string) => void;
  options: { value: string; label: string }[];
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = options.find((option) => option.value === value)?.label ?? value;

  useEffect(() => {
    if (!open) return;

    const onDoc = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

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
        onClick={() => setOpen((valueState) => !valueState)}
        className={`inline-flex items-center justify-between gap-2 cursor-pointer focus:outline-none ${className}`}
      >
        <span>{current}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground" />
      </button>
      {open && (
        <div className={`absolute left-0 top-[calc(100%+6px)] z-[100] min-w-full ${dropdownMenuSurfaceClass}`}>
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`${dropdownMenuItemClass} whitespace-nowrap ${
                option.value === value ? dropdownMenuItemActiveClass : dropdownMenuItemIdleClass
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function RowActionMenu({
  children,
}: {
  children: ReactNode | ((ctx: { close: () => void }) => ReactNode);
}) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return;

    const onDoc = (event: MouseEvent) => {
      const target = event.target as Node;
      if (rootRef.current?.contains(target)) {
        return;
      }
      setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", onDoc, true);
    document.addEventListener("keydown", onKey);

    return () => {
      document.removeEventListener("pointerdown", onDoc, true);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className="relative inline-flex">
      <button
        type="button"
        onClick={(event) => {
          event.preventDefault();
          event.stopPropagation();
          setOpen((value) => !value);
        }}
        className="h-8 w-8 grid place-items-center rounded-md border border-border bg-card hover:bg-muted"
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <MoreVertical className="h-4 w-4 text-muted-foreground" />
      </button>
      {open ? (
        <div
          className={`absolute right-0 top-full z-50 mt-1 w-56 ${dropdownMenuSurfaceClass}`}
        >
          {typeof children === "function" ? children({ close }) : children}
        </div>
      ) : null}
    </div>
  );
}
