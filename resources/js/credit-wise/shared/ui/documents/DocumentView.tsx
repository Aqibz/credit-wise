import { useEffect, useState } from "react";
import { useNavigate } from "@/shared/navigation";
import { X, Printer, Download, Pencil, Trash2, Share2, ShoppingCart, MoreHorizontal, CalendarClock, CheckCircle2, PackageCheck, Lock, XCircle, Ban, Copy, Truck, ClipboardCheck, AlertTriangle, Wallet, BookOpen, FileText, CreditCard } from "lucide-react";
import { DocumentPreview, DocConfig } from "@/components/DocumentWizard";
import { ExpectedDeliveryDialog } from "@/components/ExpectedDeliveryDialog";
import { useToast } from "@/components/Toaster";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";

export function DocumentView({
  cfg, doc, onClose, onEdit, onDelete, onStatusChange, onSetExpectedDelivery,
}: {
  cfg: DocConfig;
  doc: any;
  onClose: () => void;
  onEdit?: () => void;
  onDelete?: () => void;
  onStatusChange?: (status: string) => void;
  onSetExpectedDelivery?: (payload: { date: string; notes: string }) => void;
}) {
  const toast = useToast();
  const navigate = useNavigate();
  const [edDialogOpen, setEdDialogOpen] = useState(false);

  function goRecordPayment() {
    navigate({
      to: "/purchases/payments/new",
      search: { vendor: doc.supplier, bill: doc.ref },
    });
    onClose();
  }

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  const normalized = normalize(doc);

  function downloadJSON() {
    const blob = new Blob([JSON.stringify(normalized, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${doc.ref || cfg.refPrefix + (doc.id || "doc")}.json`;
    document.body.appendChild(a); a.click(); a.remove();
    URL.revokeObjectURL(url);
    toast.success("Downloaded", `${doc.ref || cfg.title} saved as JSON.`);
  }

  async function share() {
    const shareUrl = `${window.location.origin}${window.location.pathname}#${encodeURIComponent(doc.ref || doc.id)}`;
    const shareData = { title: `${cfg.title} ${doc.ref || ""}`.trim(), text: `${cfg.title} - ${doc.ref || ""}`.trim(), url: shareUrl };
    try {
      if (typeof navigator !== "undefined" && (navigator as any).share) {
        await (navigator as any).share(shareData);
        return;
      }
      await navigator.clipboard.writeText(shareUrl);
      toast.success("Link copied", "Share link copied to clipboard.");
    } catch {
      // user cancelled - no-op
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex print:static print:block" role="dialog" aria-modal="true" aria-label={`${cfg.title} ${doc.ref ?? ""}`}>
      {/* Backdrop */}
      <div className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm animate-fade-in print:hidden" onClick={onClose} />

      {/* Right-side canvas */}
      <aside
        onClick={(e) => e.stopPropagation()}
        className="ml-auto relative h-full w-full sm:w-[640px] lg:w-[760px] bg-white shadow-[0_20px_60px_-20px_rgba(15,23,42,0.45)] flex flex-col animate-[slideInRight_280ms_cubic-bezier(0.22,1,0.36,1)_both] print:w-full print:shadow-none"
      >
        {/* Header */}
        <div className="flex items-center justify-between gap-3 px-5 py-3 border-b border-slate-200 bg-gradient-to-r from-slate-50 to-white print:hidden">
          <div className="min-w-0">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">{cfg.title}</div>
            <div className="text-sm font-semibold text-slate-800 truncate">
              {doc.ref}
              {doc.date && <span className="ml-2 text-xs font-medium text-slate-500">{doc.date}{doc.time ? ` - ${doc.time}` : ""}</span>}
            </div>
          </div>
          <div className="flex items-center gap-1.5 shrink-0">
            {onEdit && (
              <button onClick={onEdit} title="Edit"
                className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Pencil className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Edit</span>
              </button>
            )}
            <button onClick={() => window.print()} title="Print / Save PDF"
              className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Printer className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Print</span>
            </button>
            <button onClick={downloadJSON} title="Download"
              className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
              <Download className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Download</span>
            </button>
            {cfg.title === "Supplier Bill / Invoice" ? (
              <button
                onClick={goRecordPayment}
                title="Record Payment"
                className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
              >
                <Wallet className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Record Payment</span>
              </button>
            ) : (
              <button onClick={share} title="Share"
                className="h-9 px-2.5 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-xs font-semibold text-slate-700 hover:bg-slate-50">
                <Share2 className="h-3.5 w-3.5" /> <span className="hidden sm:inline">Share</span>
              </button>
            )}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button title="More actions"
                  className="h-9 w-9 grid place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50">
                  <MoreHorizontal className="h-4 w-4" />
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                {cfg.title === "Purchase Order" && (
                  <DropdownMenuItem
                    onSelect={(e) => { e.preventDefault(); setEdDialogOpen(true); }}
                    className="bg-primary text-primary-foreground focus:bg-primary/90 focus:text-primary-foreground font-semibold"
                  >
                    <CalendarClock className="h-4 w-4" /> Expected Delivery Date
                  </DropdownMenuItem>
                )}
                {onStatusChange && cfg.title === "Goods Received Note" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Update Status</DropdownMenuLabel>
                    {doc.status !== "In Transit" && (
                      <DropdownMenuItem onClick={() => onStatusChange("In Transit")}>
                        <Truck className="h-4 w-4 text-blue-600" /> Mark as In Transit
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Pending QC" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Pending QC")}>
                        <ClipboardCheck className="h-4 w-4 text-amber-600" /> Mark as Pending QC
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Partially Received" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Partially Received")}>
                        <PackageCheck className="h-4 w-4 text-amber-600" /> Mark as Partially Received
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Received" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Received")}>
                        <PackageCheck className="h-4 w-4 text-emerald-600" /> Mark as Received
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Disputed" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange("Disputed")}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <AlertTriangle className="h-4 w-4" /> Mark as Disputed
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Closed" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Closed")}>
                        <Lock className="h-4 w-4 text-muted-foreground" /> Close GRN
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Draft" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange("Draft")}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <XCircle className="h-4 w-4" /> Revert to Draft
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {onStatusChange && (cfg.title === "Purchase Return" || cfg.title === "Sales Return") && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Update Status</DropdownMenuLabel>
                    {doc.status !== "Draft" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Draft")}>
                        <Pencil className="h-4 w-4 text-muted-foreground" /> Mark as Draft
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Pending" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Pending")}>
                        <ClipboardCheck className="h-4 w-4 text-amber-600" /> Mark as Pending
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Approved" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Approved")}>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Mark as Approved
                      </DropdownMenuItem>
                    )}
                    {cfg.title === "Sales Return" && doc.status !== "Refunded" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Refunded")}>
                        <PackageCheck className="h-4 w-4 text-emerald-600" /> Mark as Refunded
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Rejected" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange("Rejected")}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <XCircle className="h-4 w-4" /> Mark as Rejected
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {cfg.title === "Supplier Bill / Invoice" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Bill Actions</DropdownMenuLabel>
                    <DropdownMenuItem onClick={goRecordPayment}>
                      <Wallet className="h-4 w-4 text-primary" /> Record Payment
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Use Credits", `Apply available supplier credits to ${doc.ref}.`)}>
                      <CreditCard className="h-4 w-4 text-emerald-600" /> Use Credits
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => toast.success("Journal", `Viewing journal entries for ${doc.ref}.`)}>
                      <BookOpen className="h-4 w-4 text-slate-600" /> View Journal
                    </DropdownMenuItem>
                    {onStatusChange && doc.status !== "Draft" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Draft")}>
                        <FileText className="h-4 w-4 text-muted-foreground" /> Convert to Draft
                      </DropdownMenuItem>
                    )}
                    {onStatusChange && doc.status !== "Cancelled" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange("Cancelled")}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Ban className="h-4 w-4" /> Void Bill
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                {onStatusChange && cfg.title !== "Goods Received Note" && cfg.title !== "Purchase Return" && cfg.title !== "Sales Return" && cfg.title !== "Supplier Bill / Invoice" && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuLabel className="text-[10px] uppercase tracking-wider text-muted-foreground font-bold">Update Status</DropdownMenuLabel>
                    {doc.status !== "Approved" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Approved")}>
                        <CheckCircle2 className="h-4 w-4 text-emerald-600" /> Mark as Approved
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Received" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Received")}>
                        <PackageCheck className="h-4 w-4 text-emerald-600" /> Mark as Received
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Closed" && (
                      <DropdownMenuItem onClick={() => onStatusChange("Closed")}>
                        <Lock className="h-4 w-4 text-muted-foreground" /> Close PO
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Cancelled" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange("Cancelled")}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <XCircle className="h-4 w-4" /> Mark as Cancelled
                      </DropdownMenuItem>
                    )}
                    {doc.status !== "Void" && (
                      <DropdownMenuItem
                        onClick={() => onStatusChange("Void")}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                      >
                        <Ban className="h-4 w-4" /> Mark as Void
                      </DropdownMenuItem>
                    )}
                  </>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => toast.success("Cloned", `${doc.ref} duplicated as draft.`)}>
                  <Copy className="h-4 w-4" /> Clone
                </DropdownMenuItem>
                {onDelete && (
                  <>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={onDelete}
                      className="text-destructive focus:bg-destructive/10 focus:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" /> Delete
                    </DropdownMenuItem>
                  </>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
            <button onClick={onClose} title="Close"
              className="h-9 w-9 grid place-items-center rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-5 bg-slate-100/40 space-y-4">
          {cfg.title === "Purchase Order" && (
            <div className="rounded-xl border border-slate-200 bg-white p-4 flex items-center gap-4 print:hidden">
              <div className="h-10 w-10 shrink-0 rounded-lg bg-slate-100 grid place-items-center text-slate-600">
                <ShoppingCart className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-slate-800">Complete Your Purchase</div>
                <div className="text-xs text-slate-500 mt-0.5">You can create bills and receives (in any sequence) with this order to complete your purchase.</div>
              </div>
              <button
                type="button"
                className="shrink-0 h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90"
              >
                Convert to Bill
              </button>
            </div>
          )}
          <DocumentPreview cfg={cfg} doc={normalized} />
        </div>
      </aside>

      <ExpectedDeliveryDialog
        open={edDialogOpen}
        onOpenChange={setEdDialogOpen}
        initialDate={doc.expectedDelivery}
        initialNotes={doc.expectedDeliveryNotes}
        onSave={(payload) => {
          onSetExpectedDelivery?.(payload);
          toast.success("Expected delivery saved", payload.date);
        }}
      />
    </div>
  );
}

/** Make legacy single-amount records render nicely as one-line documents */
function normalize(doc: any) {
  if (Array.isArray(doc.items) && doc.items.length > 0) return doc;
  const fallback = [{
    id: "1",
    product: doc.product || doc.description || doc.category || doc.notes?.split("\n")[0] || "Item",
    description: doc.reason || doc.vendor || "",
    qty: Number(doc.qty || 1),
    rate: Number(doc.amount || 0) / Math.max(1, Number(doc.qty || 1)),
    discount: 0,
    tax: 0,
  }];
  const sub = Number(doc.amount || 0);
  return {
    ...doc,
    items: fallback,
    subTotal: sub, totalDisc: 0, totalTax: 0, shipping: 0, grand: sub,
    party: doc.supplier || doc.customer || doc.vendor || doc.party,
  };
}
