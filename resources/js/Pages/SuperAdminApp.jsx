import { useLocation } from "@/shared/navigation";
import {
  SUPER_ADMIN_ROUTE_COMPONENTS,
  SuperAdminLazyPage,
  SuperAdminNotFoundPage,
} from "@/apps/super-admin";

export default function SuperAdminApp() {
  const { pathname } = useLocation();
  const Component = SUPER_ADMIN_ROUTE_COMPONENTS[pathname];

  if (Component) {
    return <SuperAdminLazyPage component={Component} />;
  }

  return <SuperAdminLazyPage component={SuperAdminNotFoundPage} pathname={pathname} />;
}
