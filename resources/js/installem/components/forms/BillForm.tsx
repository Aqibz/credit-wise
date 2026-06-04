import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Plus, Save, ChevronDown, Search, Settings2, Paperclip,
  GripVertical, X, Send, Receipt, Link2, Check, Trash2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { NewVendorModal } from "@/components/NewVendorModal";

const SUPPLIERS = [
  "DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd",
  "Samsung Pakistan", "Sony Distributors",
];
const WAREHOUSES = ["Main Warehouse", "Model Town", "Gulberg", "DHA Phase 5", "Johar Town"];
const STATUSES = ["Draft", "Open", "Partially Paid", "Paid", "Overdue", "Cancelled"];
const PAYMENT_TERMS = ["Due on Receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Advance", "COD"];
const PRICE_LEVELS = ["At Transaction Level", "At Line Item Level"];
const UOMS = ["PCS", "BOX", "CTN", "KG", "LTR", "MTR", "SET"];

type Product = { name: string; sku: string; rate: number };
const PRODUCTS: Product[] = [
  { name: "Gree 1.5 Ton Inverter AC", sku: "GREE-AC15-INV", rate: 145000 },
  { name: "Samsung LED TV 55", sku: "SAM-LED-55", rate: 165000 },
  { name: "Haier Refrigerator 13 CFT", sku: "HAI-REF-13", rate: 98500 },
  { name: "Dawlance Microwave Oven", sku: "DAW-MWO-23", rate: 32500 },
  { name: "Honda CD-70", sku: "HON-CD70", rate: 152000 },
  { name: "Sony Bravia 43", sku: "SNY-BRV-43", rate: 119000 },
  { name: "PEL Washing Machine", sku: "PEL-WM-08", rate: 47500 },
  { name: "Orient Water Dispenser", sku: "ORI-WD-03", rate: 28500 },
  { name: "TCL LED TV 50", sku: "TCL-LED-50", rate: 89500 },
];

type LineItem = {
  id: string;
  product: string;
  description?: string;
  warehouse?: string;
  uom: string;
  qty: number;
  rate: number;
  discount?: number;
  discountMode?: string;
  poRef?: string;
};

const newLine = (warehouse: string): LineItem => ({
  id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  product: "", warehouse, uom: "PCS", qty: 1, rate: 0, discount: 0, discountMode: "%",
});

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso: string) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
};

function termsToDays(t: string): number {
  if (!t) return 0;
  if (t === "Due on Receipt" || t === "COD" || t === "Advance") return 0;
  const m = /Net\s+(\d+)/i.exec(t);
  return m ? Number(m[1]) : 0;
}

