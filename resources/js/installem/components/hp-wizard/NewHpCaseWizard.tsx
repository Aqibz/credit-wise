import { useMemo, useState, lazy } from "react";
import { StepWizard, type WizardStep, DefaultStepSkeleton } from "@/components/StepWizard";
import { useEntityStore } from "@/lib/useEntityStore";
import {
  hpCasesConfig, customersConfig, productsConfig, guarantorsConfig,
} from "@/lib/entities";
import { fmtDate, addMonths, type Cheque, type Guarantor } from "@/components/hp-wizard/shared";

const StepCustomer    = lazy(() => import("@/components/hp-wizard/StepCustomer"));
const StepProduct     = lazy(() => import("@/components/hp-wizard/StepProduct"));
const StepPricing     = lazy(() => import("@/components/hp-wizard/StepPricing"));
const StepSchedule    = lazy(() => import("@/components/hp-wizard/StepSchedule"));
const StepCheques     = lazy(() => import("@/components/hp-wizard/StepCheques"));
const StepGuarantors  = lazy(() => import("@/components/hp-wizard/StepGuarantors"));
const StepReview      = lazy(() => import("@/components/hp-wizard/StepReview"));

export function NewHpCaseWizard({ onClose, titleOverride, subtitlePrefix }: {
  onClose: () => void;
  titleOverride?: string;
  subtitlePrefix?: string;
}) {
  const { items: customers } = useEntityStore<any>(customersConfig.storageKey, customersConfig.seed);
  const { items: products } = useEntityStore<any>(productsConfig.storageKey, productsConfig.seed);
  const { create: createCase, items: cases } = useEntityStore<any>(hpCasesConfig.storageKey, hpCasesConfig.seed);
  const { create: createGuarantor } = useEntityStore<any>(guarantorsConfig.storageKey, guarantorsConfig.seed);

  const [customerId, setCustomerId] = useState<string>("");
  const [newCustomer, setNewCustomer] = useState({ name: "", cnic: "", phone: "", area: "", occupation: "", income: "" });
  const customer = useMemo(() => customers.find((c: any) => c.id === customerId), [customers, customerId]);
  const customerName = customer?.name || newCustomer.name;
  const customerCnic = customer?.cnic || newCustomer.cnic;

  const [productId, setProductId] = useState<string>("");
  const [variantSku, setVariantSku] = useState<string>("");
  const [qty, setQty] = useState<number>(1);
  const product = useMemo(() => products.find((p: any) => p.id === productId), [products, productId]);
  const variants: any[] = useMemo(() => Array.isArray(product?.variants) ? product.variants : [], [product]);
  const variant = useMemo(() => variants.find((v: any) => v.sku === variantSku), [variants, variantSku]);

  const basePrice = Number(variant?.price || product?.retail || 0) * qty;
  const [totalPrice, setTotalPrice] = useState<number>(0);
  const effectiveTotal = totalPrice || basePrice;
  const [down, setDown] = useState<number>(0);
  const [tenure, setTenure] = useState<number>(12);
  const [profitPct, setProfitPct] = useState<number>(0);
  const principal = Math.max(0, effectiveTotal - down);
  const profitAmount = Math.round(principal * (profitPct / 100));
  const financed = principal + profitAmount;
  const monthly = tenure > 0 ? Math.round(financed / tenure) : 0;
  const [startDate, setStartDate] = useState<string>(fmtDate(new Date()));

  const schedule = useMemo(() => {
    if (!tenure || !financed) return [];
    const start = new Date(startDate);
    return Array.from({ length: tenure }, (_, i) => ({
      n: i + 1,
      dueDate: fmtDate(addMonths(start, i + 1)),
      amount: i === tenure - 1 ? financed - monthly * (tenure - 1) : monthly,
    }));
  }, [tenure, financed, monthly, startDate]);

  const [cheques, setCheques] = useState<Cheque[]>([]);
  const addCheque = () => setCheques((c) => [...c, { bank: "", cheque: "", date: fmtDate(addMonths(new Date(startDate), c.length + 1)), amount: monthly }]);
  const updateCheque = (i: number, patch: Partial<Cheque>) => setCheques((c) => c.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const removeCheque = (i: number) => setCheques((c) => c.filter((_, idx) => idx !== i));

  const [guarantorList, setGuarantorList] = useState<Guarantor[]>([]);
  const addGuarantor = () => setGuarantorList((g) => [...g, { name: "", cnic: "", phone: "", relation: "Father", occupation: "" }]);
  const updateGuarantor = (i: number, patch: Partial<Guarantor>) => setGuarantorList((g) => g.map((x, idx) => idx === i ? { ...x, ...patch } : x));
  const removeGuarantor = (i: number) => setGuarantorList((g) => g.filter((_, idx) => idx !== i));

  const [notes, setNotes] = useState<string>("");
  const ref = useMemo(() => `HP-${String(2000 + cases.length + 1).padStart(4, "0")}`, [cases.length]);

  const handleSave = () => {
    const productLabel = product ? `${product.name}${variant ? ` (${variant.name || variant.sku})` : ""}${qty > 1 ? ` × ${qty}` : ""}` : "—";
    const primaryGuarantor = guarantorList[0];
    createCase({
      ref, customer: customerName, cnic: customerCnic,
      guarantor: primaryGuarantor?.name || "—",
      product: productLabel, totalPrice: effectiveTotal, down, financed,
      tenure, monthly, startDate, status: "Under Process", notes, cheques, schedule,
      guarantors: guarantorList, profitPct,
    } as any);

    guarantorList.forEach((g) => {
      if (g.name.trim()) {
        createGuarantor({
          name: g.name, cnic: g.cnic, phone: g.phone,
          relation: g.relation, occupation: g.occupation,
          customer: customerName, status: "Pending", caseRef: ref,
        } as any);
      }
    });

    onClose();
  };

  const steps: WizardStep[] = [
    { key: "customer", title: "Customer", description: "Pick or add a customer",
      validate: () => (customerId || newCustomer.name.trim()) ? null : "Select an existing customer or enter a new one",
      preload: () => import("@/components/hp-wizard/StepCustomer"),
      render: () => (<StepCustomer customers={customers} customerId={customerId} setCustomerId={setCustomerId} newCustomer={newCustomer} setNewCustomer={setNewCustomer} customer={customer} />) },
    { key: "product", title: "Product", description: "Variant & quantity",
      validate: () => productId ? null : "Select a product",
      preload: () => import("@/components/hp-wizard/StepProduct"),
      render: () => (<StepProduct products={products} productId={productId} setProductId={setProductId} variants={variants} variantSku={variantSku} setVariantSku={setVariantSku} qty={qty} setQty={setQty} product={product} variant={variant} basePrice={basePrice} />) },
    { key: "pricing", title: "Pricing", description: "Price, down & tenure",
      validate: () => (effectiveTotal > 0 && tenure > 0) ? null : "Total price and tenure are required",
      preload: () => import("@/components/hp-wizard/StepPricing"),
      render: () => (<StepPricing totalPrice={totalPrice} setTotalPrice={setTotalPrice} basePrice={basePrice} down={down} setDown={setDown} tenure={tenure} setTenure={setTenure} profitPct={profitPct} setProfitPct={setProfitPct} startDate={startDate} setStartDate={setStartDate} principal={principal} profitAmount={profitAmount} financed={financed} monthly={monthly} />) },
    { key: "schedule", title: "Schedule", description: "Installment plan",
      validate: () => schedule.length > 0 ? null : "No schedule generated",
      preload: () => import("@/components/hp-wizard/StepSchedule"),
      render: () => (<StepSchedule schedule={schedule} tenure={tenure} financed={financed} monthly={monthly} startDate={startDate} />) },
    { key: "cheques", title: "Cheques", description: "Bank cheque details",
      preload: () => import("@/components/hp-wizard/StepCheques"),
      render: () => (<StepCheques cheques={cheques} addCheque={addCheque} updateCheque={updateCheque} removeCheque={removeCheque} />) },
    { key: "guarantors", title: "Guarantors", description: "References & co-signers",
      preload: () => import("@/components/hp-wizard/StepGuarantors"),
      render: () => (<StepGuarantors guarantorList={guarantorList} addGuarantor={addGuarantor} updateGuarantor={updateGuarantor} removeGuarantor={removeGuarantor} />) },
    { key: "review", title: "Review", description: "Confirm & save",
      preload: () => import("@/components/hp-wizard/StepReview"),
      skeleton: <DefaultStepSkeleton />,
      render: () => (<StepReview customerName={customerName} customerCnic={customerCnic} customer={customer} newCustomer={newCustomer} product={product} variant={variant} qty={qty} effectiveTotal={effectiveTotal} down={down} profitPct={profitPct} financed={financed} tenure={tenure} monthly={monthly} startDate={startDate} cheques={cheques} guarantorList={guarantorList} notes={notes} setNotes={setNotes} ref={ref} />) },
  ];

  return (
    <StepWizard
      title={titleOverride || "Contract"}
      subtitle={`${subtitlePrefix || "Create a new hire-purchase contract"} • ${ref}`}
      isEdit={false}
      pageMode
      steps={steps}
      onClose={onClose}
      onSave={handleSave}
    />
  );
}
