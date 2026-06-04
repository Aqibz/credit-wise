import { Plus, Trash2 } from "lucide-react";
import { Section, Field, inputCls, type Cheque } from "./shared";

type Props = {
  cheques: Cheque[];
  addCheque: () => void;
  updateCheque: (i: number, patch: Partial<Cheque>) => void;
  removeCheque: (i: number) => void;
};

export default function StepCheques({ cheques, addCheque, updateCheque, removeCheque }: Props) {
  return (
    <Section title="Cheque Details" hint="Post-dated cheques collected as security or for collection.">
      <div className="space-y-3">
        {cheques.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
            No cheques added yet. Click <span className="text-primary font-semibold">Add Cheque</span> to record one.
          </div>
        )}
        {cheques.map((c, i) => (
          <div key={i} className="grid md:grid-cols-12 gap-2 items-start rounded-lg border border-border bg-muted/20 p-3">
            <div className="md:col-span-3"><Field label="Bank"><input className={inputCls} value={c.bank} onChange={(e) => updateCheque(i, { bank: e.target.value })} placeholder="HBL / MCB / UBL" /></Field></div>
            <div className="md:col-span-3"><Field label="Cheque #"><input className={inputCls} value={c.cheque} onChange={(e) => updateCheque(i, { cheque: e.target.value })} /></Field></div>
            <div className="md:col-span-3"><Field label="Date"><input type="date" className={inputCls} value={c.date} onChange={(e) => updateCheque(i, { date: e.target.value })} /></Field></div>
            <div className="md:col-span-2"><Field label="Amount"><input type="number" className={inputCls} value={c.amount} onChange={(e) => updateCheque(i, { amount: Number(e.target.value) })} /></Field></div>
            <div className="md:col-span-1 flex md:justify-end pt-6">
              <button onClick={() => removeCheque(i)} className="h-9 w-9 grid place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
            </div>
          </div>
        ))}
        <button onClick={addCheque} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" /> Add Cheque
        </button>
      </div>
    </Section>
  );
}
