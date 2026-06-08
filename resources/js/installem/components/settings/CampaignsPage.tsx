import { useMemo, useState } from "react";
import { PageHeader, StatCard, Badge as KitBadge, ui } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
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
import { UnderlineTabBar, UnderlineTab } from "@/components/ui/underline-tabs";
import {
  Megaphone,
  Send,
  MessageCircle,
  Smartphone,
  MessageSquare,
  Mail,
  Globe,
  Plus,
  Pencil,
  Trash2,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  Eye,
  Users as UsersIcon,
  MousePointerClick,
  TrendingUp,
  Sparkles,
  Tag,
} from "lucide-react";
import { toast } from "sonner";
import { KpiIcon } from "@/components/kpi-icons";

const CHANNELS = [
  { id: "push", label: "App Push", icon: Smartphone, color: "text-blue-600 bg-blue-500/10 border-blue-500/30", platform: "Mobile App" },
  { id: "inapp", label: "In-App", icon: Sparkles, color: "text-violet-600 bg-violet-500/10 border-violet-500/30", platform: "Web + App" },
  { id: "web", label: "Web Banner", icon: Globe, color: "text-cyan-600 bg-cyan-500/10 border-cyan-500/30", platform: "Website" },
  { id: "whatsapp", label: "WhatsApp", icon: MessageCircle, color: "text-emerald-600 bg-emerald-500/10 border-emerald-500/30", platform: "Direct" },
  { id: "sms", label: "SMS", icon: MessageSquare, color: "text-amber-600 bg-amber-500/10 border-amber-500/30", platform: "Direct" },
  { id: "email", label: "Email", icon: Mail, color: "text-rose-600 bg-rose-500/10 border-rose-500/30", platform: "Direct" },
] as const;

const SEGMENTS = [
  "All Customers",
  "Mobile App Users",
  "Website Visitors",
  "Active Customers",
  "Overdue Installments",
  "VIP Customers",
  "New Signups (30d)",
  "Inactive (60d+)",
];

const CATEGORIES = ["Promotion", "Reminder", "Transactional", "Announcement"] as const;

type ChannelId = (typeof CHANNELS)[number]["id"];
type Category = (typeof CATEGORIES)[number];
type Status = "Draft" | "Scheduled" | "Sent" | "Failed";

type Template = {
  id: string;
  name: string;
  category: Category;
  channels: ChannelId[];
  subject: string;
  body: string;
  updatedAt: string;
};

type Campaign = {
  id: string;
  name: string;
  template: string;
  segment: string;
  channels: ChannelId[];
  scheduledAt: string;
  status: Status;
  recipients: number;
  delivered: number;
  opened: number;
  clicked: number;
};

const SEED_TEMPLATES: Template[] = [
  { id: "t1", name: "Eid Sale Promo", category: "Promotion", channels: ["push", "inapp", "whatsapp"], subject: "Eid Mubarak - 40% Off", body: "Salam {{name}}! Enjoy 40% off this Eid. Tap to shop now.", updatedAt: "2026-04-22" },
  { id: "t2", name: "Installment Due Reminder", category: "Reminder", channels: ["push", "whatsapp", "sms"], subject: "Installment Due", body: "Dear {{name}}, your installment of PKR {{amount}} is due on {{date}}.", updatedAt: "2026-04-15" },
  { id: "t3", name: "Order Delivered", category: "Transactional", channels: ["push", "whatsapp", "email"], subject: "Order #{{orderId}} delivered", body: "Hi {{name}}, your order has been delivered. Thank you!", updatedAt: "2026-03-28" },
  { id: "t4", name: "New Drop Announcement", category: "Announcement", channels: ["push", "inapp", "web"], subject: "New arrivals this week", body: "Fresh stock just landed in {{category}}. Be the first to grab yours.", updatedAt: "2026-04-30" },
  { id: "t5", name: "Cart Abandoned", category: "Promotion", channels: ["push", "email", "whatsapp"], subject: "Still thinking?", body: "{{name}}, your {{product}} is waiting. Get 5% off if you check out today.", updatedAt: "2026-05-02" },
];

