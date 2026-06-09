import { useEffect, useMemo, useRef, useState } from "react";
import {
  Building2, Receipt, Bell, Wallet, Briefcase, Hash, Mail, MessageSquare, Printer,
  CreditCard, Globe, Shield, Save, Percent, Database, Languages, Search, ChevronLeft, ChevronRight, UserCircle2,
} from "lucide-react";
import { PageHeader } from "@/components/ui-kit";
import { useToast } from "@/components/Toaster";
import { useEntityStore } from "@/lib/state/useEntityStore";
import { UnderlineTab } from "@/components/ui/underline-tabs";
import { SettingsTabs } from "@/pages/system/settings/SettingsTabs";

type FieldDef = { key: string; label: string; type: "text" | "number" | "select" | "switch" | "textarea"; options?: string[]; placeholder?: string; suffix?: string; help?: string };
type Section = { id: string; title: string; description: string; icon: any; fields: FieldDef[] };

const SECTIONS: Section[] = [
  { id: "profile", title: "Profile", description: "Your personal account information shown across the app.", icon: UserCircle2, fields: [
    { key: "profileName", label: "Full Name", type: "text", placeholder: "Ahmed Raza" }, { key: "profileDesignation", label: "Designation", type: "text", placeholder: "Tenant Owner" },
    { key: "profileEmail", label: "Email", type: "text", placeholder: "you@creditwise.pk" }, { key: "profilePhone", label: "Phone", type: "text", placeholder: "+92 300 ..." },
    { key: "profileLanguage", label: "Preferred Language", type: "select", options: ["English", "Urdu", "Bilingual"] }, { key: "profileTimezone", label: "Timezone", type: "select", options: ["Asia/Karachi", "Asia/Dubai", "UTC"] },
    { key: "profileBio", label: "Short Bio", type: "textarea", placeholder: "A few words about you" }, { key: "profileNotifyEmail", label: "Email Notifications", type: "switch" }, { key: "profileNotifySms", label: "SMS Notifications", type: "switch" },
  ]},
  { id: "company", title: "Company Profile", description: "Business identity used on invoices and reports.", icon: Building2, fields: [
    { key: "companyName", label: "Company Name", type: "text", placeholder: "CreditWise (Pvt) Ltd" }, { key: "ntn", label: "NTN", type: "text", placeholder: "0000000-0" },
    { key: "strn", label: "STRN", type: "text", placeholder: "00-00-0000-000-00" }, { key: "phone", label: "Business Phone", type: "text", placeholder: "+92 42 ..." },
    { key: "email", label: "Business Email", type: "text", placeholder: "info@company.pk" }, { key: "website", label: "Website", type: "text", placeholder: "https://" },
    { key: "address", label: "Head Office Address", type: "textarea" }, { key: "fiscalStart", label: "Fiscal Year Start", type: "select", options: ["01-Jan", "01-Apr", "01-Jul", "01-Oct"] },
  ]},
  { id: "invoice", title: "Invoice Settings", description: "Numbering, layout and content of customer invoices.", icon: Receipt, fields: [
    { key: "invoicePrefix", label: "Invoice Prefix", type: "text", placeholder: "INV-" }, { key: "invoiceNextNumber", label: "Next Invoice #", type: "number" },
    { key: "showLogoOnInvoice", label: "Show Company Logo", type: "switch" }, { key: "showSignature", label: "Print Signature Block", type: "switch" }, { key: "showCustomerCnic", label: "Show Customer CNIC", type: "switch" },
    { key: "termsFooter", label: "Terms & Conditions Footer", type: "textarea" }, { key: "invoiceLanguage", label: "Invoice Language", type: "select", options: ["English", "Urdu", "Bilingual"] },
  ]},
  { id: "tax", title: "Tax & Currency", description: "Default rates and currency formatting.", icon: Percent, fields: [
    { key: "currency", label: "Base Currency", type: "select", options: ["PKR (Rs.)", "USD ($)", "AED"] }, { key: "gstRate", label: "GST / Sales Tax", type: "number", suffix: "%" },
    { key: "withholding", label: "Withholding Tax (Non-filer)", type: "number", suffix: "%" }, { key: "fedRate", label: "Federal Excise Duty", type: "number", suffix: "%" }, { key: "roundingMode", label: "Rounding", type: "select", options: ["Nearest", "Up", "Down", "None"] },
  ]},
  { id: "numbering", title: "Document Numbering", description: "Prefixes for orders, payments and vouchers.", icon: Hash, fields: [
    { key: "poPrefix", label: "Purchase Order Prefix", type: "text", placeholder: "PO-" }, { key: "grnPrefix", label: "GRN Prefix", type: "text", placeholder: "GRN-" }, { key: "receiptPrefix", label: "Receipt Prefix", type: "text", placeholder: "RCP-" },
    { key: "voucherPrefix", label: "Voucher Prefix", type: "text", placeholder: "VCH-" }, { key: "padding", label: "Number Padding", type: "select", options: ["3 digits", "4 digits", "5 digits", "6 digits"] },
  ]},
  { id: "hr", title: "HR Module", description: "Defaults for attendance, payroll and leaves.", icon: Briefcase, fields: [
    { key: "weekOff", label: "Weekly Off Day", type: "select", options: ["Friday", "Saturday", "Sunday"] }, { key: "shiftStart", label: "Default Shift Start", type: "text", placeholder: "10:00 AM" }, { key: "shiftEnd", label: "Default Shift End", type: "text", placeholder: "07:00 PM" },
    { key: "graceMinutes", label: "Late Grace Minutes", type: "number", suffix: "min" }, { key: "casualLeaves", label: "Annual Casual Leaves", type: "number" }, { key: "sickLeaves", label: "Annual Sick Leaves", type: "number" },
    { key: "annualLeaves", label: "Annual Earned Leaves", type: "number" }, { key: "payrollCycle", label: "Payroll Cycle", type: "select", options: ["Monthly", "Bi-Monthly", "Weekly"] }, { key: "salaryCutoffDay", label: "Salary Cutoff Day", type: "number" },
    { key: "epf", label: "EPF Contribution", type: "number", suffix: "%" }, { key: "eobi", label: "EOBI Deduction", type: "number", suffix: "%" },
  ]},
  { id: "notifications", title: "Notifications & Limits", description: "Channels, quotas and quiet hours.", icon: Bell, fields: [
    { key: "smsEnabled", label: "SMS Enabled", type: "switch" }, { key: "whatsappEnabled", label: "WhatsApp Enabled", type: "switch" }, { key: "emailEnabled", label: "Email Enabled", type: "switch" },
    { key: "smsDailyLimit", label: "SMS Daily Limit", type: "number" }, { key: "whatsappDailyLimit", label: "WhatsApp Daily Limit", type: "number" }, { key: "emailDailyLimit", label: "Email Daily Limit", type: "number" },
    { key: "quietStart", label: "Quiet Hours Start", type: "text", placeholder: "10:00 PM" }, { key: "quietEnd", label: "Quiet Hours End", type: "text", placeholder: "08:00 AM" }, { key: "reminderDaysBefore", label: "Installment Reminder (Days Before)", type: "number" }, { key: "overdueReminderDaysAfter", label: "Overdue Reminder (Days After)", type: "number" },
  ]},
  { id: "expenses", title: "Expenses & Approvals", description: "Approval thresholds and category limits.", icon: Wallet, fields: [
    { key: "expenseAutoApproveLimit", label: "Auto-Approve Below (Rs.)", type: "number" }, { key: "expenseManagerLimit", label: "Manager Approval Limit (Rs.)", type: "number" }, { key: "expenseDirectorLimit", label: "Director Approval Limit (Rs.)", type: "number" },
    { key: "petty", label: "Petty Cash Float (Rs.)", type: "number" }, { key: "requireBills", label: "Require Bill Attachment", type: "switch" }, { key: "blockOverBudget", label: "Block Over-Budget Categories", type: "switch" },
  ]},
  { id: "payments", title: "Payments & Wallets", description: "Cash drawer rules and wallet integrations.", icon: CreditCard, fields: [
    { key: "allowPartialPayments", label: "Allow Partial Payments", type: "switch" }, { key: "cashDrawerLimit", label: "Cash Drawer Limit (Rs.)", type: "number" }, { key: "chequeClearanceDays", label: "Default Cheque Clearance Days", type: "number" },
    { key: "lateFeePerDay", label: "Late Fee per Day (Rs.)", type: "number" }, { key: "graceDays", label: "Installment Grace Days", type: "number" }, { key: "jazzcashEnabled", label: "JazzCash Enabled", type: "switch" }, { key: "easypaisaEnabled", label: "EasyPaisa Enabled", type: "switch" },
  ]},
  { id: "print", title: "Printing & Templates", description: "Receipt printer and stationery defaults.", icon: Printer, fields: [
    { key: "printSize", label: "Default Print Size", type: "select", options: ["A4", "A5", "Letter", "Thermal 80mm", "Thermal 58mm"] }, { key: "printCopies", label: "Number of Copies", type: "number" }, { key: "footerNote", label: "Receipt Footer Note", type: "textarea" },
  ]},
  { id: "email", title: "Email (SMTP)", description: "Outgoing mail server credentials.", icon: Mail, fields: [
    { key: "smtpHost", label: "SMTP Host", type: "text" }, { key: "smtpPort", label: "SMTP Port", type: "number" }, { key: "smtpUser", label: "SMTP Username", type: "text" }, { key: "smtpPass", label: "SMTP Password", type: "text", placeholder: "********" }, { key: "fromName", label: "From Name", type: "text" }, { key: "fromEmail", label: "From Email", type: "text" },
  ]},
  { id: "sms", title: "SMS Gateway", description: "Provider mask, sender ID and credentials.", icon: MessageSquare, fields: [
    { key: "smsProvider", label: "Provider", type: "select", options: ["Branded SMS PK", "Twilio", "Jazz", "Custom HTTP"] }, { key: "smsMask", label: "Sender Mask", type: "text", placeholder: "QISTIFY" }, { key: "smsApiKey", label: "API Key", type: "text", placeholder: "********" }, { key: "smsCallback", label: "Delivery Callback URL", type: "text" },
  ]},
  { id: "security", title: "Security & Sessions", description: "Login policy and session lifetime.", icon: Shield, fields: [
    { key: "passwordMinLen", label: "Minimum Password Length", type: "number" }, { key: "requireMfa", label: "Require Two-Factor (MFA)", type: "switch" }, { key: "sessionMinutes", label: "Session Timeout (minutes)", type: "number" }, { key: "lockoutAttempts", label: "Lockout After Failed Attempts", type: "number" }, { key: "auditRetentionDays", label: "Audit Log Retention (days)", type: "number" },
  ]},
  { id: "backups", title: "Backups & Data", description: "Automatic backups and export schedule.", icon: Database, fields: [
    { key: "backupFrequency", label: "Backup Frequency", type: "select", options: ["Daily", "Weekly", "Monthly"] }, { key: "backupTime", label: "Backup Time", type: "text", placeholder: "02:00 AM" }, { key: "retentionWeeks", label: "Retention (weeks)", type: "number" }, { key: "exportEnabled", label: "Allow Data Export", type: "switch" },
  ]},
  { id: "locale", title: "Locale & Date Format", description: "Language, timezone and date display.", icon: Languages, fields: [
    { key: "language", label: "App Language", type: "select", options: ["English", "Urdu", "Bilingual"] }, { key: "timezone", label: "Timezone", type: "select", options: ["Asia/Karachi", "Asia/Dubai", "UTC"] }, { key: "dateFormat", label: "Date Format", type: "select", options: ["DD-MM-YYYY", "MM-DD-YYYY", "YYYY-MM-DD"] }, { key: "weekStart", label: "Week Starts On", type: "select", options: ["Monday", "Sunday", "Saturday"] },
  ]},
  { id: "seo", title: "SEO & Branding", description: "Public website meta tags, analytics and search visibility.", icon: Search, fields: [
    { key: "siteTitle", label: "Site Title", type: "text", placeholder: "CreditWise - Installments Made Easy" }, { key: "metaDescription", label: "Meta Description", type: "textarea", placeholder: "Buy electronics, appliances & more on flexible installments." }, { key: "metaKeywords", label: "Meta Keywords", type: "text" }, { key: "ogImage", label: "Open Graph Image URL", type: "text" }, { key: "gaId", label: "Google Analytics ID", type: "text" }, { key: "fbPixel", label: "Facebook Pixel ID", type: "text" }, { key: "robotsIndex", label: "Allow Search Engine Indexing", type: "switch" }, { key: "sitemapEnabled", label: "Auto-generate Sitemap", type: "switch" },
  ]},
  { id: "domain", title: "Domain Configuration", description: "Primary domain, subdomains and SSL settings.", icon: Globe, fields: [
    { key: "primaryDomain", label: "Primary Domain", type: "text", placeholder: "creditwise.pk" }, { key: "wwwRedirect", label: "Redirect www -> root", type: "switch" }, { key: "customSubdomain", label: "App Subdomain", type: "text", placeholder: "app.creditwise.pk" }, { key: "apiSubdomain", label: "API Subdomain", type: "text", placeholder: "api.creditwise.pk" }, { key: "forceHttps", label: "Force HTTPS", type: "switch" }, { key: "sslAutoRenew", label: "Auto-renew SSL Certificate", type: "switch" }, { key: "cdnEnabled", label: "Enable CDN", type: "switch" }, { key: "dnsProvider", label: "DNS Provider", type: "select", options: ["Cloudflare", "Route 53", "GoDaddy", "Namecheap", "Other"] },
  ]},
];

