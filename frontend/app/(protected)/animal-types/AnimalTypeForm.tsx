"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/animals";

export type AnimalTypeFormValues = { name: string; description: string };

export default function AnimalTypeForm({
  initialValues,
  submitLabel,
  onSubmit,
}: {
  initialValues: AnimalTypeFormValues;
  submitLabel: string;
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
    <form onSubmit={handleSubmit} className="flex w-full max-w-sm flex-col gap-4">
      <div className="flex flex-col gap-1">
        <label htmlFor="name" className="text-sm font-medium">
          Name
        </label>
        <input
          id="name"
          required
          value={values.name}
          onChange={(e) => setValues({ ...values, name: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {fieldErrors.name?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="description" className="text-sm font-medium">
          Description
        </label>
        <textarea
          id="description"
          value={values.description}
          onChange={(e) => setValues({ ...values, description: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {fieldErrors.description?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>

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