function addDaysISO(iso: string, days: number): string {
  if (!iso) return "";
  const d = new Date(iso); d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

type OpenPO = {
  id: string;
  ref: string;
  referenceNo?: string;
  date: string;
  amount: number;
  supplier: string;
  status: string;
  items?: LineItem[];
  branch?: string;
};

function loadOpenPOs(supplier: string): OpenPO[] {
  if (typeof window === "undefined" || !supplier) return [];
  try {
    const raw = window.localStorage.getItem("qcrm.po");
    if (!raw) return [];
    const all: any[] = JSON.parse(raw);
    const billed = new Set<string>();
    try {
      const billsRaw = window.localStorage.getItem("qcrm.bills");
      if (billsRaw) JSON.parse(billsRaw).forEach((b: any) => { if (b.po) String(b.po).split(",").forEach((p: string) => billed.add(p.trim())); });
    } catch {}
    return all
      .filter((p) => p.supplier === supplier)
      .filter((p) => !["Closed", "Cancelled", "Void"].includes(p.status))
      .filter((p) => !billed.has(p.ref))
      .map((p) => ({
        id: p.id, ref: p.ref, referenceNo: p.referenceNo, date: p.date,
        amount: Number(p.amount || 0), supplier: p.supplier, status: p.status,
        items: p.items, branch: p.branch,
      }));
  } catch { return []; }
}

export function BillForm({
  initial, onClose, onSubmit, isEdit, pageMode,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
}) {
  const [v, setV] = useState<any>(() => ({
    ref: initial?.ref ?? "",
    orderNumber: initial?.orderNumber ?? "",
    date: initial?.date ?? todayISO(),
    due: initial?.due ?? "",
    supplier: initial?.supplier ?? "",
    branch: initial?.branch ?? WAREHOUSES[0],
    paymentTerms: initial?.paymentTerms ?? "Net 30",
    priceLevel: initial?.priceLevel ?? "At Transaction Level",
    status: initial?.status ?? "Open",
    po: initial?.po ?? "",
    linkedPOs: (initial?.linkedPOs as string[]) ?? (initial?.po ? String(initial.po).split(",").map((s: string) => s.trim()).filter(Boolean) : []),
    items: (initial?.items as LineItem[]) ?? [newLine(initial?.branch ?? WAREHOUSES[0])],
    discount: initial?.discount ?? 0,
    discountMode: initial?.discountMode ?? "%",
    shipping: initial?.shipping ?? 0,
    notes: initial?.notes ?? "",
    terms: initial?.terms ?? "",
    files: (initial?.files as { name: string; size: number }[]) ?? [],
  }));
  const [error, setError] = useState<string | null>(null);
  const [billPrefsOpen, setBillPrefsOpen] = useState(false);
  const [billMode, setBillMode] = useState<"auto" | "manual">("auto");
  const [billPrefix, setBillPrefix] = useState("BIL-");
  const [billNext, setBillNext] = useState("00001");
  const [newVendorOpen, setNewVendorOpen] = useState(false);
  const [extraVendors, setExtraVendors] = useState<string[]>([]);
  const [poDialogOpen, setPoDialogOpen] = useState(false);

  useEffect(() => {
    if (initial) return;
    setV((prev: any) => ({ ...prev, ref: prev.ref || `BIL-${String(Math.floor(Math.random() * 90000) + 10000)}` }));
  }, [initial]);

  // Auto-compute due date from bill date + payment terms
  useEffect(() => {
    if (!v.date) return;
    const days = termsToDays(v.paymentTerms);
    setV((prev: any) => ({ ...prev, due: addDaysISO(prev.date, days) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.date, v.paymentTerms]);

  function set<K extends keyof typeof v>(k: K, val: any) { setV((p: any) => ({ ...p, [k]: val })); }

  const openPOs = useMemo(() => loadOpenPOs(v.supplier), [v.supplier]);

  // Reset linked POs when vendor changes
  useEffect(() => {
    setV((p: any) => ({ ...p, linkedPOs: [], po: "" }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.supplier]);

  const addItem = () => set("items", [...v.items, newLine(v.branch)]);
  const updateItem = (id: string, patch: Partial<LineItem>) =>
    set("items", v.items.map((it: LineItem) => it.id === id ? { ...it, ...patch } : it));
  const removeItem = (id: string) =>
    set("items", v.items.length > 1 ? v.items.filter((it: LineItem) => it.id !== id) : v.items);
  const moveItem = (fromId: string, toId: string) => {
    if (fromId === toId) return;
    const arr = [...v.items];
    const fromIdx = arr.findIndex((i: LineItem) => i.id === fromId);
    const toIdx = arr.findIndex((i: LineItem) => i.id === toId);
    if (fromIdx < 0 || toIdx < 0) return;
    const [moved] = arr.splice(fromIdx, 1);
    arr.splice(toIdx, 0, moved);
    set("items", arr);
  };
  const [dragId, setDragId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  function applyLinkedPOs(picks: OpenPO[]) {
    if (picks.length === 0) return;
    const refs = picks.map((p) => p.ref);
    const synthesized: LineItem[] = [];
    picks.forEach((po) => {
      const targetWh = po.branch || v.branch;
      if (Array.isArray(po.items) && po.items.length > 0) {
        po.items.filter((it: any) => it.product).forEach((it: any) => {
          synthesized.push({
            id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            product: it.product,
            description: it.description,
            warehouse: targetWh,
            uom: it.uom || "PCS",
            qty: Number(it.qty || 1),
            rate: Number(it.rate || 0),
            discount: 0, discountMode: "%",
            poRef: po.ref,
          });
        });
      } else {
        // Synthesize a single aggregated line from PO amount
        synthesized.push({
          id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          product: `${po.ref} — Goods received`,
          warehouse: targetWh,
          uom: "PCS",
          qty: 1,
          rate: po.amount,
          discount: 0, discountMode: "%",
          poRef: po.ref,
        });
      }
    });
    const existing = v.items.filter((it: LineItem) => it.product);
    setV((p: any) => ({
      ...p,
      linkedPOs: Array.from(new Set([...(p.linkedPOs || []), ...refs])),
      po: Array.from(new Set([...(p.linkedPOs || []), ...refs])).join(", "),
      items: existing.length === 0 ? synthesized : [...existing, ...synthesized],
    }));
  }

  function removeLinkedPO(ref: string) {
    setV((p: any) => {
      const linked = (p.linkedPOs || []).filter((r: string) => r !== ref);
      return {
        ...p,
        linkedPOs: linked,
        po: linked.join(", "),
        items: p.items.filter((it: LineItem) => it.poRef !== ref).length === 0
          ? [newLine(p.branch)]
          : p.items.filter((it: LineItem) => it.poRef !== ref),
      };
    });
  }

  const lineLevel = v.priceLevel === "At Line Item Level";
  const totals = useMemo(() => {
    const lines = v.items.map((it: LineItem) => Number(it.qty) * Number(it.rate));
    const subTotal = lines.reduce((s: number, n: number) => s + n, 0);
    let discAmt = 0;
    if (lineLevel) {
      discAmt = v.items.reduce((s: number, it: LineItem) => {
        const lineAmt = Number(it.qty) * Number(it.rate);
        const d = Number(it.discount || 0);
        return s + (it.discountMode === "Rs." ? d : lineAmt * (d / 100));
      }, 0);
    } else {
      discAmt = v.discountMode === "%" ? subTotal * (Number(v.discount || 0) / 100) : Number(v.discount || 0);
    }
    const shipping = Number(v.shipping || 0);
    const grand = Math.max(0, subTotal - discAmt + shipping);
    return { subTotal, discAmt, shipping, grand };
  }, [v.items, v.discount, v.discountMode, v.shipping, lineLevel]);

  function validate(): boolean {
    if (!v.supplier) { setError("Vendor Name is required"); return false; }
    if (!v.ref.trim()) { setError("Bill # is required"); return false; }
    if (!v.date) { setError("Bill Date is required"); return false; }
    if (v.items.length === 0 || v.items.some((it: LineItem) => !it.product)) {
      setError("Add at least one line item with an item selected");
      return false;
    }
    setError(null);
    return true;
  }

  function handleSave(nextStatus?: string) {
    if (!validate()) return;
    onSubmit({
      ...v,
      status: nextStatus ?? v.status ?? "Open",
      amount: Math.round(totals.grand),
      outstanding: Math.round(totals.grand),
      subTotal: Math.round(totals.subTotal),
    });
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).slice(0, 10).map((f) => ({ name: f.name, size: f.size }));
    set("files", [...v.files, ...next].slice(0, 10));
  }

  return (
    <div className="space-y-0 pb-28 w-full lg:w-3/4">
      <div className="mb-4 text-xs text-muted-foreground">
        Fields marked with <span className="text-destructive">*</span> are required.
      </div>

      <Card>
        <Row label="Vendor Name" required tone="muted">
          <div className="flex items-center gap-3 flex-wrap">
            <ComboInput
              value={v.supplier}
              onChange={(val) => set("supplier", val)}
              options={[...extraVendors, ...SUPPLIERS]}
              placeholder="Select a Vendor"
              withSearchButton
              onNewVendor={() => setNewVendorOpen(true)}
            />
            <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-sm font-semibold text-foreground">
              <span className="h-4 w-4 rounded-full bg-success/20 text-success grid place-items-center text-[10px] font-bold">₨</span>
              Rs.
            </span>
          </div>
        </Row>

        {/* Open PO selector — appears once vendor is selected */}
        {v.supplier && (
          <Row label="Open Purchase Orders" tone="muted">
            <div className="space-y-2">
              {(v.linkedPOs && v.linkedPOs.length > 0) ? (
                <div className="flex flex-wrap gap-2">
                  {v.linkedPOs.map((ref: string) => (
                    <span key={ref} className="inline-flex items-center gap-1.5 h-7 pl-2 pr-1 rounded-md border border-primary/30 bg-primary/5 text-xs font-semibold text-primary">
                      <Link2 className="h-3 w-3" />
                      {ref}
                      <button type="button" onClick={() => removeLinkedPO(ref)} className="h-5 w-5 grid place-items-center rounded hover:bg-primary/10">
                        <X className="h-3 w-3" />
                      </button>
                    </span>
                  ))}
                  <button
                    type="button"
                    onClick={() => setPoDialogOpen(true)}
                    className="h-7 px-2.5 inline-flex items-center gap-1 rounded-md border border-dashed border-border text-xs font-semibold text-primary hover:bg-muted"
                  >
                    <Plus className="h-3 w-3" /> Add more
                  </button>
                </div>
              ) : openPOs.length > 0 ? (
                <button
                  type="button"
                  onClick={() => setPoDialogOpen(true)}
                  className="inline-flex items-center gap-2 px-3 py-2 rounded-md border border-dashed border-warning/40 bg-warning/10 text-sm text-foreground hover:bg-warning/15"
                >
                  Include <span className="font-bold text-primary underline">{openPOs.length} Open Purchase Order{openPOs.length === 1 ? "" : "s"}</span> against this vendor
                </button>
              ) : (
                <div className="text-xs text-muted-foreground">No open purchase orders against this vendor.</div>
              )}
              <p className="text-[11px] text-muted-foreground">Linking a PO will pre-fill items, quantities and rates from that order.</p>
            </div>
          </Row>
        )}

        <Row label="Bill#" required>
          <div className="flex items-center gap-2 max-w-sm">
            <BaseInput value={v.ref} onChange={(e) => set("ref", e.target.value)} className="flex-1" />
            <button type="button" onClick={() => setBillPrefsOpen(true)} title="Bill numbering settings" className="h-9 w-9 grid place-items-center rounded-md border border-border bg-card text-primary hover:bg-muted">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </Row>

        <Row label="Order Number">
          <BaseInput value={v.orderNumber} onChange={(e) => set("orderNumber", e.target.value)} className="max-w-sm" placeholder="External / Vendor Order #" />
        </Row>

        <Row label="Bill Date" required>
          <DateInput value={v.date} onChange={(val) => set("date", val)} />
        </Row>

        <RowSplit
          left={{
            label: "Due Date",
            content: <DateInput value={v.due} onChange={(val) => set("due", val)} placeholder="dd MMM yyyy" />,
          }}
          right={{
            label: "Payment Terms",
            content: <NativeSelect value={v.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} options={PAYMENT_TERMS} className="w-full max-w-sm" />,
          }}
        />

        <Row label="Receiving Branch / Warehouse" required>
          <NativeSelect
            value={v.branch}
            onChange={(e) => set("branch", e.target.value)}
            options={WAREHOUSES}
            className="max-w-sm"
          />
        </Row>
      </Card>

      {/* Item table */}
      <div className="mt-6">
        <div className="flex items-center gap-2 mb-2">
          <NativeSelect value={v.priceLevel} onChange={(e) => set("priceLevel", e.target.value)} options={PRICE_LEVELS} className="w-52" />
        </div>

        <section className="rounded-xl border border-border bg-card overflow-hidden">
          <header className="flex items-center px-4 py-2.5 bg-muted/40 border-b border-border">
            <h3 className="text-sm font-bold text-foreground">Item Table</h3>
          </header>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase font-bold text-muted-foreground bg-muted/20">
                <tr>
                  <th className="w-8"></th>
                  <th className="text-left px-3 py-2.5 min-w-[240px]">Item Details</th>
                  <th className="text-left px-3 py-2.5 w-44">Warehouse / Branch</th>
                  <th className="text-left px-3 py-2.5 w-28">Unit</th>
                  <th className="text-right px-3 py-2.5 w-24">Quantity</th>
                  <th className="text-right px-3 py-2.5 w-28">Rate</th>
                  {lineLevel && <th className="text-right px-3 py-2.5 w-36">Discount</th>}
                  <th className="text-right px-3 py-2.5 w-32">Amount</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {v.items.map((it: LineItem) => {
                  const lineAmt = Number(it.qty) * Number(it.rate);
                  const lineDisc = it.discountMode === "Rs."
                    ? Number(it.discount || 0)
                    : lineAmt * (Number(it.discount || 0) / 100);
                  const amt = lineLevel ? Math.max(0, lineAmt - lineDisc) : lineAmt;
                  return (
                    <tr
                      key={it.id}
                      className={`align-top transition-colors ${dragOverId === it.id && dragId !== it.id ? "bg-primary/5" : ""} ${dragId === it.id ? "opacity-50" : ""}`}
                      onDragOver={(e) => { if (dragId) { e.preventDefault(); setDragOverId(it.id); } }}
                      onDragLeave={() => { if (dragOverId === it.id) setDragOverId(null); }}
                      onDrop={(e) => { e.preventDefault(); if (dragId) moveItem(dragId, it.id); setDragId(null); setDragOverId(null); }}
                    >
                      <td
                        className="px-2 py-3 text-muted-foreground"
                        draggable
                        onDragStart={(e) => { setDragId(it.id); e.dataTransfer.effectAllowed = "move"; }}
                        onDragEnd={() => { setDragId(null); setDragOverId(null); }}
                      >
                        <GripVertical className="h-4 w-4 cursor-grab active:cursor-grabbing" />
                      </td>
                      <td className="px-3 py-2.5">
                        <ProductPicker
                          value={it.product}
                          onChange={(p) => updateItem(it.id, { product: p.name, rate: p.rate || it.rate })}
                          products={PRODUCTS}
                        />
                        {it.poRef && (
                          <div className="mt-1 inline-flex items-center gap-1 text-[10px] font-semibold text-primary">
                            <Link2 className="h-2.5 w-2.5" /> from {it.poRef}
                          </div>
                        )}
                        <input
                          value={it.description ?? ""}
                          onChange={(e) => updateItem(it.id, { description: e.target.value })}
                          placeholder="Description (optional)"
                          className="w-full h-8 mt-1.5 px-2.5 rounded-md border border-border bg-card text-xs text-muted-foreground"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <NativeSelect
                          value={it.warehouse || v.branch}
                          onChange={(e) => updateItem(it.id, { warehouse: e.target.value })}
                          options={WAREHOUSES}
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <NativeSelect
                          value={it.uom}
                          onChange={(e) => updateItem(it.id, { uom: e.target.value })}
                          options={UOMS}
                          className="w-full"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <input type="number" min={0} value={it.qty}
                          onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })}
                          className="w-full h-9 px-2 rounded-md border border-border bg-card text-sm text-right" />
                      </td>
                      <td className="px-3 py-2.5">
                        <input type="number" min={0} step="0.01" value={it.rate}
                          onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })}
                          className="w-full h-9 px-2 rounded-md border border-border bg-card text-sm text-right" />
                      </td>
                      {lineLevel && (
                        <td className="px-3 py-2.5">
                          <div className="inline-flex items-stretch h-9 w-full rounded-md border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40">
                            <input
                              type="number" min={0} value={it.discount ?? 0}
                              onChange={(e) => updateItem(it.id, { discount: Number(e.target.value) })}
                              className="flex-1 min-w-0 px-2 bg-transparent text-sm text-right outline-none"
                            />
                            <div className="w-px bg-border" />
                            <select
                              value={it.discountMode ?? "%"}
                              onChange={(e) => updateItem(it.id, { discountMode: e.target.value })}
                              className="h-full pl-2 pr-5 bg-muted/40 text-sm font-medium outline-none cursor-pointer"
                            >
                              <option value="%">%</option>
                              <option value="Rs.">Rs.</option>
                            </select>
                          </div>
                        </td>
                      )}
                      <td className="px-3 py-2.5 text-right font-bold text-foreground">
                        {amt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                      <td className="px-2 py-2.5 text-right">
                        <button type="button" onClick={() => removeItem(it.id)} className="text-destructive hover:opacity-80" title="Remove line">
                          <X className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-border bg-muted/20 flex flex-wrap gap-2">
            <button type="button" onClick={addItem} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10">
              <Plus className="h-3.5 w-3.5" /> Add New Row
            </button>
            {v.supplier && openPOs.length > 0 && v.linkedPOs.length < openPOs.length && (
              <button type="button" onClick={() => setPoDialogOpen(true)} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-warning/30 bg-warning/10 text-foreground text-xs font-semibold hover:bg-warning/15">
                <Link2 className="h-3.5 w-3.5 text-primary" />
                Include {openPOs.length - v.linkedPOs.length} Open Purchase Order{openPOs.length - v.linkedPOs.length === 1 ? "" : "s"}
              </button>
            )}
          </div>
        </section>
      </div>

      {/* Notes + Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div>
          <label className="block text-sm text-foreground mb-1.5">Vendor Notes</label>
          <textarea
            value={v.notes} onChange={(e) => set("notes", e.target.value)} rows={4}
            placeholder="Will be displayed on the bill"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 self-start">
          <SummaryRow label="Sub Total" value={totals.subTotal} bold />
          {!lineLevel && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Discount</span>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-stretch h-9 rounded-md border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40">
                  <input type="number" min={0} value={v.discount}
                    onChange={(e) => set("discount", Number(e.target.value))}
                    className="w-24 px-2 bg-transparent text-sm text-right outline-none" />
                  <div className="w-px bg-border" />
                  <select value={v.discountMode} onChange={(e) => set("discountMode", e.target.value)}
                    className="h-full pl-2 pr-5 bg-muted/40 text-sm font-medium outline-none cursor-pointer">
                    <option value="%">%</option>
                    <option value="Rs.">Rs.</option>
                  </select>
                </div>
                <span className="w-24 text-right text-sm font-semibold text-destructive">
                  −{totals.discAmt.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
              </div>
            </div>
          )}
          <div className="flex items-center justify-between gap-3">
            <span className="text-sm text-muted-foreground">Shipping / Freight</span>
            <input type="number" min={0} value={v.shipping}
              onChange={(e) => set("shipping", Number(e.target.value))}
              className="w-32 h-8 px-2 rounded-md border border-border bg-card text-sm text-right" />
          </div>
          <div className="border-t border-border pt-3 flex items-center justify-between">
            <span className="text-sm font-bold text-foreground">Total</span>
            <span className="text-lg font-bold text-primary">
              Rs. {totals.grand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </span>
          </div>
        </div>
      </div>

      {/* Terms + Files */}
      <div className="mt-5 rounded-xl border border-border bg-card">
        <div className="grid grid-cols-1 lg:grid-cols-2 lg:divide-x divide-border">
          <div className="p-5">
            <label className="block text-sm text-foreground mb-1.5">Terms &amp; Conditions</label>
            <textarea
              value={v.terms} onChange={(e) => set("terms", e.target.value)} rows={4}
              placeholder="Enter the terms and conditions of your business to be displayed in your transaction"
              className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          <div className="p-5">
            <FileAttach files={v.files} onAdd={onFiles} onRemove={(idx) => set("files", v.files.filter((_: any, i: number) => i !== idx))} />
          </div>
        </div>
      </div>

      {/* Sticky footer */}
      <div className={`${pageMode ? "fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-w,16rem)] z-30" : "sticky bottom-0"} border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-3 mt-6`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs">
            {error
              ? <span className="text-destructive font-semibold">{error}</span>
              : <span className="text-muted-foreground">Total: <span className="font-bold text-foreground">Rs. {totals.grand.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="button" onClick={() => handleSave("Draft")}
              className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted inline-flex items-center gap-2">
              <Save className="h-4 w-4" /> Save as Draft
            </button>
            <button type="button" onClick={() => handleSave("Open")}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> {isEdit ? "Save Changes" : "Save Bill"}
            </button>
          </div>
        </div>
      </div>

      {/* Bill # preferences */}
      <Dialog open={billPrefsOpen} onOpenChange={setBillPrefsOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-muted/40 border-b border-border">
            <DialogTitle className="text-base">Configure Bill# Preferences</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" checked={billMode === "auto"} onChange={() => setBillMode("auto")} className="mt-0.5 accent-primary" />
              <span className="text-sm font-semibold text-foreground">Continue auto-generating bill numbers</span>
            </label>
            {billMode === "auto" && (
              <div className="ml-6 grid grid-cols-2 gap-3 max-w-sm">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Prefix</label>
                  <input value={billPrefix} onChange={(e) => setBillPrefix(e.target.value)}
                    className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Next Number</label>
                  <input value={billNext} onChange={(e) => setBillNext(e.target.value)}
                    className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm" />
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={billMode === "manual"} onChange={() => setBillMode("manual")} className="accent-primary" />
              <span className="text-sm font-semibold text-foreground">Enter bill numbers manually</span>
            </label>
          </div>
          <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 sm:justify-start gap-2">
            <button type="button" onClick={() => { if (billMode === "auto") set("ref", `${billPrefix}${billNext}`); setBillPrefsOpen(false); }}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">Save</button>
            <button type="button" onClick={() => setBillPrefsOpen(false)}
              className="h-9 px-4 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <NewVendorModal
        open={newVendorOpen}
        onOpenChange={setNewVendorOpen}
        onCreate={(displayName) => {
          setExtraVendors((prev) => prev.includes(displayName) ? prev : [displayName, ...prev]);
          set("supplier", displayName);
        }}
      />

      <OpenPODialog
        open={poDialogOpen}
        onOpenChange={setPoDialogOpen}
        pos={openPOs.filter((p) => !v.linkedPOs.includes(p.ref))}
        onAdd={(picks) => { applyLinkedPOs(picks); setPoDialogOpen(false); }}
      />
    </div>
  );
}

/* ---------------- shared bits (local) ---------------- */

function Card({ children }: { children: ReactNode }) {
  return <section className="rounded-xl border border-border bg-card">{children}</section>;
}
function Row({ label, required, tone, children }: { label: string; required?: boolean; tone?: "muted"; children: ReactNode }) {
  return (
    <div className={`grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-6 px-4 sm:px-5 py-3.5 ${tone === "muted" ? "bg-muted/20" : ""}`}>
      <label className="text-sm pt-2 text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div>{children}</div>
    </div>
  );
}
function RowSplit({ left, right }: { left: { label: string; required?: boolean; content: ReactNode }; right: { label: string; required?: boolean; content: ReactNode } }) {
  return (
    <div className="px-4 sm:px-5 py-3.5 grid grid-cols-1 lg:grid-cols-2 gap-x-8 gap-y-3">
      <div className="grid grid-cols-1 md:grid-cols-[220px_1fr] gap-2 md:gap-6">
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
  return <input {...props} className={`h-9 px-2.5 rounded-md border border-border bg-card text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary ${className}`} />;
}
function NativeSelect({ value, onChange, options, placeholder, className = "" }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <select value={value} onChange={onChange}
        className="appearance-none w-full h-9 pl-2.5 pr-8 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
function ComboInput({ value, onChange, options, placeholder, withSearchButton, onNewVendor }: { value: string; onChange: (val: string) => void; options: string[]; placeholder?: string; withSearchButton?: boolean; onNewVendor?: () => void; }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const q = (query || value || "").toLowerCase();
  const filtered = options.filter((o) => o.toLowerCase().includes(q));
  return (
    <div ref={wrapRef} className="relative flex items-stretch flex-1 min-w-[280px] max-w-xl">
      <div className="relative flex-1">
        <input value={value} onFocus={() => setOpen(true)} onClick={() => setOpen(true)}
          onChange={(e) => { onChange(e.target.value); setQuery(e.target.value); setOpen(true); }}
          placeholder={placeholder}
          className="h-10 w-full pl-3 pr-9 rounded-l-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        {open && (
          <div className="absolute z-40 left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
            <ul className="max-h-72 overflow-auto py-1">
              {filtered.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">No vendors found</li>}
              {filtered.map((o) => (
                <li key={o}>
                  <button type="button" onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                    className={`w-full px-3 py-2.5 text-left text-sm ${o === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    {o}
                  </button>
                </li>
              ))}
            </ul>
            {onNewVendor && (
              <button type="button" onClick={() => { setOpen(false); onNewVendor?.(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-border text-sm font-semibold text-primary hover:bg-muted">
                <Plus className="h-4 w-4" /> New Vendor
              </button>
            )}
          </div>
        )}
      </div>
      {withSearchButton && (
        <button type="button" onClick={() => setOpen((o) => !o)}
          className="h-10 w-10 grid place-items-center rounded-r-md bg-primary text-primary-foreground hover:bg-primary/90 border border-primary">
          <Search className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
function DateInput({ value, onChange, placeholder, min }: { value: string; onChange: (val: string) => void; placeholder?: string; min?: string }) {
  return (
    <div className="max-w-sm">
      <input type="date" value={value} min={min} onChange={(e) => onChange(e.target.value)}
        className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder={placeholder} />
      {value && <div className="text-[11px] text-muted-foreground mt-1">{fmtDate(value)}</div>}
    </div>
  );
}
function SummaryRow({ label, value, bold }: { label: string; value: number; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className={`text-sm ${bold ? "text-foreground font-semibold" : "text-muted-foreground"}`}>{label}</span>
      <span className={`text-sm ${bold ? "font-bold text-foreground" : "font-semibold text-foreground"}`}>
        {value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
      </span>
    </div>
  );
}
function FileAttach({ files, onAdd, onRemove }: { files: { name: string; size: number }[]; onAdd: (f: FileList | null) => void; onRemove: (idx: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm text-foreground mb-1.5">Attach File(s) to Bill</label>
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-3">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted">
          <Paperclip className="h-3.5 w-3.5" /> Upload File
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onAdd(e.target.files)} />
        <p className="text-[11px] text-muted-foreground mt-1.5">You can upload a maximum of 10 files, 10MB each</p>
        {files.length > 0 && (
          <ul className="mt-2 space-y-1">
            {files.map((f, idx) => (
              <li key={idx} className="flex items-center justify-between text-xs bg-card border border-border rounded px-2 py-1">
                <span className="truncate">{f.name}</span>
                <button type="button" onClick={() => onRemove(idx)} className="text-destructive hover:opacity-80">
                  <Trash2 className="h-3 w-3" />
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
function ProductPicker({ value, onChange, products }: { value: string; onChange: (p: Product) => void; products: Product[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const q = query.toLowerCase();
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  return (
    <div ref={ref} className="relative">
      <input value={value} readOnly onClick={() => setOpen((o) => !o)}
        placeholder="Type or click to select an item."
        className="w-full h-9 px-2.5 pr-8 rounded-md border border-border bg-card text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary" />
      <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 top-[18px] -translate-y-1/2 pointer-events-none" />
      {open && (
        <div className="absolute z-40 left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search items"
              className="h-9 w-full px-3 rounded-md border border-primary bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
          <ul className="max-h-72 overflow-auto">
            {filtered.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">No items found</li>}
            {filtered.map((p) => (
              <li key={p.sku}>
                <button type="button" onClick={() => { onChange(p); setOpen(false); setQuery(""); }}
                  className={`w-full text-left px-3 py-2.5 border-b border-border last:border-b-0 ${p.name === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                  <div className="text-sm font-semibold truncate">{p.name}</div>
                  <div className={`text-xs mt-0.5 truncate ${p.name === value ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                    SKU: {p.sku} · Rate: Rs. {p.rate.toLocaleString()}
                  </div>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

function OpenPODialog({ open, onOpenChange, pos, onAdd }: { open: boolean; onOpenChange: (o: boolean) => void; pos: OpenPO[]; onAdd: (picks: OpenPO[]) => void }) {
  const [sel, setSel] = useState<Record<string, boolean>>({});
  useEffect(() => { if (!open) setSel({}); }, [open]);
  const allChecked = pos.length > 0 && pos.every((p) => sel[p.id]);
  const toggleAll = () => {
    if (allChecked) setSel({});
    else setSel(Object.fromEntries(pos.map((p) => [p.id, true])));
  };
  const picks = pos.filter((p) => sel[p.id]);
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-muted/40 border-b border-border">
          <DialogTitle className="text-base">Open Purchase Orders</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-auto">
          {pos.length === 0 ? (
            <div className="px-6 py-10 text-center text-sm text-muted-foreground">No open purchase orders against this vendor.</div>
          ) : (
            <table className="w-full text-sm">
              <thead className="text-[11px] uppercase font-bold text-muted-foreground bg-muted/30 sticky top-0">
                <tr>
                  <th className="text-left px-4 py-2.5 w-10">
                    <button type="button" onClick={toggleAll} className={`h-4 w-4 grid place-items-center rounded border ${allChecked ? "bg-primary border-primary text-primary-foreground" : "border-border bg-card"}`}>
                      {allChecked && <Check className="h-3 w-3" />}
                    </button>
                  </th>
                  <th className="text-left px-3 py-2.5">Purchase Order Details</th>
                  <th className="text-left px-3 py-2.5 w-32">Date</th>
                  <th className="text-right px-4 py-2.5 w-32">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {pos.map((p) => {
                  const checked = !!sel[p.id];
                  return (
                    <tr key={p.id} className={`cursor-pointer ${checked ? "bg-primary/5" : "hover:bg-muted/40"}`}
                      onClick={() => setSel((s) => ({ ...s, [p.id]: !s[p.id] }))}>
                      <td className="px-4 py-3">
                        <span className={`h-4 w-4 grid place-items-center rounded border ${checked ? "bg-primary border-primary text-primary-foreground" : "border-border bg-card"}`}>
                          {checked && <Check className="h-3 w-3" />}
                        </span>
                      </td>
                      <td className="px-3 py-3">
                        <div className="font-semibold text-foreground inline-flex items-center gap-2">
                          <Receipt className="h-3.5 w-3.5 text-primary" /> {p.ref}
                          {p.referenceNo && <span className="text-xs text-muted-foreground font-medium">| Reference#: {p.referenceNo}</span>}
                        </div>
                        <div className="text-[11px] text-muted-foreground mt-0.5">Status: {p.status}</div>
                      </td>
                      <td className="px-3 py-3 text-muted-foreground">{fmtDate(p.date)}</td>
                      <td className="px-4 py-3 text-right font-semibold tabular-nums">Rs. {p.amount.toLocaleString()}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 sm:justify-start gap-2">
          <button type="button" disabled={picks.length === 0} onClick={() => onAdd(picks)}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50">
            Add {picks.length > 0 ? `(${picks.length})` : ""}
          </button>
          <button type="button" onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
            Cancel
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
