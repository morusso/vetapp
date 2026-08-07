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
  onSubmit,
}: {
  initialValues: ClientFormValues;
  submitLabel: string;
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
    options: { type?: string; required?: boolean; multiline?: boolean } = {}
  ) {
    const { type = "text", required = false, multiline = false } = options;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-sm font-medium">
          {label}
        </label>
        {multiline ? (
          <textarea
            id={id}
            value={values[id]}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        ) : (
          <input
            id={id}
            type={type}
            required={required}
            value={values[id]}
            onChange={(e) => setValues({ ...values, [id]: e.target.value })}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        )}
        {fieldErrors[id]?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      {field("first_name", "First name", { required: true })}
      {field("last_name", "Last name", { required: true })}
      {field("email", "Email", { type: "email", required: true })}
      {field("phone_number", "Phone number", { required: true })}
      {field("street", "Street", { required: true })}
      {field("city", "City", { required: true })}
      {field("postal_code", "Postal code", { required: true })}
      {field("notes", "Notes", { multiline: true })}

      {fieldErrors.detail && (
        <p className="text-sm text-red-600">{fieldErrors.detail.join(" ")}</p>
      )}

      <button
        type="submit"
        disabled={isSubmitting}
        className="rounded bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
      >
        {isSubmitting ? "Saving…" : submitLabel}
      </button>
    </form>
  );
}