const SEED_CAMPAIGNS: Campaign[] = [
  { id: "c1", name: "Eid Promo - May 2026", template: "Eid Sale Promo", segment: "All Customers", channels: ["push", "inapp", "whatsapp"], scheduledAt: "2026-05-10 10:00", status: "Sent", recipients: 4820, delivered: 4790, opened: 2154, clicked: 612 },
  { id: "c2", name: "May Installment Reminders", template: "Installment Due Reminder", segment: "Overdue Installments", channels: ["push", "whatsapp", "sms"], scheduledAt: "2026-05-08 09:00", status: "Scheduled", recipients: 318, delivered: 0, opened: 0, clicked: 0 },
  { id: "c3", name: "iPhone 16 Drop", template: "New Drop Announcement", segment: "Mobile App Users", channels: ["push", "inapp"], scheduledAt: "2026-05-09 18:00", status: "Sent", recipients: 2640, delivered: 2630, opened: 1820, clicked: 540 },
  { id: "c4", name: "Cart Recovery - Apparel", template: "Cart Abandoned", segment: "Active Customers", channels: ["push", "email"], scheduledAt: "2026-05-07 14:00", status: "Sent", recipients: 412, delivered: 410, opened: 198, clicked: 84 },
  { id: "c5", name: "Welcome Series Day 1", template: "New Drop Announcement", segment: "New Signups (30d)", channels: ["push", "email"], scheduledAt: "2026-05-06 11:00", status: "Sent", recipients: 156, delivered: 156, opened: 98, clicked: 32 },
];

