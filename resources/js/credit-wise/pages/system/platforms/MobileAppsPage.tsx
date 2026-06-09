import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Smartphone,
  Crown,
  Briefcase,
  Truck,
  Users,
  ShieldCheck,
  Settings2,
  Bell,
  Send,
  QrCode,
  RefreshCw,
  Palette,
} from "lucide-react";
import { toast } from "sonner";
import { ui } from "@/components/ui-kit";
import { UnderlineTabBar, UnderlineTab } from "@/components/ui/underline-tabs";
import { AppearanceConfig } from "@/pages/system/settings/components/AppearanceConfig";

type AppItem = {
  id: string;
  name: string;
  audience: string;
  audienceColor: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  version: string;
  activeUsers: number;
  lastUpdate: string;
  enabled: boolean;
};

const APPS: AppItem[] = [
  { id: "owner", name: "Owner App", audience: "Owner / Admin", audienceColor: "bg-amber-500/15 text-amber-700 border-amber-500/30", icon: Crown, color: "from-amber-500/20 to-amber-500/5 text-amber-600", version: "2.4.1", activeUsers: 3, lastUpdate: "2026-04-22", enabled: true },
  { id: "manager", name: "Manager App", audience: "Branch Managers", audienceColor: "bg-blue-500/15 text-blue-700 border-blue-500/30", icon: ShieldCheck, color: "from-blue-500/20 to-blue-500/5 text-blue-600", version: "2.4.0", activeUsers: 12, lastUpdate: "2026-04-18", enabled: true },
  { id: "supplier", name: "Supplier App", audience: "Suppliers / Vendors", audienceColor: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30", icon: Truck, color: "from-emerald-500/20 to-emerald-500/5 text-emerald-600", version: "1.8.2", activeUsers: 24, lastUpdate: "2026-03-30", enabled: false },
  { id: "customer", name: "Customer App", audience: "End Customers", audienceColor: "bg-purple-500/15 text-purple-700 border-purple-500/30", icon: Users, color: "from-purple-500/20 to-purple-500/5 text-purple-600", version: "3.1.5", activeUsers: 1840, lastUpdate: "2026-05-01", enabled: true },
  { id: "salesman", name: "Salesman App", audience: "Sales Team", audienceColor: "bg-rose-500/15 text-rose-700 border-rose-500/30", icon: Briefcase, color: "from-rose-500/20 to-rose-500/5 text-rose-600", version: "2.0.4", activeUsers: 38, lastUpdate: "2026-04-10", enabled: true },
  { id: "recovery", name: "Recovery App", audience: "Recovery Agents", audienceColor: "bg-orange-500/15 text-orange-700 border-orange-500/30", icon: Bell, color: "from-orange-500/20 to-orange-500/5 text-orange-600", version: "1.5.0", activeUsers: 9, lastUpdate: "2026-04-05", enabled: true },
];

export function MobileAppsPage() {
  const [apps, setApps] = useState(APPS);
  const [active, setActive] = useState<AppItem | null>(null);
  const [tab, setTab] = useState<"apps" | "appearance">("apps");

  const totalUsers = apps.reduce((sum, app) => sum + app.activeUsers, 0);
  const activeApps = apps.filter((app) => app.enabled).length;

  const toggle = (id: string) => {
    setApps((current) => current.map((app) => (app.id === id ? { ...app, enabled: !app.enabled } : app)));
    toast.success("App status updated");
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <Smartphone className="h-6 w-6 text-primary" />
              Mobile Apps
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Cross-platform Flutter apps: enable, configure and monitor each role-based app.
            </p>
          </div>
          <Button variant="outline" size="sm" className="gap-2">
            <RefreshCw className="h-4 w-4" />
            Sync app status
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Apps online</p>
                <p className="mt-1 text-lg font-bold">{activeApps} / {apps.length}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <Smartphone className="h-5 w-5" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground">Active users (30d)</p>
            <p className="mt-1 text-2xl font-bold">{totalUsers.toLocaleString()}</p>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground">Platform</p>
            <p className="mt-1 text-2xl font-bold">Flutter - iOS + Android</p>
          </Card>
        </div>

        <UnderlineTabBar className="overflow-x-auto">
          <UnderlineTab active={tab === "apps"} onClick={() => setTab("apps")}><span className="inline-flex items-center gap-1.5"><Smartphone className="h-3.5 w-3.5" /> Apps</span></UnderlineTab>
          <UnderlineTab active={tab === "appearance"} onClick={() => setTab("appearance")}><span className="inline-flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" /> Appearance</span></UnderlineTab>
        </UnderlineTabBar>

        {tab === "appearance" ? <AppearanceConfig mode="mobile" /> : null}

        {tab === "apps" ? (
          <div className="overflow-hidden rounded-lg bg-card shadow-[0_4px_16px_-6px_rgba(16,24,40,0.12),0_2px_4px_-2px_rgba(16,24,40,0.06)]">
            <div className="flex items-center justify-between border-b border-border px-5 py-4">
              <h3 className="font-semibold">Apps</h3>
              <Badge variant="secondary">{apps.length} apps</Badge>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead className={ui.tableHeadRow}>
                  <tr>
                    <th className="w-12 px-4 py-4 text-left font-bold">SR#</th>
                    <th className="px-2 py-4 text-left font-bold">App</th>
                    <th className="px-2 py-4 text-left font-bold">Audience</th>
                    <th className="px-2 py-4 text-left font-bold">Version</th>
                    <th className="px-2 py-4 text-right font-bold">Active Users</th>
                    <th className="px-2 py-4 text-left font-bold">Last Update</th>
                    <th className="px-2 py-4 text-center font-bold">Enabled</th>
                    <th className="px-2 py-4 text-right font-bold">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {apps.map((app, index) => {
                    const Icon = app.icon;

                    return (
                      <tr key={app.id} className="transition-colors hover:bg-muted/30">
                        <td className="px-4 py-4 font-medium text-muted-foreground">{index + 1}</td>
                        <td className="px-2 py-4">
                          <div className="flex items-center gap-2.5">
                            <div className={`rounded-lg border bg-gradient-to-br p-2 ${app.color}`}>
                              <Icon className="h-4 w-4" />
                            </div>
                            <span className="font-semibold">{app.name}</span>
                          </div>
                        </td>
                        <td className="px-2 py-4">
                          <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${app.audienceColor}`}>
                            {app.audience}
                          </span>
                        </td>
                        <td className="px-2 py-4 font-bold">v{app.version}</td>
                        <td className="px-2 py-4 text-right font-bold">{app.activeUsers.toLocaleString()}</td>
                        <td className="px-2 py-4 text-muted-foreground">{app.lastUpdate}</td>
                        <td className="px-2 py-4 text-center"><Switch checked={app.enabled} onCheckedChange={() => toggle(app.id)} /></td>
                        <td className="px-2 py-4">
                          <div className="flex items-center justify-end gap-1">
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => toast.success(`Push notification sent to ${app.name} users`)}>
                              <Send className="h-3.5 w-3.5" />
                              Notify
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => toast.success(`Install QR for ${app.name} ready`)}>
                              <QrCode className="h-3.5 w-3.5" />
                              QR
                            </Button>
                            <Button variant="ghost" size="sm" className="gap-1" onClick={() => setActive(app)}>
                              <Settings2 className="h-3.5 w-3.5" />
                              Configure
                            </Button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}
      </div>

      <Dialog open={!!active} onOpenChange={(open) => !open && setActive(null)}>
        <DialogContent className="max-w-lg">
          {active ? (
            <>
              <DialogHeader>
                <div className="flex items-center gap-3">
                  <div className={`rounded-lg border bg-gradient-to-br p-2.5 ${active.color}`}>
                    <active.icon className="h-5 w-5" />
                  </div>
                  <div>
                    <DialogTitle>{active.name}</DialogTitle>
                    <DialogDescription>{active.audience} - v{active.version}</DialogDescription>
                  </div>
                </div>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">App Name</Label>
                  <Input defaultValue={active.name} />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Theme Color</Label>
                  <Input defaultValue="#2563eb" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Splash Tagline</Label>
                  <Input defaultValue="Powered by CreditWise" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Min OS</Label>
                  <Input defaultValue="iOS 14 / Android 8" />
                </div>
                <div className="col-span-2 space-y-1.5">
                  <Label className="text-xs">Support Phone</Label>
                  <Input defaultValue="+92 42 35888100" />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setActive(null)}>Cancel</Button>
                <Button onClick={() => { toast.success("App settings saved"); setActive(null); }}>Save</Button>
              </DialogFooter>
            </>
          ) : null}
        </DialogContent>
      </Dialog>
    </>
  );
}
