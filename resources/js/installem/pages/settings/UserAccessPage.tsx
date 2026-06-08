import { useMemo, useState } from "react";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ShieldCheck,
  Smartphone,
  Globe,
  Search,
  UserCog,
  Mail,
  Eye,
  EyeOff,
  Users as UsersIcon,
  UserX,
  Ban,
  RotateCcw,
  Power,
  Plus,
  KeyRound,
  MoreVertical,
  History,
  Monitor,
  MapPin,
  Clock,
  Wifi,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { toast } from "sonner";
import { PageHeader, StatCard, Badge as KitBadge, ui } from "@/components/ui-kit";
import { KpiIcon, KpiIcons } from "@/components/kpi-icons";
import { SettingsTabs } from "@/pages/settings/SettingsTabs";

const DESIGNATIONS = ["Owner", "Branch Manager", "Salesman", "Accountant", "Recovery Agent", "HR Officer", "Supplier"];
const DEPARTMENTS = ["Management", "Sales", "Accounts", "Recovery", "HR", "Procurement", "IT"];
const BRANCHES = ["All", "Lahore Main", "Karachi", "Islamabad", "Faisalabad", "Multan"];

type Status = "Active" | "Inactive" | "Blocked" | "Revoked";

type Account = {
  id: string;
  name: string;
  email: string;
  password: string;
  branch: string;
  designation: string;
  department: string;
  status: Status;
  mobile: boolean;
  web: boolean;
};

type Session = {
  id: string;
  platform: "Web" | "Mobile";
  device: string;
  ip: string;
  location: string;
  loginAt: string;
  durationMin: number;
  active?: boolean;
};

const SEED: Account[] = [
  { id: "u1", name: "Ahmed Hassan", email: "ahmed@creditwise.pk", password: "Owner@2026", branch: "All", designation: "Owner", department: "Management", status: "Active", mobile: true, web: true },
  { id: "u2", name: "Sara Khan", email: "sara@creditwise.pk", password: "Sara@1234", branch: "Lahore Main", designation: "Branch Manager", department: "Management", status: "Active", mobile: true, web: true },
  { id: "u3", name: "Bilal Ahmed", email: "bilal@creditwise.pk", password: "Bilal@123", branch: "Karachi", designation: "Salesman", department: "Sales", status: "Active", mobile: true, web: false },
  { id: "u4", name: "Ayesha Tariq", email: "ayesha@creditwise.pk", password: "Ayesha#1", branch: "Lahore Main", designation: "Accountant", department: "Accounts", status: "Blocked", mobile: false, web: true },
  { id: "u5", name: "Usman Ali", email: "usman@creditwise.pk", password: "Usman@99", branch: "Islamabad", designation: "Recovery Agent", department: "Recovery", status: "Active", mobile: true, web: false },
  { id: "u6", name: "Fatima Noor", email: "fatima@creditwise.pk", password: "Fatima@7", branch: "Lahore Main", designation: "HR Officer", department: "HR", status: "Inactive", mobile: false, web: true },
  { id: "u7", name: "Imran Yousaf", email: "imran@creditwise.pk", password: "Imran@5", branch: "Faisalabad", designation: "Supplier", department: "Procurement", status: "Revoked", mobile: false, web: false },
];

const SESSIONS: Record<string, Session[]> = {
  default: [
    { id: "s1", platform: "Mobile", device: "iPhone 15 - iOS 17.4 - CreditWise App", ip: "203.135.10.21", location: "Lahore, PK", loginAt: "2026-05-08 11:42", durationMin: 38, active: true },
    { id: "s2", platform: "Web", device: "Chrome 124 - Windows 11", ip: "203.135.10.21", location: "Lahore, PK", loginAt: "2026-05-08 09:01", durationMin: 142 },
    { id: "s3", platform: "Mobile", device: "Samsung A54 - Android 14 - CreditWise", ip: "192.168.1.18", location: "Lahore, PK", loginAt: "2026-05-07 18:44", durationMin: 22 },
    { id: "s4", platform: "Web", device: "Safari 17 - macOS 14", ip: "39.40.102.55", location: "Karachi, PK", loginAt: "2026-05-07 14:10", durationMin: 95 },
    { id: "s5", platform: "Mobile", device: "iPhone 15 - iOS 17.4 - CreditWise App", ip: "203.135.10.21", location: "Lahore, PK", loginAt: "2026-05-06 21:08", durationMin: 14 },
    { id: "s6", platform: "Web", device: "Chrome 124 - Windows 11", ip: "203.135.10.21", location: "Lahore, PK", loginAt: "2026-05-06 09:25", durationMin: 188 },
  ],
};

