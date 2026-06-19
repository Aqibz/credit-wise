import { useMemo, useState } from "react";
import {
  Plus, Search, Building2, MapPin, Phone, Mail, User, Clock, Eye, Pencil, Trash2,
  Power, Package, X, Save, ChevronRight, Calendar, Users, Target,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge, ui } from "@/components/ui-kit";
import { useEntityStore } from "@/lib/state/useEntityStore";
import { useToast } from "@/components/Toaster";
import { ConfirmDialog } from "@/components/ConfirmDialog";
import { KpiIcons, KpiIcon } from "@/components/kpi-icons";
import { SettingsTabs } from "@/pages/system/settings/SettingsTabs";
import { CountryCodePhoneInput } from "@/shared/ui/primitives/country-code-phone-input";
import { CurrencyAmountInput } from "@/shared/ui/primitives/currency-amount-input";

type Day = "Mon" | "Tue" | "Wed" | "Thu" | "Fri" | "Sat" | "Sun";
type Branch = {
  id: string; name: string; code: string; type: "Shop" | "Warehouse" | "Head Office" | "Service Center";
  city: string; province: string; manager: string; managerPhone: string; managerEmail: string; phone: string; address: string;
  status: "Active" | "Inactive"; open: boolean; openTime: string; closeTime: string; daysOpen: Day[]; staff: number; monthlyTarget: number; achieved: number; targetPeriod: string;
};

const DAYS: Day[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CURRENT_PERIOD = new Date().toLocaleString("en-US", { month: "long", year: "numeric" });
const PRODUCTS_DEMO = ["Haier 1.5 Ton AC", "PEL 1 Ton AC", "Dawlance Refrigerator", 'Samsung 55" TV', "iPhone 15", "Samsung A55", "Honda 125 Bike", "Singer Sewing Machine", "LG Washing Machine", "Geyser 30G Electric"];
const SEED: Branch[] = [
  { id: "b1", name: "Model Town", code: "BR-MT", type: "Shop", city: "Lahore", province: "Punjab", manager: "Tariq Mahmood", managerPhone: "+92 333 9988776", managerEmail: "tariq@qistify.pk", phone: "+92 42 35888100", address: "12-A Model Town, Block C, Lahore", status: "Active", open: true, openTime: "10:00", closeTime: "21:00", daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], staff: 14, monthlyTarget: 5000000, achieved: 4280000, targetPeriod: CURRENT_PERIOD },
  { id: "b2", name: "Gulberg", code: "BR-GB", type: "Shop", city: "Lahore", province: "Punjab", manager: "Asif Ali", managerPhone: "+92 321 4455667", managerEmail: "asif@qistify.pk", phone: "+92 42 35777200", address: "MM Alam Road, Gulberg III, Lahore", status: "Active", open: true, openTime: "10:00", closeTime: "22:00", daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"], staff: 18, monthlyTarget: 7000000, achieved: 5210000, targetPeriod: CURRENT_PERIOD },
  { id: "b3", name: "DHA Phase 5", code: "BR-DHA", type: "Shop", city: "Lahore", province: "Punjab", manager: "Hina Khan", managerPhone: "+92 300 1122334", managerEmail: "hina@qistify.pk", phone: "+92 42 36655433", address: "Phase 5 CCA, DHA Lahore", status: "Active", open: false, openTime: "11:00", closeTime: "20:00", daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], staff: 9, monthlyTarget: 3500000, achieved: 1190000, targetPeriod: CURRENT_PERIOD },
  { id: "b4", name: "Main Warehouse", code: "WH-01", type: "Warehouse", city: "Lahore", province: "Punjab", manager: "Imran Sheikh", managerPhone: "+92 345 5566778", managerEmail: "imran@qistify.pk", phone: "+92 42 36666300", address: "Industrial Estate, Kot Lakhpat, Lahore", status: "Active", open: true, openTime: "08:00", closeTime: "18:00", daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], staff: 22, monthlyTarget: 0, achieved: 0, targetPeriod: CURRENT_PERIOD },
  { id: "b5", name: "Head Office", code: "HO", type: "Head Office", city: "Lahore", province: "Punjab", manager: "Ahmed Hassan", managerPhone: "+92 300 0000001", managerEmail: "ahmed@qistify.pk", phone: "+92 42 35880000", address: "Boulevard Plaza, Gulberg III, Lahore", status: "Active", open: true, openTime: "09:00", closeTime: "18:00", daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri"], staff: 28, monthlyTarget: 0, achieved: 0, targetPeriod: CURRENT_PERIOD },
];

