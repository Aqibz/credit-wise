import { Section, Field, Info, Rs, inputCls } from "./shared";

type Props = {
  customers: any[];
  customerId: string;
  setCustomerId: (v: string) => void;
  newCustomer: { name: string; cnic: string; phone: string; area: string; occupation: string; income: string };
  setNewCustomer: (v: any) => void;
  customer: any;
};

export default function StepCustomer({ customers, customerId, setCustomerId, newCustomer, setNewCustomer, customer }: Props) {
  return (
    <Section title="Customer Information" hint="Select an existing customer or enter new walk-in details.">
      <div className="grid md:grid-cols-2 gap-4">
        <Field label="Existing Customer">
          <select value={customerId} onChange={(e) => setCustomerId(e.target.value)} className={inputCls}>
            <option value="">— Walk-in / New —</option>
            {customers.map((c: any) => (
              <option key={c.id} value={c.id}>{c.name} • {c.cnic || c.phone}</option>
            ))}
          </select>
        </Field>
        <div />
        {!customerId && (
          <>
            <Field label="Full Name" required>
              <input className={inputCls} value={newCustomer.name} onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })} />
            </Field>
            <Field label="CNIC">
              <input className={inputCls} value={newCustomer.cnic} onChange={(e) => setNewCustomer({ ...newCustomer, cnic: e.target.value })} placeholder="35202-1234567-8" />
            </Field>
            <Field label="Phone">
              <input className={inputCls} value={newCustomer.phone} onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })} placeholder="+92 300 0000000" />
            </Field>
            <Field label="Area">
              <input className={inputCls} value={newCustomer.area} onChange={(e) => setNewCustomer({ ...newCustomer, area: e.target.value })} />
            </Field>
            <Field label="Occupation">
              <input className={inputCls} value={newCustomer.occupation} onChange={(e) => setNewCustomer({ ...newCustomer, occupation: e.target.value })} />
            </Field>
            <Field label="Monthly Income (Rs.)">
              <input type="number" className={inputCls} value={newCustomer.income} onChange={(e) => setNewCustomer({ ...newCustomer, income: e.target.value })} />
            </Field>
          </>
        )}
        {customer && (
          <div className="md:col-span-2 rounded-lg border border-border bg-muted/30 p-4">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-bold mb-2">Selected Customer</div>
            <div className="grid sm:grid-cols-2 gap-2 text-sm">
              <Info k="Name" v={customer.name} />
              <Info k="CNIC" v={customer.cnic} />
              <Info k="Phone" v={customer.phone} />
              <Info k="Area" v={customer.area} />
              <Info k="Occupation" v={customer.occupation} />
              <Info k="Income" v={Rs(customer.income)} />
            </div>
          </div>
        )}
      </div>
    </Section>
  );
}