const DEFAULTS: Record<string, any> = {
  profileName: "Ahmed Raza", profileDesignation: "Tenant Owner", profileEmail: "ahmed@creditwise.pk", profilePhone: "+92 300 1234567", profileLanguage: "English", profileTimezone: "Asia/Karachi", profileBio: "", profileNotifyEmail: true, profileNotifySms: true,
  companyName: "CreditWise (Pvt) Ltd", ntn: "1234567-8", strn: "12-34-5678-901-23", phone: "+92 42 35888100", email: "info@creditwise.pk", website: "https://creditwise.pk", address: "12-A, Model Town, Lahore, Pakistan", fiscalStart: "01-Jul",
  invoicePrefix: "INV-", invoiceNextNumber: 2042, showLogoOnInvoice: true, showSignature: true, showCustomerCnic: true, termsFooter: "All sales are subject to our terms.", invoiceLanguage: "English",
  currency: "PKR (Rs.)", gstRate: 18, withholding: 4.5, fedRate: 0, roundingMode: "Nearest", poPrefix: "PO-", grnPrefix: "GRN-", receiptPrefix: "RCP-", voucherPrefix: "VCH-", padding: "5 digits",
  weekOff: "Sunday", shiftStart: "10:00 AM", shiftEnd: "07:00 PM", graceMinutes: 15, casualLeaves: 10, sickLeaves: 8, annualLeaves: 14, payrollCycle: "Monthly", salaryCutoffDay: 25, epf: 8.33, eobi: 1,
  smsEnabled: true, whatsappEnabled: true, emailEnabled: true, smsDailyLimit: 5000, whatsappDailyLimit: 2000, emailDailyLimit: 10000, quietStart: "10:00 PM", quietEnd: "08:00 AM", reminderDaysBefore: 2, overdueReminderDaysAfter: 1,
  expenseAutoApproveLimit: 5000, expenseManagerLimit: 50000, expenseDirectorLimit: 250000, petty: 25000, requireBills: true, blockOverBudget: false,
  allowPartialPayments: true, cashDrawerLimit: 500000, chequeClearanceDays: 3, lateFeePerDay: 100, graceDays: 3, jazzcashEnabled: true, easypaisaEnabled: true,
  printSize: "A4", printCopies: 1, footerNote: "Thank you for your business.", smtpHost: "smtp.example.com", smtpPort: 587, smtpUser: "", smtpPass: "", fromName: "CreditWise", fromEmail: "noreply@creditwise.pk",
  smsProvider: "Branded SMS PK", smsMask: "QISTIFY", smsApiKey: "", smsCallback: "", passwordMinLen: 8, requireMfa: false, sessionMinutes: 60, lockoutAttempts: 5, auditRetentionDays: 365,
  backupFrequency: "Daily", backupTime: "02:00 AM", retentionWeeks: 8, exportEnabled: true, language: "English", timezone: "Asia/Karachi", dateFormat: "DD-MM-YYYY", weekStart: "Monday",
  siteTitle: "CreditWise - Installments Made Easy", metaDescription: "Buy electronics, appliances & more on flexible installments across Pakistan.", metaKeywords: "installments, qist, electronics, mobiles, appliances, pakistan", ogImage: "", gaId: "", fbPixel: "", robotsIndex: true, sitemapEnabled: true,
  primaryDomain: "creditwise.pk", wwwRedirect: true, customSubdomain: "app.creditwise.pk", apiSubdomain: "api.creditwise.pk", forceHttps: true, sslAutoRenew: true, cdnEnabled: true, dnsProvider: "Cloudflare",
};

