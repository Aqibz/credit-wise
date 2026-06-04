import { Plus, Trash2 } from "lucide-react";
import { Section, Field, inputCls, type Guarantor } from "./shared";

type Props = {
  guarantorList: Guarantor[];
  addGuarantor: () => void;
  updateGuarantor: (i: number, patch: Partial<Guarantor>) => void;
  removeGuarantor: (i: number) => void;
};

export default function StepGuarantors({ guarantorList, addGuarantor, updateGuarantor, removeGuarantor }: Props) {
  return (
    <Section title="Guarantors" hint="At least one guarantor is recommended for installment cases.">
      <div className="space-y-3">
        {guarantorList.length === 0 && (
          <div className="rounded-lg border border-dashed border-border p-8 text-center text-muted-foreground text-sm">
            No guarantors added. Click <span className="text-primary font-semibold">Add Guarantor</span>.
          </div>
        )}
        {guarantorList.map((g, i) => (
          <div key={i} className="rounded-lg border border-border bg-muted/20 p-3">
            <div className="grid md:grid-cols-12 gap-2 items-start">
              <div className="md:col-span-3"><Field label="Name"><input className={inputCls} value={g.name} onChange={(e) => updateGuarantor(i, { name: e.target.value })} /></Field></div>
              <div className="md:col-span-2"><Field label="CNIC"><input className={inputCls} value={g.cnic} onChange={(e) => updateGuarantor(i, { cnic: e.target.value })} /></Field></div>
              <div className="md:col-span-2"><Field label="Phone"><input className={inputCls} value={g.phone} onChange={(e) => updateGuarantor(i, { phone: e.target.value })} /></Field></div>
              <div className="md:col-span-2"><Field label="Relation">
                <select className={inputCls} value={g.relation} onChange={(e) => updateGuarantor(i, { relation: e.target.value })}>
                  {["Father", "Brother", "Husband", "Friend", "Colleague", "Relative", "Other"].map((r) => <option key={r}>{r}</option>)}
                </select>
              </Field></div>
              <div className="md:col-span-2"><Field label="Occupation"><input className={inputCls} value={g.occupation} onChange={(e) => updateGuarantor(i, { occupation: e.target.value })} /></Field></div>
              <div className="md:col-span-1 flex md:justify-end pt-6">
                <button onClick={() => removeGuarantor(i)} className="h-9 w-9 grid place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
              </div>
            </div>
          </div>
        ))}
        <button onClick={addGuarantor} className="inline-flex items-center gap-2 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-4 py-2 text-sm font-semibold text-primary hover:bg-primary/10">
          <Plus className="h-4 w-4" /> Add Guarantor
        </button>
      </div>
    </Section>
  );
}
