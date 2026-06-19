import { useMemo, useState } from "react";
import { addDays, format } from "date-fns";
import { Info, Save, Target, UserPlus2, Users } from "lucide-react";
import { WInput, WSelect, WTextarea } from "@/shared/ui/wizards/StepWizard";
import { FormCard, FormRow, FormRowDouble, FormSection } from "@/shared/ui/forms/SideForm";
import { SearchableSelect, type SearchableSelectOption } from "@/shared/ui/primitives/searchable-select";
import { DateTimePicker } from "@/shared/ui/primitives/date-time-picker";
import { fieldErrorTextClasses, hasMeaningfulPhoneValue, isValidEmail } from "@/shared/lib/form-validation";
import { getPakistanAreaOptions, getPakistanCityOptions } from "@/shared/lib/pakistan-locations";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { brandsConfig, categoriesConfig, productsConfig } from "@/lib/entities/catalog";
import { useEntityStore } from "@/lib/state/useEntityStore";

const SOURCES = ["Walk-in", "WhatsApp", "Facebook", "Referral", "Call", "Website"];
const STATUSES = ["New", "Contacted", "Qualified", "Converted", "Lost"];
const BRANCHES = ["Model Town", "Gulberg", "Johar Town", "DHA", "Bahria Town"];
const OFFICERS = ["Bilal Ahmed", "Hira Saleem", "Sana Tariq", "Tariq Mahmood"];
const VALIDATED_FIELDS = ["name", "phone", "whatsapp", "email", "interest", "assignedTo", "city", "area"] as const;

type ValidatedField = (typeof VALIDATED_FIELDS)[number];
type LeadErrors = Partial<Record<ValidatedField, string>>;

function inferInterestPath(initial?: any) {
  const productName = String(initial?.interestProduct ?? initial?.interest ?? "").trim();
  const matchedProduct = (productsConfig.seed as any[]).find((product) => product.name === productName);

  return {
    category: initial?.interestCategory ?? matchedProduct?.category ?? "",
    brand: initial?.interestBrand ?? matchedProduct?.brand ?? "",
    product: initial?.interestProduct ?? matchedProduct?.name ?? "",
  };
}

