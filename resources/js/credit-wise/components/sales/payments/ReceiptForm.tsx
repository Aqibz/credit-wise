import { useEffect, useMemo, useState } from "react";
import { Save, Wallet, User, FileText } from "lucide-react";
import {
  FormCard, FormSection, FormRow, FormRowDouble, FormRowFull,
} from "@/components/forms/SideForm";

const MODES = ["Cash", "Bank Transfer", "Cheque", "EasyPaisa", "JazzCash", "Card"];
const PAID_INTO = ["Bank Acc 1 (PKR)", "Bank Acc 2 (PKR)", "Petty Cash", "Cash Drawer"];
const COLLECTORS = ["Bilal", "Counter", "Recovery Agent", "Sales Officer"];

type Contract = { ref: string; customer: string; monthly: number; tenure: number };

const SEED_CONTRACTS: Contract[] = [
  { ref: "HP-2001", customer: "Sara Khan", monthly: 13500, tenure: 12 },
  { ref: "HP-2002", customer: "Ahmed Raza", monthly: 13800, tenure: 10 },
  { ref: "HP-2003", customer: "Sara Khan", monthly: 9800, tenure: 12 },
  { ref: "HP-2004", customer: "Faisal Mehmood", monthly: 8500, tenure: 18 },
  { ref: "HP-2005", customer: "Hira Tariq", monthly: 8200, tenure: 6 },
  { ref: "HP-2006", customer: "Adnan Pervaiz", monthly: 7100, tenure: 9 },
  { ref: "HP-2007", customer: "Fatima Noor", monthly: 7600, tenure: 10 },
  { ref: "HP-2009", customer: "Rashid Mehmood", monthly: 12000, tenure: 12 },
];

function loadContracts(): Contract[] {
  if (typeof window === "undefined") return SEED_CONTRACTS;
  try {
    const raw = window.localStorage.getItem("qcrm.contracts");
    if (!raw) return SEED_CONTRACTS;
    const arr = JSON.parse(raw) as any[];
    const mapped: Contract[] = arr
      .filter((c) => c && c.ref)
      .map((c) => ({
        ref: String(c.ref),
        customer: String(c.customer || ""),
        monthly: Number(c.monthly || 0),
        tenure: Number(c.tenure || 0),
      }));
    return mapped.length ? mapped : SEED_CONTRACTS;
  } catch {
    return SEED_CONTRACTS;
  }
}

const todayISO = () => new Date().toISOString().slice(0, 10);
const newRef = () => `PR-${Math.floor(10000 + Math.random() * 90000)}`;

export type ReceiptValues = {
  ref: string;
  date: string;
  contract: string;
  customer: string;
  installment: string;
  due: number;
  paid: number;
  mode: string;
  paidInto: string;
  reference: string;
  collectedBy: string;
  status: string;
  notes: string;
};

const inputCls =
  "h-9 w-full rounded-md border border-border bg-card px-2.5 text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary";

