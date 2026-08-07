"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { listAllAnimals, type Animal } from "@/lib/animals";
import { listAllClients, type Client } from "@/lib/clients";
import type { PatientInput, Sex } from "@/lib/patients";

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
  onSubmit,
}: {
  initialValues: PatientFormValues;
  submitLabel: string;
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
        <label htmlFor="owner" className="text-sm font-medium">
          Owner
        </label>
        <select
          id="owner"
          required
          value={values.owner}
          onChange={(e) => setValues({ ...values, owner: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
        {fieldErrors.owner?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="breed" className="text-sm font-medium">
          Breed
        </label>
        <select
          id="breed"
          required
          value={values.breed}
          onChange={(e) => setValues({ ...values, breed: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
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
        {fieldErrors.breed?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="sex" className="text-sm font-medium">
          Sex
        </label>
        <select
          id="sex"
          value={values.sex}
          onChange={(e) => setValues({ ...values, sex: e.target.value as Sex })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        >
          <option value="unknown">Unknown</option>
          <option value="male">Male</option>
          <option value="female">Female</option>
        </select>
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="birth_date" className="text-sm font-medium">
          Birth date
        </label>
        <input
          id="birth_date"
          type="date"
          value={values.birth_date}
          onChange={(e) => setValues({ ...values, birth_date: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {fieldErrors.birth_date?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="color" className="text-sm font-medium">
          Color
        </label>
        <input
          id="color"
          value={values.color}
          onChange={(e) => setValues({ ...values, color: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="microchip_number" className="text-sm font-medium">
          Microchip number
        </label>
        <input
          id="microchip_number"
          value={values.microchip_number}
          onChange={(e) => setValues({ ...values, microchip_number: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
        {fieldErrors.microchip_number?.map((msg) => (
          <p key={msg} className="text-sm text-red-600">
            {msg}
          </p>
        ))}
      </div>

      <div className="flex flex-col gap-1">
        <label htmlFor="note" className="text-sm font-medium">
          Note
        </label>
        <textarea
          id="note"
          value={values.note}
          onChange={(e) => setValues({ ...values, note: e.target.value })}
          className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
        />
      </div>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={values.is_sterilized}
          onChange={(e) => setValues({ ...values, is_sterilized: e.target.checked })}
        />
        Sterilized
      </label>

      <label className="flex items-center gap-2 text-sm font-medium">
        <input
          type="checkbox"
          checked={values.is_deceased}
          onChange={(e) => setValues({ ...values, is_deceased: e.target.checked })}
        />
        Deceased
      </label>

      {values.is_deceased && (
        <div className="flex flex-col gap-1">
          <label htmlFor="date_of_death" className="text-sm font-medium">
            Date of death
          </label>
          <input
            id="date_of_death"
            type="date"
            value={values.date_of_death}
            onChange={(e) => setValues({ ...values, date_of_death: e.target.value })}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
      )}

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
