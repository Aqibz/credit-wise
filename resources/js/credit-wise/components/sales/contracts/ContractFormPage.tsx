import { useEffect, useMemo, useRef, useState, type ReactNode } from "react";
import {
  FileText, User, Package, CalendarDays, Banknote, Users as UsersIcon, BriefcaseBusiness,
  ShieldCheck, Save, Plus, Trash2, UploadCloud, X, Check, AlertTriangle, ChevronDown, Search, Info, ImagePlus, Eye,
} from "lucide-react";
import { useNavigate } from "@/shared/navigation";
import { WInput, WTextarea, WSelect, WSwitch } from "@/components/StepWizard";
import { FormCard, FormSection, FormRow, FormRowDouble, FormRowFull } from "@/components/forms/SideForm";
import { SearchableSelect, type SearchableSelectOption } from "@/shared/ui/primitives/searchable-select";
import { DateTimePicker } from "@/shared/ui/primitives/date-time-picker";
import {
  dropdownMenuItemActiveClass,
  dropdownMenuItemClass,
  dropdownMenuItemIdleClass,
  dropdownMenuSearchShellClass,
  dropdownMenuSurfaceClass,
} from "@/shared/ui/primitives/dropdown-theme";
import {
  getPakistanAreaOptions,
  getPakistanCityOptions,
  getPakistanProvinceForCity,
  getPakistanProvinceOptions,
} from "@/shared/lib/pakistan-locations";
import { getPakistanBankOptions as getBankOptions } from "@/shared/lib/pakistan-banks";
import { MASTER_SETTINGS_STORAGE_KEY } from "@/shared/lib/currency-settings";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { Avatar } from "@/shared/ui/core/UiKit";
import { useEntityStore } from "@/lib/state/useEntityStore";
import {
  hpCasesConfig, customersConfig, productsConfig, guarantorsConfig,
  salesTeamConfig, recoveryAgentsConfig, blacklistConfig, installmentMatrixConfig, leadsConfig,
} from "@/lib/entities";
import { useToast } from "@/components/Toaster";
import { cn } from "@/lib/helpers/utils";