export function ReceiptForm({
  initial, isEdit, onSubmit, onClose, prefillContract,
}: {
  initial?: Partial<ReceiptValues>;
  isEdit?: boolean;
  onSubmit: (v: ReceiptValues) => void;
  onClose: () => void;
  prefillContract?: string;
}) {
  const contracts = useMemo(loadContracts, []);
  const [v, setV] = useState<ReceiptValues>({
    ref: initial?.ref || newRef(),
    date: initial?.date || todayISO(),
    contract: initial?.contract || prefillContract || "",
    customer: initial?.customer || "",
    installment: initial?.installment || "",
    due: Number(initial?.due || 0),
    paid: Number(initial?.paid || 0),
    mode: initial?.mode || "Cash",
    paidInto: initial?.paidInto || PAID_INTO[0],
    reference: initial?.reference || "",
    collectedBy: initial?.collectedBy || COLLECTORS[0],
    status: initial?.status || "Cleared",
    notes: initial?.notes || "",
  });
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof ReceiptValues>(k: K, val: ReceiptValues[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  // Auto-fill customer/due when a contract is selected
  useEffect(() => {
    if (!v.contract) return;
    const c = contracts.find((x) => x.ref === v.contract);
    if (!c) return;
    setV((p) => ({
      ...p,
      customer: p.customer || c.customer,
      due: p.due || c.monthly,
      paid: p.paid || c.monthly,
    }));
  }, [v.contract, contracts]);

  function validate(): boolean {
    if (!v.ref.trim()) { setError("Payment # is required"); return false; }
    if (!v.date) { setError("Payment Date is required"); return false; }
    if (!v.contract) { setError("Contract # is required"); return false; }
    if (!v.customer) { setError("Customer is required"); return false; }
    if (!(Number(v.paid) > 0)) { setError("Paid amount must be greater than zero"); return false; }
    setError(null);
    return true;
  }

  function save() {
    if (!validate()) return;
    const now = new Date();
    const time = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    const at = `${v.date} · ${time}`;
    onSubmit({ ...v, at } as any);
  }


  const balance = Math.max(0, Number(v.due || 0) - Number(v.paid || 0));

  return (
    <div className="space-y-4 pb-28">
      <div className="text-xs text-muted-foreground w-full lg:w-3/4">
        Fields marked with <span className="text-destructive">*</span> are required.
      </div>

      <FormCard>
        <FormSection icon={<FileText className="h-4 w-4" />} title="Payment Details">
          <FormRowDouble
            left={{
              label: "Payment #", required: true,
              children: <input className={inputCls} value={v.ref} onChange={(e) => set("ref", e.target.value)} />,
            }}
            right={{
              label: "Payment Date", required: true,
              children: <input type="date" className={inputCls} value={v.date} onChange={(e) => set("date", e.target.value)} />,
            }}
          />
          <FormRowDouble
            left={{
              label: "Contract #", required: true,
              children: (
                <select className={inputCls} value={v.contract} onChange={(e) => set("contract", e.target.value)}>
                  <option value="">Select contract…</option>
                  {contracts.map((c) => (
                    <option key={c.ref} value={c.ref}>{c.ref} — {c.customer}</option>
                  ))}
                </select>
              ),
            }}
            right={{
              label: "Installment",
              hint: "e.g. 3 of 12",
              children: <input className={inputCls} value={v.installment} onChange={(e) => set("installment", e.target.value)} placeholder="3 of 12" />,
            }}
          />
        </FormSection>

        <FormSection icon={<User className="h-4 w-4" />} title="Customer">
          <FormRow label="Customer" required>
            <input className={inputCls} value={v.customer} onChange={(e) => set("customer", e.target.value)} />
          </FormRow>
        </FormSection>

        <FormSection icon={<Wallet className="h-4 w-4" />} title="Amount & Mode">
          <FormRowDouble
            left={{
              label: "Due (Rs.)",
              children: <input type="number" className={inputCls} value={v.due || ""} onChange={(e) => set("due", Number(e.target.value))} />,
            }}
            right={{
              label: "Paid (Rs.)", required: true,
              hint: balance > 0 ? `Balance after this payment: Rs. ${balance.toLocaleString()}` : undefined,
              children: <input type="number" className={inputCls} value={v.paid || ""} onChange={(e) => set("paid", Number(e.target.value))} />,
            }}
          />
          <FormRowDouble
            left={{
              label: "Mode",
              children: (
                <select className={inputCls} value={v.mode} onChange={(e) => set("mode", e.target.value)}>
                  {MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
              ),
            }}
            right={{
              label: "Paid Into",
              children: (
                <select className={inputCls} value={v.paidInto} onChange={(e) => set("paidInto", e.target.value)}>
                  {PAID_INTO.map((m) => <option key={m}>{m}</option>)}
                </select>
              ),
            }}
          />
          <FormRowDouble
            left={{
              label: "Reference #",
              hint: "Cheque #, transaction ID, etc.",
              children: <input className={inputCls} value={v.reference} onChange={(e) => set("reference", e.target.value)} />,
            }}
            right={{
              label: "Collected By",
              children: (
                <select className={inputCls} value={v.collectedBy} onChange={(e) => set("collectedBy", e.target.value)}>
                  {COLLECTORS.map((m) => <option key={m}>{m}</option>)}
                </select>
              ),
            }}
          />
          <FormRow label="Status">
            <select className={inputCls} value={v.status} onChange={(e) => set("status", e.target.value)}>
              {["Pending", "Cleared", "Bounced", "Cancelled"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </FormRow>
        </FormSection>

        <FormSection title="Notes">
          <FormRow label="Notes">
            <textarea
              className="w-full rounded-md border border-border bg-card px-2.5 py-2 text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              rows={3} value={v.notes} onChange={(e) => set("notes", e.target.value)}
            />
          </FormRow>
        </FormSection>

        {error && (
          <FormRowFull>
            <div className="text-sm text-destructive">{error}</div>
          </FormRowFull>
        )}
      </FormCard>

      <div className="fixed bottom-0 left-0 right-0 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80 z-30">
        <div className="px-5 py-3 flex items-center gap-2 justify-end">
          <button
            type="button" onClick={onClose}
            className="h-9 px-4 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted"
          >
            Cancel
          </button>
          <button
            type="button" onClick={save}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 inline-flex items-center gap-1.5"
          >
            <Save className="h-3.5 w-3.5" /> {isEdit ? "Update Payment" : "Save Payment"}
          </button>
        </div>
      </div>
    </div>
  );
}
