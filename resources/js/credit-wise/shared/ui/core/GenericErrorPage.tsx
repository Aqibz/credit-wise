import {
  ArrowLeft,
  BadgeAlert,
  Clock3,
  CloudOff,
  KeyRound,
  LifeBuoy,
  FileQuestion,
  Home,
  LockKeyhole,
  OctagonAlert,
  RefreshCcw,
  ShieldX,
  Siren,
  Wrench,
} from "lucide-react";
import { Head } from "@inertiajs/react";
import { PageMeta } from "@/shared/ui/core/PageMeta";

type ErrorStatus =
  | "400"
  | "401"
  | "403"
  | "404"
  | "405"
  | "408"
  | "410"
  | "413"
  | "414"
  | "419"
  | "422"
  | "429"
  | "500"
  | "502"
  | "503"
  | "504"
  | "offline";

type GenericErrorPageProps = {
  status?: ErrorStatus | number | string;
  title?: string;
  message?: string;
  detail?: string;
  requestId?: string | null;
  path?: string | null;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  onRetry?: () => void;
};

const presets: Record<ErrorStatus, {
  title: string;
  message: string;
  detail: string;
  icon: typeof BadgeAlert;
  badge: string;
}> = {
  "400": {
    title: "Request could not be processed",
    message: "CreditWise could not understand the request for this page.",
    detail: "Go back to the previous screen and try the action again with valid information.",
    icon: OctagonAlert,
    badge: "Request",
  },
  "401": {
    title: "Sign-in required",
    message: "Your session is not authorized to access this page.",
    detail: "Sign in again or return to a page that is available for your current access level.",
    icon: LockKeyhole,
    badge: "Authentication",
  },
  "403": {
    title: "Access restricted",
    message: "You do not have permission to open this page.",
    detail: "Ask an administrator to review your role and permissions if you need access.",
    icon: ShieldX,
    badge: "Permissions",
  },
  "404": {
    title: "Page not found",
    message: "The page may have moved, been removed, or the address may be incorrect.",
    detail: "Use the dashboard or sidebar to continue working in CreditWise.",
    icon: FileQuestion,
    badge: "Navigation",
  },
  "405": {
    title: "Action not available",
    message: "This page cannot handle the action that was just attempted.",
    detail: "Return to the previous screen and retry using the intended button or workflow.",
    icon: OctagonAlert,
    badge: "Request",
  },
  "408": {
    title: "Request timed out",
    message: "The server took too long to complete this request.",
    detail: "Retry the action once. If it happens again, check your connection or try again shortly.",
    icon: Clock3,
    badge: "Timeout",
  },
  "410": {
    title: "This page is no longer available",
    message: "The content you tried to open has been removed from this workspace.",
    detail: "Use the dashboard or sidebar to continue from an active CreditWise module.",
    icon: FileQuestion,
    badge: "Navigation",
  },
  "413": {
    title: "Submitted content is too large",
    message: "CreditWise cannot process the data or file size that was sent.",
    detail: "Reduce the size of the submitted content and try again.",
    icon: OctagonAlert,
    badge: "Upload",
  },
  "414": {
    title: "Address is too long",
    message: "The page address or request path is longer than CreditWise can handle.",
    detail: "Return to the previous page and retry using the normal workflow.",
    icon: FileQuestion,
    badge: "Navigation",
  },
  "419": {
    title: "Session expired",
    message: "Your secure session expired while this page was open.",
    detail: "Refresh the page and sign in again if CreditWise asks you to.",
    icon: Clock3,
    badge: "Session",
  },
  "422": {
    title: "Something needs attention",
    message: "The request could not be completed with the information that was submitted.",
    detail: "Review the form values or return to the previous step and try again.",
    icon: KeyRound,
    badge: "Validation",
  },
  "429": {
    title: "Too many requests",
    message: "CreditWise received too many requests in a short time.",
    detail: "Wait a moment before trying the same action again.",
    icon: Siren,
    badge: "Rate limit",
  },
  "500": {
    title: "We could not load this page",
    message: "CreditWise encountered an unexpected problem while processing this request.",
    detail: "Your data is safe. Retry once, then share the request reference with support if the issue continues.",
    icon: BadgeAlert,
    badge: "System",
  },
  "502": {
    title: "Service connection failed",
    message: "CreditWise could not complete this request because an upstream service returned an invalid response.",
    detail: "Please retry in a moment. If the problem persists, support should review service health.",
    icon: Wrench,
    badge: "Service",
  },
  "503": {
    title: "Temporarily unavailable",
    message: "CreditWise is undergoing maintenance or a required service is unavailable.",
    detail: "Please wait a few minutes and try again.",
    icon: Wrench,
    badge: "Maintenance",
  },
  "504": {
    title: "Service took too long",
    message: "CreditWise waited too long for a required service to respond.",
    detail: "Please retry shortly. If it continues, the connected service may need attention.",
    icon: Clock3,
    badge: "Timeout",
  },
  offline: {
    title: "Connection unavailable",
    message: "CreditWise cannot reach the server from this device.",
    detail: "Check your internet connection, then retry this page.",
    icon: CloudOff,
    badge: "Network",
  },
};

