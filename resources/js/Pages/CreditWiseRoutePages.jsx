import { WizardPageShell } from "@/shared/ui/wizards/WizardPageShell";
import { useRouter } from "@/shared/navigation";
import { useToast } from "@/shared/ui/core/Toaster";
import { useEntityStore } from "@/lib/state/useEntityStore";
import { RouteNotFoundPage } from "@/pages/common/RouteNotFoundPage";
import {
  billsConfig,
  expensesConfig,
  grnConfig,
  paymentsMadeConfig,
  purchaseOrdersConfig,
  purchaseReturnsConfig,
  suppliersConfig,
} from "@/lib/entities/purchases";
import {
  customersConfig,
} from "@/lib/entities/customers";
import {
  employeesConfig,
} from "@/lib/entities/hr";
import {
  hpCasesConfig,
  installmentPlansConfig,
  paymentsReceivedConfig,
  salesConfig,
} from "@/lib/entities/sales";
import {
  productsConfig,
} from "@/lib/entities/catalog";
import { ContractFormPage } from "@/components/sales/contracts/ContractFormPage";
import { BillForm } from "@/components/purchases/bills/BillForm";
import { ExpenseForm } from "@/components/purchases/expenses/ExpenseForm";
import { InvoiceForm } from "@/components/sales/invoices/InvoiceForm";
import { PaymentForm } from "@/components/purchases/payments/PaymentForm";
import { ReceiptForm } from "@/components/sales/payments/ReceiptForm";
import { PurchaseOrderForm } from "@/components/purchases/orders/PurchaseOrderForm";
import { GrnForm } from "@/components/purchases/receipts/GrnForm";
import { PurchaseReturnForm } from "@/components/purchases/returns/PurchaseReturnForm";
import { ProductWizard } from "@/components/purchases/catalog/ProductWizard";
import { CustomerWizard } from "@/components/sales/customers/CustomerWizard";
import { EmployeeWizard } from "@/components/workforce/hr/EmployeeWizard";
import { InstallmentPlanWizard } from "@/components/sales/installments/InstallmentPlanWizard";
import { SupplierWizard } from "@/components/purchases/suppliers/SupplierWizard";
import { NewHpCaseWizard } from "@/components/system/support/NewHpCaseWizard";

function MissingRecordPage({ title, backTo }) {
  const router = useRouter();

  return (
    <WizardPageShell title={`${title} Not Found`} backTo={backTo} backLabel="Back to list" crumb={[]}>
      <div className="rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        The requested record could not be found in local demo storage.
      </div>
    </WizardPageShell>
  );
}

function PurchaseOrderRoute({ mode, recordId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, create, update } = useEntityStore(purchaseOrdersConfig.storageKey, purchaseOrdersConfig.seed);
  const record = mode === "edit" ? items.find((item) => item.id === recordId) : undefined;

  if (mode === "edit" && !record) {
    return <MissingRecordPage title="Purchase Order" backTo="/purchases/orders" />;
  }

  return (
    <WizardPageShell
      title={mode === "edit" ? "Edit Purchase Order" : "Add Purchase Order"}
      backTo="/purchases/orders"
      backLabel="Back to Purchase Orders"
      crumb={[
        { label: "Purchases" },
        { label: "Purchase Orders", to: "/purchases/orders" },
        { label: mode === "edit" ? "Edit" : "Add New" },
      ]}
    >
      <PurchaseOrderForm
        initial={record}
        isEdit={mode === "edit"}
        pageMode
        onClose={() => router.navigate({ to: "/purchases/orders" })}
        onSubmit={(values) => {
          if (record) {
            update(record.id, values);
            toast.success("Purchase order updated");
          } else {
            create(values);
            toast.success("Purchase order created");
          }

          router.navigate({ to: "/purchases/orders" });
        }}
      />
    </WizardPageShell>
  );
}

function GrnRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(grnConfig.storageKey, grnConfig.seed);

  return (
    <WizardPageShell
      title="New GRN"
      backTo="/purchases/grn"
      backLabel="Back to GRN"
      crumb={[
        { label: "Purchases" },
        { label: "GRN", to: "/purchases/grn" },
        { label: "Add New" },
      ]}
    >
      <GrnForm
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/purchases/grn" })}
        onSubmit={(values) => {
          create(values);
          toast.success("GRN created");
          router.navigate({ to: "/purchases/grn" });
        }}
      />
    </WizardPageShell>
  );
}

function PurchaseReturnRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(purchaseReturnsConfig.storageKey, purchaseReturnsConfig.seed);

  return (
    <WizardPageShell
      title="New Purchase Return"
      backTo="/purchases/returns"
      backLabel="Back to Purchase Returns"
      crumb={[
        { label: "Purchases" },
        { label: "Purchase Returns", to: "/purchases/returns" },
        { label: "Add New" },
      ]}
    >
      <PurchaseReturnForm
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/purchases/returns" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Purchase return created");
          router.navigate({ to: "/purchases/returns" });
        }}
      />
    </WizardPageShell>
  );
}

function ContractRoute() {
  const router = useRouter();

  return (
    <WizardPageShell
      title="New Contract"
      backTo="/contracts"
      backLabel="Back to Contracts"
      crumb={[
        { label: "Contracts", to: "/contracts" },
        { label: "New Contract" },
      ]}
    >
      <ContractFormPage onClose={() => router.navigate({ to: "/contracts/under-process" })} />
    </WizardPageShell>
  );
}

function SupportHpCaseRoute() {
  const router = useRouter();

  return (
    <WizardPageShell
      title="Add New HP Case"
      backTo="/support/hp-cases"
      backLabel="Back to HP Cases"
      crumb={[
        { label: "Support" },
        { label: "HP Cases", to: "/support/hp-cases" },
        { label: "Add New" },
      ]}
    >
      <NewHpCaseWizard onClose={() => router.navigate({ to: "/support/hp-cases" })} />
    </WizardPageShell>
  );
}

function InstallmentPlanRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(installmentPlansConfig.storageKey, installmentPlansConfig.seed);

  return (
    <WizardPageShell
      title="Add Installment Plan"
      backTo="/installments/plans"
      backLabel="Back to Installment Plans"
      crumb={[
        { label: "Installments" },
        { label: "Plans", to: "/installments/plans" },
        { label: "Add New" },
      ]}
    >
      <InstallmentPlanWizard
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/installments/plans" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Installment plan created");
          router.navigate({ to: "/installments/plans" });
        }}
      />
    </WizardPageShell>
  );
}

function InvoiceRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(salesConfig.storageKey, salesConfig.seed);

  return (
    <WizardPageShell
      title="New Invoice"
      backTo="/sales/invoices"
      backLabel="Back to Invoices"
      crumb={[
        { label: "Sales" },
        { label: "Invoices", to: "/sales/invoices" },
        { label: "Add New" },
      ]}
    >
      <InvoiceForm
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/sales/invoices" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Invoice created");
          router.navigate({ to: "/sales/invoices" });
        }}
      />
    </WizardPageShell>
  );
}

function BillRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(billsConfig.storageKey, billsConfig.seed);

  return (
    <WizardPageShell
      title="New Bill"
      backTo="/purchases/bills"
      backLabel="Back to Bills"
      crumb={[
        { label: "Purchases" },
        { label: "Bills", to: "/purchases/bills" },
        { label: "Add New" },
      ]}
    >
      <BillForm
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/purchases/bills" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Bill created");
          router.navigate({ to: "/purchases/bills" });
        }}
      />
    </WizardPageShell>
  );
}

function ExpenseRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(expensesConfig.storageKey, expensesConfig.seed);

  return (
    <WizardPageShell
      title="Record Expense"
      backTo="/purchases/expenses"
      backLabel="Back to Expenses"
      crumb={[
        { label: "Purchases" },
        { label: "Expenses", to: "/purchases/expenses" },
        { label: "Add New" },
      ]}
    >
      <ExpenseForm
        isEdit={false}
        onClose={() => router.navigate({ to: "/purchases/expenses" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Expense recorded");
          router.navigate({ to: "/purchases/expenses" });
        }}
      />
    </WizardPageShell>
  );
}

function PaymentMadeRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(paymentsMadeConfig.storageKey, paymentsMadeConfig.seed);

  return (
    <WizardPageShell
      title="Record Payment"
      backTo="/purchases/payments"
      backLabel="Back to Payments"
      crumb={[
        { label: "Purchases" },
        { label: "Payments", to: "/purchases/payments" },
        { label: "Add New" },
      ]}
    >
      <PaymentForm
        isEdit={false}
        onClose={() => router.navigate({ to: "/purchases/payments" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Payment recorded");
          router.navigate({ to: "/purchases/payments" });
        }}
      />
    </WizardPageShell>
  );
}

function PaymentReceivedRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(paymentsReceivedConfig.storageKey, paymentsReceivedConfig.seed);

  return (
    <WizardPageShell
      title="Record Payment"
      backTo="/payments-received"
      backLabel="Back to Payments"
      crumb={[
        { label: "Payments Received", to: "/payments-received" },
        { label: "Add Payment" },
      ]}
    >
      <ReceiptForm
        onClose={() => router.navigate({ to: "/payments-received" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Payment recorded");
          router.navigate({ to: "/payments-received" });
        }}
      />
    </WizardPageShell>
  );
}

function SupplierRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(suppliersConfig.storageKey, suppliersConfig.seed);

  return (
    <WizardPageShell
      title="Add New Supplier"
      backTo="/purchases/suppliers"
      backLabel="Back to Suppliers"
      crumb={[
        { label: "Purchases" },
        { label: "Suppliers", to: "/purchases/suppliers" },
        { label: "Add New" },
      ]}
    >
      <SupplierWizard
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/purchases/suppliers" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Supplier created");
          router.navigate({ to: "/purchases/suppliers" });
        }}
      />
    </WizardPageShell>
  );
}

function ProductEditRoute({ productId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, update } = useEntityStore(productsConfig.storageKey, productsConfig.seed);
  const record = items.find((item) => item.id === productId);

  if (!record) {
    return <MissingRecordPage title="Product" backTo="/catalog/products" />;
  }

  return (
    <WizardPageShell
      title={`Edit ${record.name}`}
      backTo="/catalog/products"
      backLabel="Back to Products"
      crumb={[
        { label: "Catalog" },
        { label: "Products", to: "/catalog/products" },
        { label: record.name },
      ]}
    >
      <ProductWizard
        isEdit
        pageMode
        initial={record}
        onClose={() => router.navigate({ to: "/catalog/products" })}
        onSubmit={(values) => {
          update(record.id, values);
          toast.success("Product updated");
          router.navigate({ to: "/catalog/products" });
        }}
      />
    </WizardPageShell>
  );
}

function ProductRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(productsConfig.storageKey, productsConfig.seed);

  return (
    <WizardPageShell
      title="Add New Product"
      backTo="/catalog/products"
      backLabel="Back to Products"
      crumb={[
        { label: "Catalog" },
        { label: "Products", to: "/catalog/products" },
        { label: "Add New" },
      ]}
    >
      <ProductWizard
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/catalog/products" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Product created");
          router.navigate({ to: "/catalog/products" });
        }}
      />
    </WizardPageShell>
  );
}

function CustomerRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(customersConfig.storageKey, customersConfig.seed);

  return (
    <WizardPageShell
      title="Add New Customer"
      backTo="/customers"
      backLabel="Back to Customers"
      crumb={[
        { label: "Customers", to: "/customers" },
        { label: "Add New" },
      ]}
    >
      <CustomerWizard
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/customers" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Customer created");
          router.navigate({ to: "/customers" });
        }}
      />
    </WizardPageShell>
  );
}

function CustomerEditRoute({ customerId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, update } = useEntityStore(customersConfig.storageKey, customersConfig.seed);
  const record = items.find((item) => item.id === customerId);

  if (!record) {
    return <MissingRecordPage title="Customer" backTo="/customers" />;
  }

  return (
    <WizardPageShell
      title={`Edit - ${record.name}`}
      backTo="/customers"
      backLabel="Back to Customers"
      crumb={[
        { label: "Customers", to: "/customers" },
        { label: record.name },
      ]}
    >
      <CustomerWizard
        isEdit
        pageMode
        initial={record}
        onClose={() => router.navigate({ to: `/customers/${customerId}` })}
        onSubmit={(values) => {
          update(record.id, values);
          toast.success("Customer updated");
          router.navigate({ to: `/customers/${customerId}` });
        }}
      />
    </WizardPageShell>
  );
}

function EmployeeRoute() {
  const router = useRouter();
  const toast = useToast();
  const { create } = useEntityStore(employeesConfig.storageKey, employeesConfig.seed);

  return (
    <WizardPageShell
      title="Add New Employee"
      backTo="/hr/employees"
      backLabel="Back to Employees"
      crumb={[
        { label: "HR" },
        { label: "Employees", to: "/hr/employees" },
        { label: "Add New" },
      ]}
    >
      <EmployeeWizard
        isEdit={false}
        pageMode
        onClose={() => router.navigate({ to: "/hr/employees" })}
        onSubmit={(values) => {
          create(values);
          toast.success("Employee created");
          router.navigate({ to: "/hr/employees" });
        }}
      />
    </WizardPageShell>
  );
}