function ChannelChip({ id }: { id: ChannelId }) {
  const channel = CHANNELS.find((item) => item.id === id);
  if (!channel) return null;
  const Icon = channel.icon;

  return (
    <span className={`inline-flex items-center gap-1 rounded-md border px-2 py-0.5 text-[10px] font-semibold ${channel.color}`}>
      <Icon className="h-3 w-3" />
      {channel.label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  const tone: Record<Status, string> = {
    Draft: "bg-muted text-muted-foreground border-border",
    Scheduled: "bg-blue-500/15 text-blue-700 border-blue-500/30",
    Sent: "bg-emerald-500/15 text-emerald-700 border-emerald-500/30",
    Failed: "bg-destructive/15 text-destructive border-destructive/30",
  };
  const Icon = status === "Sent" ? CheckCircle2 : status === "Scheduled" ? Clock : status === "Failed" ? AlertCircle : FileText;

  return (
    <Badge className={`gap-1 border text-[10px] ${tone[status]}`}>
      <Icon className="h-3 w-3" />
      {status}
    </Badge>
  );
}

export function CampaignsPage() {
  const [templates, setTemplates] = useState<Template[]>(SEED_TEMPLATES);
  const [campaigns, setCampaigns] = useState<Campaign[]>(SEED_CAMPAIGNS);
  const [tab, setTab] = useState<"campaigns" | "templates" | "channels">("campaigns");
  const [open, setOpen] = useState(false);
  const [tplOpen, setTplOpen] = useState(false);
  const [tplEdit, setTplEdit] = useState<Template | null>(null);
  const [form, setForm] = useState({
    name: "",
    segment: SEGMENTS[0],
    templateId: "",
    channels: [] as ChannelId[],
    schedule: "now",
    scheduledAt: "",
  });
  const [tplForm, setTplForm] = useState<Omit<Template, "id" | "updatedAt">>({
    name: "",
    category: "Promotion",
    channels: [],
    subject: "",
    body: "",
  });

  const kpis = useMemo(() => {
    const sent = campaigns.filter((campaign) => campaign.status === "Sent");
    const scheduled = campaigns.filter((campaign) => campaign.status === "Scheduled").length;
    const recipients = sent.reduce((sum, campaign) => sum + campaign.recipients, 0);
    const delivered = sent.reduce((sum, campaign) => sum + campaign.delivered, 0);
    const opened = sent.reduce((sum, campaign) => sum + campaign.opened, 0);
    const clicked = sent.reduce((sum, campaign) => sum + campaign.clicked, 0);
    const openRate = delivered ? Math.round((opened / delivered) * 100) : 0;
    const ctr = opened ? Math.round((clicked / opened) * 100) : 0;

    return { sent: sent.length, scheduled, recipients, delivered, opened, clicked, openRate, ctr };
  }, [campaigns]);

  const toggleChannel = (id: ChannelId) =>
    setForm((current) => ({
      ...current,
      channels: current.channels.includes(id) ? current.channels.filter((channel) => channel !== id) : [...current.channels, id],
    }));

  const toggleTplChannel = (id: ChannelId) =>
    setTplForm((current) => ({
      ...current,
      channels: current.channels.includes(id) ? current.channels.filter((channel) => channel !== id) : [...current.channels, id],
    }));

  const sendCampaign = () => {
    if (!form.name || !form.templateId || form.channels.length === 0) {
      toast.error("Name, template and at least one channel required");
      return;
    }

    const template = templates.find((item) => item.id === form.templateId);
    if (!template) return;

    const isNow = form.schedule === "now";
    setCampaigns((current) => [
      {
        id: `c${Date.now()}`,
        name: form.name,
        template: template.name,
        segment: form.segment,
        channels: form.channels,
        scheduledAt: isNow ? new Date().toISOString().slice(0, 16).replace("T", " ") : form.scheduledAt,
        status: isNow ? "Sent" : "Scheduled",
        recipients: Math.floor(Math.random() * 5000) + 50,
        delivered: isNow ? Math.floor(Math.random() * 5000) : 0,
        opened: 0,
        clicked: 0,
      },
      ...current,
    ]);
    toast.success(isNow ? "Campaign sent to customers" : "Campaign scheduled");
    setOpen(false);
    setForm({ name: "", segment: SEGMENTS[0], templateId: "", channels: [], schedule: "now", scheduledAt: "" });
  };

  const openNewTpl = () => {
    setTplEdit(null);
    setTplForm({ name: "", category: "Promotion", channels: [], subject: "", body: "" });
    setTplOpen(true);
  };

  const openEditTpl = (template: Template) => {
    setTplEdit(template);
    setTplForm({
      name: template.name,
      category: template.category,
      channels: template.channels,
      subject: template.subject,
      body: template.body,
    });
    setTplOpen(true);
  };

  const saveTpl = () => {
    if (!tplForm.name || !tplForm.body) {
      toast.error("Name and body required");
      return;
    }

    if (tplEdit) {
      setTemplates((current) =>
        current.map((template) =>
          template.id === tplEdit.id ? { ...tplEdit, ...tplForm, updatedAt: new Date().toISOString().slice(0, 10) } : template,
        ),
      );
      toast.success("Template updated");
    } else {
      setTemplates((current) => [
        { id: `t${Date.now()}`, updatedAt: new Date().toISOString().slice(0, 10), ...tplForm },
        ...current,
      ]);
      toast.success("Template created");
    }

    setTplOpen(false);
  };

  const removeTpl = (id: string) => {
    setTemplates((current) => current.filter((template) => template.id !== id));
    toast.success("Template removed");
  };

  return (
    <>
      <PageHeader
        title="Customer Campaigns"
        description="Reach your web and mobile app customers across Push, In-App, Web, WhatsApp, SMS and Email."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2" onClick={openNewTpl}>
              <FileText className="h-4 w-4" />
              New Template
            </Button>
            <Button size="sm" className="gap-2" onClick={() => setOpen(true)}>
              <Megaphone className="h-4 w-4" />
              New Campaign
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-8">
        <StatCard label="Templates" value={templates.length} hint="Reusable messages" icon={<KpiIcon icon={FileText} />} tone="primary" />
        <StatCard label="Campaigns" value={campaigns.length} hint={`${kpis.sent} sent, ${kpis.scheduled} scheduled`} icon={<KpiIcon icon={Megaphone} />} tone="primary" />
        <StatCard label="Recipients" value={kpis.recipients.toLocaleString()} hint="Total reached" icon={<KpiIcon icon={UsersIcon} />} tone="primary" />
        <StatCard label="Delivered" value={kpis.delivered.toLocaleString()} hint={`${kpis.recipients ? Math.round((kpis.delivered / kpis.recipients) * 100) : 0}% delivery rate`} icon={<KpiIcon icon={Send} />} tone="success" />
        <StatCard label="Opened" value={kpis.opened.toLocaleString()} hint={`${kpis.openRate}% open rate`} icon={<KpiIcon icon={Eye} />} tone="success" />
        <StatCard label="Clicked" value={kpis.clicked.toLocaleString()} hint={`${kpis.ctr}% click-through`} icon={<KpiIcon icon={MousePointerClick} />} tone="warning" />
        <StatCard label="Scheduled" value={kpis.scheduled} hint="Upcoming sends" icon={<KpiIcon icon={Clock} />} tone="warning" />
        <StatCard label="Channels" value={CHANNELS.length} hint="Active across customer apps" icon={<KpiIcon icon={TrendingUp} />} tone="primary" />
      </div>

      <UnderlineTabBar className="mb-4">
        <UnderlineTab active={tab === "campaigns"} onClick={() => setTab("campaigns")}><span className="inline-flex items-center gap-1.5"><Megaphone className="h-3.5 w-3.5" /> Campaigns <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px]">{campaigns.length}</span></span></UnderlineTab>
        <UnderlineTab active={tab === "templates"} onClick={() => setTab("templates")}><span className="inline-flex items-center gap-1.5"><FileText className="h-3.5 w-3.5" /> Templates <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px]">{templates.length}</span></span></UnderlineTab>
        <UnderlineTab active={tab === "channels"} onClick={() => setTab("channels")}><span className="inline-flex items-center gap-1.5"><Sparkles className="h-3.5 w-3.5" /> Channels <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px]">{CHANNELS.length}</span></span></UnderlineTab>
      </UnderlineTabBar>

      {tab === "campaigns" ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-[13px] font-semibold">All Campaigns</h3>
            <KitBadge tone="muted">{campaigns.length} total</KitBadge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className={ui.tableHeadRow}>
                <tr>
                  <th className={ui.tableHeadCell}>Campaign</th>
                  <th className={ui.tableHeadCell}>Segment</th>
                  <th className={ui.tableHeadCell}>Channels</th>
                  <th className={ui.tableHeadCell}>Schedule</th>
                  <th className={`${ui.tableHeadCell} !text-right`}>Recipients</th>
                  <th className={`${ui.tableHeadCell} !text-right`}>Delivered</th>
                  <th className={`${ui.tableHeadCell} !text-right`}>Opens</th>
                  <th className={`${ui.tableHeadCell} !text-right`}>Clicks</th>
                  <th className={`${ui.tableHeadCell} !text-center`}>Status</th>
                  <th className={`${ui.tableHeadCell} !text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {campaigns.map((campaign) => {
                  const openRate = campaign.delivered ? Math.round((campaign.opened / campaign.delivered) * 100) : 0;
                  const ctr = campaign.opened ? Math.round((campaign.clicked / campaign.opened) * 100) : 0;

                  return (
                    <tr key={campaign.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2.5">
                        <div className="font-semibold">{campaign.name}</div>
                        <div className="text-[11px] text-muted-foreground">{campaign.template}</div>
                      </td>
                      <td className="px-3 py-2.5"><Badge variant="outline" className="gap-1"><UsersIcon className="h-3 w-3" />{campaign.segment}</Badge></td>
                      <td className="px-3 py-2.5"><div className="flex flex-wrap gap-1">{campaign.channels.map((channel) => <ChannelChip key={channel} id={channel} />)}</div></td>
                      <td className="px-3 py-2.5 text-[11px] text-muted-foreground"><Clock className="mr-1 inline h-3 w-3" />{campaign.scheduledAt}</td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{campaign.recipients.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{campaign.delivered.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{campaign.opened.toLocaleString()}{campaign.delivered > 0 ? <div className="text-[10px] font-medium text-emerald-600">{openRate}%</div> : null}</td>
                      <td className="px-3 py-2.5 text-right tabular-nums">{campaign.clicked.toLocaleString()}{campaign.opened > 0 ? <div className="text-[10px] font-medium text-amber-600">{ctr}%</div> : null}</td>
                      <td className="px-3 py-2.5 text-center"><StatusBadge status={campaign.status} /></td>
                      <td className="px-3 py-2.5">
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="sm" onClick={() => toast.info(`Opened ${campaign.name}`)}><Eye className="h-3.5 w-3.5" /></Button>
                          <Button variant="ghost" size="sm" className="text-destructive" onClick={() => { setCampaigns((current) => current.filter((item) => item.id !== campaign.id)); toast.success("Campaign removed"); }}>
                            <Trash2 className="h-3.5 w-3.5" />
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

      {tab === "templates" ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-[13px] font-semibold">Message Templates</h3>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={openNewTpl}>
              <Plus className="h-3.5 w-3.5" />
              New Template
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className={ui.tableHeadRow}>
                <tr>
                  <th className={ui.tableHeadCell}>Name</th>
                  <th className={ui.tableHeadCell}>Category</th>
                  <th className={ui.tableHeadCell}>Channels</th>
                  <th className={ui.tableHeadCell}>Preview</th>
                  <th className={ui.tableHeadCell}>Updated</th>
                  <th className={`${ui.tableHeadCell} !text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((template) => (
                  <tr key={template.id} className="border-t border-border hover:bg-muted/30">
                    <td className="px-3 py-2.5 font-semibold">{template.name}</td>
                    <td className="px-3 py-2.5"><Badge variant="outline" className="gap-1"><Tag className="h-3 w-3" />{template.category}</Badge></td>
                    <td className="px-3 py-2.5"><div className="flex flex-wrap gap-1">{template.channels.map((channel) => <ChannelChip key={channel} id={channel} />)}</div></td>
                    <td className="max-w-md truncate px-3 py-2.5 text-[11px] text-muted-foreground">{template.body}</td>
                    <td className="px-3 py-2.5 text-[11px] text-muted-foreground">{template.updatedAt}</td>
                    <td className="px-3 py-2.5">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => openEditTpl(template)}><Pencil className="h-3.5 w-3.5" /></Button>
                        <Button variant="ghost" size="sm" className="text-destructive" onClick={() => removeTpl(template.id)}><Trash2 className="h-3.5 w-3.5" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "channels" ? (
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {CHANNELS.map((channel) => {
            const Icon = channel.icon;
            const used = campaigns.filter((campaign) => campaign.channels.includes(channel.id)).length;

            return (
              <Card key={channel.id} className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`grid h-10 w-10 place-items-center rounded-lg border ${channel.color}`}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{channel.label}</div>
                      <div className="text-[11px] text-muted-foreground">{channel.platform}</div>
                    </div>
                  </div>
                  <Badge variant="outline" className="text-[10px]">{used} campaigns</Badge>
                </div>
                <p className="mt-3 text-[11px] text-muted-foreground">
                  Reach customers via {channel.label.toLowerCase()} for {channel.platform.toLowerCase()}.
                </p>
              </Card>
            );
          })}
        </div>
      ) : null}

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><Megaphone className="h-5 w-5 text-primary" /> New Customer Campaign</DialogTitle>
            <DialogDescription>Send a message to your web or mobile app customers.</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs">Campaign name</Label>
              <Input value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} placeholder="e.g. Eid Promo May" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Segment</Label>
                <Select value={form.segment} onValueChange={(value) => setForm({ ...form, segment: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SEGMENTS.map((segment) => <SelectItem key={segment} value={segment}>{segment}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Template</Label>
                <Select value={form.templateId} onValueChange={(value) => setForm({ ...form, templateId: value })}>
                  <SelectTrigger><SelectValue placeholder="Pick template" /></SelectTrigger>
                  <SelectContent>{templates.map((template) => <SelectItem key={template.id} value={template.id}>{template.name}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Channels</Label>
              <div className="flex flex-wrap gap-1.5">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  const active = form.channels.includes(channel.id);

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => toggleChannel(channel.id)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition ${
                        active ? channel.color : "border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {channel.label}
                    </button>
                  );
                })}
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Send</Label>
                <Select value={form.schedule} onValueChange={(value) => setForm({ ...form, schedule: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="now">Send now</SelectItem>
                    <SelectItem value="later">Schedule</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {form.schedule === "later" ? (
                <div>
                  <Label className="text-xs">Scheduled at</Label>
                  <Input type="datetime-local" value={form.scheduledAt} onChange={(event) => setForm({ ...form, scheduledAt: event.target.value })} />
                </div>
              ) : null}
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={sendCampaign} className="gap-1.5"><Send className="h-3.5 w-3.5" /> {form.schedule === "now" ? "Send" : "Schedule"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={tplOpen} onOpenChange={setTplOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2"><FileText className="h-5 w-5 text-primary" /> {tplEdit ? "Edit Template" : "New Template"}</DialogTitle>
            <DialogDescription>Variables: {"{{name}}, {{amount}}, {{date}}, {{orderId}}, {{product}}"}</DialogDescription>
          </DialogHeader>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={tplForm.name} onChange={(event) => setTplForm({ ...tplForm, name: event.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Category</Label>
                <Select value={tplForm.category} onValueChange={(value) => setTplForm({ ...tplForm, category: value as Category })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{CATEGORIES.map((category) => <SelectItem key={category} value={category}>{category}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Subject / Title</Label>
              <Input value={tplForm.subject} onChange={(event) => setTplForm({ ...tplForm, subject: event.target.value })} />
            </div>
            <div>
              <Label className="text-xs">Body</Label>
              <Textarea rows={4} value={tplForm.body} onChange={(event) => setTplForm({ ...tplForm, body: event.target.value })} />
            </div>
            <div>
              <Label className="mb-1.5 block text-xs">Channels</Label>
              <div className="flex flex-wrap gap-1.5">
                {CHANNELS.map((channel) => {
                  const Icon = channel.icon;
                  const active = tplForm.channels.includes(channel.id);

                  return (
                    <button
                      key={channel.id}
                      type="button"
                      onClick={() => toggleTplChannel(channel.id)}
                      className={`inline-flex items-center gap-1 rounded-md border px-2.5 py-1 text-[11px] font-semibold transition ${
                        active ? channel.color : "border-border bg-muted/40 text-muted-foreground"
                      }`}
                    >
                      <Icon className="h-3 w-3" />
                      {channel.label}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTplOpen(false)}>Cancel</Button>
            <Button onClick={saveTpl}>Save</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
