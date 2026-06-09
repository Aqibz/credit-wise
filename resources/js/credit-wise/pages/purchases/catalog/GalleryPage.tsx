import { useMemo, useRef, useState } from "react";
import { AppShell } from "@/components/layout/AppShell";
import { PageHeader, StatCard, ui } from "@/components/ui-kit";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import {
  ImageIcon, Upload, Copy, Check, Trash2, Search, Link as LinkIcon,
  Download, FolderOpen, HardDrive, Eye,
} from "lucide-react";
import { toast } from "sonner";
import { KpiIcon } from "@/components/kpi-icons";
import { UnderlineTab, UnderlineTabBar } from "@/components/ui/underline-tabs";

type GalleryImage = {
  id: string;
  name: string;
  url: string;          // object URL or seeded https URL
  size: number;         // bytes
  type: string;         // mime
  width?: number;
  height?: number;
  uploadedAt: string;
  tag?: string;         // optional category/tag
};

const SEED: GalleryImage[] = [
  { id: "g1", name: "iphone-15-pro.jpg",   url: "https://images.unsplash.com/photo-1696446702183-be5dd8b7d8ba?w=600&q=70", size: 142_000, type: "image/jpeg", width: 1200, height: 1200, uploadedAt: "2026-04-22", tag: "Mobile" },
  { id: "g2", name: "samsung-qled.jpg",    url: "https://images.unsplash.com/photo-1593359677879-a4bb92f829d1?w=600&q=70", size: 188_000, type: "image/jpeg", width: 1200, height: 800,  uploadedAt: "2026-04-20", tag: "TV" },
  { id: "g3", name: "haier-washer.jpg",    url: "https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&q=70", size: 156_000, type: "image/jpeg", width: 1200, height: 1500, uploadedAt: "2026-04-18", tag: "Appliance" },
  { id: "g4", name: "gree-ac.jpg",         url: "https://images.unsplash.com/photo-1631545806609-cc1ddef902bb?w=600&q=70", size: 118_000, type: "image/jpeg", width: 1200, height: 800,  uploadedAt: "2026-04-15", tag: "AC" },
  { id: "g5", name: "sony-headphones.jpg", url: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=70", size: 134_000, type: "image/jpeg", width: 1200, height: 1200, uploadedAt: "2026-04-12", tag: "Audio" },
  { id: "g6", name: "infinix-hot40.jpg",   url: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=70", size: 110_000, type: "image/jpeg", width: 1200, height: 1200, uploadedAt: "2026-04-10", tag: "Mobile" },
];

function fmtBytes(b: number) {
  if (b < 1024) return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
  return `${(b / 1024 / 1024).toFixed(1)} MB`;
}

function GalleryPage() {
  const [images, setImages] = useState<GalleryImage[]>(SEED);
  const [q, setQ] = useState("");
  const [tagFilter, setTagFilter] = useState<string>("All");
  const [preview, setPreview] = useState<GalleryImage | null>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);

  const tags = useMemo(
    () => ["All", ...Array.from(new Set(images.map((i) => i.tag).filter(Boolean) as string[]))],
    [images],
  );

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return images.filter((img) => {
      if (tagFilter !== "All" && img.tag !== tagFilter) return false;
      if (needle && !img.name.toLowerCase().includes(needle)) return false;
      return true;
    });
  }, [images, q, tagFilter]);

  const totals = useMemo(() => {
    const size = images.reduce((s, i) => s + i.size, 0);
    return { count: images.length, size, tags: tags.length - 1 };
  }, [images, tags]);

  function ingest(files: FileList | File[]) {
    const arr = Array.from(files);
    const accepted = arr.filter((f) => f.type.startsWith("image/"));
    if (accepted.length === 0) {
      toast.error("Only image files supported");
      return;
    }
    const fresh: GalleryImage[] = accepted.map((f, idx) => ({
      id: `g${Date.now()}-${idx}`,
      name: f.name,
      url: URL.createObjectURL(f),
      size: f.size,
      type: f.type,
      uploadedAt: new Date().toISOString().slice(0, 10),
      tag: "Uploaded",
    }));
    setImages((p) => [...fresh, ...p]);
    toast.success(`${accepted.length} image${accepted.length > 1 ? "s" : ""} uploaded`);
  }

  function copyUrl(img: GalleryImage) {
    navigator.clipboard.writeText(img.url).then(() => {
      setCopiedId(img.id);
      toast.success("URL copied to clipboard");
      setTimeout(() => setCopiedId(null), 1200);
    });
  }

  function shareUrl(img: GalleryImage) {
    if (typeof navigator !== "undefined" && (navigator as { share?: (d: { url: string; title?: string }) => Promise<void> }).share) {
      (navigator as { share: (d: { url: string; title?: string }) => Promise<void> })
        .share({ url: img.url, title: img.name })
        .catch(() => copyUrl(img));
    } else {
      copyUrl(img);
    }
  }

  function removeImg(id: string) {
    setImages((p) => p.filter((x) => x.id !== id));
    toast.success("Image removed");
  }

  return (
    <AppShell>
      <PageHeader
        title="Image Gallery"
        description="Upload product images and share their URLs across the catalog, website and mobile app."
        actions={
          <div className="flex items-center gap-2">
            <Button size="sm" className="gap-2" onClick={() => fileRef.current?.click()}>
              <Upload className="w-4 h-4" /> Upload Images
            </Button>
            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              multiple
              hidden
              onChange={(e) => e.target.files && ingest(e.target.files)}
            />
          </div>
        }
      />

      {/* KPIs */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
        <StatCard label="Images"        value={totals.count}         hint="In the gallery"        icon={<KpiIcon icon={ImageIcon} />}  tone="primary" />
        <StatCard label="Storage"       value={fmtBytes(totals.size)} hint="Total size"            icon={<KpiIcon icon={HardDrive} />}  tone="primary" />
        <StatCard label="Categories"    value={totals.tags}          hint="Tags used"             icon={<KpiIcon icon={FolderOpen} />} tone="warning" />
        <StatCard label="Shareable"     value={totals.count}         hint="Each image has a URL"  icon={<KpiIcon icon={LinkIcon} />}   tone="success" />
      </div>

      {/* Tabs + Search */}
      <div className="mb-3 flex items-end justify-between gap-3 flex-wrap">
        <UnderlineTabBar className="flex-1 min-w-0 overflow-x-auto">
          {tags.map((t) => (
            <UnderlineTab key={t} active={tagFilter === t} onClick={() => setTagFilter(t)}>
              {t}
            </UnderlineTab>
          ))}
        </UnderlineTabBar>
        <div className="relative w-full sm:w-56 shrink-0">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search…"
            className="h-8 pl-8 text-[12px]"
          />
        </div>
      </div>

      {/* Drop zone */}
      <div
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragOver(false);
          if (e.dataTransfer.files.length) ingest(e.dataTransfer.files);
        }}
        className={`rounded-lg border-2 border-dashed p-6 text-center mb-4 transition ${
          dragOver ? "border-primary bg-primary/5" : "border-border bg-muted/20"
        }`}
      >
        <Upload className="w-8 h-8 mx-auto text-muted-foreground" />
        <p className="text-sm font-medium mt-2">Drop images here to upload</p>
        <p className="text-[11px] text-muted-foreground">or click "Upload Images" above. JPG, PNG, WEBP supported.</p>
      </div>

      {/* Grid */}
      {filtered.length === 0 ? (
        <div className="rounded-lg border border-border bg-card p-10 text-center text-muted-foreground text-sm">
          No images match your filters.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-3">
          {filtered.map((img) => (
            <div key={img.id} className="group rounded-lg border border-border bg-card overflow-hidden hover:shadow-md transition">
              <button
                type="button"
                onClick={() => setPreview(img)}
                className="block w-full aspect-square bg-muted/40 overflow-hidden"
              >
                <img
                  src={img.url}
                  alt={img.name}
                  loading="lazy"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                />
              </button>
              <div className="p-2">
                <div className="flex items-start justify-between gap-1">
                  <div className="min-w-0 flex-1">
                    <div className="text-[12px] font-medium truncate" title={img.name}>{img.name}</div>
                    <div className="text-[10px] text-muted-foreground">{fmtBytes(img.size)} · {img.uploadedAt}</div>
                  </div>
                  {img.tag && <Badge variant="outline" className="text-[10px] shrink-0">{img.tag}</Badge>}
                </div>
                <div className="mt-2 grid grid-cols-4 gap-1">
                  <Button variant="ghost" size="sm" className="h-7 px-0" onClick={() => setPreview(img)} title="Preview">
                    <Eye className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-0" onClick={() => copyUrl(img)} title="Copy URL">
                    {copiedId === img.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-0" onClick={() => shareUrl(img)} title="Share">
                    <LinkIcon className="w-3.5 h-3.5" />
                  </Button>
                  <Button variant="ghost" size="sm" className="h-7 px-0 text-destructive" onClick={() => removeImg(img.id)} title="Delete">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Preview Dialog */}
      <Dialog open={!!preview} onOpenChange={(o) => !o && setPreview(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 truncate">
              <ImageIcon className="w-5 h-5 text-primary" /> {preview?.name}
            </DialogTitle>
          </DialogHeader>
          {preview && (
            <div className="space-y-3">
              <div className="rounded-lg overflow-hidden bg-muted/40 max-h-[60vh] flex items-center justify-center">
                <img src={preview.url} alt={preview.name} className="max-h-[60vh] object-contain" />
              </div>
              <div className="grid grid-cols-3 gap-2 text-[11px] text-muted-foreground">
                <div><span className="block text-[10px] uppercase">Size</span><span className="text-foreground font-medium">{fmtBytes(preview.size)}</span></div>
                <div><span className="block text-[10px] uppercase">Type</span><span className="text-foreground font-medium">{preview.type}</span></div>
                <div><span className="block text-[10px] uppercase">Uploaded</span><span className="text-foreground font-medium">{preview.uploadedAt}</span></div>
              </div>
              <div>
                <label className={`${ui.textKpiLabel} text-[10px] block mb-1`}>Public URL</label>
                <div className="flex items-center gap-1.5">
                  <Input readOnly value={preview.url} className="h-8 text-[11px] font-mono" />
                  <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => copyUrl(preview)}>
                    {copiedId === preview.id ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                    Copy
                  </Button>
                  <Button size="sm" variant="outline" className="gap-1.5 shrink-0" onClick={() => shareUrl(preview)}>
                    <LinkIcon className="w-3.5 h-3.5" /> Share
                  </Button>
                  <a href={preview.url} download={preview.name} className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-border bg-card text-[12px] font-medium hover:bg-muted">
                    <Download className="w-3.5 h-3.5" /> Download
                  </a>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </AppShell>
  );
}

export { GalleryPage };