function daysLeftInMonth() {
  const now = new Date();
  const last = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  return Math.max(0, last - now.getDate());
}

function fmtMoney(n: number) {
  if (n >= 10_000_000) return `Rs. ${(n / 10_000_000).toFixed(2)} Cr`;
  if (n >= 100_000) return `Rs. ${(n / 100_000).toFixed(2)} L`;
  if (n >= 1000) return `Rs. ${(n / 1000).toFixed(1)}k`;
  return `Rs. ${n.toLocaleString()}`;
}

export function BranchesPage() {
  const toast = useToast();
  const { items, create, update, remove } = useEntityStore<Branch>("qcrm.branches.v2", SEED);
  const [search, setSearch] = useState("");
  const [view, setView] = useState<Branch | null>(null);
  const [editing, setEditing] = useState<Branch | null>(null);
  const [adding, setAdding] = useState(false);
  const [confirmDel, setConfirmDel] = useState<Branch | null>(null);

  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter((b) => [b.name, b.code, b.city, b.manager].some((s) => s.toLowerCase().includes(q)));
  }, [items, search]);

  function toggleOpen(b: Branch) {
    update(b.id, { open: !b.open } as any);
    toast.success(`${b.name} is now ${!b.open ? "Open" : "Closed"}`, "Branch on/off status updated.");
  }
  function save(values: Branch) {
    if (editing) {
      update(editing.id, values);
      toast.success("Branch updated", `${values.name} has been saved.`);
    } else {
      create(values as any);
      toast.success("Branch added", `${values.name} is now in your network.`);
    }
    setEditing(null);
    setAdding(false);
  }
  function doDelete() {
    if (!confirmDel) return;
    remove(confirmDel.id);
    toast.success("Branch deleted", `${confirmDel.name} has been removed.`);
    setConfirmDel(null);
  }

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="Branches"
          description="Manage every shop, warehouse and head office - profile, timings, manager and item availability."
          actions={<button onClick={() => setAdding(true)} className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30"><Plus className="h-4 w-4" /> Add Branch</button>}
        />
        <SettingsTabs initial="branches" />
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
          <StatCard label="Total Branches" value={items.length} icon={<KpiIcons.branch />} tone="primary" />
          <StatCard label="Currently Open" value={items.filter((b) => b.open && b.status === "Active").length} icon={<KpiIcon icon={Power} />} tone="success" />
          <StatCard label="Closed Today" value={items.filter((b) => !b.open).length} icon={<KpiIcons.clock />} tone="warning" />
          <StatCard label="Target Achievement" value={(() => { const t = items.reduce((s, b) => s + b.monthlyTarget, 0); const a = items.reduce((s, b) => s + b.achieved, 0); return t ? `${Math.round((a / t) * 100)}%` : "-"; })()} hint={`${daysLeftInMonth()} days left`} icon={<KpiIcon icon={Target} />} tone="primary" />
        </div>
        <div className="flex items-center gap-3 mb-4">
          <div className="relative flex-1 max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search branches..." className="w-full h-10 pl-9 pr-3 rounded-lg border border-border bg-card text-sm focus:outline-none focus:ring-2 focus:ring-primary/30" />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((b) => <BranchCard key={b.id} branch={b} onView={() => setView(b)} onEdit={() => setEditing(b)} onToggle={() => toggleOpen(b)} onDelete={() => setConfirmDel(b)} />)}
        </div>
        {view && <BranchProfileDrawer branch={view} onClose={() => setView(null)} onEdit={() => { setEditing(view); setView(null); }} />}
        {(adding || editing) && <BranchFormModal initial={editing ?? undefined} onClose={() => { setEditing(null); setAdding(false); }} onSave={save} />}
        <ConfirmDialog open={!!confirmDel} title="Delete branch?" description={<>You're about to permanently delete <span className="font-semibold text-foreground">{confirmDel?.name}</span>. All linked data will remain but this branch will no longer be selectable.</>} confirmLabel="Yes, delete branch" onConfirm={doDelete} onCancel={() => setConfirmDel(null)} />
      </div>
    </AppShell>
  );
}

