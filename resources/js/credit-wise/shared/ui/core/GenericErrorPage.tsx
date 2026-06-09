import {
  AlertTriangle,
  ArrowLeft,
  Clock3,
  CloudOff,
  FileQuestion,
  Home,
  RefreshCcw,
  ShieldAlert,
  Wrench,
} from "lucide-react";

type ErrorStatus = "403" | "404" | "419" | "429" | "500" | "503" | "offline";

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
  icon: typeof AlertTriangle;
}> = {
  "403": {
    title: "Access restricted",
    message: "You do not have permission to open this page.",
    detail: "Ask an administrator to review your role and permissions if you need access.",
    icon: ShieldAlert,
  },
  "404": {
    title: "Page not found",
    message: "The page may have moved, been removed, or the address may be incorrect.",
    detail: "Use the dashboard or sidebar to continue working in CreditWise.",
    icon: FileQuestion,
  },
  "419": {
    title: "Session expired",
    message: "Your secure session expired while this page was open.",
    detail: "Refresh the page and sign in again if CreditWise asks you to.",
    icon: Clock3,
  },
  "429": {
    title: "Too many requests",
    message: "CreditWise received too many requests in a short time.",
    detail: "Wait a moment before trying the same action again.",
    icon: Clock3,
  },
  "500": {
    title: "We could not load this page",
    message: "CreditWise encountered an unexpected problem while processing this request.",
    detail: "Your data is safe. Retry once, then share the request reference with support if the issue continues.",
    icon: AlertTriangle,
  },
  "503": {
    title: "Temporarily unavailable",
    message: "CreditWise is undergoing maintenance or a required service is unavailable.",
    detail: "Please wait a few minutes and try again.",
    icon: Wrench,
  },
  offline: {
    title: "Connection unavailable",
    message: "CreditWise cannot reach the server from this device.",
    detail: "Check your internet connection, then retry this page.",
    icon: CloudOff,
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
  actionLabel = "Go to dashboard",
  actionHref = "/",
  secondaryLabel = "Try again",
  onRetry,
}: GenericErrorPageProps) {
  const normalizedStatus = normalizeStatus(status);
  const preset = presets[normalizedStatus];
  const Icon = preset.icon;

  return (
    <main className="relative min-h-screen overflow-hidden bg-slate-950 px-4 py-8 text-slate-950 sm:px-6 lg:px-8">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute -left-24 top-20 h-72 w-72 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="absolute -right-24 bottom-16 h-80 w-80 rounded-full bg-amber-400/15 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.025)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.025)_1px,transparent_1px)] bg-[size:40px_40px]" />
      </div>

      <div className="relative mx-auto flex min-h-[calc(100vh-4rem)] max-w-6xl items-center">
        <section className="grid w-full overflow-hidden rounded-[2rem] border border-white/10 bg-white shadow-2xl shadow-black/35 lg:grid-cols-[1.35fr_0.65fr]">
          <div className="p-7 sm:p-10 lg:p-14">
            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-600 text-white shadow-lg shadow-sky-600/25">
                <Icon className="h-5 w-5" aria-hidden="true" />
              </div>
              <div>
                <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-700">CreditWise status</p>
                <p className="text-sm font-semibold text-slate-500">
                  {normalizedStatus === "offline" ? "Network issue" : `Error ${normalizedStatus}`}
                </p>
              </div>
            </div>

            <div className="mt-10 max-w-2xl">
              <h1 className="text-3xl font-bold tracking-tight text-slate-950 sm:text-5xl">
                {title ?? preset.title}
              </h1>
              <p className="mt-5 text-base leading-7 text-slate-600 sm:text-lg">
                {message ?? preset.message}
              </p>
              <div className="mt-7 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm leading-6 text-amber-950">
                {detail ?? preset.detail}
              </div>
            </div>

            <div className="mt-9 flex flex-wrap gap-3">
              <a
                href={actionHref}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
              >
                <Home className="h-4 w-4" aria-hidden="true" />
                {actionLabel}
              </a>
              <button
                type="button"
                onClick={onRetry ?? (() => window.location.reload())}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:ring-offset-2"
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

          <aside className="bg-slate-900 p-7 text-white sm:p-10 lg:p-12">
            <p className="text-[10px] font-bold uppercase tracking-[0.24em] text-sky-300">Support details</p>
            <div className="mt-7 space-y-4">
              <SupportItem label="Status" value={normalizedStatus.toUpperCase()} />
              {path ? <SupportItem label="Page" value={path} /> : null}
              {requestId ? <SupportItem label="Request reference" value={requestId} /> : null}
            </div>
            <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-5">
              <p className="text-sm font-semibold text-white">If this keeps happening</p>
              <p className="mt-2 text-sm leading-6 text-slate-300">
                Contact support and include the page address
                {requestId ? " and request reference shown above" : ""}. Do not share passwords or payment credentials.
              </p>
            </div>
          </aside>
        </section>
      </div>
    </main>
  );
}

function SupportItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-slate-400">{label}</p>
      <p className="mt-2 break-all font-mono text-sm leading-6 text-slate-100">{value}</p>
    </div>
  );
}
