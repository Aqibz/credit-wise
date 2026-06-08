import { useState } from "react";
import {
  Printer, Fingerprint, Scan, Monitor, CreditCard, Wifi, WifiOff,
  Plus, Search, Cpu, Cable, Bluetooth, Usb, AlertTriangle, CheckCircle2,
  Building2, MapPin, Calendar, Settings2,
} from "lucide-react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, Badge } from "@/components/ui-kit";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

type Connection = "Wi-Fi" | "LAN" | "USB" | "Bluetooth" | "Serial";

type Device = {
  id: string;
  name: string;
  type: "Printer" | "Fingerprint" | "Barcode Scanner" | "POS Terminal" | "Card Reader" | "Display";
  branch: string;
  location: string;
  ip: string;
  mac: string;
  connection: Connection;
  network?: string;
  status: "Online" | "Offline" | "Warning";
  lastSeen: string;
  model: string;
  serial: string;
  installedOn: string;
  assignedTo?: string;
};

const ICONS: Record<Device["type"], any> = {
  "Printer": Printer,
  "Fingerprint": Fingerprint,
  "Barcode Scanner": Scan,
  "POS Terminal": Monitor,
  "Card Reader": CreditCard,
  "Display": Monitor,
};

const CONN_ICONS: Record<Connection, any> = {
  "Wi-Fi": Wifi,
  "LAN": Cable,
  "USB": Usb,
  "Bluetooth": Bluetooth,
  "Serial": Cable,
};

const DEVICES: Device[] = [
  { id: "DV-001", name: "Counter Receipt Printer", type: "Printer", branch: "Lahore Main", location: "Cashier Counter 1", ip: "192.168.1.21", mac: "AC:1F:6B:21:5D:01", connection: "Wi-Fi", network: "CreditWise-Office", status: "Online", lastSeen: "Just now", model: "Epson TM-T20III", serial: "X3F4U900142", installedOn: "2025-08-14", assignedTo: "Counter 1" },
  { id: "DV-002", name: "Barcode A4 Printer", type: "Printer", branch: "Lahore Main", location: "Stock Room", ip: "192.168.1.22", mac: "AC:1F:6B:21:5D:02", connection: "LAN", status: "Online", lastSeen: "1 min ago", model: "TSC TE244", serial: "TS244-78812", installedOn: "2025-09-02", assignedTo: "Inventory Team" },
  { id: "DV-003", name: "Attendance Scanner", type: "Fingerprint", branch: "Lahore Main", location: "Main Entrance", ip: "192.168.1.30", mac: "00:17:61:11:08:30", connection: "Wi-Fi", network: "CreditWise-Office", status: "Online", lastSeen: "Just now", model: "ZKTeco K40", serial: "ZK-K40-22019", installedOn: "2025-06-10", assignedTo: "HR · Attendance" },
  { id: "DV-004", name: "Warehouse Scanner #1", type: "Barcode Scanner", branch: "Karachi Warehouse", location: "Receiving Dock", ip: "—", mac: "—", connection: "Bluetooth", status: "Online", lastSeen: "5 min ago", model: "Honeywell 1900g", serial: "HW-1900-441", installedOn: "2025-04-20", assignedTo: "Warehouse In-charge" },
  { id: "DV-005", name: "POS Counter 2", type: "POS Terminal", branch: "Islamabad Branch", location: "Cashier Counter 2", ip: "192.168.5.11", mac: "DC:2C:6E:11:5A:11", connection: "LAN", status: "Warning", lastSeen: "12 min ago", model: "HP RP9 G1", serial: "HP-RP9-9911", installedOn: "2024-11-05", assignedTo: "Counter 2" },
  { id: "DV-006", name: "JazzCash Card Reader", type: "Card Reader", branch: "Lahore Main", location: "Cashier Counter 1", ip: "—", mac: "—", connection: "USB", status: "Offline", lastSeen: "2 hr ago", model: "Ingenico iCT220", serial: "IG-220-77541", installedOn: "2024-12-18" },
  { id: "DV-007", name: "Customer Display", type: "Display", branch: "Lahore Main", location: "Cashier Counter 1", ip: "192.168.1.45", mac: "B8:27:EB:01:45:00", connection: "LAN", status: "Online", lastSeen: "Just now", model: "VFD 220", serial: "VFD-220-002", installedOn: "2025-07-01" },
  { id: "DV-008", name: "Biometric Gate", type: "Fingerprint", branch: "Karachi Warehouse", location: "Warehouse Gate", ip: "192.168.5.30", mac: "00:17:61:11:08:42", connection: "Wi-Fi", network: "QK-Warehouse", status: "Offline", lastSeen: "1 day ago", model: "ZKTeco F18", serial: "ZK-F18-8870", installedOn: "2025-02-12", assignedTo: "Warehouse Security" },
];

function statusTone(s: Device["status"]): "success" | "warning" | "destructive" {
  return s === "Online" ? "success" : s === "Warning" ? "warning" : "destructive";
}