export function MasterSettingsPage() {
  const [active, setActive] = useState(SECTIONS[0].id);
  const toast = useToast();
  const { items, create, update } = useEntityStore<{ id: string; values: Record<string, any> }>("qcrm.masterSettingsKv", [{ id: "default", values: DEFAULTS }]);
  const stored = items[0]?.values ?? DEFAULTS;
  const [draft, setDraft] = useState<Record<string, any>>(stored);
  const section = useMemo(() => SECTIONS.find((s) => s.id === active)!, [active]);

  function set(k: string, v: any) { setDraft((d) => ({ ...d, [k]: v })); }
  function save() {
    if (items[0]) update(items[0].id, { values: draft });
    else create({ values: draft } as any);
    toast.success("Settings saved", `${section.title} has been updated.`);
  }
  function resetSection() {
    setDraft((d) => {
      const next = { ...d };
      section.fields.forEach((f) => { next[f.key] = DEFAULTS[f.key]; });
      return next;
    });
    toast.info("Section reset", `Default values restored for ${section.title}.`);
  }

  return (
    <>
      <PageHeader
        title="Master Settings"
        description="Full control over company profile, invoices, HR, notifications, expenses and more."
        actions={
          <>
            <button onClick={resetSection} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold hover:bg-muted">Reset Section</button>
            <button onClick={save} className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30"><Save className="h-4 w-4" /> Save Changes</button>
          </>
        }
      />
      <div className="flex flex-col gap-6">
        <SettingsTabs initial="master" />
        <SectionTabs sections={SECTIONS} active={active} onChange={setActive} />
        <div className="rounded-xl border border-border bg-card overflow-hidden">
          <div className="p-6 border-b border-border bg-gradient-to-r from-primary/5 to-primary/5">
            <div className="flex items-start gap-3">
              <span className="h-11 w-11 rounded-xl bg-primary/15 text-primary grid place-items-center"><section.icon className="h-5 w-5" /></span>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-foreground">{section.title}</h2>
                <p className="text-sm text-muted-foreground mt-0.5">{section.description}</p>
              </div>
            </div>
          </div>
          <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-x-5 gap-y-5">
            {section.fields.map((f) => <FieldRow key={f.key} field={f} value={draft[f.key]} onChange={(v) => set(f.key, v)} />)}
          </div>
        </div>
      </div>
    </>
  );
}

