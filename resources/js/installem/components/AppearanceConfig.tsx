import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { UnderlineTabBar, UnderlineTab } from "@/components/ui/underline-tabs";
import {
  Palette, PanelTop, PanelBottom, Menu as MenuIcon, ShoppingBag, Globe, Image as ImageIcon,
  Upload, Save, Settings2, Smartphone, Apple, Link2,
  Facebook, Instagram, Twitter, Linkedin, Youtube, Music2, Ghost, Trash2,
} from "lucide-react";
import { toast } from "sonner";

type Mode = "website" | "mobile";

type ColorField = { key: string; label: string; defaultValue: string };
type ColorGroup = { id: string; title: string; icon: any; fields: ColorField[] };

const THEME_COLORS: ColorField[] = [
  { key: "background",    label: "Background",       defaultValue: "#EBEBED" },
  { key: "accent",        label: "Accent",           defaultValue: "#FF6C0C" },
  { key: "accentText",    label: "Accent Text",      defaultValue: "#FFFFFF" },
  { key: "button",        label: "Button",           defaultValue: "#422A00" },
  { key: "buttonText",    label: "Button Text",      defaultValue: "#FFFFFF" },
  { key: "buttonHover",   label: "Button Hover",     defaultValue: "#452100" },
  { key: "buttonHoverTx", label: "Button Hover Text",defaultValue: "#FFFFFF" },
  { key: "sectionHead",   label: "Section Heading",  defaultValue: "#45970A" },
];

const HEADER_COLORS: ColorField[] = [
  { key: "h_bg",          label: "Background",   defaultValue: "#889CF7" },
  { key: "h_text",        label: "Text",         defaultValue: "#000000" },
  { key: "h_icon",        label: "Icon",         defaultValue: "#000000" },
  { key: "h_cart",        label: "Cart Counter", defaultValue: "#889CF7" },
  { key: "h_cartTx",      label: "Cart Counter Text", defaultValue: "#000000" },
];

const FOOTER_COLORS: ColorField[] = [
  { key: "f_bg",          label: "Background",       defaultValue: "#000000" },
  { key: "f_primaryTx",   label: "Primary Text",     defaultValue: "#000000" },
  { key: "f_secondaryTx", label: "Secondary Text",   defaultValue: "#C3756C" },
  { key: "f_icon",        label: "Icon",             defaultValue: "#EC245C" },
];

const MENU_COLORS: ColorField[] = [
  { key: "m_tile",        label: "Tile",         defaultValue: "#F3F3EE" },
  { key: "m_text",        label: "Text",         defaultValue: "#000000" },
  { key: "m_active",      label: "Active",       defaultValue: "#4623E"  },
  { key: "m_activeTx",    label: "Active Text",  defaultValue: "#000000" },
];

const PRODUCT_COLORS: ColorField[] = [
  { key: "p_bg",          label: "Background",       defaultValue: "#FFFFCF" },
  { key: "p_titleTx",     label: "Title Text",       defaultValue: "#000000" },
  { key: "p_descTx",      label: "Description Text", defaultValue: "#575554" },
  { key: "p_priceLbl",    label: "Price Label",      defaultValue: "#FFFFFF" },
  { key: "p_addBtn",      label: "Add To Cart Btn",  defaultValue: "#FFEED" },
  { key: "p_addBtnTx",    label: "Add To Cart Text", defaultValue: "#000000" },
  { key: "p_ribbon",      label: "Discount Ribbon",  defaultValue: "#FF0000" },
  { key: "p_discountTx",  label: "Discount Text",    defaultValue: "#FFFFFF" },
];

const COLOR_GROUPS: ColorGroup[] = [
  { id: "theme",   title: "Theme Colors",          icon: Palette,     fields: THEME_COLORS },
  { id: "header",  title: "Header Colors",         icon: PanelTop,    fields: HEADER_COLORS },
  { id: "footer",  title: "Footer Colors",         icon: PanelBottom, fields: FOOTER_COLORS },
  { id: "menu",    title: "Menu Section Colors",   icon: MenuIcon,    fields: MENU_COLORS },
  { id: "product", title: "Product Colors",        icon: ShoppingBag, fields: PRODUCT_COLORS },
];

type SubTab = "colors" | "config" | "store" | "social";

