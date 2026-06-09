import type { ReactNode } from "react";

export type Cheque = { bank: string; cheque: string; date: string; amount: number };
export type Guarantor = { name: string; cnic: string; phone: string; relation: string; occupation: string };

export const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;
export const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
export const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };

export const inputCls =
  "w-full h-9 rounded-md border border-border bg-background px-3 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30";

export function Field({ label, hint, required, children }: { label: string; hint?: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block">
      <span className="block text-xs font-semibold text-foreground mb-1">{label}{required && <span className="text-destructive ml-0.5">*</span>}</span>
      {children}
      {hint && <span className="block text-[11px] text-muted-foreground mt-1">{hint}</span>}
    </label>
  );
}

export function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <div>
      <div className="mb-4">
        <h3 className="text-base font-bold text-foreground">{title}</h3>
        {hint && <p className="text-xs text-muted-foreground mt-0.5">{hint}</p>}
      </div>
      {children}
    </div>
  );
}

export function Info({ k, v }: { k: string; v: any }) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/50 py-1.5">
      <span className="text-muted-foreground text-xs font-medium">{k}</span>
      <span className="text-foreground text-sm font-semibold text-right truncate max-w-[60%]">{v ?? "—"}</span>
    </div>
  );
}

export function Summary({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 p-4">
      <div className="text-xs uppercase tracking-wider font-bold text-muted-foreground mb-2">{title}</div>
      <div className="grid sm:grid-cols-2 gap-x-4">{children}</div>
    </div>
  );
}

export function Stat({ label, value, tone = "primary", big }: { label: string; value: string; tone?: "primary" | "muted" | "warning" | "success"; big?: boolean }) {
  const toneCls = {
    primary: "border-primary/30 bg-primary/5 text-primary",
    muted: "border-border bg-muted/40 text-foreground",
    warning: "border-warning/30 bg-warning/10 text-warning",
    success: "border-success/30 bg-success/10 text-success",
  }[tone];
  return (
    <div className={`rounded-lg border p-3 ${toneCls}`}>
      <div className="text-[11px] font-semibold uppercase tracking-wider opacity-80">{label}</div>
      <div className={`font-bold mt-1 ${big ? "text-2xl" : "text-lg"}`}>{value}</div>
    </div>
  );
}
