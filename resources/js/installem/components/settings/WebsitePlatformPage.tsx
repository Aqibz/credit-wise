import { useRef, useState, type ChangeEvent, type RefObject } from "react";
import { PageHeader, StatCard, ui } from "@/components/ui-kit";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { UnderlineTabBar, UnderlineTab } from "@/components/ui/underline-tabs";
import {
  Globe,
  ExternalLink,
  Eye,
  Settings2,
  Layout,
  ShoppingBag,
  Newspaper,
  Users,
  Palette,
  PanelTop,
  PanelBottom,
  Link as LinkIcon,
  Plus,
  Trash2,
  Check,
  GripVertical,
  Image as ImageIcon,
  Search as SearchIcon,
  Activity,
  BadgeCheck,
  Upload,
  Type,
} from "lucide-react";
import { toast } from "sonner";
import { KpiIcon } from "@/components/kpi-icons";
import { AppearanceConfig } from "@/components/AppearanceConfig";

const PAGES = [
  { id: "home", name: "Home", path: "/", icon: Layout, type: "Landing", visits: 12480, enabled: true },
  { id: "shop", name: "Shop / Catalog", path: "/shop", icon: ShoppingBag, type: "Commerce", visits: 8902, enabled: true },
  { id: "blog", name: "Blog", path: "/blog", icon: Newspaper, type: "Content", visits: 3210, enabled: false },
  { id: "about", name: "About Us", path: "/about", icon: Users, type: "Static", visits: 1890, enabled: true },
  { id: "contact", name: "Contact", path: "/contact", icon: Users, type: "Form", visits: 1402, enabled: true },
  { id: "branches", name: "Branches Locator", path: "/branches", icon: Globe, type: "Dynamic", visits: 980, enabled: true },
];

const THEMES = [
  { id: "modern", name: "Modern Blue", description: "Clean and professional. Perfect for SaaS and finance.", primary: "#2563eb", accent: "#22d3ee", bg: "#ffffff", text: "#0f172a" },
  { id: "elegant", name: "Elegant Dark", description: "Premium dark mode with gold highlights.", primary: "#c9a84c", accent: "#1f2937", bg: "#0d0d0d", text: "#f5f0e0" },
  { id: "vibrant", name: "Vibrant Coral", description: "Bold and energetic. Great for retail and lifestyle.", primary: "#ef4444", accent: "#fb923c", bg: "#fffbeb", text: "#1c1917" },
];

type LinkRow = { id: string; label: string; url: string };
type TabKey = "branding" | "theme" | "appearance" | "header" | "footer" | "pages" | "seo";

function SocialInput({
  label,
  tint,
  value,
  onChange,
}: {
  label: string;
  tint: string;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex items-center gap-2">
      <span className={`grid h-10 w-10 place-items-center rounded-md text-xs font-bold ${tint}`}>{label.slice(0, 2).toUpperCase()}</span>
      <Input value={value} onChange={(event) => onChange(event.target.value)} placeholder={`${label} URL`} />
    </div>
  );
}

function BrandUploader({
  label,
  url,
  onPick,
  bg,
  small,
  wide,
}: {
  label: string;
  url: string;
  onPick: () => void;
  bg: string;
  small?: boolean;
  wide?: boolean;
}) {
  return (
    <div className="space-y-2">
      <Label className="text-xs">{label}</Label>
      <div className={`flex items-center justify-center rounded-lg border border-dashed border-border p-3 ${bg} ${wide ? "h-32" : small ? "h-24" : "h-28"}`}>
        {url ? <img src={url} alt={label} className="max-h-full max-w-full object-contain" /> : <span className="text-[11px] text-muted-foreground">No image yet</span>}
      </div>
      <Button size="sm" variant="outline" className="w-full gap-1.5" onClick={onPick}>
        <Upload className="h-3.5 w-3.5" />
        {url ? "Replace" : "Upload"}
      </Button>
    </div>
  );
}