function normalizeStatus(status: GenericErrorPageProps["status"]): ErrorStatus {
  const value = String(status ?? "500") as ErrorStatus;
  return value in presets ? value : "500";
}

export function GenericErrorPage({
  status = "500",
  title,
  message,
  detail,
  requestId,
  path,
  actionLabel,
  actionHref,
  secondaryLabel = "Try again",
  onRetry,
}: GenericErrorPageProps) {
  const normalizedStatus = normalizeStatus(status);
  const preset = presets[normalizedStatus];
  const Icon = preset.icon;
  const resolvedTitle = title ?? preset.title;
  const resolvedMessage = message ?? preset.message;
  const resolvedDetail = detail ?? preset.detail;
  const resolvedActionHref = actionHref ?? (normalizedStatus === "401" ? "/login" : "/dashboard");
  const resolvedActionLabel = actionLabel ?? (normalizedStatus === "401" ? "Go to login" : "Go to dashboard");

  return (
    <>
      <Head title={resolvedTitle} />
      <PageMeta title={resolvedTitle} description={resolvedMessage} />
      <main className="min-h-screen bg-white px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-0 top-0 h-80 w-80 rounded-full bg-primary/8 blur-3xl" />
          <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-primary/6 blur-3xl" />
        </div>

        <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
          <section className="grid w-full gap-6 lg:grid-cols-[minmax(0,1.1fr)_360px]">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_28px_60px_-40px_rgba(15,23,42,0.3)] sm:p-10 lg:p-12">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                  <Icon className="h-5 w-5" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-primary/80">CreditWise</p>
                  <p className="text-sm text-slate-500">{preset.badge}</p>
                </div>
                <div className="ml-auto inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-slate-600">
                  {normalizedStatus === "offline" ? "Offline" : `Error ${normalizedStatus}`}
                </div>
              </div>

              <div className="mt-10 max-w-3xl">
                <img src="/creditwise-icon.png" alt="CreditWise icon" className="mb-6 h-14 w-14 object-contain" />
                <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-5xl">
                  {resolvedTitle}
                </h1>
                <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                  {resolvedMessage}
                </p>
                <div className="mt-7 rounded-2xl border border-slate-200 bg-slate-50 px-5 py-4 text-sm leading-6 text-slate-600">
                  {resolvedDetail}
                </div>
              </div>

              <div className="mt-9 flex flex-wrap gap-3">
                <a
                  href={resolvedActionHref}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-primary px-5 text-sm font-semibold text-primary-foreground transition hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                >
                  <Home className="h-4 w-4" aria-hidden="true" />
                  {resolvedActionLabel}
                </a>
                <button
                  type="button"
                  onClick={onRetry ?? (() => window.location.reload())}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:ring-offset-2"
                >
                  <RefreshCcw className="h-4 w-4" aria-hidden="true" />
                  {secondaryLabel}
                </button>
                <button
                  type="button"
                  onClick={() => window.history.back()}
                  className="inline-flex h-11 items-center justify-center gap-2 px-3 text-sm font-semibold text-slate-600 transition hover:text-slate-950"
                >
                  <ArrowLeft className="h-4 w-4" aria-hidden="true" />
                  Go back
                </button>
              </div>
            </div>

            <aside className="rounded-[2rem] border border-slate-200 bg-white p-7 shadow-[0_24px_60px_-42px_rgba(15,23,42,0.24)] sm:p-8">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-100 text-slate-700">
                  <LifeBuoy className="h-4 w-4" aria-hidden="true" />
                </div>
                <div>
                  <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-slate-400">Support details</p>
                  <p className="text-sm font-medium text-slate-900">Reference information</p>
                </div>
              </div>

              <div className="mt-6 space-y-3">
                <SupportItem label="Status" value={normalizedStatus.toUpperCase()} />
                {path ? <SupportItem label="Page" value={path} /> : null}
                {requestId ? <SupportItem label="Request reference" value={requestId} /> : null}
              </div>

              <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50 p-5">
                <p className="text-sm font-semibold text-slate-900">If this keeps happening</p>
                <p className="mt-2 text-sm leading-6 text-slate-500">
                  Contact support with the page address
                  {requestId ? " and request reference shown above" : ""}. Do not share passwords or payment credentials.
                </p>
              </div>
            </aside>
          </section>
        </div>
      </main>
    </>
  );
}

function SupportItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4">
      <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 break-all font-mono text-sm leading-6 text-slate-800">{value}</p>
    </div>
  );
}
