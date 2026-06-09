import { GenericErrorPage } from "@/shared/ui/core/GenericErrorPage";

export function RouteNotFoundPage({ pathname }: { pathname: string }) {
  return (
    <GenericErrorPage
      status="404"
      path={pathname}
      detail="This route does not have an active CreditWise page. Check the address or use the sidebar to continue."
    />
  );
}
