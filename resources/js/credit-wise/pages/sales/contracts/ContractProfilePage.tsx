import { useMemo, useState } from "react";
import { Link } from "@/shared/navigation";
import { AppShell } from "@/components/layout/AppShell";
import { PageMeta } from "@/shared/ui/core/PageMeta";
import { Badge, Breadcrumbs, StatCard, ui } from "@/components/ui-kit";
import { useToast } from "@/components/Toaster";
import { useEntityStore } from "@/lib/state/useEntityStore";
import { hpCasesConfig, deliveriesConfig, receiptsConfig } from "@/lib/entities";
import { customersConfig } from "@/lib/entities/customers";
import { fmtPKR as Rs } from "@/lib/formatters/currency";
import {
  ArrowRight,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  ClipboardCheck,
  CreditCard,
  FileCheck2,
  FileText,
  PackageCheck,
  ShieldCheck,
  ShieldX,
  Upload,
  UserRound,
  Wallet,
} from "lucide-react";

type ContractTab = "overview" | "workflow" | "documents" | "activity";

type ActivityEntry = {
  id: string;
  title: string;
  detail: string;
  actor: string;
  role: string;
  at: string;
  tone?: "primary" | "success" | "warning" | "destructive" | "muted";
};

type DocumentItem = {
  key: string;
  name: string;
  owner: string;
  status: "Missing" | "Uploaded" | "Verified";
  updatedAt: string;
};

const TAB_ITEMS: { key: ContractTab; label: string }[] = [
  { key: "overview", label: "Overview" },
  { key: "workflow", label: "Workflow" },
  { key: "documents", label: "Documents" },
  { key: "activity", label: "Activity" },
];

const FINAL_STATUSES = new Set(["Approved", "Active", "Settled", "Defaulter", "Cancelled", "Repossessed"]);

