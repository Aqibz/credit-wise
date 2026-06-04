import { useEffect, useMemo, useRef, useState } from "react";
import type { ReactNode } from "react";
import {
  Plus, Trash2, Save, ChevronDown, Search, Settings2, Paperclip,
  GripVertical, X, Pencil, MapPin, Send, Info, Check,
} from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { NewVendorModal } from "@/components/NewVendorModal";

const SUPPLIERS = [
  "DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd",
  "Samsung Pakistan", "Sony Distributors",
];
const BRANCHES = [
  { name: "Main Warehouse", address: "Plot 14, Industrial Estate", city: "Lahore, Punjab 54000", phone: "+92 42 111-222-333" },
  { name: "Model Town", address: "Block C, Model Town", city: "Lahore, Punjab 54700", phone: "+92 42 555-1010" },
  { name: "Gulberg", address: "MM Alam Road, Gulberg III", city: "Lahore, Punjab 54660", phone: "+92 42 333-4040" },
  { name: "DHA Phase 5", address: "Sector H, DHA Phase 5", city: "Lahore, Punjab 54810", phone: "+92 42 777-9090" },
  { name: "Johar Town", address: "Khayaban-e-Firdousi, Johar Town", city: "Lahore, Punjab 54600", phone: "+92 42 222-6060" },
];
const STATUSES = ["Draft", "Pending", "Approved", "Received", "Cancelled"];
const PAYMENT_TERMS = ["Due on Receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Advance", "COD"];
const SHIPMENT_PREFERENCES = ["Standard Delivery", "Express Delivery", "Self Pick-Up", "Third-Party Courier", "Supplier Arranged"];
const PRICE_LEVELS = ["At Transaction Level", "At Line Item Level"];
const ACCOUNTS = ["Inventory - Stock in Hand", "Cost of Goods Sold", "Office Supplies", "Equipment", "Freight & Handling"];
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
  account?: string;
  uom: string;
  qty: number;
  rate: number;
  discount?: number;
  discountMode?: string;
  tax?: number;
};

const newLine = (): LineItem => ({
  id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
  product: "", account: "", uom: "PCS", qty: 1, rate: 0, discount: 0, discountMode: "%", tax: 0,
});

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso: string) => {
  if (!iso) return "";
  try {
    return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
  } catch { return iso; }
};

