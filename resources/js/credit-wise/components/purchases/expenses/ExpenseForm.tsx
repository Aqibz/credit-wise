import { useEffect, useRef, useState, type ReactNode } from "react";
import {
  Save, ChevronDown, Search, Settings2, Paperclip, Trash2, Send,
  AlertTriangle, Plus, Receipt, Banknote, Building2, Repeat,
} from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";

const CATEGORIES = [
  "Freight", "Loading", "Utilities", "Fuel", "Rent", "Salaries",
  "Internet", "Electricity", "Maintenance", "Office Supplies", "Other",
];
const PAYEES = [
  "TCS Logistics", "Model Town Landlord", "Payroll Run", "Nayatel",
  "LESCO", "PSO Card", "Daily Labor", "K-Electric", "SNGPL", "PTCL",
];
const PAYMENT_MODES = ["Cash", "Bank"] as const;
const PAID_THROUGH_BANK = ["Bank Acc 1 (PKR)", "Bank Acc 2 (PKR)", "Undeposited Funds"];
const PAID_THROUGH_CASH = ["Petty Cash", "Main Cash Drawer"];
const TYPES = ["One-time", "Recurring"] as const;
const REMINDERS = ["No", "Yes"];
const STATUSES = ["Paid", "Pending", "Cancelled"];

type Values = {
  ref: string;
  date: string;
  time: string;
  category: string;
  vendor: string;
  type: typeof TYPES[number];
  paymentMode: typeof PAYMENT_MODES[number];
  paidThrough: string;
  amount: number;
  reference: string;
  nextDue: string;
  reminder: string;
  status: string;
  description: string;
  files: { name: string; size: number }[];
};

const todayISO = () => new Date().toISOString().slice(0, 10);
const fmtDate = (iso: string) => {
  if (!iso) return "";
  try { return new Date(iso).toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }); }
  catch { return iso; }
};
const fmtMoney = (n: number) => Number(n || 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const newRef = () => `EXP-${Math.floor(10000 + Math.random() * 90000)}`;
const nowTime = () => new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });

