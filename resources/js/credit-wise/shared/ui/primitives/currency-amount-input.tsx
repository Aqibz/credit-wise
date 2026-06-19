import { cn } from "@/lib/helpers/utils";
import { getFieldStateClass } from "@/shared/lib/form-validation";
import { useCurrencyPreference } from "@/shared/lib/currency-settings";

const MAX_CURRENCY_VALUE = 99_999_999;

function normalizeCurrencyValue(value: string | number) {
  const digitsOnly = String(value ?? "").replace(/[^\d]/g, "");
  if (!digitsOnly) {
    return { raw: "", display: "" };
  }

  const clamped = Math.min(Number(digitsOnly), MAX_CURRENCY_VALUE);
  const raw = String(clamped);

  return {
    raw,
    display: new Intl.NumberFormat("en-US").format(clamped),
  };
}

type CurrencyAmountInputProps = {
  value: string | number;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  chipClassName?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  min?: string | number;
  max?: string | number;
  step?: string | number;
  invalid?: boolean;
};

export function CurrencyAmountInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  chipClassName,
  disabled,
  id,
  name,
  autoComplete,
  onBlur,
  min,
  max,
  step,
  invalid,
}: CurrencyAmountInputProps) {
  const currency = useCurrencyPreference();
  const normalized = normalizeCurrencyValue(value);

  return (
    <div
      className={cn(
        "flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent transition-colors focus-within:ring-1 focus-within:ring-ring",
        getFieldStateClass(invalid),
        className,
      )}
    >
      <div
        aria-hidden="true"
        className={cn(
          "inline-flex h-full shrink-0 items-center justify-center border-r border-input bg-slate-50 px-3 text-[13px] font-medium text-slate-700",
          chipClassName,
        )}
      >
        {currency.chip}
      </div>
      <input
        id={id}
        name={name}
        type="text"
        inputMode="numeric"
        value={normalized.display}
        onChange={(event) => onChange(normalizeCurrencyValue(event.target.value).raw)}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        min={min}
        max={max}
        step={step}
        className={cn(
          "h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] font-normal text-slate-900 outline-none focus:ring-0 placeholder:text-[13px] placeholder:font-normal placeholder:text-slate-400",
          inputClassName,
        )}
      />
    </div>
  );
}
