import { useMemo } from "react";
import { cn } from "@/lib/helpers/utils";
import { COUNTRY_DIAL_CODES, DEFAULT_COUNTRY_DIAL_CODE } from "@/shared/lib/country-dial-codes";
import { getFieldStateClass } from "@/shared/lib/form-validation";
import { Select, SelectContent, SelectItem, SelectTrigger } from "@/shared/ui/primitives/select";

type CountryCodePhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  selectClassName?: string;
  disabled?: boolean;
  id?: string;
  name?: string;
  autoComplete?: string;
  onBlur?: React.FocusEventHandler<HTMLInputElement>;
  invalid?: boolean;
};

const SORTED_DIAL_CODES = Array.from(new Set(COUNTRY_DIAL_CODES.map((entry) => entry.dialCode))).sort(
  (left, right) => right.length - left.length || left.localeCompare(right),
);

function splitPhoneValue(value: string) {
  const normalized = String(value || "").trim();
  if (!normalized) {
    return { dialCode: DEFAULT_COUNTRY_DIAL_CODE, localNumber: "" };
  }

  const matchedDialCode = SORTED_DIAL_CODES.find((dialCode) => normalized.startsWith(dialCode));
  if (!matchedDialCode) {
    return { dialCode: DEFAULT_COUNTRY_DIAL_CODE, localNumber: normalized };
  }

  return {
    dialCode: matchedDialCode,
    localNumber: normalized.slice(matchedDialCode.length).replace(/^[\s-]+/, ""),
  };
}

function composePhoneValue(dialCode: string, localNumber: string) {
  const normalizedLocal = localNumber.trim();
  return normalizedLocal ? `${dialCode} ${normalizedLocal}` : dialCode;
}

function isoToFlag(iso2: string) {
  const code = iso2.toUpperCase();
  if (!/^[A-Z]{2}$/.test(code)) return "";
  return String.fromCodePoint(...code.split("").map((char) => 127397 + char.charCodeAt(0)));
}

export function CountryCodePhoneInput({
  value,
  onChange,
  placeholder,
  className,
  inputClassName,
  selectClassName,
  disabled,
  id,
  name,
  autoComplete,
  onBlur,
  invalid,
}: CountryCodePhoneInputProps) {
  const { dialCode, localNumber } = splitPhoneValue(value);

  const options = useMemo(
    () =>
      COUNTRY_DIAL_CODES.map((entry) => ({
        key: `${entry.iso2}-${entry.dialCode}`,
        value: entry.dialCode,
        flag: isoToFlag(entry.iso2),
        label: `${isoToFlag(entry.iso2)} ${entry.dialCode}`,
        title: `${entry.name} (${entry.dialCode})`,
        name: entry.name,
      })),
    [],
  );
  const activeOption = options.find((option) => option.value === dialCode) ?? options[0];

  return (
    <div
      className={cn(
        "flex h-9 w-full overflow-hidden rounded-md border border-input bg-transparent transition-colors focus-within:ring-1 focus-within:ring-ring",
        getFieldStateClass(invalid),
        className,
      )}
    >
      <Select
        value={dialCode}
        onValueChange={(nextDialCode) => {
          onChange(composePhoneValue(nextDialCode, localNumber));
        }}
      >
        <SelectTrigger
          title="Country code"
          aria-label="Country code"
          disabled={disabled}
          className={cn(
            "h-full w-auto min-w-[82px] shrink-0 justify-start gap-1 rounded-none border-0 border-r border-input bg-slate-50 px-2.5 pr-2 text-[13px] font-medium text-slate-700 shadow-none focus:ring-0 [&>svg]:ml-0.5 [&>svg]:h-3.5 [&>svg]:w-3.5 [&>svg]:shrink-0",
            selectClassName,
          )}
        >
          <span className="truncate">
            {activeOption ? `${activeOption.flag} ${activeOption.value}` : dialCode}
          </span>
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.key} value={option.value} className="text-[13px]">
              <span className="flex items-center gap-2">
                <span>{option.flag}</span>
                <span>{option.name}</span>
                <span className="text-muted-foreground">{option.value}</span>
              </span>
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <input
        id={id}
        name={name}
        type="tel"
        value={localNumber}
        onChange={(event) => {
          const nextLocalNumber = event.target.value;
          onChange(composePhoneValue(dialCode, nextLocalNumber));
        }}
        onBlur={onBlur}
        placeholder={placeholder}
        disabled={disabled}
        autoComplete={autoComplete}
        aria-invalid={invalid || undefined}
        className={cn(
          "h-full min-w-0 flex-1 border-0 bg-transparent px-3 text-[13px] font-normal text-slate-900 outline-none focus:ring-0 placeholder:text-[13px] placeholder:font-normal placeholder:text-slate-400",
          inputClassName,
        )}
      />
    </div>
  );
}