export function ExpenseForm({
  initial, isEdit, onSubmit, onClose,
}: {
  initial?: Partial<Values>;
  isEdit?: boolean;
  onSubmit: (values: any) => void;
  onClose: () => void;
}) {
  const [v, setV] = useState<Values>({
    ref: initial?.ref || newRef(),
    date: initial?.date || todayISO(),
    time: initial?.time || nowTime(),
    category: initial?.category || "",
    vendor: initial?.vendor || "",
    type: (initial?.type as any) || "One-time",
    paymentMode: (initial?.paymentMode as any) || "Cash",
    paidThrough: initial?.paidThrough || "Petty Cash",
    amount: Number(initial?.amount || 0),
    reference: initial?.reference || "",
    nextDue: initial?.nextDue || "",
    reminder: initial?.reminder || "No",
    status: initial?.status || "Paid",
    description: initial?.description || "",
    files: initial?.files || [],
  });
  const [error, setError] = useState<string | null>(null);
  const [extraPayees, setExtraPayees] = useState<string[]>([]);
  const [refPrefsOpen, setRefPrefsOpen] = useState(false);
  const [refMode, setRefMode] = useState<"auto" | "manual">("auto");
  const [refPrefix, setRefPrefix] = useState("EXP-");
  const [refNext, setRefNext] = useState(String(Math.floor(10000 + Math.random() * 90000)));

  function set<K extends keyof Values>(k: K, val: Values[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  useEffect(() => {
    const allowed = v.paymentMode === "Cash" ? PAID_THROUGH_CASH : PAID_THROUGH_BANK;
    if (!allowed.includes(v.paidThrough)) {
      setV((p) => ({ ...p, paidThrough: allowed[0] }));
    }
  }, [v.paymentMode]);

  function validate(): boolean {
    if (!v.category) { setError("Category is required"); return false; }
    if (!v.ref.trim()) { setError("Voucher # is required"); return false; }
    if (!v.date) { setError("Expense Date is required"); return false; }
    if (!(Number(v.amount) > 0)) { setError("Amount must be greater than zero"); return false; }
    if (v.type === "Recurring" && !v.nextDue) { setError("Next Due Date is required for recurring expenses"); return false; }
    setError(null);
    return true;
  }

  function handleSave(nextStatus = v.status) {
    if (!validate()) return;
    onSubmit({ ...v, status: nextStatus });
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
        <Row label="Category" required tone="muted">
          <ComboInput
            value={v.category}
            onChange={(val) => set("category", val)}
            options={CATEGORIES}
            placeholder="Select Category"
            withSearchButton
          />
        </Row>
      </Card>

      {!v.category ? (
        <div className="mt-6 rounded-xl border border-dashed border-border bg-muted/20 p-10 text-center">
          <div className="mx-auto h-10 w-10 rounded-full bg-muted grid place-items-center mb-2">
            <AlertTriangle className="h-5 w-5 text-muted-foreground" />
          </div>
          <p className="text-sm font-semibold text-foreground">Select a category to continue</p>
          <p className="text-xs text-muted-foreground mt-1">Expense fields will appear once a category is chosen.</p>
        </div>
      ) : (
        <>
          <div className="mt-6">
            <Card>
              <Row label="Voucher #" required>
                <div className="flex items-center gap-2 max-w-sm">
                  <BaseInput value={v.ref} onChange={(e) => set("ref", e.target.value)} className="flex-1" />
                  <button type="button" onClick={() => setRefPrefsOpen(true)} title="Numbering settings"
                    className="h-9 w-9 grid place-items-center rounded-md border border-border bg-card text-primary hover:bg-muted">
                    <Settings2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </Row>

              <Row label="Vendor / Payee">
                <ComboInput
                  value={v.vendor}
                  onChange={(val) => set("vendor", val)}
                  options={[...extraPayees, ...PAYEES]}
                  placeholder="Select or type a payee"
                  withSearchButton
                  onNewVendor={() => {
                    const name = window.prompt("New payee name");
                    if (name && name.trim()) {
                      setExtraPayees((prev) => [name.trim(), ...prev]);
                      set("vendor", name.trim());
                    }
                  }}
                />
              </Row>

              <Row label="Amount" required>
                <div className="flex items-stretch max-w-sm">
                  <span className="inline-flex items-center px-3 rounded-l-md border border-r-0 border-border bg-muted text-xs font-semibold text-foreground">Rs.</span>
                  <input type="number" step="0.01" value={v.amount || ""}
                    onChange={(e) => set("amount", Number(e.target.value))}
                    className="h-9 px-2.5 rounded-r-md border border-border bg-card text-sm w-44 focus:outline-none focus:ring-1 focus:ring-primary" />
                </div>
              </Row>

              <Row label="Expense Date" required>
                <div className="flex flex-wrap items-end gap-3">
                  <DateInput value={v.date} onChange={(val) => set("date", val)} />
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Time</label>
                    <input type="time" value={convertTo24(v.time)} onChange={(e) => set("time", convertFrom24(e.target.value))}
                      className="h-9 px-2.5 rounded-md border border-border bg-card text-sm w-32 focus:outline-none focus:ring-1 focus:ring-primary" />
                  </div>
                </div>
              </Row>

              <Row label="Payment Mode" required>
                <SegmentedControl
                  value={v.paymentMode}
                  onChange={(val) => set("paymentMode", val as any)}
                  options={[
                    { value: "Cash", label: "Cash", icon: <Banknote className="h-3.5 w-3.5" /> },
                    { value: "Bank", label: "Bank", icon: <Building2 className="h-3.5 w-3.5" /> },
                  ]}
                />
              </Row>

              <Row label="Paid Through" required>
                <NativeSelect
                  value={v.paidThrough}
                  onChange={(e) => set("paidThrough", e.target.value)}
                  options={v.paymentMode === "Cash" ? PAID_THROUGH_CASH : PAID_THROUGH_BANK}
                  className="max-w-sm"
                />
              </Row>

              <Row label="Reference #">
                <BaseInput value={v.reference} onChange={(e) => set("reference", e.target.value)}
                  placeholder="Cheque #, Txn ID, etc." className="max-w-sm" />
              </Row>
            </Card>
          </div>

          <section className="mt-4 rounded-xl border border-border bg-card overflow-hidden">
            <header className="flex items-center justify-between px-4 py-2.5 bg-muted/40 border-b border-border">
              <h3 className="text-sm font-bold text-foreground inline-flex items-center gap-2">
                <Repeat className="h-4 w-4 text-primary" /> Schedule
              </h3>
            </header>
            <div className="p-4 sm:p-5 space-y-4">
              <SegmentedControl
                value={v.type}
                onChange={(val) => set("type", val as any)}
                options={[
                  { value: "One-time", label: "One-time" },
                  { value: "Recurring", label: "Recurring" },
                ]}
              />
              {v.type === "Recurring" && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl">
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Next Due Date <span className="text-destructive">*</span></label>
                    <input type="date" value={v.nextDue} min={v.date}
                      onChange={(e) => set("nextDue", e.target.value)}
                      className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
                    {v.nextDue && <div className="text-[11px] text-muted-foreground mt-1">{fmtDate(v.nextDue)}</div>}
                  </div>
                  <div>
                    <label className="block text-xs text-muted-foreground mb-1">Auto Reminder</label>
                    <NativeSelect value={v.reminder} onChange={(e) => set("reminder", e.target.value)} options={REMINDERS} />
                  </div>
                </div>
              )}
            </div>
          </section>

          <div className="mt-4 grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-foreground mb-1.5">
                Description <span className="text-xs text-muted-foreground font-normal">(Internal notes)</span>
              </label>
              <textarea value={v.description} onChange={(e) => set("description", e.target.value)} rows={5}
                placeholder="What was this expense for?"
                className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary" />
            </div>
            <div className="rounded-xl border border-warning/30 bg-warning/10 p-4">
              <div className="flex items-center gap-2 mb-3">
                <Receipt className="h-4 w-4 text-warning" />
                <h4 className="text-sm font-bold text-foreground">Summary</h4>
              </div>
              <SummaryRow label="Category" value={v.category || "—"} />
              <SummaryRow label="Payee" value={v.vendor || "—"} />
              <SummaryRow label="Type" value={v.type} />
              <SummaryRow label="Payment Mode" value={v.paymentMode} />
              <SummaryRow label="Paid Through" value={v.paidThrough} />
              <div className="border-t border-warning/30 mt-2 pt-2">
                <SummaryRow label="Amount" value={`Rs. ${fmtMoney(v.amount)}`} highlight />
              </div>
            </div>
          </div>

          <div className="mt-4">
            <Card>
              <Row label="Status">
                <NativeSelect value={v.status} onChange={(e) => set("status", e.target.value)} options={STATUSES} className="max-w-sm" />
              </Row>
            </Card>
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
              : <span className="text-muted-foreground">Total: <span className="font-bold text-foreground">Rs. {fmtMoney(v.amount)}</span></span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose}
              className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
              Cancel
            </button>
            {!isEdit && (
              <button type="button" onClick={() => handleSave("Pending")}
                className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted inline-flex items-center gap-2">
                <Save className="h-4 w-4" /> Save as Draft
              </button>
            )}
            <button type="button" onClick={() => handleSave(isEdit ? v.status : "Paid")}
              className="h-10 px-5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-2">
              <Send className="h-4 w-4" /> {isEdit ? "Save Changes" : "Save Expense"}
            </button>
          </div>
        </div>
      </div>

      <Dialog open={refPrefsOpen} onOpenChange={setRefPrefsOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <DialogHeader className="px-6 py-4 bg-muted/40 border-b border-border">
            <DialogTitle className="text-base">Configure Voucher # Preferences</DialogTitle>
          </DialogHeader>
          <div className="px-6 py-5 space-y-4">
            <label className="flex items-start gap-2 cursor-pointer">
              <input type="radio" checked={refMode === "auto"} onChange={() => setRefMode("auto")} className="mt-0.5 accent-primary" />
              <span className="text-sm font-semibold text-foreground">Continue auto-generating voucher numbers</span>
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
              <span className="text-sm font-semibold text-foreground">Enter voucher numbers manually</span>
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
    </div>
  );
}

function convertTo24(t: string): string {
  if (!t) return "";
  const m = /^(\d{1,2}):(\d{2})\s*(AM|PM)?$/i.exec(t.trim());
  if (!m) return t;
  let h = Number(m[1]);
  const mm = m[2];
  const ap = m[3]?.toUpperCase();
  if (ap === "PM" && h < 12) h += 12;
  if (ap === "AM" && h === 12) h = 0;
  return `${String(h).padStart(2, "0")}:${mm}`;
}
function convertFrom24(t: string): string {
  if (!t) return "";
  const [hh, mm] = t.split(":");
  let h = Number(hh);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12;
  if (h === 0) h = 12;
  return `${String(h).padStart(2, "0")}:${mm} ${ap}`;
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
function NativeSelect({ value, onChange, options, placeholder, className = "" }: { value: string; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; options: readonly string[]; placeholder?: string; className?: string }) {
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
function SegmentedControl({ value, onChange, options }: {
  value: string;
  onChange: (val: string) => void;
  options: { value: string; label: string; icon?: ReactNode }[];
}) {
  return (
    <div className="inline-flex p-1 rounded-lg border border-border bg-muted/40">
      {options.map((o) => {
        const active = o.value === value;
        return (
          <button
            key={o.value}
            type="button"
            onClick={() => onChange(o.value)}
            className={`h-8 px-3.5 rounded-md text-xs font-semibold inline-flex items-center gap-1.5 transition-colors ${
              active
                ? "bg-card text-foreground shadow-sm border border-border"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            {o.icon}{o.label}
          </button>
        );
      })}
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
              {filtered.length === 0 && <li className="px-3 py-3 text-sm text-muted-foreground">No matches found</li>}
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
                <Plus className="h-4 w-4" /> New Payee
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
      <label className="block text-xs text-muted-foreground mb-1">Date</label>
      <input type="date" value={value} min={min} onChange={(e) => onChange(e.target.value)}
        className="h-9 w-44 px-2.5 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
        placeholder={placeholder} />
      {value && <div className="text-[11px] text-muted-foreground mt-1">{fmtDate(value)}</div>}
    </div>
  );
}
function SummaryRow({ label, value, highlight }: { label: string; value: string | number; highlight?: boolean }) {
  return (
    <div className="flex items-center justify-between py-1">
      <span className="text-xs text-muted-foreground">{label}</span>
      <span className={`text-sm font-semibold ${highlight ? "text-warning" : "text-foreground"} truncate max-w-[60%] text-right`}>
        {value}
      </span>
    </div>
  );
}
function FileAttach({ files, onAdd, onRemove }: { files: { name: string; size: number }[]; onAdd: (f: FileList | null) => void; onRemove: (idx: number) => void }) {
  const inputRef = useRef<HTMLInputElement>(null);
  return (
    <div>
      <label className="block text-sm font-semibold text-foreground mb-1.5">Attachments / Receipts</label>
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
