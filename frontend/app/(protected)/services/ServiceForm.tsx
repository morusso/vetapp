"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import type { ServiceInput } from "@/lib/services";
import RichTextEditor from "@/components/RichTextEditor";

export type ServiceFormValues = {
  name: string;
  description: string;
  price: string;
  tax_rate: string;
  duration_minutes: string;
  is_active: boolean;
};

export default function ServiceForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: ServiceFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: ServiceInput) => Promise<void>;
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
        description: values.description,
        price: values.price,
        tax_rate: values.tax_rate || null,
        duration_minutes: values.duration_minutes ? Number(values.duration_minutes) : null,
        is_active: values.is_active,
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
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Pricing
          </legend>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="price" className="text-xs font-semibold text-ink-muted">
                Price *
              </label>
              <input
                id="price"
                type="number"
                step="0.01"
                min="0"
                required
                value={values.price}
                onChange={(e) => setValues({ ...values, price: e.target.value })}
                className={inputClass}
              />
              {errors("price")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="tax_rate" className="text-xs font-semibold text-ink-muted">
                Tax rate (%)
              </label>
              <input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                value={values.tax_rate}
                onChange={(e) => setValues({ ...values, tax_rate: e.target.value })}
                className={inputClass}
              />
              {errors("tax_rate")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="duration_minutes" className="text-xs font-semibold text-ink-muted">
                Duration (min)
              </label>
              <input
                id="duration_minutes"
                type="number"
                min="0"
                value={values.duration_minutes}
                onChange={(e) => setValues({ ...values, duration_minutes: e.target.value })}
                className={inputClass}
              />
              {errors("duration_minutes")}
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
              checked={values.is_active}
              onChange={(e) => setValues({ ...values, is_active: e.target.checked })}
              className="size-4 accent-accent"
            />
            Active
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
