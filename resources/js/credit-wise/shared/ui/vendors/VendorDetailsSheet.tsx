import { useEffect, useMemo } from "react";
import { Link } from "@/shared/navigation";
import {
  X, ExternalLink, Building2, Mail, Phone, MapPin, FileText, Wallet,
  CalendarClock, Hash, BadgeCheck, AlertTriangle, CreditCard, Globe2,
  Navigation,
} from "lucide-react";
import { useEntityStore } from "@/lib/state/useEntityStore";
import { suppliersConfig } from "@/lib/entities";
import { fmtPKR as Rs } from "@/lib/formatters/currency";

type Props = {
  open: boolean;
  vendorName: string;
  onClose: () => void;
};

export function VendorDetailsSheet({ open, vendorName, onClose }: Props) {
  const { items: suppliers } = useEntityStore<any>(
    suppliersConfig.storageKey,
    suppliersConfig.seed as any,
  );
  const { items: bills } = useEntityStore<any>("qcrm.bills", []);
  const { items: payments } = useEntityStore<any>("qcrm.payments", []);

  const vendor = useMemo(
    () => suppliers.find((s: any) => s?.name === vendorName),
    [suppliers, vendorName],
  );

  const stats = useMemo(() => {
    const vendorBills = bills.filter((b: any) => b?.supplier === vendorName);
    const outstanding = vendorBills
      .filter((b: any) => !["Paid", "Cancelled", "Draft"].includes(b.status))
      .reduce((s: number, b: any) => s + (Number(b.amount || 0) - Number(b.paid || 0)), 0);
    const overdue = vendorBills.filter((b: any) => b.status === "Overdue").length;
    const paidYTD = payments
      .filter((p: any) => p?.supplier === vendorName)
      .reduce((s: number, p: any) => s + Number(p.amount || 0), 0);
    return { totalBills: vendorBills.length, outstanding, overdue, paidYTD };
  }, [bills, payments, vendorName]);

  // Lock body scroll while open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [open, onClose]);

  if (!open) return null;

  const initial = (vendorName || "?").trim().charAt(0).toUpperCase();

  return (
    <div className="fixed inset-0 z-[60]">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/50 animate-in fade-in-0"
        onClick={onClose}
      />

      {/* Side canvas */}
      <aside
        role="dialog"
        aria-label="Vendor details"
        className="absolute right-0 top-0 h-full w-full sm:w-[480px] lg:w-[560px] bg-background shadow-2xl border-l border-border flex flex-col animate-in slide-in-from-right duration-200"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-border bg-card">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className="h-12 w-12 rounded-lg bg-muted text-foreground grid place-items-center text-lg font-bold shrink-0">
                {initial}
              </div>
              <div className="min-w-0">
                <div className="text-xs font-medium text-muted-foreground">Vendor</div>
                <div className="flex items-center gap-1.5 min-w-0">
                  <h2 className="text-xl font-bold text-foreground truncate">
                    {vendorName || "â€”"}
                  </h2>
                  {vendor && (
                    <Link
                      to="/purchases/suppliers/$supplierId"
                      params={{ supplierId: String(vendor.id) }}
                      onClick={onClose}
                      className="text-primary hover:opacity-80"
                      title="Open vendor profile"
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Link>
                  )}
                </div>
                {vendor?.code && (
                  <div className="text-xs text-muted-foreground font-medium mt-0.5">
                    {vendor.code} Â· {vendor.category || "â€”"}
                  </div>
                )}
              </div>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground rounded-md p-1 -mr-1"
              aria-label="Close"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto">
          {!vendor ? (
            <div className="p-8 text-center">
              <div className="mx-auto h-10 w-10 rounded-full bg-muted grid place-items-center mb-2">
                <AlertTriangle className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="text-sm font-semibold text-foreground">Vendor not found</p>
              <p className="text-xs text-muted-foreground mt-1">
                "{vendorName}" is not in your supplier directory yet.
              </p>
            </div>
          ) : (
            <div className="p-6 space-y-6">
              {/* KPI cards */}
              <div className="grid grid-cols-2 gap-3">
                <KpiCard
                  icon={<AlertTriangle className="h-4 w-4" />}
                  label="Outstanding"
                  value={Rs(stats.outstanding || vendor.balance || 0)}
                  tone="warning"
                />
                <KpiCard
                  icon={<BadgeCheck className="h-4 w-4" />}
                  label="Total Paid"
                  value={Rs(stats.paidYTD)}
                  tone="success"
                />
                <KpiCard
                  icon={<FileText className="h-4 w-4" />}
                  label="Bills"
                  value={String(stats.totalBills)}
                  tone="primary"
                />
                <KpiCard
                  icon={<CalendarClock className="h-4 w-4" />}
                  label="Overdue"
                  value={String(stats.overdue)}
                  tone={stats.overdue > 0 ? "danger" : "muted"}
                />
              </div>

              {/* Contact */}
              <Section title="Contact Details">
                <Field icon={<Building2 />} label="Supplier Type" value={vendor.type} />
                <Field icon={<Wallet />} label="Currency" value="Rs. (PKR)" />
                <Field icon={<CreditCard />} label="Payment Terms" value={vendor.paymentTerms} />
                <Field icon={<Phone />} label="Phone" value={vendor.phone} />
                <Field icon={<Mail />} label="Email" value={vendor.email} />
                <Field
                  icon={<BadgeCheck />}
                  label="Status"
                  value={
                    <span
                      className={`inline-flex items-center px-2 py-0.5 rounded-full text-[11px] font-semibold ${
                        vendor.status === "Active"
                          ? "bg-success/15 text-success"
                          : "bg-muted text-muted-foreground"
                      }`}
                    >
                      {vendor.status || "â€”"}
                    </span>
                  }
                />
              </Section>

              {/* Tax */}
              <Section title="Tax Information">
                <Field icon={<Hash />} label="NTN" value={vendor.ntn} />
                <Field icon={<Hash />} label="STRN" value={vendor.strn} />
                <Field icon={<Globe2 />} label="Origin" value={vendor.type === "Import" ? "International" : "Local"} />
                <Field
                  icon={<CalendarClock />}
                  label="Last Bill"
                  value={vendor.lastBillDate || "â€”"}
                />
              </Section>

              {/* Address */}
              <Section title="Address">
                <div className="space-y-3">
                  <div className="flex items-start gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
                    <div className="space-y-1.5 flex-1 min-w-0">
                      <div>
                        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Billing</span>
                        <div className="text-sm text-foreground font-medium break-words">
                          {vendor.billingAddress ? (
                            <>
                              {vendor.billingAddress}
                              {vendor.city && <span className="text-muted-foreground">, {vendor.city}</span>}
                              {vendor.country && <span className="text-muted-foreground">, {vendor.country}</span>}
                            </>
                          ) : (
                            <span className="text-muted-foreground">â€”</span>
                          )}
                        </div>
                      </div>
                      {!vendor.sameAddress && vendor.shippingAddress && (
                        <div>
                          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">Shipping</span>
                          <div className="text-sm text-foreground font-medium break-words">{vendor.shippingAddress}</div>
                        </div>
                      )}
                      {vendor.sameAddress && vendor.billingAddress && (
                        <div className="text-xs text-muted-foreground italic">Shipping address same as billing</div>
                      )}
                      {vendor.mapsLink && (
                        <a
                          href={vendor.mapsLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-xs text-primary hover:underline font-medium"
                        >
                          <Navigation className="h-3 w-3" /> Open in Maps
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </Section>
            </div>
          )}
        </div>

        {/* Footer */}
        {vendor && (
          <div className="px-6 py-4 border-t border-border bg-card flex items-center justify-between gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-md text-sm font-semibold text-foreground hover:bg-muted"
            >
              Close
            </button>
            <Link
              to="/purchases/suppliers/$supplierId"
              params={{ supplierId: String(vendor.id) }}
              onClick={onClose}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90"
            >
              View Full Profile <ExternalLink className="h-3.5 w-3.5" />
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-border bg-card overflow-hidden">
      <div className="px-4 py-3 border-b border-border">
        <h3 className="text-sm font-bold text-foreground">{title}</h3>
      </div>
      <div className="p-4 space-y-3">{children}</div>
    </div>
  );
}

function Field({
  icon, label, value,
}: { icon?: React.ReactNode; label: string; value?: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[140px_1fr] gap-3 items-start text-sm">
      <div className="inline-flex items-center gap-2 text-muted-foreground font-medium">
        {icon && <span className="[&>svg]:h-3.5 [&>svg]:w-3.5">{icon}</span>}
        {label}
      </div>
      <div className="text-foreground font-medium break-words">{value || <span className="text-muted-foreground">â€”</span>}</div>
    </div>
  );
}

function KpiCard({
  icon, label, value, tone,
}: {
  icon: React.ReactNode; label: string; value: string;
  tone: "primary" | "success" | "warning" | "danger" | "muted";
}) {
  const toneCls = {
    primary: "bg-primary/10 text-primary",
    success: "bg-success/15 text-success",
    warning: "bg-warning/15 text-warning",
    danger: "bg-destructive/15 text-destructive",
    muted: "bg-muted text-muted-foreground",
  }[tone];
  return (
    <div className="rounded-xl border border-border bg-card p-3">
      <div className="flex items-center gap-2">
        <span className={`h-7 w-7 rounded-md grid place-items-center ${toneCls}`}>{icon}</span>
        <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">{label}</span>
      </div>
      <div className="mt-2 text-lg font-bold text-foreground tabular-nums">{value}</div>
    </div>
  );
}
