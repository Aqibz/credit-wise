import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  Plus, Save, ChevronDown, Search, Settings2, Paperclip,
  GripVertical, X, Send, Trash2,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { INVOICES, INVOICE_STATUSES, BRANCHES, SALE_TYPES } from "@/lib/mocks/sales";

const CUSTOMERS = Array.from(new Set(INVOICES.map((i) => i.customer))).sort();
const SALESMEN = Array.from(new Set(INVOICES.map((i) => i.salesman))).sort();
const PAYMENT_TERMS = ["Due on Receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Advance", "COD"];
const PRICE_LEVELS = ["At Transaction Level", "At Line Item Level"];
const UOMS = ["PCS", "BOX", "CTN", "KG", "LTR", "MTR", "SET"];

type Product = { name: string; sku: string; rate: number };
const PRODUCTS: Product[] = [
  { name: "Samsung LED TV 55\"", sku: "SAM-LED-55", rate: 149999 },
  { name: "Gree 1.5 Ton AC", sku: "GREE-AC15", rate: 168000 },
  { name: "iPhone 15 Pro 256GB", sku: "APL-IP15P-256", rate: 380000 },
  { name: "Haier 18kg Washer", sku: "HAI-WM-18", rate: 120000 },
  { name: "Sony Headphones WH-1000", sku: "SNY-WH1000", rate: 78000 },
  { name: "Dawlance Inverter AC 1.5T", sku: "DAW-AC15-INV", rate: 220000 },
  { name: "LG Refrigerator 18cu", sku: "LG-REF-18", rate: 195000 },
  { name: "PEL Microwave 30L", sku: "PEL-MW-30", rate: 58000 },
  { name: "Orient 1.5 Ton AC", sku: "ORI-AC15", rate: 175000 },
  { name: "Vivo Y28 5G", sku: "VVO-Y28-5G", rate: 64500 },
];

type LineItem = {
  id: string;
  product: string;
  description?: string;
  uom: string;
  qty: number;
  rate: number;
  discount?: number;
  discountMode?: string;
};

