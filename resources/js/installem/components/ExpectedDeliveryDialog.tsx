import { useState } from "react";
import { format } from "date-fns";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";

export function ExpectedDeliveryDialog({
  open,
  onOpenChange,
  initialDate,
  initialNotes,
  onSave,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialDate?: string;
  initialNotes?: string;
  onSave: (payload: { date: string; notes: string }) => void;
}) {
  const [date, setDate] = useState<Date | undefined>(
    initialDate ? new Date(initialDate) : undefined,
  );
  const [notes, setNotes] = useState(initialNotes ?? "");
  const [error, setError] = useState<string | null>(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  function handleSave() {
    if (!date) return setError("Please select a date.");
    if (!notes.trim()) return setError("Notes are required.");
    onSave({ date: format(date, "yyyy-MM-dd"), notes: notes.trim() });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-sm p-0 overflow-hidden">
        <DialogHeader className="px-5 py-3 border-b border-slate-200 bg-slate-50">
          <DialogTitle className="text-base font-semibold text-slate-800">
            Expected Delivery Date
          </DialogTitle>
        </DialogHeader>

        <div className="px-3 pt-2 pb-4">
          <Calendar
            mode="single"
            selected={date}
            onSelect={(d) => { setDate(d); setError(null); }}
            disabled={{ before: today }}
          />

          <div className="px-3 mt-2">
            <label className="block text-xs font-semibold text-rose-500 mb-1">
              Notes<span className="text-rose-500">*</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => { setNotes(e.target.value); setError(null); }}
              rows={3}
              className="w-full rounded-md border border-slate-300 px-2.5 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary"
            />
            {error && <div className="mt-1.5 text-xs text-rose-600">{error}</div>}
          </div>
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
