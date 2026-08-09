"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { listAllPatients, type Patient } from "@/lib/patients";
import { listAllUsers, type User } from "@/lib/users";
import type { VisitInput } from "@/lib/visits";

export type VisitFormValues = {
  patient: string;
  veterinarian: string;
  visit_date: string;
  diagnosis: string;
};

export function toDatetimeLocal(iso: string): string {
  const date = new Date(iso);
  const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
  return local.toISOString().slice(0, 16);
}

function userLabel(user: User): string {
  const name = `${user.first_name} ${user.last_name}`.trim();
  return name || user.email;
}

export default function VisitForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: VisitFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: VisitInput) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [veterinarians, setVeterinarians] = useState<User[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listAllPatients()
      .then(setPatients)
      .catch(() => setFieldErrors((prev) => ({ ...prev, detail: ["Could not load patients."] })));
    listAllUsers()
      .then(setVeterinarians)
      .catch(() =>
        setFieldErrors((prev) => ({ ...prev, detail: ["Could not load veterinarians."] }))
      );
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await onSubmit({
        patient: Number(values.patient),
        veterinarian: Number(values.veterinarian),
        visit_date: new Date(values.visit_date).toISOString(),
        diagnosis: values.diagnosis,
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
            Visit
          </legend>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="patient" className="text-xs font-semibold text-ink-muted">
                Patient *
              </label>
              <select
                id="patient"
                required
                value={values.patient}
                onChange={(e) => setValues({ ...values, patient: e.target.value })}
                className={inputClass}
              >
                <option value="" disabled>
                  Select a patient
                </option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({p.owner_name})
                  </option>
                ))}
              </select>
              {errors("patient")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="veterinarian" className="text-xs font-semibold text-ink-muted">
                Veterinarian *
              </label>
              <select
                id="veterinarian"
                required
                value={values.veterinarian}
                onChange={(e) => setValues({ ...values, veterinarian: e.target.value })}
                className={inputClass}
              >
                <option value="" disabled>
                  Select a veterinarian
                </option>
                {veterinarians.map((u) => (
                  <option key={u.id} value={u.id}>
                    {userLabel(u)}
                  </option>
                ))}
              </select>
              {errors("veterinarian")}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="visit_date" className="text-xs font-semibold text-ink-muted">
              Date &amp; time *
            </label>
            <input
              id="visit_date"
              type="datetime-local"
              required
              value={values.visit_date}
              onChange={(e) => setValues({ ...values, visit_date: e.target.value })}
              className={`${inputClass} max-w-56`}
            />
            {errors("visit_date")}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Diagnosis
          </legend>
          <label htmlFor="diagnosis" className="sr-only">
            Diagnosis
          </label>
          <textarea
            id="diagnosis"
            value={values.diagnosis}
            onChange={(e) => setValues({ ...values, diagnosis: e.target.value })}
            className={`${inputClass} min-h-24 resize-y`}
          />
          {errors("diagnosis")}
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
