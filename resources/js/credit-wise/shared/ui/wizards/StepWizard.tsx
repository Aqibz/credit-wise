import { Component, ErrorInfo, ReactNode, Suspense, useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ChevronDown, ChevronLeft, ChevronRight, RefreshCw, X, Save } from "lucide-react";
import { CountryCodePhoneInput } from "@/shared/ui/primitives/country-code-phone-input";
import { CurrencyAmountInput } from "@/shared/ui/primitives/currency-amount-input";
import { getFieldStateClass } from "@/shared/lib/form-validation";

/**
 * Catches both render errors and chunk-load failures from a lazy step.
 * `resetKey` lets the parent wipe error state when the user changes step
 * (so navigating away from a broken step and back tries again cleanly).
 */
class StepErrorBoundary extends Component<
  { resetKey: string; fallback: (err: Error, retry: () => void) => ReactNode; children: ReactNode },
  { error: Error | null }
> {
  state = { error: null as Error | null };
  static getDerivedStateFromError(error: Error) { return { error }; }
  componentDidCatch(error: Error, info: ErrorInfo) {
    // eslint-disable-next-line no-console
    console.error("[StepWizard] step failed", error, info.componentStack);
  }
  componentDidUpdate(prev: { resetKey: string }) {
    if (prev.resetKey !== this.props.resetKey && this.state.error) {
      this.setState({ error: null });
    }
  }
  retry = () => this.setState({ error: null });
  render() {
    if (this.state.error) return this.props.fallback(this.state.error, this.retry);
    return this.props.children;
  }
}

function StepErrorFallback({ error, onRetry, onBack, canGoBack }: { error: Error; onRetry: () => void; onBack?: () => void; canGoBack?: boolean }) {
  // ChunkLoadError is what bundlers throw when a dynamic import 404s
  // (deploy that invalidated old chunks, offline, flaky network, …).
  const isChunk = /chunk|loading|dynamically imported module|import\(\)/i.test(error.message);
  return (
    <div
      role="alert"
      className="rounded-xl border border-rose-200 bg-rose-50/60 p-5 text-center max-w-lg mx-auto"
    >
      <div className="mx-auto h-10 w-10 grid place-items-center rounded-full bg-rose-100 text-rose-600 mb-3">
        <AlertTriangle className="h-5 w-5" />
      </div>
      <h4 className="text-sm font-semibold text-rose-800">
        {isChunk ? "Couldn’t load this step" : "Something went wrong on this step"}
      </h4>
      <p className="text-[12px] text-rose-700/80 mt-1">
        {isChunk
          ? "The step’s code chunk failed to download. Check your connection and retry — if a new version was just deployed, a full reload may help."
          : error.message || "An unexpected error occurred while rendering this step."}
      </p>
      <div className="mt-4 inline-flex flex-wrap justify-center gap-2">
        <button
          onClick={onRetry}
          className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-[13px] font-semibold hover:bg-primary/90"
        >
          <RefreshCw className="h-3.5 w-3.5" /> Retry
        </button>
        {canGoBack && onBack && (
          <button
            onClick={onBack}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            <ChevronLeft className="h-3.5 w-3.5" /> Go back to previous step
          </button>
        )}
        {isChunk && (
          <button
            onClick={() => window.location.reload()}
            className="h-9 px-3 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-[13px] font-semibold text-slate-700 hover:bg-slate-50"
          >
            Reload page
          </button>
        )}
      </div>
    </div>
  );
}

export type WizardStep = {
  key: string;
  title: string;
  description?: string;
  icon?: ReactNode;
  /** Return error message string to block Next, or null/undefined when valid */
  validate?: () => string | null | undefined;
  render: () => ReactNode;
  /** Hide step entirely (e.g. variants step only when product type = Variable) */
  hidden?: boolean;
  /**
   * Optional async work to warm up before the user navigates to this step.
   * Use this to prefetch a code-split chunk (e.g. `() => import("./HeavyStep")`),
   * lookup data, or pre-render an iframe. Called once, on idle, after the
   * PREVIOUS step mounts — so by the time the user hits "Next", the chunk
   * is already in cache and navigation feels instant.
   */
  preload?: () => Promise<unknown> | void;
  /**
   * Optional custom skeleton shown while a lazy `render()` is suspending.
   * Defaults to a generic field-grid skeleton via <DefaultStepSkeleton/>.
   */
  skeleton?: ReactNode;
};