function EmployeeEditRoute({ employeeId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, update } = useEntityStore(employeesConfig.storageKey, employeesConfig.seed);
  const record = items.find((item) => item.id === employeeId);

  if (!record) {
    return <MissingRecordPage title="Employee" backTo="/hr/employees" />;
  }

  return (
    <WizardPageShell
      title={`Edit - ${record.name}`}
      backTo="/hr/employees"
      backLabel="Back to Employees"
      crumb={[
        { label: "HR" },
        { label: "Employees", to: "/hr/employees" },
        { label: record.name },
      ]}
    >
      <EmployeeWizard
        isEdit
        pageMode
        initial={record}
        onClose={() => router.navigate({ to: `/hr/employees/${employeeId}` })}
        onSubmit={(values) => {
          update(record.id, values);
          toast.success("Employee updated");
          router.navigate({ to: `/hr/employees/${employeeId}` });
        }}
      />
    </WizardPageShell>
  );
}

function SupplierEditRoute({ supplierId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, update } = useEntityStore(suppliersConfig.storageKey, suppliersConfig.seed);
  const record = items.find((item) => item.id === supplierId);

  if (!record) {
    return <MissingRecordPage title="Supplier" backTo="/purchases/suppliers" />;
  }

  return (
    <WizardPageShell
      title={`Edit ${record.name}`}
      backTo="/purchases/suppliers"
      backLabel="Back to Suppliers"
      crumb={[
        { label: "Purchases" },
        { label: "Suppliers", to: "/purchases/suppliers" },
        { label: record.name },
        { label: "Edit" },
      ]}
    >
      <SupplierWizard
        isEdit
        pageMode
        initial={record}
        onClose={() => router.navigate({ to: `/purchases/suppliers/${supplierId}` })}
        onSubmit={(values) => {
          update(record.id, values);
          toast.success("Supplier updated");
          router.navigate({ to: `/purchases/suppliers/${supplierId}` });
        }}
      />
    </WizardPageShell>
  );
}

function BillEditRoute({ billId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, update } = useEntityStore(billsConfig.storageKey, billsConfig.seed);
  const record = items.find((item) => item.id === billId);

  if (!record) {
    return <MissingRecordPage title="Bill" backTo="/purchases/bills" />;
  }

  return (
    <WizardPageShell
      title="Edit Bill"
      backTo="/purchases/bills"
      backLabel="Back to Bills"
      crumb={[
        { label: "Purchases" },
        { label: "Bills", to: "/purchases/bills" },
        { label: record.ref ?? "Edit" },
      ]}
    >
      <BillForm
        isEdit
        pageMode
        initial={record}
        onClose={() => router.navigate({ to: "/purchases/bills" })}
        onSubmit={(values) => {
          update(record.id, values);
          toast.success("Bill updated");
          router.navigate({ to: "/purchases/bills" });
        }}
      />
    </WizardPageShell>
  );
}

function PaymentMadeEditRoute({ paymentId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, update } = useEntityStore(paymentsMadeConfig.storageKey, paymentsMadeConfig.seed);
  const record = items.find((item) => item.id === paymentId);

  if (!record) {
    return <MissingRecordPage title="Payment" backTo="/purchases/payments" />;
  }

  return (
    <WizardPageShell
      title={`Edit ${record.ref ?? "Payment"}`}
      backTo="/purchases/payments"
      backLabel="Back to Payments"
      crumb={[
        { label: "Purchases" },
        { label: "Payments", to: "/purchases/payments" },
        { label: record.ref ?? "Edit" },
      ]}
    >
      <PaymentForm
        isEdit
        initial={record}
        onClose={() => router.navigate({ to: "/purchases/payments" })}
        onSubmit={(values) => {
          update(record.id, values);
          toast.success("Payment updated");
          router.navigate({ to: "/purchases/payments" });
        }}
      />
    </WizardPageShell>
  );
}

function ExpenseEditRoute({ expenseId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, update } = useEntityStore(expensesConfig.storageKey, expensesConfig.seed);
  const record = items.find((item) => item.id === expenseId);

  if (!record) {
    return <MissingRecordPage title="Expense" backTo="/purchases/expenses" />;
  }

  return (
    <WizardPageShell
      title={`Edit ${record.ref ?? "Expense"}`}
      backTo="/purchases/expenses"
      backLabel="Back to Expenses"
      crumb={[
        { label: "Purchases" },
        { label: "Expenses", to: "/purchases/expenses" },
        { label: record.ref ?? "Edit" },
      ]}
    >
      <ExpenseForm
        isEdit
        initial={record}
        onClose={() => router.navigate({ to: "/purchases/expenses" })}
        onSubmit={(values) => {
          update(record.id, values);
          toast.success("Expense updated");
          router.navigate({ to: "/purchases/expenses" });
        }}
      />
    </WizardPageShell>
  );
}