function formatDateLabel(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string) {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function makeActivityId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

function badgeToneForStatus(status?: string) {
  if (status === "Rejected" || status === "Cancelled" || status === "Defaulter" || status === "Repossessed") return "destructive";
  if (status === "Approved" || status === "Active" || status === "Settled") return "success";
  if (status === "Under Verification" || status === "Under Approval") return "warning";
  if (status === "Under Process") return "primary";
  return "muted";
}

function defaultDocuments(contract: any): DocumentItem[] {
  const status = String(contract.status || "");
  const today = new Date().toISOString();
  const base = [
    { key: "application", name: "Application Form", owner: "Sales Ops", status: "Uploaded" as const, updatedAt: contract.startDate || today },
    { key: "cnic-front", name: "Customer CNIC Front", owner: "Verification Desk", status: "Uploaded" as const, updatedAt: contract.startDate || today },
    { key: "cnic-back", name: "Customer CNIC Back", owner: "Verification Desk", status: "Uploaded" as const, updatedAt: contract.startDate || today },
    { key: "income", name: "Income Proof", owner: "Verification Desk", status: status === "Under Process" ? "Missing" as const : "Uploaded" as const, updatedAt: contract.startDate || today },
    { key: "guarantor", name: "Guarantor CNIC", owner: "Verification Desk", status: contract.guarantor && contract.guarantor !== "-" ? "Uploaded" as const : "Missing" as const, updatedAt: contract.startDate || today },
    { key: "address", name: "Address Verification", owner: "Field Verification", status: status === "Under Process" ? "Missing" as const : "Uploaded" as const, updatedAt: contract.startDate || today },
  ];

  return base.map((item) => {
    if (status === "Under Verification" || status === "Under Approval" || FINAL_STATUSES.has(status)) {
      if (item.status === "Uploaded") {
        return { ...item, status: "Verified" as const };
      }
    }
    return item;
  });
}

function defaultActivity(contract: any): ActivityEntry[] {
  const start = contract.startDate ? `${contract.startDate}T09:30:00` : new Date().toISOString();
  const entries: ActivityEntry[] = [
    {
      id: `seed-${contract.id}-1`,
      title: "Contract created",
      detail: `Sales team opened ${contract.ref} for ${contract.customer}.`,
      actor: "Bilal Ahmed",
      role: "Sales Officer",
      at: start,
      tone: "primary",
    },
  ];

  const status = String(contract.status || "");

  if (["Under Verification", "Under Approval", ...Array.from(FINAL_STATUSES), "Rejected"].includes(status)) {
    entries.push({
      id: `seed-${contract.id}-2`,
      title: "Moved to verification",
      detail: "KYC packet and contract pack were routed to verification.",
      actor: "Sana Tariq",
      role: "Sales Manager",
      at: contract.startDate ? `${contract.startDate}T12:15:00` : start,
      tone: "warning",
    });
  }

  if (["Under Approval", ...Array.from(FINAL_STATUSES), "Rejected"].includes(status)) {
    entries.push({
      id: `seed-${contract.id}-3`,
      title: "Verification completed",
      detail: "Customer identity, guarantor and residence checks were marked complete.",
      actor: "Hira Saleem",
      role: "Verification Officer",
      at: contract.startDate ? `${contract.startDate}T16:40:00` : start,
      tone: "success",
    });
  }

  if (FINAL_STATUSES.has(status) || status === "Rejected") {
    entries.push({
      id: `seed-${contract.id}-4`,
      title: status === "Rejected" ? "Contract rejected" : "Approval decision recorded",
      detail: status === "Rejected" ? "Credit approval declined the contract after risk review." : "Credit approver cleared the contract for booking.",
      actor: "Ahmed Hassan",
      role: "Credit Manager",
      at: contract.startDate ? `${contract.startDate}T18:10:00` : start,
      tone: status === "Rejected" ? "destructive" : "success",
    });
  }

  if (["Active", "Settled", "Defaulter", "Cancelled", "Repossessed"].includes(status)) {
    entries.push({
      id: `seed-${contract.id}-5`,
      title: "Contract activated",
      detail: "The contract was handed to collections and EMI schedule went live.",
      actor: "Usman Tariq",
      role: "Operations Executive",
      at: contract.startDate ? `${contract.startDate}T19:05:00` : start,
      tone: "primary",
    });
  }

  return entries.reverse();
}

function normalizeContractData(contract: any) {
  return {
    documents: Array.isArray(contract.documents) ? contract.documents : defaultDocuments(contract),
    activity: Array.isArray(contract.activity) ? contract.activity : defaultActivity(contract),
  };
}

export function ContractProfilePage({ contractId }: { contractId: string }) {
  const [tab, setTab] = useState<ContractTab>("overview");
  const toast = useToast();
  const { items: contracts, update } = useEntityStore<any>(hpCasesConfig.storageKey, hpCasesConfig.seed);
  const { items: customers } = useEntityStore<any>(customersConfig.storageKey, customersConfig.seed);
  const { items: receipts } = useEntityStore<any>(receiptsConfig.storageKey, receiptsConfig.seed);
  const { items: deliveries } = useEntityStore<any>(deliveriesConfig.storageKey, deliveriesConfig.seed);

  const contract = contracts.find((item) => item.id === contractId);

  const normalized = useMemo(() => (contract ? normalizeContractData(contract) : null), [contract]);
  const contractReceipts = useMemo(
    () => (contract ? receipts.filter((item) => item.invoice === contract.ref || item.contract === contract.ref) : []),
    [receipts, contract],
  );
  const matchedCustomer = useMemo(
    () => (contract ? customers.find((item) => item.name === contract.customer || item.cnic === contract.cnic) : null),
    [customers, contract],
  );
  const contractDeliveries = useMemo(
    () => (contract ? deliveries.filter((item) => item.invoice === contract.ref || item.customer === contract.customer) : []),
    [deliveries, contract],
  );

  if (!contract || !normalized) {
    return (
      <AppShell>
        <PageMeta title="Contract Not Found" description="The requested contract could not be found." />
        <div className="rounded-xl border border-border bg-card p-12 text-center">
          <h1 className="text-lg font-semibold text-foreground">Contract Not Found</h1>
          <p className="mt-2 text-sm text-muted-foreground">No contract matches the requested record.</p>
          <Link to="/contracts" className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline">
            <ArrowRight className="h-4 w-4 rotate-180" /> Back to Contracts
          </Link>
        </div>
      </AppShell>
    );
  }

  const documents = normalized.documents;
  const activity = [...normalized.activity].sort((a, b) => new Date(b.at).getTime() - new Date(a.at).getTime());
  const paidAmount = contractReceipts.reduce((sum, item) => sum + Number(item.amount || item.paid || 0), 0);
  const outstanding = Math.max(0, Number(contract.financed || contract.totalPrice || 0) - paidAmount);
  const verificationReady = documents.every((item) => item.status !== "Missing");
  const verifiedCount = documents.filter((item) => item.status === "Verified").length;
  const nextDue = contractReceipts.find((item) => String(item.status || "").toLowerCase() === "pending")?.date || "";

  function appendActivity(entry: Omit<ActivityEntry, "id" | "at">) {
    const next = [
      {
        ...entry,
        id: makeActivityId(),
        at: new Date().toISOString(),
      },
      ...activity,
    ];
    update(contract.id, { activity: next } as any);
  }

  function patchContract(patch: Record<string, any>, message: string, description: string, activityEntry?: Omit<ActivityEntry, "id" | "at">) {
    update(contract.id, patch as any);
    if (activityEntry) appendActivity(activityEntry);
    toast.success(message, description);
  }

  function handleWorkflowAction(action: "submit" | "verify" | "rework" | "approve" | "reject" | "activate" | "settle") {
    if (action === "submit") {
      patchContract(
        { status: "Under Verification" },
        "Sent to verification",
        `${contract.ref} is now with the verification desk.`,
        {
          title: "Moved to verification",
          detail: "Sales operations handed the contract to verification.",
          actor: "Bilal Ahmed",
          role: "Sales Officer",
          tone: "warning",
        },
      );
      return;
    }

    if (action === "verify") {
      const nextDocs = documents.map((item) => ({ ...item, status: item.status === "Missing" ? "Uploaded" : "Verified", updatedAt: new Date().toISOString() }));
      patchContract(
        { status: "Under Approval", documents: nextDocs },
        "Verification completed",
        `${contract.ref} is now ready for credit approval.`,
        {
          title: "Verification completed",
          detail: "Verification desk completed customer and guarantor checks.",
          actor: "Hira Saleem",
          role: "Verification Officer",
          tone: "success",
        },
      );
      return;
    }

    if (action === "rework") {
      patchContract(
        { status: "Under Process" },
        "Sent back to sales",
        `${contract.ref} needs correction before verification can continue.`,
        {
          title: "Returned for correction",
          detail: "Verification desk sent the file back to sales for missing details.",
          actor: "Hira Saleem",
          role: "Verification Officer",
          tone: "destructive",
        },
      );
      return;
    }

    if (action === "approve") {
      patchContract(
        { status: "Approved" },
        "Contract approved",
        `${contract.ref} is approved and ready for activation.`,
        {
          title: "Approved by credit",
          detail: "Credit manager approved the contract after risk review.",
          actor: "Ahmed Hassan",
          role: "Credit Manager",
          tone: "success",
        },
      );
      return;
    }

    if (action === "reject") {
      patchContract(
        { status: "Rejected" },
        "Contract rejected",
        `${contract.ref} was marked rejected.`,
        {
          title: "Rejected by credit",
          detail: "Credit manager declined the file due to underwriting concerns.",
          actor: "Ahmed Hassan",
          role: "Credit Manager",
          tone: "destructive",
        },
      );
      return;
    }

    if (action === "activate") {
      patchContract(
        { status: "Active" },
        "Contract activated",
        `${contract.ref} is now live for collections and delivery follow-up.`,
        {
          title: "Contract activated",
          detail: "Operations activated the approved contract and released downstream actions.",
          actor: "Usman Tariq",
          role: "Operations Executive",
          tone: "primary",
        },
      );
      return;
    }

    patchContract(
      { status: "Settled" },
      "Marked settled",
      `${contract.ref} is now shown as settled.`,
      {
        title: "Contract settled",
        detail: "Collections confirmed the contract is fully settled.",
        actor: "Recovery Agent",
        role: "Collections",
        tone: "success",
      },
    );
  }

  function markDocumentUploaded(docKey: string) {
    const nextDocs = documents.map((item) => (
      item.key === docKey
        ? { ...item, status: "Uploaded" as const, updatedAt: new Date().toISOString() }
        : item
    ));
    const target = documents.find((item) => item.key === docKey);
    update(contract.id, { documents: nextDocs } as any);
    if (target) {
      appendActivity({
        title: "Document uploaded",
        detail: `${target.name} was uploaded to the contract file.`,
        actor: "Branch Desk",
        role: target.owner,
        tone: "primary",
      });
    }
    toast.success("Document updated", "The placeholder file status was updated locally.");
  }

  const workflowSteps = [
    {
      key: "sales",
      label: "Sales Intake",
      owner: "Sales Officer",
      description: "Customer profile, product selection and contract draft are prepared.",
      state: "done",
    },
    {
      key: "verification",
      label: "Verification Desk",
      owner: "Verification Officer",
      description: "KYC, guarantor and address checks are completed before approval.",
      state: ["Under Process"].includes(contract.status) ? "pending" : ["Under Verification"].includes(contract.status) ? "current" : "done",
    },
    {
      key: "approval",
      label: "Credit Approval",
      owner: "Credit Manager",
      description: "Credit team reviews affordability, risk and exceptions before approval.",
      state: ["Under Approval"].includes(contract.status) ? "current" : contract.status === "Rejected" ? "blocked" : FINAL_STATUSES.has(contract.status) ? "done" : "pending",
    },
    {
      key: "activation",
      label: "Activation & Collections",
      owner: "Operations / Collections",
      description: "Approved contracts are activated, delivered and monitored through EMI lifecycle.",
      state: ["Approved"].includes(contract.status) ? "current" : ["Active", "Settled", "Defaulter", "Cancelled", "Repossessed"].includes(contract.status) ? "done" : "pending",
    },
  ];

  return (
    <AppShell>
      <PageMeta title={contract.ref} description="Contract workflow view" />
      <div className={`mb-5 xl:mb-6 pb-4 xl:pb-5 ${ui.borderBottom}`}>
        <Breadcrumbs title={contract.ref} />
        <div className="mt-3 flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className={`${ui.textTitle} text-foreground`}>{contract.ref}</h1>
              <Badge tone={badgeToneForStatus(contract.status) as any}>{contract.status}</Badge>
            </div>
            <p className="mt-1 text-[13.5px] text-muted-foreground">
              Contract workspace for verification, document handling, approval and downstream actions.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Link
              to={matchedCustomer ? `/customers/${matchedCustomer.id}` : "/customers"}
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted"
            >
              <UserRound className="h-4 w-4" /> {matchedCustomer ? "View Customer" : "Customer List"}
            </Link>
            <Link
              to="/payments-received/new"
              className="h-10 px-4 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium shadow-sm shadow-primary/30 hover:bg-primary/90"
            >
              <Wallet className="h-4 w-4" /> Record Payment
            </Link>
          </div>
        </div>
      </div>

      <div className="rounded-xl border border-border bg-card p-5 shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
        <div className="flex items-start gap-4 flex-wrap">
          <div className="h-14 w-14 rounded-xl bg-primary/10 grid place-items-center text-primary">
            <CreditCard className="h-7 w-7" />
          </div>
          <div className="flex-1 min-w-[280px]">
            <div className="flex items-center gap-x-5 gap-y-2 flex-wrap text-sm">
              <InfoLine label="Customer" value={contract.customer} />
              <InfoLine label="CNIC" value={contract.cnic || "-"} />
              <InfoLine label="Product" value={contract.product} />
              <InfoLine label="Guarantor" value={contract.guarantor || "-"} />
            </div>
          </div>
          <div className="grid gap-2 text-sm min-w-[210px]">
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Started</div>
              <div className="mt-1 font-medium text-foreground">{formatDateLabel(contract.startDate)}</div>
            </div>
            <div className="rounded-lg border border-border bg-muted/30 px-3 py-2">
              <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">Next due</div>
              <div className="mt-1 font-medium text-foreground">{formatDateLabel(nextDue)}</div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-3 xl:gap-4 my-5">
        <StatCard label="Financed Amount" value={Rs(contract.financed || 0)} icon={<Wallet className="h-4 w-4" />} tone="primary" hint={`Down payment ${Rs(contract.down || 0)}`} />
        <StatCard label="Monthly EMI" value={Rs(contract.monthly || 0)} icon={<CalendarClock className="h-4 w-4" />} tone="primary" hint={`${contract.tenure || 0} month tenure`} />
        <StatCard label="Collected" value={Rs(paidAmount)} icon={<BadgeCheck className="h-4 w-4" />} tone="success" hint={`${contractReceipts.length} receipt entries`} />
        <StatCard label="Outstanding" value={Rs(outstanding)} icon={<ClipboardCheck className="h-4 w-4" />} tone={outstanding > 0 ? "warning" : "success"} hint={verificationReady ? "Verification file complete" : "Missing verification inputs"} />
      </div>

      <div className="rounded-xl border border-border bg-card overflow-hidden shadow-[0_1px_2px_0_rgba(16,24,40,0.04)]">
        <div className="flex border-b border-border px-2 overflow-x-auto">
          {TAB_ITEMS.map((item) => (
            <button
              key={item.key}
              type="button"
              onClick={() => setTab(item.key)}
              className={`inline-flex items-center px-4 py-3 text-sm font-medium whitespace-nowrap border-b-2 -mb-px transition-colors ${
                tab === item.key ? "border-primary text-primary" : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-5">
          {tab === "overview" && (
            <div className="grid gap-5 xl:grid-cols-[1.35fr_0.85fr]">
              <div className="space-y-5">
                <Panel title="Commercial Snapshot" icon={<Wallet className="h-4 w-4" />}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <KeyValue label="Cash price" value={Rs(contract.totalPrice || 0)} />
                    <KeyValue label="Financed" value={Rs(contract.financed || 0)} />
                    <KeyValue label="Down payment" value={Rs(contract.down || 0)} />
                    <KeyValue label="Monthly EMI" value={Rs(contract.monthly || 0)} />
                    <KeyValue label="Tenure" value={`${contract.tenure || 0} months`} />
                    <KeyValue label="Outstanding" value={Rs(outstanding)} />
                  </div>
                </Panel>

                <Panel title="Linked Operations" icon={<PackageCheck className="h-4 w-4" />}>
                  <div className="grid sm:grid-cols-2 gap-3">
                    <SummaryCard label="Receipts" value={String(contractReceipts.length)} hint={contractReceipts[0] ? `Latest ${formatDateLabel(contractReceipts[0].date)}` : "No payments yet"} />
                    <SummaryCard label="Delivery items" value={String(contractDeliveries.length)} hint={contractDeliveries[0] ? contractDeliveries[0].status : "No delivery linked"} />
                  </div>
                </Panel>
              </div>

              <div className="space-y-5">
                <Panel title="Current Owner Queue" icon={<ShieldCheck className="h-4 w-4" />}>
                  <div className="space-y-3">
                    <QueueCard title="Verification Desk" active={contract.status === "Under Verification"} detail={verificationReady ? "File looks complete for verification." : "Documents still need to be completed."} />
                    <QueueCard title="Credit Approval" active={contract.status === "Under Approval"} detail="Approval role takes over only after verification is complete." />
                    <QueueCard title="Operations / Collections" active={["Approved", "Active"].includes(contract.status)} detail="Activation, delivery and EMI monitoring happen here." />
                  </div>
                </Panel>

                <Panel title="Recent Activity" icon={<FileText className="h-4 w-4" />}>
                  <div className="space-y-3">
                    {activity.slice(0, 4).map((entry) => (
                      <div key={entry.id} className="rounded-lg border border-border bg-muted/20 px-3 py-2.5">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-foreground">{entry.title}</div>
                          <div className="text-[11px] font-medium text-muted-foreground">{formatDateTime(entry.at)}</div>
                        </div>
                        <div className="mt-1 text-[12px] text-muted-foreground">{entry.detail}</div>
                      </div>
                    ))}
                  </div>
                </Panel>
              </div>
            </div>
          )}

          {tab === "workflow" && (
            <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
              <Panel title="Workflow Channel" icon={<ArrowRight className="h-4 w-4" />}>
                <div className="space-y-4">
                  {workflowSteps.map((step, index) => (
                    <div key={step.key} className="relative pl-7">
                      {index < workflowSteps.length - 1 && <span className="absolute left-[11px] top-7 h-[calc(100%+10px)] w-px bg-border" />}
                      <span className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border grid place-items-center ${
                        step.state === "done"
                          ? "border-success bg-success/10 text-success"
                          : step.state === "current"
                            ? "border-primary bg-primary/10 text-primary"
                            : step.state === "blocked"
                              ? "border-destructive bg-destructive/10 text-destructive"
                              : "border-border bg-muted/40 text-muted-foreground"
                      }`}>
                        {step.state === "done" ? <CheckCircle2 className="h-3.5 w-3.5" /> : step.state === "blocked" ? <ShieldX className="h-3.5 w-3.5" /> : <span className="h-2 w-2 rounded-full bg-current" />}
                      </span>
                      <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                        <div className="flex items-center justify-between gap-3">
                          <div className="text-sm font-medium text-foreground">{step.label}</div>
                          <Badge tone={step.state === "done" ? "success" : step.state === "current" ? "primary" : step.state === "blocked" ? "destructive" : "muted"}>
                            {step.state === "done" ? "Done" : step.state === "current" ? "Current" : step.state === "blocked" ? "Blocked" : "Pending"}
                          </Badge>
                        </div>
                        <div className="mt-1 text-[12px] text-muted-foreground">{step.description}</div>
                        <div className="mt-2 text-[12px] font-medium text-foreground/80">{step.owner}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="Role Actions" icon={<ClipboardCheck className="h-4 w-4" />}>
                <div className="space-y-3">
                  {contract.status === "Under Process" && (
                    <ActionButton label="Send to Verification" description="Move the file to the verification desk." onClick={() => handleWorkflowAction("submit")} />
                  )}
                  {contract.status === "Under Verification" && (
                    <>
                      <ActionButton label="Mark Verified" description="Complete verification and route to approval." onClick={() => handleWorkflowAction("verify")} />
                      <ActionButton label="Return to Sales" description="Send back for corrections or missing inputs." tone="secondary" onClick={() => handleWorkflowAction("rework")} />
                    </>
                  )}
                  {contract.status === "Under Approval" && (
                    <>
                      <ActionButton label="Approve Contract" description="Approve and release to operations." onClick={() => handleWorkflowAction("approve")} />
                      <ActionButton label="Reject Contract" description="Stop the workflow with a rejection decision." tone="danger" onClick={() => handleWorkflowAction("reject")} />
                    </>
                  )}
                  {contract.status === "Approved" && (
                    <ActionButton label="Activate Contract" description="Push the approved file into live collections." onClick={() => handleWorkflowAction("activate")} />
                  )}
                  {contract.status === "Active" && (
                    <ActionButton label="Mark Settled" description="Use this only when the contract is fully closed." onClick={() => handleWorkflowAction("settle")} />
                  )}
                  {["Rejected", "Settled", "Defaulter", "Cancelled", "Repossessed"].includes(contract.status) && (
                    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                      No further workflow actions are exposed for this state in the demo UI.
                    </div>
                  )}
                </div>
              </Panel>
            </div>
          )}

          {tab === "documents" && (
            <div className="grid gap-5 xl:grid-cols-[1.05fr_0.95fr]">
              <Panel title="Document Checklist" icon={<FileCheck2 className="h-4 w-4" />}>
                <div className="space-y-3">
                  {documents.map((item) => (
                    <div key={item.key} className="flex items-center justify-between gap-3 rounded-lg border border-border bg-muted/20 px-4 py-3">
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-foreground">{item.name}</div>
                        <div className="mt-1 text-[12px] text-muted-foreground">{item.owner} • {formatDateTime(item.updatedAt)}</div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <Badge tone={item.status === "Verified" ? "success" : item.status === "Uploaded" ? "primary" : "warning"}>
                          {item.status}
                        </Badge>
                        {item.status === "Missing" && (
                          <button
                            type="button"
                            onClick={() => markDocumentUploaded(item.key)}
                            className="h-9 px-3 inline-flex items-center gap-2 rounded-lg border border-border bg-card text-sm font-medium text-foreground hover:bg-muted"
                          >
                            <Upload className="h-4 w-4" /> Upload
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </Panel>

              <Panel title="File Readiness" icon={<ShieldCheck className="h-4 w-4" />}>
                <div className="space-y-3">
                  <SummaryCard label="Verified documents" value={`${verifiedCount}/${documents.length}`} hint="All mandatory items should be verified before approval." />
                  <SummaryCard label="Missing items" value={String(documents.filter((item) => item.status === "Missing").length)} hint="These are the items currently blocking verification." />
                  <div className="rounded-lg border border-border bg-muted/20 px-4 py-3 text-sm text-muted-foreground">
                    Documents stay role-driven here: sales uploads intake files, verification checks them, and approval only sees the cleaned packet.
                  </div>
                </div>
              </Panel>
            </div>
          )}

          {tab === "activity" && (
            <Panel title="Activity Timeline" icon={<CalendarClock className="h-4 w-4" />}>
              <div className="space-y-4">
                {activity.map((entry, index) => (
                  <div key={entry.id} className="relative pl-8">
                    {index < activity.length - 1 && <span className="absolute left-[11px] top-7 h-[calc(100%+12px)] w-px bg-border" />}
                    <span className={`absolute left-0 top-1.5 h-6 w-6 rounded-full border grid place-items-center ${
                      entry.tone === "success"
                        ? "border-success bg-success/10 text-success"
                        : entry.tone === "warning"
                          ? "border-warning bg-warning/15 text-warning-foreground"
                          : entry.tone === "destructive"
                            ? "border-destructive bg-destructive/10 text-destructive"
                            : entry.tone === "muted"
                              ? "border-border bg-muted/40 text-muted-foreground"
                              : "border-primary bg-primary/10 text-primary"
                    }`}>
                      <span className="h-2 w-2 rounded-full bg-current" />
                    </span>
                    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
                      <div className="flex items-center justify-between gap-3">
                        <div className="text-sm font-medium text-foreground">{entry.title}</div>
                        <div className="text-[11px] font-medium text-muted-foreground">{formatDateTime(entry.at)}</div>
                      </div>
                      <div className="mt-1 text-[12px] text-muted-foreground">{entry.detail}</div>
                      <div className="mt-2 text-[12px] font-medium text-foreground/80">{entry.actor} • {entry.role}</div>
                    </div>
                  </div>
                ))}
              </div>
            </Panel>
          )}
        </div>
      </div>
    </AppShell>
  );
}

function Panel({ title, icon, children }: { title: string; icon: React.ReactNode; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border bg-card">
      <div className="flex items-center gap-2 border-b border-border px-4 py-3">
        <span className="text-primary">{icon}</span>
        <h2 className="text-sm font-semibold text-foreground">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </section>
  );
}

function InfoLine({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <span className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</span>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function KeyValue({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-sm font-medium text-foreground">{value}</div>
    </div>
  );
}

function SummaryCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-lg border border-border bg-muted/20 px-4 py-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.08em] text-muted-foreground">{label}</div>
      <div className="mt-1 text-lg font-semibold text-foreground">{value}</div>
      <div className="mt-1 text-[12px] text-muted-foreground">{hint}</div>
    </div>
  );
}

function QueueCard({ title, detail, active }: { title: string; detail: string; active?: boolean }) {
  return (
    <div className={`rounded-lg border px-4 py-3 ${active ? "border-primary/30 bg-primary/5" : "border-border bg-muted/20"}`}>
      <div className={`text-sm font-medium ${active ? "text-primary" : "text-foreground"}`}>{title}</div>
      <div className="mt-1 text-[12px] text-muted-foreground">{detail}</div>
    </div>
  );
}

function ActionButton({
  label,
  description,
  onClick,
  tone = "primary",
}: {
  label: string;
  description: string;
  onClick: () => void;
  tone?: "primary" | "secondary" | "danger";
}) {
  const styles = tone === "danger"
    ? "border-destructive/20 bg-destructive/5 text-destructive hover:bg-destructive/10"
    : tone === "secondary"
      ? "border-border bg-card text-foreground hover:bg-muted"
      : "border-primary/20 bg-primary text-primary-foreground hover:bg-primary/90";

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full rounded-lg border px-4 py-3 text-left transition-colors ${styles}`}
    >
      <div className="text-sm font-semibold">{label}</div>
      <div className={`mt-1 text-[12px] ${tone === "primary" ? "text-primary-foreground/85" : ""}`}>{description}</div>
    </button>
  );
}
