import { useState } from "react";
import { createPortal } from "react-dom";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Crown, Check, Sparkles, Rocket, Building2, Receipt, Calendar, Download, ArrowUpRight, Eye, Share2, Printer, Copy, X, Landmark, Smartphone, Wallet as WalletIcon, CreditCard } from "lucide-react";
import { toast } from "sonner";
import { ui } from "@/components/ui-kit";

const PLANS = [
  { id: "starter", name: "Starter", price: 4999, icon: Sparkles, color: "from-blue-500/20 to-blue-500/5 text-blue-600", features: ["1 Branch", "5 Users", "Basic Reports", "Email Support", "POS Module"] },
  { id: "pro", name: "Professional", price: 12999, icon: Rocket, popular: true, color: "from-primary/20 to-primary/5 text-primary", features: ["5 Branches", "25 Users", "Advanced Reports", "Priority Support", "All POS Modules", "FBR Integration", "Mobile Apps"] },
  { id: "enterprise", name: "Enterprise", price: 29999, icon: Building2, color: "from-amber-500/20 to-amber-500/5 text-amber-600", features: ["Unlimited Branches", "Unlimited Users", "Custom Reports", "Dedicated Manager", "All Modules", "API Access", "White Label"] },
];

const HISTORY = [
  { id: "TXN-2026-0094", date: "2026-05-01", plan: "Professional", amount: 12999, method: "Bank Alfalah", status: "Paid" },
  { id: "TXN-2026-0078", date: "2026-04-01", plan: "Professional", amount: 12999, method: "JazzCash", status: "Paid" },
  { id: "TXN-2026-0061", date: "2026-03-01", plan: "Professional", amount: 12999, method: "Bank Alfalah", status: "Paid" },
  { id: "TXN-2026-0044", date: "2026-02-01", plan: "Starter", amount: 4999, method: "EasyPaisa", status: "Paid" },
  { id: "TXN-2026-0029", date: "2026-01-01", plan: "Starter", amount: 4999, method: "Bank Alfalah", status: "Paid" },
];

const METHOD_META: Record<string, { icon: any; cls: string }> = {
  "Bank Alfalah": { icon: Landmark, cls: "bg-blue-500/10 text-blue-700 border-blue-500/30" },
  HBL: { icon: Landmark, cls: "bg-emerald-500/10 text-emerald-700 border-emerald-500/30" },
  JazzCash: { icon: Smartphone, cls: "bg-orange-500/10 text-orange-700 border-orange-500/30" },
  EasyPaisa: { icon: WalletIcon, cls: "bg-green-500/10 text-green-700 border-green-500/30" },
  Card: { icon: CreditCard, cls: "bg-violet-500/10 text-violet-700 border-violet-500/30" },
};

const PLAN_PILL: Record<string, string> = {
  Starter: "bg-blue-500/10 text-blue-700 border-blue-500/30",
  Professional: "bg-primary/10 text-primary border-primary/30",
  Enterprise: "bg-amber-500/10 text-amber-700 border-amber-500/30",
};

