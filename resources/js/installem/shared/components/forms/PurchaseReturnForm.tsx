import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Save, Send, ChevronDown, Search, FileText, Package, AlertTriangle, Info, Undo2 } from "lucide-react";
import { useEntityStore } from "@/lib/useEntityStore";
import { grnConfig } from "@/lib/entities";

const REASONS = ["Damaged", "Wrong Item", "Quality Issue", "Excess Supply", "Expired"];

type ReturnLine = {
  id: string;
  product: string;
  sku?: string;
  uom: string;
  receivedQty: number;
  returnQty: number;
  rate: number;
  reason: string;
};

const localDateTimeNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const formatReturnedAt = (s: string) => {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const Rs = (n: number) =>
  `Rs. ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Synthesize lines from a GRN's stored items (or fallback samples)
function grnToLines(grn: any): ReturnLine[] {
  const sample = [
    { product: "Gree 1.5 Ton Inverter AC", sku: "GREE-AC15-INV", rate: 145000 },
    { product: "Samsung LED TV 55", sku: "SAM-LED-55", rate: 165000 },
    { product: "Haier Refrigerator 13 CFT", sku: "HAI-REF-13", rate: 98500 },
    { product: "Dawlance Microwave Oven", sku: "DAW-MWO-23", rate: 32500 },
    { product: "PEL Washing Machine", sku: "PEL-WM-08", rate: 47500 },
    { product: "Orient Water Dispenser", sku: "ORI-WD-03", rate: 28500 },
  ];

  if (Array.isArray(grn?.lines) && grn.lines.length) {
    return grn.lines.map((it: any, idx: number) => ({
      id: `rl-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      product: it.product || "Item",
      sku: it.sku,
      uom: it.uom || "PCS",
      receivedQty: Number(it.receivingQty ?? it.receivedQty ?? it.qty ?? 0),
      returnQty: 0,
      rate: Number(it.rate || 0),
      reason: "Damaged",
    }));
  }

  const count = Math.max(1, Number(grn?.itemsCount || 3));
  const total = Number(grn?.amount || 0);
  const perLine = count > 0 ? Math.round(total / count) : 0;
  return Array.from({ length: Math.min(count, sample.length) }).map((_, idx) => {
    const s = sample[idx % sample.length];
    const qty = Math.max(1, Math.round(perLine / (s.rate || 1))) || 1;
    return {
      id: `rl-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      product: s.product,
      sku: s.sku,
      uom: "PCS",
      receivedQty: qty,
      returnQty: 0,
      rate: s.rate,
      reason: "Damaged",
    };
  });
}

export function PurchaseReturnForm({
  initial,
  onClose,
  onSubmit,
  isEdit,
  pageMode,
  defaultReturnedBy,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
  defaultReturnedBy?: string;
}) {
  const { items: grns } = useEntityStore<any>(grnConfig.storageKey!, grnConfig.seed as any);

  const [v, setV] = useState<any>(() => ({
    ref: initial?.ref ?? "",
    grnId: initial?.grnId ?? "",
    grn: initial?.grn ?? "",
    supplier: initial?.supplier ?? "",
    warehouse: initial?.warehouse ?? "",
    returnedAt: initial?.returnedAt ?? localDateTimeNow(),
    debitNote: initial?.debitNote ?? "",
    returnedBy: initial?.returnedBy ?? defaultReturnedBy ?? "Ahmed Hassan",
    settlement: initial?.settlement ?? "Credit Note",
    notes: initial?.notes ?? "",
    lines: (initial?.lines as ReturnLine[]) ?? [],
  }));
  const [error, setError] = useState<string | null>(null);
  const [grnPickerOpen, setGrnPickerOpen] = useState(false);
  const [grnSearch, setGrnSearch] = useState("");

  // Auto-generate Return # on mount (new only)
  useEffect(() => {
    if (initial) return;
    setV((p: any) => ({ ...p, ref: p.ref || `PR-${String(Math.floor(Math.random() * 90000) + 10000)}` }));
  }, [initial]);

  function set<K extends keyof typeof v>(k: K, val: any) {
    setV((p: any) => ({ ...p, [k]: val }));
  }

  // Only GRNs that hold stock are returnable
  const eligibleGrns = useMemo(
    () => grns.filter((g: any) => ["Received", "Partially Received", "Pending QC", "Closed"].includes(g.status)),
    [grns],
  );
  const filteredGrns = useMemo(() => {
    const q = grnSearch.trim().toLowerCase();
    if (!q) return eligibleGrns;
    return eligibleGrns.filter(
      (g: any) => g.ref?.toLowerCase().includes(q) || g.supplier?.toLowerCase().includes(q),
    );
  }, [eligibleGrns, grnSearch]);

  function selectGrn(g: any) {
    setV((prev: any) => ({
      ...prev,
      grnId: g.id,
      grn: g.ref,
      supplier: g.supplier,
      warehouse: g.warehouse || prev.warehouse,
      lines: grnToLines(g),
    }));
    setGrnPickerOpen(false);
    setGrnSearch("");
  }

  function updateLine(id: string, patch: Partial<ReturnLine>) {
    set("lines", v.lines.map((l: ReturnLine) => (l.id === id ? { ...l, ...patch } : l)));
  }

  const totals = useMemo(() => {
    const returnQty = v.lines.reduce((s: number, l: ReturnLine) => s + Number(l.returnQty || 0), 0);
    const amount = v.lines.reduce(
      (s: number, l: ReturnLine) => s + Number(l.returnQty || 0) * Number(l.rate || 0),
      0,
    );
    const linesAffected = v.lines.filter((l: ReturnLine) => Number(l.returnQty) > 0).length;
    return { returnQty, amount, linesAffected };
  }, [v.lines]);

  const selectedGrn = grns.find((g: any) => g.id === v.grnId);

  function validate(): boolean {
    if (!v.grn) { setError("Please select a GRN to return against"); return false; }
    if (!v.ref.trim()) { setError("Return # is required"); return false; }
    if (!v.returnedAt) { setError("Return date is required"); return false; }
    if (!v.lines.length) { setError("This GRN has no items"); return false; }
    if (totals.returnQty <= 0) { setError("Enter at least one return quantity"); return false; }
    if (v.lines.some((l: ReturnLine) => Number(l.returnQty) < 0)) {
      setError("Return quantity cannot be negative"); return false;
    }
    if (v.lines.some((l: ReturnLine) => Number(l.returnQty) > Number(l.receivedQty))) {
      setError("Return quantity exceeds received quantity"); return false;
    }
    setError(null);
    return true;
  }

  function handleSave(forceStatus?: string) {
    if (!validate()) return;
    const reasonsUsed = Array.from(new Set(v.lines.filter((l: ReturnLine) => l.returnQty > 0).map((l: ReturnLine) => l.reason)));
    onSubmit({
      ...v,
      status: forceStatus ?? "Pending",
      qty: totals.returnQty,
      amount: Math.round(totals.amount),
      itemsCount: totals.linesAffected,
      reason: reasonsUsed.length === 1 ? reasonsUsed[0] : reasonsUsed.length > 1 ? "Mixed" : "—",
      dateTime: formatReturnedAt(v.returnedAt),
      date: v.returnedAt.slice(0, 10),
    });
  }

  return (
    <div className="space-y-0 pb-28 w-full lg:w-3/4">
      <div className="mb-4 text-xs text-muted-foreground">
        Fields marked with <span className="text-destructive">*</span> are required. Returns are created against a GRN — supplier, warehouse and items are auto-fetched.
      </div>

      <Card>
        {/* GRN Selector */}
        <Row label="Goods Received Note" required tone="muted">
          <div className="relative max-w-md">
            <button
              type="button"
              onClick={() => setGrnPickerOpen((o) => !o)}
              className="w-full h-10 px-3 inline-flex items-center justify-between gap-2 rounded-md border border-border bg-card text-sm hover:bg-muted/30"
            >
              {v.grn ? (
                <span className="flex items-center gap-2 text-left">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{v.grn}</span>
                  {selectedGrn && (
                    <span className="text-muted-foreground text-xs">• {selectedGrn.supplier}</span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Search className="h-4 w-4" /> Select a GRN…
                </span>
              )}
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${grnPickerOpen ? "rotate-180" : ""}`} />
            </button>
            {grnPickerOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1.5 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                <div className="p-2 border-b border-border bg-muted/30">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <input
                      autoFocus
                      value={grnSearch}
                      onChange={(e) => setGrnSearch(e.target.value)}
                      placeholder="Search GRN # or supplier…"
                      className="w-full h-8 pl-8 pr-2 rounded-md border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {filteredGrns.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">No matching GRNs</div>
                  ) : (
                    filteredGrns.map((g: any) => (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => selectGrn(g)}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted border-b border-border/60 last:border-0 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground">{g.ref}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{g.supplier} • {g.warehouse || "—"}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-medium text-foreground">{Rs(g.amount)}</div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{g.status}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Row>

        {/* GRN Summary */}
        {selectedGrn && (
          <div className="px-4 sm:px-5 py-4 border-b border-border bg-primary/[0.03]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary mb-3">
              <Info className="h-3 w-3" /> Auto-fetched from GRN
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Info2 k="Supplier" v={selectedGrn.supplier} />
              <Info2 k="GRN Date" v={selectedGrn.date} />
              <Info2 k="Warehouse" v={selectedGrn.warehouse || "—"} />
              <Info2 k="PO Reference" v={selectedGrn.po || "—"} />
              <Info2 k="GRN Value" v={Rs(selectedGrn.amount)} />
              <Info2 k="GRN Status" v={selectedGrn.status} />
              <Info2 k="QC Result" v={selectedGrn.qc || "—"} />
              <Info2 k="Line Items" v={String(v.lines.length)} />
            </div>
          </div>
        )}

        <Row label="Return #" required>
          <BaseInput value={v.ref} onChange={(e) => set("ref", e.target.value)} className="max-w-sm" />
        </Row>

        <Row label="Return Date & Time" required>
          <BaseInput
            type="datetime-local"
            value={v.returnedAt}
            onChange={(e) => set("returnedAt", e.target.value)}
            className="max-w-sm"
          />
        </Row>

        <Row label="Debit Note / Reference">
          <BaseInput value={v.debitNote} onChange={(e) => set("debitNote", e.target.value)} placeholder="e.g. DN-DWP-118" className="max-w-sm" />
        </Row>

        <Row label="Settlement">
          <NativeSelect
            value={v.settlement}
            onChange={(e) => set("settlement", e.target.value)}
            options={["Credit Note", "Refund", "Replacement", "Adjust against next bill"]}
            className="max-w-sm"
          />
        </Row>

        <Row label="Returned By">
          <BaseInput value={v.returnedBy} onChange={(e) => set("returnedBy", e.target.value)} className="max-w-sm" />
        </Row>
      </Card>

      {/* Items table */}
      <div className="mt-6">
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <header className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
            <h3 className="text-sm font-bold text-foreground inline-flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Return Items
            </h3>
            <span className="text-[11px] text-muted-foreground">Enter quantity to return per line. Cannot exceed received quantity.</span>
          </header>
          {v.lines.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              <Undo2 className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Select a GRN to load received items.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase font-bold text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="text-left px-3 py-2.5 min-w-[260px]">Item</th>
                    <th className="text-left px-3 py-2.5 w-20">UOM</th>
                    <th className="text-right px-3 py-2.5 w-24">Received</th>
                    <th className="text-right px-3 py-2.5 w-28">Return Qty</th>
                    <th className="text-left px-3 py-2.5 w-40">Reason</th>
                    <th className="text-right px-3 py-2.5 w-28">Rate</th>
                    <th className="text-right px-3 py-2.5 w-32">Line Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {v.lines.map((l: ReturnLine) => {
                    const rcv = Number(l.receivedQty || 0);
                    const ret = Number(l.returnQty || 0);
                    const lineValue = ret * Number(l.rate || 0);
                    const overflow = ret > rcv;
                    return (
                      <tr key={l.id} className="align-top">
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">{l.product}</div>
                          {l.sku && <div className="text-[11px] text-muted-foreground mt-0.5">SKU: {l.sku}</div>}
                          {overflow && (
                            <div className="text-[11px] text-destructive mt-1 inline-flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Exceeds received
                            </div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{l.uom}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-medium">{rcv}</td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min={0}
                            max={rcv}
                            value={l.returnQty}
                            onChange={(e) => updateLine(l.id, { returnQty: Number(e.target.value) })}
                            className={`w-full h-9 px-2 rounded-md border bg-card text-sm text-right ${overflow ? "border-destructive ring-1 ring-destructive/30" : "border-border"}`}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <NativeSelect
                            value={l.reason}
                            onChange={(e) => updateLine(l.id, { reason: e.target.value })}
                            options={REASONS}
                          />
                        </td>
                        <td className="px-3 py-2.5 text-right tabular-nums text-muted-foreground">{Rs(l.rate)}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-bold text-foreground">{Rs(lineValue)}</td>
                      </tr>
                    );
                  })}
                </tbody>
                <tfoot className="bg-muted/20 border-t border-border">
                  <tr>
                    <td className="px-3 py-2.5 text-xs uppercase tracking-wider font-bold text-muted-foreground" colSpan={3}>
                      Totals
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-foreground">{totals.returnQty}</td>
                    <td />
                    <td />
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-primary">{Rs(totals.amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* Notes + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div>
          <label className="block text-sm text-foreground mb-1.5">Return Notes</label>
          <textarea
            value={v.notes}
            onChange={(e) => set("notes", e.target.value)}
            rows={4}
            placeholder="Reason details, supplier acknowledgement, pickup arrangement…"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 self-start">
          <SumRow label="Lines Affected" value={String(totals.linesAffected)} />
          <SumRow label="Total Return Qty" value={String(totals.returnQty)} />
          <SumRow label="Settlement" value={v.settlement} tone="info" />
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Return Value</span>
            <span className="text-lg font-bold text-primary">{Rs(totals.amount)}</span>
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className={`${pageMode ? "fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-w,16rem)] z-30" : "sticky bottom-0"} border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-3 mt-6`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs">
            {error
              ? <span className="text-destructive font-semibold">{error}</span>
              : <span className="text-muted-foreground">Return: <span className="font-bold text-foreground">{Rs(totals.amount)}</span> • Qty: <span className="font-bold text-foreground">{totals.returnQty}</span></span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="button" onClick={() => handleSave("Draft")} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted inline-flex items-center gap-2">
              <Save className="h-4 w-4" /> Save as Draft
            </button>
            <button type="button" onClick={() => handleSave()} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> {isEdit ? "Save Changes" : "Submit Return"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* shared bits */
function Card({ children }: { children: ReactNode }) {
  return <section className="rounded-xl border border-border bg-card">{children}</section>;
}

function Row({ label, required, tone, children }: { label: string; required?: boolean; tone?: "muted"; children: ReactNode }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6 px-4 sm:px-5 py-3.5 ${tone === "muted" ? "bg-muted/20" : ""}`}>
      <label className="text-sm pt-2 text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div>{children}</div>
    </div>
  );
}

function BaseInput({ className = "", ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`h-9 px-2.5 rounded-md border border-border bg-card text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary ${className}`}
    />
  );
}

function NativeSelect({
  value, onChange, options, placeholder, className = "",
}: {
  value: string;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: string[];
  placeholder?: string;
  className?: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <select
        value={value}
        onChange={onChange}
        className="appearance-none w-full h-9 pl-2.5 pr-8 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="h-3.5 w-3.5 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none text-muted-foreground" />
    </div>
  );
}

function Info2({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <div className="text-[10px] uppercase tracking-wider font-semibold text-muted-foreground">{k}</div>
      <div className="text-sm font-semibold text-foreground mt-0.5 truncate">{v || "—"}</div>
    </div>
  );
}

function SumRow({ label, value, tone }: { label: string; value: string; tone?: "warn" | "info" }) {
  const cls =
    tone === "warn" ? "text-amber-600" :
    tone === "info" ? "text-primary" :
    "text-foreground";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${cls}`}>{value}</span>
    </div>
  );
}
