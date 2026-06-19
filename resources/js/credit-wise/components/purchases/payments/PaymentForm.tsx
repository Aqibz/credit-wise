import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import { Save, ChevronDown, Search, Settings2, Paperclip, Trash2, Send, Pencil, Info, AlertTriangle, UserSquare2, Plus } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { NewVendorModal } from "@/components/NewVendorModal";
import { VendorDetailsSheet } from "@/components/VendorDetailsSheet";

const SUPPLIERS = [
  "DWP Group", "R&I Electronics", "Haier International", "Dawlance Ltd",
  "Samsung Pakistan", "Sony Distributors",
];
const PAYMENT_MODES = ["Cash", "Bank Transfer", "Cheque", "Card", "Online", "UPI"];
const PAID_THROUGH = ["Bank Acc 1 (PKR)", "Bank Acc 2 (PKR)", "Petty Cash", "Undeposited Funds"];

type OpenBill = {
  id: string;
  ref: string;
  date: string;
  due?: string;
  po?: string;
  amount: number;
  outstanding: number;
  supplier: string;
  status: string;
};

type Values = {
  ref: string;
  supplier: string;
  date: string;
  time: string;
  amount: number;
  bankCharges: number;
  method: string;
  paidThrough: string;
  reference: string;
  notes: string;
  bill: string;
  applied: Record<string, number>;
  files: { name: string; size: number }[];
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso: string) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
};
const fmtMoney = (n: number) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const newRef = () => `PAY-${Math.floor(10000 + Math.random() * 90000)}`;

function loadOpenBillsForVendor(vendor: string): OpenBill[] {
  if (!vendor || typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem("qcrm.bills");
    if (!raw) return [];
    const list = JSON.parse(raw) as any[];
    return list
      .filter((b) => b && b.supplier === vendor && !["Paid", "Cancelled", "Draft"].includes(b.status))
      .map((b) => ({
        id: String(b.id),
        ref: b.ref,
        date: b.date,
        due: b.due,
        po: Array.isArray(b.linkedPOs) ? b.linkedPOs.join(", ") : b.po,
        amount: Number(b.amount || b.grand || 0),
        outstanding: Number(b.outstanding ?? b.amount ?? b.grand ?? 0),
        supplier: b.supplier,
        status: b.status,
      }));
  } catch { return []; }
}

