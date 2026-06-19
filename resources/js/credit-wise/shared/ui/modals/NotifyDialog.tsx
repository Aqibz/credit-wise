import { useState } from "react";
import { MessageCircle, Smartphone, MessageSquare, Mail, X, Send, Bell } from "lucide-react";

const CHANNELS = [
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30" },
  { id: "email", label: "Email", icon: Mail, color: "text-rose-600 bg-rose-500/10 border-rose-500/30" },
  { id: "sms", label: "SMS", icon: MessageSquare, color: "text-amber-600 bg-amber-500/10 border-amber-500/30" },
  { id: "push", label: "Push", icon: Smartphone, color: "text-blue-600 bg-blue-500/10 border-blue-500/30" },
] as const;

export type NotifyAudience = string;

export function NotifyDialog({
  open, onClose, title, eventLabel, defaultMessage, audiences, onSend,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  eventLabel: string;
  defaultMessage: string;
  audiences: NotifyAudience[];
  onSend: (data: { channels: string[]; audience: string; message: string }) => void;
}) {
  const [channels, setChannels] = useState<string[]>(["whatsapp", "email"]);
  const [audience, setAudience] = useState(audiences[0] ?? "All Staff");
  const [message, setMessage] = useState(defaultMessage);

  if (!open) return null;
  const toggle = (id: string) => setChannels((c) => c.includes(id) ? c.filter((x) => x !== id) : [...c, id]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden text-slate-900">
        <div className="flex items-center justify-between gap-4 px-5 py-4 bg-gradient-to-r from-primary to-primary text-white">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-lg bg-white/15 grid place-items-center"><Bell className="h-4 w-4" /></div>
            <div>
              <h2 className="font-semibold text-sm leading-tight">{title}</h2>
              <p className="text-[11px] text-white/80 mt-0.5">{eventLabel}</p>
            </div>
          </div>
          <button onClick={onClose} className="h-8 w-8 grid place-items-center rounded-lg bg-white/15 hover:bg-white/25"><X className="h-4 w-4" /></button>
        </div>

        <div className="p-5 space-y-4">
          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Audience</label>
            <select value={audience} onChange={(e) => setAudience(e.target.value)} className="mt-1.5 w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-sm">
              {audiences.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Channels</label>
            <div className="mt-1.5 flex flex-wrap gap-2">
              {CHANNELS.map((c) => {
                const on = channels.includes(c.id);
                const Icon = c.icon;
                return (
                  <button key={c.id} type="button" onClick={() => toggle(c.id)} className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold border transition ${on ? c.color : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100"}`}>
                    <Icon className="h-3.5 w-3.5" /> {c.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="text-[12px] font-bold uppercase tracking-wider text-slate-500">Message</label>
            <textarea rows={4} value={message} onChange={(e) => setMessage(e.target.value)} className="mt-1.5 w-full min-h-[84px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-5 py-3.5 border-t border-slate-200 bg-slate-50">
          <button onClick={onClose} className="h-10 px-4 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">Skip</button>
          <button
            onClick={() => { onSend({ channels, audience, message }); onClose(); }}
            disabled={channels.length === 0}
            className="h-10 px-5 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30 disabled:opacity-50"
          >
            <Send className="h-4 w-4" /> Send Notification
          </button>
        </div>
      </div>
    </div>
  );
}
