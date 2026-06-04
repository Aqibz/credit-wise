import { Section, Rs } from "./shared";
import { Badge } from "@/components/ui-kit";

type Props = {
  schedule: { n: number; dueDate: string; amount: number }[];
  tenure: number; financed: number; monthly: number; startDate: string;
};

export default function StepSchedule({ schedule, tenure, financed, monthly, startDate }: Props) {
  return (
    <Section title="Installment Schedule" hint={`${tenure} installments of ${Rs(monthly)} • starting ${startDate}`}>
      <div className="rounded-lg border border-border overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-muted-foreground text-xs uppercase tracking-wider">
            <tr>
              <th className="text-left px-3 py-2.5">#</th>
              <th className="text-left px-3 py-2.5">Due Date</th>
              <th className="text-right px-3 py-2.5">Amount</th>
              <th className="text-left px-3 py-2.5">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {schedule.map((s) => (
              <tr key={s.n} className="hover:bg-muted/30">
                <td className="px-3 py-2.5 font-semibold">{s.n}/{tenure}</td>
                <td className="px-3 py-2.5">{s.dueDate}</td>
                <td className="px-3 py-2.5 text-right font-semibold">{Rs(s.amount)}</td>
                <td className="px-3 py-2.5"><Badge tone="muted">Upcoming</Badge></td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-muted/30">
            <tr>
              <td colSpan={2} className="px-3 py-2.5 font-bold text-right">Total</td>
              <td className="px-3 py-2.5 text-right font-bold text-primary">{Rs(financed)}</td>
              <td />
            </tr>
          </tfoot>
        </table>
      </div>
    </Section>
  );
}
