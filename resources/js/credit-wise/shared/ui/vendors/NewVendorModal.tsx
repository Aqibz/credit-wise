import { useState } from "react";
import type { ReactNode } from "react";
import { Mail, UploadCloud, ChevronDown, Globe } from "lucide-react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { CountryCodePhoneInput } from "@/shared/ui/primitives/country-code-phone-input";

const SALUTATIONS = ["Mr.", "Mrs.", "Ms.", "Dr.", "Prof."];
const PAYMENT_TERMS = ["Due on Receipt", "Net 7", "Net 15", "Net 30", "Net 45", "Net 60", "Net 90", "Advance", "COD"];
const LANGUAGES = ["English", "Urdu", "Arabic", "French"];

type VendorPayload = {
  salutation: string; firstName: string; lastName: string;
  companyName: string; displayName: string; email: string;
  workPhone: string; mobile: string;
  openingBalance: string; paymentTerms: string;
  enablePortal: boolean; portalLanguage: string;
  documents: File[];
  // Address
  billingStreet: string; billingCity: string; billingState: string; billingCountry: string; billingZip: string;
  // Remarks
  remarks: string;
  // Add more details
  websiteUrl: string; department: string; designation: string;
  twitter: string; skype: string; facebook: string;
};

const empty: VendorPayload = {
  salutation: "", firstName: "", lastName: "",
  companyName: "", displayName: "", email: "",
  workPhone: "", mobile: "",
  openingBalance: "", paymentTerms: "Due on Receipt",
  enablePortal: false, portalLanguage: "English",
  documents: [],
  billingStreet: "", billingCity: "", billingState: "", billingCountry: "Pakistan", billingZip: "",
  remarks: "",
  websiteUrl: "", department: "", designation: "",
  twitter: "", skype: "", facebook: "",
};

