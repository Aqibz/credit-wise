type GenericErrorPageProps = {
  code?: string | number;
  title?: string;
  message?: string;
  detail?: string;
  actionLabel?: string;
  actionHref?: string;
  secondaryLabel?: string;
  onRetry?: () => void;
};

export function GenericErrorPage({
  code = "500",
  title = "Something went wrong",
  message = "We could not load this screen right now.",
  detail = "This can happen because of a temporary server issue, a database problem, or an unexpected frontend error.",
  actionLabel = "Go to dashboard",
  actionHref = "/",
  secondaryLabel = "Try again",
  onRetry,
}: GenericErrorPageProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_rgba(59,130,246,0.16),_transparent_34%),linear-gradient(180deg,#f8fbff_0%,#eef5ff_100%)] px-6 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-5xl items-center">
        <div className="grid w-full gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-8 shadow-[0_30px_80px_-35px_rgba(15,23,42,0.28)] backdrop-blur">
            <div className="inline-flex items-center gap-2 rounded-full border border-sky-200 bg-sky-50 px-3 py-1 text-[11px] font-bold uppercase tracking-[0.18em] text-sky-700">
              CreditWise
              <span className="rounded-full bg-sky-600 px-2 py-0.5 text-white">{code}</span>
            </div>

            <div className="mt-6 space-y-4">
              <h1 className="text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">{title}</h1>
              <p className="max-w-2xl text-sm leading-7 text-slate-600 sm:text-base">{message}</p>
              <div className="rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900">
                {detail}
              </div>
            </div>

            <div className="mt-8 flex flex-wrap gap-3">
              <a
                href={actionHref}
                className="inline-flex h-11 items-center justify-center rounded-xl bg-slate-950 px-5 text-sm font-semibold text-white transition hover:bg-slate-800"
              >
                {actionLabel}
              </a>
              <button
                type="button"
                onClick={onRetry ?? (() => window.location.reload())}
                className="inline-flex h-11 items-center justify-center rounded-xl border border-slate-300 bg-white px-5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
              >
                {secondaryLabel}
              </button>
            </div>
          </div>

          <div className="rounded-[2rem] border border-slate-200/80 bg-slate-950 p-8 text-white shadow-[0_30px_80px_-35px_rgba(15,23,42,0.45)]">
            <div className="text-sm font-semibold tracking-[0.18em] text-sky-300 uppercase">Error Snapshot</div>
            <div className="mt-6 space-y-5">
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">Status Code</div>
                <div className="mt-2 text-4xl font-semibold">{code}</div>
              </div>
              <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                <div className="text-[11px] uppercase tracking-[0.16em] text-slate-400">What the user can do</div>
                <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-200">
                  <li>Refresh the page after a few seconds.</li>
                  <li>Go back to the dashboard and retry the flow.</li>
                  <li>Contact support if the issue keeps happening.</li>
                </ul>
              </div>
              <div className="rounded-2xl border border-sky-400/20 bg-sky-400/10 p-4 text-sm leading-6 text-sky-100">
                Server-driven dynamic messages can be plugged into this page later for database, validation, auth, or maintenance errors.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
