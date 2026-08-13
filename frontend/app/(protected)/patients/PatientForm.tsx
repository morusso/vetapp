"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { listAllAnimals, type Animal } from "@/lib/animals";
import { listAllClients, type Client } from "@/lib/clients";
import type { PatientInput, Sex } from "@/lib/patients";
import RichTextEditor from "@/components/RichTextEditor";

export type PatientFormValues = {
  name: string;
  owner: string;
  breed: string;
  sex: Sex;
  birth_date: string;
  color: string;
  microchip_number: string;
  note: string;
  is_sterilized: boolean;
  is_deceased: boolean;
  date_of_death: string;
};

export default function PatientForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: PatientFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: PatientInput) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [clients, setClients] = useState<Client[]>([]);
  const [breeds, setBreeds] = useState<Animal[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listAllClients()
      .then(setClients)
      .catch(() => setFieldErrors((prev) => ({ ...prev, detail: ["Could not load clients."] })));
    listAllAnimals()
      .then(setBreeds)
      .catch(() => setFieldErrors((prev) => ({ ...prev, detail: ["Could not load breeds."] })));
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: values.name,
        owner: Number(values.owner),
        breed: Number(values.breed),
        sex: values.sex,
        birth_date: values.birth_date || null,
        color: values.color,
        microchip_number: values.microchip_number || null,
        note: values.note || null,
        is_sterilized: values.is_sterilized,
        is_deceased: values.is_deceased,
        date_of_death: values.date_of_death || null,
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
              <label htmlFor="owner" className="text-xs font-semibold text-ink-muted">
                Owner *
              </label>
              <select
                id="owner"
                required
                value={values.owner}
                onChange={(e) => setValues({ ...values, owner: e.target.value })}
                className={inputClass}
              >
                <option value="" disabled>
                  Select an owner
                </option>
                {clients.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.first_name} {c.last_name}
                  </option>
                ))}
              </select>
              {errors("owner")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="breed" className="text-xs font-semibold text-ink-muted">
                Breed *
              </label>
              <select
                id="breed"
                required
                value={values.breed}
                onChange={(e) => setValues({ ...values, breed: e.target.value })}
                className={inputClass}
              >
                <option value="" disabled>
                  Select a breed
                </option>
                {breeds.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.name} ({b.animal_type_name})
                  </option>
                ))}
              </select>
              {errors("breed")}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="sex" className="text-xs font-semibold text-ink-muted">
                Sex
              </label>
              <select
                id="sex"
                value={values.sex}
                onChange={(e) => setValues({ ...values, sex: e.target.value as Sex })}
                className={inputClass}
              >
                <option value="unknown">Unknown</option>
                <option value="male">Male</option>
                <option value="female">Female</option>
              </select>
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="birth_date" className="text-xs font-semibold text-ink-muted">
                Birth date
              </label>
              <input
                id="birth_date"
                type="date"
                value={values.birth_date}
                onChange={(e) => setValues({ ...values, birth_date: e.target.value })}
                className={inputClass}
              />
              {errors("birth_date")}
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Details
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="color" className="text-xs font-semibold text-ink-muted">
                Color
              </label>
              <input
                id="color"
                value={values.color}
                onChange={(e) => setValues({ ...values, color: e.target.value })}
                className={inputClass}
              />
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="microchip_number" className="text-xs font-semibold text-ink-muted">
                Microchip number
              </label>
              <input
                id="microchip_number"
                value={values.microchip_number}
                onChange={(e) => setValues({ ...values, microchip_number: e.target.value })}
                className={`${inputClass} font-mono`}
              />
              {errors("microchip_number")}
            </div>
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Notes
          </legend>
          <label htmlFor="note" className="sr-only">
            Internal notes
          </label>
          <RichTextEditor
            id="note"
            value={values.note}
            onChange={(html) => setValues({ ...values, note: html })}
            editorClassName="min-h-16"
          />
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Status
          </legend>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={values.is_sterilized}
              onChange={(e) => setValues({ ...values, is_sterilized: e.target.checked })}
              className="size-4 accent-accent"
            />
            Sterilized
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={values.is_deceased}
              onChange={(e) => setValues({ ...values, is_deceased: e.target.checked })}
              className="size-4 accent-accent"
            />
            Deceased
          </label>

          {values.is_deceased && (
            <div className="flex flex-col gap-1 pt-1">
              <label htmlFor="date_of_death" className="text-xs font-semibold text-ink-muted">
                Date of death
              </label>
              <input
                id="date_of_death"
                type="date"
                value={values.date_of_death}
                onChange={(e) => setValues({ ...values, date_of_death: e.target.value })}
                className={`${inputClass} max-w-56`}
              />
            </div>
          )}
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
