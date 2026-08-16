"use client";

import { useEffect, useState } from "react";
import { listAllAnimalTypes, type AnimalType } from "@/lib/animals";
import { useForm } from "@/lib/hooks/useForm";
import RichTextEditor from "@/components/RichTextEditor";
import SearchableSelect from "@/components/SearchableSelect";

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
  const [animalTypes, setAnimalTypes] = useState<AnimalType[]>([]);
  const { values, setValues, fieldErrors, setFieldErrors, isSubmitting, handleSubmit } = useForm({
    initialValues,
    onSubmit,
    prepareSubmit: (v) => ({ ...v, animal_type: Number(v.animal_type) }),
  });

  useEffect(() => {
    listAllAnimalTypes()
      .then(setAnimalTypes)
      .catch(() => setFieldErrors({ detail: ["Could not load animal types."] }));
  }, [setFieldErrors]);

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
          <SearchableSelect
            id="animal_type"
            required
            value={values.animal_type}
            onChange={(v) => setValues({ ...values, animal_type: v })}
            placeholder="Select an animal type"
            className={inputClass}
            options={animalTypes.map((animalType) => ({
              value: String(animalType.id),
              label: animalType.name,
            }))}
          />
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
