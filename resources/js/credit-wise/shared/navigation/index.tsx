import type { AnchorHTMLAttributes, PropsWithChildren } from "react";
import { Link as InertiaLink, router, usePage } from "@inertiajs/react";

type SearchValue = string | number | boolean | null | undefined;
type SearchParams = Record<string, SearchValue>;
type PathParams = Record<string, SearchValue>;

type LinkProps = PropsWithChildren<
  AnchorHTMLAttributes<HTMLAnchorElement> & {
    to?: string;
    params?: PathParams;
    search?: SearchParams;
  }
>;

type NavigateOptions = {
  to?: string;
  params?: PathParams;
  search?: SearchParams;
  replace?: boolean;
};

export function Link({ to = "#", params, search, href, children, ...props }: LinkProps) {
  return (
    <InertiaLink href={href ?? buildHref(to, params, search)} {...props}>
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
  return ({ to = "#", params, search, replace = false }: NavigateOptions) => {
    router.visit(buildHref(to, params, search), {
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

function buildHref(to: string, params?: PathParams, search?: SearchParams) {
  const resolvedPath = interpolatePath(to || "#", params);
  const url = new URL(resolvedPath, "http://localhost");

  Object.entries(search ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  });

  return `${url.pathname}${url.search}${url.hash}`;
}

function interpolatePath(path: string, params?: PathParams) {
  if (!params) {
    return path;
  }

  return path.replace(/\$([A-Za-z0-9_]+)/g, (match, key) => {
    const value = params[key];

    if (value === undefined || value === null || value === "") {
      return match;
    }

    return encodeURIComponent(String(value));
  });
}
