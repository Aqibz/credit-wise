import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";
import { Save, Send, ChevronDown, Search, Truck, FileText, Package, AlertTriangle, Info } from "lucide-react";
import { useEntityStore } from "@/lib/state/useEntityStore";
import { purchaseOrdersConfig } from "@/lib/entities";

const WAREHOUSES = ["Main Warehouse", "Model Town DC", "Gulberg Hub", "DHA Phase 5", "Johar Town", "Karachi Port"];

type GrnLine = {
  id: string;
  product: string;
  sku?: string;
  uom: string;
  orderedQty: number;
  alreadyReceived: number;
  receivingQty: number;
  damagedQty: number;
  rate: number;
};

const localDateTimeNow = () => {
  const d = new Date();
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
  return d.toISOString().slice(0, 16);
};
const formatReceivedAt = (s: string) => {
  if (!s) return "—";
  const d = new Date(s);
  if (isNaN(d.getTime())) return s;
  return d.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
};

const Rs = (n: number) =>
  `Rs. ${Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

// Synthesize mock items if PO has none stored
function poToLines(po: any): GrnLine[] {
  if (po?.items && Array.isArray(po.items) && po.items.length && typeof po.items[0] === "object") {
    return po.items.map((it: any, idx: number) => ({
      id: `gl-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      product: it.product || "Item",
      sku: it.sku,
      uom: it.uom || "PCS",
      orderedQty: Number(it.qty || 0),
      alreadyReceived: 0,
      receivingQty: Number(it.qty || 0),
      damagedQty: 0,
      rate: Number(it.rate || 0),
    }));
  }
  // synthesized fallback
  const count = Math.max(1, Number(po?.items || 3));
  const sample = [
    { product: "Gree 1.5 Ton Inverter AC", sku: "GREE-AC15-INV", rate: 145000 },
    { product: "Samsung LED TV 55", sku: "SAM-LED-55", rate: 165000 },
    { product: "Haier Refrigerator 13 CFT", sku: "HAI-REF-13", rate: 98500 },
    { product: "Dawlance Microwave Oven", sku: "DAW-MWO-23", rate: 32500 },
    { product: "PEL Washing Machine", sku: "PEL-WM-08", rate: 47500 },
    { product: "Orient Water Dispenser", sku: "ORI-WD-03", rate: 28500 },
  ];
  const total = Number(po?.amount || 0);
  const perLine = count > 0 ? Math.round(total / count) : 0;
  return Array.from({ length: Math.min(count, sample.length) }).map((_, idx) => {
    const s = sample[idx % sample.length];
    const qty = Math.max(1, Math.round(perLine / (s.rate || 1))) || 1;
    return {
      id: `gl-${idx}-${Math.random().toString(36).slice(2, 6)}`,
      product: s.product,
      sku: s.sku,
      uom: "PCS",
      orderedQty: qty,
      alreadyReceived: 0,
      receivingQty: qty,
      damagedQty: 0,
      rate: s.rate,
    };
  });
}

