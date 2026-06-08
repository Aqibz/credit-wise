import { useMemo, useState } from "react";
import { format } from "date-fns";
import { Info, Settings2, Pencil, Upload } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const PAYMENT_MODES = ["Cash", "Bank Transfer", "Cheque", "Card", "Online"];
const PAID_THROUGH = ["Bank Acc 1 (GBP)", "Bank Acc 2 (USD)", "Petty Cash", "Undeposited Funds"];

export function RecordPaymentDialog({
  open,
  onOpenChange,
  bill,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bill: any;
  onSave?: (payload: any) => void;
}) {
  const outstanding = Number(bill?.outstanding ?? bill?.grand ?? bill?.amount ?? 0);
  const currency = bill?.currency || "USD";

  const [amount, setAmount] = useState<string>(outstanding ? String(outstanding) : "");
  const [bankCharges, setBankCharges] = useState("");
  const [mode, setMode] = useState("Cash");
  const [date, setDate] = useState<string>(format(new Date(), "yyyy-MM-dd"));
  const [paymentNo, setPaymentNo] = useState(`PAY-${Math.floor(1000 + Math.random() * 9000)}`);
  const [paidThrough, setPaidThrough] = useState(PAID_THROUGH[0]);
  const [reference, setReference] = useState("");
  const [notes, setNotes] = useState("");
  const [error, setError] = useState<string | null>(null);

  const title = useMemo(() => `Payment for ${bill?.ref ?? "Bill"}`, [bill?.ref]);

  function handleSave() {
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError("Enter a valid payment amount.");
    if (!date) return setError("Payment date is required.");
    if (!paymentNo.trim()) return setError("Payment # is required.");
    if (!paidThrough) return setError("Select a Paid Through account.");

    onSave?.({
      amount: amt,
      bankCharges: Number(bankCharges) || 0,
      mode,
      date,
      paymentNo: paymentNo.trim(),
      paidThrough,
      reference: reference.trim(),
      notes: notes.trim(),
    });
    onOpenChange(false);
  }

  const labelCls = "block text-[11px] font-semibold uppercase tracking-wider text-slate-600 mb-1";
  const reqCls = labelCls;
  const req = <span className="text-rose-500 ml-0.5">*</span>;
  const inputCls =
    "w-full h-9 rounded-md border border-slate-300 bg-white px-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary";
  const selectCls = inputCls + " appearance-none pr-8";

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl p-0 overflow-hidden gap-0">
        <DialogHeader className="px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white">
          <DialogTitle className="text-base font-semibold text-slate-800">{title}</DialogTitle>
        </DialogHeader>

        <div className="px-5 py-4 max-h-[70vh] overflow-y-auto">
          {/* Payment amount */}
          <div className="mb-4">
            <label className={reqCls}>
              Payment Made{req} <span className="font-normal normal-case tracking-normal text-slate-500">({currency})</span>
            </label>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => { setAmount(e.target.value); setError(null); }}
              className={inputCls + " text-base font-semibold"}
            />
            {outstanding > 0 && (
              <div className="mt-1 text-[11px] text-slate-500">
                Outstanding: <span className="font-semibold text-slate-700">{currency} {outstanding.toLocaleString()}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className={labelCls}>
                <span className="inline-flex items-center gap-1">Bank Charges (if any) <Info className="h-3 w-3 text-slate-400" /></span>
              </label>
              <input
                type="number"
                step="0.01"
                value={bankCharges}
                onChange={(e) => setBankCharges(e.target.value)}
                className={inputCls}
              />
            </div>

            <div>
              <label className={labelCls}>Payment Mode</label>
              <div className="relative">
                <select value={mode} onChange={(e) => setMode(e.target.value)} className={selectCls}>
                  {PAYMENT_MODES.map((m) => <option key={m}>{m}</option>)}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</div>
              </div>
            </div>

            <div>
              <label className={reqCls}>Payment Date{req}</label>
              <input
                type="date"
                value={date}
                onChange={(e) => { setDate(e.target.value); setError(null); }}
                className={inputCls}
              />
            </div>

            <div>
              <label className={reqCls}>Payment #{req}</label>
              <div className="relative">
                <input
                  value={paymentNo}
                  onChange={(e) => setPaymentNo(e.target.value)}
                  className={inputCls + " pr-9"}
                />
                <button type="button" title="Configure numbering" className="absolute right-1.5 top-1/2 -translate-y-1/2 h-7 w-7 grid place-items-center rounded text-slate-500 hover:bg-slate-100">
                  <Settings2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>

            <div>
              <label className={reqCls}>Paid Through{req}</label>
              <div className="relative">
                <select value={paidThrough} onChange={(e) => setPaidThrough(e.target.value)} className={selectCls}>
                  {PAID_THROUGH.map((p) => <option key={p}>{p}</option>)}
                </select>
                <div className="pointer-events-none absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 text-xs">▾</div>
              </div>
            </div>

            <div>
              <label className={labelCls}>Reference #</label>
              <input
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="mt-4">
            <label className={labelCls}>Notes</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
          </div>

          <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
            <span>(As on {format(new Date(), "d MMM yyyy")}) 1 {currency} = 1 {currency}</span>
            <button type="button" className="text-primary hover:text-primary/80"><Pencil className="h-3 w-3" /></button>
          </div>

          <div className="mt-4">
            <label className={labelCls}>Attachments</label>
            <button type="button" className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
              <Upload className="h-3.5 w-3.5" /> Upload File <span className="text-slate-400">▾</span>
            </button>
            <div className="mt-1 text-[11px] text-slate-500">You can upload a maximum of 5 files, 10MB each</div>
          </div>

          {error && <div className="mt-3 text-xs text-rose-600">{error}</div>}
        </div>

        <div className="px-5 py-3 border-t border-slate-200 bg-white flex items-center gap-2">
          <button
            onClick={handleSave}
            className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
          >
            Save
          </button>
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 px-4 rounded-md border border-slate-300 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50"
          >
            Cancel
          </button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