function PaymentReceivedEditRoute({ receiptId }) {
  const router = useRouter();
  const toast = useToast();
  const { items, update } = useEntityStore(paymentsReceivedConfig.storageKey, paymentsReceivedConfig.seed);
  const record = items.find((item) => item.id === receiptId);

  if (!record) {
    return <MissingRecordPage title="Payment" backTo="/payments-received" />;
  }

  return (
    <WizardPageShell
      title={`Edit ${record.ref ?? "Payment"}`}
      backTo="/payments-received"
      backLabel="Back to Payments"
      crumb={[
        { label: "Payments Received", to: "/payments-received" },
        { label: record.ref ?? "Edit" },
      ]}
    >
      <ReceiptForm
        isEdit
        initial={record}
        onClose={() => router.navigate({ to: "/payments-received" })}
        onSubmit={(values) => {
          update(record.id, values);
          toast.success("Payment updated");
          router.navigate({ to: "/payments-received" });
        }}
      />
    </WizardPageShell>
  );
}

export function CreditWiseRoutePages({ pathname }) {
  if (pathname === "/catalog/products/new") {
    return <ProductRoute />;
  }

  const productEditMatch = pathname.match(/^\/catalog\/products\/([^/]+)\/edit$/);
  if (productEditMatch) {
    return <ProductEditRoute productId={productEditMatch[1]} />;
  }

  if (pathname === "/customers/new") {
    return <CustomerRoute />;
  }

  const customerEditMatch = pathname.match(/^\/customers\/([^/]+)\/edit$/);
  if (customerEditMatch) {
    return <CustomerEditRoute customerId={customerEditMatch[1]} />;
  }

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

  if (pathname === "/purchases/bills/new") {
    return <BillRoute />;
  }

  const billEditMatch = pathname.match(/^\/purchases\/bills\/([^/]+)\/edit$/);
  if (billEditMatch) {
    return <BillEditRoute billId={billEditMatch[1]} />;
  }

  if (pathname === "/purchases/payments/new") {
    return <PaymentMadeRoute />;
  }

  const paymentMadeEditMatch = pathname.match(/^\/purchases\/payments\/([^/]+)\/edit$/);
  if (paymentMadeEditMatch) {
    return <PaymentMadeEditRoute paymentId={paymentMadeEditMatch[1]} />;
  }

  if (pathname === "/purchases/expenses/new") {
    return <ExpenseRoute />;
  }

  const expenseEditMatch = pathname.match(/^\/purchases\/expenses\/([^/]+)\/edit$/);
  if (expenseEditMatch) {
    return <ExpenseEditRoute expenseId={expenseEditMatch[1]} />;
  }

  if (pathname === "/purchases/suppliers/new") {
    return <SupplierRoute />;
  }

  const supplierEditMatch = pathname.match(/^\/purchases\/suppliers\/([^/]+)\/edit$/);
  if (supplierEditMatch) {
    return <SupplierEditRoute supplierId={supplierEditMatch[1]} />;
  }

  if (pathname === "/sales/invoices/new") {
    return <InvoiceRoute />;
  }

  if (pathname === hpCasesConfig.addHref) {
    return <ContractRoute />;
  }

  if (pathname === "/support/hp-cases/new") {
    return <SupportHpCaseRoute />;
  }

  if (pathname === installmentPlansConfig.addHref) {
    return <InstallmentPlanRoute />;
  }

  if (pathname === "/payments-received/new") {
    return <PaymentReceivedRoute />;
  }

  const paymentReceivedEditMatch = pathname.match(/^\/payments-received\/([^/]+)\/edit$/);
  if (paymentReceivedEditMatch) {
    return <PaymentReceivedEditRoute receiptId={paymentReceivedEditMatch[1]} />;
  }

  if (pathname === "/hr/employees/new") {
    return <EmployeeRoute />;
  }

  const employeeEditMatch = pathname.match(/^\/hr\/employees\/([^/]+)\/edit$/);
  if (employeeEditMatch) {
    return <EmployeeEditRoute employeeId={employeeEditMatch[1]} />;
  }

  return <RouteNotFoundPage pathname={pathname} />;
}
