import type { ComponentType } from "react";
import { Suspense, lazy } from "react";

const lazyNamed = <T extends object>(loader: () => Promise<T>, name: keyof T) =>
  lazy(() => loader().then((module) => ({ default: module[name] as ComponentType<any> })));

const SuperAdminDashboard = lazyNamed(
  () => import("@/pages/super-admin/dashboard/SuperAdminDashboard"),
  "SuperAdminDashboard",
);
const TenantsPage = lazyNamed(() => import("@/pages/super-admin/tenants/TenantsPage"), "TenantsPage");
const SubscriptionsPage = lazyNamed(
  () => import("@/pages/super-admin/subscriptions/SubscriptionsPage"),
  "SubscriptionsPage",
);
const SupportAccessPage = lazyNamed(
  () => import("@/pages/super-admin/support/SupportAccessPage"),
  "SupportAccessPage",
);
const SuperAdminNotFoundPage = lazyNamed(
  () => import("@/pages/super-admin/common/SuperAdminNotFoundPage"),
  "SuperAdminNotFoundPage",
);

export function SuperAdminLazyPage({
  component: Component,
  ...props
}: {
  component: ComponentType<any>;
  [key: string]: unknown;
}) {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen grid place-items-center bg-background px-6">
          <div className="rounded-xl border border-border bg-card px-4 py-3 text-sm text-muted-foreground shadow-sm">
            Loading page...
          </div>
        </div>
      }
    >
      <Component {...props} />
    </Suspense>
  );
}

export const SUPER_ADMIN_ROUTE_COMPONENTS: Record<string, ComponentType<any>> = {
  "/super-admin": SuperAdminDashboard,
  "/super-admin/tenants": TenantsPage,
  "/super-admin/subscriptions": SubscriptionsPage,
  "/super-admin/support-access": SupportAccessPage,
  "/super-admin/support": SupportAccessPage,
};

export { SuperAdminNotFoundPage };
