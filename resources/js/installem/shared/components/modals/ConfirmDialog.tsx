import { ReactNode, useEffect } from "react";
import { AlertTriangle, X } from "lucide-react";

export function ConfirmDialog({
  open,
  title,
  description,
  confirmLabel = "Delete",
  cancelLabel = "Cancel",
  tone = "destructive",
  onConfirm,
  onCancel,
  icon,
}: {
  open: boolean;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: "destructive" | "primary" | "warning";
  onConfirm: () => void;
  onCancel: () => void;
  icon?: ReactNode;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onCancel(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onCancel]);

  if (!open) return null;

  const toneMap: Record<string, { btn: string; iconBg: string; ring: string }> = {
    destructive: { btn: "bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-destructive/30", iconBg: "bg-destructive/15 text-destructive", ring: "ring-destructive/30" },
    primary: { btn: "bg-primary text-primary-foreground hover:bg-primary/90 shadow-primary/30", iconBg: "bg-primary/15 text-primary", ring: "ring-primary/30" },
    warning: { btn: "bg-warning text-warning-foreground hover:bg-warning/90", iconBg: "bg-warning/25 text-warning-foreground", ring: "ring-warning/30" },
  };
  const cfg = toneMap[tone];

  return (
    <div className="fixed inset-0 z-[80] grid place-items-center p-4 bg-slate-900/55 backdrop-blur-sm animate-fade-in" onClick={onCancel}>
      <div
        onClick={(e) => e.stopPropagation()}
        className={`w-full max-w-md rounded-2xl bg-card border border-border shadow-2xl overflow-hidden ring-1 ${cfg.ring} animate-scale-in`}
      >
        <div className="p-6">
          <div className="flex items-start gap-4">
            <span className={`h-12 w-12 shrink-0 rounded-xl grid place-items-center ${cfg.iconBg}`}>
              {icon ?? <AlertTriangle className="h-5 w-5" />}
            </span>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between gap-2">
                <h2 className="text-lg font-bold text-foreground tracking-tight">{title}</h2>
                <button onClick={onCancel} className="text-muted-foreground hover:text-foreground rounded-md -mr-2 -mt-1 p-1">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <div className="text-sm text-muted-foreground mt-1.5 leading-relaxed">{description}</div>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 bg-muted/30 border-t border-border">
          <button onClick={onCancel} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">
            {cancelLabel}
          </button>
          <button onClick={onConfirm} className={`h-10 px-5 rounded-lg text-sm font-semibold shadow-sm ${cfg.btn}`}>
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
