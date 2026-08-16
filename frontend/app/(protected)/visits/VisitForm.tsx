"use client";

import { useEffect, useState } from "react";
import { useForm } from "@/lib/hooks/useForm";
import { listAllPatients, type Patient } from "@/lib/patients";
import { listAllUsers, type User } from "@/lib/users";
import type { VisitInput } from "@/lib/visits";
import RichTextEditor from "@/components/RichTextEditor";
import SearchableSelect from "@/components/SearchableSelect";

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
  const [patients, setPatients] = useState<Patient[]>([]);
  const [veterinarians, setVeterinarians] = useState<User[]>([]);
  const { values, setValues, fieldErrors, setFieldErrors, isSubmitting, handleSubmit, errors } =
    useForm({
      initialValues,
      onSubmit,
      prepareSubmit: (v) => ({
        patient: Number(v.patient),
        veterinarian: Number(v.veterinarian),
        visit_date: new Date(v.visit_date).toISOString(),
        diagnosis: v.diagnosis,
      }),
    });

  useEffect(() => {
    listAllPatients()
      .then(setPatients)
      .catch(() => setFieldErrors((prev) => ({ ...prev, detail: ["Could not load patients."] })));
    listAllUsers()
      .then(setVeterinarians)
      .catch(() =>
        setFieldErrors((prev) => ({ ...prev, detail: ["Could not load veterinarians."] }))
      );
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
        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Visit
          </legend>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="patient" className="text-xs font-semibold text-ink-muted">
                Patient *
              </label>
              <SearchableSelect
                id="patient"
                required
                value={values.patient}
                onChange={(v) => setValues({ ...values, patient: v })}
                placeholder="Select a patient"
                className={inputClass}
                options={patients.map((p) => ({
                  value: String(p.id),
                  label: `${p.name} (${p.owner_name})`,
                }))}
              />
              {errors("patient")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="veterinarian" className="text-xs font-semibold text-ink-muted">
                Veterinarian *
              </label>
              <SearchableSelect
                id="veterinarian"
                required
                value={values.veterinarian}
                onChange={(v) => setValues({ ...values, veterinarian: v })}
                placeholder="Select a veterinarian"
                className={inputClass}
                options={veterinarians.map((u) => ({
                  value: String(u.id),
                  label: userLabel(u),
                }))}
              />
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
          <RichTextEditor
            id="diagnosis"
            value={values.diagnosis}
            onChange={(html) => setValues({ ...values, diagnosis: html })}
            editorClassName="min-h-24"
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