const newLine = (): LineItem => ({
  id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  product: "", uom: "PCS", qty: 1, rate: 0, discount: 0, discountMode: "%",
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

export function InvoiceForm({
  initial, onClose, onSubmit, isEdit, pageMode,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;
}) {
  const [v, setV] = useState<any>(() => ({
    ref: initial?.invoice ?? initial?.ref ?? "",
    orderNumber: initial?.orderNumber ?? "",
    date: initial?.date ?? todayISO(),
    due: initial?.due ?? "",
    customer: initial?.customer ?? "",
    branch: initial?.branch ?? BRANCHES[0],
    salesman: initial?.salesman ?? "",
    saleType: initial?.type ?? initial?.saleType ?? "Cash",
    paymentTerms: initial?.paymentTerms ?? "Due on Receipt",
    priceLevel: initial?.priceLevel ?? "At Transaction Level",
    status: initial?.status ?? "Partially Paid",
    items: (initial?.items as LineItem[]) ?? [newLine()],
    discount: initial?.discount ?? 0,
    discountMode: initial?.discountMode ?? "%",
    shipping: initial?.shipping ?? 0,
    notes: initial?.notes ?? "",
    terms: initial?.terms ?? "",
    files: (initial?.files as { name: string; size: number }[]) ?? [],
  }));
  const [error, setError] = useState<string | null>(null);
  const [invPrefsOpen, setInvPrefsOpen] = useState(false);
  const [invMode, setInvMode] = useState<"auto" | "manual">("auto");
  const [invPrefix, setInvPrefix] = useState("INV-");
  const [invNext, setInvNext] = useState("7013");
  const [extraCustomers, setExtraCustomers] = useState<string[]>([]);

  useEffect(() => {
    if (initial) return;
    setV((prev: any) => ({ ...prev, ref: prev.ref || `INV-${String(Math.floor(Math.random() * 9000) + 7000)}` }));
  }, [initial]);

  // Auto-compute due date
  useEffect(() => {
    if (!v.date) return;
    const days = termsToDays(v.paymentTerms);
    setV((prev: any) => ({ ...prev, due: addDaysISO(prev.date, days) }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [v.date, v.paymentTerms]);

  function set<K extends keyof typeof v>(k: K, val: any) { setV((p: any) => ({ ...p, [k]: val })); }

  const addItem = () => set("items", [...v.items, newLine()]);
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
    if (!v.customer) { setError("Customer Name is required"); return false; }
    if (!v.ref.trim()) { setError("Invoice # is required"); return false; }
    if (!v.date) { setError("Invoice Date is required"); return false; }
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
      status: nextStatus ?? v.status ?? "Partially Paid",
      amount: Math.round(totals.grand),
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
        <Row label="Customer Name" required tone="muted">
          <ComboInput
            value={v.customer}
            onChange={(val) => set("customer", val)}
            options={[...extraCustomers, ...CUSTOMERS]}
            placeholder="Select a Customer"
            withSearchButton
            onNewItem={() => {
              const name = window.prompt("New customer name");
              if (name && name.trim()) {
                const n = name.trim();
                setExtraCustomers((prev) => prev.includes(n) ? prev : [n, ...prev]);
                set("customer", n);
              }
            }}
            newLabel="New Customer"
            emptyLabel="No customers found"
          />
        </Row>

        <Row label="Invoice#" required>
          <div className="flex items-center gap-2 max-w-sm">
            <BaseInput value={v.ref} onChange={(e) => set("ref", e.target.value)} className="flex-1" />
            <button type="button" onClick={() => setInvPrefsOpen(true)} title="Invoice numbering settings" className="h-9 w-9 grid place-items-center rounded-md border border-border bg-card text-primary hover:bg-muted">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </Row>

        <Row label="Order Number">
          <BaseInput value={v.orderNumber} onChange={(e) => set("orderNumber", e.target.value)} className="max-w-sm" placeholder="External / Sales Order #" />
        </Row>

        <Row label="Invoice Date" required>
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

        <RowSplit
          left={{
            label: "Sale Type", required: true,
            content: <NativeSelect value={v.saleType} onChange={(e) => set("saleType", e.target.value)} options={[...SALE_TYPES]} className="w-full max-w-sm" />,
          }}
          right={{
            label: "Status",
            content: <NativeSelect value={v.status} onChange={(e) => set("status", e.target.value)} options={[...INVOICE_STATUSES]} className="w-full max-w-sm" />,
          }}
        />

        <RowSplit
          left={{
            label: "Branch", required: true,
            content: <NativeSelect value={v.branch} onChange={(e) => set("branch", e.target.value)} options={[...BRANCHES]} className="w-full max-w-sm" />,
          }}
          right={{
            label: "Salesman",
            content: <NativeSelect value={v.salesman} onChange={(e) => set("salesman", e.target.value)} options={SALESMEN} placeholder="Select a salesman" className="w-full max-w-sm" />,
          }}
        />
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
                  <th className="text-left px-3 py-2.5 min-w-[260px]">Item Details</th>
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
                        <input
                          value={it.description ?? ""}
                          onChange={(e) => updateItem(it.id, { description: e.target.value })}
                          placeholder="Description (optional)"
                          className="w-full h-8 mt-1.5 px-2.5 rounded-md border border-border bg-card text-xs text-muted-foreground"
                        />
                      </td>
                      <td className="px-3 py-2.5">
                        <NativeSelect value={it.uom} onChange={(e) => updateItem(it.id, { uom: e.target.value })} options={UOMS} className="w-full" />
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
                            <input type="number" min={0} value={it.discount ?? 0}
                              onChange={(e) => updateItem(it.id, { discount: Number(e.target.value) })}
                              className="flex-1 min-w-0 px-2 bg-transparent text-sm text-right outline-none" />
                            <div className="w-px bg-border" />
                            <select value={it.discountMode ?? "%"} onChange={(e) => updateItem(it.id, { discountMode: e.target.value })}
                              className="h-full pl-2 pr-5 bg-muted/40 text-sm font-medium outline-none cursor-pointer">
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
          </div>
        </section>
      </div>

      {/* Notes + Totals */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mt-5">
        <div>
          <label className="block text-sm text-foreground mb-1.5">Customer Notes</label>
          <textarea
            value={v.notes} onChange={(e) => set("notes", e.target.value)} rows={4}
            placeholder="Will be displayed on the invoice"
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
            <button type="button" onClick={() => handleSave("Partially Paid")}
              className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted inline-flex items-center gap-2">
              <Save className="h-4 w-4" /> Save as Draft
            </button>
            <button type="button" onClick={() => handleSave(v.status)}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> {isEdit ? "Save Changes" : "Save Invoice"}
            </button>
          </div>
        </div>
      </div>

      {/* Invoice # preferences */}
      <Dialog open={invPrefsOpen} onOpenChange={setInvPrefsOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-muted/40 border-b border-border">
            <DialogTitle className="text-base">Configure Invoice# Preferences</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" checked={invMode === "auto"} onChange={() => setInvMode("auto")} className="mt-0.5 accent-primary" />
              <span className="text-sm font-semibold text-foreground">Continue auto-generating invoice numbers</span>
            </label>
            {invMode === "auto" && (
              <div className="ml-6 grid grid-cols-2 gap-3 max-w-sm">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Prefix</label>
                  <input value={invPrefix} onChange={(e) => setInvPrefix(e.target.value)}
                    className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Next Number</label>
                  <input value={invNext} onChange={(e) => setInvNext(e.target.value)}
                    className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm" />
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={invMode === "manual"} onChange={() => setInvMode("manual")} className="accent-primary" />
              <span className="text-sm font-semibold text-foreground">Enter invoice numbers manually</span>
            </label>
          </div>
          <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 sm:justify-start gap-2">
            <button type="button" onClick={() => { if (invMode === "auto") set("ref", `${invPrefix}${invNext}`); setInvPrefsOpen(false); }}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">Save</button>
            <button type="button" onClick={() => setInvPrefsOpen(false)}
              className="h-9 px-4 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
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
  return <input {...props} className={`h-9 px-3 rounded-md border border-border bg-card text-sm w-full focus:outline-none focus:ring-1 focus:ring-primary ${className}`} />;
}
function NativeSelect({ value, onChange, options, placeholder, className = "" }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: string[]; placeholder?: string; className?: string }) {
  return (
    <div className={`relative ${className}`}>
      <select value={value} onChange={onChange}
        className="appearance-none w-full h-9 pl-3 pr-8 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary">
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
function ComboInput({ value, onChange, options, placeholder, withSearchButton, onNewItem, newLabel, emptyLabel }: { value: string; onChange: (val: string) => void; options: string[]; placeholder?: string; withSearchButton?: boolean; onNewItem?: () => void; newLabel?: string; emptyLabel?: string; }) {
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
              {filtered.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">{emptyLabel ?? "No results"}</li>}
              {filtered.map((o) => (
                <li key={o}>
                  <button type="button" onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                    className={`w-full px-3 py-2.5 text-left text-sm ${o === value ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}>
                    {o}
                  </button>
                </li>
              ))}
            </ul>
            {onNewItem && (
              <button type="button" onClick={() => { setOpen(false); onNewItem?.(); }}
                className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-border text-sm font-semibold text-primary hover:bg-muted">
                <Plus className="h-4 w-4" /> {newLabel ?? "Add New"}
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
        className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
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
      <label className="block text-sm text-foreground mb-1.5">Attach File(s) to Invoice</label>
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