function BranchCard({ branch, onView, onEdit, onToggle, onDelete }: { branch: Branch; onView: () => void; onEdit: () => void; onToggle: () => void; onDelete: () => void }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[0_4px_16px_-6px_rgba(16,24,40,0.08)] hover:shadow-[0_8px_24px_-8px_rgba(16,24,40,0.12)] transition-shadow">
      <div className="p-5 border-b border-border flex items-start gap-3">
        <div className={`h-12 w-12 rounded-xl grid place-items-center text-white shadow-md ${branch.open ? "bg-gradient-to-br from-primary to-primary" : "bg-gradient-to-br from-muted-foreground to-foreground/60"}`}><Building2 className="h-5 w-5" /></div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2"><h3 className="font-bold text-foreground tracking-tight truncate">{branch.name}</h3><span className={`h-2 w-2 rounded-full ${branch.open ? "bg-success" : "bg-destructive"}`} /></div>
          <div className="text-[12px] text-muted-foreground font-mono">{branch.code} - {branch.type}</div>
        </div>
        <Badge tone={branch.status === "Active" ? "success" : "muted"}>{branch.status}</Badge>
      </div>
      <div className="p-5 space-y-2 text-[13px]">
        <div className="flex items-center gap-2 text-foreground"><User className="h-3.5 w-3.5 text-muted-foreground" /><span className="font-semibold">{branch.manager}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><Phone className="h-3.5 w-3.5" /><span className="font-medium">{branch.phone}</span></div>
        <div className="flex items-start gap-2 text-muted-foreground"><MapPin className="h-3.5 w-3.5 mt-0.5" /><span className="font-medium line-clamp-1">{branch.address}</span></div>
        <div className="flex items-center gap-2 text-muted-foreground"><Clock className="h-3.5 w-3.5" /><span className="font-medium">{branch.openTime} - {branch.closeTime} ({branch.daysOpen.length} days/week)</span></div>
      </div>
      {branch.monthlyTarget > 0 && <TargetProgress branch={branch} />}
      <div className="px-5 py-3 border-t border-border bg-muted/20 flex items-center justify-between gap-2">
        <button onClick={onToggle} className={`inline-flex items-center gap-1.5 h-8 px-2.5 rounded-md text-[12px] font-bold ${branch.open ? "bg-destructive/10 text-destructive hover:bg-destructive/20" : "bg-success/15 text-success-foreground hover:bg-success/25"}`}><Power className="h-3.5 w-3.5" /> {branch.open ? "Mark Closed" : "Mark Open"}</button>
        <div className="flex items-center gap-1">
          <button onClick={onView} className="h-8 w-8 grid place-items-center rounded-md border border-border bg-card hover:bg-muted text-muted-foreground" title="View profile"><Eye className="h-3.5 w-3.5" /></button>
          <button onClick={onEdit} className="h-8 w-8 grid place-items-center rounded-md border border-border bg-card hover:bg-muted text-muted-foreground" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
          <button onClick={onDelete} className="h-8 w-8 grid place-items-center rounded-md border border-border bg-card hover:bg-destructive/10 hover:text-destructive text-muted-foreground" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
        </div>
      </div>
    </div>
  );
}

