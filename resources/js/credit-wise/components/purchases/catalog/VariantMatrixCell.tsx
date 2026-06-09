import { useState, useMemo } from "react";
import { createPortal } from "react-dom";
import { Eye, X, Layers, Info } from "lucide-react";

import { fmtPKR as Rs } from "@/lib/formatters/currency";

type MatrixRow = {
  id: string;
  product: string;
  category?: string;
  plan: string;
  tenure: number;
  downPayment: number;
  markup: number;
  price: number;
  monthly: number;
  total: number;
};

export function VariantMatrixCell({ variantName, productName, variantPrice }: { variantName: string; productName: string; variantPrice: number }) {
  const [open, setOpen] = useState(false);

  // Read matrix data from localStorage (same store as installment-matrix)
  const matrixRows = useMemo<MatrixRow[]>(() => {
    if (!open) return [];
    try {
      const raw = localStorage.getItem("qcrm.installment-matrix");
      if (!raw) return [];
      const all: MatrixRow[] = JSON.parse(raw);
      return all.filter((r) => r.product === productName);
    } catch {
      return [];
    }
  }, [open, productName]);

  return (
    <>
      <button
        onClick={(e) => { e.stopPropagation(); setOpen(true); }}
        className="inline-flex items-center justify-center text-muted-foreground hover:text-primary transition-colors"
        title="View installment matrix"
      >
        <Eye className="h-4 w-4" />
      </button>

      {open && createPortal(
        <div className="fixed inset-0 z-[100] bg-black/40 backdrop-blur-sm flex items-center justify-center p-4" onClick={() => setOpen(false)}>
          <div className="bg-background rounded-xl shadow-2xl w-full max-w-3xl border border-border overflow-hidden" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between px-5 py-4 border-b border-border bg-muted/30">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-lg bg-primary/10 flex items-center justify-center">
                  <Layers className="h-5 w-5 text-primary" />
                </div>
                <div>
                  <h3 className="font-semibold text-foreground">{variantName}</h3>
                  <p className="text-xs text-muted-foreground">{productName} · Cash Price {Rs(variantPrice)}</p>
                </div>
              </div>
              <button onClick={() => setOpen(false)} className="h-8 w-8 rounded-lg hover:bg-muted flex items-center justify-center">
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="p-5 max-h-[70vh] overflow-y-auto">
              {matrixRows.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-10 text-center">
                  <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <Info className="h-5 w-5 text-muted-foreground" />
                  </div>
                  <p className="text-sm font-medium text-foreground">No installment matrix configured</p>
                  <p className="text-xs text-muted-foreground mt-1">Add matrix entries from Pricing Plans for "{productName}".</p>
                </div>
              ) : (
                <>
                  <p className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-3">{matrixRows.length} installment options</p>
                  <div className="overflow-x-auto rounded-lg border border-border">
                    <table className="w-full text-sm">
                      <thead className="bg-muted/40 text-xs uppercase text-muted-foreground">
                        <tr>
                          <th className="text-left px-3 py-2 font-semibold">Plan</th>
                          <th className="text-left px-3 py-2 font-semibold">Tenure</th>
                          <th className="text-left px-3 py-2 font-semibold">DP %</th>
                          <th className="text-left px-3 py-2 font-semibold">Markup</th>
                          <th className="text-left px-3 py-2 font-semibold">Monthly</th>
                          <th className="text-left px-3 py-2 font-semibold">Total</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {matrixRows.map((r) => (
                          <tr key={r.id} className="hover:bg-muted/20">
                            <td className="px-3 py-2.5 font-medium text-foreground">{r.plan}</td>
                            <td className="px-3 py-2.5 text-muted-foreground">{r.tenure} mo</td>
                            <td className="px-3 py-2.5 text-muted-foreground">{r.downPayment}%</td>
                            <td className="px-3 py-2.5 text-muted-foreground">{r.markup}%</td>
                            <td className="px-3 py-2.5 font-semibold text-primary">{Rs(r.monthly)}</td>
                            <td className="px-3 py-2.5 font-medium">{Rs(r.total)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