/** Field-grid placeholder shown while a step's lazy chunk is loading. */
export function DefaultStepSkeleton() {
  return (
    <div className="animate-pulse" aria-busy="true" aria-live="polite">
      <div className="h-4 w-40 rounded bg-slate-200 mb-5" />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className={i === 5 ? "sm:col-span-2" : ""}>
            <div className="h-3 w-24 rounded bg-slate-200 mb-2" />
            <div className="h-11 w-full rounded-lg bg-slate-100" />
          </div>
        ))}
      </div>
      <span className="sr-only">Loading step…</span>
    </div>
  );
}

export function StepWizard({
  title,
  subtitle,
  steps,
  onClose,
  onSave,
  isEdit,
  pageMode,
}: {
  title: string;
  subtitle?: string;
  steps: WizardStep[];
  onClose: () => void;
  onSave: () => void;
  isEdit?: boolean;
  pageMode?: boolean;
}) {
  const visible = steps.filter((s) => !s.hidden);
  const [idx, setIdx] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const current = visible[Math.min(idx, visible.length - 1)];
  const isLast = idx >= visible.length - 1;

  // Prefetch the NEXT step's chunk/data once the current step has settled,
  // so clicking "Next" swaps in instantly instead of triggering a chunk fetch.
  // We also opportunistically warm the previous step (cheap on back-nav).
  // Each step's preload runs at most once per wizard mount.
  const preloadedRef = useRef<Set<string>>(new Set());
  // Bumping this for the current step's key forces Suspense + boundary to
  // remount, causing React.lazy to re-attempt the failed chunk import.
  const [retryNonce, setRetryNonce] = useState<Record<string, number>>({});
  const retryStep = (key: string) => {
    preloadedRef.current.delete(key);
    setRetryNonce((m) => ({ ...m, [key]: (m[key] ?? 0) + 1 }));
  };
  useEffect(() => {
    const warm = (step?: WizardStep) => {
      if (!step?.preload) return;
      if (preloadedRef.current.has(step.key)) return;
      preloadedRef.current.add(step.key);
      try {
        const r = step.preload();
        // Swallow errors — prefetch is best-effort.
        if (r && typeof (r as Promise<unknown>).catch === "function") {
          (r as Promise<unknown>).catch(() => preloadedRef.current.delete(step.key));
        }
      } catch {
        preloadedRef.current.delete(step.key);
      }
    };
    const run = () => {
      warm(visible[idx + 1]);
      warm(visible[idx - 1]);
    };
    type IdleWindow = Window & {
      requestIdleCallback?: (cb: () => void, opts?: { timeout: number }) => number;
      cancelIdleCallback?: (id: number) => void;
    };
    const w = window as IdleWindow;
    if (typeof w.requestIdleCallback === "function") {
      const id = w.requestIdleCallback(run, { timeout: 800 });
      return () => w.cancelIdleCallback?.(id);
    }
    const t = window.setTimeout(run, 200);
    return () => window.clearTimeout(t);
  }, [idx, visible]);

  // Manual warm — fired on hover/focus over Next or any future step chip,
  // so even if idle never fires, intent triggers prefetch.
  function warmStep(step?: WizardStep) {
    if (!step?.preload || preloadedRef.current.has(step.key)) return;
    preloadedRef.current.add(step.key);
    try {
      const r = step.preload();
      if (r && typeof (r as Promise<unknown>).catch === "function") {
        (r as Promise<unknown>).catch(() => preloadedRef.current.delete(step.key));
      }
    } catch {
      preloadedRef.current.delete(step.key);
    }
  }

  function next() {
    const err = current.validate?.();
    if (err) { setError(err); return; }
    setError(null);
    if (isLast) { onSave(); return; }
    setIdx((i) => Math.min(visible.length - 1, i + 1));
  }
  function back() { setError(null); setIdx((i) => Math.max(0, i - 1)); }

  const inner = (
    <>
      {/* Header */}
      <div className="flex items-center justify-between gap-4 px-6 py-4 bg-gradient-to-r from-primary to-primary text-white">
        <div className="min-w-0">
          <h2 className="font-semibold text-lg leading-tight truncate">{isEdit ? `Edit ${title}` : `Add ${title}`}</h2>
          {subtitle && <p className="text-[12px] text-white/80 mt-0.5 truncate">{subtitle}</p>}
        </div>
        <button onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg bg-white/15 hover:bg-white/25 shrink-0">
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Horizontal Stepper */}
      <div className="px-6 pt-5 pb-4 bg-gradient-to-b from-slate-50 to-white border-b border-slate-200">
        <div className="relative flex items-center justify-between">
          {/* Track */}
          <div className="absolute left-0 right-0 top-4 h-0.5 bg-slate-200 rounded-full" aria-hidden />
          <div
            className="absolute left-0 top-4 h-0.5 bg-gradient-to-r from-primary to-primary rounded-full transition-all duration-300"
            style={{ width: visible.length > 1 ? `${(idx / (visible.length - 1)) * 100}%` : "0%" }}
            aria-hidden
          />
          {visible.map((s, i) => {
            const done = i < idx;
            const active = i === idx;
            return (
              <button
                key={s.key}
                type="button"
                onClick={() => setIdx(i)}
                onMouseEnter={() => warmStep(s)}
                onFocus={() => warmStep(s)}
                onTouchStart={() => warmStep(s)}
                className="relative flex flex-col items-center gap-2 group min-w-0 px-1"
                style={{ flex: "1 1 0" }}
              >
                <span
                  className={`relative grid place-items-center h-8 w-8 rounded-full text-[12px] font-bold transition-all shrink-0 ring-4 ${
                    done
                      ? "bg-emerald-500 text-white ring-emerald-100"
                      : active
                      ? "bg-primary text-primary-foreground ring-primary/20 scale-110 shadow-md shadow-primary/30"
                      : "bg-white text-slate-400 ring-slate-100 border border-slate-200 group-hover:border-primary/40"
                  }`}
                >
                  {done ? <Check className="h-4 w-4" /> : i + 1}
                </span>
                <span className="hidden sm:block text-center max-w-[140px]">
                  <div className={`text-[12px] font-semibold leading-tight truncate ${active ? "text-primary" : done ? "text-slate-700" : "text-slate-500"}`}>
                    {s.title}
                  </div>
                  {s.description && (
                    <div className="text-[10px] text-slate-400 mt-0.5 truncate hidden md:block">{s.description}</div>
                  )}
                </span>
              </button>
            );
          })}
        </div>
        {/* Mobile current step label */}
        <div className="sm:hidden mt-3 text-center">
          <div className="text-[10px] font-bold uppercase tracking-wider text-primary">Step {idx + 1} of {visible.length}</div>
          <div className="text-sm font-semibold text-slate-900 mt-0.5">{current.title}</div>
        </div>
      </div>

      {/* Body */}
      <main className="flex-1 overflow-y-auto p-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="hidden sm:block mb-5 pb-4 border-b border-slate-100">
            <div className="text-[11px] font-bold uppercase tracking-wider text-primary">Step {idx + 1} of {visible.length}</div>
            <h3 className="text-xl font-semibold text-slate-900 mt-1">{current.title}</h3>
            {current.description && <p className="text-sm text-slate-500 mt-1">{current.description}</p>}
          </div>
          {error && (
            <div className="mb-4 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700 font-medium flex items-start gap-2">
              <span className="grid place-items-center h-5 w-5 rounded-full bg-rose-500 text-white text-[11px] font-bold shrink-0 mt-0.5">!</span>
              <span>{error}</span>
            </div>
          )}
          <StepErrorBoundary
            resetKey={`${current.key}:${retryNonce[current.key] ?? 0}`}
            fallback={(err, retry) => (
              <StepErrorFallback
                error={err}
                onRetry={() => { retry(); retryStep(current.key); }}
                canGoBack={idx > 0}
                onBack={() => { retry(); back(); }}
              />
            )}
          >
            <Suspense
              key={`${current.key}:${retryNonce[current.key] ?? 0}`}
              fallback={current.skeleton ?? <DefaultStepSkeleton />}
            >
              <div>{current.render()}</div>
            </Suspense>
          </StepErrorBoundary>
        </div>
      </main>

      {/* Footer */}
      <div className="flex items-center justify-between gap-2 px-6 py-3.5 border-t border-slate-200 bg-slate-50">
        <button onClick={back} disabled={idx === 0} className="h-10 px-4 inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed">
          <ChevronLeft className="h-4 w-4" /> Back
        </button>
        <div className="text-xs text-slate-500 hidden sm:flex items-center gap-1.5">
          <span className="inline-flex h-1.5 w-1.5 rounded-full bg-rose-400" />
          Required fields per step
        </div>
        <button
          onClick={next}
          onMouseEnter={() => warmStep(visible[idx + 1])}
          onFocus={() => warmStep(visible[idx + 1])}
          onTouchStart={() => warmStep(visible[idx + 1])}
          className="h-10 px-5 inline-flex items-center gap-1.5 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30"
        >
          {isLast ? (<><Save className="h-4 w-4" /> {isEdit ? "Save Changes" : "Create"}</>) : (<>Next <ChevronRight className="h-4 w-4" /></>)}
        </button>
      </div>
    </>
  );

  if (pageMode) {
    return (
      <div className="rounded-2xl bg-white border border-slate-200 shadow-[0_8px_32px_-12px_rgba(16,24,40,0.18)] overflow-hidden flex flex-col text-slate-900 min-h-[78vh]">
        {inner}
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={onClose}>
      <div onClick={(e) => e.stopPropagation()} className="w-full max-w-5xl h-[88vh] rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col text-slate-900">
        {inner}
      </div>
    </div>
  );
}