function BranchProfileDrawer({ branch, onClose, onEdit }: { branch: Branch; onClose: () => void; onEdit: () => void }) {
  const toast = useToast();
  const { items, update } = useEntityStore<{ id: string; available: Record<string, boolean> }>(`qcrm.branchAvailability.${branch.id}`, [{ id: "default", available: Object.fromEntries(PRODUCTS_DEMO.map((p) => [p, true])) }]);
  const map = items[0]?.available ?? {};
  function toggle(p: string) {
    const next = { ...map, [p]: !map[p] };
    update("default", { available: next } as any);
    toast.success(`${p}`, `Now ${next[p] ? "available" : "unavailable"} at ${branch.name}.`);
  }

  return (
    <div className="fixed inset-0 z-[60] flex" onClick={onClose}>
      <div className="flex-1 bg-slate-900/40 backdrop-blur-sm" />
      <aside onClick={(e) => e.stopPropagation()} className="w-full max-w-xl bg-background border-l border-border shadow-2xl flex flex-col">
        <div className="px-6 py-5 border-b border-border bg-gradient-to-r from-primary to-primary text-primary-foreground flex items-start gap-3">
          <div className="h-12 w-12 rounded-xl bg-white/15 grid place-items-center backdrop-blur ring-1 ring-white/25"><Building2 className="h-5 w-5" /></div>
          <div className="flex-1 min-w-0"><h2 className="text-lg font-bold tracking-tight">{branch.name}</h2><div className="text-[12px] opacity-90 font-medium">{branch.code} - {branch.type} - {branch.city}</div></div>
          <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg bg-white/15 hover:bg-white/25"><X className="h-4 w-4" /></button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <section><SectionTitle>Branch Status</SectionTitle><div className="rounded-xl border border-border p-4 bg-card flex items-center justify-between"><div className="flex items-center gap-3"><span className={`h-10 w-10 rounded-lg grid place-items-center ${branch.open ? "bg-success/20 text-success-foreground" : "bg-destructive/15 text-destructive"}`}><Power className="h-4 w-4" /></span><div><div className="text-sm font-bold">{branch.open ? "Currently Open" : "Currently Closed"}</div><div className="text-[12px] text-muted-foreground">{branch.openTime} - {branch.closeTime}</div></div></div><Badge tone={branch.status === "Active" ? "success" : "muted"}>{branch.status}</Badge></div></section>
          <section><SectionTitle>Manager</SectionTitle><div className="rounded-xl border border-border p-4 bg-card grid grid-cols-1 sm:grid-cols-2 gap-3 text-[13px]"><InfoRow icon={<User className="h-3.5 w-3.5" />} label="Name" value={branch.manager} /><InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Phone" value={branch.managerPhone} /><InfoRow icon={<Mail className="h-3.5 w-3.5" />} label="Email" value={branch.managerEmail} /><InfoRow icon={<Users className="h-3.5 w-3.5" />} label="Staff Count" value={String(branch.staff)} /></div></section>
          <section><SectionTitle>Contact & Address</SectionTitle><div className="rounded-xl border border-border p-4 bg-card space-y-3 text-[13px]"><InfoRow icon={<Phone className="h-3.5 w-3.5" />} label="Branch Phone" value={branch.phone} /><InfoRow icon={<MapPin className="h-3.5 w-3.5" />} label="Address" value={branch.address} /></div></section>
          {branch.monthlyTarget > 0 && <section><SectionTitle>Sales Target - {branch.targetPeriod}</SectionTitle><div className="rounded-xl border border-border p-4 bg-card"><TargetProgress branch={branch} variant="drawer" /></div></section>}
          <section><SectionTitle>Timings</SectionTitle><div className="rounded-xl border border-border p-4 bg-card"><div className="flex items-center gap-2 mb-3 text-[13px] font-semibold"><Calendar className="h-4 w-4 text-muted-foreground" /><span>{branch.openTime} - {branch.closeTime}</span></div><div className="flex flex-wrap gap-1.5">{DAYS.map((d) => <span key={d} className={`h-8 w-12 grid place-items-center rounded-md text-[11px] font-bold ${branch.daysOpen.includes(d) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{d}</span>)}</div></div></section>
          <section><SectionTitle>Item Availability at this Branch</SectionTitle><div className="rounded-xl border border-border bg-card divide-y divide-border">{PRODUCTS_DEMO.map((p) => { const on = map[p] !== false; return <div key={p} className="flex items-center gap-3 px-4 py-3"><span className="h-9 w-9 rounded-md bg-muted/60 grid place-items-center text-muted-foreground"><Package className="h-4 w-4" /></span><span className="flex-1 text-[13px] font-semibold text-foreground">{p}</span><span className={`text-[11px] font-bold ${on ? "text-success-foreground" : "text-muted-foreground"}`}>{on ? "Available" : "Unavailable"}</span><button type="button" onClick={() => toggle(p)} className={`relative h-6 w-11 rounded-full transition ${on ? "bg-primary" : "bg-muted-foreground/30"}`}><span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${on ? "left-[22px]" : "left-0.5"}`} /></button></div>; })}</div></section>
        </div>
        <div className="px-6 py-4 border-t border-border bg-muted/30 flex items-center justify-end gap-2"><button onClick={onClose} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold hover:bg-muted">Close</button><button onClick={onEdit} className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"><Pencil className="h-4 w-4" /> Edit Branch</button></div>
      </aside>
    </div>
  );
}

