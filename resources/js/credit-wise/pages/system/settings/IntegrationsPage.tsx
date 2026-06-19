import { useMemo, useState } from "react";
import { Switch } from "@/shared/ui/primitives/switch";
import { Button } from "@/shared/ui/primitives/button";
import { Input } from "@/shared/ui/primitives/input";
import { Label } from "@/shared/ui/primitives/label";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/shared/ui/primitives/dialog";
import {
  Building2, Banknote, Smartphone, Wallet, Flame, CalendarClock, KeyRound, Link2, Globe, ShieldCheck, Settings2, Plug, CheckCircle2, CircleDashed,
} from "lucide-react";
import { toast } from "sonner";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard } from "@/shared/ui/core/UiKit";
import { UnderlineTab, UnderlineTabBar } from "@/shared/ui/primitives/underline-tabs";
import { SettingsTabs } from "@/pages/system/settings/SettingsTabs";

type Tone = "primary" | "info" | "success" | "warning" | "destructive" | "accent";
type Integration = { id: string; name: string; category: string; description: string; icon: React.ComponentType<{ className?: string }>; tone: Tone; fields: { key: string; label: string; placeholder: string; type?: string }[] };

const TONE_CLASSES: Record<Tone, { tile: string; ring: string; chip: string }> = {
  primary: { tile: "bg-primary/10 text-primary", ring: "ring-primary/20", chip: "bg-primary/10 text-primary" },
  info: { tile: "bg-info/10 text-info", ring: "ring-info/20", chip: "bg-info/10 text-info" },
  success: { tile: "bg-success/10 text-success", ring: "ring-success/20", chip: "bg-success/10 text-success" },
  warning: { tile: "bg-warning/15 text-warning", ring: "ring-warning/25", chip: "bg-warning/15 text-warning" },
  destructive: { tile: "bg-destructive/10 text-destructive", ring: "ring-destructive/20", chip: "bg-destructive/10 text-destructive" },
  accent: { tile: "bg-accent text-accent-foreground", ring: "ring-border", chip: "bg-accent text-accent-foreground" },
};

const INTEGRATIONS: Integration[] = [
  { id: "fbr", name: "FBR (POS Integration)", category: "Tax", description: "Federal Board of Revenue real-time invoice reporting.", icon: Building2, tone: "success", fields: [{ key: "posId", label: "POS Registration ID", placeholder: "POS-123456" }, { key: "token", label: "Bearer Token", placeholder: "eyJhbGciOi...", type: "password" }, { key: "endpoint", label: "API Endpoint", placeholder: "https://gw.fbr.gov.pk/..." }] },
  { id: "alfalah", name: "Bank Alfalah", category: "Payments", description: "Card processing & online banking checkout.", icon: Banknote, tone: "info", fields: [{ key: "merchantId", label: "Merchant ID", placeholder: "ALF-00012" }, { key: "apiKey", label: "API Key", placeholder: "alf_live_...", type: "password" }, { key: "secret", label: "Secret Key", placeholder: "********", type: "password" }] },
  { id: "jazzcash", name: "JazzCash", category: "Wallet", description: "Mobile wallet payments & QR collection.", icon: Smartphone, tone: "warning", fields: [{ key: "merchantId", label: "Merchant ID", placeholder: "MC12345" }, { key: "password", label: "Password", placeholder: "********", type: "password" }, { key: "salt", label: "Integrity Salt", placeholder: "abc123xyz", type: "password" }] },
  { id: "easypaisa", name: "EasyPaisa", category: "Wallet", description: "Telenor EasyPaisa OTC & wallet collection.", icon: Wallet, tone: "success", fields: [{ key: "storeId", label: "Store ID", placeholder: "ESP-7788" }, { key: "hashKey", label: "Hash Key", placeholder: "********", type: "password" }, { key: "account", label: "Receiver Account", placeholder: "0345-1234567" }] },
  { id: "installments", name: "Installment Provider", category: "Financing", description: "BNPL & EMI plans for customer installments.", icon: CalendarClock, tone: "primary", fields: [{ key: "providerKey", label: "Provider API Key", placeholder: "inst_live_...", type: "password" }, { key: "tenure", label: "Default Tenure (months)", placeholder: "6" }, { key: "markup", label: "Markup %", placeholder: "12" }] },
  { id: "firebase", name: "Firebase", category: "Cloud", description: "Push notifications, auth & realtime sync.", icon: Flame, tone: "warning", fields: [{ key: "projectId", label: "Project ID", placeholder: "my-pos-app" }, { key: "apiKey", label: "Web API Key", placeholder: "AIzaSy...", type: "password" }, { key: "senderId", label: "Sender ID", placeholder: "1234567890" }] },
  { id: "sso", name: "Google SSO", category: "Auth", description: "Sign-in with Google for staff accounts.", icon: KeyRound, tone: "destructive", fields: [{ key: "clientId", label: "Client ID", placeholder: "xxx.apps.googleusercontent.com" }, { key: "clientSecret", label: "Client Secret", placeholder: "********", type: "password" }] },
  { id: "webhooks", name: "Webhooks", category: "Developer", description: "Outbound events to your own URLs.", icon: Link2, tone: "info", fields: [{ key: "url", label: "Endpoint URL", placeholder: "https://example.com/hook" }, { key: "secret", label: "Signing Secret", placeholder: "whsec_...", type: "password" }] },
];

const CATEGORIES = ["All", "Payments", "Wallet", "Tax", "Financing", "Cloud", "Auth", "Developer"];

