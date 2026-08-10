"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError, listAllAnimalTypes, type AnimalType } from "@/lib/animals";
import RichTextEditor from "@/components/RichTextEditor";

export type AnimalFormValues = { name: string; animal_type: string; description: string };

export default function AnimalForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: AnimalFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: { name: string; animal_type: number; description: string }) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listAllAnimalTypes()
      .then(setAnimalTypes)
      .catch(() => setFieldErrors({ detail: ["Could not load animal types."] }));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({ ...values, animal_type: Number(values.animal_type) });
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
            className={inputClass}
          />
          {fieldErrors.name?.map((msg) => (
            <p key={msg} className="text-xs text-danger">
              {msg}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="animal_type" className="text-xs font-semibold text-ink-muted">
            Animal type *
          </label>
          <select
            id="animal_type"
            required
            value={values.animal_type}
            onChange={(e) => setValues({ ...values, animal_type: e.target.value })}
            className={inputClass}
          >
            <option value="" disabled>
              Select an animal type
            </option>
            {animalTypes.map((animalType) => (
              <option key={animalType.id} value={animalType.id}>
                {animalType.name}
              </option>
            ))}
          </select>
          {fieldErrors.animal_type?.map((msg) => (
            <p key={msg} className="text-xs text-danger">
              {msg}
            </p>
          ))}
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