export function PaymentForm({
  initial, isEdit, onSubmit, onClose, prefillVendor, prefillBillRef,
}: {
  initial?: Partial<Values>;
  isEdit?: boolean;
  onSubmit: (values: any) => void;
  onClose: () => void;
  prefillVendor?: string;
  prefillBillRef?: string;
}) {
  const [v, setV] = useState<Values>({
    ref: initial?.ref || newRef(),
    supplier: initial?.supplier || prefillVendor || "",
    date: initial?.date || todayISO(),
    time: initial?.time || new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    amount: Number(initial?.amount || 0),
    bankCharges: Number(initial?.bankCharges || 0),
    method: initial?.method || "Bank Transfer",
    paidThrough: initial?.paidThrough || PAID_THROUGH[0],
    reference: initial?.reference || "",
    notes: initial?.notes || "",
    bill: initial?.bill || prefillBillRef || "",
    applied: initial?.applied || {},
    files: initial?.files || [],
  });
  const [error, setError] = useState<string | null>(null);
  const [extraVendors, setExtraVendors] = useState<string[]>([]);
  const [newVendorOpen, setNewVendorOpen] = useState(false);
  const [vendorSheetOpen, setVendorSheetOpen] = useState(false);
  const [refPrefsOpen, setRefPrefsOpen] = useState(false);
  const [refMode, setRefMode] = useState<"auto" | "manual">("auto");
  const [refPrefix, setRefPrefix] = useState("PAY-");
  const [refNext, setRefNext] = useState(String(Math.floor(10000 + Math.random() * 90000)));

  function set<K extends keyof Values>(k: K, val: Values[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  const openBills = useMemo(() => loadOpenBillsForVendor(v.supplier), [v.supplier]);

  useEffect(() => {
    if (prefillBillRef && openBills.length > 0 && Object.keys(v.applied).length === 0) {
      const target = openBills.find((b) => b.ref === prefillBillRef);
      if (target) {
        setV((p) => ({
          ...p,
          applied: { [target.id]: target.outstanding },
          amount: p.amount || target.outstanding,
        }));
      }
    }
  }, [prefillBillRef, openBills.length]);

  const totals = useMemo(() => {
    const used = Object.values(v.applied).reduce((s, n) => s + Number(n || 0), 0);
    const paid = Number(v.amount || 0);
    const excess = Math.max(0, paid - used);
    return { used, paid, excess, refunded: 0, charges: Number(v.bankCharges || 0) };
  }, [v.applied, v.amount, v.bankCharges]);

  function applyAmount(billId: string, amt: number) {
    setV((p) => ({ ...p, applied: { ...p.applied, [billId]: Math.max(0, Number(amt) || 0) } }));
  }

  function clearApplied() {
    setV((p) => ({ ...p, applied: {} }));
  }

  function payFull() {
    const next: Record<string, number> = {};
    let sum = 0;
    openBills.forEach((b) => { next[b.id] = b.outstanding; sum += b.outstanding; });
    setV((p) => ({ ...p, applied: next, amount: sum }));
  }

  function validate(): boolean {
    if (!v.supplier) { setError("Vendor Name is required"); return false; }
    if (!v.ref.trim()) { setError("Payment # is required"); return false; }
    if (!v.date) { setError("Payment Date is required"); return false; }
    if (!v.paidThrough) { setError("Paid Through account is required"); return false; }
    if (!(Number(v.amount) > 0)) { setError("Payment amount must be greater than zero"); return false; }
    setError(null);
    return true;
  }

  function handleSave(nextStatus = "Paid") {
    if (!validate()) return;
    const appliedBillId = Object.entries(v.applied).find(([, amt]) => Number(amt) > 0)?.[0];
    const appliedBill = openBills.find((b) => b.id === appliedBillId);
    const billLabel = appliedBill?.ref || v.bill || "—";

    onSubmit({
      ...v,
      bill: billLabel,
      status: nextStatus,
      type: totals.excess > 0 ? "Advance" : (totals.used >= openBills.reduce((s, b) => s + b.outstanding, 0) && openBills.length > 0 ? "Full" : "Partial"),
    });
  }

  function onFiles(files: FileList | null) {
    if (!files) return;
    const next = Array.from(files).slice(0, 5).map((f) => ({ name: f.name, size: f.size }));
    set("files", [...v.files, ...next].slice(0, 5));
  }

  return (
    <div className="space-y-0 pb-28 w-full lg:w-3/4">
      <div className="mb-4 text-xs text-muted-foreground">
        Fields marked with <span className="text-destructive">*</span> are required.
      </div>

      <Card>
        <Row label="Vendor Name" required tone="muted">
          <div className="space-y-1.5">
            <div className="flex items-center gap-3 flex-wrap">
              <ComboInput
                value={v.supplier}
                onChange={(val) => { set("supplier", val); set("applied", {}); }}
                options={[...extraVendors, ...SUPPLIERS]}
                placeholder="Select Vendor"
                withSearchButton
                onNewVendor={() => setNewVendorOpen(true)}
              />
              <span className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-border bg-card text-sm font-semibold text-foreground">
                <span className="h-4 w-4 rounded-full bg-success/20 text-success grid place-items-center text-[10px] font-bold">₨</span>
                Rs.
              </span>
            </div>
            {v.supplier && (
              <button type="button" onClick={() => setVendorSheetOpen(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline">
                <UserSquare2 className="h-3.5 w-3.5" /> View Vendor Details
              </button>
            )}
          </div>
        </Row>
      </Card>

      {!v.supplier ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-muted grid place-items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Select a vendor to continue</p>
          <p className="text-xs text-muted-foreground mt-1">Payment fields and outstanding bills will appear once a vendor is chosen.</p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <Card>
              <Row label="Payment #" required>
                <div className="flex items-center gap-2 max-w-sm">
                  <BaseInput value={v.ref} onChange={(e) => set("ref", e.target.value)} className="flex-1" />
                  <button type="button" onClick={() => setRefPrefsOpen(true)} title="Numbering settings"
                    className="h-9 w-9 grid place-items-center rounded-md border border-border bg-card text-primary hover:bg-muted">
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Row>

              <Row label="Payment Made" required>
                <div className="flex flex-wrap items-start gap-3 sm:gap-6">
                  <div>
                    <div className="flex items-stretch max-w-sm">
                      <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-xs font-semibold text-foreground">Rs.</span>
                      <input type="number" step="0.01" value={v.amount || ""}
                        onChange={(e) => set("amount", Number(e.target.value))}
                        className="h-9 px-2.5 rounded-r-md border border-border bg-card text-sm w-44 focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    {openBills.length > 0 && (
                      <label className="mt-1.5 inline-flex items-center gap-1.5 text-xs text-foreground cursor-pointer">
                        <input type="checkbox"
                          checked={v.amount === openBills.reduce((s, b) => s + b.outstanding, 0) && v.amount > 0}
                          onChange={(e) => { if (e.target.checked) payFull(); else { clearApplied(); set("amount", 0); } }}
                          className="accent-primary" />
                        Pay full amount (Rs. {fmtMoney(openBills.reduce((s, b) => s + b.outstanding, 0))})
                      </label>
                    )}
                  </div>
                  <div className="flex items-start gap-2">
                    <div>
                      <label className="block text-xs text-muted-foreground mb-1">Bank Charges (if any)</label>
                      <input type="number" step="0.01" value={v.bankCharges || ""}
                        onChange={(e) => set("bankCharges", Number(e.target.value))}
                        className="h-9 px-2.5 rounded-md border border-border bg-card text-sm w-44 focus:outline-none focus:ring-1 focus:ring-primary" />
                    </div>
                    <Info className="h-3.5 w-3.5 text-muted-foreground mt-7" />
                  </div>
                </div>
              </Row>

              <Row label="Payment Date" required>
                <DateInput value={v.date} onChange={(val) => set("date", val)} />
              </Row>

              <Row label="Payment Mode">
                <NativeSelect value={v.method} onChange={(e) => set("method", e.target.value)} options={PAYMENT_MODES} className="max-w-sm" />
              </Row>

              <Row label="Paid Through" required>
                <NativeSelect value={v.paidThrough} onChange={(e) => set("paidThrough", e.target.value)} options={PAID_THROUGH} className="max-w-sm" />
              </Row>

              <Row label="Reference #">
                <BaseInput value={v.reference} onChange={(e) => set("reference", e.target.value)} className="max-w-sm" />
              </Row>
            </Card>

            <div className="mt-2 flex items-center justify-end gap-1.5 text-[11px] text-muted-foreground pr-1">
              <span>(As on {fmtDate(todayISO())}) 1 PKR = 1 PKR</span>
              <button type="button" className="text-primary hover:text-primary/80"><Pencil className="h-3 w-3" /></button>
            </div>
          </div>

          <section className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
            <header className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
              <h3 className="text-sm font-bold text-foreground">Outstanding Bills</h3>
              <button type="button" onClick={clearApplied} className="text-xs font-semibold text-primary hover:underline">
                Clear Applied Amount
              </button>
            </header>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className="text-[11px] uppercase font-bold text-muted-foreground bg-muted/20">
                  <tr>
                    <th className="text-left px-4 py-2.5 w-32">Date</th>
                    <th className="text-left px-3 py-2.5">Bill#</th>
                    <th className="text-left px-3 py-2.5">PO#</th>
                    <th className="text-right px-3 py-2.5 w-36">Bill Amount</th>
                    <th className="text-right px-3 py-2.5 w-36">Amount Due</th>
                    <th className="text-right px-4 py-2.5 w-44">Payment</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {openBills.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-4 py-12 text-center text-sm text-muted-foreground">
                        There are no bills for this vendor.
                      </td>
                    </tr>
                  ) : openBills.map((b) => (
                    <tr key={b.id} className="hover:bg-muted/30">
                      <td className="px-4 py-3 text-foreground">{fmtDate(b.date)}</td>
                      <td className="px-3 py-3"><span className="font-semibold text-primary">{b.ref}</span></td>
                      <td className="px-3 py-3 text-muted-foreground">{b.po || "—"}</td>
                      <td className="px-3 py-3 text-right text-foreground">{fmtMoney(b.amount)}</td>
                      <td className="px-3 py-3 text-right text-foreground">{fmtMoney(b.outstanding)}</td>
                      <td className="px-4 py-3 text-right">
                        <input type="number" step="0.01" value={v.applied[b.id] ?? ""}
                          onChange={(e) => applyAmount(b.id, Number(e.target.value))}
                          max={b.outstanding}
                          placeholder="0.00"
                          className="h-9 w-32 px-2.5 text-right rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/10">
                    <td colSpan={5} className="px-4 py-3 text-right text-sm font-semibold text-muted-foreground">Total :</td>
                    <td className="px-4 py-3 text-right text-sm font-bold text-foreground">{fmtMoney(totals.used)}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          </section>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div />
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
              <SummaryRow label="Amount Paid:" value={totals.paid} />
              <SummaryRow label="Amount used for Payments:" value={totals.used} />
              <SummaryRow label="Amount Refunded:" value={totals.refunded} />
              <SummaryRow label="Amount in Excess:" value={totals.excess} highlight />
              <SummaryRow label="Bank Charges :" value={totals.charges} />
            </div>
          </div>

          <div className="mt-6">
            <label className="block text-sm font-semibold text-foreground mb-1.5">Notes <span className="text-xs text-muted-foreground font-normal">(Internal use. Not visible to vendor)</span></label>
            <textarea value={v.notes} onChange={(e) => set("notes", e.target.value)} rows={4}
              className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
          </div>

          <div className="mt-4">
            <FileAttach
              files={v.files}
              onAdd={onFiles}
              onRemove={(idx) => set("files", v.files.filter((_, i) => i !== idx))}
            />
          </div>
        </>
      )}

      <div className="fixed bottom-0 left-0 right-0 bg-card/95 backdrop-blur border-t border-border z-30 lg:left-[var(--sidebar-width,16rem)]">
        <div className="px-4 sm:px-6 py-3 flex items-center justify-between gap-3 max-w-screen-2xl mx-auto">
          <div className="text-xs">
            {error
              ? <span className="text-destructive font-semibold">{error}</span>
              : <span className="text-muted-foreground">Total: <span className="font-bold text-foreground">Rs. {fmtMoney(totals.paid)}</span></span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="button" onClick={() => handleSave("Paid")}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> {isEdit ? "Save Changes" : "Save Payment"}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={refPrefsOpen} onOpenChange={setRefPrefsOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-muted/40 border-b border-border">
            <DialogTitle className="text-base">Configure Payment# Preferences</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" checked={refMode === "auto"} onChange={() => setRefMode("auto")} className="mt-0.5 accent-primary" />
              <span className="text-sm font-semibold text-foreground">Continue auto-generating payment numbers</span>
            </label>
            {refMode === "auto" && (
              <div className="ml-6 grid grid-cols-2 gap-3 max-w-sm">
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Prefix</label>
                  <input value={refPrefix} onChange={(e) => setRefPrefix(e.target.value)}
                    className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm" />
                </div>
                <div>
                  <label className="block text-xs text-muted-foreground mb-1">Next Number</label>
                  <input value={refNext} onChange={(e) => setRefNext(e.target.value)}
                    className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm" />
                </div>
              </div>
            )}
            <label className="flex items-center gap-2 cursor-pointer">
              <input type="radio" checked={refMode === "manual"} onChange={() => setRefMode("manual")} className="accent-primary" />
              <span className="text-sm font-semibold text-foreground">Enter payment numbers manually</span>
            </label>
          </div>
          <DialogFooter className="px-6 py-3 border-t border-border bg-muted/20 sm:justify-start gap-2">
            <button type="button" onClick={() => { if (refMode === "auto") set("ref", `${refPrefix}${refNext}`); setRefPrefsOpen(false); }}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90">Save</button>
            <button type="button" onClick={() => setRefPrefsOpen(false)}
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

      <VendorDetailsSheet
        open={vendorSheetOpen}
        vendorName={v.supplier}
        onClose={() => setVendorSheetOpen(false)}
      />
    </div>
  );
}

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
function ComboInput({ value, onChange, options, placeholder, withSearchButton, onNewVendor }: { value: string; onChange: (val: string) => void; options: string[]; placeholder?: string; withSearchButton?: boolean; onNewVendor?: () => void; }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [typing, setTyping] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    function onDoc(e: MouseEvent) { if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false); }
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);
  const q = (typing ? query : "").toLowerCase();
  const filtered = q ? options.filter((o) => o.toLowerCase().includes(q)) : options;
  return (
    <div ref={wrapRef} className="relative flex items-stretch flex-1 min-w-[280px] max-w-xl">
      <div className="relative flex-1">
        <input
          value={typing ? query : value}
          onFocus={() => setOpen(true)}
          onMouseDown={() => setOpen(true)}
          onChange={(e) => { setTyping(true); setQuery(e.target.value); onChange(e.target.value); setOpen(true); }}
          placeholder={placeholder}
          className="h-10 w-full pl-3 pr-9 rounded-l-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
        <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        {open && (
          <div className="absolute z-40 left-0 right-0 mt-1 rounded-lg border border-border bg-popover shadow-xl overflow-hidden">
            <ul className="max-h-72 overflow-auto py-1">
              {filtered.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">No vendors found</li>}
              {filtered.map((o) => (
                <li key={o}>
                  <button type="button" onClick={() => { onChange(o); setOpen(false); setQuery(""); setTyping(false); }}
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
        className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder={placeholder} />
      {value && <div className="text-[11px] text-muted-foreground mt-1">{fmtDate(value)}</div>}
    </div>
  );
}
function SummaryRow({ label, value, highlight }: { label: string; value: number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className={`text-sm ${highlight ? "text-warning font-semibold inline-flex items-center gap-1.5" : "text-foreground"}`}>
        {highlight && <AlertTriangle className="h-3.5 w-3.5" />} {label}
      </span>
      <span className={`text-sm font-semibold text-foreground`}>Rs. {fmtMoney(value)}</span>
    </div>
  );
}
function FileAttach({ files, onAdd, onRemove }: { files: { name: string; size: number }[]; onAdd: (f: FileList | null) => void; onRemove: (idx: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">Attachments</label>
      <div className="rounded-md border border-dashed border-border bg-muted/20 p-3">
        <button type="button" onClick={() => inputRef.current?.click()}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-md border border-border bg-card text-xs font-semibold text-foreground hover:bg-muted">
          <Paperclip className="h-3.5 w-3.5" /> Upload File
        </button>
        <input ref={inputRef} type="file" multiple className="hidden" onChange={(e) => onAdd(e.target.files)} />
        <p className="text-[11px] text-muted-foreground mt-1.5">You can upload a maximum of 5 files, 10MB each</p>
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