function StatusDot({ s }: { s: Device["status"] }) {
  const cls = s === "Online" ? "bg-success" : s === "Warning" ? "bg-warning" : "bg-destructive";
  return (
    <span className="relative inline-flex h-2.5 w-2.5">
      <span className={`absolute inline-flex h-full w-full rounded-full ${cls} opacity-60 animate-ping`} />
      <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${cls}`} />
    </span>
  );
}

function DeviceCard({ d }: { d: Device }) {
  const Icon = ICONS[d.type];
  const ConnIcon = CONN_ICONS[d.connection];
  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:shadow-md transition-shadow flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-start gap-3">
        <span className="h-12 w-12 shrink-0 rounded-lg bg-primary-soft text-primary grid place-items-center">
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <StatusDot s={d.status} />
            <h3 className="font-semibold text-[14px] truncate">{d.name}</h3>
          </div>
          <div className="text-[11px] text-muted-foreground mt-0.5">{d.id} · {d.type}</div>
          <div className="mt-1.5">
            <Badge tone={statusTone(d.status)}>
              {d.status === "Online" ? <CheckCircle2 className="h-3 w-3 mr-1" /> : d.status === "Warning" ? <AlertTriangle className="h-3 w-3 mr-1" /> : <WifiOff className="h-3 w-3 mr-1" />}
              {d.status}
            </Badge>
          </div>
        </div>
        <button className="p-1.5 rounded-md hover:bg-muted text-muted-foreground" title="Configure">
          <Settings2 className="h-4 w-4" />
        </button>
      </div>

      {/* Connection block */}
      <div className="rounded-lg bg-muted/40 p-2.5 text-[12px]">
        <div className="flex items-center gap-2 font-semibold text-foreground">
          <ConnIcon className="h-3.5 w-3.5 text-primary" />
          <span>{d.connection}</span>
          {d.network && <span className="text-muted-foreground font-normal">· {d.network}</span>}
        </div>
        <div className="mt-1 grid grid-cols-2 gap-x-3 gap-y-0.5 text-[11px] text-muted-foreground font-mono">
          <div>IP: <span className="text-foreground">{d.ip}</span></div>
          <div>MAC: <span className="text-foreground">{d.mac}</span></div>
        </div>
      </div>

      {/* Profile rows */}
      <div className="space-y-1 text-[12px]">
        <Row icon={Cpu} label="Model" value={`${d.model}`} />
        <Row icon={Cpu} label="Serial" value={d.serial} mono />
        <Row icon={Building2} label="Branch" value={d.branch} />
        <Row icon={MapPin} label="Location" value={d.location} />
        {d.assignedTo && <Row icon={Settings2} label="Assigned" value={d.assignedTo} />}
        <Row icon={Calendar} label="Installed" value={d.installedOn} />
      </div>

      {/* Footer */}
      <div className="flex items-center justify-between pt-1 border-t border-border text-[11px] text-muted-foreground">
        <span>Last seen: <span className="text-foreground font-medium">{d.lastSeen}</span></span>
        <button className="text-primary font-semibold hover:underline">Open profile →</button>
      </div>
    </div>
  );
}

function Row({ icon: I, label, value, mono }: { icon: any; label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center gap-2">
      <I className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
      <span className="text-muted-foreground w-20 shrink-0">{label}</span>
      <span className={`text-foreground truncate ${mono ? "font-mono text-[11.5px]" : ""}`}>{value}</span>
    </div>
  );
}

function DeviceManagementPage() {
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | Device["type"]>("All");
  const filtered = DEVICES.filter((d) =>
    (filter === "All" || d.type === filter) &&
    (q === "" || d.name.toLowerCase().includes(q.toLowerCase()) || d.branch.toLowerCase().includes(q.toLowerCase()) || d.location.toLowerCase().includes(q.toLowerCase())),
  );

  const online = DEVICES.filter((d) => d.status === "Online").length;
  const offline = DEVICES.filter((d) => d.status === "Offline").length;
  const warn = DEVICES.filter((d) => d.status === "Warning").length;

  return (
    <AppShell>
      <div className="space-y-5">
        <PageHeader
          title="Device Management"
          description="Printer, biometric, scanner aur POS hardware ki connection & profile."
          icon={<Cpu className="h-5 w-5" />}
          actions={<Button><Plus className="h-4 w-4 mr-1" /> Add Device</Button>}
        />

        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
          <StatCard label="Total Devices" value={String(DEVICES.length)} icon={<Cpu className="h-4 w-4" />} />
          <StatCard label="Online" value={String(online)} icon={<Wifi className="h-4 w-4" />} tone="success" />
          <StatCard label="Offline" value={String(offline)} icon={<WifiOff className="h-4 w-4" />} tone="destructive" />
          <StatCard label="Warnings" value={String(warn)} icon={<AlertTriangle className="h-4 w-4" />} tone="warning" />
          <StatCard label="Printers" value={String(DEVICES.filter((d) => d.type === "Printer").length)} icon={<Printer className="h-4 w-4" />} />
          <StatCard label="Biometrics" value={String(DEVICES.filter((d) => d.type === "Fingerprint").length)} icon={<Fingerprint className="h-4 w-4" />} />
        </div>

        <div className="rounded-xl border bg-card p-3 flex flex-wrap gap-2 items-center">
          <div className="relative flex-1 min-w-[220px]">
            <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search device, branch, location..." className="pl-9" />
          </div>
          {(["All", "Printer", "Fingerprint", "Barcode Scanner", "POS Terminal", "Card Reader", "Display"] as const).map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-3 py-1.5 rounded-md text-xs border transition-colors ${filter === t ? "bg-primary text-primary-foreground border-primary" : "border-border hover:bg-muted/40"}`}
            >
              {t}
            </button>
          ))}
        </div>

        {filtered.length === 0 ? (
          <div className="rounded-xl border bg-card p-10 text-center text-sm text-muted-foreground">
            No devices match your filter.
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-3">
            {filtered.map((d) => <DeviceCard key={d.id} d={d} />)}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export { DeviceManagementPage };