export function AppearanceConfig({ mode }: { mode: Mode }) {
  const [tab, setTab] = useState<SubTab>("colors");
  const [openGroups, setOpenGroups] = useState<Record<string, boolean>>({ theme: true, header: true, footer: true, menu: true, product: true });
  const [colors, setColors] = useState<Record<string, string>>(() => {
    const init: Record<string, string> = {};
    COLOR_GROUPS.forEach((g) => g.fields.forEach((f) => { init[f.key] = f.defaultValue; }));
    return init;
  });

  const [config, setConfig] = useState({
    productClickPopup: true,
    transparentSection: true,
    showSectionSeparator: true,
    showTopReviews: true,
    showTopReviewsHeader: true,
    locationPopupSkippable: true,
    showChooseLocationCart: true,
    showAddressFooter: true,
    headerBacklinkTitle: "",
    headerBacklinkUrl: "",
    bgImageUrl: "",
    footerLogoUrl: "",
  });
  const bgRef = useRef<HTMLInputElement>(null);
  const flRef = useRef<HTMLInputElement>(null);

  const [storeLinks, setStoreLinks] = useState({ play: "", appStore: "" });
  const [social, setSocial] = useState({
    facebook: "", instagram: "", twitter: "", linkedin: "", tiktok: "", snapchat: "", youtube: "",
  });

  const pickFile = (ref: React.RefObject<HTMLInputElement | null>, key: "bgImageUrl" | "footerLogoUrl") =>
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const f = e.target.files?.[0];
      if (!f) return;
      setConfig((c) => ({ ...c, [key]: URL.createObjectURL(f) }));
      toast.success("File uploaded");
      if (ref.current) ref.current.value = "";
    };

  const saveAll = () => toast.success(`${mode === "website" ? "Website" : "Mobile app"} appearance saved`);

  return (
    <div className="space-y-4">
      <UnderlineTabBar className="overflow-x-auto">
        <UnderlineTab active={tab === "colors"} onClick={() => setTab("colors")}>
          <span className="inline-flex items-center gap-1.5"><Palette className="w-3.5 h-3.5" /> Colors</span>
        </UnderlineTab>
        <UnderlineTab active={tab === "config"} onClick={() => setTab("config")}>
          <span className="inline-flex items-center gap-1.5"><Settings2 className="w-3.5 h-3.5" /> Configurations</span>
        </UnderlineTab>
        <UnderlineTab active={tab === "store"} onClick={() => setTab("store")}>
          <span className="inline-flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Store Links</span>
        </UnderlineTab>
        <UnderlineTab active={tab === "social"} onClick={() => setTab("social")}>
          <span className="inline-flex items-center gap-1.5"><Globe className="w-3.5 h-3.5" /> Social Links</span>
        </UnderlineTab>
      </UnderlineTabBar>

      {tab === "colors" && (
        <div className="space-y-3">
          {COLOR_GROUPS.map((g) => {
            const Icon = g.icon;
            const open = openGroups[g.id];
            return (
              <Card key={g.id} className="overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenGroups((s) => ({ ...s, [g.id]: !open }))}
                  className="w-full flex items-center gap-2.5 px-4 py-3 hover:bg-muted/30 transition-colors"
                >
                  <Icon className="w-4 h-4 text-primary" />
                  <span className="font-semibold text-sm flex-1 text-left">{g.title} Configurations</span>
                  <span className={`text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`}>▾</span>
                </button>
                {open && (
                  <div className="border-t border-border p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                    {g.fields.map((f) => (
                      <div key={f.key} className="flex items-center gap-2">
                        <input
                          type="color"
                          value={colors[f.key]}
                          onChange={(e) => setColors((s) => ({ ...s, [f.key]: e.target.value }))}
                          className="h-9 w-9 rounded-full cursor-pointer border border-border shrink-0"
                        />
                        <Input
                          value={colors[f.key]}
                          onChange={(e) => setColors((s) => ({ ...s, [f.key]: e.target.value }))}
                          className="font-mono text-xs h-9 w-24 shrink-0"
                        />
                        <Label className="text-xs text-muted-foreground truncate">{f.label}</Label>
                      </div>
                    ))}
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      {tab === "config" && (
        <Card className="p-5 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold flex items-center gap-2">
              <Settings2 className="w-4 h-4 text-primary" /> Custom Domain Setup
            </h3>
            <div className="flex gap-2">
              <Button size="sm" variant="outline">Get Configurations</Button>
              <Button size="sm" variant="destructive" className="gap-1.5"><Trash2 className="w-3.5 h-3.5" /> Delete</Button>
            </div>
          </div>

          <ConfigRow label="Product Click View">
            <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${config.productClickPopup ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
              {config.productClickPopup ? "Popup" : "Page"}
            </span>
            <Switch checked={config.productClickPopup} onCheckedChange={(v) => setConfig({ ...config, productClickPopup: v })} />
          </ConfigRow>

          <ConfigRow label="Background Image">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => bgRef.current?.click()}>
              <ImageIcon className="w-3.5 h-3.5" /> Choose File
            </Button>
            <span className="text-xs text-muted-foreground">{config.bgImageUrl ? "File chosen" : "No file chosen"}</span>
            <input ref={bgRef} type="file" accept="image/*" hidden onChange={pickFile(bgRef, "bgImageUrl")} />
          </ConfigRow>
          <p className="text-[11px] text-muted-foreground -mt-2 ml-[40%]">Recommended dimension 1920×1080h</p>

          <ConfigRow label="Footer Logo (Optional)">
            <Button variant="outline" size="sm" className="gap-1.5" onClick={() => flRef.current?.click()}>
              <ImageIcon className="w-3.5 h-3.5" /> Choose File
            </Button>
            <span className="text-xs text-muted-foreground">{config.footerLogoUrl ? "File chosen" : "No file chosen"}</span>
            <input ref={flRef} type="file" accept="image/*" hidden onChange={pickFile(flRef, "footerLogoUrl")} />
          </ConfigRow>

          {[
            ["transparentSection",    "Transparent Section Background"],
            ["showSectionSeparator",  "Show Section Separator"],
            ["showTopReviews",        "Show Top Reviews"],
            ["showTopReviewsHeader",  "Show Top Reviews on Header"],
            ["locationPopupSkippable","Location Popup Skippable"],
            ["showChooseLocationCart","Show \"Choose Location\" in Cart"],
            ["showAddressFooter",     "Show Address In Footer"],
          ].map(([key, label]) => {
            const v = (config as any)[key as string] as boolean;
            return (
              <ConfigRow key={key as string} label={label as string}>
                <span className={`px-2.5 py-1 rounded-md text-xs font-semibold ${v ? "bg-success/15 text-success" : "bg-muted text-muted-foreground"}`}>
                  {v ? "Enabled" : "Disabled"}
                </span>
                <Switch checked={v} onCheckedChange={(nv) => setConfig({ ...config, [key as string]: nv })} />
              </ConfigRow>
            );
          })}

          <ConfigRow label="Header Backlink Title">
            <Input
              value={config.headerBacklinkTitle}
              onChange={(e) => setConfig({ ...config, headerBacklinkTitle: e.target.value })}
              placeholder="Header Backlink Title"
              className="flex-1 max-w-md"
            />
          </ConfigRow>
          <ConfigRow label="Header Backlink URL">
            <Input
              value={config.headerBacklinkUrl}
              onChange={(e) => setConfig({ ...config, headerBacklinkUrl: e.target.value })}
              placeholder="Header Backlink URL"
              className="flex-1 max-w-md font-mono text-xs"
            />
          </ConfigRow>

          <div className="flex justify-center pt-2">
            <Button onClick={saveAll} className="gap-1.5">
              <Save className="w-4 h-4" /> Save All Config
            </Button>
          </div>
        </Card>
      )}

      {tab === "store" && (
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Smartphone className="w-4 h-4 text-primary" /> Google Play / Apple App Store Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5"><Smartphone className="w-3.5 h-3.5" /> Play Store Link</Label>
              <Input value={storeLinks.play} onChange={(e) => setStoreLinks({ ...storeLinks, play: e.target.value })} placeholder="Play Store Link" />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs flex items-center gap-1.5"><Apple className="w-3.5 h-3.5" /> App Store Link</Label>
              <Input value={storeLinks.appStore} onChange={(e) => setStoreLinks({ ...storeLinks, appStore: e.target.value })} placeholder="App Store Link" />
            </div>
          </div>
          <div className="flex justify-center pt-2">
            <Button onClick={saveAll} className="gap-1.5"><Save className="w-4 h-4" /> Save All Config</Button>
          </div>
        </Card>
      )}

      {tab === "social" && (
        <Card className="p-5 space-y-4">
          <h3 className="font-semibold flex items-center gap-2">
            <Link2 className="w-4 h-4 text-primary" /> Social Media Links
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <SocialField icon={<Facebook className="w-3.5 h-3.5" />}  color="text-blue-600"   label="Facebook Link"  value={social.facebook}  onChange={(v) => setSocial({ ...social, facebook: v })} />
            <SocialField icon={<Instagram className="w-3.5 h-3.5" />} color="text-pink-600"   label="Instagram Link" value={social.instagram} onChange={(v) => setSocial({ ...social, instagram: v })} />
            <SocialField icon={<Twitter className="w-3.5 h-3.5" />}   color="text-sky-600"    label="Twitter Link"   value={social.twitter}   onChange={(v) => setSocial({ ...social, twitter: v })} />
            <SocialField icon={<Linkedin className="w-3.5 h-3.5" />}  color="text-blue-700"   label="LinkedIn Link"  value={social.linkedin}  onChange={(v) => setSocial({ ...social, linkedin: v })} />
            <SocialField icon={<Music2 className="w-3.5 h-3.5" />}    color="text-fuchsia-600"label="TikTok Link"    value={social.tiktok}    onChange={(v) => setSocial({ ...social, tiktok: v })} />
            <SocialField icon={<Ghost className="w-3.5 h-3.5" />}     color="text-yellow-500" label="Snapchat Link"  value={social.snapchat}  onChange={(v) => setSocial({ ...social, snapchat: v })} />
            <SocialField icon={<Youtube className="w-3.5 h-3.5" />}   color="text-red-600"    label="Youtube Link"   value={social.youtube}   onChange={(v) => setSocial({ ...social, youtube: v })} />
          </div>
          <div className="flex justify-center pt-2">
            <Button onClick={saveAll} className="gap-1.5"><Save className="w-4 h-4" /> Save All Config</Button>
          </div>
        </Card>
      )}
    </div>
  );
}

function ConfigRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[40%_1fr] gap-3 items-center">
      <Label className="text-sm text-muted-foreground md:text-right md:pr-4">{label}</Label>
      <div className="flex items-center gap-3 flex-wrap">{children}</div>
    </div>
  );
}

function SocialField({ icon, color, label, value, onChange }: { icon: React.ReactNode; color: string; label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label className={`text-xs flex items-center gap-1.5 ${color}`}>{icon} {label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={label} />
    </div>
  );
}