export function NewVendorModal({
  open, onOpenChange, onCreate,
}: {
  open: boolean;
  onOpenChange: (o: boolean) => void;
  onCreate: (displayName: string, payload: VendorPayload) => void;
}) {
  const [v, setV] = useState<VendorPayload>(empty);
  const [tab, setTab] = useState<"other" | "address" | "remarks">("other");
  const [showMore, setShowMore] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function set<K extends keyof VendorPayload>(k: K, val: VendorPayload[K]) {
    setV((p) => ({ ...p, [k]: val }));
  }

  function reset() {
    setV(empty); setTab("other"); setShowMore(false); setError(null);
  }

  function handleSave() {
    const dn = v.displayName.trim();
    if (!dn) { setError("Vendor Display Name is required"); return; }
    onCreate(dn, v);
    reset();
    onOpenChange(false);
  }

  function handleCancel() {
    reset();
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) reset(); onOpenChange(o); }}>
      <DialogContent className="max-w-4xl p-0 gap-0 max-h-[92vh] flex flex-col">
        <DialogHeader className="px-6 py-4 border-b border-border bg-muted/30 shrink-0">
          <DialogTitle className="text-base font-semibold">New Vendor</DialogTitle>
        </DialogHeader>

        <div className="overflow-y-auto px-6 py-5 space-y-5 flex-1">
          {/* Top fields */}
          <FieldRow label="Primary Contact">
            <div className="grid grid-cols-3 gap-3">
              <Select value={v.salutation} onChange={(x) => set("salutation", x)} options={SALUTATIONS} placeholder="Salutation" />
              <Input value={v.firstName} onChange={(x) => set("firstName", x)} placeholder="First Name" />
              <Input value={v.lastName} onChange={(x) => set("lastName", x)} placeholder="Last Name" />
            </div>
          </FieldRow>

          <FieldRow label="Company Name">
            <Input value={v.companyName} onChange={(x) => set("companyName", x)} />
          </FieldRow>

          <FieldRow label="Vendor Display Name" required>
            <Input value={v.displayName} onChange={(x) => set("displayName", x)} />
          </FieldRow>

          <FieldRow label="Vendor Email">
            <div className="relative">
              <Mail className="h-4 w-4 text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={v.email}
                onChange={(e) => set("email", e.target.value)}
                className="h-10 w-full pl-9 pr-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
              />
            </div>
          </FieldRow>

          <FieldRow label="Vendor Phone">
            <div className="grid grid-cols-2 gap-3">
              <CountryCodePhoneInput value={v.workPhone} onChange={(x) => set("workPhone", x)} placeholder="Work Phone" />
              <CountryCodePhoneInput value={v.mobile} onChange={(x) => set("mobile", x)} placeholder="Mobile" />
            </div>
          </FieldRow>

          {/* Tabs */}
          <div className="border-b border-border flex items-center gap-6 pt-3">
            {[
              { id: "other", label: "Other Details" },
              { id: "address", label: "Address" },
              { id: "remarks", label: "Remarks" },
            ].map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setTab(t.id as typeof tab)}
                className={`pb-2 text-sm font-medium border-b-2 -mb-px transition-colors ${
                  tab === t.id ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === "other" && (
            <div className="space-y-5 pt-1">
              <FieldRow label="Opening Balance">
                <div className="flex">
                  <span className="h-10 px-3 inline-flex items-center rounded-l-md border border-r-0 border-border bg-muted text-xs font-semibold text-muted-foreground">PKR</span>
                  <input
                    type="number"
                    value={v.openingBalance}
                    onChange={(e) => set("openingBalance", e.target.value)}
                    className="h-10 flex-1 px-3 rounded-r-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                  />
                </div>
              </FieldRow>

              <FieldRow label="Payment Terms">
                <Select value={v.paymentTerms} onChange={(x) => set("paymentTerms", x)} options={PAYMENT_TERMS} />
              </FieldRow>

              <FieldRow label="Enable Portal?">
                <label className="inline-flex items-center gap-2 text-sm cursor-pointer">
                  <input
                    type="checkbox"
                    checked={v.enablePortal}
                    onChange={(e) => set("enablePortal", e.target.checked)}
                    className="h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  />
                  <span className="text-foreground">Allow portal access for this vendor</span>
                </label>
              </FieldRow>

              {v.enablePortal && (
                <FieldRow label="Portal Language">
                  <Select value={v.portalLanguage} onChange={(x) => set("portalLanguage", x)} options={LANGUAGES} />
                </FieldRow>
              )}

              <FieldRow label="Documents">
                <div>
                  <label className="inline-flex items-center gap-2 h-9 px-3 rounded-md border border-border bg-card text-sm font-medium cursor-pointer hover:bg-muted">
                    <UploadCloud className="h-4 w-4 text-muted-foreground" /> Upload File
                    <input
                      type="file"
                      multiple
                      className="hidden"
                      onChange={(e) => {
                        const files = Array.from(e.target.files ?? []).slice(0, 10 - v.documents.length);
                        const valid = files.filter((f) => f.size <= 10 * 1024 * 1024);
                        set("documents", [...v.documents, ...valid]);
                      }}
                    />
                  </label>
                  <p className="mt-1 text-xs text-muted-foreground">You can upload a maximum of 10 files, 10MB each</p>
                  {v.documents.length > 0 && (
                    <ul className="mt-2 space-y-1 text-xs text-foreground">
                      {v.documents.map((f, i) => (
                        <li key={i} className="flex items-center justify-between gap-3 rounded border border-border bg-muted/30 px-2 py-1">
                          <span className="truncate">{f.name}</span>
                          <button
                            type="button"
                            onClick={() => set("documents", v.documents.filter((_, j) => j !== i))}
                            className="text-destructive hover:underline text-xs font-semibold"
                          >
                            Remove
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </FieldRow>

              {!showMore && (
                <button
                  type="button"
                  onClick={() => setShowMore(true)}
                  className="text-sm font-semibold text-primary hover:underline"
                >
                  Add more details
                </button>
              )}

              {showMore && (
                <div className="space-y-5 pt-2">
                  <FieldRow label="Website URL">
                    <PrefixInput icon={<Globe className="h-3.5 w-3.5" />} value={v.websiteUrl} onChange={(x) => set("websiteUrl", x)} placeholder="ex: www.zylker.com" />
                  </FieldRow>
                  <FieldRow label="Department">
                    <Input value={v.department} onChange={(x) => set("department", x)} />
                  </FieldRow>
                  <FieldRow label="Designation">
                    <Input value={v.designation} onChange={(x) => set("designation", x)} />
                  </FieldRow>
                  <FieldRow label="Twitter">
                    <div>
                      <PrefixInput icon={<span className="text-xs font-bold">𝕏</span>} value={v.twitter} onChange={(x) => set("twitter", x)} />
                      <p className="mt-1 text-xs text-muted-foreground">http://www.twitter.com/</p>
                    </div>
                  </FieldRow>
                  <FieldRow label="Skype Name/Number">
                    <PrefixInput icon={<span className="text-xs font-bold text-sky-600">S</span>} value={v.skype} onChange={(x) => set("skype", x)} />
                  </FieldRow>
                  <FieldRow label="Facebook">
                    <div>
                      <PrefixInput icon={<span className="text-xs font-bold text-blue-600">f</span>} value={v.facebook} onChange={(x) => set("facebook", x)} />
                      <p className="mt-1 text-xs text-muted-foreground">http://www.facebook.com/</p>
                    </div>
                  </FieldRow>
                </div>
              )}
            </div>
          )}

          {tab === "address" && (
            <div className="space-y-5 pt-1">
              <FieldRow label="Street">
                <Input value={v.billingStreet} onChange={(x) => set("billingStreet", x)} />
              </FieldRow>
              <FieldRow label="City">
                <Input value={v.billingCity} onChange={(x) => set("billingCity", x)} />
              </FieldRow>
              <FieldRow label="State / Province">
                <Input value={v.billingState} onChange={(x) => set("billingState", x)} />
              </FieldRow>
              <FieldRow label="ZIP / Postal Code">
                <Input value={v.billingZip} onChange={(x) => set("billingZip", x)} />
              </FieldRow>
              <FieldRow label="Country">
                <Input value={v.billingCountry} onChange={(x) => set("billingCountry", x)} />
              </FieldRow>
            </div>
          )}

          {tab === "remarks" && (
            <div className="pt-1">
              <FieldRow label="Remarks">
                <textarea
                  value={v.remarks}
                  onChange={(e) => set("remarks", e.target.value)}
                  rows={4}
                  className="w-full px-3 py-2 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
                />
              </FieldRow>
            </div>
          )}
        </div>

        <DialogFooter className="px-6 py-3 border-t border-border bg-background flex items-center justify-between sm:justify-between gap-3 shrink-0">
          <span className="text-xs text-destructive font-medium">{error}</span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleSave}
              className="h-9 px-4 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90"
            >
              Save
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="h-9 px-4 rounded-md border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted"
            >
              Cancel
            </button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function FieldRow({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-[180px_1fr] items-start gap-3">
      <label className="text-sm text-foreground sm:pt-2">
        {label}
        {required && <span className="ml-0.5 text-destructive">*</span>}
      </label>
      <div className="max-w-md">{children}</div>
    </div>
  );
}

function Input({ value, onChange, placeholder, type = "text" }: { value: string; onChange: (v: string) => void; placeholder?: string; type?: string }) {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      className="h-9 w-full px-3 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary"
    />
  );
}

function Select({ value, onChange, options, placeholder }: { value: string; onChange: (v: string) => void; options: string[]; placeholder?: string }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="h-10 w-full pl-3 pr-9 rounded-md border border-border bg-card text-sm focus:outline-none focus:ring-1 focus:ring-primary appearance-none"
      >
        {placeholder && <option value="">{placeholder}</option>}
        {options.map((o) => <option key={o} value={o}>{o}</option>)}
      </select>
      <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}