/* ---------- Reusable input primitives ---------- */

const baseInput = "w-full h-9 px-3 rounded-lg border border-slate-200 bg-white text-[13px] font-normal text-slate-900 placeholder:text-[13px] placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition";

export function WField({ label, required, hint, children, full }: { label: string; required?: boolean; hint?: string; children: ReactNode; full?: boolean }) {
  return (
    <div className={full ? "sm:col-span-2" : ""}>
      <label className="block text-[13px] font-semibold text-slate-700 mb-1.5">
        {label} {required && <span className="text-rose-500">*</span>}
      </label>
      {children}
      {hint && <p className="text-[11px] text-slate-500 mt-1">{hint}</p>}
    </div>
  );
}

type WInputProps = React.InputHTMLAttributes<HTMLInputElement> & {
  phoneField?: boolean;
  moneyField?: boolean;
};

export function WInput({ phoneField, moneyField, type, className, onChange, value, placeholder, ...props }: WInputProps) {
  if (phoneField || type === "tel") {
    return (
      <CountryCodePhoneInput
        value={typeof value === "string" ? value : String(value ?? "")}
        onChange={(nextValue) => {
          onChange?.({
            target: { value: nextValue, name: props.name ?? "" },
            currentTarget: { value: nextValue, name: props.name ?? "" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
        placeholder={placeholder}
        inputClassName={className}
        disabled={props.disabled}
        id={props.id}
        name={props.name}
        autoComplete={props.autoComplete}
        onBlur={props.onBlur}
        invalid={props["aria-invalid"] === true || props["aria-invalid"] === "true"}
      />
    );
  }

  if (moneyField) {
    return (
      <CurrencyAmountInput
        value={typeof value === "string" || typeof value === "number" ? value : String(value ?? "")}
        onChange={(nextValue) => {
          onChange?.({
            target: { value: nextValue, name: props.name ?? "" },
            currentTarget: { value: nextValue, name: props.name ?? "" },
          } as React.ChangeEvent<HTMLInputElement>);
        }}
        placeholder={placeholder}
        inputClassName={className}
        disabled={props.disabled}
        id={props.id}
        name={props.name}
        autoComplete={props.autoComplete}
        onBlur={props.onBlur}
        min={props.min}
        max={props.max}
        step={props.step}
        invalid={props["aria-invalid"] === true || props["aria-invalid"] === "true"}
      />
    );
  }

  return (
    <input
      {...props}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      className={`${baseInput} ${getFieldStateClass(props["aria-invalid"] === true || props["aria-invalid"] === "true", className)}`}
    />
  );
}
export function WTextarea(props: React.TextareaHTMLAttributes<HTMLTextAreaElement>) {
  const invalid = props["aria-invalid"] === true || props["aria-invalid"] === "true";
  return (
    <textarea
      rows={3}
      {...props}
      className={`w-full min-h-[84px] px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-[13px] font-normal text-slate-900 placeholder:text-[13px] placeholder:font-normal placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition ${getFieldStateClass(invalid, props.className ?? "")}`}
    />
  );
}
export function WSelect({
  value,
  onChange,
  options,
  placeholder = "Select…",
  invalid,
  onBlur,
}: {
  value: string;
  onChange: (v: string) => void;
  options: string[];
  placeholder?: string;
  required?: boolean;
  invalid?: boolean;
  onBlur?: () => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = value || placeholder;
  const blurNotifiedRef = useRef(false);

  useEffect(() => {
    if (!open) return;
    blurNotifiedRef.current = false;
    const onDoc = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
        if (!blurNotifiedRef.current) {
          blurNotifiedRef.current = true;
          onBlur?.();
        }
      }
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        if (!blurNotifiedRef.current) {
          blurNotifiedRef.current = true;
          onBlur?.();
        }
      }
    };
    document.addEventListener("mousedown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open, onBlur]);

  return (
    <div className="relative w-full" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-invalid={invalid || undefined}
        className={`${baseInput} ${getFieldStateClass(invalid)} flex items-center justify-between text-left cursor-pointer`}
      >
        <span className={value ? "text-[13px] font-normal text-slate-900" : "text-[13px] font-normal text-slate-400"}>{label}</span>
        <ChevronDown className={`h-4 w-4 text-slate-500 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>
      {open && (
        <div className="absolute left-0 right-0 top-[calc(100%+6px)] z-[100] max-h-56 overflow-y-auto rounded-lg border border-slate-200 bg-white p-1 shadow-lg">
          <button
            type="button"
            onClick={() => {
              onChange("");
              setOpen(false);
              if (!blurNotifiedRef.current) {
                blurNotifiedRef.current = true;
                onBlur?.();
              }
            }}
            className={`w-full rounded-md px-3 py-2 text-left text-[13px] font-normal hover:bg-slate-50 ${!value ? "bg-primary/10 text-primary" : "text-slate-500"}`}
          >
            {placeholder}
          </button>
          {options.map((o) => (
            <button
              key={o}
              type="button"
              onClick={() => {
                onChange(o);
                setOpen(false);
                if (!blurNotifiedRef.current) {
                  blurNotifiedRef.current = true;
                  onBlur?.();
                }
              }}
              className={`w-full rounded-md px-3 py-2 text-left text-[13px] font-normal hover:bg-slate-50 ${value === o ? "bg-primary/10 text-primary" : "text-slate-700"}`}
            >
              {o}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export function WGrid({ children }: { children: ReactNode }) {
  return <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">{children}</div>;
}

export function WChips({ value, onToggle, options }: { value: string[]; onToggle: (v: string) => void; options: string[] }) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const on = value.includes(o);
        return (
          <button key={o} type="button" onClick={() => onToggle(o)} className={`h-8 px-3 rounded-full text-xs font-semibold border transition ${on ? "bg-primary text-primary-foreground border-primary shadow-sm shadow-primary/20" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"}`}>
            {on && <Check className="inline h-3 w-3 mr-1 -mt-0.5" />} {o}
          </button>
        );
      })}
    </div>
  );
}

export function WSwitch({ checked, onChange, label, hint }: { checked: boolean; onChange: (v: boolean) => void; label: string; hint?: string }) {
  return (
    <label className="flex items-start gap-3 cursor-pointer rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
      <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} className="mt-0.5 h-4 w-4 accent-primary" />
      <span className="min-w-0">
        <span className="text-sm font-semibold text-slate-700 block">{label}</span>
        {hint && <span className="text-[11px] text-slate-500">{hint}</span>}
      </span>
    </label>
  );
}
