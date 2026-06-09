import { Section, Field, Stat, Rs, inputCls } from "./shared";

type Props = {
  totalPrice: number; setTotalPrice: (v: number) => void; basePrice: number;
  down: number; setDown: (v: number) => void;
  tenure: number; setTenure: (v: number) => void;
  profitPct: number; setProfitPct: (v: number) => void;
  startDate: string; setStartDate: (v: string) => void;
  principal: number; profitAmount: number; financed: number; monthly: number;
};

export default function StepPricing({ totalPrice, setTotalPrice, basePrice, down, setDown, tenure, setTenure, profitPct, setProfitPct, startDate, setStartDate, principal, profitAmount, financed, monthly }: Props) {
  return (
    <Section title="Pricing & Finance" hint="Down payment, tenure and profit margin determine the EMI.">
      <div className="grid md:grid-cols-3 gap-4">
        <Field label="Total Sale Price (Rs.)" hint={`Auto: ${Rs(basePrice)}`}>
          <input type="number" className={inputCls} value={totalPrice || basePrice} onChange={(e) => setTotalPrice(Number(e.target.value))} />
        </Field>
        <Field label="Down Payment (Rs.)" required>
          <input type="number" className={inputCls} value={down} onChange={(e) => setDown(Number(e.target.value))} />
        </Field>
        <Field label="Tenure (Months)" required>
          <input type="number" min={1} className={inputCls} value={tenure} onChange={(e) => setTenure(Math.max(1, Number(e.target.value)))} />
        </Field>
        <Field label="Profit / Markup (%)">
          <input type="number" className={inputCls} value={profitPct} onChange={(e) => setProfitPct(Number(e.target.value))} />
        </Field>
        <Field label="Start Date">
          <input type="date" className={inputCls} value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        </Field>
        <div />
      </div>
      <div className="mt-5 grid grid-cols-2 md:grid-cols-4 gap-3">
        <Stat label="Principal" value={Rs(principal)} tone="muted" />
        <Stat label={`Profit (${profitPct}%)`} value={Rs(profitAmount)} tone="warning" />
        <Stat label="Total Financed" value={Rs(financed)} tone="primary" />
        <Stat label="Monthly EMI" value={Rs(monthly)} tone="success" big />
      </div>
    </Section>
  );
}
