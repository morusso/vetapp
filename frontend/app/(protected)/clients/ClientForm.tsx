"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";

export type ClientFormValues = {
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  street: string;
  city: string;
  postal_code: string;
  notes: string;
};

export default function ClientForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: ClientFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: ClientFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit(values);
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

  function field(
    id: keyof ClientFormValues,
    label: string,
    options: { type?: string; required?: boolean; multiline?: boolean; mono?: boolean } = {}
  ) {
    const { type = "text", required = false, multiline = false, mono = false } = options;
    const inputClass = `rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none ${mono ? "font-mono" : ""}`;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-xs font-semibold text-ink-muted">
          {label}
          {required && " *"}
        </label>
        {multiline ? (
          <textarea
            id={id}
            value={values[id]}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
            className={`${inputClass} min-h-16 resize-y`}
          />
        ) : (
          <input
            id={id}
            type={type}
            required={required}
            value={values[id]}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
            className={inputClass}
          />
        )}
        {fieldErrors[id]?.map((msg) => (
          <p key={msg} className="text-xs text-danger">
            {msg}
          </p>
        ))}
      </div>
    );
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
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("first_name", "First name", { required: true })}
            {field("last_name", "Last name", { required: true })}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("email", "Email", { type: "email", required: true })}
            {field("phone_number", "Phone number", { required: true, mono: true })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Address
          </legend>
          {field("street", "Street", { required: true })}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("city", "City", { required: true })}
            {field("postal_code", "Postal code", { required: true, mono: true })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Notes
          </legend>
          {field("notes", "Internal notes", { multiline: true })}
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