function TargetProgress({ branch, variant = "card" }: { branch: Branch; variant?: "card" | "drawer" }) {
  const target = branch.monthlyTarget;
  const achieved = Math.max(0, branch.achieved);
  const pct = Math.min(100, Math.round((achieved / Math.max(1, target)) * 100));
  const remaining = Math.max(0, target - achieved);
  const left = daysLeftInMonth();
  const onTrack = pct >= ((30 - left) / 30) * 100;
  const tone = pct >= 100 ? "from-success to-success" : onTrack ? "from-primary to-primary" : "from-warning to-destructive";
  return (
    <div className={variant === "card" ? "px-5 py-3 border-t border-border bg-gradient-to-b from-muted/10 to-transparent" : ""}>
      <div className="flex items-center justify-between gap-2 mb-1.5"><div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-muted-foreground uppercase tracking-wide"><Target className="h-3 w-3 text-primary" />{variant === "card" ? `Target - ${branch.targetPeriod}` : "Progress"}</div><div className="text-[11px] font-bold tabular-nums text-foreground">{pct}%{pct >= 100 && <span className="ml-1 text-success-foreground">✓</span>}</div></div>
      <div className="h-2 rounded-full bg-muted overflow-hidden"><div className={`h-full bg-gradient-to-r ${tone} transition-all`} style={{ width: `${pct}%` }} /></div>
      <div className="flex items-center justify-between mt-1.5 text-[11px] gap-2 flex-wrap"><span className="font-semibold text-foreground tabular-nums"><span className="text-success-foreground">{fmtMoney(achieved)}</span><span className="text-muted-foreground"> of {fmtMoney(target)}</span></span><span className="inline-flex items-center gap-1 font-semibold text-muted-foreground"><Clock className="h-3 w-3" />{remaining > 0 ? <>{fmtMoney(remaining)} left - {left}d</> : <span className="text-success-foreground">Target met</span>}</span></div>
    </div>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return <div className={`${ui.textKpiLabel} ${ui.textMuted} flex items-center gap-2 text-[10px] tracking-[0.14em] mb-2`}><ChevronRight className="h-3 w-3" />{children}</div>;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
  return <div className="flex items-start gap-2"><span className="text-muted-foreground mt-0.5">{icon}</span><div className="flex-1 min-w-0"><div className={`${ui.textKpiLabel} ${ui.textMuted} text-[10px]`}>{label}</div><div className="text-foreground font-semibold truncate">{value}</div></div></div>;
}

function BranchFormModal({ initial, onClose, onSave }: { initial?: Branch; onClose: () => void; onSave: (b: Branch) => void }) {
  const [b, setB] = useState<Branch>(initial ?? { id: crypto.randomUUID(), name: "", code: "", type: "Shop", city: "", province: "Punjab", manager: "", managerPhone: "", managerEmail: "", phone: "", address: "", status: "Active", open: true, openTime: "10:00", closeTime: "21:00", daysOpen: ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"], staff: 0, monthlyTarget: 0, achieved: 0, targetPeriod: CURRENT_PERIOD });
  function set<K extends keyof Branch>(k: K, v: Branch[K]) { setB((x) => ({ ...x, [k]: v })); }
  function toggleDay(d: Day) { setB((x) => ({ ...x, daysOpen: x.daysOpen.includes(d) ? x.daysOpen.filter((y) => y !== d) : [...x.daysOpen, d] })); }
  return (
    <div className="fixed inset-0 z-[70] grid place-items-center p-4 bg-slate-900/55 backdrop-blur-sm" onClick={onClose}>
      <form onClick={(e) => e.stopPropagation()} onSubmit={(e) => { e.preventDefault(); onSave(b); }} className="w-full max-w-3xl rounded-2xl bg-card border border-border shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
        <div className="px-6 py-5 bg-gradient-to-r from-primary to-primary text-primary-foreground flex items-center justify-between"><div className="flex items-center gap-3"><div className="h-11 w-11 rounded-xl bg-white/15 grid place-items-center"><Building2 className="h-5 w-5" /></div><div><h2 className="font-semibold text-lg leading-tight">{initial ? `Edit ${initial.name}` : "Add New Branch"}</h2><p className="text-[12px] opacity-90">Profile, manager, timings and contact</p></div></div><button type="button" onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg bg-white/15 hover:bg-white/25"><X className="h-4 w-4" /></button></div>
        <div className="flex-1 overflow-y-auto p-6 space-y-6 no-scrollbar">
          <FormSection title="Basics"><Field label="Branch Name" required><input className={inputCls} value={b.name} onChange={(e) => set("name", e.target.value)} required /></Field><Field label="Branch Code" required><input className={inputCls} value={b.code} onChange={(e) => set("code", e.target.value)} required /></Field><Field label="Type"><select className={inputCls} value={b.type} onChange={(e) => set("type", e.target.value as any)}>{["Shop", "Warehouse", "Head Office", "Service Center"].map((o) => <option key={o}>{o}</option>)}</select></Field><Field label="Status"><select className={inputCls} value={b.status} onChange={(e) => set("status", e.target.value as any)}>{["Active", "Inactive"].map((o) => <option key={o}>{o}</option>)}</select></Field></FormSection>
          <FormSection title="Manager"><Field label="Manager Name"><input className={inputCls} value={b.manager} onChange={(e) => set("manager", e.target.value)} /></Field><Field label="Manager Phone"><CountryCodePhoneInput value={b.managerPhone} onChange={(value) => set("managerPhone", value)} /></Field><Field label="Manager Email"><input className={inputCls} value={b.managerEmail} onChange={(e) => set("managerEmail", e.target.value)} /></Field><Field label="Staff Count"><input type="number" className={inputCls} value={b.staff} onChange={(e) => set("staff", Number(e.target.value))} /></Field></FormSection>
          <FormSection title="Contact & Address"><Field label="Branch Phone"><CountryCodePhoneInput value={b.phone} onChange={(value) => set("phone", value)} /></Field><Field label="City"><input className={inputCls} value={b.city} onChange={(e) => set("city", e.target.value)} /></Field><Field label="Province"><input className={inputCls} value={b.province} onChange={(e) => set("province", e.target.value)} /></Field><Field label="Address" full><textarea rows={2} className={`${inputCls} py-2 h-auto resize-none`} value={b.address} onChange={(e) => set("address", e.target.value)} /></Field></FormSection>
          <FormSection title="Sales Target (merged from Add Target)"><Field label="Period"><input className={inputCls} value={b.targetPeriod} onChange={(e) => set("targetPeriod", e.target.value)} placeholder="May 2026" /></Field><Field label="Monthly Target (Rs.)"><CurrencyAmountInput value={b.monthlyTarget} onChange={(value) => set("monthlyTarget", Number(value || 0))} /></Field><Field label="Achieved So Far (Rs.)"><CurrencyAmountInput value={b.achieved} onChange={(value) => set("achieved", Number(value || 0))} /></Field><Field label="Live Progress"><div className="rounded-lg border border-border bg-muted/30 p-3">{b.monthlyTarget > 0 ? <><div className="flex items-baseline justify-between text-[12px] mb-1.5"><span className="font-bold text-foreground tabular-nums">{Math.round((b.achieved / Math.max(1, b.monthlyTarget)) * 100)}%</span><span className="text-muted-foreground font-semibold">{fmtMoney(Math.max(0, b.monthlyTarget - b.achieved))} left</span></div><div className="h-2 rounded-full bg-muted overflow-hidden"><div className="h-full bg-gradient-to-r from-primary to-primary transition-all" style={{ width: `${Math.min(100, Math.round((b.achieved / Math.max(1, b.monthlyTarget)) * 100))}%` }} /></div></> : <span className="text-[12px] text-muted-foreground font-medium">Set a target above to see live progress.</span>}</div></Field></FormSection>
          <FormSection title="Timings"><Field label="Open Time"><input type="time" className={inputCls} value={b.openTime} onChange={(e) => set("openTime", e.target.value)} /></Field><Field label="Close Time"><input type="time" className={inputCls} value={b.closeTime} onChange={(e) => set("closeTime", e.target.value)} /></Field><Field label="Open On" full><div className="flex flex-wrap gap-1.5">{DAYS.map((d) => <button key={d} type="button" onClick={() => toggleDay(d)} className={`h-9 w-14 rounded-md text-[11px] font-bold ${b.daysOpen.includes(d) ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"}`}>{d}</button>)}</div></Field><Field label="Branch is Open Now" full><button type="button" onClick={() => set("open", !b.open)} className={`inline-flex items-center gap-2 h-10 px-4 rounded-lg text-sm font-bold ${b.open ? "bg-success/20 text-success-foreground" : "bg-destructive/15 text-destructive"}`}><Power className="h-4 w-4" /> {b.open ? "OPEN" : "CLOSED"} - click to toggle</button></Field></FormSection>
        </div>
        <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-border bg-muted/30"><button type="button" onClick={onClose} className="h-10 px-5 rounded-lg border border-border bg-card text-sm font-semibold hover:bg-muted">Cancel</button><button type="submit" className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"><Save className="h-4 w-4" /> {initial ? "Save Changes" : "Create Branch"}</button></div>
      </form>
    </div>
  );
}

const inputCls = "w-full h-9 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30";

function FormSection({ title, children }: { title: string; children: React.ReactNode }) {
  return <div><div className={`${ui.textKpiLabel} ${ui.textMuted} text-[10px] tracking-[0.14em] mb-3`}>{title}</div><div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">{children}</div></div>;
}

function Field({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: React.ReactNode }) {
  return <div className={full ? "sm:col-span-2" : ""}><label className="block text-[13px] font-semibold text-foreground mb-1.5">{label} {required && <span className="text-destructive">*</span>}</label>{children}</div>;
}
