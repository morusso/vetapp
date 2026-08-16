"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import type { DosageForm, MedicineInput } from "@/lib/medicines";
import RichTextEditor from "@/components/RichTextEditor";
import SearchableSelect from "@/components/SearchableSelect";

export type MedicineFormValues = {
  name: string;
  manufacturer: string;
  active_substance: string;
  form: DosageForm;
  strength: string;
  unit: string;
  description: string;
  withdrawal_period_days: string;
  minimum_stock_level: string;
  requires_prescription: boolean;
  is_controlled_substance: boolean;
};

const DOSAGE_FORMS: { value: DosageForm; label: string }[] = [
  { value: "tablet", label: "Tablet" },
  { value: "capsule", label: "Capsule" },
  { value: "liquid", label: "Liquid" },
  { value: "injection", label: "Injection" },
  { value: "ointment", label: "Ointment" },
  { value: "powder", label: "Powder" },
  { value: "drops", label: "Drops" },
  { value: "spray", label: "Spray" },
  { value: "other", label: "Other" },
];

export default function MedicineForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: MedicineFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: MedicineInput) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: values.name,
        manufacturer: values.manufacturer,
        active_substance: values.active_substance,
        form: values.form,
        strength: values.strength,
        unit: values.unit,
        description: values.description || null,
        withdrawal_period_days: values.withdrawal_period_days
          ? Number(values.withdrawal_period_days)
          : null,
        minimum_stock_level: values.minimum_stock_level || null,
        requires_prescription: values.requires_prescription,
        is_controlled_substance: values.is_controlled_substance,
      });
    } catch (err) {
      setFieldErrors(
        err instanceof ApiError
          ? err.fieldErrors
          : { detail: ["Could not connect to the server."] }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  const inputClass =
    "rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none";

  function errors(id: string) {
    return fieldErrors[id]?.map((msg) => (
      <p key={msg} className="text-xs text-danger">
        {msg}
      </p>
    ));
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5">
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Basic info
          </legend>

          <div className="flex flex-col gap-1">
            <label htmlFor="name" className="text-xs font-semibold text-ink-muted">
              Name *
            </label>
            <input
              id="name"
              required
              value={values.name}
              onChange={(e) => setValues({ ...values, name: e.target.value })}
              className={inputClass}
            />
            {errors("name")}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="manufacturer" className="text-xs font-semibold text-ink-muted">
                Manufacturer
              </label>
              <input
                id="manufacturer"
                value={values.manufacturer}
                onChange={(e) => setValues({ ...values, manufacturer: e.target.value })}
                className={inputClass}
              />
              {errors("manufacturer")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="active_substance" className="text-xs font-semibold text-ink-muted">
                Active substance
              </label>
              <input
                id="active_substance"
                value={values.active_substance}
                onChange={(e) => setValues({ ...values, active_substance: e.target.value })}
                className={inputClass}
              />
              {errors("active_substance")}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="form" className="text-xs font-semibold text-ink-muted">
                Form
              </label>
              <SearchableSelect
                id="form"
                value={values.form}
                onChange={(v) => setValues({ ...values, form: v as DosageForm })}
                className={inputClass}
                options={DOSAGE_FORMS}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="strength" className="text-xs font-semibold text-ink-muted">
                Strength
              </label>
              <input
                id="strength"
                placeholder="e.g. 50mg"
                value={values.strength}
                onChange={(e) => setValues({ ...values, strength: e.target.value })}
                className={inputClass}
              />
              {errors("strength")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="unit" className="text-xs font-semibold text-ink-muted">
                Unit *
              </label>
              <input
                id="unit"
                required
                placeholder="e.g. tablet, ml"
                value={values.unit}
                onChange={(e) => setValues({ ...values, unit: e.target.value })}
                className={inputClass}
              />
              {errors("unit")}
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Details
          </legend>

          <div className="flex flex-col gap-1">
            <label htmlFor="description" className="text-xs font-semibold text-ink-muted">
              Description
            </label>
            <RichTextEditor
              id="description"
              value={values.description}
              onChange={(html) => setValues({ ...values, description: html })}
              editorClassName="min-h-16"
            />
            {errors("description")}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label
                htmlFor="withdrawal_period_days"
                className="text-xs font-semibold text-ink-muted"
              >
                Withdrawal period (days)
              </label>
              <input
                id="withdrawal_period_days"
                type="number"
                min="0"
                value={values.withdrawal_period_days}
                onChange={(e) =>
                  setValues({ ...values, withdrawal_period_days: e.target.value })
                }
                className={inputClass}
              />
              {errors("withdrawal_period_days")}
            </div>

            <div className="flex flex-col gap-1">
              <label
                htmlFor="minimum_stock_level"
                className="text-xs font-semibold text-ink-muted"
              >
                Minimum stock level
              </label>
              <input
                id="minimum_stock_level"
                type="number"
                step="0.01"
                min="0"
                value={values.minimum_stock_level}
                onChange={(e) =>
                  setValues({ ...values, minimum_stock_level: e.target.value })
                }
                className={inputClass}
              />
              {errors("minimum_stock_level")}
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Status
          </legend>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={values.requires_prescription}
              onChange={(e) =>
                setValues({ ...values, requires_prescription: e.target.checked })
              }
              className="size-4 accent-accent"
            />
            Requires prescription
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={values.is_controlled_substance}
              onChange={(e) =>
                setValues({ ...values, is_controlled_substance: e.target.checked })
              }
              className="size-4 accent-accent"
            />
            Controlled substance
          </label>
        </fieldset>

        {fieldErrors.detail && <p className="text-sm text-danger">{fieldErrors.detail.join(" ")}</p>}
      </div>

      <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50"
        >
          {isSubmitting ? "Saving…" : submitLabel}
        </button>
      </div>
    </form>
  );
}