export function SubscriptionPlanPage() {
  const [active, setActive] = useState("pro");
  const [receipt, setReceipt] = useState<typeof HISTORY[number] | null>(null);
  const [openMenu, setOpenMenu] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2"><Crown className="w-6 h-6 text-primary" /> Subscription Plan</h1>
        <p className="text-sm text-muted-foreground mt-1">Manage your plan, payment methods and billing history.</p>
      </div>

      <Card className="relative p-0 overflow-hidden border-primary/30 shadow-[0_20px_50px_-20px_hsl(var(--primary)/0.4)]">
        <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-primary/70" />
        <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(circle at 20% 20%, white 1px, transparent 1px), radial-gradient(circle at 70% 60%, white 1px, transparent 1px)", backgroundSize: "32px 32px, 48px 48px" }} />
        <div className="absolute -top-20 -right-20 h-64 w-64 rounded-full bg-white/10 blur-3xl" />
        <div className="relative p-6 text-primary-foreground">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div className="flex items-center gap-4">
              <div className="p-3.5 rounded-2xl bg-white/15 backdrop-blur-sm border border-white/25 shadow-lg"><Rocket className="w-7 h-7" /></div>
              <div>
                <div className="flex items-center gap-2 flex-wrap"><p className="text-xs uppercase tracking-[0.18em] font-bold text-white/70">Active Plan</p><Badge className="bg-emerald-400/25 text-white border-emerald-300/40 hover:bg-emerald-400/30 gap-1"><span className="h-1.5 w-1.5 rounded-full bg-emerald-300 animate-pulse" />Live</Badge></div>
                <h2 className="text-3xl font-bold mt-1 tracking-tight">Professional</h2>
                <p className="text-sm text-white/80 mt-1">PKR 12,999 / month - Renews on <span className="font-bold text-white">Jun 01, 2026</span></p>
              </div>
            </div>
            <div className="flex gap-2"><Button variant="secondary" size="sm" className="gap-1.5 bg-white/15 text-white border-white/25 hover:bg-white/25 backdrop-blur-sm"><Receipt className="w-3.5 h-3.5" /> Invoices</Button><Button size="sm" className="gap-1.5 bg-white text-primary hover:bg-white/90 shadow-lg"><ArrowUpRight className="w-3.5 h-3.5" /> Upgrade Plan</Button></div>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-7 pt-6 border-t border-white/20">
            {[{ label: "Branches", val: 3, max: 5 }, { label: "Users", val: 18, max: 25 }, { label: "Storage", val: 12.4, max: 50, unit: "GB" }, { label: "Days remaining", val: 22, max: 30, unit: "d" }].map((u) => {
              const pct = Math.min(100, Math.round((u.val / u.max) * 100));
              return <div key={u.label}><div className="flex items-center justify-between text-[11px] uppercase tracking-wider font-bold text-white/70"><span>{u.label}</span><span>{pct}%</span></div><p className="font-bold text-lg mt-1">{u.val}{u.unit ? ` ${u.unit}` : ""} <span className="text-xs text-white/60 font-medium">/ {u.max}{u.unit ? ` ${u.unit}` : ""}</span></p><div className="h-1.5 mt-2 rounded-full bg-white/15 overflow-hidden"><div className="h-full rounded-full bg-white shadow-[0_0_10px_rgba(255,255,255,0.6)]" style={{ width: `${pct}%` }} /></div></div>;
            })}
          </div>
        </div>
      </Card>

      <div>
        <h3 className="font-semibold mb-3">Available Plans</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PLANS.map((p) => {
            const Icon = p.icon;
            const isActive = active === p.id;
            return (
              <Card key={p.id} className={`relative p-5 transition-all hover:shadow-lg ${isActive ? "ring-2 ring-primary" : ""}`}>
                {p.popular && <Badge className="absolute -top-2 right-4 bg-primary">Most Popular</Badge>}
                <div className={`inline-flex p-2.5 rounded-lg bg-gradient-to-br ${p.color} border mb-3`}><Icon className="w-5 h-5" /></div>
                <h4 className="font-bold text-lg">{p.name}</h4>
                <div className="mt-1"><span className="text-2xl font-bold">PKR {p.price.toLocaleString()}</span><span className="text-xs text-muted-foreground">/month</span></div>
                <ul className="mt-4 space-y-2">{p.features.map((f) => <li key={f} className="flex items-center gap-2 text-xs"><Check className="w-3.5 h-3.5 text-emerald-600" /> {f}</li>)}</ul>
                <Button className="w-full mt-5" variant={isActive ? "secondary" : "default"} disabled={isActive} onClick={() => { setActive(p.id); toast.success(`Switched to ${p.name}`); }}>{isActive ? "Current Plan" : "Switch Plan"}</Button>
              </Card>
            );
          })}
        </div>
      </div>

      <div className="rounded-xl bg-card overflow-hidden border border-border shadow-[0_4px_16px_-6px_rgba(16,24,40,0.10)]">
        <div className="px-5 py-4 border-b border-border flex items-center justify-between flex-wrap gap-3">
          <div><h3 className="font-semibold flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Transaction History</h3><p className="text-xs text-muted-foreground mt-0.5">{HISTORY.length} payments - Total PKR {HISTORY.reduce((s, t) => s + t.amount, 0).toLocaleString()}</p></div>
          <Button size="sm" variant="outline" className="gap-1.5"><Download className="w-3.5 h-3.5" /> Export CSV</Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={ui.tableHeadRow}><tr><th className="text-left px-4 py-3.5 w-12">SR#</th><th className="text-left px-2 py-3.5 font-bold">Invoice #</th><th className="text-left px-2 py-3.5 font-bold">Date</th><th className="text-left px-2 py-3.5 font-bold">Plan</th><th className="text-left px-2 py-3.5 font-bold">Method</th><th className="text-right px-2 py-3.5 font-bold">Amount</th><th className="text-center px-2 py-3.5 font-bold">Status</th><th className="text-center px-4 py-3.5 font-bold w-[180px]">Action</th></tr></thead>
            <tbody className="divide-y divide-border">
              {HISTORY.map((t, i) => {
                const m = METHOD_META[t.method] ?? { icon: CreditCard, cls: "bg-muted text-foreground border-border" };
                const MIcon = m.icon;
                return (
                  <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                    <td className="px-4 py-3.5 text-muted-foreground font-medium">{i + 1}</td>
                    <td className="px-2 py-3.5 font-mono text-xs font-bold text-foreground">{t.id}</td>
                    <td className="px-2 py-3.5 text-muted-foreground font-medium whitespace-nowrap">{t.date}</td>
                    <td className="px-2 py-3.5"><span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${PLAN_PILL[t.plan] ?? "bg-muted text-foreground border-border"}`}>{t.plan}</span></td>
                    <td className="px-2 py-3.5"><span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full border text-[11px] font-semibold ${m.cls}`}><MIcon className="w-3 h-3" /> {t.method}</span></td>
                    <td className="px-2 py-3.5 text-right font-bold tabular-nums">PKR {t.amount.toLocaleString()}</td>
                    <td className="px-2 py-3.5 text-center"><span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/15 text-emerald-700 border border-emerald-500/30"><span className="h-1.5 w-1.5 rounded-full bg-emerald-500" /> {t.status}</span></td>
                    <td className="px-4 py-3.5"><div className="flex items-center justify-center gap-1 relative">
                      <button onClick={() => setReceipt(t)} title="View receipt" className="h-7 w-7 grid place-items-center rounded-md border border-border bg-card hover:bg-muted text-foreground/70 hover:text-primary transition"><Eye className="w-3.5 h-3.5" /></button>
                      <button onClick={() => toast.success(`Downloading ${t.id}.pdf`)} title="Download PDF" className="h-7 w-7 grid place-items-center rounded-md border border-border bg-card hover:bg-muted text-foreground/70 hover:text-primary transition"><Download className="w-3.5 h-3.5" /></button>
                      <button onClick={() => setOpenMenu(openMenu === t.id ? null : t.id)} title="Share" className="h-7 w-7 grid place-items-center rounded-md border border-border bg-card hover:bg-muted text-foreground/70 hover:text-primary transition"><Share2 className="w-3.5 h-3.5" /></button>
                      {openMenu === t.id && <>
                        <div className="fixed inset-0 z-40" onClick={() => setOpenMenu(null)} />
                        <div className="absolute right-0 top-9 z-50 w-44 rounded-lg border border-border bg-card shadow-lg overflow-hidden">
                          <button onClick={() => { navigator.clipboard?.writeText(`${window.location.origin}/receipt/${t.id}`); toast.success("Link copied"); setOpenMenu(null); }} className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-muted inline-flex items-center gap-2"><Copy className="w-3.5 h-3.5" /> Copy link</button>
                          <button onClick={() => { window.open(`https://wa.me/?text=Receipt%20${t.id}`, "_blank"); setOpenMenu(null); }} className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-muted inline-flex items-center gap-2"><Share2 className="w-3.5 h-3.5" /> WhatsApp</button>
                          <button onClick={() => { window.location.href = `mailto:?subject=Receipt%20${t.id}&body=Receipt%20attached`; setOpenMenu(null); }} className="w-full px-3 py-2 text-left text-xs font-medium hover:bg-muted inline-flex items-center gap-2"><Receipt className="w-3.5 h-3.5" /> Email</button>
                        </div>
                      </>}
                    </div></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {receipt && <ReceiptModal txn={receipt} onClose={() => setReceipt(null)} />}
    </div>
  );
}

function ReceiptModal({ txn, onClose }: { txn: typeof HISTORY[number]; onClose: () => void }) {
  if (typeof document === "undefined") return null;
  return createPortal(
    <div className="fixed inset-0 z-[100] grid place-items-center bg-black/50 backdrop-blur-sm p-4" onClick={onClose}>
      <div className="w-full max-w-md rounded-2xl bg-card shadow-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="relative bg-gradient-to-br from-primary to-primary/70 text-primary-foreground p-5">
          <button onClick={onClose} className="absolute top-3 right-3 h-7 w-7 grid place-items-center rounded-md bg-white/15 hover:bg-white/25 backdrop-blur-sm"><X className="w-4 h-4" /></button>
          <div className="flex items-center gap-2 text-[11px] uppercase tracking-[0.18em] font-bold text-white/80"><Receipt className="w-3.5 h-3.5" /> Payment Receipt</div>
          <div className="mt-2 font-mono text-lg font-bold">{txn.id}</div>
          <div className="text-xs text-white/80 mt-0.5">{txn.date}</div>
        </div>
        <div className="p-5 space-y-3">
          {[["Plan", txn.plan], ["Method", txn.method], ["Status", txn.status], ["Amount", `PKR ${txn.amount.toLocaleString()}`]].map(([k, v]) => <div key={k} className="flex items-center justify-between text-sm"><span className="text-muted-foreground">{k}</span><span className="font-semibold text-foreground">{v}</span></div>)}
          <div className="border-t border-border pt-3 flex items-center justify-between"><span className="text-xs text-muted-foreground">Total Paid</span><span className="text-xl font-bold text-primary">PKR {txn.amount.toLocaleString()}</span></div>
          <div className="flex gap-2 pt-2"><Button variant="outline" size="sm" className="flex-1 gap-1.5" onClick={() => window.print()}><Printer className="w-3.5 h-3.5" /> Print</Button><Button size="sm" className="flex-1 gap-1.5" onClick={() => toast.success(`Downloading ${txn.id}.pdf`)}><Download className="w-3.5 h-3.5" /> Download</Button></div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