const Rs = (v: any) => `Rs. ${Number(v || 0).toLocaleString()}`;
const fmtDate = (d: Date) => d.toISOString().slice(0, 10);
const fmtPct = (value: number) => {
  const rounded = Math.round(value * 10) / 10;
  return Number.isInteger(rounded) ? String(rounded) : rounded.toFixed(1);
};
const fmtDateTime = (d: Date) => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  const hours = String(d.getHours()).padStart(2, "0");
  const minutes = String(d.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day} ${hours}:${minutes}`;
};
const addMonths = (d: Date, m: number) => { const x = new Date(d); x.setMonth(x.getMonth() + m); return x; };
const addDays = (d: Date, days: number) => { const x = new Date(d); x.setDate(x.getDate() + days); return x; };

const CHANNELS = ["Walk-in", "Phone", "Website", "Mobile App", "Field Sales", "Referral", "Social Media"];
const PRIORITIES = ["Normal", "High", "Urgent"];
const FREQUENCIES = ["Monthly", "Bi-Weekly", "Weekly", "Quarterly"];
const RELATIONS = ["Father", "Mother", "Brother", "Sister", "Husband", "Wife", "Son", "Daughter", "Friend", "Colleague", "Relative", "Employer", "Other"];
const EMPLOYMENT = ["Salaried", "Self-Employed", "Business Owner", "Freelancer", "Government", "Pensioner", "Other"];
const DOC_TYPES: { key: string; label: string; required?: boolean; hint: string }[] = [
  { key: "cnicFront",   label: "CNIC Front",       required: true,  hint: "Front side of customer CNIC" },
  { key: "cnicBack",    label: "CNIC Back",        required: true,  hint: "Back side of customer CNIC" },
  { key: "utility",     label: "Utility Bill",     required: true,  hint: "Last 3 months - address proof" },
  { key: "salarySlip",  label: "Salary Slip / Income Proof", hint: "Last pay slip or income statement" },
  { key: "employment",  label: "Employment Letter", hint: "Or business registration" },
  { key: "bankStmt",    label: "Bank Statement",   hint: "Last 6 months" },
  { key: "guarantorCnic", label: "Guarantor CNIC", required: true, hint: "Front & back of primary guarantor" },
];

type ChequeImage = { name: string; size: number; type: string; previewUrl?: string };
type Cheque = { bank: string; cheque: string; date: string; amount: number; image?: ChequeImage | null };
type Guarantor = {
  name: string; cnic: string; phone: string; altPhone: string;
  relation: string; occupation: string; city: string; income: number; address: string;
};
type DocFile = { key: string; label: string; name: string; size: number };
type ContractPartyOption = {
  id: string;
  kind: "customer" | "lead";
  name: string;
  cnic?: string;
  phone?: string;
  email?: string;
  city?: string;
  area?: string;
  occupation?: string;
  income?: number;
  address?: string;
  source?: string;
  status?: string;
};

function getEmploymentFieldConfig(employmentType: string) {
  switch (employmentType) {
    case "Salaried":
      return {
        title: "Employment & Income",
        description: "Capture the applicant's current role, employer, and household dependency profile.",
        roleLabel: "Job Title",
        rolePlaceholder: "e.g. Sales Officer",
        orgLabel: "Employer",
        orgPlaceholder: "Company / organization name",
      };
    case "Self-Employed":
      return {
        title: "Self-Employment & Income",
        description: "Capture the applicant's profession and the business or practice they operate.",
        roleLabel: "Profession",
        rolePlaceholder: "e.g. Electrician, Consultant",
        orgLabel: "Business / Practice",
        orgPlaceholder: "Business, shop, or practice name",
      };
    case "Business Owner":
      return {
        title: "Business & Income",
        description: "Capture the owner's operating role and the business entity used for assessment.",
        roleLabel: "Owner Role",
        rolePlaceholder: "e.g. Managing Partner",
        orgLabel: "Business Name",
        orgPlaceholder: "Registered or trade business name",
      };
    case "Freelancer":
      return {
        title: "Freelance Work & Income",
        description: "Capture the applicant's service line and the platform or client base they primarily work with.",
        roleLabel: "Specialization",
        rolePlaceholder: "e.g. Graphic Designer",
        orgLabel: "Platform / Main Client",
        orgPlaceholder: "Upwork, Fiverr, direct client, etc.",
      };
    case "Government":
      return {
        title: "Government Service & Income",
        description: "Capture the government role and department that support repayment capacity.",
        roleLabel: "Designation",
        rolePlaceholder: "e.g. Assistant Director",
        orgLabel: "Department / Ministry",
        orgPlaceholder: "Department, authority, or ministry",
      };
    case "Pensioner":
      return {
        title: "Pension & Income",
        description: "Capture the applicant's former role and pension source for affordability review.",
        roleLabel: "Previous Occupation",
        rolePlaceholder: "e.g. Retired Accounts Officer",
        orgLabel: "Pension Source",
        orgPlaceholder: "Institution or pension provider",
      };
    default:
      return {
        title: "Employment & Income",
        description: "Capture the applicant's work profile and income source for underwriting.",
        roleLabel: "Occupation",
        rolePlaceholder: "Describe current work",
        orgLabel: "Organization / Source",
        orgPlaceholder: "Employer, business, or income source",
      };
  }
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

export function ContractFormPage({ onClose }: { onClose?: () => void }) {
  const navigate = useNavigate();
  const toast = useToast();

  const { items: customers, create: createCustomer } = useEntityStore<any>(customersConfig.storageKey, customersConfig.seed);
  const { items: leads }       = useEntityStore<any>(leadsConfig.storageKey, leadsConfig.seed);
  const { items: products }    = useEntityStore<any>(productsConfig.storageKey, productsConfig.seed);
  const { items: salesTeam }   = useEntityStore<any>(salesTeamConfig.storageKey, salesTeamConfig.seed);
  const { items: agents }      = useEntityStore<any>(recoveryAgentsConfig.storageKey, recoveryAgentsConfig.seed);
  const { items: blacklist }   = useEntityStore<any>(blacklistConfig.storageKey, blacklistConfig.seed);
  const { items: matrix }      = useEntityStore<any>(installmentMatrixConfig.storageKey, installmentMatrixConfig.seed);
  const { items: cases, create: createCase } = useEntityStore<any>(hpCasesConfig.storageKey, hpCasesConfig.seed);
  const { create: createGuarantor } = useEntityStore<any>(guarantorsConfig.storageKey, guarantorsConfig.seed);
  const { items: masterSettingsItems } = useEntityStore<{ id: string; values: Record<string, any> }>(MASTER_SETTINGS_STORAGE_KEY, []);
  const masterSettings = masterSettingsItems[0]?.values ?? {};
  const processingFeeEnabled = Boolean(masterSettings.processingFeeEnabled ?? true);
  const defaultProcessingFee = processingFeeEnabled ? Number(masterSettings.processingFeeAmount ?? 1500) : 0;

  const salesPersonOptions = useMemo<SearchableSelectOption[]>(
    () =>
      salesTeam.map((member: any) => ({
        value: String(member.name ?? ""),
        label: String(member.name ?? ""),
        secondaryLabel: [member.role, member.code].filter(Boolean).join(" · "),
        keywords: [String(member.code ?? ""), String(member.role ?? ""), String(member.branch ?? ""), String(member.phone ?? "")],
      })),
    [salesTeam],
  );

  const recoveryAgentOptions = useMemo<SearchableSelectOption[]>(
    () =>
      agents.map((agent: any) => ({
        value: String(agent.name ?? ""),
        label: String(agent.name ?? ""),
        secondaryLabel: [agent.code, agent.branch || agent.area].filter(Boolean).join(" · "),
        keywords: [String(agent.code ?? ""), String(agent.branch ?? ""), String(agent.area ?? ""), String(agent.phone ?? "")],
      })),
    [agents],
  );

  const ref = useMemo(() => `HP-${String(2000 + cases.length + 1).padStart(4, "0")}`, [cases.length]);

  // --- Identity ---
  const [salesPerson, setSalesPerson] = useState<string>("");
  const [recoveryAgent, setRecoveryAgent] = useState<string>("");
  const [channel, setChannel] = useState<string>("Walk-in");
  const [priority, setPriority] = useState<string>("Normal");
  const [bookedOn, setBookedOn] = useState<string>(fmtDateTime(new Date()));

  // --- Customer ---
  const [customerId, setCustomerId] = useState<string>("");
  const [showNewCustomer, setShowNewCustomer] = useState(false);
  const emptyNc = {
    name: "", cnic: "", phone: "", altPhone: "", dob: "", email: "",
    addressLine1: "", addressLine2: "", state: "Punjab", city: "Lahore", area: "", zip: "", occupation: "",
    employer: "", employmentType: "Salaried", income: 0,
  };
  const [nc, setNc] = useState(emptyNc);
  const provinceOptions = useMemo<SearchableSelectOption[]>(() => getPakistanProvinceOptions(), []);
  const cityOptions = useMemo<SearchableSelectOption[]>(() => getPakistanCityOptions(), []);
  const areaOptions = useMemo<SearchableSelectOption[]>(() => getPakistanAreaOptions(nc.city), [nc.city]);
  const relationOptions = useMemo<SearchableSelectOption[]>(
    () => RELATIONS.map((relation) => ({ value: relation, label: relation })),
    [],
  );
  const employmentFieldConfig = useMemo(() => getEmploymentFieldConfig(nc.employmentType), [nc.employmentType]);
  const pakistanBankOptions = useMemo<SearchableSelectOption[]>(() => getBankOptions(), []);
  const contractPartyOptions = useMemo<ContractPartyOption[]>(
    () => [
      ...customers.map((customer: any) => ({
        id: String(customer.id),
        kind: "customer" as const,
        name: String(customer.name ?? ""),
        cnic: String(customer.cnic ?? ""),
        phone: String(customer.phone ?? ""),
        email: String(customer.email ?? ""),
        city: String(customer.city ?? ""),
        area: String(customer.area ?? ""),
        occupation: String(customer.occupation ?? ""),
        income: Number(customer.income ?? 0),
        address: String(customer.address ?? ""),
        status: String(customer.status ?? ""),
      })),
      ...leads.map((lead: any) => ({
        id: String(lead.id),
        kind: "lead" as const,
        name: String(lead.name ?? ""),
        cnic: String(lead.cnic ?? ""),
        phone: String(lead.phone ?? ""),
        email: String(lead.email ?? ""),
        city: String(lead.city ?? ""),
        area: String(lead.area ?? ""),
        occupation: String(lead.occupation ?? ""),
        income: Number(lead.budget ?? lead.income ?? 0),
        address: String(lead.address ?? lead.notes ?? ""),
        source: String(lead.source ?? ""),
        status: String(lead.status ?? ""),
      })),
    ].sort((a, b) => a.name.localeCompare(b.name)),
    [customers, leads],
  );
  const customer = useMemo(() => customers.find((c: any) => c.id === customerId), [customers, customerId]);
  const customerName = customer?.name || (showNewCustomer ? nc.name : "");
  const customerCnic = customer?.cnic || (showNewCustomer ? nc.cnic : "");
  const customerPhone = customer?.phone || (showNewCustomer ? nc.phone : "");
  const customerStepReady = Boolean(customerId || showNewCustomer);

  const blHit = useMemo(() => {
    if (!customerCnic && !customerName) return null;
    return blacklist.find((b: any) =>
      (customerCnic && b.cnic && b.cnic === customerCnic) ||
      (customerName && b.name && b.name.toLowerCase() === String(customerName).toLowerCase())
    );
  }, [blacklist, customerCnic, customerName]);

  // --- Product & Financing ---
  const [productId, setProductId] = useState<string>("");
  const [variantSku, setVariantSku] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const productOptions = useMemo<SearchableSelectOption[]>(
    () =>
      products.map((item: any) => ({
        value: String(item.name ?? ""),
        label: String(item.name ?? ""),
        secondaryLabel: [item.brand, item.category].filter(Boolean).join(" · "),
        keywords: [String(item.sku ?? ""), String(item.brand ?? ""), String(item.category ?? "")],
      })),
    [products],
  );
  const product = useMemo(() => products.find((p: any) => p.id === productId), [products, productId]);
  const variants: any[] = useMemo(() => (Array.isArray(product?.variants) ? product.variants : []), [product]);
  const variantOptions = useMemo<SearchableSelectOption[]>(
    () =>
      variants.map((item: any) => ({
        value: String(item.name || item.sku || ""),
        label: String(item.name || item.sku || ""),
        secondaryLabel: [`Stock ${Number(item.stock || 0)}`, item.sku].filter(Boolean).join(" · "),
        keywords: [String(item.sku ?? ""), String(item.color ?? ""), String(item.capacity ?? ""), String(item.storage ?? ""), String(item.ram ?? "")],
      })),
    [variants],
  );
  const variant = useMemo(() => variants.find((v: any) => v.sku === variantSku), [variants, variantSku]);
  const productStock = useMemo(
    () => (product?.hasVariants ? variants.reduce((sum: number, item: any) => sum + Number(item.stock || 0), 0) : Number(product?.inventory || 0)),
    [product, variants],
  );
  const selectedStock = variant ? Number(variant.stock || 0) : productStock;
  const productStockHint = useMemo(() => {
    if (!product) return undefined;
    if (variant) {
      return selectedStock === 0
        ? "Selected variant is currently out of stock."
        : `${selectedStock} units available in the selected variant.`;
    }
    if (variants.length > 0) {
      return `${productStock} units available across ${variants.length} variants.`;
    }
    return productStock === 0 ? "Product is currently out of stock." : `${productStock} units available.`;
  }, [product, productStock, selectedStock, variant, variants.length]);
  const unitPrice = Number(variant?.price || product?.retail || 0);
  const cashPrice = unitPrice * qty;
  const bookingDateOnly = useMemo(() => (bookedOn ? bookedOn.slice(0, 10) : fmtDate(new Date())), [bookedOn]);

  // Plans linked to this product (from installment matrix + SaaS-grade defaults)
  const matchedPlans = useMemo(() => {
    if (!product) return [];
    return matrix.filter((m: any) =>
      m.status === "Active" && (
        m.product === product.name ||
        m.product === product.category ||
        m.scope === "All"
      )
    );
  }, [matrix, product]);

  const availablePlans = useMemo(() => {
    if (!product) return [];

    const normalizePlan = (plan: any) => {
      const downType = String(plan.downType || plan.collectionModel || "").toLowerCase();
      const downMode = downType.includes("first") ? "first-installment" : "percent";
      const fallbackDownOptions = Number(plan.tenure || 0) <= 6
        ? [25, 30, 35, 40, 50, 60, 70, 80]
        : [25, 30, 35, 40, 50, 60, 70, 80];

      return {
        ...plan,
        id: String(plan.id),
        tenure: Number(plan.tenure || 0),
        markup: Number(plan.markup || 0),
        processingFee: !processingFeeEnabled
          ? 0
          : plan.processingFee == null
            ? defaultProcessingFee
            : Number(plan.processingFee || 0),
        downMode,
        downPayment: Number(plan.downPayment || 0),
        allowedDownOptions: downMode === "percent"
          ? Array.from(new Set((Array.isArray(plan.allowedDownOptions) ? plan.allowedDownOptions : fallbackDownOptions).map((value: any) => Number(value)).filter((value: number) => value >= 25 && value <= 80))).sort((a, b) => a - b)
          : [],
      };
    };

    const rawPlans = matchedPlans.map(normalizePlan);
    const existingTenures = new Set(rawPlans.map((plan: any) => plan.tenure));
    const fallbackPlans = [
      {
        id: `fallback-${product.id}-3`,
        product: product.name,
        category: product.category,
        plan: "Quick 3M",
        tenure: 3,
        markup: 8,
        downType: "First Installment",
        status: "Active",
        processingFee: defaultProcessingFee,
      },
      {
        id: `fallback-${product.id}-6`,
        product: product.name,
        category: product.category,
        plan: "Flex 6M",
        tenure: 6,
        markup: 12,
        downPayment: 30,
        allowedDownOptions: [25, 30, 35, 40, 50, 60, 70, 80],
        status: "Active",
        processingFee: defaultProcessingFee,
      },
      {
        id: `fallback-${product.id}-10`,
        product: product.name,
        category: product.category,
        plan: "Flex 10M",
        tenure: 10,
        markup: 16,
        downPayment: 35,
        allowedDownOptions: [25, 30, 35, 40, 50, 60, 70, 80],
        status: "Active",
        processingFee: defaultProcessingFee,
      },
    ]
      .filter((plan) => !existingTenures.has(plan.tenure))
      .map(normalizePlan);

    return [...fallbackPlans, ...rawPlans]
      .sort((a: any, b: any) => a.tenure - b.tenure)
      .slice(0, 3);
  }, [defaultProcessingFee, matchedPlans, processingFeeEnabled, product]);

  const [planId, setPlanId] = useState<string>("");
  const plan = useMemo(() => availablePlans.find((p: any) => p.id === planId), [availablePlans, planId]);

  // Auto-select first plan when product changes
  useEffect(() => {
    if (availablePlans.length && !availablePlans.find((p: any) => p.id === planId)) {
      setPlanId(availablePlans[0].id);
    }
    if (!availablePlans.length) setPlanId("");
  }, [availablePlans, planId]);

  const tenure = Number(plan?.tenure || 0);
  const markupPct = Number(plan?.markup || 0);
  const processingFee = processingFeeEnabled ? Number(plan?.processingFee || 0) : 0;
  const planRequiresFirstInstallment = plan?.downMode === "first-installment";
  const allowedDownPercentages = useMemo<number[]>(
    () => (plan?.downMode === "percent" ? (plan.allowedDownOptions as number[]) || [] : []),
    [plan],
  );
  const quickDownPercentages = useMemo<number[]>(() => {
    if (allowedDownPercentages.length === 0) return [];
    const minimum = allowedDownPercentages[0];
    const maximum = allowedDownPercentages[allowedDownPercentages.length - 1];
    const recommended = allowedDownPercentages.includes(Number(plan?.downPayment || 0))
      ? Number(plan?.downPayment || 0)
      : allowedDownPercentages.reduce((closest, value) =>
        Math.abs(value - 40) < Math.abs(closest - 40) ? value : closest,
      allowedDownPercentages[0]);

    return Array.from(new Set([minimum, recommended, maximum]));
  }, [allowedDownPercentages, plan]);

  const [down, setDown] = useState<number>(0);
  const [selectedDownPct, setSelectedDownPct] = useState<number | null>(null);
  const [downPaymentMode, setDownPaymentMode] = useState<"preset" | "custom">("preset");
  const [customDownAmount, setCustomDownAmount] = useState<string>("");
  const [customDownPercentage, setCustomDownPercentage] = useState<string>("");

  useEffect(() => {
    if (!plan || cashPrice <= 0) {
      setDown(0);
      setSelectedDownPct(null);
      setDownPaymentMode("preset");
      setCustomDownAmount("");
      setCustomDownPercentage("");
      return;
    }

    if (planRequiresFirstInstallment) {
      setSelectedDownPct(null);
      setDownPaymentMode("preset");
      setCustomDownAmount("");
      setCustomDownPercentage("");
      setDown(0);
      return;
    }

    if (downPaymentMode === "custom") {
      const parsedAmount = Number(customDownAmount || 0);
      const boundedAmount = Math.min(Math.max(parsedAmount, 0), cashPrice);
      if (down !== boundedAmount) setDown(boundedAmount);
      if (parsedAmount !== boundedAmount) {
        setCustomDownAmount(boundedAmount > 0 ? String(boundedAmount) : "");
      }
      if (boundedAmount > 0) {
        const derivedPct = (boundedAmount / cashPrice) * 100;
        const nextPct = fmtPct(derivedPct);
        if (customDownPercentage !== nextPct) setCustomDownPercentage(nextPct);
      } else if (customDownPercentage) {
        setCustomDownPercentage("");
      }
      return;
    }

    const preferredPct = selectedDownPct && allowedDownPercentages.includes(selectedDownPct)
      ? selectedDownPct
      : allowedDownPercentages.includes(Number(plan.downPayment || 0))
        ? Number(plan.downPayment || 0)
        : (allowedDownPercentages[0] ?? 25);

    if (selectedDownPct !== preferredPct) setSelectedDownPct(preferredPct);

    const presetDownAmount = Math.round((cashPrice * preferredPct) / 100);
    if (down !== presetDownAmount) setDown(presetDownAmount);
  }, [allowedDownPercentages, cashPrice, customDownAmount, customDownPercentage, down, downPaymentMode, plan, planRequiresFirstInstallment, selectedDownPct]);

  const financedPrincipal = Math.max(0, cashPrice - (planRequiresFirstInstallment ? 0 : down));
  const markupAmt = Math.round(financedPrincipal * markupPct / 100);
  const contractValue = financedPrincipal + markupAmt;
  const monthly = tenure > 0 ? Math.round(contractValue / tenure) : 0;
  const lastInst = tenure > 0 ? (contractValue - monthly * (tenure - 1)) : 0;
  const upfrontCollection = planRequiresFirstInstallment ? monthly : down;
  const outstandingAfterBooking = Math.max(0, contractValue - (planRequiresFirstInstallment ? monthly : 0));
  const totalCustomerCommitment = contractValue + upfrontCollection + processingFee;

  const [frequency, setFrequency] = useState<string>("Monthly");
  const [startDate, setStartDate] = useState<string>(fmtDate(addMonths(new Date(), 1)));

  const schedule = useMemo(() => {
    if (!tenure || !contractValue) return [];

    const scheduleStart = new Date(`${startDate}T00:00:00`);
    const bookingStart = new Date(`${bookingDateOnly}T00:00:00`);
    let opening = contractValue;

    const getDueDate = (index: number) => {
      if (planRequiresFirstInstallment && index === 0) return bookingStart;
      const effectiveIndex = planRequiresFirstInstallment ? index - 1 : index;
      if (frequency === "Weekly") return addDays(scheduleStart, effectiveIndex * 7);
      if (frequency === "Bi-Weekly") return addDays(scheduleStart, effectiveIndex * 14);
      if (frequency === "Quarterly") return addMonths(scheduleStart, effectiveIndex * 3);
      return addMonths(scheduleStart, effectiveIndex);
    };

    return Array.from({ length: tenure }, (_, i) => {
      const amount = i === tenure - 1 ? lastInst : monthly;
      const row = {
        n: i + 1,
        dueDate: fmtDate(getDueDate(i)),
        opening,
        amount,
        markup: Math.round((opening * markupPct) / Math.max(100, tenure ? tenure * 100 : 100)),
        collectionType: planRequiresFirstInstallment && i === 0 ? "Due at booking" : "Scheduled EMI",
        closing: Math.max(0, opening - amount),
      };
      opening = row.closing;
      return row;
    });
  }, [bookingDateOnly, contractValue, frequency, lastInst, markupPct, monthly, planRequiresFirstInstallment, startDate, tenure]);

  // --- Cheques ---
  const [cheques, setCheques] = useState<Cheque[]>([]);
  const chequePreviewUrlsRef = useRef<string[]>([]);
  const addCheque = () => setCheques((c) => [...c, { bank: "", cheque: "", date: schedule[c.length]?.dueDate || fmtDate(addMonths(new Date(startDate), c.length + 1)), amount: monthly, image: null }]);
  const updateCheque = (i: number, p: Partial<Cheque>) => setCheques((c) => c.map((x, idx) => idx === i ? { ...x, ...p } : x));
  const removeCheque = (i: number) => setCheques((current) => {
    const target = current[i];
    if (target?.image?.previewUrl) URL.revokeObjectURL(target.image.previewUrl);
    return current.filter((_, idx) => idx !== i);
  });
  const autoFillCheques = () => setCheques(schedule.map((s) => ({ bank: "", cheque: "", date: s.dueDate, amount: s.amount, image: null })));

  useEffect(() => {
    chequePreviewUrlsRef.current = cheques
      .map((cheque) => cheque.image?.previewUrl)
      .filter((url): url is string => Boolean(url));
  }, [cheques]);

  useEffect(() => {
    return () => {
      chequePreviewUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  // --- Guarantors ---
  const newGuarantor = (relation = "Father"): Guarantor => ({
    name: "", cnic: "", phone: "", altPhone: "", relation,
    occupation: "", city: "Lahore", income: 0, address: "",
  });
  const [guarantorList, setGuarantorList] = useState<Guarantor[]>([
    newGuarantor("Father"),
    newGuarantor("Brother"),
  ]);
  const addGuarantor = () => setGuarantorList((g) => [...g, newGuarantor("Friend")]);
  const updateGuarantor = (i: number, p: Partial<Guarantor>) => setGuarantorList((g) => g.map((x, idx) => idx === i ? { ...x, ...p } : x));
  const removeGuarantor = (i: number) => setGuarantorList((g) => (g.length <= 2 ? g : g.filter((_, idx) => idx !== i)));

  // --- Documents ---
  const [docs, setDocs] = useState<DocFile[]>([]);
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const askUpload = (key: string) => { setPendingKey(key); fileRef.current?.click(); };
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0]; if (!f || !pendingKey) return;
    const meta = DOC_TYPES.find((d) => d.key === pendingKey);
    setDocs((d) => [...d.filter((x) => x.key !== pendingKey), { key: pendingKey, label: meta?.label || pendingKey, name: f.name, size: f.size }]);
    setPendingKey(null); e.target.value = "";
  };
  const removeDoc = (key: string) => setDocs((d) => d.filter((x) => x.key !== key));

  // --- Compliance ---
  const [kycCnic, setKycCnic] = useState(false);
  const [kycAddress, setKycAddress] = useState(false);
  const [kycIncome, setKycIncome] = useState(false);
  const [kycReferences, setKycReferences] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [notes, setNotes] = useState<string>("");

  const [error, setError] = useState<string | null>(null);

  function handleSave() {
    if (!customerStepReady) return setError("Select an existing customer or start a new customer onboarding first");
    if (!salesPerson) return setError("Sales person is required");
    if (!customerId && !showNewCustomer) return setError("Select an existing customer or add a new one");
    if (!customerId && !nc.name.trim()) return setError("New customer name is required");
    if (!customerId && !nc.cnic.trim()) return setError("New customer CNIC is required");
    if (!productId) return setError("Select a product");
    if (!plan) return setError("Select an installment plan");
    if (!planRequiresFirstInstallment && down <= 0) {
      return setError(downPaymentMode === "custom" ? "Enter a custom down payment amount" : "Select a down payment option");
    }
    if (guarantorList.length < 2) return setError("At least two guarantors are required");
    const requiredGuarantors = guarantorList.slice(0, 2);
    if (requiredGuarantors.some((guarantor) => !guarantor.name.trim() || !guarantor.cnic.trim() || !guarantor.phone.trim())) {
      return setError("Primary and secondary guarantors require name, CNIC, and mobile");
    }
    if (!acceptedTerms) return setError("Confirm that customer accepted the contract terms");

    let custName = customerName;
    if (!customerId && nc.name.trim()) {
      createCustomer({
        name: nc.name, cnic: nc.cnic, phone: nc.phone, area: nc.area || nc.city,
        city: nc.city,
        address: [nc.addressLine1, nc.addressLine2, nc.area, nc.city, nc.state, nc.zip].filter(Boolean).join(", "),
        occupation: nc.occupation, income: nc.income, status: "Active",
      } as any);
      custName = nc.name;
    }

    const productLabel = product ? `${product.name}${variant ? ` (${variant.name || variant.sku})` : ""}${qty > 1 ? ` x ${qty}` : ""}` : "-";

    createCase({
      ref,
      customer: custName,
      cnic: customerCnic,
      phone: customerPhone,
      salesPerson, recoveryAgent, channel, priority, bookedOn,
      guarantor: guarantorList[0]?.name || "-",
      guarantorCnic: guarantorList[0]?.cnic || "",
      product: productLabel,
      productId, variantSku, qty,
      planId: plan.id, planName: plan.plan,
      cashPrice, totalPrice: cashPrice,
      down: upfrontCollection,
      profitPct: markupPct, profitAmount: markupAmt,
      principal: financedPrincipal, financed: outstandingAfterBooking,
      grossContractValue: contractValue, upfrontCollection, processingFee,
      tenure, frequency, monthly, lastInstallment: lastInst,
      startDate,
      status: "Under Process",
      cheques, schedule, guarantors: guarantorList, documents: docs, notes,
      kyc: { cnic: kycCnic, address: kycAddress, income: kycIncome, references: kycReferences },
    } as any);

    guarantorList.forEach((g) => {
      if (g.name.trim()) {
        createGuarantor({
          name: g.name, cnic: g.cnic, phone: g.phone, altPhone: g.altPhone,
          city: g.city, occupation: g.occupation, income: g.income,
          relation: g.relation, address: g.address,
          customer: custName, status: "Pending", caseRef: ref,
          contractStatus: "Under Process", exposure: outstandingAfterBooking, tenure,
        } as any);
      }
    });

    toast.success("Contract created", `${ref} for ${custName} is now Under Process.`);
    if (onClose) onClose(); else navigate({ to: "/contracts/under-process" });
  }

  return (
    <div className="space-y-6 pb-28">
      <input ref={fileRef} type="file" className="hidden" onChange={onFile} />

      {blHit && (
        <div className="rounded-lg border border-destructive/40 bg-destructive/10 px-3 py-2.5 text-sm text-destructive font-medium flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 mt-0.5 shrink-0" />
          <span><strong>Blacklist match:</strong> {blHit.name} ({blHit.cnic}) - Reason: {blHit.reason || "-"}. Proceeding requires manager override.</span>
        </div>
      )}

      <FormCard>
        <FormSection icon={<FileText className="h-4 w-4" />} title="Contract Identity" description="Origin, ownership and prioritisation.">
          <FormRow label="Customer" required>
            <CustomerCombo
              value={customer?.name || ""}
              records={contractPartyOptions}
              onPick={(record) => {
                if (record.kind === "customer") {
                  setCustomerId(record.id);
                  setShowNewCustomer(false);
                  setNc(emptyNc);
                  return;
                }

                setCustomerId("");
                setShowNewCustomer(true);
                setNc({
                  ...emptyNc,
                  name: record.name || "",
                  cnic: record.cnic || "",
                  phone: record.phone || "",
                  email: record.email || "",
                  state: getPakistanProvinceForCity(record.city || "Lahore") || "Punjab",
                  city: record.city || "Lahore",
                  area: record.area || "",
                  occupation: record.occupation || "",
                  income: record.income || 0,
                });
              }}
              onNew={() => { setCustomerId(""); setShowNewCustomer(true); setNc(emptyNc); }}
            />
            {customer && (
              <div className="mt-2 rounded-lg border border-border bg-muted/30 p-3 text-sm space-y-0.5">
                <div className="font-semibold">{customer.name}</div>
                <div className="text-muted-foreground text-xs">{customer.cnic} - {customer.phone}</div>
                <div className="text-muted-foreground text-xs">{customer.area || customer.city} - {customer.occupation || "-"}</div>
              </div>
            )}
          </FormRow>

          {showNewCustomer && !customer && (
            <>
              <FormRowDouble
                left={{ label: "Full Name", required: true, children: (
                  <WInput value={nc.name} onChange={(e) => setNc({ ...nc, name: e.target.value })} placeholder="Customer name" />
                )}}
                right={{ label: "CNIC", required: true, children: (
                  <WInput value={nc.cnic} onChange={(e) => setNc({ ...nc, cnic: e.target.value })} placeholder="35202-1234567-8" />
                )}}
              />
              <FormRowDouble
                left={{ label: "Date of Birth", children: (
                  <DateTimePicker
                    value={nc.dob}
                    onChange={(nextValue) => setNc({ ...nc, dob: nextValue })}
                    placeholder="Select date"
                    title="Date of Birth"
                    description="Select the customer's date of birth."
                    showTime={false}
                  />
                )}}
                right={{ label: "Email", children: (
                  <WInput type="email" value={nc.email} onChange={(e) => setNc({ ...nc, email: e.target.value })} />
                )}}
              />
              <FormRowDouble
                left={{ label: "Mobile", required: true, children: (
                  <WInput type="tel" value={nc.phone} onChange={(e) => setNc({ ...nc, phone: e.target.value })} placeholder="300 1234567" />
                )}}
                right={{ label: "Alt. Mobile", children: (
                  <WInput type="tel" value={nc.altPhone} onChange={(e) => setNc({ ...nc, altPhone: e.target.value })} placeholder="300 1234567" />
                )}}
              />
              <FormRow label="Address" required>
                <div className="grid max-w-[470px] grid-cols-2 gap-3">
                  <div className="col-span-2 space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">Address Line 1</div>
                    <WInput
                      value={nc.addressLine1}
                      onChange={(e) => setNc({ ...nc, addressLine1: e.target.value })}
                      placeholder="House / Flat, street, building"
                    />
                  </div>
                  <div className="col-span-2 space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">Address Line 2</div>
                    <WInput
                      value={nc.addressLine2}
                      onChange={(e) => setNc({ ...nc, addressLine2: e.target.value })}
                      placeholder="Block, floor, landmark"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">State</div>
                    <SearchableSelect
                      value={nc.state}
                      onChange={(nextState) => setNc({ ...nc, state: nextState })}
                      options={provinceOptions}
                      placeholder="Select state..."
                      searchPlaceholder="Search provinces..."
                      emptyMessage="No matching provinces."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">City</div>
                    <SearchableSelect
                      value={nc.city}
                      onChange={(nextCity) => setNc((current) => {
                        const nextAreas = getPakistanAreaOptions(nextCity);
                        const canKeepArea = nextAreas.some((option) => option.value === current.area);
                        return {
                          ...current,
                          city: nextCity,
                          state: getPakistanProvinceForCity(nextCity) || current.state || "Punjab",
                          area: canKeepArea ? current.area : "",
                        };
                      })}
                      options={cityOptions}
                      placeholder="Select city..."
                      searchPlaceholder="Search cities or provinces..."
                      emptyMessage="No matching cities."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">Area / Zone</div>
                    <SearchableSelect
                      value={nc.area}
                      onChange={(nextArea) => setNc({ ...nc, area: nextArea })}
                      options={areaOptions}
                      placeholder={nc.city ? "Select area..." : "Select city first"}
                      searchPlaceholder={nc.city ? "Search areas..." : "Select a city first"}
                      emptyMessage={nc.city ? "No matching areas for this city." : "Select a city to load areas."}
                      disabled={!nc.city}
                    />
                  </div>
                  <div className="space-y-1.5">
                    <div className="text-[12px] text-muted-foreground">ZIP</div>
                    <WInput
                      value={nc.zip}
                      onChange={(e) => setNc({ ...nc, zip: e.target.value })}
                      placeholder="54000"
                    />
                  </div>
                </div>
              </FormRow>
              <FormRowFull tone="muted">
                <div className="flex items-start gap-3 rounded-lg border border-border bg-muted/40 px-4 py-3">
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-primary/10 text-primary">
                    <BriefcaseBusiness className="h-5 w-5" />
                  </span>
                  <div className="min-w-0">
                    <div className="text-sm font-bold leading-tight text-foreground">{employmentFieldConfig.title}</div>
                    <p className="mt-0.5 text-xs text-muted-foreground">{employmentFieldConfig.description}</p>
                  </div>
                </div>
              </FormRowFull>
              <FormRowDouble
                left={{ label: "Employment Type", children: (
                  <WSelect
                    value={nc.employmentType}
                    onChange={(v) => setNc((current) => ({
                      ...current,
                      employmentType: v,
                      occupation: "",
                      employer: "",
                    }))}
                    options={EMPLOYMENT}
                  />
                )}}
                right={{ label: "Monthly Income", required: true, children: (
                  <WInput type="number" moneyField value={nc.income} onChange={(e) => setNc({ ...nc, income: Number(e.target.value) })} />
                )}}
              />
              <FormRowDouble
                left={{ label: employmentFieldConfig.roleLabel, children: (
                  <WInput
                    value={nc.occupation}
                    onChange={(e) => setNc({ ...nc, occupation: e.target.value })}
                    placeholder={employmentFieldConfig.rolePlaceholder}
                  />
                )}}
                right={{ label: employmentFieldConfig.orgLabel, children: (
                  <WInput
                    value={nc.employer}
                    onChange={(e) => setNc({ ...nc, employer: e.target.value })}
                    placeholder={employmentFieldConfig.orgPlaceholder}
                  />
                )}}
              />
            </>
          )}

          {!customerStepReady && (
            <FormRowFull tone="muted">
              <div className="rounded-lg border border-border/70 bg-background px-3 py-2.5 text-sm text-muted-foreground">
                Select a customer or start a new customer onboarding to continue contract setup.
              </div>
            </FormRowFull>
          )}

          <div
            aria-disabled={!customerStepReady}
            className={cn(
              "transition-opacity",
              !customerStepReady && "pointer-events-none select-none opacity-55",
            )}
          >
            <FormRowDouble
              left={{ label: "Contract No.", hint: "Auto-generated", children: (
                <WInput value={ref} readOnly className="bg-muted/40" />
              )}}
              right={{ label: "Booking Date", required: true, children: (
                <DateTimePicker
                  value={bookedOn}
                  onChange={setBookedOn}
                  placeholder="Select booking date"
                  title="Booking Date"
                  description="Select the contract booking date and time."
                />
              )}}
            />
            <FormRowDouble
              left={{ label: "Sales Channel", children: (
                <WSelect value={channel} onChange={setChannel} options={CHANNELS} />
              )}}
              right={{ label: "Priority", children: (
                <WSelect value={priority} onChange={setPriority} options={PRIORITIES} />
              )}}
            />
            <FormRowDouble
              left={{ label: "Salesperson", required: true, children: (
                <SearchableSelect
                  value={salesPerson}
                  onChange={setSalesPerson}
                  options={salesPersonOptions}
                  showSelectedSecondaryLabel={false}
                  placeholder="Assign sales..."
                  searchPlaceholder="Search salesperson..."
                />
              )}}
              right={{ label: <LabelWithTooltip label="Recovery Agent" hint="Owns collection for this contract" />, children: (
                <SearchableSelect
                  value={recoveryAgent}
                  onChange={setRecoveryAgent}
                  options={recoveryAgentOptions}
                  showSelectedSecondaryLabel={false}
                  placeholder="Assign agent..."
                  searchPlaceholder="Search recovery agent..."
                />
              )}}
            />
          </div>
        </FormSection>

        <div
          aria-disabled={!customerStepReady}
          className={cn(
            "transition-opacity",
            !customerStepReady && "pointer-events-none select-none opacity-55",
          )}
        >
        <FormSection icon={<Package className="h-4 w-4" />} title="Product & Financing" description="Pick the item, choose a linked installment plan, set the down payment.">
          <FormRowDouble
            left={{ label: "Product", required: true, hint: productStockHint, children: (
              <SearchableSelect
                value={product?.name || ""}
                onChange={(name) => {
                  const selected = products.find((item: any) => item.name === name);
                  setProductId(selected?.id || "");
                  setVariantSku("");
                }}
                options={productOptions}
                showSelectedSecondaryLabel={false}
                placeholder="Select product..."
                searchPlaceholder="Search product..."
              />
            )}}
            right={{ label: <LabelWithTooltip label="Price" hint="This is the cash price of the product or MRP (Maximum Retail Price)." />, children: (
              <WInput
                value={unitPrice ? Rs(unitPrice) : ""}
                readOnly
                placeholder="Auto-filled from selected product"
                className="bg-muted/40"
              />
            )}}
          />
          <FormRowDouble
            left={{ label: "Variant", hint: variants.length === 0 ? "This product has no variants." : undefined, children: (
              <SearchableSelect
                value={variant?.name || variant?.sku || ""}
                onChange={(value) => {
                  const selected = variants.find((item: any) => (item.name || item.sku) === value);
                  setVariantSku(selected?.sku || "");
                }}
                options={variantOptions}
                showSelectedSecondaryLabel={false}
                placeholder={variants.length === 0 ? "-" : "Select variant..."}
                searchPlaceholder={variants.length === 0 ? "No variants available" : "Search variant..."}
              />
            )}}
            right={{ label: "Quantity", children: (
              <WInput
                type="number"
                min={1}
                value={qty}
                onChange={(e) => setQty(Math.max(1, Number(e.target.value)))}
              />
            )}}
          />
          <FormRow label="Installment Plan" required>
            {availablePlans.length === 0 ? (
              <div className="rounded-md border border-dashed border-border bg-muted/30 px-3 py-2 text-xs text-muted-foreground">
                {product ? "No plans configured for this product. Add one in Installment Matrix." : "Select a product first to see available plans."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-2">
                {availablePlans.map((p: any) => {
                  const active = p.id === planId;
                  return (
                    <button key={p.id} type="button" onClick={() => setPlanId(p.id)}
                      className={`text-left rounded-lg border p-2.5 transition-colors ${active ? "border-primary bg-primary/5 ring-1 ring-primary" : "border-border bg-card hover:border-primary/40"}`}>
                      <div className="flex items-start justify-between gap-3">
                        <div className="font-semibold text-sm text-foreground">{p.plan}</div>
                        <span className="text-[10px] font-bold uppercase tracking-wider rounded bg-primary/10 text-primary px-1.5 py-0.5 shrink-0">{p.tenure} mo</span>
                      </div>
                      <div className="mt-0.5 flex items-center justify-between gap-2">
                        <div className="text-[11px] text-muted-foreground">
                          Markup {p.markup}%
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </FormRow>
          <FormRowDouble
            left={{ label: "Payment Frequency", children: (
              <WSelect value={frequency} onChange={setFrequency} options={FREQUENCIES} />
            )}}
            right={{ label: "First Due Date", required: true, children: (
              <WInput type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
            )}}
          />
          {!planRequiresFirstInstallment && (
            <FormRow
              label="Down Payment"
              required
              hint={!cashPrice ? "Select product and installment plan first." : undefined}
            >
              <div className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {quickDownPercentages.map((percentage) => {
                    const active = downPaymentMode === "preset" && selectedDownPct === percentage;
                    return (
                      <button
                        key={percentage}
                        type="button"
                        onClick={() => {
                          setDownPaymentMode("preset");
                          setSelectedDownPct(percentage);
                          setCustomDownAmount("");
                          setDown(Math.round((cashPrice * percentage) / 100));
                        }}
                        className={`inline-flex h-9 min-w-[88px] items-center justify-center rounded-lg border px-3 text-[13px] font-normal transition-colors ${active ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/40"}`}
                      >
                        {percentage}%
                      </button>
                    );
                  })}
                  <button
                    type="button"
                    onClick={() => {
                      setDownPaymentMode("custom");
                      setSelectedDownPct(null);
                      setCustomDownAmount(down > 0 ? String(down) : "");
                       setCustomDownPercentage(down > 0 && cashPrice > 0 ? fmtPct((down / cashPrice) * 100) : "");
                    }}
                    className={`inline-flex h-9 min-w-[128px] items-center justify-center rounded-lg border px-3 text-[13px] font-normal transition-colors ${downPaymentMode === "custom" ? "border-primary bg-primary/10 text-primary" : "border-border bg-card text-foreground hover:border-primary/40"}`}
                  >
                    Custom
                  </button>
                </div>
                {downPaymentMode === "custom" && (
                  <div className="grid max-w-[520px] gap-3 sm:grid-cols-2">
                    <div className="space-y-1.5">
                      <div className="text-[12px] text-muted-foreground">Custom %</div>
                      <div className="relative">
                        <WInput
                          value={customDownPercentage}
                          onChange={(event) => {
                            const raw = String(event.target.value ?? "");
                            const sanitized = raw.replace(/[^\d.]/g, "");
                            setCustomDownPercentage(sanitized);

                            const nextPercentage = Number(sanitized);
                            if (!Number.isFinite(nextPercentage) || nextPercentage <= 0) {
                              setCustomDownAmount("");
                              setDown(0);
                              return;
                            }

                            const nextAmount = Math.min(Math.max(Math.round((cashPrice * nextPercentage) / 100), 0), cashPrice);
                            setCustomDownAmount(nextAmount > 0 ? String(nextAmount) : "");
                            setDown(nextAmount);
                          }}
                          placeholder="Enter custom %"
                          className="pr-10"
                        />
                        <span className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[13px] font-normal text-muted-foreground">%</span>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <div className="text-[12px] text-muted-foreground">Down payment amount</div>
                      <WInput
                        moneyField
                        value={customDownAmount}
                        onChange={(event) => {
                          const rawValue = Number(String(event.target.value ?? "").replace(/,/g, ""));
                          const nextAmount = Number.isFinite(rawValue) ? Math.min(Math.max(rawValue, 0), cashPrice) : 0;
                          setCustomDownAmount(nextAmount > 0 ? String(nextAmount) : "");
                          setDown(nextAmount);
                          setCustomDownPercentage(nextAmount > 0 && cashPrice > 0 ? fmtPct((nextAmount / cashPrice) * 100) : "");
                        }}
                        placeholder="Enter custom amount"
                      />
                    </div>
                  </div>
                )}
              </div>
            </FormRow>
          )}
          {plan && cashPrice > 0 && (
            <FormRowFull tone="muted">
              <div className="space-y-3">
                <div className="text-[13px] font-semibold text-foreground">Facility Summary</div>
                <div className="overflow-hidden rounded-xl border border-border/80 bg-white">
                  <div className="grid gap-0 border-b border-border/80 lg:grid-cols-[minmax(0,1.1fr)_420px]">
                    <div className="px-4 py-4">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <Banknote className="h-3.5 w-3.5" />
                        </span>
                        <span>Financing Breakdown</span>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        <FinanceSummaryRow label="Cash Price" value={Rs(cashPrice)} />
                        <FinanceSummaryRow
                          label={
                            planRequiresFirstInstallment
                              ? "Upfront EMI"
                              : downPaymentMode === "custom"
                                ? `Down Payment (Custom${down > 0 && cashPrice > 0 ? ` · ${fmtPct((down / cashPrice) * 100)}%` : ""})`
                                : `Down Payment${selectedDownPct ? ` (${selectedDownPct}%)` : ""}`
                          }
                          value={Rs(upfrontCollection)}
                          tone="primary"
                        />
                        <FinanceSummaryRow label="Financed Principal" value={Rs(financedPrincipal)} />
                        <FinanceSummaryRow label={`Markup (${markupPct}%)`} value={Rs(markupAmt)} />
                        {processingFee > 0 && <FinanceSummaryRow label="Processing Fee" value={Rs(processingFee)} />}
                      </div>
                    </div>
                    <div className="border-t border-border/80 bg-slate-50/50 px-4 py-4 lg:border-l lg:border-t-0">
                      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                        <span className="inline-flex h-6 w-6 items-center justify-center rounded-md bg-primary/10 text-primary">
                          <CalendarDays className="h-3.5 w-3.5" />
                        </span>
                        <span>Customer Exposure</span>
                      </div>
                      <div className="mt-3 space-y-2.5">
                        <FinanceSummaryRow label="Installment Plan" value={`${plan.plan} · ${tenure} months`} compact />
                        <FinanceSummaryRow label="Repayment Frequency" value={frequency} compact />
                        <FinanceSummaryRow label="Scheduled EMI" value={Rs(monthly)} />
                        <FinanceSummaryRow label="Booking Date" value={bookingDateOnly} compact />
                        <FinanceSummaryRow
                          label="First Scheduled Due Date"
                          value={planRequiresFirstInstallment ? `${bookingDateOnly} (booking)` : startDate}
                          compact
                        />
                      </div>
                    </div>
                  </div>
                  <div className="bg-slate-50/70 px-4 py-3.5">
                    <FinanceSummaryTotal
                      label="Net Outstanding"
                      value={Rs(outstandingAfterBooking)}
                      tone="primary"
                    />
                    <div className="mt-2 border-t border-border/70 pt-2">
                      <FinanceSummaryTotal
                        label="Total Customer Commitment"
                        value={Rs(totalCustomerCommitment)}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </FormRowFull>
          )}
        </FormSection>

        <FormSection icon={<CalendarDays className="h-4 w-4" />} title="Installment Schedule" description={schedule.length ? `${tenure} scheduled dues with ${frequency.toLowerCase()} repayment cadence.` : "Auto-generated once product and installment plan are selected."}>
          <FormRowFull>
            <div className="rounded-xl border border-border overflow-hidden max-h-96 overflow-y-auto bg-background">
              <table className="w-full text-sm">
                <thead className="bg-muted/60 text-muted-foreground text-xs uppercase tracking-wider sticky top-0">
                  <tr>
                    <th className="text-left px-3 py-2">Inst.</th>
                    <th className="text-left px-3 py-2">Due Date</th>
                    <th className="text-left px-3 py-2">Collection Type</th>
                    <th className="text-right px-3 py-2">Opening Balance</th>
                    <th className="text-right px-3 py-2">Installment</th>
                    <th className="text-right px-3 py-2">Closing Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {schedule.length === 0 && (
                    <tr><td colSpan={6} className="text-center py-6 text-muted-foreground">No schedule yet</td></tr>
                  )}
                  {schedule.map((s) => (
                    <tr key={s.n} className="hover:bg-muted/30">
                      <td className="px-3 py-2 font-semibold">{s.n}/{tenure}</td>
                      <td className="px-3 py-2">{s.dueDate}</td>
                      <td className="px-3 py-2">
                        <span className={`inline-flex rounded-md px-2 py-1 text-[11px] font-semibold ${s.collectionType === "Due at booking" ? "bg-primary/10 text-primary" : "bg-muted text-foreground"}`}>
                          {s.collectionType}
                        </span>
                      </td>
                      <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">{Rs(s.opening)}</td>
                      <td className="px-3 py-2 text-right font-semibold tabular-nums">{Rs(s.amount)}</td>
                      <td className="px-3 py-2 text-right text-muted-foreground tabular-nums">{Rs(s.closing)}</td>
                    </tr>
                  ))}
                </tbody>
                {schedule.length > 0 && (
                  <tfoot className="bg-muted/40 sticky bottom-0">
                    <tr>
                      <td colSpan={4} className="px-3 py-2 font-bold text-right">Net Receivable</td>
                      <td className="px-3 py-2 text-right font-bold text-primary tabular-nums">{Rs(contractValue)}</td>
                      <td className="px-3 py-2 text-right font-bold text-foreground tabular-nums">{Rs(schedule[schedule.length - 1]?.closing || 0)}</td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </FormRowFull>
        </FormSection>

        <FormSection
          icon={<Banknote className="h-4 w-4" />}
          title="Post-dated Cheques"
          description="Security cheques for collection."
          headerActions={(
            <>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={addCheque}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background text-primary transition-colors hover:text-primary/80"
                      aria-label="Add cheque"
                      type="button"
                    >
                      <Plus className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Add cheque</TooltipContent>
                </Tooltip>
              </TooltipProvider>
              <TooltipProvider delayDuration={150}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={autoFillCheques}
                      disabled={!schedule.length}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-md bg-background text-muted-foreground transition-colors hover:text-foreground disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label="Auto-fill from schedule"
                      type="button"
                    >
                      <CalendarDays className="h-4 w-4" />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="top" className="text-xs">Auto-fill from schedule</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </>
          )}
        >
          <FormRowFull>
            <div className="space-y-2">
              {cheques.length === 0 && (
                <div className="rounded-lg border border-dashed border-border p-6 text-center text-sm text-muted-foreground">
                  No cheques captured. Add them individually or auto-fill from the schedule.
                </div>
              )}
              {cheques.map((c, i) => (
                <div key={i} className="grid md:grid-cols-12 gap-2 items-end rounded-lg border border-border bg-muted/20 p-3">
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Bank</label>
                    <SearchableSelect
                      value={c.bank}
                      onChange={(value) => updateCheque(i, { bank: value })}
                      options={pakistanBankOptions}
                      placeholder="Select bank..."
                      searchPlaceholder="Search bank..."
                      emptyMessage="No matching banks."
                    />
                  </div>
                  <div className="md:col-span-3">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Cheque #</label>
                    <WInput value={c.cheque} onChange={(e) => updateCheque(i, { cheque: e.target.value })} placeholder="Enter cheque number" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Date</label>
                    <WInput type="date" value={c.date} onChange={(e) => updateCheque(i, { date: e.target.value })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Amount</label>
                    <WInput type="number" moneyField value={c.amount} onChange={(e) => updateCheque(i, { amount: Number(e.target.value) })} />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-[11px] font-semibold text-muted-foreground mb-1">Attachment</label>
                    <div className="flex items-center justify-start gap-2 md:justify-end">
                      <TooltipProvider delayDuration={150}>
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <label
                              className="inline-flex h-10 w-10 cursor-pointer items-center justify-center rounded-md bg-muted text-muted-foreground transition-colors hover:text-foreground"
                              aria-label="Attach cheque image"
                            >
                              <ImagePlus className="h-4 w-4" />
                              <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={(event) => {
                                  const file = event.target.files?.[0];
                                  if (!file) return;
                                  if (c.image?.previewUrl) URL.revokeObjectURL(c.image.previewUrl);
                                  updateCheque(i, {
                                    image: {
                                      name: file.name,
                                      size: file.size,
                                      type: file.type,
                                      previewUrl: URL.createObjectURL(file),
                                    },
                                  });
                                  event.currentTarget.value = "";
                                }}
                              />
                            </label>
                          </TooltipTrigger>
                          <TooltipContent side="top" className="text-xs">Attach cheque image</TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                      <button onClick={() => removeCheque(i)} className="h-10 w-10 grid place-items-center rounded-md bg-muted text-destructive transition-colors hover:bg-destructive/10"><Trash2 className="h-4 w-4" /></button>
                    </div>
                  </div>
                  {c.image && (
                    <div className="md:col-span-12">
                      <div className="mt-1 flex items-center justify-between gap-3 rounded-md border border-border bg-background px-3 py-2 text-xs">
                        <span className="min-w-0 truncate text-muted-foreground">
                          Linked image for cheque {c.cheque?.trim() || `#${i + 1}`}: <span className="font-medium text-foreground">{c.image.name}</span>
                        </span>
                        <div className="flex items-center gap-3 shrink-0">
                          <TooltipProvider delayDuration={150}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => {
                                    if (c.image?.previewUrl) window.open(c.image.previewUrl, "_blank", "noopener,noreferrer");
                                  }}
                                  className="text-muted-foreground transition-colors hover:text-foreground"
                                  aria-label="Preview cheque image"
                                >
                                  <Eye className="h-4 w-4" />
                                </button>
                              </TooltipTrigger>
                              <TooltipContent side="top" className="text-xs">Preview image</TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                          <button
                            type="button"
                            onClick={() => {
                              if (c.image?.previewUrl) URL.revokeObjectURL(c.image.previewUrl);
                              updateCheque(i, { image: null });
                            }}
                            className="text-destructive transition-colors hover:opacity-80"
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </FormRowFull>
        </FormSection>

        <FormSection icon={<UsersIcon className="h-4 w-4" />} title="Guarantors" description="Minimum 2 guarantors are required. Capture them in the same structure used by the guarantor register.">
          {guarantorList.map((g, i) => (
            <div key={i} className="border-b border-border/60 last:border-b-0">
              <FormRowFull tone={i % 2 === 1 ? "muted" : undefined}>
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-semibold text-foreground">Guarantor {i + 1}</span>
                    <span
                      className={cn(
                        "inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold",
                        i === 0
                          ? "bg-primary/10 text-primary"
                          : i === 1
                            ? "bg-slate-100 text-slate-700"
                            : "bg-muted text-muted-foreground",
                      )}
                    >
                      {i === 0 ? "Primary" : i === 1 ? "Secondary" : "Additional"}
                    </span>
                    <span className="text-[12px] font-medium text-muted-foreground">
                      {i < 2 ? "Required" : "Optional"}
                    </span>
                  </div>
                  {guarantorList.length > 2 ? (
                    <button
                      type="button"
                      onClick={() => removeGuarantor(i)}
                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-slate-200 text-destructive transition-colors hover:bg-destructive/10"
                      aria-label={`Remove guarantor ${i + 1}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  ) : null}
                </div>
              </FormRowFull>

              <FormRowDouble
                tone={i % 2 === 1 ? "muted" : undefined}
                left={{
                  label: "Guarantor Name",
                  required: i < 2,
                  children: (
                    <WInput value={g.name} onChange={(e) => updateGuarantor(i, { name: e.target.value })} placeholder="Full guarantor name" />
                  ),
                }}
                right={{
                  label: "CNIC",
                  required: i < 2,
                  children: (
                    <WInput value={g.cnic} onChange={(e) => updateGuarantor(i, { cnic: e.target.value })} placeholder="35202-1234567-8" />
                  ),
                }}
              />

              <FormRowDouble
                tone={i % 2 === 1 ? "muted" : undefined}
                left={{
                  label: "Mobile",
                  required: i < 2,
                  children: (
                    <WInput type="tel" value={g.phone} onChange={(e) => updateGuarantor(i, { phone: e.target.value })} placeholder="300 1234567" />
                  ),
                }}
                right={{
                  label: "Alt. Mobile",
                  children: (
                    <WInput type="tel" value={g.altPhone} onChange={(e) => updateGuarantor(i, { altPhone: e.target.value })} placeholder="300 1234567" />
                  ),
                }}
              />

              <FormRowDouble
                tone={i % 2 === 1 ? "muted" : undefined}
                left={{
                  label: "Relation to Customer",
                  children: (
                    <SearchableSelect
                      value={g.relation}
                      onChange={(value) => updateGuarantor(i, { relation: value })}
                      options={relationOptions}
                      placeholder="Select relation..."
                      searchPlaceholder="Search relation..."
                      showSelectedSecondaryLabel={false}
                    />
                  ),
                }}
                right={{
                  label: "City / Area",
                  children: (
                    <SearchableSelect
                      value={g.city}
                      onChange={(value) => updateGuarantor(i, { city: value })}
                      options={cityOptions}
                      placeholder="Select city..."
                      searchPlaceholder="Search city..."
                      showSelectedSecondaryLabel={true}
                    />
                  ),
                }}
              />

              <FormRowDouble
                tone={i % 2 === 1 ? "muted" : undefined}
                left={{
                  label: "Occupation",
                  children: (
                    <WInput value={g.occupation} onChange={(e) => updateGuarantor(i, { occupation: e.target.value })} placeholder="Current occupation" />
                  ),
                }}
                right={{
                  label: "Monthly Income",
                  children: (
                    <WInput moneyField value={g.income} onChange={(e) => updateGuarantor(i, { income: Number(e.target.value) })} placeholder="0" />
                  ),
                }}
              />

              <FormRow
                tone={i % 2 === 1 ? "muted" : undefined}
                label="Residential Address"
                align="start"
              >
                <WTextarea value={g.address} onChange={(e) => updateGuarantor(i, { address: e.target.value })} rows={4} placeholder="House / flat, street, block, landmark" />
              </FormRow>
            </div>
          ))}
          <FormRowFull>
            <button
              type="button"
              onClick={addGuarantor}
              className="inline-flex items-center gap-1.5 rounded-lg border border-dashed border-primary/40 bg-primary/5 px-3 py-2 text-sm font-semibold text-primary hover:bg-primary/10"
            >
              <Plus className="h-4 w-4" /> Add Guarantor
            </button>
          </FormRowFull>
        </FormSection>

        <FormSection icon={<UploadCloud className="h-4 w-4" />} title="Documents" description="Upload required verification documents.">
          <FormRowFull>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {DOC_TYPES.map((d) => {
                const file = docs.find((x) => x.key === d.key);
                return (
                  <div key={d.key} className={`flex items-center justify-between gap-3 rounded-lg border p-3 ${file ? "border-success/40 bg-success/5" : "border-border bg-muted/20"}`}>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        {d.label} {d.required && <span className="text-destructive">*</span>}
                        {file && <Check className="h-3.5 w-3.5 text-success" />}
                      </div>
                      <div className="text-[11px] text-muted-foreground truncate">{file ? `${file.name} - ${(file.size / 1024).toFixed(0)} KB` : d.hint}</div>
                    </div>
                    {file ? (
                      <button onClick={() => removeDoc(d.key)} className="h-8 w-8 grid place-items-center rounded-md border border-border text-destructive hover:bg-destructive/10"><X className="h-4 w-4" /></button>
                    ) : (
                      <button onClick={() => askUpload(d.key)} className="inline-flex items-center gap-1 rounded-md border border-border bg-card px-2.5 py-1.5 text-xs font-semibold text-foreground hover:bg-muted"><UploadCloud className="h-3.5 w-3.5" /> Upload</button>
                    )}
                  </div>
                );
              })}
            </div>
          </FormRowFull>
        </FormSection>

        <FormSection icon={<ShieldCheck className="h-4 w-4" />} title="Compliance & Approval" description="Verification checks and acknowledgements.">
          <FormRow label="KYC Checks" align="start">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <WSwitch checked={kycCnic} onChange={setKycCnic} label="CNIC Verified (NADRA Verisys)" hint="Customer identity confirmed" />
              <WSwitch checked={kycAddress} onChange={setKycAddress} label="Address Verified" hint="Physical or utility bill check" />
              <WSwitch checked={kycIncome} onChange={setKycIncome} label="Income / Employment Verified" hint="Pay slip / bank statement / call" />
              <WSwitch checked={kycReferences} onChange={setKycReferences} label="Guarantor References Contacted" hint="Phone confirmation done" />
            </div>
          </FormRow>
          <FormRow label="Internal Notes" hint="Approval conditions, exceptions or remarks">
            <WTextarea value={notes} onChange={(e) => setNotes(e.target.value)} rows={4} placeholder="Special pricing approved by RM - Customer requested split delivery - ..." />
          </FormRow>
          <FormRow label="Terms Acceptance" required align="center">
            <WSwitch checked={acceptedTerms} onChange={setAcceptedTerms} label="Customer has reviewed & accepted the contract terms" hint="Required before saving" />
          </FormRow>
        </FormSection>
        </div>
      </FormCard>

      {/* Sticky footer */}
      <div className="fixed bottom-0 left-0 right-0 lg:left-[var(--sidebar-w,16rem)] z-30 border-t border-border bg-background/95 backdrop-blur px-4 sm:px-6 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3 flex-wrap">
          <div className="text-xs">
            {error ? <span className="text-destructive font-semibold flex items-center gap-1.5"><AlertTriangle className="h-3.5 w-3.5" /> {error}</span> : !customerStepReady ? <span className="text-muted-foreground">Select a customer first to unlock contract setup.</span> : <span className="text-muted-foreground">Will be saved as <strong className="text-foreground">Under Process</strong>{plan ? ` - ${tenure} x ${Rs(monthly)}` : ""}.</span>}
          </div>
          <div className="flex items-center gap-2">
            <button type="button" onClick={() => (onClose ? onClose() : navigate({ to: "/contracts" }))} className="h-10 px-4 rounded-lg border border-border bg-card text-sm font-semibold text-foreground hover:bg-muted">Cancel</button>
            <button type="button" onClick={handleSave} disabled={!customerStepReady} className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-50">
              <Save className="h-4 w-4" /> Create Contract
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Mini({ label, required, full, children }: { label: string; required?: boolean; full?: boolean; children: ReactNode }) {
  return (
    <div className={full ? "sm:col-span-2 lg:col-span-3" : ""}>
      <label className="block text-[11px] font-semibold text-muted-foreground mb-1">
        {label}{required && <span className="text-destructive ml-0.5">*</span>}
      </label>
      {children}
    </div>
  );
}

function FinanceSummaryRow({
  label,
  value,
  tone = "default",
  compact = false,
}: {
  label: string;
  value: string;
  tone?: "default" | "primary";
  compact?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span className="text-[12px] font-medium text-slate-600">{label}</span>
      <span
        className={cn(
          "text-right tabular-nums",
          compact ? "text-[13px] font-medium text-foreground" : "text-[13px] font-semibold",
          tone === "primary" ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}

function FinanceSummaryTotal({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string;
  tone?: "default" | "primary";
}) {
  return (
    <div className="flex items-center justify-between gap-3">
      <div className="text-[12px] font-medium text-slate-600">{label}</div>
      <div
        className={cn(
          "text-right text-[15px] font-bold tabular-nums sm:text-lg",
          tone === "primary" ? "text-primary" : "text-foreground",
        )}
      >
        {value}
      </div>
    </div>
  );
}

/* ---------- Customer Combobox ---------- */
function CustomerCombo({ value, records, onPick, onNew }: {
  value: string;
  records: ContractPartyOption[];
  onPick: (record: ContractPartyOption) => void;
  onNew: () => void;
}) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onDoc = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onDoc);
    return () => document.removeEventListener("mousedown", onDoc);
  }, []);

  const q = query.toLowerCase();
  const filtered = records.filter((record) =>
    !q || [record.name, record.cnic, record.phone, record.email, record.kind, record.source].some((v: any) => String(v || "").toLowerCase().includes(q))
  );

  return (
    <div ref={wrapRef} className="relative">
      <button type="button" onClick={() => setOpen((o) => !o)}
        className="flex h-10 w-full items-center rounded-lg border border-slate-200 bg-white px-3 pr-9 text-left text-[13px] transition focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50">
        <span className={value ? "truncate text-[13px] font-normal text-foreground" : "truncate text-[13px] font-normal text-muted-foreground"}>{value || "Select customer..."}</span>
        <ChevronDown className="h-4 w-4 text-muted-foreground absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      </button>
      {open && (
        <div className={cn("absolute z-40 left-0 right-0 mt-1 overflow-hidden", dropdownMenuSurfaceClass)}>
          <div className="border-b border-border/70 px-1.5 pb-1.5">
            <div className={dropdownMenuSearchShellClass}>
              <Search className="h-3.5 w-3.5 text-muted-foreground/70" />
              <input autoFocus value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, CNIC, phone..."
              className="h-full w-full border-0 bg-transparent p-0 text-[13px] font-normal text-foreground placeholder:text-[13px] placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:ring-0" />
            </div>
          </div>
          <ul className="max-h-72 overflow-auto py-1">
            {filtered.length === 0 && (
              <li className="px-3 py-3 text-sm text-muted-foreground text-center">No customers found</li>
            )}
            {filtered.map((record, index) => {
              const selected = record.name === value;
              const metaParts = [
                record.kind === "lead" ? `Lead${record.source ? ` · ${record.source}` : ""}` : "Customer",
                record.cnic || "",
                record.phone || "",
              ].filter(Boolean);
              const avatarTone = (["primary", "warning", "destructive", "info"] as const)[index % 4];
              return (
                <li key={`${record.kind}-${record.id}`}>
                  <button type="button" onClick={() => { onPick(record); setOpen(false); setQuery(""); }}
                    className={cn(
                      dropdownMenuItemClass,
                      "gap-3 px-3 py-2.5",
                      selected ? dropdownMenuItemActiveClass : dropdownMenuItemIdleClass,
                    )}>
                    <Avatar name={record.name || "?"} color={avatarTone} className={selected ? "ring-primary/25" : ""} />
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium text-foreground">{record.name}</span>
                      <span className="mt-0.5 block truncate text-[11px] font-medium text-muted-foreground">
                        {metaParts.join(" · ")}
                      </span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
          <button type="button" onClick={() => { setOpen(false); onNew(); }}
            className="w-full flex items-center gap-2 border-t border-border/70 px-3 py-2.5 text-sm font-semibold text-primary hover:bg-muted/60">
            <Plus className="h-4 w-4" /> New Customer
          </button>
        </div>
      )}
    </div>
  );
}
