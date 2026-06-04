import { createContext, useCallback, useContext, useEffect, useState, ReactNode } from "react";
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from "lucide-react";

type ToastTone = "success" | "error" | "warning" | "info";
type Toast = { id: string; tone: ToastTone; title: string; body?: string };

type Ctx = {
  show: (t: Omit<Toast, "id">) => void;
  success: (title: string, body?: string) => void;
  error: (title: string, body?: string) => void;
  warning: (title: string, body?: string) => void;
  info: (title: string, body?: string) => void;
};

const ToastCtx = createContext<Ctx | null>(null);

export function ToastProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<Toast[]>([]);

  const show = useCallback((t: Omit<Toast, "id">) => {
    const id = (typeof crypto !== "undefined" && "randomUUID" in crypto)
      ? crypto.randomUUID()
      : Math.random().toString(36).slice(2);
    setItems((arr) => [...arr, { ...t, id }]);
    setTimeout(() => setItems((arr) => arr.filter((x) => x.id !== id)), 3500);
  }, []);

  const ctx: Ctx = {
    show,
    success: (title, body) => show({ tone: "success", title, body }),
    error: (title, body) => show({ tone: "error", title, body }),
    warning: (title, body) => show({ tone: "warning", title, body }),
    info: (title, body) => show({ tone: "info", title, body }),
  };

  return (
    <ToastCtx.Provider value={ctx}>
      {children}
      <div className="fixed top-4 right-4 z-[100] flex flex-col gap-2 w-[360px] max-w-[calc(100vw-2rem)] pointer-events-none">
        {items.map((t) => (
          <ToastCard key={t.id} toast={t} onClose={() => setItems((arr) => arr.filter((x) => x.id !== t.id))} />
        ))}
      </div>
    </ToastCtx.Provider>
  );
}

function ToastCard({ toast, onClose }: { toast: Toast; onClose: () => void }) {
  const map: Record<ToastTone, { icon: any; ring: string; bg: string; iconBg: string }> = {
    success: { icon: CheckCircle2, ring: "ring-success/40", bg: "bg-card", iconBg: "bg-success/20 text-success-foreground" },
    error: { icon: XCircle, ring: "ring-destructive/40", bg: "bg-card", iconBg: "bg-destructive/15 text-destructive" },
    warning: { icon: AlertTriangle, ring: "ring-warning/40", bg: "bg-card", iconBg: "bg-warning/25 text-warning-foreground" },
    info: { icon: Info, ring: "ring-info/40", bg: "bg-card", iconBg: "bg-info/20 text-info" },
  };
  const cfg = map[toast.tone];
  const Icon = cfg.icon;

  const [shown, setShown] = useState(false);
  useEffect(() => { setShown(true); }, []);

  return (
    <div
      className={`pointer-events-auto flex items-start gap-3 ${cfg.bg} rounded-xl border border-border shadow-xl px-4 py-3 ring-1 ${cfg.ring} transition-all duration-200 ${shown ? "opacity-100 translate-x-0" : "opacity-0 translate-x-4"}`}
    >
      <span className={`h-9 w-9 shrink-0 rounded-lg grid place-items-center ${cfg.iconBg}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="flex-1 min-w-0">
        <div className="text-[13px] font-semibold text-foreground">{toast.title}</div>
        {toast.body && <div className="text-[12px] text-muted-foreground mt-0.5">{toast.body}</div>}
      </div>
      <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-0.5 rounded">
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) {
    return {
      show: () => {},
      success: () => {},
      error: () => {},
      warning: () => {},
      info: () => {},
    } as Ctx;
  }
  return ctx;
}