function SectionTabs({ sections, active, onChange }: { sections: Section[]; active: string; onChange: (id: string) => void }) {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const activeBtnRef = useRef<HTMLButtonElement>(null);
  const [canLeft, setCanLeft] = useState(false);
  const [canRight, setCanRight] = useState(false);

  const update = () => {
    const el = scrollerRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  };

  useEffect(() => {
    const el = scrollerRef.current;
    if (!el) return;
    update();
    el.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      el.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);

  useEffect(() => {
    activeBtnRef.current?.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
  }, [active]);

  const scrollBy = (dir: -1 | 1) => {
    const el = scrollerRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.max(240, el.clientWidth * 0.6), behavior: "smooth" });
  };

  return (
    <div className="relative border-b border-border">
      <button type="button" aria-label="Scroll tabs left" onClick={() => scrollBy(-1)} disabled={!canLeft} className="absolute left-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 grid place-items-center rounded-full border border-border bg-card shadow-md hover:bg-muted text-foreground/80 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"><ChevronLeft className="h-4 w-4" /></button>
      <button type="button" aria-label="Scroll tabs right" onClick={() => scrollBy(1)} disabled={!canRight} className="absolute right-1 top-1/2 -translate-y-1/2 z-20 h-8 w-8 grid place-items-center rounded-full border border-border bg-card shadow-md hover:bg-muted text-foreground/80 transition disabled:opacity-30 disabled:cursor-not-allowed disabled:shadow-none"><ChevronRight className="h-4 w-4" /></button>
      {canLeft && <div className="pointer-events-none absolute left-10 top-0 bottom-0 z-10 w-8 bg-gradient-to-r from-background to-transparent" aria-hidden="true" />}
      {canRight && <div className="pointer-events-none absolute right-10 top-0 bottom-0 z-10 w-8 bg-gradient-to-l from-background to-transparent" aria-hidden="true" />}
      <div ref={scrollerRef} className="overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden px-10">
        <div className="flex items-center min-w-max">
          {sections.map((s) => {
            const Icon = s.icon;
            const isActive = active === s.id;
            return <UnderlineTab key={s.id} refEl={isActive ? activeBtnRef : undefined} active={isActive} onClick={() => onChange(s.id)}><Icon className="h-3.5 w-3.5" />{s.title}</UnderlineTab>;
          })}
        </div>
      </div>
    </div>
  );
}