export function IntegrationsPage() {
  const [enabled, setEnabled] = useState<Record<string, boolean>>({ fbr: true, alfalah: true, jazzcash: false, easypaisa: false, installments: false, firebase: true, sso: false, webhooks: false });
  const [active, setActive] = useState<Integration | null>(null);
  const [cat, setCat] = useState("All");

  const toggle = (id: string, val: boolean) => {
    setEnabled((s) => ({ ...s, [id]: val }));
    toast.success(`${INTEGRATIONS.find((i) => i.id === id)?.name} ${val ? "enabled" : "disabled"}`);
  };

  const filtered = useMemo(() => INTEGRATIONS.filter((i) => cat === "All" || i.category === cat), [cat]);
  const activeCount = Object.values(enabled).filter(Boolean).length;
  const total = INTEGRATIONS.length;

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader title="Integrations" description="Connect tax, payments, wallets and cloud services. Click any card to configure." icon={<Globe className="h-6 w-6 text-primary" />} />
        <SettingsTabs initial="integrations" />
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
          <StatCard label="Active" value={String(activeCount)} icon={<CheckCircle2 className="h-5 w-5" />} tone="success" />
          <StatCard label="Available" value={String(total)} icon={<Plug className="h-5 w-5" />} tone="primary" />
          <StatCard label="Categories" value={String(CATEGORIES.length - 1)} icon={<Settings2 className="h-5 w-5" />} tone="primary" />
          <StatCard label="Inactive" value={String(total - activeCount)} icon={<CircleDashed className="h-5 w-5" />} tone="warning" />
        </div>
        <UnderlineTabBar className="mb-5 overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {CATEGORIES.map((c) => <UnderlineTab key={c} active={cat === c} onClick={() => setCat(c)}>{c}</UnderlineTab>)}
        </UnderlineTabBar>
        {filtered.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Plug className="h-10 w-10 mx-auto text-muted-foreground/60 mb-3" />
            <div className="text-sm font-semibold text-foreground">No integrations found</div>
            <div className="text-xs text-muted-foreground mt-1">Try a different search or category.</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((it) => {
              const Icon = it.icon;
              const on = enabled[it.id];
              const tc = TONE_CLASSES[it.tone];
              return (
                <article
                  key={it.id}
                  role="button"
                  tabIndex={0}
                  onClick={() => setActive(it)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault();
                      setActive(it);
                    }
                  }}
                  className={`group relative cursor-pointer overflow-hidden rounded-xl border border-border bg-card text-left transition-all hover:-translate-y-0.5 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${on ? `ring-1 ${tc.ring}` : ""}`}
                >
                  <div className="p-4 flex items-start justify-between gap-3">
                    <div className={`h-12 w-12 rounded-xl grid place-items-center ${tc.tile} ring-1 ${tc.ring}`}><Icon className="h-6 w-6" /></div>
                    <div onClick={(e) => e.stopPropagation()} className="pt-0.5"><Switch checked={on} onCheckedChange={(v) => toggle(it.id, v)} /></div>
                  </div>
                  <div className="px-4 pb-3 space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-[14px] text-foreground leading-tight">{it.name}</h3>
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${tc.chip}`}>{it.category}</span>
                    </div>
                    <p className="text-[12px] text-muted-foreground leading-relaxed line-clamp-2">{it.description}</p>
                  </div>
                  <div className="border-t border-border bg-muted/30 px-4 py-2.5 flex items-center justify-between text-[11.5px]">
                    <span className={`flex items-center gap-1.5 font-semibold ${on ? "text-success" : "text-muted-foreground"}`}>
                      <span className="relative flex h-2 w-2">{on && <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-success/60" />}<span className={`relative inline-flex h-2 w-2 rounded-full ${on ? "bg-success" : "bg-muted-foreground/40"}`} /></span>
                      {on ? "Connected" : "Not connected"}
                    </span>
                    <span className="text-muted-foreground group-hover:text-primary font-semibold transition inline-flex items-center gap-1">Configure<span className="transition-transform group-hover:translate-x-0.5">&rarr;</span></span>
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <Dialog open={!!active} onOpenChange={(o) => !o && setActive(null)}>
          <DialogContent className="max-w-lg">
            {active && (
              <>
                <DialogHeader>
                  <div className="flex items-center gap-3">
                    <div className={`h-11 w-11 rounded-xl grid place-items-center ${TONE_CLASSES[active.tone].tile} ring-1 ${TONE_CLASSES[active.tone].ring}`}><active.icon className="h-5 w-5" /></div>
                    <div><DialogTitle>{active.name}</DialogTitle><DialogDescription>{active.description}</DialogDescription></div>
                  </div>
                </DialogHeader>
                <div className="flex items-center justify-between rounded-lg border border-border p-3 bg-muted/30">
                  <div className="text-sm"><div className="font-medium text-foreground">Enable integration</div><div className="text-xs text-muted-foreground">Turn this service on or off.</div></div>
                  <Switch checked={enabled[active.id]} onCheckedChange={(v) => toggle(active.id, v)} />
                </div>
                <div className="space-y-3 pt-1">
                  {active.fields.map((f) => <div key={f.key} className="space-y-1.5"><Label className="text-xs">{f.label}</Label><Input type={f.type || "text"} placeholder={f.placeholder} /></div>)}
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
                  <Button onClick={() => { toast.success(`${active.name} settings saved`); setActive(null); }}><ShieldCheck className="h-4 w-4 mr-1" />Save changes</Button>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </AppShell>
  );
}