function LabelWithTooltip({ label, hint }: { label: string; hint?: string }) {
  if (!hint) return <span>{label}</span>;
  return (
    <span className="inline-flex items-center gap-1.5">
      <span>{label}</span>
      <TooltipProvider delayDuration={150}>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" className="inline-flex text-muted-foreground hover:text-foreground" aria-label={`${label} info`}>
              <Info className="h-3.5 w-3.5" />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top" className="max-w-xs text-xs leading-relaxed">
            {hint}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}

export function LeadFormPage({
  initial,
  onClose,
  onSubmit,
  isEdit,
}: {
  initial?: any;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
  isEdit: boolean;
}) {
  const inferredInterest = inferInterestPath(initial);
  const { items: categoryItems } = useEntityStore<any>(categoriesConfig.storageKey, categoriesConfig.seed as any[]);
  const { items: brandItems } = useEntityStore<any>(brandsConfig.storageKey, brandsConfig.seed as any[]);
  const { items: productItems } = useEntityStore<any>(productsConfig.storageKey, productsConfig.seed as any[]);

  const [v, setV] = useState<any>(() => ({
    name: initial?.name ?? "",
    phone: initial?.phone ?? "",
    whatsapp: initial?.whatsapp ?? "",
    email: initial?.email ?? "",
    interestCategory: inferredInterest.category,
    interestBrand: inferredInterest.brand,
    interestProduct: inferredInterest.product,
    interest: initial?.interest ?? inferredInterest.product ?? "",
    budget: initial?.budget ?? "",
    source: initial?.source ?? "Walk-in",
    area: initial?.area ?? "",
    city: initial?.city ?? "Lahore",
    assignedTo: initial?.assignedTo ?? "",
    branch: initial?.branch ?? BRANCHES[0],
    status: initial?.status ?? "New",
    lastContact: initial?.lastContact ?? "",
    followUpDate: initial?.followUpDate ?? "",
    notes: initial?.notes ?? "",
  }));
  const [touched, setTouched] = useState<Record<ValidatedField, boolean>>({
    name: false,
    phone: false,
    whatsapp: false,
    email: false,
    interest: false,
    assignedTo: false,
    city: false,
    area: false,
  });

  function set<K extends keyof typeof v>(k: K, val: any) {
    setV((p: any) => ({ ...p, [k]: val }));
  }

  function touch(field: ValidatedField) {
    setTouched((current) => (current[field] ? current : { ...current, [field]: true }));
  }

  const activeProducts = useMemo(
    () => productItems.filter((product: any) => String(product.status ?? "Active") !== "Inactive"),
    [productItems],
  );

  const categoryOptions = useMemo<SearchableSelectOption[]>(
    () =>
      categoryItems
        .filter((category: any) => String(category.status ?? "Active") !== "Inactive")
        .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))
        .map((category: any) => ({
          value: String(category.name),
          label: String(category.name),
          keywords: [String(category.code ?? "")],
        })),
    [categoryItems],
  );

  const brandOptions = useMemo<SearchableSelectOption[]>(() => {
    const allowedBrands = new Set(
      activeProducts
        .filter((product: any) => !v.interestCategory || product.category === v.interestCategory)
        .map((product: any) => String(product.brand)),
    );

    return brandItems
      .filter((brand: any) => String(brand.status ?? "Active") !== "Inactive")
      .filter((brand: any) => allowedBrands.has(String(brand.name)))
      .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))
      .map((brand: any) => ({
        value: String(brand.name),
        label: String(brand.name),
        keywords: [String(brand.code ?? ""), String(brand.country ?? "")],
      }));
  }, [activeProducts, brandItems, v.interestCategory]);

  const productOptions = useMemo<SearchableSelectOption[]>(
    () =>
      activeProducts
        .filter((product: any) => !v.interestCategory || product.category === v.interestCategory)
        .filter((product: any) => !v.interestBrand || product.brand === v.interestBrand)
        .sort((a: any, b: any) => String(a.name).localeCompare(String(b.name)))
        .map((product: any) => ({
          value: String(product.name),
          label: String(product.name),
          keywords: [String(product.brand ?? ""), String(product.category ?? ""), String(product.sku ?? "")],
        })),
    [activeProducts, v.interestBrand, v.interestCategory],
  );

  const productLookup = useMemo(
    () => new Map(activeProducts.map((product: any) => [String(product.name), product] as const)),
    [activeProducts],
  );

  const officerOptions = useMemo<SearchableSelectOption[]>(
    () => OFFICERS.map((officer) => ({ value: officer, label: officer })),
    [],
  );
  const cityOptions = useMemo<SearchableSelectOption[]>(() => getPakistanCityOptions(), []);
  const areaOptions = useMemo<SearchableSelectOption[]>(
    () => getPakistanAreaOptions(v.city),
    [v.city],
  );

  function handleCategoryChange(nextCategory: string) {
    setV((current: any) => {
      const nextBrand = current.interestBrand && activeProducts.some((product: any) =>
        product.brand === current.interestBrand &&
        (!nextCategory || product.category === nextCategory)
      )
        ? current.interestBrand
        : "";

      const nextProduct = current.interestProduct && activeProducts.some((product: any) =>
        product.name === current.interestProduct &&
        (!nextCategory || product.category === nextCategory) &&
        (!nextBrand || product.brand === nextBrand)
      )
        ? current.interestProduct
        : "";

      return {
        ...current,
        interestCategory: nextCategory,
        interestBrand: nextBrand,
        interestProduct: nextProduct,
        interest: nextProduct || nextBrand || nextCategory,
      };
    });
  }

  function handleBrandChange(nextBrand: string) {
    setV((current: any) => {
      const nextProduct = current.interestProduct && activeProducts.some((product: any) =>
        product.name === current.interestProduct &&
        (!current.interestCategory || product.category === current.interestCategory) &&
        (!nextBrand || product.brand === nextBrand)
      )
        ? current.interestProduct
        : "";

      return {
        ...current,
        interestBrand: nextBrand,
        interestProduct: nextProduct,
        interest: nextProduct || nextBrand || current.interestCategory,
      };
    });
  }

  function handleProductChange(nextProduct: string) {
    const matchedProduct = productLookup.get(nextProduct);

    setV((current: any) => ({
      ...current,
      interestCategory: matchedProduct?.category ?? current.interestCategory,
      interestBrand: matchedProduct?.brand ?? current.interestBrand,
      interestProduct: nextProduct,
      interest: nextProduct || current.interestBrand || current.interestCategory,
    }));
  }

  function handleCityChange(nextCity: string) {
    setV((current: any) => {
      const nextAreaOptions = getPakistanAreaOptions(nextCity);
      const canKeepArea = nextAreaOptions.some((option) => option.value === current.area);

      return {
        ...current,
        city: nextCity,
        area: canKeepArea ? current.area : "",
      };
    });
  }

  function validateField(field: ValidatedField, values: typeof v): string {
    switch (field) {
      case "name":
        if (!String(values.name).trim()) return "Lead name is required.";
        if (String(values.name).trim().length < 2) return "Lead name should be at least 2 characters.";
        return "";
      case "phone":
        if (!hasMeaningfulPhoneValue(String(values.phone ?? ""))) return "A valid mobile number is required.";
        return "";
      case "whatsapp":
        if (String(values.whatsapp ?? "").trim() && !hasMeaningfulPhoneValue(String(values.whatsapp ?? ""))) {
          return "Enter a valid WhatsApp number.";
        }
        return "";
      case "email":
        if (!isValidEmail(String(values.email ?? ""))) return "Enter a valid email address.";
        return "";
      case "interest":
        if (!String(values.interestCategory || values.interestBrand || values.interestProduct).trim()) {
          return "At least one interest detail is required.";
        }
        return "";
      case "assignedTo":
        if (!String(values.assignedTo ?? "").trim()) return "Assigned to is required.";
        return "";
      case "city":
        if (!String(values.city ?? "").trim()) return "City is required.";
        return "";
      case "area":
        if (!String(values.area ?? "").trim()) return "Area / Zone is required.";
        return "";
      default:
        return "";
    }
  }

  function getErrors(values: typeof v, activeTouched: Record<ValidatedField, boolean>): LeadErrors {
    return VALIDATED_FIELDS.reduce<LeadErrors>((allErrors, field) => {
      if (!activeTouched[field]) return allErrors;
      const nextError = validateField(field, values);
      if (nextError) {
        allErrors[field] = nextError;
      }
      return allErrors;
    }, {});
  }

  const errors = useMemo(() => getErrors(v, touched), [touched, v]);
  const firstError = VALIDATED_FIELDS.map((field) => errors[field]).find(Boolean) ?? null;

  function handleSave() {
    const submitTouched: Record<ValidatedField, boolean> = {
      name: true,
      phone: true,
      whatsapp: true,
      email: true,
      interest: true,
      assignedTo: true,
      city: true,
      area: true,
    };
    const submitErrors = getErrors(v, submitTouched);

    setTouched(submitTouched);
    if (Object.keys(submitErrors).length > 0) {
      return;
    }

    const normalizedFollowUpDate = String(v.followUpDate ?? "").trim()
      || format(addDays(new Date(), 3), "yyyy-MM-dd HH:mm");

    onSubmit({
      ...v,
      interest: v.interestProduct || v.interestBrand || v.interestCategory,
      followUpDate: normalizedFollowUpDate,
      budget: v.budget ? Number(v.budget) : 0,
    });
  }

  return (
    <div className="pb-28">
      <div className="grid grid-cols-1 gap-8 xl:grid-cols-[minmax(880px,1fr)_minmax(260px,0.42fr)]">
        <div className="min-w-0">
          <FormCard className="overflow-visible lg:w-full">
            <FormSection
              icon={<UserPlus2 className="h-4 w-4" />}
              title="Lead Intake"
              description="Capture only what the team actually needs to follow up and qualify this inquiry."
            >
              <FormRowDouble
                left={{
                  label: "Lead Name",
                  required: true,
                  children: (
                    <div className="space-y-1">
                      <WInput
                        value={v.name}
                        onChange={(e) => set("name", e.target.value)}
                        onBlur={() => touch("name")}
                        aria-invalid={!!errors.name}
                        placeholder="e.g. Umar Farooq"
                      />
                      {errors.name && <p className={fieldErrorTextClasses}>{errors.name}</p>}
                    </div>
                  ),
                }}
                right={{
                  label: "Mobile",
                  required: true,
                  children: (
                    <div className="space-y-1">
                      <WInput
                        type="tel"
                        value={v.phone}
                        onChange={(e) => set("phone", e.target.value)}
                        onBlur={() => touch("phone")}
                        aria-invalid={!!errors.phone}
                        placeholder="300 1234567"
                      />
                      {errors.phone && <p className={fieldErrorTextClasses}>{errors.phone}</p>}
                    </div>
                  ),
                }}
              />
              <FormRowDouble
                left={{
                  label: "WhatsApp",
                  children: (
                    <div className="space-y-1">
                      <WInput
                        type="tel"
                        value={v.whatsapp}
                        onChange={(e) => set("whatsapp", e.target.value)}
                        onBlur={() => touch("whatsapp")}
                        aria-invalid={!!errors.whatsapp}
                        placeholder="300 1234567"
                      />
                      {errors.whatsapp && <p className={fieldErrorTextClasses}>{errors.whatsapp}</p>}
                    </div>
                  ),
                }}
                right={{
                  label: "Email",
                  children: (
                    <div className="space-y-1">
                      <WInput
                        type="email"
                        value={v.email}
                        onChange={(e) => set("email", e.target.value)}
                        onBlur={() => touch("email")}
                        aria-invalid={!!errors.email}
                        placeholder="lead@example.com"
                      />
                      {errors.email && <p className={fieldErrorTextClasses}>{errors.email}</p>}
                    </div>
                  ),
                }}
              />
              <FormRow
                label="Interested In"
                required
                hint={undefined}
              >
                <div className="max-w-[223px] space-y-3">
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">Category</div>
                    <SearchableSelect
                      value={v.interestCategory}
                      onChange={handleCategoryChange}
                      onBlur={() => touch("interest")}
                      options={categoryOptions}
                      invalid={!!errors.interest}
                      placeholder="Select..."
                      searchPlaceholder="Search categories..."
                      emptyMessage="No matching categories."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">Brand</div>
                    <SearchableSelect
                      value={v.interestBrand}
                      onChange={handleBrandChange}
                      onBlur={() => touch("interest")}
                      options={brandOptions}
                      invalid={!!errors.interest}
                      placeholder="Select..."
                      searchPlaceholder="Search brands..."
                      emptyMessage="No matching brands."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">Product</div>
                    <SearchableSelect
                      value={v.interestProduct}
                      onChange={handleProductChange}
                      onBlur={() => touch("interest")}
                      options={productOptions}
                      invalid={!!errors.interest}
                      placeholder="Select..."
                      searchPlaceholder="Search products..."
                      emptyMessage="No matching products."
                    />
                  </div>
                  {errors.interest && <p className={fieldErrorTextClasses}>{errors.interest}</p>}
                </div>
              </FormRow>
              <div className="grid grid-cols-1 md:grid-cols-[184px_1fr] lg:grid-cols-[184px_1fr_160px_1fr] gap-2 md:gap-x-4 md:gap-y-2 px-4 sm:px-5 py-3">
                <label className="text-[13px] text-foreground pt-1.5">Budget (Rs.)</label>
                <div className="min-w-0">
                  <WInput type="number" moneyField value={v.budget} onChange={(e) => set("budget", e.target.value)} placeholder="150000" />
                </div>
                <div className="hidden lg:block" aria-hidden="true" />
                <div className="hidden lg:block" aria-hidden="true" />
              </div>
            </FormSection>

            <FormSection
              icon={<Target className="h-4 w-4" />}
              title="Pipeline Handling"
              description="Keep the lead assigned, time-bound and easy to convert into a contract when ready."
            >
              <FormRowDouble
                left={{
                  label: "Lead Source",
                  children: <WSelect value={v.source} onChange={(x) => set("source", x)} options={SOURCES} />,
                }}
                right={{
                  label: "Lead Stage",
                  children: (
                    <WSelect
                      value={v.status}
                      onChange={(x) => set("status", x)}
                      options={STATUSES}
                    />
                  ),
                  hint: undefined,
                }}
              />
              <FormRowDouble
                left={{
                  label: "Assigned To",
                  children: (
                    <div className="space-y-1">
                      <SearchableSelect
                        value={v.assignedTo}
                        onChange={(x) => set("assignedTo", x)}
                        onBlur={() => touch("assignedTo")}
                        options={officerOptions}
                        invalid={!!errors.assignedTo}
                        placeholder="Select..."
                        searchPlaceholder="Search team members..."
                        emptyMessage="No matching team members."
                      />
                      {errors.assignedTo && <p className={fieldErrorTextClasses}>{errors.assignedTo}</p>}
                    </div>
                  ),
                }}
                right={{
                  label: "Branch",
                  children: <WSelect value={v.branch} onChange={(x) => set("branch", x)} options={BRANCHES} />,
                }}
              />
              <FormRow label="Contact Schedule">
                <div className="max-w-[223px] space-y-3">
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">
                      <LabelWithTooltip
                        label="Last Contact"
                        hint="The latest actual touchpoint with the prospect, such as a call, visit, or WhatsApp reply."
                      />
                    </div>
                    <DateTimePicker
                      value={v.lastContact}
                      onChange={(nextValue) => set("lastContact", nextValue)}
                      placeholder="Select date & time"
                      title="Last Contact"
                      description="Pick the most recent actual interaction date and time."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">
                      <LabelWithTooltip
                        label="Follow Up Date"
                        hint="The next committed date and time to contact the lead again. This is what operations should track daily."
                      />
                    </div>
                    <DateTimePicker
                      value={v.followUpDate}
                      onChange={(nextValue) => set("followUpDate", nextValue)}
                      placeholder="Select date & time"
                      title="Follow Up Date"
                      description="Pick the next scheduled follow-up date and time."
                    />
                  </div>
                </div>
              </FormRow>
            </FormSection>

            <FormSection
              icon={<Users className="h-4 w-4" />}
              title="Location & Notes"
              description="Capture just enough context for the next conversation."
            >
              <FormRowDouble
                left={{
                  label: "City",
                  children: (
                    <div className="space-y-1">
                      <SearchableSelect
                        value={v.city}
                        onChange={handleCityChange}
                        onBlur={() => touch("city")}
                        options={cityOptions}
                        invalid={!!errors.city}
                        placeholder="Select city..."
                        searchPlaceholder="Search cities or provinces..."
                        emptyMessage="No matching cities."
                      />
                      {errors.city && <p className={fieldErrorTextClasses}>{errors.city}</p>}
                    </div>
                  ),
                }}
                right={{
                  label: "Area / Zone",
                  children: (
                    <div className="space-y-1">
                      <SearchableSelect
                        value={v.area}
                        onChange={(nextArea) => set("area", nextArea)}
                        onBlur={() => touch("area")}
                        options={areaOptions}
                        invalid={!!errors.area}
                        placeholder={v.city ? "Select area..." : "Select city first"}
                        searchPlaceholder={v.city ? "Search areas..." : "Select a city first"}
                        emptyMessage={v.city ? "No matching areas for this city." : "Select a city to load areas."}
                        disabled={!v.city}
                      />
                      {errors.area && <p className={fieldErrorTextClasses}>{errors.area}</p>}
                    </div>
                  ),
                }}
              />
              <FormRow
                label="Notes"
              >
                <WTextarea value={v.notes} onChange={(e) => set("notes", e.target.value)} placeholder="Requested 12-month plan, wants spouse to visit branch before finalizing." />
              </FormRow>
            </FormSection>
          </FormCard>
        </div>
        <div className="hidden xl:block" aria-hidden="true" />
      </div>

      <div className="fixed bottom-0 left-0 right-0 z-30 border-t border-border bg-white/95 px-4 py-3 backdrop-blur lg:left-[var(--sidebar-w,16rem)] sm:px-6">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3">
          <div className="text-xs text-muted-foreground">
            {firstError ? <span className="font-semibold text-destructive">{firstError}</span> : null}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="inline-flex h-10 items-center rounded-lg border border-border bg-card px-4 text-sm font-semibold text-foreground hover:bg-muted">
              Cancel
            </button>
            <button type="button" onClick={handleSave} className="inline-flex h-10 items-center gap-2 rounded-lg bg-primary px-5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
              <Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create Lead"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
