import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { Link as InertiaLink, router, usePage } from "@inertiajs/react";

type SearchValue = string | number | boolean | null | undefined;
type SearchParams = Record<string, SearchValue>;

type LinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to?: string;
    search?: SearchParams;
  }
>;

type NavigateOptions = {
  to?: string;
  search?: SearchParams;
  replace?: boolean;
};

export function Link({ to = "#", search, href, children, ...props }: LinkProps) {
  return (
    <InertiaLink href={href ?? buildHref(to, search)} {...props}>
      {children}
    </InertiaLink>
  );
}

export function useLocation() {
  const { url } = usePage();
  const parsed = new URL(url, typeof window === "undefined" ? "http://localhost" : window.location.origin);

  return {
    pathname: parsed.pathname,
    search: Object.fromEntries(parsed.searchParams.entries()),
  };
}

export function useNavigate() {
  return ({ to = "#", search, replace = false }: NavigateOptions) => {
    router.visit(buildHref(to, search), {
      method: "get",
      preserveScroll: false,
      preserveState: false,
      replace,
    });
  };
}

export function useRouter() {
  return {
    navigate: useNavigate(),
  };
}

function buildHref(to: string, search?: SearchParams) {
  const url = new URL(to || "#", "http://localhost");

  Object.entries(search ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return `${url.pathname}${url.search}${url.hash}`;
}
