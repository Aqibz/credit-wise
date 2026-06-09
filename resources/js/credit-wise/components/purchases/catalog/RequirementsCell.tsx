import { useState } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Check, Minus, ShieldCheck } from "lucide-react";

export type RequirementItem = { label: string; value: boolean | string; hint?: string };

export function RequirementsCell({ title, items }: { title: string; items: RequirementItem[] }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        title="View requirements"
      >
        <Eye className="h-4 w-4" />
      </button>

      {open && createPortal(
        <div
          className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="bg-background rounded-xl shadow-2xl w-full max-w-md border border-border overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-2">
                <div className="h-9 w-9 rounded-lg bg-primary/10 flex items-center justify-center">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground text-sm">{title}</h3>
                  <p className="text-xs text-muted-foreground">Requirements checklist</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <ul className="p-4 space-y-2">
              {items.map((it, idx) => {
                const isYes = it.value === true || (typeof it.value === "string" && it.value.toLowerCase() === "yes");
                return (
                  <li key={idx} className="flex items-start gap-3 px-3 py-2.5 rounded-lg bg-muted/30">
                    <div className={`mt-0.5 h-5 w-5 rounded-full flex items-center justify-center flex-shrink-0 ${isYes ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                      {isYes ? <Check className="h-3.5 w-3.5" /> : <Minus className="h-3.5 w-3.5" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-sm font-medium text-foreground">{it.label}</span>
                        <span className={`text-xs font-semibold ${isYes ? "text-success" : "text-muted-foreground"}`}>
                          {isYes ? "Required" : "Not required"}
                        </span>
                      </div>
                      {it.hint && <p className="text-xs text-muted-foreground mt-0.5">{it.hint}</p>}
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
