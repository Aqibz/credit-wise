import { useRef, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
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
  Image as ImageIcon,
  Upload,
  Plus,
  Trash2,
  Pencil,
  Link2,
  Layers,
  Eye,
  MousePointerClick,
  Calendar,
  Globe,
  Smartphone,
} from "lucide-react";
import { toast } from "sonner";
import { ui } from "@/components/ui-kit";

const CATEGORIES = ["Mobiles", "Laptops", "Home Appliances", "TV & Audio", "Accessories"];
const ITEMS = ["iPhone 15 Pro Max", "Samsung S24 Ultra", "MacBook Air M3", "Dell XPS 13", "LG OLED 55\"", "Dyson V15", "AirPods Pro 2"];
const PLACEMENTS = ["Website Home", "Website Category", "Mobile App Home", "Mobile App Splash"];
const LINK_TYPES = ["Item", "Category", "External URL", "None"] as const;

type LinkType = (typeof LINK_TYPES)[number];

type Banner = {
  id: string;
  title: string;
  image: string;
  placement: string;
  linkType: LinkType;
  linkTarget: string;
  startDate: string;
  endDate: string;
  impressions: number;
  clicks: number;
  active: boolean;
};

const SEED: Banner[] = [
  { id: "b1", title: "Eid Sale - Up to 40% Off", image: "https://images.unsplash.com/photo-1607082348824-0a96f2a4b9da?w=800&auto=format&fit=crop&q=60", placement: "Website Home", linkType: "Category", linkTarget: "Mobiles", startDate: "2026-05-01", endDate: "2026-06-01", impressions: 24820, clicks: 1480, active: true },
  { id: "b2", title: "MacBook Air M3 - Now Available", image: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=800&auto=format&fit=crop&q=60", placement: "Mobile App Home", linkType: "Item", linkTarget: "MacBook Air M3", startDate: "2026-04-15", endDate: "2026-07-15", impressions: 18230, clicks: 920, active: true },
  { id: "b3", title: "Home Appliances Mega Deal", image: "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=800&auto=format&fit=crop&q=60", placement: "Website Category", linkType: "Category", linkTarget: "Home Appliances", startDate: "2026-04-01", endDate: "2026-05-01", impressions: 9850, clicks: 410, active: false },
];

export function BannersPage() {
  const [banners, setBanners] = useState<Banner[]>(SEED);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState<Banner | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [form, setForm] = useState<Omit<Banner, "id" | "impressions" | "clicks">>({
    title: "",
    image: "",
    placement: PLACEMENTS[0],
    linkType: "Category",
    linkTarget: "",
    startDate: "",
    endDate: "",
    active: true,
  });

  const fileRef = useRef<HTMLInputElement>(null);
  const targetOptions = form.linkType === "Item" ? ITEMS : form.linkType === "Category" ? CATEGORIES : [];
  const totalImp = banners.reduce((sum, banner) => sum + banner.impressions, 0);
  const totalClicks = banners.reduce((sum, banner) => sum + banner.clicks, 0);
  const ctr = totalImp ? ((totalClicks / totalImp) * 100).toFixed(2) : "0.00";

  const reset = () => {
    setEditing(null);
    setPreview(null);
    setForm({
      title: "",
      image: "",
      placement: PLACEMENTS[0],
      linkType: "Category",
      linkTarget: "",
      startDate: "",
      endDate: "",
      active: true,
    });
  };

  const openNew = () => {
    reset();
    setOpen(true);
  };

  const openEdit = (banner: Banner) => {
    setEditing(banner);
    setPreview(banner.image);
    setForm({
      title: banner.title,
      image: banner.image,
      placement: banner.placement,
      linkType: banner.linkType,
      linkTarget: banner.linkTarget,
      startDate: banner.startDate,
      endDate: banner.endDate,
      active: banner.active,
    });
    setOpen(true);
  };

  const onFile = (file?: File | null) => {
    if (!file) return;
    const url = URL.createObjectURL(file);
    setPreview(url);
    setForm((current) => ({ ...current, image: url }));
  };

  const save = () => {
    if (!form.title || !form.image) {
      toast.error("Title and image are required");
      return;
    }

    if (editing) {
      setBanners((current) => current.map((banner) => (banner.id === editing.id ? { ...editing, ...form } : banner)));
      toast.success("Banner updated");
    } else {
      setBanners((current) => [{ id: `b${Date.now()}`, impressions: 0, clicks: 0, ...form }, ...current]);
      toast.success("Banner added");
    }

    setOpen(false);
    reset();
  };

  const remove = (id: string) => {
    setBanners((current) => current.filter((banner) => banner.id !== id));
    toast.success("Banner removed");
  };

  const toggle = (id: string) => {
    setBanners((current) => current.map((banner) => (banner.id === id ? { ...banner, active: !banner.active } : banner)));
  };

  return (
    <>
      <div className="space-y-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight">
              <ImageIcon className="h-6 w-6 text-primary" />
              Banners
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Upload promotional banners and link them to an item, category or external URL across website and mobile apps.
            </p>
          </div>
          <Button onClick={openNew} className="gap-2">
            <Plus className="h-4 w-4" />
            Upload Banner
          </Button>
        </div>

        <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card className="bg-gradient-to-br from-primary/10 to-primary/5 p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Total banners</p>
                <p className="mt-1 text-2xl font-bold">{banners.length}</p>
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-primary/15 text-primary">
                <Layers className="h-5 w-5" />
              </div>
            </div>
          </Card>
          <Card className="p-5">
            <p className="text-xs text-muted-foreground">Active</p>
            <p className="mt-1 text-2xl font-bold text-emerald-600">{banners.filter((banner) => banner.active).length}</p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><Eye className="h-3.5 w-3.5" /> Impressions</p>
            <p className="mt-1 text-2xl font-bold">{totalImp.toLocaleString()}</p>
          </Card>
          <Card className="p-5">
            <p className="flex items-center gap-1 text-xs text-muted-foreground"><MousePointerClick className="h-3.5 w-3.5" /> CTR</p>
            <p className="mt-1 text-2xl font-bold">{ctr}%</p>
          </Card>
        </div>

        <div className="overflow-hidden rounded-lg bg-card shadow-[0_4px_16px_-6px_rgba(16,24,40,0.12),0_2px_4px_-2px_rgba(16,24,40,0.06)]">
          <div className="flex items-center justify-between border-b border-border px-5 py-4">
            <h3 className="font-semibold">All Banners</h3>
            <Badge variant="secondary">{banners.length} total</Badge>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className={ui.tableHeadRow}>
                <tr>
                  <th className="w-12 px-4 py-4 text-left">SR#</th>
                  <th className="px-2 py-4 text-left">Banner</th>
                  <th className="px-2 py-4 text-left">Placement</th>
                  <th className="px-2 py-4 text-left">Linked To</th>
                  <th className="px-2 py-4 text-left">Schedule</th>
                  <th className="px-2 py-4 text-right">Impressions</th>
                  <th className="px-2 py-4 text-right">Clicks</th>
                  <th className="px-2 py-4 text-center">Active</th>
                  <th className="px-4 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {banners.map((banner, index) => (
                  <tr key={banner.id} className="transition-colors hover:bg-muted/30">
                    <td className="px-4 py-4 font-medium text-muted-foreground">{index + 1}</td>
                    <td className="px-2 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-20 flex-shrink-0 overflow-hidden rounded-md border bg-muted">
                          {banner.image ? <img src={banner.image} alt={banner.title} className="h-full w-full object-cover" /> : null}
                        </div>
                        <span className="font-semibold">{banner.title}</span>
                      </div>
                    </td>
                    <td className="px-2 py-4">
                      <span className="inline-flex items-center gap-1 text-xs">
                        {banner.placement.includes("Mobile") ? <Smartphone className="h-3.5 w-3.5 text-muted-foreground" /> : <Globe className="h-3.5 w-3.5 text-muted-foreground" />}
                        {banner.placement}
                      </span>
                    </td>
                    <td className="px-2 py-4">
                      {banner.linkType === "None" ? (
                        <span className="text-xs text-muted-foreground">-</span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5">
                          <Link2 className="h-3.5 w-3.5 text-primary" />
                          <Badge variant="outline" className="text-[10px]">{banner.linkType}</Badge>
                          <span className="text-xs">{banner.linkTarget}</span>
                        </span>
                      )}
                    </td>
                    <td className="px-2 py-4 text-xs text-muted-foreground">
                      <div className="flex items-center gap-1"><Calendar className="h-3 w-3" />{banner.startDate || "-"}</div>
                      <div className="mt-0.5 flex items-center gap-1"><Calendar className="h-3 w-3" />{banner.endDate || "-"}</div>
                    </td>
                    <td className="px-2 py-4 text-right font-medium">{banner.impressions.toLocaleString()}</td>
                    <td className="px-2 py-4 text-right font-medium">{banner.clicks.toLocaleString()}</td>
                    <td className="px-2 py-4 text-center"><Switch checked={banner.active} onCheckedChange={() => toggle(banner.id)} /></td>
                    <td className="px-4 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <Button variant="ghost" size="sm" className="gap-1" onClick={() => openEdit(banner)}>
                          <Pencil className="h-3.5 w-3.5" />
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="gap-1 text-destructive hover:text-destructive" onClick={() => remove(banner.id)}>
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
                {banners.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-sm text-muted-foreground">
                      No banners yet. Click <b>Upload Banner</b> to add one.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={(nextOpen) => { setOpen(nextOpen); if (!nextOpen) reset(); }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              {editing ? "Edit banner" : "Upload new banner"}
            </DialogTitle>
            <DialogDescription>Upload an image and link it to an item, category or external URL.</DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div
              onClick={() => fileRef.current?.click()}
              onDragOver={(event) => event.preventDefault()}
              onDrop={(event) => {
                event.preventDefault();
                onFile(event.dataTransfer.files?.[0]);
              }}
              className="relative grid h-44 cursor-pointer place-items-center overflow-hidden rounded-lg border-2 border-dashed border-border bg-muted/30 transition hover:bg-muted/50"
            >
              {preview ? (
                <img src={preview} alt="preview" className="absolute inset-0 h-full w-full object-cover" />
              ) : (
                <div className="text-center">
                  <Upload className="mx-auto h-7 w-7 text-muted-foreground" />
                  <p className="mt-2 text-sm font-medium">Click to upload or drag and drop</p>
                  <p className="text-xs text-muted-foreground">PNG, JPG, WebP - recommended 1600 x 600</p>
                </div>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={(event) => onFile(event.target.files?.[0])} />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Title</Label>
                <Input value={form.title} onChange={(event) => setForm({ ...form, title: event.target.value })} placeholder="Eid Sale - Up to 40% off" />
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Placement</Label>
                <Select value={form.placement} onValueChange={(value) => setForm({ ...form, placement: value })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{PLACEMENTS.map((placement) => <SelectItem key={placement} value={placement}>{placement}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Link type</Label>
                <Select value={form.linkType} onValueChange={(value: LinkType) => setForm({ ...form, linkType: value, linkTarget: "" })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{LINK_TYPES.map((type) => <SelectItem key={type} value={type}>{type}</SelectItem>)}</SelectContent>
                </Select>
              </div>

              <div className="col-span-2 space-y-1.5">
                <Label className="text-xs">Linked target</Label>
                {form.linkType === "External URL" ? (
                  <Input placeholder="https://example.com/promo" value={form.linkTarget} onChange={(event) => setForm({ ...form, linkTarget: event.target.value })} />
                ) : form.linkType === "None" ? (
                  <Input disabled placeholder="No link" />
                ) : (
                  <Select value={form.linkTarget} onValueChange={(value) => setForm({ ...form, linkTarget: value })}>
                    <SelectTrigger><SelectValue placeholder={`Choose ${form.linkType.toLowerCase()}...`} /></SelectTrigger>
                    <SelectContent>{targetOptions.map((option) => <SelectItem key={option} value={option}>{option}</SelectItem>)}</SelectContent>
                  </Select>
                )}
              </div>

              <div className="space-y-1.5">
                <Label className="text-xs">Start date</Label>
                <Input type="date" value={form.startDate} onChange={(event) => setForm({ ...form, startDate: event.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">End date</Label>
                <Input type="date" value={form.endDate} onChange={(event) => setForm({ ...form, endDate: event.target.value })} />
              </div>

              <div className="col-span-2 flex items-center justify-between rounded-lg border bg-muted/20 p-3">
                <div>
                  <p className="text-sm font-medium">Active</p>
                  <p className="text-xs text-muted-foreground">Show this banner immediately on its placement.</p>
                </div>
                <Switch checked={form.active} onCheckedChange={(value) => setForm({ ...form, active: value })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setOpen(false); reset(); }}>Cancel</Button>
            <Button onClick={save}>{editing ? "Save changes" : "Upload banner"}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
