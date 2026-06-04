import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { X, Mail, MessageSquare, Phone, Clock, Repeat, Send, CalendarRange } from "lucide-react";
import { buildSchedule, type ReportSchedule } from "./schedule-types";

// Re-export so existing imports from "@/components/reports/ScheduleDialog"
// (other than the route, which we are migrating to schedule-types) keep working.
export { buildSchedule, recomputeNextRun, type ReportSchedule } from "./schedule-types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

type Props = {
  open: boolean;
  onClose: () => void;
  onSave: (data: Omit<ReportSchedule, "id">) => void;
  initial?: ReportSchedule;
  reportId: string;
  reportName: string;
  moduleId: string;
  moduleLabel: string;
  defaultBranch: string;
  defaultPeriod: string;
};

export function ScheduleDialog({
  open, onClose, onSave, initial,
  reportId, reportName, moduleId, moduleLabel, defaultBranch, defaultPeriod,
}: Props) {
  const [frequency, setFrequency] = useState<ReportSchedule["frequency"]>("Daily");
  const [dayOfWeek, setDayOfWeek] = useState("Mon");
  const [dayOfMonth, setDayOfMonth] = useState(1);
  const [time, setTime] = useState("09:00");
  const [channels, setChannels] = useState<ReportSchedule["channels"]>(["Email"]);
  const [recipients, setRecipients] = useState("");
  const [branch, setBranch] = useState(defaultBranch);
  const [period, setPeriod] = useState(defaultPeriod);

  useEffect(() => {
    if (!open) return;
    if (initial) {
      setFrequency(initial.frequency);
      setDayOfWeek(initial.dayOfWeek || "Mon");
      setDayOfMonth(initial.dayOfMonth || 1);
      setTime(initial.time);
      setChannels(initial.channels);
      setRecipients(initial.recipients);
      setBranch(initial.branch);
      setPeriod(initial.period);
    } else {
      setFrequency("Daily");
      setDayOfWeek("Mon");
      setDayOfMonth(1);
      setTime("09:00");
      setChannels(["Email"]);
      setRecipients("");
      setBranch(defaultBranch);
      setPeriod(defaultPeriod);
    }
  }, [open, initial, defaultBranch, defaultPeriod]);

  if (!open || typeof document === "undefined") return null;

  const toggleChannel = (c: "Email" | "SMS" | "WhatsApp") =>
    setChannels((prev) => prev.includes(c) ? prev.filter((x) => x !== c) : [...prev, c]);

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (channels.length === 0) return;
    onSave(buildSchedule({
      reportId, reportName, moduleId, moduleLabel,
      frequency,
      dayOfWeek: frequency === "Weekly" ? dayOfWeek : undefined,
      dayOfMonth: frequency === "Monthly" || frequency === "Quarterly" ? dayOfMonth : undefined,
      time, channels, recipients, branch, period,
      status: initial?.status ?? "Active",
    }));
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-black/40 backdrop-blur-sm">
      <form onSubmit={submit} className="w-full max-w-xl bg-card rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between bg-gradient-to-r from-primary/10 to-primary/10">
          <div className="flex items-center gap-2">
            <Send className="h-4 w-4 text-primary" strokeWidth={1.75} />
            <h2 className="font-bold text-foreground tracking-tight">{initial ? "Edit Schedule" : "Schedule Report"}</h2>
          </div>
          <button type="button" onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg hover:bg-muted">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 max-h-[70vh] overflow-y-auto">
          <div className="rounded-lg bg-muted/40 p-3">
            <div className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Report</div>
            <div className="font-bold text-foreground text-sm mt-0.5">{reportName}</div>
            <div className="text-[12px] text-muted-foreground">{moduleLabel}</div>
          </div>

          {/* Frequency */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Repeat className="h-3 w-3" /> Frequency</label>
            <div className="mt-2 grid grid-cols-4 gap-2">
              {(["Daily", "Weekly", "Monthly", "Quarterly"] as const).map((f) => (
                <button key={f} type="button" onClick={() => setFrequency(f)}
                  className={`h-9 rounded-lg text-[12px] font-bold border transition ${frequency === f ? "bg-primary text-primary-foreground border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"}`}>
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Day + Time */}
          <div className="grid grid-cols-2 gap-3">
            {frequency === "Weekly" && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Day of Week</label>
                <select value={dayOfWeek} onChange={(e) => setDayOfWeek(e.target.value)}
                  className="mt-2 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium">
                  {DAYS.map((d) => <option key={d} value={d}>{d}</option>)}
                </select>
              </div>
            )}
            {(frequency === "Monthly" || frequency === "Quarterly") && (
              <div>
                <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Day of Month</label>
                <input type="number" min={1} max={28} value={dayOfMonth} onChange={(e) => setDayOfMonth(Number(e.target.value))}
                  className="mt-2 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium" />
              </div>
            )}
            <div className={frequency === "Daily" ? "col-span-2" : ""}>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><Clock className="h-3 w-3" /> Time</label>
              <input type="time" value={time} onChange={(e) => setTime(e.target.value)}
                className="mt-2 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium" />
            </div>
          </div>

          {/* Channels */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Channels</label>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {([
                { key: "Email", icon: Mail },
                { key: "SMS", icon: MessageSquare },
                { key: "WhatsApp", icon: Phone },
              ] as const).map(({ key, icon: Icon }) => {
                const active = channels.includes(key);
                return (
                  <button key={key} type="button" onClick={() => toggleChannel(key)}
                    className={`h-10 rounded-lg text-[12px] font-bold border inline-flex items-center justify-center gap-1.5 transition ${active ? "bg-primary/10 text-primary border-primary" : "bg-background text-muted-foreground border-border hover:border-primary/40"}`}>
                    <Icon className="h-3.5 w-3.5" /> {key}
                  </button>
                );
              })}
            </div>
            {channels.length === 0 && <p className="text-[11px] text-destructive mt-1.5 font-semibold">Select at least one channel.</p>}
          </div>

          {/* Recipients */}
          <div>
            <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Recipients (comma separated)</label>
            <textarea value={recipients} onChange={(e) => setRecipients(e.target.value)} rows={2}
              placeholder="ahmed@company.pk, +92 300 1234567, +92 321 9876543"
              className="mt-2 w-full rounded-lg border border-border bg-background px-3 py-2 text-sm font-medium" />
            <p className="text-[11px] text-muted-foreground mt-1">Email addresses, mobile numbers ya WhatsApp numbers — channel ke mutabiq route ho jayega.</p>
          </div>

          {/* Filters */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Branch</label>
              <input value={branch} onChange={(e) => setBranch(e.target.value)}
                className="mt-2 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium" />
            </div>
            <div>
              <label className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5"><CalendarRange className="h-3 w-3" /> Period</label>
              <input value={period} onChange={(e) => setPeriod(e.target.value)}
                className="mt-2 w-full h-10 rounded-lg border border-border bg-background px-3 text-sm font-medium" />
            </div>
          </div>
        </div>

        <div className="px-5 py-4 border-t border-border flex items-center justify-end gap-2 bg-muted/20">
          <button type="button" onClick={onClose} className="h-10 px-4 rounded-lg text-sm font-bold text-muted-foreground hover:bg-muted">Cancel</button>
          <button type="submit" disabled={channels.length === 0}
            className="h-10 px-4 rounded-lg bg-primary text-primary-foreground text-sm font-bold inline-flex items-center gap-1.5 hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed">
            <Send className="h-3.5 w-3.5" /> {initial ? "Update Schedule" : "Create Schedule"}
          </button>
        </div>
      </form>
    </div>,
    document.body,
  );
}
