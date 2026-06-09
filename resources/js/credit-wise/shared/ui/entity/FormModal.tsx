import { type FormEvent, useState } from "react";
import { AlertTriangle, ChevronDown, ChevronUp, Plus, Trash2, X } from "lucide-react";
import { pickFieldIcon } from "./icons";
import type { Field, VariantSchema } from "./types";

export function FormModal({
  title,
  fields,
  initial,
  onClose,
  onSubmit,
}: {
  title: string;
  fields: Field[];
  initial?: Record<string, any>;
  onClose: () => void;
  onSubmit: (values: Record<string, any>) => void;
}) {
  const [values, setValues] = useState<Record<string, any>>(() => {
    const nextValues: Record<string, any> = {};
    fields.forEach((field) => {
      if (field.type === "checkbox") nextValues[field.name] = initial?.[field.name] ?? field.defaultValue ?? false;
      else if (field.type === "variants") nextValues[field.name] = initial?.[field.name] ?? [];
      else nextValues[field.name] = initial?.[field.name] ?? field.defaultValue ?? (field.type === "number" ? 0 : "");
    });
    return nextValues;
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  function validate(): Record<string, string> {
    const nextErrors: Record<string, string> = {};

    fields.forEach((field) => {
      if (field.showWhen && values[field.showWhen.field] !== field.showWhen.equals) {
        return;
      }

      const value = values[field.name];

      if (field.required) {
        if (field.type === "number") {
          const number = Number(value);
          if (!Number.isFinite(number) || number <= 0) nextErrors[field.name] = `${field.label} must be greater than 0`;
        } else if (field.type === "variants") {
          if (!Array.isArray(value) || value.length === 0) nextErrors[field.name] = `Add at least one ${field.label.toLowerCase()}`;
        } else if (value == null || String(value).trim() === "") {
          nextErrors[field.name] = `${field.label} is required`;
        }
      } else if (field.type === "number" && value !== "" && value != null) {
        const number = Number(value);
        if (!Number.isFinite(number) || number < 0) nextErrors[field.name] = `${field.label} cannot be negative`;
      }

      if (field.type === "text" && typeof value === "string" && value.length > 200) {
        nextErrors[field.name] = `${field.label} must be 200 characters or less`;
      }
    });

    return nextErrors;
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    const nextErrors = validate();
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      const firstKey = Object.keys(nextErrors)[0];
      const element = document.querySelector(`[data-field="${firstKey}"]`) as HTMLElement | null;
      element?.scrollIntoView({ behavior: "smooth", block: "center" });
      return;
    }

    onSubmit(values);
  }

  const inputClassName =
    "w-full h-11 px-3 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 transition";

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-slate-900/50 backdrop-blur-sm animate-fade-in"
      style={{ fontFamily: "Montserrat, ui-sans-serif, system-ui, sans-serif" }}
      onClick={onClose}
    >
      <form
        onSubmit={handleSubmit}
        onClick={(event) => event.stopPropagation()}
        className="w-full max-w-2xl rounded-2xl bg-white border border-slate-200 shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-slate-900 animate-scale-in"
        style={{ fontFamily: "inherit" }}
      >
        <div className="flex items-center justify-between gap-4 px-6 py-5 bg-gradient-to-r from-primary to-primary text-white">
          <div className="flex items-center gap-3">
            <div className="h-11 w-11 rounded-xl bg-white/15 backdrop-blur grid place-items-center ring-1 ring-white/25">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <h2 className="font-semibold text-lg leading-tight">{title}</h2>
              <p className="text-[12px] text-white/80 mt-0.5">Fill in the details below</p>
            </div>
          </div>
          <button type="button" onClick={onClose} className="h-9 w-9 grid place-items-center rounded-lg bg-white/15 hover:bg-white/25 transition">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-6 bg-white">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-4">
            {fields.map((field) => {
              if (field.showWhen && values[field.showWhen.field] !== field.showWhen.equals) {
                return null;
              }

              const isFullWidth =
                field.fullWidth || field.type === "textarea" || field.type === "variants" || field.type === "checkbox";
              const icon = pickFieldIcon(field.name, field.type);
              const error = errors[field.name];
              const errorClassName = error ? "border-rose-400 focus:ring-rose-200 focus:border-rose-400" : "";

              return (
                <div key={field.name} className={isFullWidth ? "sm:col-span-2" : ""} data-field={field.name}>
                  {field.type !== "checkbox" && field.type !== "variants" && (
                    <label className="flex items-center gap-1.5 text-[13px] font-semibold text-slate-700 mb-1.5">
                      <span className="text-slate-500">{icon}</span>
                      {field.label}
                      {field.required && <span className="text-rose-500">*</span>}
                    </label>
                  )}
                  {field.type === "checkbox" ? (
                    <label className="flex items-center gap-2 cursor-pointer select-none rounded-lg border border-slate-200 bg-slate-50 px-3 py-3">
                      <input
                        type="checkbox"
                        checked={!!values[field.name]}
                        onChange={(event) => setValues((current) => ({ ...current, [field.name]: event.target.checked }))}
                        className="h-4 w-4 accent-primary"
                      />
                      <span className="text-slate-500">{icon}</span>
                      <span className="text-sm font-medium text-slate-700">{field.label}</span>
                    </label>
                  ) : field.type === "variants" ? (
                    <VariantsEditor
                      schema={
                        field.variantSchema ?? [
                          { name: "name", label: "Variant", type: "text", placeholder: "e.g. Red / 1.5 Ton" },
                          { name: "sku", label: "SKU", type: "text" },
                          { name: "price", label: "Price (Rs.)", type: "number" },
                          { name: "stock", label: "Stock", type: "number" },
                        ]
                      }
                      value={Array.isArray(values[field.name]) ? values[field.name] : []}
                      onChange={(rows) => setValues((current) => ({ ...current, [field.name]: rows }))}
                    />
                  ) : field.type === "select" ? (
                    <div className="relative">
                      <select
                        value={values[field.name] ?? ""}
                        onChange={(event) => {
                          setValues((current) => ({ ...current, [field.name]: event.target.value }));
                          if (error) setErrors((current) => clearFieldError(current, field.name));
                        }}
                        className={`${inputClassName} ${errorClassName} appearance-none pr-9 cursor-pointer`}
                      >
                        <option value="">Select...</option>
                        {field.options?.map((option) => (
                          <option key={option} value={option}>
                            {option}
                          </option>
                        ))}
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 pointer-events-none" />
                    </div>
                  ) : field.type === "textarea" ? (
                    <textarea
                      value={values[field.name] ?? ""}
                      onChange={(event) => {
                        setValues((current) => ({ ...current, [field.name]: event.target.value }));
                        if (error) setErrors((current) => clearFieldError(current, field.name));
                      }}
                      placeholder={field.placeholder}
                      rows={3}
                      className={`w-full px-3 py-2.5 rounded-lg border border-slate-200 bg-white text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-primary/30 focus:border-primary/50 resize-none transition ${errorClassName}`}
                    />
                  ) : (
                    <input
                      type={field.type}
                      value={values[field.name] ?? ""}
                      onChange={(event) => {
                        setValues((current) => ({
                          ...current,
                          [field.name]: field.type === "number" ? Number(event.target.value) : event.target.value,
                        }));
                        if (error) setErrors((current) => clearFieldError(current, field.name));
                      }}
                      placeholder={field.placeholder}
                      className={`${inputClassName} ${errorClassName}`}
                    />
                  )}
                  {error && (
                    <p className="mt-1 text-xs font-medium text-rose-600 flex items-center gap-1">
                      <AlertTriangle className="h-3 w-3" /> {error}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 px-6 py-4 border-t border-slate-200 bg-slate-50">
          <span className="text-xs text-slate-500">
            <span className="text-rose-500">*</span> Required fields
          </span>
          <div className="flex items-center gap-2">
            <button type="button" onClick={onClose} className="h-10 px-5 rounded-lg border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
              Cancel
            </button>
            <button type="submit" className="h-10 px-5 inline-flex items-center gap-2 rounded-lg bg-primary text-primary-foreground text-sm font-semibold hover:bg-primary/90 shadow-sm shadow-primary/30">
              <Plus className="h-4 w-4" /> {initial ? "Save Changes" : `Create ${title.replace(/^(Add|Edit) /, "")}`}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}

function VariantsEditor({
  schema,
  value,
  onChange,
}: {
  schema: VariantSchema[];
  value: Array<Record<string, any>>;
  onChange: (rows: Array<Record<string, any>>) => void;
}) {
  const [openIndex, setOpenIndex] = useState<number | null>(value.length ? 0 : null);

  function add() {
    const blank: Record<string, any> = {};
    schema.forEach((entry) => {
      blank[entry.name] = entry.type === "number" ? 0 : "";
    });
    onChange([...value, blank]);
    setOpenIndex(value.length);
  }

  function update(index: number, key: string, fieldValue: any) {
    const next = value.slice();
    next[index] = { ...next[index], [key]: fieldValue };
    onChange(next);
  }

  function remove(index: number) {
    const next = value.slice();
    next.splice(index, 1);
    onChange(next);
    setOpenIndex(null);
  }

  return (
    <div className="rounded-lg border border-border bg-muted/20 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold">Variants ({value.length})</div>
        <button type="button" onClick={add} className="h-8 px-3 inline-flex items-center gap-1.5 rounded-md bg-primary text-primary-foreground text-xs font-semibold hover:bg-primary/90">
          <Plus className="h-3.5 w-3.5" /> Add Variant
        </button>
      </div>
      {value.length === 0 ? (
        <div className="text-xs text-muted-foreground py-4 text-center">No variants yet. Click "Add Variant" to create one.</div>
      ) : (
        <div className="space-y-2">
          {value.map((row, index) => {
            const open = openIndex === index;

            return (
              <div key={index} className="rounded-md border border-border bg-card overflow-hidden">
                <button
                  type="button"
                  onClick={() => setOpenIndex(open ? null : index)}
                  className="w-full flex items-center justify-between px-3 py-2 hover:bg-muted/50"
                >
                  <span className="text-sm font-medium">{row[schema[0].name] || `Variant #${index + 1}`}</span>
                  <span className="flex items-center gap-1">
                    <span className="text-xs text-muted-foreground mr-1">
                      {schema
                        .slice(1, 3)
                        .map((entry) => row[entry.name])
                        .filter(Boolean)
                        .join(" • ")}
                    </span>
                    {open ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
                  </span>
                </button>
                {open && (
                  <div className="p-3 border-t border-border grid grid-cols-2 gap-3">
                    {schema.map((entry) => (
                      <div key={entry.name}>
                        <label className="block text-xs font-medium mb-1">{entry.label}</label>
                        <input
                          type={entry.type}
                          value={row[entry.name] ?? ""}
                          onChange={(event) =>
                            update(index, entry.name, entry.type === "number" ? Number(event.target.value) : event.target.value)
                          }
                          placeholder={entry.placeholder}
                          className="w-full h-9 px-2.5 rounded-md border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring/30"
                        />
                      </div>
                    ))}
                    <div className="col-span-2 flex justify-end">
                      <button type="button" onClick={() => remove(index)} className="h-8 px-3 inline-flex items-center gap-1 rounded-md border border-destructive/30 text-destructive text-xs font-semibold hover:bg-destructive/10">
                        <Trash2 className="h-3.5 w-3.5" /> Remove
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function clearFieldError(errors: Record<string, string>, fieldName: string) {
  const next = { ...errors };
  delete next[fieldName];
  return next;
}