const STATUS_STYLES: Record<Status, string> = {
  Active: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
  Inactive: "bg-muted text-muted-foreground border-border",
  Blocked: "bg-amber-500/15 text-amber-700 border-amber-500/30",
  Revoked: "bg-destructive/15 text-destructive border-destructive/30",
};

const DESIGNATION_TONE: Record<string, { dot: string; chip: string }> = {
  Owner: { dot: "bg-primary", chip: "bg-primary-soft text-primary border-primary/30" },
  "Branch Manager": { dot: "bg-info", chip: "bg-info/15 text-info border-info/30" },
  Salesman: { dot: "bg-emerald-500", chip: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30" },
  Accountant: { dot: "bg-violet-500", chip: "bg-violet-500/15 text-violet-700 border-violet-500/30" },
  "Recovery Agent": { dot: "bg-amber-500", chip: "bg-amber-500/15 text-amber-700 border-amber-500/30" },
  "HR Officer": { dot: "bg-pink-500", chip: "bg-pink-500/15 text-pink-700 border-pink-500/30" },
  Supplier: { dot: "bg-slate-500", chip: "bg-slate-500/15 text-slate-700 border-slate-500/30" },
};

function fmtDuration(min: number) {
  if (min < 60) return `${min}m`;
  const hours = Math.floor(min / 60);
  const minutes = min % 60;

  return minutes ? `${hours}h ${minutes}m` : `${hours}h`;
}

function DesignationChip({ value }: { value: string }) {
  const tone = DESIGNATION_TONE[value] ?? {
    dot: "bg-muted-foreground",
    chip: "bg-muted text-foreground border-border",
  };

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2 py-0.5 text-[11px] font-bold whitespace-nowrap ${tone.chip}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${tone.dot}`} />
      {value}
    </span>
  );
}

function LoginLogsModal({ account, onClose }: { account: Account | null; onClose: () => void }) {
  const sessions = useMemo(() => (account ? (SESSIONS[account.id] ?? SESSIONS.default) : []), [account]);
  const totals = useMemo(() => {
    const metrics = { Web: 0, Mobile: 0 };
    sessions.forEach((session) => {
      metrics[session.platform] += session.durationMin;
    });

    return metrics;
  }, [sessions]);

  return (
    <Dialog open={!!account} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            Login activity {account ? `- ${account.name}` : ""}
          </DialogTitle>
          <DialogDescription>Recent web and mobile sessions, devices and durations.</DialogDescription>
        </DialogHeader>

        <div className="mb-4 grid grid-cols-2 gap-3">
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary-soft text-primary">
              <Smartphone className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Mobile time</div>
              <div className="text-base font-bold tabular-nums">{fmtDuration(totals.Mobile)}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 rounded-lg border border-border bg-card p-3">
            <div className="grid h-10 w-10 place-items-center rounded-lg bg-info/15 text-info">
              <Globe className="h-5 w-5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground">Web time</div>
              <div className="text-base font-bold tabular-nums">{fmtDuration(totals.Web)}</div>
            </div>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className={ui.tableHeadRow}>
              <tr>
                <th className="px-3 py-2.5 text-left font-semibold">Platform</th>
                <th className="px-3 py-2.5 text-left font-semibold">Device</th>
                <th className="px-3 py-2.5 text-left font-semibold"><MapPin className="mr-1 inline h-3 w-3" />Location</th>
                <th className="px-3 py-2.5 text-left font-semibold"><Wifi className="mr-1 inline h-3 w-3" />IP</th>
                <th className="px-3 py-2.5 text-left font-semibold"><Clock className="mr-1 inline h-3 w-3" />Login</th>
                <th className="px-3 py-2.5 text-left font-semibold">Duration</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {sessions.map((session) => (
                <tr key={session.id} className="hover:bg-muted/30">
                  <td className="px-3 py-2.5">
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-[11px] font-bold ${
                        session.platform === "Mobile"
                          ? "bg-primary-soft text-primary border-primary/30"
                          : "bg-info/15 text-info border-info/30"
                      }`}
                    >
                      {session.platform === "Mobile" ? <Smartphone className="h-3 w-3" /> : <Monitor className="h-3 w-3" />}
                      {session.platform}
                    </span>
                  </td>
                  <td className="px-3 py-2.5 text-[12.5px] font-medium text-foreground">{session.device}</td>
                  <td className="px-3 py-2.5 text-[12.5px] text-muted-foreground">{session.location}</td>
                  <td className="px-3 py-2.5 font-mono text-[11.5px] text-muted-foreground">{session.ip}</td>
                  <td className="px-3 py-2.5 whitespace-nowrap font-mono text-[11.5px]">{session.loginAt}</td>
                  <td className="px-3 py-2.5 text-[12.5px] font-semibold tabular-nums">
                    {fmtDuration(session.durationMin)}
                    {session.active ? (
                      <span className="ml-2 inline-flex items-center gap-1 rounded border border-emerald-500/30 bg-emerald-500/15 px-1.5 py-0.5 text-[10px] font-bold text-emerald-700">
                        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-emerald-500" />
                        Active
                      </span>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Close</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

export function UserAccessPage() {
  const [accounts, setAccounts] = useState<Account[]>(SEED);
  const [search, setSearch] = useState("");
  const [showPw, setShowPw] = useState<Record<string, boolean>>({});
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Account | null>(null);
  const [logsFor, setLogsFor] = useState<Account | null>(null);

  const blank: Omit<Account, "id"> = {
    name: "",
    email: "",
    password: "",
    branch: BRANCHES[0],
    designation: DESIGNATIONS[0],
    department: DEPARTMENTS[0],
    status: "Active",
    mobile: true,
    web: true,
  };

  const [form, setForm] = useState<Omit<Account, "id">>(blank);

  const filtered = accounts.filter((account) =>
    [account.name, account.email, account.branch, account.designation, account.department].some((value) =>
      value.toLowerCase().includes(search.toLowerCase()),
    ),
  );

  const counts = {
    total: accounts.length,
    active: accounts.filter((account) => account.status === "Active").length,
    blocked: accounts.filter((account) => account.status === "Blocked").length,
    revoked: accounts.filter((account) => account.status === "Revoked").length,
  };

  const setStatus = (id: string, status: Status) => {
    setAccounts((current) => current.map((account) => (account.id === id ? { ...account, status } : account)));
    toast.success(`Account ${status.toLowerCase()}`);
  };

  const togglePlatform = (id: string, key: "mobile" | "web") => {
    setAccounts((current) =>
      current.map((account) => (account.id === id ? { ...account, [key]: !account[key] } : account)),
    );
  };

  const openNew = () => {
    setEditing(null);
    setForm(blank);
    setOpen(true);
  };

  const openEdit = (account: Account) => {
    setEditing(account);
    setForm({
      name: account.name,
      email: account.email,
      password: account.password,
      branch: account.branch,
      designation: account.designation,
      department: account.department,
      status: account.status,
      mobile: account.mobile,
      web: account.web,
    });
    setOpen(true);
  };

  const save = () => {
    if (!form.name || !form.email || !form.password) {
      toast.error("Name, email and password required");
      return;
    }

    if (editing) {
      setAccounts((current) => current.map((account) => (account.id === editing.id ? { ...editing, ...form } : account)));
      toast.success("Account updated");
    } else {
      setAccounts((current) => [{ id: `u${Date.now()}`, ...form }, ...current]);
      toast.success("Account created");
    }

    setOpen(false);
  };

  return (
    <>
      <PageHeader
        title="User Accounts"
        description="Manage user logins, designation, department and platform access."
        icon={<ShieldCheck />}
        actions={
          <Button onClick={openNew} className="h-10 gap-2">
            <Plus className="h-4 w-4" />
            New Account
          </Button>
        }
      />
      <SettingsTabs initial="users" />

      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total Accounts" value={counts.total} icon={<KpiIcon icon={UsersIcon} />} tone="primary" hint="All roles and branches" />
        <StatCard label="Active" value={counts.active} icon={<KpiIcons.success />} tone="success" />
        <StatCard label="Blocked" value={counts.blocked} icon={<KpiIcon icon={Ban} />} tone="warning" />
        <StatCard label="Revoked" value={counts.revoked} icon={<KpiIcon icon={UserX} />} tone="destructive" />
      </div>

      <div className="overflow-hidden rounded-lg bg-card shadow-[0_4px_16px_-6px_rgba(16,24,40,0.12),0_2px_4px_-2px_rgba(16,24,40,0.06)]">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-5 py-4">
          <h3 className="font-semibold">All Accounts</h3>
          <div className="flex items-center gap-3">
            <div className="relative">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search name, email, branch..."
                className="h-9 w-72 pl-9"
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>
            <KitBadge tone="muted">{filtered.length} accounts</KitBadge>
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className={ui.tableHeadRow}>
              <tr>
                <th className="w-12 px-4 py-4 text-left">SR#</th>
                <th className="px-2 py-4 text-left">Name</th>
                <th className="px-2 py-4 text-left"><Mail className="mr-1 inline h-3.5 w-3.5" />Email</th>
                <th className="px-2 py-4 text-left"><KeyRound className="mr-1 inline h-3.5 w-3.5" />Password</th>
                <th className="px-2 py-4 text-left">Branch</th>
                <th className="px-2 py-4 text-left">Designation</th>
                <th className="px-2 py-4 text-left">Department</th>
                <th className="px-2 py-4 text-center"><Globe className="mr-1 inline h-3.5 w-3.5" />Web</th>
                <th className="px-2 py-4 text-center"><Smartphone className="mr-1 inline h-3.5 w-3.5" />Mobile</th>
                <th className="px-2 py-4 text-center">Status</th>
                <th className="px-4 py-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map((account, index) => (
                <tr key={account.id} className="transition-colors hover:bg-muted/30">
                  <td className="px-4 py-4 font-medium text-muted-foreground">{index + 1}</td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="grid h-8 w-8 place-items-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                        {account.name.split(" ").map((part) => part[0]).slice(0, 2).join("")}
                      </div>
                      <span className="font-semibold">{account.name}</span>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-xs">{account.email}</td>
                  <td className="px-2 py-4">
                    <div className="flex items-center gap-1.5">
                      <code className="rounded bg-muted/60 px-2 py-0.5 font-mono text-xs">
                        {showPw[account.id] ? account.password : "........"}
                      </code>
                      <button
                        type="button"
                        onClick={() => setShowPw((state) => ({ ...state, [account.id]: !state[account.id] }))}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        {showPw[account.id] ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                      </button>
                    </div>
                  </td>
                  <td className="px-2 py-4 text-sm">{account.branch}</td>
                  <td className="px-2 py-4"><DesignationChip value={account.designation} /></td>
                  <td className="px-2 py-4 text-sm text-muted-foreground">{account.department}</td>
                  <td className="px-2 py-4 text-center"><Switch checked={account.web} onCheckedChange={() => togglePlatform(account.id, "web")} /></td>
                  <td className="px-2 py-4 text-center"><Switch checked={account.mobile} onCheckedChange={() => togglePlatform(account.id, "mobile")} /></td>
                  <td className="px-2 py-4 text-center">
                    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10.5px] font-bold ${STATUS_STYLES[account.status]}`}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current opacity-70" />
                      {account.status}
                    </span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
                            <MoreVertical className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-48">
                          <DropdownMenuLabel className="text-xs">Manage</DropdownMenuLabel>
                          <DropdownMenuItem onClick={() => openEdit(account)}>
                            <UserCog className="mr-2 h-3.5 w-3.5" />
                            Edit
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => setLogsFor(account)}>
                            <History className="mr-2 h-3.5 w-3.5" />
                            View Logs
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          {account.status === "Active" ? (
                            <>
                              <DropdownMenuItem className="text-amber-600 focus:text-amber-700" onClick={() => setStatus(account.id, "Blocked")}>
                                <Ban className="mr-2 h-3.5 w-3.5" />
                                Block
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => setStatus(account.id, "Inactive")}>
                                <Power className="mr-2 h-3.5 w-3.5" />
                                Deactivate
                              </DropdownMenuItem>
                            </>
                          ) : (
                            <DropdownMenuItem className="text-emerald-600 focus:text-emerald-700" onClick={() => setStatus(account.id, "Active")}>
                              <Power className="mr-2 h-3.5 w-3.5" />
                              Activate
                            </DropdownMenuItem>
                          )}
                          {account.status !== "Revoked" ? (
                            <DropdownMenuItem className="text-destructive focus:text-destructive" onClick={() => setStatus(account.id, "Revoked")}>
                              <UserX className="mr-2 h-3.5 w-3.5" />
                              Revoke
                            </DropdownMenuItem>
                          ) : (
                            <DropdownMenuItem onClick={() => setStatus(account.id, "Active")}>
                              <RotateCcw className="mr-2 h-3.5 w-3.5" />
                              Restore
                            </DropdownMenuItem>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={11} className="px-4 py-12 text-center text-sm text-muted-foreground">
                    No accounts match your search.
                  </td>
                </tr>
              ) : null}
            </tbody>
          </table>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserCog className="h-5 w-5 text-primary" />
              {editing ? "Edit account" : "New user account"}
            </DialogTitle>
            <DialogDescription>Create or update login credentials and platform access.</DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-2 gap-3">
            <div className="col-span-2 space-y-1.5">
              <Label className="text-xs">Full name</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Email</Label>
              <Input type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Password</Label>
              <Input value={form.password} onChange={(event) => setForm({ ...form, password: event.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Branch</Label>
              <Select value={form.branch} onValueChange={(value) => setForm({ ...form, branch: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{BRANCHES.map((branch) => <SelectItem key={branch} value={branch}>{branch}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Designation</Label>
              <Select value={form.designation} onValueChange={(value) => setForm({ ...form, designation: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DESIGNATIONS.map((designation) => <SelectItem key={designation} value={designation}>{designation}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Department</Label>
              <Select value={form.department} onValueChange={(value) => setForm({ ...form, department: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DEPARTMENTS.map((department) => <SelectItem key={department} value={department}>{department}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Status</Label>
              <Select value={form.status} onValueChange={(value: Status) => setForm({ ...form, status: value })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="Active">Active</SelectItem>
                  <SelectItem value="Inactive">Inactive</SelectItem>
                  <SelectItem value="Blocked">Blocked</SelectItem>
                  <SelectItem value="Revoked">Revoked</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="col-span-2 grid grid-cols-2 gap-3">
              <label className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                <span className="flex items-center gap-2 text-sm font-medium"><Globe className="h-4 w-4 text-muted-foreground" /> Web access</span>
                <Switch checked={form.web} onCheckedChange={(value) => setForm({ ...form, web: value })} />
              </label>
              <label className="flex items-center justify-between rounded-lg border p-3 bg-muted/20">
                <span className="flex items-center gap-2 text-sm font-medium"><Smartphone className="h-4 w-4 text-muted-foreground" /> Mobile access</span>
                <Switch checked={form.mobile} onCheckedChange={(value) => setForm({ ...form, mobile: value })} />
              </label>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Create account"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <LoginLogsModal account={logsFor} onClose={() => setLogsFor(null)} />
    </>
  );
}
