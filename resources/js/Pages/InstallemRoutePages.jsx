import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/ui-kit";
import { useRouter } from "@tanstack/react-router";
import { useEntityStore } from "@/lib/useEntityStore";
import {
  grnConfig,
  hpCasesConfig,
  installmentPlansConfig,
  purchaseOrdersConfig,
  purchaseReturnsConfig,
} from "@/lib/entities";
import { PurchaseOrderForm } from "@/components/forms/PurchaseOrderForm";
import { GrnForm } from "@/components/forms/GrnForm";
import { PurchaseReturnForm } from "@/components/forms/PurchaseReturnForm";
import { InstallmentPlanWizard } from "@/components/wizards/InstallmentPlanWizard";
import { NewHpCaseWizard } from "@/components/hp-wizard/NewHpCaseWizard";

function RoutedFormShell({ children }) {
  return (
    <AppShell>
      <div className="pb-28">{children}</div>
    </AppShell>
  );
}

function MissingRecordPage({ title, backTo }) {
  const router = useRouter();

  return (
    <AppShell>
      <PageHeader
        title={`${title} Not Found`}
        description="The requested record could not be found in local demo storage."
        actions={(
          <button
            type="button"
            onClick={() => router.navigate({ to: backTo })}
            className="h-10 px-4 inline-flex items-center gap-2 rounded-lg border border-border bg-card text-sm font-medium hover:bg-muted"
          >
            Back to list
          </button>
        )}
      />
    </AppShell>
  );
}

function PurchaseOrderRoute({ mode, recordId }) {
  const router = useRouter();
  const { items, create, update } = useEntityStore(purchaseOrdersConfig.storageKey, purchaseOrdersConfig.seed);
  const record = mode === "edit" ? items.find((item) => item.id === recordId) : undefined;

  if (mode === "edit" && !record) {
    return <MissingRecordPage title="Purchase Order" backTo="/purchases/orders" />;
  }

  return (
    <RoutedFormShell>
      <PurchaseOrderForm
        initial={record}
        isEdit={mode === "edit"}
        pageMode
        onClose={() => router.navigate({ to: "/purchases/orders" })}
        onSubmit={(values) => {
          if (record) {
            update(record.id, values);
          } else {
            create(values);
          }

          router.navigate({ to: "/purchases/orders" });
        }}
      />
    </RoutedFormShell>
  );
}

function GrnRoute() {
  const router = useRouter();
  const { create } = useEntityStore(grnConfig.storageKey, grnConfig.seed);

  return (
    <RoutedFormShell>
      <GrnForm
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/purchases/grn" })}
        onSubmit={(values) => {
          create(values);
          router.navigate({ to: "/purchases/grn" });
        }}
      />
    </RoutedFormShell>
  );
}

function PurchaseReturnRoute() {
  const router = useRouter();
  const { create } = useEntityStore(purchaseReturnsConfig.storageKey, purchaseReturnsConfig.seed);

  return (
    <RoutedFormShell>
      <PurchaseReturnForm
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/purchases/returns" })}
        onSubmit={(values) => {
          create(values);
          router.navigate({ to: "/purchases/returns" });
        }}
      />
    </RoutedFormShell>
  );
}

function ContractRoute() {
  const router = useRouter();

  return (
    <RoutedFormShell>
      <NewHpCaseWizard onClose={() => router.navigate({ to: "/contracts" })} />
    </RoutedFormShell>
  );
}

function InstallmentPlanRoute() {
  const router = useRouter();
  const { create } = useEntityStore(installmentPlansConfig.storageKey, installmentPlansConfig.seed);

  return (
    <RoutedFormShell>
      <InstallmentPlanWizard
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/installments/plans" })}
        onSubmit={(values) => {
          create(values);
          router.navigate({ to: "/installments/plans" });
        }}
      />
    </RoutedFormShell>
  );
}

export function InstallemRoutePages({ pathname }) {
  if (pathname === purchaseOrdersConfig.addHref) {
    return <PurchaseOrderRoute mode="create" />;
  }

  const purchaseOrderEditMatch = pathname.match(/^\/purchases\/orders\/([^/]+)\/edit$/);
  if (purchaseOrderEditMatch) {
    return <PurchaseOrderRoute mode="edit" recordId={purchaseOrderEditMatch[1]} />;
  }

  if (pathname === grnConfig.addHref) {
    return <GrnRoute />;
  }

  if (pathname === purchaseReturnsConfig.addHref) {
    return <PurchaseReturnRoute />;
  }

  if (pathname === hpCasesConfig.addHref) {
    return <ContractRoute />;
  }

  if (pathname === installmentPlansConfig.addHref) {
    return <InstallmentPlanRoute />;
  }

  return null;
}