export function GrnForm({
  initial,
  onClose,
  onSubmit,
  isEdit,
  pageMode,
  defaultReceivedBy,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
  defaultReceivedBy?: string;
}) {
  const { items: pos } = useEntityStore<any>(purchaseOrdersConfig.storageKey!, purchaseOrdersConfig.seed as any);

  const [v, setV] = useState<any>(() => ({
    ref: initial?.ref ?? "",
    poId: initial?.poId ?? "",
    po: initial?.po ?? "",
    supplier: initial?.supplier ?? "",
    warehouse: initial?.warehouse ?? "Main Warehouse",
    receivedAt: initial?.receivedAt ?? localDateTimeNow(),
    invoice: initial?.invoice ?? "",
    vehicle: initial?.vehicle ?? "",
    driver: initial?.driver ?? "",
    receivedBy: initial?.receivedBy ?? defaultReceivedBy ?? "Ahmed Hassan",
    qc: initial?.qc ?? "Pending",
    notes: initial?.notes ?? "",
    lines: (initial?.lines as GrnLine[]) ?? [],
    paymentTerms: initial?.paymentTerms ?? "",
    branch: initial?.branch ?? "",
  }));
  const [error, setError] = useState<string | null>(null);
  const [poPickerOpen, setPoPickerOpen] = useState(false);
  const [poSearch, setPoSearch] = useState("");

  // Auto-generate GRN # on mount (new only)
  useEffect(() => {
    if (initial) return;
    setV((p: any) => ({ ...p, ref: p.ref || `GRN-${String(Math.floor(Math.random() * 90000) + 10000)}` }));
  }, [initial]);

  function set<K extends keyof typeof v>(k: K, val: any) {
    setV((p: any) => ({ ...p, [k]: val }));
  }

  const eligiblePos = useMemo(
    () =>
      pos.filter((p: any) => ["Approved", "Pending", "Partially Received"].includes(p.status)),
    [pos],
  );
  const filteredPos = useMemo(() => {
    const q = poSearch.trim().toLowerCase();
    if (!q) return eligiblePos;
    return eligiblePos.filter(
      (p: any) =>
        p.ref?.toLowerCase().includes(q) || p.supplier?.toLowerCase().includes(q),
    );
  }, [eligiblePos, poSearch]);

  function selectPo(po: any) {
    setV((prev: any) => ({
      ...prev,
      poId: po.id,
      po: po.ref,
      supplier: po.supplier,
      warehouse: po.branch && WAREHOUSES.includes(po.branch) ? po.branch : po.branch || prev.warehouse,
      branch: po.branch,
      paymentTerms: po.paymentTerms ?? prev.paymentTerms,
      lines: poToLines(po),
    }));
    setPoPickerOpen(false);
    setPoSearch("");
  }

  function updateLine(id: string, patch: Partial<GrnLine>) {
    set("lines", v.lines.map((l: GrnLine) => (l.id === id ? { ...l, ...patch } : l)));
  }

  const totals = useMemo(() => {
    const orderedQty = v.lines.reduce((s: number, l: GrnLine) => s + Number(l.orderedQty || 0), 0);
    const receivedQty = v.lines.reduce((s: number, l: GrnLine) => s + Number(l.receivingQty || 0), 0);
    const damagedQty = v.lines.reduce((s: number, l: GrnLine) => s + Number(l.damagedQty || 0), 0);
    const amount = v.lines.reduce(
      (s: number, l: GrnLine) => s + Number(l.receivingQty || 0) * Number(l.rate || 0),
      0,
    );
    return { orderedQty, receivedQty, damagedQty, amount };
  }, [v.lines]);

  const derivedStatus = useMemo(() => {
    if (!v.lines.length) return "Draft";
    if (totals.receivedQty === 0) return "In Transit";
    if (totals.receivedQty < totals.orderedQty) return "Partially Received";
    return "Pending QC";
  }, [totals, v.lines]);

  function validate(): boolean {
    if (!v.po) { setError("Please select a Purchase Order"); return false; }
    if (!v.ref.trim()) { setError("GRN # is required"); return false; }
    if (!v.warehouse) { setError("Receiving warehouse is required"); return false; }
    if (!v.receivedAt) { setError("Receive date is required"); return false; }
    if (!v.lines.length) { setError("This PO has no items"); return false; }
    if (v.lines.some((l: GrnLine) => Number(l.receivingQty) < 0 || Number(l.damagedQty) < 0)) {
      setError("Quantities cannot be negative"); return false;
    }
    if (v.lines.some((l: GrnLine) => Number(l.receivingQty) + Number(l.damagedQty) > Number(l.orderedQty))) {
      setError("Receiving + damaged exceeds ordered quantity"); return false;
    }
    setError(null);
    return true;
  }

  function handleSave(forceStatus?: string) {
    if (!validate()) return;
    onSubmit({
      ...v,
      status: forceStatus ?? derivedStatus,
      orderedQty: totals.orderedQty,
      receivedQty: totals.receivedQty,
      damagedQty: totals.damagedQty,
      amount: Math.round(totals.amount),
      itemsCount: v.lines.length,
      receivedCount: v.lines.filter((l: GrnLine) => Number(l.receivingQty) > 0).length,
      dateTime: formatReceivedAt(v.receivedAt),
    });
  }

  const selectedPo = pos.find((p: any) => p.id === v.poId);

  return (
    <div className="space-y-0 pb-28 w-full lg:w-3/4">
      <div className="mb-4 text-xs text-muted-foreground">
        Fields marked with <span className="text-destructive">*</span> are required. GRN auto-fetches details from the linked PO — verify quantities only.
      </div>

      <Card>
        {/* PO Selector */}
        <Row label="Purchase Order" required tone="muted">
          <div className="relative max-w-md">
            <button
              type="button"
              onClick={() => setPoPickerOpen((o) => !o)}
              className="w-full h-10 px-3 inline-flex items-center justify-between gap-2 rounded-md border border-border bg-card text-sm hover:bg-muted/30"
            >
              {v.po ? (
                <span className="flex items-center gap-2 text-left">
                  <FileText className="h-4 w-4 text-primary shrink-0" />
                  <span className="font-semibold text-foreground">{v.po}</span>
                  {selectedPo && (
                    <span className="text-muted-foreground text-xs">• {selectedPo.supplier}</span>
                  )}
                </span>
              ) : (
                <span className="flex items-center gap-2 text-muted-foreground">
                  <Search className="h-4 w-4" /> Select a Purchase Order…
                </span>
              )}
              <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${poPickerOpen ? "rotate-180" : ""}`} />
            </button>
            {poPickerOpen && (
              <div className="absolute z-30 left-0 right-0 mt-1.5 rounded-lg border border-border bg-popover shadow-lg overflow-hidden">
                <div className="p-2 border-b border-border bg-muted/30">
                  <div className="relative">
                    <Search className="h-3.5 w-3.5 absolute left-2.5 top-2.5 text-muted-foreground" />
                    <input
                      autoFocus
                      value={poSearch}
                      onChange={(e) => setPoSearch(e.target.value)}
                      placeholder="Search PO # or supplier…"
                      className="w-full h-8 pl-8 pr-2 rounded-md border border-border bg-card text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                    />
                  </div>
                </div>
                <div className="max-h-72 overflow-y-auto">
                  {filteredPos.length === 0 ? (
                    <div className="px-3 py-6 text-center text-xs text-muted-foreground">No matching purchase orders</div>
                  ) : (
                    filteredPos.map((p: any) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => selectPo(p)}
                        className="w-full text-left px-3 py-2.5 hover:bg-muted border-b border-border/60 last:border-0 flex items-center justify-between gap-3"
                      >
                        <div className="min-w-0">
                          <div className="text-sm font-semibold text-foreground">{p.ref}</div>
                          <div className="text-[11px] text-muted-foreground truncate">{p.supplier} • {p.branch || "—"}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-xs font-medium text-foreground">{Rs(p.amount)}</div>
                          <div className="text-[10px] uppercase tracking-wide text-muted-foreground">{p.status}</div>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </Row>

        {/* PO Summary (auto-fetched) */}
        {selectedPo && (
          <div className="px-4 sm:px-5 py-4 border-b border-border bg-primary/[0.03]">
            <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-primary mb-3">
              <Info className="h-3 w-3" /> Auto-fetched from PO
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
              <Info2 k="Supplier" v={selectedPo.supplier} />
              <Info2 k="PO Date" v={selectedPo.date} />
              <Info2 k="Branch" v={selectedPo.branch || "—"} />
              <Info2 k="Payment Terms" v={selectedPo.paymentTerms || "—"} />
              <Info2 k="PO Value" v={Rs(selectedPo.amount)} />
              <Info2 k="Expected Delivery" v={selectedPo.expectedDelivery || "—"} />
              <Info2 k="PO Status" v={selectedPo.status} />
              <Info2 k="Line Items" v={String(v.lines.length)} />
            </div>
          </div>
        )}

        {/* GRN # */}
        <Row label="GRN #" required>
          <BaseInput value={v.ref} onChange={(e) => set("ref", e.target.value)} className="max-w-sm" />
        </Row>

        <Row label="Receive Date & Time" required>
          <BaseInput
            type="datetime-local"
            value={v.receivedAt}
            onChange={(e) => set("receivedAt", e.target.value)}
            className="max-w-sm"
          />
        </Row>

        <Row label="Receiving Warehouse" required>
          <NativeSelect
            value={v.warehouse}
            onChange={(e) => set("warehouse", e.target.value)}
            options={WAREHOUSES}
            className="max-w-sm"
          />
        </Row>

        <Row label="Vendor Invoice / DC #">
          <BaseInput value={v.invoice} onChange={(e) => set("invoice", e.target.value)} placeholder="e.g. INV-DWP-882" className="max-w-sm" />
        </Row>

        <Row label="Vehicle / Transporter">
          <BaseInput value={v.vehicle} onChange={(e) => set("vehicle", e.target.value)} placeholder="e.g. LEC-2241 (Daewoo)" className="max-w-sm" />
        </Row>

        <Row label="Driver Name">
          <BaseInput value={v.driver} onChange={(e) => set("driver", e.target.value)} placeholder="Driver full name" className="max-w-sm" />
        </Row>

        <Row label="Received By">
          <BaseInput value={v.receivedBy} onChange={(e) => set("receivedBy", e.target.value)} className="max-w-sm" />
        </Row>
      </Card>

      {/* Items table */}
      <div className="mt-6">
        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <header className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
            <h3 className="text-sm font-bold text-foreground inline-flex items-center gap-2">
              <Package className="h-4 w-4 text-primary" /> Receive Items
            </h3>
            <span className="text-[11px] text-muted-foreground">Quantities are pre-filled from the PO. Adjust only what differs.</span>
          </header>
          {v.lines.length === 0 ? (
            <div className="px-4 py-10 text-center text-sm text-muted-foreground">
              <Truck className="h-8 w-8 mx-auto mb-2 opacity-50" />
              Select a Purchase Order to load items.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase font-bold text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="text-left px-3 py-2.5 min-w-[260px]">Item</th>
                    <th className="text-left px-3 py-2.5 w-20">UOM</th>
                    <th className="text-right px-3 py-2.5 w-24">Ordered</th>
                    <th className="text-right px-3 py-2.5 w-28">Receiving Now</th>
                    <th className="text-right px-3 py-2.5 w-24">Damaged</th>
                    <th className="text-right px-3 py-2.5 w-28">Rate</th>
                    <th className="text-right px-3 py-2.5 w-32">Line Value</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {v.lines.map((l: GrnLine) => {
                    const ordered = Number(l.orderedQty || 0);
                    const recv = Number(l.receivingQty || 0);
                    const dmg = Number(l.damagedQty || 0);
                    const lineValue = recv * Number(l.rate || 0);
                    const overflow = recv + dmg > ordered;
                    const partial = recv > 0 && recv < ordered;
                    return (
                      <tr key={l.id} className="align-top">
                        <td className="px-3 py-2.5">
                          <div className="font-semibold text-foreground">{l.product}</div>
                          {l.sku && <div className="text-[11px] text-muted-foreground mt-0.5">SKU: {l.sku}</div>}
                          {overflow && (
                            <div className="text-[11px] text-destructive mt-1 inline-flex items-center gap-1">
                              <AlertTriangle className="h-3 w-3" /> Exceeds ordered
                            </div>
                          )}
                          {partial && !overflow && (
                            <div className="text-[11px] text-amber-600 mt-1">Partial receipt</div>
                          )}
                        </td>
                        <td className="px-3 py-2.5 text-muted-foreground">{l.uom}</td>
                        <td className="px-3 py-2.5 text-right tabular-nums font-medium">{ordered}</td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min={0}
                            value={l.receivingQty}
                            onChange={(e) => updateLine(l.id, { receivingQty: Number(e.target.value) })}
                            className={`w-full h-9 px-2 rounded-md border bg-card text-sm text-right ${overflow ? "border-destructive ring-1 ring-destructive/30" : "border-border"}`}
                          />
                        </td>
                        <td className="px-3 py-2.5">
                          <input
                            type="number"
                            min={0}
                            value={l.damagedQty}
                            onChange={(e) => updateLine(l.id, { damagedQty: Number(e.target.value) })}
                            className="w-full h-9 px-2 rounded-md border border-border bg-card text-sm text-right"
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
                    <td className="px-3 py-2.5 text-xs uppercase tracking-wider font-bold text-muted-foreground" colSpan={2}>
                      Totals
                    </td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-foreground">{totals.orderedQty}</td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-foreground">{totals.receivedQty}</td>
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-foreground">{totals.damagedQty}</td>
                    <td />
                    <td className="px-3 py-2.5 text-right text-sm font-bold text-primary">{Rs(totals.amount)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </section>
      </div>

      {/* QC + Notes + Summary */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div className="space-y-3">
          <div>
            <label className="block text-sm text-foreground mb-1.5">QC Result</label>
            <NativeSelect
              value={v.qc}
              onChange={(e) => set("qc", e.target.value)}
              options={["Pending", "Passed", "Failed", "Partial"]}
              className="max-w-xs"
            />
          </div>
          <div>
            <label className="block text-sm text-foreground mb-1.5">Receiving Notes / Discrepancies</label>
            <textarea
              value={v.notes}
              onChange={(e) => set("notes", e.target.value)}
              rows={4}
              placeholder="Damage notes, short-receive reasons, supplier follow-ups…"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 self-start">
          <SumRow label="Ordered Qty" value={String(totals.orderedQty)} />
          <SumRow label="Receiving Qty" value={String(totals.receivedQty)} />
          <SumRow label="Damaged / Short" value={String(totals.damagedQty)} tone={totals.damagedQty > 0 ? "warn" : undefined} />
          <SumRow label="GRN Status" value={derivedStatus} tone="info" />
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Receipt Value</span>
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
              : <span className="text-muted-foreground">Receipt: <span className="font-bold text-foreground">{Rs(totals.amount)}</span> • Status: <span className="font-bold text-foreground">{derivedStatus}</span></span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="button" onClick={() => handleSave("Draft")} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted inline-flex items-center gap-2">
              <Save className="h-4 w-4" /> Save as Draft
            </button>
            <button type="button" onClick={() => handleSave()} className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> {isEdit ? "Save Changes" : "Receive Goods"}
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

function RowSplit({
  left, right,
}: {
  left: { label: string; required?: boolean; content: ReactNode };
  right: { label: string; required?: boolean; content: ReactNode };
}) {
  return (
    <div className="px-4 sm:px-5 py-3.5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[200px_1fr] gap-2 md:gap-6">
        <label className="text-sm pt-2 text-foreground">{left.label}{left.required && <span className="text-destructive ml-0.5">*</span>}</label>
        <div>{left.content}</div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[160px_1fr] gap-2 md:gap-4">
        <label className="text-sm pt-2 text-foreground">{right.label}{right.required && <span className="text-destructive ml-0.5">*</span>}</label>
        <div>{right.content}</div>
      </div>
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

function SumRow({ label, value, tone, bold }: { label: string; value: string; tone?: "warn" | "info"; bold?: boolean }) {
  const cls =
    tone === "warn" ? "text-amber-600" :
    tone === "info" ? "text-primary" :
    bold ? "text-foreground" : "text-foreground";
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className={`text-sm font-bold tabular-nums ${cls}`}>{value}</span>
    </div>
  );
}