export function PurchaseOrderForm({
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
    referenceNo: initial?.referenceNo ?? "",
    date: initial?.date ?? todayISO(),
    expected: initial?.expected ?? "",
    supplier: initial?.supplier ?? "",
    branch: initial?.branch ?? BRANCHES[0].name,
    deliverTo: initial?.deliverTo ?? "Organization",
    paymentTerms: initial?.paymentTerms ?? "Due on Receipt",
    shipmentPreference: initial?.shipmentPreference ?? "",
    priceLevel: initial?.priceLevel ?? "At Transaction Level",
    quotationRef: initial?.quotationRef ?? "",
    status: initial?.status ?? "Pending",
    items: (initial?.items as LineItem[]) ?? [newLine()],
    discount: initial?.discount ?? 0,
    discountMode: initial?.discountMode ?? "%",
    shipping: initial?.shipping ?? 0,
    notes: initial?.notes ?? "",
    terms: initial?.terms ?? "",
    files: (initial?.files as { name: string; size: number }[]) ?? [],
  }));
  const [error, setError] = useState<string | null>(null);
  const [poPrefsOpen, setPoPrefsOpen] = useState(false);
  const [poMode, setPoMode] = useState<"auto" | "manual">("auto");
  const [poPrefix, setPoPrefix] = useState("PO-");
  const [poNext, setPoNext] = useState("00001");
  const [newVendorOpen, setNewVendorOpen] = useState(false);
  const [extraVendors, setExtraVendors] = useState<string[]>([]);
  const [extraAddresses, setExtraAddresses] = useState<typeof BRANCHES>([]);
  const [addressPickerOpen, setAddressPickerOpen] = useState(false);
  const [newAddressOpen, setNewAddressOpen] = useState(false);
  const [bulkOpen, setBulkOpen] = useState(false);

  useEffect(() => {
    if (initial) return;
    setV((prev: any) => ({
      ...prev,
      ref: prev.ref || `PO-${String(Math.floor(Math.random() * 90000) + 10000)}`,
    }));
  }, [initial]);

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
    if (!v.supplier) { setError("Vendor Name is required"); return false; }
    if (!v.ref.trim()) { setError("Purchase Order # is required"); return false; }
    if (!v.date) { setError("Date is required"); return false; }
    if (v.items.length === 0 || v.items.some((it: LineItem) => !it.product)) {
      setError("Add at least one line item with a product");
      return false;
    }
    setError(null);
    return true;
  }

  function handleSave(nextStatus?: string) {
    if (!validate()) return;
    onSubmit({
      ...v,
      status: nextStatus ?? v.status,
      amount: Math.round(totals.grand),
      subTotal: Math.round(totals.subTotal),
      tax: 0,
    });
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).slice(0, 10).map((f) => ({ name: f.name, size: f.size }));
    set("files", [...v.files, ...next].slice(0, 10));
  }

  const allBranches = useMemo(() => [...BRANCHES, ...extraAddresses], [extraAddresses]);
  const branch = allBranches.find((b) => b.name === v.branch) ?? allBranches[0];

  return (
    <div className="space-y-0 pb-28 w-full lg:w-3/4">
      <div className="mb-4 text-xs text-muted-foreground">
        Fields marked with <span className="text-destructive">*</span> are required.
      </div>

      <Card>
        {/* Vendor */}
        <Row label="Vendor Name" required tone="muted">
          <ComboInput
            value={v.supplier}
            onChange={(val) => set("supplier", val)}
            options={[...extraVendors, ...SUPPLIERS]}
            placeholder="Select a Vendor"
            withSearchButton
            onNewVendor={() => setNewVendorOpen(true)}
          />
        </Row>

        {/* Delivery Address */}
        <Row label="Delivery Address" required>
          <div className="space-y-3">
            <div className="flex items-center gap-5 text-sm">
              <Radio name="deliverTo" label="Organization" value="Organization" current={v.deliverTo} onChange={(x) => set("deliverTo", x)} />
              <Radio name="deliverTo" label="Customer" value="Customer" current={v.deliverTo} onChange={(x) => set("deliverTo", x)} />
            </div>
            <div className="p-0">
              <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                <MapPin className="h-3.5 w-3.5 text-primary" />
                {branch.name}
                <button type="button" className="text-primary hover:opacity-80" title="Edit address">
                  <Pencil className="h-3 w-3" />
                </button>
              </div>
              <div className="mt-1.5 text-[13px] text-muted-foreground space-y-0.5">
                <div>{branch.address}</div>
                <div>{branch.city}</div>
                <div>{branch.phone}</div>
              </div>
              <div className="mt-2 relative">
                <button
                  type="button"
                  onClick={() => setAddressPickerOpen((o) => !o)}
                  className="text-xs font-semibold text-primary hover:opacity-80 inline-flex items-center gap-1"
                >
                  Change destination to deliver
                  <ChevronDown className={`h-3 w-3 transition-transform ${addressPickerOpen ? "rotate-180" : ""}`} />
                </button>
                {addressPickerOpen && (
                  <AddressPicker
                    addresses={allBranches}
                    selected={v.branch}
                    onSelect={(name) => { set("branch", name); setAddressPickerOpen(false); }}
                    onAddNew={() => { setAddressPickerOpen(false); setNewAddressOpen(true); }}
                    onClose={() => setAddressPickerOpen(false)}
                  />
                )}
              </div>
            </div>
          </div>
        </Row>

        {/* PO # */}
        <Row label="Purchase Order#" required>
          <div className="flex items-center gap-2 max-w-sm">
            <BaseInput value={v.ref} onChange={(e) => set("ref", e.target.value)} className="flex-1" />
            <button type="button" onClick={() => setPoPrefsOpen(true)} title="PO numbering settings" className="h-9 w-9 grid place-items-center rounded-md border border-border bg-card text-primary hover:bg-muted">
              <Settings2 className="h-3.5 w-3.5" />
            </button>
          </div>
        </Row>

        <Row label="Reference#">
          <BaseInput value={v.referenceNo} onChange={(e) => set("referenceNo", e.target.value)} className="max-w-sm" />
        </Row>

        <Row label="Date">
          <DateInput value={v.date} onChange={(val) => set("date", val)} />
        </Row>

        <RowSplit
          left={{
            label: "Expected Delivery Date",
            content: <DateInput value={v.expected} onChange={(val) => set("expected", val)} placeholder="dd MMM yyyy" min={todayISO()} />,
          }}
          right={{
            label: "Payment Terms",
            content: <NativeSelect value={v.paymentTerms} onChange={(e) => set("paymentTerms", e.target.value)} options={PAYMENT_TERMS} className="w-full max-w-sm" />,
          }}
        />

        <Row label="Shipment Preference">
          <NativeSelect
            value={v.shipmentPreference}
            onChange={(e) => set("shipmentPreference", e.target.value)}
            options={SHIPMENT_PREFERENCES}
            placeholder="Choose the shipment preference"
            className="max-w-sm"
          />
        </Row>
      </Card>

      {/* Item table section */}
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
                  <th className="text-left px-3 py-2.5 w-40">Unit</th>
                  <th className="text-right px-3 py-2.5 w-28">Quantity</th>
                  <th className="text-right px-3 py-2.5 w-28">Rate</th>
                  {lineLevel && <th className="text-right px-3 py-2.5 w-40">Discount</th>}
                  <th className="text-right px-3 py-2.5 w-32">Amount</th>
                  <th className="w-16"></th>
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
                              type="number"
                              min={0}
                              value={it.discount ?? 0}
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
            <button type="button" onClick={() => setBulkOpen(true)} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-primary/30 bg-primary/5 text-primary text-xs font-semibold hover:bg-primary/10">
              <Plus className="h-3.5 w-3.5" /> Add Items in Bulk
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
            placeholder="Will be displayed on purchase order"
            className="w-full rounded-md border border-border bg-card px-3 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          />
          <label className="mt-2 flex items-center gap-2 text-sm text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={!!v.notesDefault}
              onChange={(e) => set("notesDefault", e.target.checked)}
              className="h-4 w-4 rounded border-border accent-primary"
            />
            Use this in future for all purchase orders of all vendors.
          </label>
        </div>
        <div className="rounded-xl border border-border bg-muted/30 p-4 space-y-3 self-start">
          <SummaryRow label="Sub Total" value={totals.subTotal} bold />
          {!lineLevel && (
            <div className="flex items-center justify-between gap-3">
              <span className="text-sm text-muted-foreground">Discount</span>
              <div className="flex items-center gap-2">
                <div className="inline-flex items-stretch h-9 rounded-md border border-border bg-card overflow-hidden focus-within:ring-2 focus-within:ring-primary/30 focus-within:border-primary/40">
                  <input
                    type="number"
                    min={0}
                    value={v.discount}
                    onChange={(e) => set("discount", Number(e.target.value))}
                    className="w-24 px-2 bg-transparent text-sm text-right outline-none"
                  />
                  <div className="w-px bg-border" />
                  <select
                    value={v.discountMode}
                    onChange={(e) => set("discountMode", e.target.value)}
                    className="h-full pl-2 pr-6 bg-muted/40 text-sm font-medium outline-none cursor-pointer appearance-none bg-no-repeat bg-[right_0.4rem_center] bg-[length:0.7rem] bg-[image:var(--chev)]"
                    style={{ ["--chev" as any]: "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 12 12'><path fill='none' stroke='%23666' stroke-width='1.5' d='M3 4.5l3 3 3-3'/></svg>\")" }}
                  >
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
            <button type="button" onClick={() => handleSave("Pending")}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> {isEdit ? "Save Changes" : "Save and Send"}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={poPrefsOpen} onOpenChange={setPoPrefsOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-muted/40 border-b border-border">
            <DialogTitle className="text-base">Configure Purchase Order# Preferences</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <div>
              <div className="text-sm font-bold text-foreground">Associated Series</div>
              <div className="text-sm text-muted-foreground">Default Transaction Series</div>
            </div>
            <div className="border-t border-border pt-4">
              <p className="text-sm text-muted-foreground mb-3">
                {poMode === "auto"
                  ? "Your purchase order numbers are set on auto-generate mode to save your time. Are you sure about changing this setting?"
                  : "You have selected manual purchase order numbering. Do you want us to auto-generate it for you?"}
              </p>
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="radio"
                  checked={poMode === "auto"}
                  onChange={() => setPoMode("auto")}
                  className="mt-0.5 accent-primary"
                />
                <span className="text-sm font-semibold text-foreground inline-flex items-center gap-1">
                  Continue auto-generating purchase order numbers
                  <Info className="h-3.5 w-3.5 text-muted-foreground" />
                </span>
              </label>
              {poMode === "auto" && (
                <div className="mt-3 ml-6 grid grid-cols-2 gap-3 max-w-sm">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Prefix</label>
                    <input value={poPrefix} onChange={(e) => setPoPrefix(e.target.value)}
                      className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Next Number</label>
                    <input value={poNext} onChange={(e) => setPoNext(e.target.value)}
                      className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
              )}
              <label className="flex items-center gap-2 mt-4 cursor-pointer">
                <input
                  type="radio"
                  checked={poMode === "manual"}
                  onChange={() => setPoMode("manual")}
                  className="accent-primary"
                />
                <span className="text-sm font-semibold text-foreground">Enter purchase order numbers manually</span>
              </label>
            </div>
          </div>
          <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 sm:justify-start gap-2">
            <button
              type="button"
              onClick={() => {
                if (poMode === "auto") set("ref", `${poPrefix}${poNext}`);
                setPoPrefsOpen(false);
              }}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={() => setPoPrefsOpen(false)}
              className="h-9 px-4 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
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

      <NewAddressDialog
        open={newAddressOpen}
        onOpenChange={setNewAddressOpen}
        onCreate={(addr) => {
          setExtraAddresses((prev) => [...prev, addr]);
          set("branch", addr.name);
        }}
      />

      <BulkAddItemsDialog
        open={bulkOpen}
        onOpenChange={setBulkOpen}
        products={PRODUCTS}
        onAdd={(picks) => {
          const newLines: LineItem[] = picks.map((p) => ({
            id: `line-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
            product: p.product.name,
            uom: "PCS",
            qty: p.qty,
            rate: p.product.rate,
            discount: 0,
            tax: 0,
          }));
          // If only the default empty row exists, replace it; else append.
          const existing = v.items.filter((it: LineItem) => it.product);
          set("items", [...existing, ...newLines]);
        }}
      />
    </div>
  );
}

/* ---------------- shared bits ---------------- */

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
      <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

function ComboInput({
  value, onChange, options, placeholder, withSearchButton, onNewVendor,
}: {
  value: string;
  onChange: (val: string) => void;
  options: string[];
  placeholder?: string;
  withSearchButton?: boolean;
  onNewVendor?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = (query || value || "").toLowerCase();
  const filtered = options.filter((o) => o.toLowerCase().includes(q));
  const initial = (name: string) => name.trim().charAt(0).toUpperCase() || "?";
  const subtitle = (name: string) => name.toLowerCase().split(/\s+/)[0] || "";

  return (
    <div ref={wrapRef} className="relative flex items-stretch max-w-xl">
      <div className="relative flex-1">
        <input
          value={value}
          onFocus={() => setOpen(true)}
          onClick={() => setOpen(true)}
          onChange={(e) => { onChange(e.target.value); setQuery(e.target.value); setOpen(true); }}
          placeholder={placeholder}
          className="h-10 w-full pl-3 pr-9 rounded-l-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        />
        <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />

        {open && (
          <div className="absolute z-40 left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
            <div className="p-2 border-b border-border">
              <input
                autoFocus
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search"
                className="h-9 w-full px-3 rounded-md border border-primary bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
              />
            </div>
            <ul className="max-h-72 overflow-auto py-1">
              {filtered.length === 0 && (
                <li className="px-3 py-3 text-sm text-muted-foreground">No vendors found</li>
              )}
              {filtered.map((o) => {
                const selected = o === value;
                return (
                  <li key={o}>
                    <button
                      type="button"
                      onClick={() => { onChange(o); setOpen(false); setQuery(""); }}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left text-sm transition-colors ${selected ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                    >
                      <span className={`h-9 w-9 rounded-full grid place-items-center text-sm font-semibold shrink-0 ${selected ? "bg-primary-foreground/20 text-primary-foreground" : "bg-muted text-muted-foreground"}`}>
                        {initial(o)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block font-semibold truncate">{o}</span>
                        <span className={`block text-xs truncate ${selected ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                          {subtitle(o)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
            <button
              type="button"
              onClick={() => { setOpen(false); onNewVendor?.(); }}
              className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-border text-sm font-semibold text-primary hover:bg-muted"
            >
              <Plus className="h-4 w-4" /> New Vendor
            </button>
          </div>
        )}
      </div>
      {withSearchButton && (
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          className="h-10 w-10 grid place-items-center rounded-r-md bg-primary text-primary-foreground hover:bg-primary/90 border border-primary"
        >
          <Search className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

function DateInput({ value, onChange, placeholder, min }: { value: string; onChange: (val: string) => void; placeholder?: string; min?: string }) {
  return (
    <div className="max-w-sm">
      <div className="relative">
        <input
          type="date"
          value={value}
          min={min}
          onChange={(e) => onChange(e.target.value)}
          className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
          placeholder={placeholder}
        />
      </div>
      {value && <div className="text-[11px] text-muted-foreground mt-1">{fmtDate(value)}</div>}
    </div>
  );
}

function Radio({ name, label, value, current, onChange }: { name: string; label: string; value: string; current: string; onChange: (v: string) => void }) {
  const checked = current === value;
  return (
    <label className="inline-flex items-center gap-2 cursor-pointer">
      <span className={`h-4 w-4 rounded-full border-2 grid place-items-center ${checked ? "border-primary" : "border-border"}`}>
        {checked && <span className="h-2 w-2 rounded-full bg-primary" />}
      </span>
      <input type="radio" name={name} value={value} checked={checked} onChange={() => onChange(value)} className="sr-only" />
      <span className="text-sm text-foreground">{label}</span>
    </label>
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
      <label className="block text-sm text-foreground mb-1.5">Attach File(s) to Purchase Order</label>
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-3">
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted"
        >
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

type Address = { name: string; address: string; city: string; phone: string };

function AddressPicker({
  addresses, selected, onSelect, onAddNew, onClose,
}: {
  addresses: Address[];
  selected: string;
  onSelect: (name: string) => void;
  onAddNew: () => void;
  onClose: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) onClose();
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, [onClose]);
  return (
    <div ref={ref} className="absolute z-40 left-0 mt-1 w-[420px] max-w-[95vw] rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
      <ul className="max-h-80 overflow-auto p-2 space-y-2">
        {addresses.map((a) => {
          const isSel = a.name === selected;
          return (
            <li key={a.name}>
              <button
                type="button"
                onClick={() => onSelect(a.name)}
                className={`w-full text-left rounded-md border px-3 py-2.5 text-sm transition-colors ${isSel ? "border-primary bg-primary/5" : "border-border bg-muted/30 hover:bg-muted"}`}
              >
                <div className="font-semibold text-foreground">{a.name}</div>
                <div className="text-xs text-muted-foreground mt-0.5">{a.address}</div>
                <div className="text-xs text-muted-foreground">{a.city}</div>
                <div className="text-xs text-muted-foreground">{a.phone}</div>
              </button>
            </li>
          );
        })}
      </ul>
      <button
        type="button"
        onClick={onAddNew}
        className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-border text-sm font-semibold text-primary hover:bg-muted"
      >
        <Plus className="h-4 w-4" /> Add new address
      </button>
    </div>
  );
}

function NewAddressDialog({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (a: Address) => void;
}) {
  const [attention, setAttention] = useState("");
  const [street1, setStreet1] = useState("");
  const [street2, setStreet2] = useState("");
  const [city, setCity] = useState("");
  const [stateP, setStateP] = useState("");
  const [zip, setZip] = useState("");
  const [country, setCountry] = useState("");
  const [phone, setPhone] = useState("");
  const [err, setErr] = useState<string | null>(null);

  function reset() {
    setAttention(""); setStreet1(""); setStreet2(""); setCity("");
    setStateP(""); setZip(""); setCountry(""); setPhone(""); setErr(null);
  }

  function save() {
    if (!street1.trim()) { setErr("Street 1 is required"); return; }
    const name = attention.trim() || `${city || "New"} Address`;
    onCreate({
      name,
      address: [street1, street2].filter(Boolean).join(", "),
      city: [city, stateP, zip].filter(Boolean).join(", "),
      phone: [country, phone].filter(Boolean).join(" "),
    });
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="sm:max-w-xl p-0 overflow-hidden">
        <DialogHeader className="px-6 py-4 bg-muted/40 border-b border-border">
          <DialogTitle className="text-base">New address</DialogTitle>
        </DialogHeader>
        <div className="px-6 py-5 space-y-3.5">
          {err && <div className="text-xs text-destructive font-semibold">{err}</div>}
          <AddrField label="Attention"><input value={attention} onChange={(e) => setAttention(e.target.value)} className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></AddrField>
          <AddrField label="Street 1" required><textarea value={street1} onChange={(e) => setStreet1(e.target.value)} rows={2} className="w-full px-2.5 py-1.5 rounded-md border border-primary bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></AddrField>
          <AddrField label="Street 2"><textarea value={street2} onChange={(e) => setStreet2(e.target.value)} rows={2} className="w-full px-2.5 py-1.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></AddrField>
          <AddrField label="City"><input value={city} onChange={(e) => setCity(e.target.value)} className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></AddrField>
          <AddrField label="State/Province"><input value={stateP} onChange={(e) => setStateP(e.target.value)} className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></AddrField>
          <AddrField label="ZIP/Postal Code"><input value={zip} onChange={(e) => setZip(e.target.value)} className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></AddrField>
          <AddrField label="Country / Region">
            <div className="relative">
              <select value={country} onChange={(e) => setCountry(e.target.value)} className="appearance-none w-full h-9 pl-2.5 pr-8 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary">
                <option value="">Select or type to add</option>
                <option>Pakistan</option><option>India</option><option>United States</option>
                <option>United Kingdom</option><option>UAE</option>
              </select>
              <ChevronDown className="h-3.5 w-3.5 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </AddrField>
          <AddrField label="Phone"><input value={phone} onChange={(e) => setPhone(e.target.value)} className="h-9 w-full px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" /></AddrField>
        </div>
        <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 sm:justify-start gap-2">
          <button type="button" onClick={save} className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">Save</button>
          <button type="button" onClick={() => { reset(); onOpenChange(false); }} className="h-9 px-4 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function AddrField({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[140px_1fr] gap-2 md:gap-4 items-start">
      <label className="text-sm pt-2 text-foreground">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      <div>{children}</div>
    </div>
  );
}

function ProductPicker({
  value, onChange, products,
}: {
  value: string;
  onChange: (p: Product) => void;
  products: Product[];
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const q = query.toLowerCase();
  const filtered = products.filter((p) => p.name.toLowerCase().includes(q) || p.sku.toLowerCase().includes(q));
  return (
    <div ref={ref} className="relative">
      <input
        value={value}
        readOnly
        onClick={() => setOpen((o) => !o)}
        placeholder="Type or click to select an item."
        className="w-full h-9 px-2.5 pr-8 rounded-md border border-border bg-card text-sm cursor-pointer focus:outline-none focus:ring-1 focus:ring-primary"
      />
      <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 top-[18px] -translate-y-1/2 pointer-events-none" />
      {open && (
        <div className="absolute z-40 left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
          <div className="p-2 border-b border-border">
            <input
              autoFocus
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items"
              className="h-9 w-full px-3 rounded-md border border-primary bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <ul className="max-h-72 overflow-auto">
            {filtered.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">No items found</li>}
            {filtered.map((p) => {
              const sel = p.name === value;
              return (
                <li key={p.sku}>
                  <button
                    type="button"
                    onClick={() => { onChange(p); setOpen(false); setQuery(""); }}
                    className={`w-full text-left px-3 py-2.5 border-b border-border last:border-b-0 transition-colors ${sel ? "bg-primary text-primary-foreground" : "hover:bg-muted"}`}
                  >
                    <div className="text-sm font-semibold truncate">{p.name}</div>
                    <div className={`text-xs mt-0.5 truncate ${sel ? "text-primary-foreground/80" : "text-muted-foreground"}`}>
                      SKU: {p.sku}  Purchase Rate: Rs. {p.rate.toLocaleString()}
                    </div>
                  </button>
                </li>
              );
            })}
          </ul>
          <button
            type="button"
            className="w-full flex items-center gap-2 px-3 py-2.5 border-t border-border text-sm font-semibold text-primary hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            <Plus className="h-4 w-4" /> Add New Item
          </button>
        </div>
      )}
    </div>
  );
}

type BulkPick = { product: Product; qty: number };

function BulkAddItemsDialog({
  open, onOpenChange, products, onAdd,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  products: Product[];
  onAdd: (picks: BulkPick[]) => void;
}) {
  const [query, setQuery] = useState("");
  const [picks, setPicks] = useState<Record<string, number>>({});

  useEffect(() => {
    if (!open) { setQuery(""); setPicks({}); }
  }, [open]);

  const filtered = products.filter(
    (p) => p.name.toLowerCase().includes(query.toLowerCase()) || p.sku.toLowerCase().includes(query.toLowerCase()),
  );
  const selectedList = products
    .filter((p) => picks[p.sku] && picks[p.sku] > 0)
    .map((p) => ({ product: p, qty: picks[p.sku] }));
  const totalQty = selectedList.reduce((s, x) => s + x.qty, 0);

  const toggle = (sku: string) =>
    setPicks((prev) => {
      const next = { ...prev };
      if (next[sku]) delete next[sku];
      else next[sku] = 1;
      return next;
    });
  const setQty = (sku: string, qty: number) =>
    setPicks((prev) => ({ ...prev, [sku]: Math.max(1, qty) }));
  const removePick = (sku: string) =>
    setPicks((prev) => { const n = { ...prev }; delete n[sku]; return n; });

  const estTotal = selectedList.reduce((s, x) => s + x.qty * x.product.rate, 0);
  const fmt = (n: number) => `Rs. ${n.toLocaleString()}`;
  const initials = (name: string) =>
    name.split(" ").filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join("");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[1080px] p-0 overflow-hidden gap-0 border-border">
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-border space-y-0">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-md bg-primary/10 text-primary grid place-items-center">
              <Plus className="h-4 w-4" />
            </div>
            <div className="min-w-0">
              <DialogTitle className="text-base font-semibold text-foreground">Add Items in Bulk</DialogTitle>
              <p className="text-xs text-muted-foreground mt-0.5">
                Select multiple products and set quantities, then add them to this purchase order.
              </p>
            </div>
          </div>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-[1.15fr_1fr] h-[68vh]">
          {/* LEFT: catalog */}
          <div className="border-r border-border flex flex-col min-h-0 bg-muted/20">
            <div className="px-5 pt-4 pb-3 space-y-3">
              <div className="relative">
                <Search className="h-4 w-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search by name or scan SKU / barcode…"
                  className="h-10 w-full pl-9 pr-20 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
                />
                <kbd className="hidden sm:inline-flex absolute right-3 top-1/2 -translate-y-1/2 items-center gap-1 px-1.5 h-5 rounded border border-border bg-muted text-[10px] font-medium text-muted-foreground">
                  ⌘K
                </kbd>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">
                  <span className="font-semibold text-foreground">{filtered.length}</span> of {products.length} items
                </span>
                {Object.keys(picks).length > 0 && (
                  <button type="button" onClick={() => setPicks({})} className="text-primary hover:underline font-medium">
                    Clear selection
                  </button>
                )}
              </div>
            </div>
            <ul className="flex-1 overflow-auto px-3 pb-3 space-y-1">
              {filtered.length === 0 && (
                <li className="px-4 py-12 text-sm text-muted-foreground text-center">
                  <Search className="h-6 w-6 mx-auto mb-2 opacity-40" />
                  No items match "{query}"
                </li>
              )}
              {filtered.map((p) => {
                const checked = !!picks[p.sku];
                return (
                  <li key={p.sku}>
                    <button
                      type="button"
                      onClick={() => toggle(p.sku)}
                      className={`w-full flex items-center gap-3 px-3 py-2.5 text-left rounded-md border transition-all ${
                        checked
                          ? "bg-card border-primary/40 ring-1 ring-primary/20 shadow-sm"
                          : "bg-card border-transparent hover:border-border hover:bg-card"
                      }`}
                    >
                      <span className={`h-9 w-9 shrink-0 rounded-md grid place-items-center text-[11px] font-bold ${
                        checked ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                      }`}>
                        {initials(p.name)}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-medium text-foreground truncate">{p.name}</span>
                        <span className="flex items-center gap-2 text-xs text-muted-foreground mt-0.5">
                          <span className="font-mono">{p.sku}</span>
                          <span className="opacity-40">•</span>
                          <span>{fmt(p.rate)}</span>
                        </span>
                      </span>
                      <span className={`h-5 w-5 rounded-md grid place-items-center shrink-0 border transition-colors ${
                        checked ? "bg-primary border-primary text-primary-foreground" : "border-border bg-card text-transparent"
                      }`}>
                        <Check className="h-3 w-3" strokeWidth={3} />
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>

          {/* RIGHT: selected */}
          <div className="flex flex-col min-h-0 bg-card">
            <div className="px-5 py-3.5 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h4 className="text-sm font-semibold text-foreground">Selected items</h4>
                <span className="h-5 min-w-[20px] px-1.5 rounded-full bg-primary/10 text-primary text-[11px] font-semibold inline-flex items-center justify-center">
                  {selectedList.length}
                </span>
              </div>
              <div className="text-xs text-muted-foreground">
                Total qty <span className="font-semibold text-foreground ml-1">{totalQty}</span>
              </div>
            </div>
            <div className="flex-1 overflow-auto">
              {selectedList.length === 0 ? (
                <div className="h-full grid place-items-center px-6 py-12 text-center">
                  <div>
                    <div className="h-12 w-12 mx-auto rounded-full bg-muted grid place-items-center mb-3">
                      <Plus className="h-5 w-5 text-muted-foreground" />
                    </div>
                    <p className="text-sm font-medium text-foreground">Nothing selected yet</p>
                    <p className="text-xs text-muted-foreground mt-1 max-w-xs">
                      Pick items from the catalog on the left. You can adjust quantities here.
                    </p>
                  </div>
                </div>
              ) : (
                <ul className="divide-y divide-border">
                  {selectedList.map(({ product: p, qty }) => (
                    <li key={p.sku} className="flex items-center gap-3 px-5 py-3 group hover:bg-muted/30">
                      <div className="min-w-0 flex-1">
                        <div className="text-sm font-medium text-foreground truncate">{p.name}</div>
                        <div className="text-[11px] text-muted-foreground mt-0.5 flex items-center gap-2">
                          <span className="font-mono">{p.sku}</span>
                          <span className="opacity-40">•</span>
                          <span>{fmt(p.rate * qty)}</span>
                        </div>
                      </div>
                      <div className="inline-flex items-center rounded-md border border-border bg-card overflow-hidden">
                        <button
                          type="button"
                          onClick={() => (qty > 1 ? setQty(p.sku, qty - 1) : removePick(p.sku))}
                          className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted text-base leading-none"
                        >
                          −
                        </button>
                        <input
                          type="number"
                          min={1}
                          value={qty}
                          onChange={(e) => setQty(p.sku, Number(e.target.value) || 1)}
                          className="h-8 w-11 text-center text-sm font-semibold bg-transparent border-x border-border focus:outline-none focus:bg-muted/40 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() => setQty(p.sku, qty + 1)}
                          className="h-8 w-8 grid place-items-center text-muted-foreground hover:text-foreground hover:bg-muted text-base leading-none"
                        >
                          +
                        </button>
                      </div>
                      <button
                        type="button"
                        onClick={() => removePick(p.sku)}
                        className="h-8 w-8 grid place-items-center rounded-md text-muted-foreground hover:text-destructive hover:bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity"
                        title="Remove"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {selectedList.length > 0 && (
              <div className="px-5 py-3 border-t border-border bg-muted/30 flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Estimated subtotal</span>
                <span className="text-sm font-semibold text-foreground">{fmt(estTotal)}</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <DialogFooter className="px-6 py-3 border-t border-border bg-card sm:justify-between gap-2">
          <p className="text-xs text-muted-foreground hidden sm:block">
            Tip: press <kbd className="px-1 py-0.5 rounded border border-border bg-muted font-mono text-[10px]">Enter</kbd> on a row to toggle selection.
          </p>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => onOpenChange(false)} className="h-9 px-4 rounded-md border border-border bg-card text-sm font-medium text-foreground hover:bg-muted">
              Cancel
            </button>
            <button
              type="button"
              disabled={selectedList.length === 0}
              onClick={() => { onAdd(selectedList); onOpenChange(false); }}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-2"
            >
              <Plus className="h-3.5 w-3.5" />
              Add {selectedList.length > 0 ? `${selectedList.length} item${selectedList.length > 1 ? "s" : ""}` : "items"}
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
