import type { AnchorHTMLAttributes, PropsWithChildren } from "react";

type LinkProps = PropsWithChildren<
    AnchorHTMLAttributes<HTMLAnchorElement> & {
        to?: string;
        search?: Record<string, string | number | boolean | null | undefined>;
    }
>;

export function Link({ to = "#", search, href, children, ...props }: LinkProps) {
    const url = new URL(to || "#", "http://localhost");

    if (search) {
        Object.entries(search).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") {
                return;
            }

            url.searchParams.set(key, String(value));
        });
    }

    return (
        <a href={href ?? `${url.pathname}${url.search}${url.hash}`} {...props}>
            {children}
        </a>
    );
}

export function useLocation() {
    if (typeof window === "undefined") {
        return { pathname: "/", search: {} };
    }

    return {
        pathname: window.location.pathname,
        search: Object.fromEntries(new URLSearchParams(window.location.search).entries()),
    };
}

function buildHref(to = "#", search?: Record<string, string | number | boolean | null | undefined>) {
    const url = new URL(to || "#", "http://localhost");

    if (search) {
        Object.entries(search).forEach(([key, value]) => {
            if (value === undefined || value === null || value === "") {
                return;
            }

            url.searchParams.set(key, String(value));
        });
    }

    return `${url.pathname}${url.search}${url.hash}`;
}

export function useNavigate() {
    return ({ to = "#", search }: { to?: string; search?: Record<string, string | number | boolean | null | undefined> }) => {
        if (typeof window === "undefined") {
            return;
        }

        window.location.href = buildHref(to, search);
    };
}

export function useRouter() {
    return {
        navigate: ({ to = "#", search }: { to?: string; search?: Record<string, string | number | boolean | null | undefined> }) => {
            if (typeof window === "undefined") {
                return;
            }

            window.location.href = buildHref(to, search);
        },
    };
}

export function Outlet() {
    return null;
}