function FieldRow({ field, value, onChange }: { field: FieldDef; value: any; onChange: (v: any) => void }) {
  if (field.type === "switch") {
    const checked = !!value;
    return (
      <div className="md:col-span-2 flex items-center justify-between gap-4 rounded-lg border border-border bg-muted/20 px-4 py-3">
        <div>
          <div className="text-[13px] font-semibold text-foreground">{field.label}</div>
          {field.help && <div className="text-[11px] text-muted-foreground mt-0.5">{field.help}</div>}
        </div>
        <button type="button" onClick={() => onChange(!checked)} className={`relative h-6 w-11 rounded-full transition ${checked ? "bg-primary" : "bg-muted-foreground/30"}`}>
          <span className={`absolute top-0.5 h-5 w-5 rounded-full bg-white shadow transition-all ${checked ? "left-[22px]" : "left-0.5"}`} />
        </button>
      </div>
    );
  }

  return (
    <div className={field.type === "textarea" ? "md:col-span-2" : ""}>
      <label className="block text-[13px] font-semibold text-foreground mb-1.5">{field.label}</label>
      {field.type === "select" ? (
        <select value={value ?? ""} onChange={(e) => onChange(e.target.value)} className="w-full h-11 px-3 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30">
          {field.options?.map((o) => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : field.type === "textarea" ? (
        <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} rows={3} className="w-full px-3 py-2.5 rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none" />
      ) : (
        <div className="relative">
          <input type={field.type} value={value ?? ""} placeholder={field.placeholder} onChange={(e) => onChange(field.type === "number" ? Number(e.target.value) : e.target.value)} className={`w-full h-11 px-3 ${field.suffix ? "pr-12" : ""} rounded-lg border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-primary/30`} />
          {field.suffix && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground font-semibold">{field.suffix}</span>}
        </div>
      )}
    </div>
  );
}