export function WebsitePlatformPage() {
  const [tab, setTab] = useState<TabKey>("branding");
  const [pages, setPages] = useState(PAGES);
  const [siteOn] = useState(true);
  const [theme, setTheme] = useState("modern");
  const [brand, setBrand] = useState({
    siteName: "CreditWise",
    tagline: "Buy on installments. Made simple.",
    logoUrl: "/logo.svg",
    logoDarkUrl: "",
    faviconUrl: "/favicon.ico",
    ogImageUrl: "",
  });
  const [seo, setSeo] = useState({
    title: "CreditWise - Buy on installments",
    description: "Pakistan's easiest way to buy electronics, appliances and more on flexible installments.",
    keywords: "installments, qistify, electronics, appliances",
    gaId: "",
    fbPixel: "",
  });
  const [headerLinks, setHeaderLinks] = useState<LinkRow[]>([
    { id: "h1", label: "Home", url: "/" },
    { id: "h2", label: "Shop", url: "/shop" },
    { id: "h3", label: "Branches", url: "/branches" },
    { id: "h4", label: "About", url: "/about" },
    { id: "h5", label: "Contact", url: "/contact" },
  ]);
  const [footerCols, setFooterCols] = useState<{ id: string; title: string; links: LinkRow[] }[]>([
    { id: "c1", title: "Company", links: [{ id: "f1", label: "About Us", url: "/about" }, { id: "f2", label: "Careers", url: "/careers" }, { id: "f3", label: "Press", url: "/press" }] },
    { id: "c2", title: "Support", links: [{ id: "f4", label: "FAQs", url: "/faq" }, { id: "f5", label: "Returns", url: "/returns" }, { id: "f6", label: "Contact", url: "/contact" }] },
    { id: "c3", title: "Legal", links: [{ id: "f7", label: "Privacy Policy", url: "/privacy" }, { id: "f8", label: "Terms of Use", url: "/terms" }] },
  ]);
  const [social, setSocial] = useState({
    facebook: "https://facebook.com/qistify",
    instagram: "https://instagram.com/qistify",
    youtube: "",
    twitter: "",
  });

  const logoRef = useRef<HTMLInputElement>(null);
  const logoDarkRef = useRef<HTMLInputElement>(null);
  const faviconRef = useRef<HTMLInputElement>(null);
  const ogRef = useRef<HTMLInputElement>(null);

  const activeTheme = THEMES.find((item) => item.id === theme) ?? THEMES[0];

  const toggle = (id: string) => {
    setPages((current) => current.map((page) => (page.id === id ? { ...page, enabled: !page.enabled } : page)));
    toast.success("Page visibility updated");
  };

  const addHeaderLink = () => setHeaderLinks((current) => [...current, { id: crypto.randomUUID(), label: "New link", url: "/" }]);
  const updateHeaderLink = (id: string, key: "label" | "url", value: string) =>
    setHeaderLinks((current) => current.map((link) => (link.id === id ? { ...link, [key]: value } : link)));
  const removeHeaderLink = (id: string) => setHeaderLinks((current) => current.filter((link) => link.id !== id));

  const addFooterCol = () => setFooterCols((current) => [...current, { id: crypto.randomUUID(), title: "New column", links: [] }]);
  const removeFooterCol = (id: string) => setFooterCols((current) => current.filter((column) => column.id !== id));
  const updateColTitle = (id: string, title: string) => setFooterCols((current) => current.map((column) => (column.id === id ? { ...column, title } : column)));
  const addFooterLink = (columnId: string) =>
    setFooterCols((current) =>
      current.map((column) =>
        column.id === columnId
          ? { ...column, links: [...column.links, { id: crypto.randomUUID(), label: "Link", url: "/" }] }
          : column,
      ),
    );
  const updateFooterLink = (columnId: string, linkId: string, key: "label" | "url", value: string) =>
    setFooterCols((current) =>
      current.map((column) =>
        column.id === columnId
          ? {
              ...column,
              links: column.links.map((link) => (link.id === linkId ? { ...link, [key]: value } : link)),
            }
          : column,
      ),
    );
  const removeFooterLink = (columnId: string, linkId: string) =>
    setFooterCols((current) =>
      current.map((column) =>
        column.id === columnId ? { ...column, links: column.links.filter((link) => link.id !== linkId) } : column,
      ),
    );

  const pickFile = (ref: RefObject<HTMLInputElement | null>, field: keyof typeof brand) => (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);
    setBrand((current) => ({ ...current, [field]: url }));
    toast.success(`${field} uploaded`);
    if (ref.current) ref.current.value = "";
  };

  return (
    <>
      <PageHeader
        title="Website"
        description="Manage your public website: branding, theme, header, footer, pages and SEO."
        actions={
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" className="gap-2">
              <ExternalLink className="h-4 w-4" />
              Visit site
            </Button>
            <Button size="sm" className="gap-2" onClick={() => toast.success("Website published")}>
              <BadgeCheck className="h-4 w-4" />
              Publish changes
            </Button>
          </div>
        }
      />

      <div className="mb-4 grid grid-cols-2 gap-3 md:grid-cols-4 xl:grid-cols-6">
        <StatCard label="Site Status" value={siteOn ? "Live" : "Maintenance"} hint={siteOn ? "Customers can browse" : "Hidden from public"} icon={<KpiIcon icon={Activity} />} tone={siteOn ? "success" : "warning"} />
        <StatCard label="Visits (30d)" value="28,864" hint="Up 14% vs prev month" icon={<KpiIcon icon={Eye} />} tone="primary" />
        <StatCard label="Active Pages" value={`${pages.filter((page) => page.enabled).length} / ${pages.length}`} hint="Visible to visitors" icon={<KpiIcon icon={Layout} />} tone="primary" />
        <StatCard label="Active Theme" value={activeTheme.name} hint="Click Theme tab to change" icon={<KpiIcon icon={Palette} />} tone="primary" />
        <StatCard label="Header Links" value={headerLinks.length} hint="Top navigation" icon={<KpiIcon icon={PanelTop} />} tone="warning" />
        <StatCard label="Footer Columns" value={footerCols.length} hint={`${footerCols.reduce((sum, column) => sum + column.links.length, 0)} links total`} icon={<KpiIcon icon={PanelBottom} />} tone="warning" />
      </div>

      <UnderlineTabBar className="mb-4 overflow-x-auto">
        <UnderlineTab active={tab === "branding"} onClick={() => setTab("branding")}><span className="inline-flex items-center gap-1.5"><BadgeCheck className="h-3.5 w-3.5" /> Branding</span></UnderlineTab>
        <UnderlineTab active={tab === "theme"} onClick={() => setTab("theme")}><span className="inline-flex items-center gap-1.5"><Palette className="h-3.5 w-3.5" /> Theme</span></UnderlineTab>
        <UnderlineTab active={tab === "appearance"} onClick={() => setTab("appearance")}><span className="inline-flex items-center gap-1.5"><Settings2 className="h-3.5 w-3.5" /> Appearance</span></UnderlineTab>
        <UnderlineTab active={tab === "header"} onClick={() => setTab("header")}><span className="inline-flex items-center gap-1.5"><PanelTop className="h-3.5 w-3.5" /> Header</span></UnderlineTab>
        <UnderlineTab active={tab === "footer"} onClick={() => setTab("footer")}><span className="inline-flex items-center gap-1.5"><PanelBottom className="h-3.5 w-3.5" /> Footer</span></UnderlineTab>
        <UnderlineTab active={tab === "pages"} onClick={() => setTab("pages")}><span className="inline-flex items-center gap-1.5"><Layout className="h-3.5 w-3.5" /> Pages <span className="ml-1 rounded-full bg-muted px-1.5 text-[10px]">{pages.length}</span></span></UnderlineTab>
        <UnderlineTab active={tab === "seo"} onClick={() => setTab("seo")}><span className="inline-flex items-center gap-1.5"><SearchIcon className="h-3.5 w-3.5" /> SEO</span></UnderlineTab>
      </UnderlineTabBar>

      {tab === "branding" ? (
        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <div>
              <h3 className="flex items-center gap-2 font-semibold"><Type className="h-4 w-4 text-primary" /> Site Identity</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Name, tagline and contact essentials shown across the site.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Site name</Label>
                <Input value={brand.siteName} onChange={(event) => setBrand({ ...brand, siteName: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Tagline</Label>
                <Input value={brand.tagline} onChange={(event) => setBrand({ ...brand, tagline: event.target.value })} />
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h3 className="flex items-center gap-2 font-semibold"><ImageIcon className="h-4 w-4 text-primary" /> Logo and Favicon</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Upload PNG or SVG. Square favicon recommended.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <BrandUploader label="Logo (light bg)" url={brand.logoUrl} onPick={() => logoRef.current?.click()} bg="bg-card" />
              <BrandUploader label="Logo (dark bg)" url={brand.logoDarkUrl} onPick={() => logoDarkRef.current?.click()} bg="bg-foreground" />
              <BrandUploader label="Favicon" url={brand.faviconUrl} onPick={() => faviconRef.current?.click()} bg="bg-card" small />
            </div>
            <input ref={logoRef} type="file" accept="image/*" hidden onChange={pickFile(logoRef, "logoUrl")} />
            <input ref={logoDarkRef} type="file" accept="image/*" hidden onChange={pickFile(logoDarkRef, "logoDarkUrl")} />
            <input ref={faviconRef} type="file" accept="image/*,.ico" hidden onChange={pickFile(faviconRef, "faviconUrl")} />
          </Card>

          <Card className="space-y-4 p-5">
            <div>
              <h3 className="flex items-center gap-2 font-semibold"><LinkIcon className="h-4 w-4 text-primary" /> Domain</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Custom domain for your published site.</p>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5 md:col-span-2">
                <Label className="text-xs">Custom domain</Label>
                <Input defaultValue="qistify.com" placeholder="example.com" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <div className="flex h-10 items-center gap-2 rounded-md border border-border bg-card px-3">
                  <Check className="h-4 w-4 text-emerald-600" />
                  <span className="text-sm font-medium">Connected</span>
                </div>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "theme" ? (
        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="flex items-center gap-2 font-semibold"><Palette className="h-4 w-4 text-primary" /> Pre-built Themes</h3>
                <p className="mt-0.5 text-xs text-muted-foreground">Pick a starter theme and customize it below.</p>
              </div>
              <Badge variant="secondary">{THEMES.length} themes</Badge>
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              {THEMES.map((item) => {
                const isActive = theme === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => {
                      setTheme(item.id);
                      toast.success(`Theme changed to ${item.name}`);
                    }}
                    className={`overflow-hidden rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                      isActive ? "border-primary ring-2 ring-primary/30" : "border-border hover:border-primary/40"
                    }`}
                  >
                    <div className="relative h-36" style={{ background: item.bg }}>
                      <div className="absolute inset-x-0 top-0 flex h-7 items-center justify-between px-3" style={{ background: item.primary }}>
                        <div className="h-2 w-12 rounded-sm" style={{ background: item.bg, opacity: 0.85 }} />
                        <div className="flex gap-1.5">
                          <div className="h-1.5 w-5 rounded-full" style={{ background: item.bg, opacity: 0.6 }} />
                          <div className="h-1.5 w-5 rounded-full" style={{ background: item.bg, opacity: 0.6 }} />
                          <div className="h-1.5 w-5 rounded-full" style={{ background: item.bg, opacity: 0.6 }} />
                        </div>
                      </div>
                      <div className="absolute left-3 right-3 top-10 space-y-1.5">
                        <div className="h-2 w-3/4 rounded-sm" style={{ background: item.text, opacity: 0.85 }} />
                        <div className="h-1.5 w-1/2 rounded-sm" style={{ background: item.text, opacity: 0.45 }} />
                        <div className="mt-2 h-5 w-16 rounded" style={{ background: item.accent }} />
                      </div>
                      {isActive ? (
                        <div className="absolute right-2 top-2 grid h-6 w-6 place-items-center rounded-full bg-primary text-primary-foreground shadow-md">
                          <Check className="h-3.5 w-3.5" />
                        </div>
                      ) : null}
                    </div>
                    <div className="bg-card p-4">
                      <div className="flex items-center justify-between gap-2">
                        <h4 className="font-semibold">{item.name}</h4>
                        <div className="flex gap-1">
                          <span className="h-4 w-4 rounded-full border" style={{ background: item.primary }} />
                          <span className="h-4 w-4 rounded-full border" style={{ background: item.accent }} />
                        </div>
                      </div>
                      <p className="mt-1 text-xs text-muted-foreground">{item.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Settings2 className="h-4 w-4 text-primary" /> Theme Customization</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
              {([
                ["Primary color", activeTheme.primary],
                ["Accent color", activeTheme.accent],
                ["Background", activeTheme.bg],
                ["Text color", activeTheme.text],
              ] as const).map(([label, value]) => (
                <div key={label} className="space-y-1.5">
                  <Label className="text-xs">{label}</Label>
                  <div className="flex items-center gap-2">
                    <input type="color" defaultValue={value} className="h-10 w-12 cursor-pointer rounded border border-border" />
                    <Input defaultValue={value} className="font-mono text-xs" />
                  </div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Heading font</Label>
                <select className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
                  <option>Inter</option>
                  <option>Poppins</option>
                  <option>Plus Jakarta Sans</option>
                  <option>Space Grotesk</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Body font</Label>
                <select className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
                  <option>Inter</option>
                  <option>Manrope</option>
                  <option>DM Sans</option>
                  <option>Roboto</option>
                </select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Border radius</Label>
                <select className="h-10 w-full rounded-md border border-border bg-card px-3 text-sm">
                  <option>Sharp (0px)</option>
                  <option>Soft (6px)</option>
                  <option>Rounded (12px)</option>
                  <option>Pill (24px)</option>
                </select>
              </div>
            </div>
          </Card>
        </div>
      ) : null}

      {tab === "appearance" ? <AppearanceConfig mode="website" /> : null}

      {tab === "header" ? (
        <Card className="space-y-4 p-5">
          <h3 className="flex items-center gap-2 font-semibold"><PanelTop className="h-4 w-4 text-primary" /> Header / Top Navigation</h3>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            <div className="space-y-1.5">
              <Label className="text-xs">CTA button text</Label>
              <Input defaultValue="Apply Now" />
            </div>
            <div className="space-y-1.5 md:col-span-2">
              <Label className="text-xs">CTA link</Label>
              <Input defaultValue="/apply" className="font-mono text-xs" />
            </div>
            <div className="flex flex-wrap items-center gap-3 md:col-span-3">
              <div className="flex items-center gap-2"><Switch defaultChecked id="sticky" /><Label htmlFor="sticky" className="text-sm">Sticky on scroll</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked id="search" /><Label htmlFor="search" className="text-sm">Show search bar</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked id="cart" /><Label htmlFor="cart" className="text-sm">Show cart icon</Label></div>
              <div className="flex items-center gap-2"><Switch defaultChecked id="login" /><Label htmlFor="login" className="text-sm">Show login button</Label></div>
            </div>
          </div>
          <div className="border-t border-border pt-4">
            <div className="mb-3 flex items-center justify-between">
              <h4 className="flex items-center gap-2 text-sm font-semibold"><LinkIcon className="h-3.5 w-3.5 text-primary" /> Navigation Links</h4>
              <Button size="sm" variant="outline" className="gap-1.5" onClick={addHeaderLink}>
                <Plus className="h-3.5 w-3.5" />
                Add link
              </Button>
            </div>
            <div className="space-y-2">
              {headerLinks.map((link) => (
                <div key={link.id} className="flex items-center gap-2 rounded-lg border border-border bg-muted/20 p-2">
                  <GripVertical className="h-4 w-4 shrink-0 cursor-move text-muted-foreground" />
                  <Input value={link.label} onChange={(event) => updateHeaderLink(link.id, "label", event.target.value)} className="max-w-[220px]" />
                  <Input value={link.url} onChange={(event) => updateHeaderLink(link.id, "url", event.target.value)} className="flex-1 font-mono text-xs" />
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => removeHeaderLink(link.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </Card>
      ) : null}

      {tab === "footer" ? (
        <Card className="space-y-4 p-5">
          <div className="flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-semibold"><PanelBottom className="h-4 w-4 text-primary" /> Footer</h3>
            <Button size="sm" variant="outline" className="gap-1.5" onClick={addFooterCol}>
              <Plus className="h-3.5 w-3.5" />
              Add column
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="space-y-1.5">
              <Label className="text-xs">Tagline</Label>
              <Input defaultValue={brand.tagline} />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Copyright</Label>
              <Input defaultValue={`(c) 2026 ${brand.siteName}. All rights reserved.`} />
            </div>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {footerCols.map((column) => (
              <div key={column.id} className="space-y-2 rounded-lg border border-border bg-muted/20 p-3">
                <div className="flex items-center gap-2">
                  <Input value={column.title} onChange={(event) => updateColTitle(column.id, event.target.value)} className="font-semibold" />
                  <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => removeFooterCol(column.id)}>
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
                <div className="space-y-1.5">
                  {column.links.map((link) => (
                    <div key={link.id} className="flex items-center gap-1.5">
                      <Input value={link.label} onChange={(event) => updateFooterLink(column.id, link.id, "label", event.target.value)} className="h-8 text-xs" />
                      <Input value={link.url} onChange={(event) => updateFooterLink(column.id, link.id, "url", event.target.value)} className="h-8 font-mono text-xs" />
                      <button type="button" onClick={() => removeFooterLink(column.id, link.id)} className="grid h-8 w-8 shrink-0 place-items-center rounded-md text-destructive hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
                <Button size="sm" variant="ghost" className="w-full gap-1.5 text-xs" onClick={() => addFooterLink(column.id)}>
                  <Plus className="h-3 w-3" />
                  Add link
                </Button>
              </div>
            ))}
          </div>
          <div className="space-y-3 border-t border-border pt-4">
            <h4 className="text-sm font-semibold">Social Media</h4>
            <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
              <SocialInput label="Facebook" tint="bg-blue-500/10 text-blue-600" value={social.facebook} onChange={(value) => setSocial({ ...social, facebook: value })} />
              <SocialInput label="Instagram" tint="bg-pink-500/10 text-pink-600" value={social.instagram} onChange={(value) => setSocial({ ...social, instagram: value })} />
              <SocialInput label="YouTube" tint="bg-red-500/10 text-red-600" value={social.youtube} onChange={(value) => setSocial({ ...social, youtube: value })} />
              <SocialInput label="Twitter" tint="bg-sky-500/10 text-sky-600" value={social.twitter} onChange={(value) => setSocial({ ...social, twitter: value })} />
            </div>
          </div>
        </Card>
      ) : null}

      {tab === "pages" ? (
        <div className="overflow-hidden rounded-lg border border-border bg-card">
          <div className="flex items-center justify-between border-b border-border px-4 py-3">
            <h3 className="text-[13px] font-semibold">Pages</h3>
            <Badge variant="secondary">{pages.length} pages</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-[12px]">
              <thead className={ui.tableHeadRow}>
                <tr>
                  <th className={ui.tableHeadCell}>Page</th>
                  <th className={ui.tableHeadCell}>Path</th>
                  <th className={ui.tableHeadCell}>Type</th>
                  <th className={`${ui.tableHeadCell} !text-right`}>Visits</th>
                  <th className={`${ui.tableHeadCell} !text-center`}>Status</th>
                  <th className={`${ui.tableHeadCell} !text-right`}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {pages.map((page) => {
                  const Icon = page.icon;

                  return (
                    <tr key={page.id} className="border-t border-border hover:bg-muted/30">
                      <td className="px-3 py-2.5 font-medium">
                        <span className="inline-flex items-center gap-2"><Icon className="h-4 w-4 text-primary" /> {page.name}</span>
                      </td>
                      <td className="px-3 py-2.5 font-mono text-[11px] text-muted-foreground">{page.path}</td>
                      <td className="px-3 py-2.5"><Badge variant="outline">{page.type}</Badge></td>
                      <td className="px-3 py-2.5 text-right font-semibold tabular-nums">{page.visits.toLocaleString()}</td>
                      <td className="px-3 py-2.5 text-center"><Switch checked={page.enabled} onCheckedChange={() => toggle(page.id)} /></td>
                      <td className="px-3 py-2.5 text-right">
                        <Button variant="ghost" size="sm" className="gap-1">
                          <Eye className="h-3.5 w-3.5" />
                          Preview
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : null}

      {tab === "seo" ? (
        <div className="space-y-4">
          <Card className="space-y-4 p-5">
            <div>
              <h3 className="flex items-center gap-2 font-semibold"><SearchIcon className="h-4 w-4 text-primary" /> Search Engine Basics</h3>
              <p className="mt-0.5 text-xs text-muted-foreground">Title and description shown in Google search results.</p>
            </div>
            <div className="space-y-3">
              <div className="space-y-1.5">
                <Label className="text-xs">Meta title <span className="text-muted-foreground">({seo.title.length}/60)</span></Label>
                <Input value={seo.title} maxLength={70} onChange={(event) => setSeo({ ...seo, title: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Meta description <span className="text-muted-foreground">({seo.description.length}/160)</span></Label>
                <Textarea rows={3} value={seo.description} maxLength={180} onChange={(event) => setSeo({ ...seo, description: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Keywords (comma separated)</Label>
                <Input value={seo.keywords} onChange={(event) => setSeo({ ...seo, keywords: event.target.value })} />
              </div>
            </div>
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="flex items-center gap-2 font-semibold"><ImageIcon className="h-4 w-4 text-primary" /> Social Share Image (OG)</h3>
            <BrandUploader label="Open Graph image (1200x630)" url={brand.ogImageUrl} onPick={() => ogRef.current?.click()} bg="bg-muted" wide />
            <input ref={ogRef} type="file" accept="image/*" hidden onChange={pickFile(ogRef, "ogImageUrl")} />
          </Card>

          <Card className="space-y-4 p-5">
            <h3 className="flex items-center gap-2 font-semibold"><Activity className="h-4 w-4 text-primary" /> Analytics and Tracking</h3>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Google Analytics ID</Label>
                <Input value={seo.gaId} onChange={(event) => setSeo({ ...seo, gaId: event.target.value })} placeholder="G-XXXXXXX" className="font-mono text-xs" />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Facebook Pixel ID</Label>
                <Input value={seo.fbPixel} onChange={(event) => setSeo({ ...seo, fbPixel: event.target.value })} placeholder="000000000000000" className="font-mono text-xs" />
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </>
  );
}
