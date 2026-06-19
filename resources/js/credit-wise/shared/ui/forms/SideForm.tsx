import type { ReactNode } from "react";

/**
 * Shared "side-label" form layout used by the PO form, Supplier wizard,
 * and Contract form.
 *
 * Layout contract (matches Purchase Order form):
 *  - Outer card constrains to ~75% width on lg+ (`w-full lg:w-3/4`).
 *  - Each row has a compact label column + 1fr input column.
 *  - Inputs fill their 1fr column naturally — no extra max-width wrappers.
 *  - Labels render at 13px to keep the form dense but readable.
 *  - Section headers act as light dividers inside one flat card.
 */

export function FormCard({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`w-full lg:w-3/4 rounded-xl border border-border bg-card overflow-hidden divide-y divide-border ${className}`.trim()}>
      {children}
    </section>
  );
}

export function FormSection({
  icon, title, description, headerActions, children,
}: { icon?: ReactNode; title: string; description?: string; headerActions?: ReactNode; children: ReactNode }) {
  return (
    <div>
      <header className="px-4 sm:px-5 py-3 flex items-start gap-3 bg-muted/40 border-b border-border">
        {icon && (
          <span className="h-7 w-7 grid place-items-center rounded-md bg-primary/10 text-primary shrink-0">
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-sm font-bold text-foreground leading-tight">{title}</h2>
          {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        </div>
        {headerActions && <div className="ml-auto flex items-center gap-2 shrink-0">{headerActions}</div>}
      </header>
      <div className="divide-y divide-border/60">{children}</div>
    </div>
  );
}

export function FormRow({
  label, required, hint, tone, align = "start", children,
}: {
  label: ReactNode;
  required?: boolean;
  hint?: string;
  tone?: "muted";
  align?: "start" | "center";
  children: ReactNode;
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[184px_1fr] gap-2 md:gap-x-4 md:gap-y-2 px-4 sm:px-5 py-3 ${
        tone === "muted" ? "bg-muted/20" : ""
      }`}
    >
      <label
        className={`text-[13px] font-semibold text-foreground ${align === "center" ? "self-center" : "pt-1.5"}`}
      >
        {label}
        {required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="min-w-0 space-y-1">
        <div>{children}</div>
        {hint && <p className="text-[11px] text-muted-foreground">{hint}</p>}
      </div>
    </div>
  );
}

/** Full-width row without a label column — for tables, button rows, large editors. */
export function FormRowFull({
  tone, children,
}: { tone?: "muted"; children: ReactNode }) {
  return (
    <div className={`px-4 sm:px-5 py-4 ${tone === "muted" ? "bg-muted/20" : ""}`}>
      {children}
    </div>
  );
}

/** Two side-by-side controls inside a single row's right column. */
export function FieldPair({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">{children}</div>;
}

/**
 * Two label+input pairs on the same row. Stacks on narrow viewports, splits
 * into 4 columns on lg+ to keep short fields compact and SaaS-grade.
 */
export function FormRowDouble({
  left, right, tone,
}: {
  left: { label: ReactNode; required?: boolean; hint?: string; children: ReactNode };
  right: { label: ReactNode; required?: boolean; hint?: string; children: ReactNode };
  tone?: "muted";
}) {
  return (
    <div
      className={`grid grid-cols-1 md:grid-cols-[184px_1fr] lg:grid-cols-[184px_1fr_160px_1fr] gap-2 md:gap-x-4 md:gap-y-2 px-4 sm:px-5 py-3 ${
        tone === "muted" ? "bg-muted/20" : ""
      }`}
    >
      <label className="text-[13px] font-semibold text-foreground pt-1.5">
        {left.label}
        {left.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="min-w-0 space-y-1">
        <div>{left.children}</div>
        {left.hint && <p className="text-[11px] text-muted-foreground">{left.hint}</p>}
      </div>
      <label className="text-[13px] font-semibold text-foreground pt-1.5">
        {right.label}
        {right.required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div className="min-w-0 space-y-1">
        <div>{right.children}</div>
        {right.hint && <p className="text-[11px] text-muted-foreground">{right.hint}</p>}
      </div>
    </div>
  );
}

/** Three side-by-side controls inside a single row's right column. */
export function FieldTriple({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">{children}</div>;
}
