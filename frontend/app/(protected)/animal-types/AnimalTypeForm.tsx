"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/animals";

export type AnimalTypeFormValues = { name: string; description: string };

export default function AnimalTypeForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: AnimalTypeFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: AnimalTypeFormValues) => Promise<void>;
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

  return (
    <form
      onSubmit={handleSubmit}
      className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm"
    >
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold">{title}</h2>
      </div>

      <div className="flex flex-col gap-5 px-6 py-5">
        <div className="flex flex-col gap-1">
          <label htmlFor="name" className="text-xs font-semibold text-ink-muted">
            Name *
          </label>
          <input
            id="name"
            required
            value={values.name}
            onChange={(e) => setValues({ ...values, name: e.target.value })}
            className="rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          {fieldErrors.name?.map((msg) => (
            <p key={msg} className="text-xs text-danger">
              {msg}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="description" className="text-xs font-semibold text-ink-muted">
            Description
          </label>
          <textarea
            id="description"
            value={values.description}
            onChange={(e) => setValues({ ...values, description: e.target.value })}
            className="min-h-16 resize-y rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none"
          />
          {fieldErrors.description?.map((msg) => (
            <p key={msg} className="text-xs text-danger">
              {msg}
            </p>
          ))}
        </div>

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
