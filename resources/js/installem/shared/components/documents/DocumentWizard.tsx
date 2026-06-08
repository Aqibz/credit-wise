import { useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import { StepWizard, WField, WInput, WTextarea, WSelect, WGrid } from "@/components/StepWizard";
import { SupplierLink } from "@/components/SupplierLink";

export type DocConfig = {
  title: string;                 // "Purchase Order"
  refLabel: string;              // "PO #"
  refPrefix: string;             // "PO-"
  partyLabel: string;            // "Supplier" | "Customer"
  partyOptions: string[];
  statusOptions: string[];
  defaultStatus: string;
  branchOptions?: string[];
  showDueDate?: boolean;
  showInvoiceRef?: boolean;      // for returns/payments
  invoiceRefLabel?: string;
  reasonOptions?: string[];      // for returns
  /** Whether to show tax/discount controls */
  showTax?: boolean;
  /** Whether to show shipping line */
  showShipping?: boolean;
};

export type LineItem = {
  id: string;
  product: string;
  description?: string;
  qty: number;
  rate: number;
  discount?: number; // percent
  tax?: number;      // percent
};

const PRODUCTS = [
  "Gree 1.5 Ton Inverter AC", "Samsung LED TV 55", "Haier Refrigerator 13 CFT",
  "Dawlance Microwave Oven", "Honda CD-70", "Sony Bravia 43", "PEL Washing Machine",
  "Orient Water Dispenser", "TCL LED TV 50", "Generic Item",
];

export function DocumentWizard({
  cfg, initial, onClose, onSubmit, isEdit, pageMode,
}: {
  cfg: DocConfig;
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
  pageMode?: boolean;

}) {
  const [v, setV] = useState<any>(() => ({
    ref: initial?.ref ?? `${cfg.refPrefix}${Math.floor(Math.random() * 9000) + 1000}`,
    date: initial?.date ?? new Date().toISOString().slice(0, 10),
    due: initial?.due ?? "",
    party: initial?.[cfg.partyLabel.toLowerCase()] ?? initial?.party ?? "",
    branch: initial?.branch ?? (cfg.branchOptions?.[0] ?? ""),
    invoiceRef: initial?.invoice ?? initial?.po ?? initial?.grn ?? initial?.bill ?? "",
    reason: initial?.reason ?? (cfg.reasonOptions?.[0] ?? ""),
    items: initial?.items ?? [
      { id: String(Date.now()), product: "", qty: 1, rate: 0, discount: 0, tax: 0 },
    ] as LineItem[],
    shipping: initial?.shipping ?? 0,
    discount: initial?.discount ?? 0,
    notes: initial?.notes ?? "",
    status: initial?.status ?? cfg.defaultStatus,
  }));

  function set<K extends keyof typeof v>(k: K, val: any) { setV((p: any) => ({ ...p, [k]: val })); }

  function addItem() {
    set("items", [...v.items, { id: String(Date.now()) + Math.random(), product: "", qty: 1, rate: 0, discount: 0, tax: 0 }]);
  }
  function updateItem(id: string, patch: Partial<LineItem>) {
    set("items", v.items.map((it: LineItem) => it.id === id ? { ...it, ...patch } : it));
  }
  function removeItem(id: string) { set("items", v.items.filter((it: LineItem) => it.id !== id)); }

  const totals = useMemo(() => {
    const lines = v.items.map((it: LineItem) => {
      const gross = Number(it.qty) * Number(it.rate);
      const disc = gross * (Number(it.discount || 0) / 100);
      const taxable = gross - disc;
      const tax = taxable * (Number(it.tax || 0) / 100);
      return { gross, disc, tax, net: taxable + tax };
    });
    const subTotal = lines.reduce((s: number, l: any) => s + l.gross, 0);
    const totalDisc = lines.reduce((s: number, l: any) => s + l.disc, 0) + Number(v.discount || 0);
    const totalTax = lines.reduce((s: number, l: any) => s + l.tax, 0);
    const grand = subTotal - lines.reduce((s: number, l: any) => s + l.disc, 0) + totalTax + Number(v.shipping || 0) - Number(v.discount || 0);
    return { subTotal, totalDisc, totalTax, shipping: Number(v.shipping || 0), grand };
  }, [v.items, v.shipping, v.discount]);

  const steps = [
    {
      key: "header",
      title: "Document Header",
      description: `Reference, ${cfg.partyLabel.toLowerCase()} & dates`,
      validate: () => !v.party ? `${cfg.partyLabel} is required` : !v.ref ? "Reference is required" : null,
      render: () => (
        <WGrid>
          <WField label={cfg.refLabel} required><WInput value={v.ref} onChange={(e) => set("ref", e.target.value)} /></WField>
          <WField label="Date" required><WInput type="date" value={v.date} onChange={(e) => set("date", e.target.value)} /></WField>
          {cfg.showDueDate && <WField label="Due Date"><WInput type="date" value={v.due} onChange={(e) => set("due", e.target.value)} /></WField>}
          <WField label={cfg.partyLabel} required><WSelect value={v.party} onChange={(x) => set("party", x)} options={cfg.partyOptions} /></WField>
          {cfg.branchOptions && <WField label="Branch / Warehouse"><WSelect value={v.branch} onChange={(x) => set("branch", x)} options={cfg.branchOptions} /></WField>}
          {cfg.showInvoiceRef && <WField label={cfg.invoiceRefLabel ?? "Reference Doc"}><WInput value={v.invoiceRef} onChange={(e) => set("invoiceRef", e.target.value)} placeholder="Linked document #" /></WField>}
          {cfg.reasonOptions && <WField label="Reason"><WSelect value={v.reason} onChange={(x) => set("reason", x)} options={cfg.reasonOptions} /></WField>}
          <WField label="Status"><WSelect value={v.status} onChange={(x) => set("status", x)} options={cfg.statusOptions} /></WField>
        </WGrid>
      ),
    },
    {
      key: "items",
      title: "Line Items",
      description: "Products, quantity, rate & taxes",
      validate: () => v.items.length === 0 ? "Add at least one line item" : v.items.some((it: LineItem) => !it.product) ? "Each item needs a product" : null,
      render: () => (
        <div className="space-y-4">
          <div className="rounded-lg border border-slate-200 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500">
                  <tr>
                    <th className="text-left px-3 py-2 w-10">#</th>
                    <th className="text-left px-3 py-2 min-w-[220px]">Product / Description</th>
                    <th className="text-left px-3 py-2 w-20">Qty</th>
                    <th className="text-left px-3 py-2 w-32">Rate</th>
                    {cfg.showTax !== false && <th className="text-left px-3 py-2 w-20">Disc%</th>}
                    {cfg.showTax !== false && <th className="text-left px-3 py-2 w-20">Tax%</th>}
                    <th className="text-right px-3 py-2 w-32">Amount</th>
                    <th className="px-2 w-10"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {v.items.map((it: LineItem, i: number) => {
                    const gross = Number(it.qty) * Number(it.rate);
                    const disc = gross * (Number(it.discount || 0) / 100);
                    const tax = (gross - disc) * (Number(it.tax || 0) / 100);
                    const net = gross - disc + tax;
                    return (
                      <tr key={it.id} className="align-top">
                        <td className="px-3 py-2 text-slate-500 font-medium">{i + 1}</td>
                        <td className="px-3 py-2">
                          <input list={`prods-${it.id}`} value={it.product} onChange={(e) => updateItem(it.id, { product: e.target.value })} placeholder="Pick or type product" className="w-full h-9 px-2.5 rounded-md border border-slate-200 text-sm" />
                          <datalist id={`prods-${it.id}`}>{PRODUCTS.map((p) => <option key={p} value={p} />)}</datalist>
                          <input value={it.description ?? ""} onChange={(e) => updateItem(it.id, { description: e.target.value })} placeholder="Description (optional)" className="w-full h-8 mt-1 px-2.5 rounded-md border border-slate-200 text-xs text-slate-500" />
                        </td>
                        <td className="px-3 py-2"><input type="number" value={it.qty} onChange={(e) => updateItem(it.id, { qty: Number(e.target.value) })} className="w-full h-9 px-2 rounded-md border border-slate-200 text-sm" /></td>
                        <td className="px-3 py-2"><input type="number" value={it.rate} onChange={(e) => updateItem(it.id, { rate: Number(e.target.value) })} className="w-full h-9 px-2 rounded-md border border-slate-200 text-sm" /></td>
                        {cfg.showTax !== false && <td className="px-3 py-2"><input type="number" value={it.discount ?? 0} onChange={(e) => updateItem(it.id, { discount: Number(e.target.value) })} className="w-full h-9 px-2 rounded-md border border-slate-200 text-sm" /></td>}
                        {cfg.showTax !== false && <td className="px-3 py-2"><input type="number" value={it.tax ?? 0} onChange={(e) => updateItem(it.id, { tax: Number(e.target.value) })} className="w-full h-9 px-2 rounded-md border border-slate-200 text-sm" /></td>}
                        <td className="px-3 py-2 text-right font-bold text-slate-900">Rs. {Math.round(net).toLocaleString()}</td>
                        <td className="px-2 py-2 text-right"><button onClick={() => removeItem(it.id)} className="text-rose-600"><Trash2 className="h-4 w-4" /></button></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="px-3 py-2 border-t border-slate-200 bg-slate-50">
              <button type="button" onClick={addItem} className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
                <Plus className="h-3.5 w-3.5" /> Add Line
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <WField label="Notes / Terms" full><WTextarea rows={4} value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Payment terms, delivery instructions…" /></WField>
            </div>
            <div className="rounded-lg border border-slate-200 bg-slate-50 p-4 space-y-2 text-sm">
              <Row label="Subtotal" value={totals.subTotal} />
              <Row label="Discounts" value={-totals.totalDisc} />
              {cfg.showTax !== false && <Row label="Taxes" value={totals.totalTax} />}
              {cfg.showShipping && (
                <div className="flex justify-between items-center gap-2">
                  <span className="text-slate-500">Shipping / Freight</span>
                  <input type="number" value={v.shipping} onChange={(e) => set("shipping", Number(e.target.value))} className="w-28 h-8 px-2 rounded-md border border-slate-200 text-sm text-right" />
                </div>
              )}
              <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
                <span className="text-slate-700 font-bold">Grand Total</span>
                <span className="text-lg font-bold text-primary">Rs. {Math.round(totals.grand).toLocaleString()}</span>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      key: "review",
      title: "Review & Save",
      description: "Confirm document before saving",
      render: () => (
        <DocumentPreview cfg={cfg} doc={{ ...v, ...totals, amount: Math.round(totals.grand) }} />
      ),
    },
  ];

  return (
    <StepWizard
      title={cfg.title}
      subtitle={`Create a professional ${cfg.title.toLowerCase()} with itemised lines`}
      isEdit={isEdit}
      pageMode={pageMode}
      steps={steps}
      onClose={onClose}
      onSave={() => {

        // map party back to its named field for compatibility with existing list configs
        const partyField = cfg.partyLabel.toLowerCase();
        const out: any = {
          ...v,
          [partyField]: v.party,
          amount: Math.round(totals.grand),
          subTotal: Math.round(totals.subTotal),
          tax: Math.round(totals.totalTax),
        };
        if (cfg.showInvoiceRef) {
          if (cfg.invoiceRefLabel?.toLowerCase().includes("invoice")) out.invoice = v.invoiceRef;
          else if (cfg.invoiceRefLabel?.toLowerCase().includes("po")) out.po = v.invoiceRef;
          else if (cfg.invoiceRefLabel?.toLowerCase().includes("grn")) out.grn = v.invoiceRef;
          else if (cfg.invoiceRefLabel?.toLowerCase().includes("bill")) out.bill = v.invoiceRef;
        }
        // outstanding for bills
        if (cfg.showDueDate) out.outstanding = out.outstanding ?? out.amount;
        // qty for returns: total of lines
        if (cfg.reasonOptions) out.qty = v.items.reduce((s: number, it: LineItem) => s + Number(it.qty || 0), 0);
        if (v.items[0]?.product && !out.product) out.product = v.items[0].product;
        onSubmit(out);
      }}
    />
  );
}

function Row({ label, value }: { label: string; value: number }) {
  const negative = value < 0;
  return (
    <div className="flex justify-between">
      <span className="text-slate-500">{label}</span>
      <span className={`font-semibold ${negative ? "text-rose-600" : "text-slate-800"}`}>{negative ? "−" : ""}Rs. {Math.round(Math.abs(value)).toLocaleString()}</span>
    </div>
  );
}

/* ---------- Printable preview (used inline in wizard review + standalone viewer) ---------- */

export function DocumentPreview({ cfg, doc }: { cfg: DocConfig; doc: any }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
      {/* Header */}
      <div className="px-6 py-5 bg-gradient-to-r from-primary to-primary text-white flex items-start justify-between gap-4">
        <div>
          <div className="text-[11px] font-bold uppercase tracking-[0.18em] text-white/75">{cfg.title}</div>
          <div className="text-2xl font-bold mt-0.5">{doc.ref}</div>
          <div className="text-xs text-white/80 mt-1">Issued: {doc.date} {doc.due ? `• Due: ${doc.due}` : ""}</div>
        </div>
        <div className="text-right">
          <div className="h-12 w-12 rounded-xl bg-white/15 backdrop-blur grid place-items-center text-lg font-bold ring-1 ring-white/30 ml-auto">Q</div>
          <div className="text-xs text-white/80 mt-2 font-semibold">CreditWise</div>
          <div className="text-[10px] text-white/70">Installment Suite</div>
        </div>
      </div>

      {/* Parties */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 px-6 py-4 bg-slate-50/60 border-b border-slate-200 text-sm">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{cfg.partyLabel}</div>
          <div className="font-semibold text-slate-800">
            {cfg.partyLabel === "Supplier" && doc.party ? <SupplierLink name={doc.party} /> : (doc.party || "—")}
          </div>
          {doc.branch && <div className="text-xs text-slate-500 mt-0.5">Branch: {doc.branch}</div>}
        </div>
        {cfg.showInvoiceRef && (
          <div>
            <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1">{cfg.invoiceRefLabel}</div>
            <div className="font-semibold text-slate-800">{doc.invoiceRef || "—"}</div>
          </div>
        )}
        <div className="text-right">
          <div className="inline-flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Status</span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold bg-primary-soft text-primary">{doc.status}</span>
          </div>
          {doc.reason && <div className="text-xs text-slate-500 mt-1">Reason: {doc.reason}</div>}
        </div>
      </div>

      {/* Lines */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-50 text-[11px] uppercase font-bold text-slate-500 border-b border-slate-200">
            <tr>
              <th className="text-left px-4 py-2.5 w-10">#</th>
              <th className="text-left px-4 py-2.5">Product / Description</th>
              <th className="text-right px-4 py-2.5 w-20">Qty</th>
              <th className="text-right px-4 py-2.5 w-32">Rate</th>
              <th className="text-right px-4 py-2.5 w-32">Amount</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {(doc.items ?? []).map((it: LineItem, i: number) => {
              const gross = Number(it.qty) * Number(it.rate);
              const disc = gross * (Number(it.discount || 0) / 100);
              const tax = (gross - disc) * (Number(it.tax || 0) / 100);
              const net = gross - disc + tax;
              return (
                <tr key={it.id}>
                  <td className="px-4 py-3 text-slate-500 font-medium">{i + 1}</td>
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-800">{it.product || "—"}</div>
                    {it.description && <div className="text-xs text-slate-500 mt-0.5">{it.description}</div>}
                    {(it.discount || it.tax) ? (
                      <div className="text-[10px] text-slate-400 mt-0.5">
                        {it.discount ? `Disc ${it.discount}% ` : ""}{it.tax ? `• Tax ${it.tax}%` : ""}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3 text-right font-medium">{it.qty}</td>
                  <td className="px-4 py-3 text-right font-medium">Rs. {Number(it.rate).toLocaleString()}</td>
                  <td className="px-4 py-3 text-right font-bold text-slate-900">Rs. {Math.round(net).toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Totals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-0 border-t border-slate-200">
        <div className="p-5 text-sm">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 mb-1.5">Notes</div>
          <p className="text-slate-600 whitespace-pre-line">{doc.notes || "—"}</p>
        </div>
        <div className="p-5 bg-slate-50 border-l border-slate-200 space-y-1.5 text-sm">
          <Row label="Subtotal" value={Number(doc.subTotal ?? 0)} />
          {Number(doc.totalDisc) ? <Row label="Discounts" value={-Number(doc.totalDisc)} /> : null}
          {Number(doc.totalTax) ? <Row label="Taxes" value={Number(doc.totalTax)} /> : null}
          {Number(doc.shipping) ? <Row label="Shipping" value={Number(doc.shipping)} /> : null}
          <div className="border-t border-slate-300 pt-2 flex justify-between items-center">
            <span className="text-slate-700 font-bold">Grand Total</span>
            <span className="text-xl font-bold text-primary">Rs. {Math.round(Number(doc.grand ?? doc.amount ?? 0)).toLocaleString()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
