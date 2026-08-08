"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError, listAllSpecializations, type Specialization, type UserInput } from "@/lib/users";

export type UserFormValues = {
  email: string;
  password: string;
  password_confirm: string;
  first_name: string;
  last_name: string;
  phone_number: string;
  specializations: number[];
  is_staff: boolean;
  is_active: boolean;
};

export default function UserForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: UserFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: UserInput) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listAllSpecializations()
      .then(setSpecializations)
      .catch(() =>
        setFieldErrors((prev) => ({ ...prev, detail: ["Could not load specializations."] }))
      );
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    if (values.password !== values.password_confirm) {
      setFieldErrors({ password_confirm: ["Passwords do not match."] });
      return;
    }

    setIsSubmitting(true);
    try {
      await onSubmit({
        email: values.email,
        password: values.password,
        first_name: values.first_name,
        last_name: values.last_name,
        phone_number: values.phone_number,
        specializations: values.specializations,
        is_staff: values.is_staff,
        is_active: values.is_active,
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

  function field(
    id: "email" | "password" | "password_confirm" | "first_name" | "last_name" | "phone_number",
    label: string,
    options: { type?: string; required?: boolean; mono?: boolean } = {}
  ) {
    const { type = "text", required = false, mono = false } = options;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-xs font-semibold text-ink-muted">
          {label}
          {required && " *"}
        </label>
        <input
          id={id}
          type={type}
          required={required}
          value={values[id]}
          onChange={(e) => setValues({ ...values, [id]: e.target.value })}
          className={`rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none ${mono ? "font-mono" : ""}`}
        />
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
            Account
          </legend>
          {field("email", "Email", { type: "email", required: true })}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("password", "Password", { type: "password", required: true })}
            {field("password_confirm", "Confirm password", { type: "password", required: true })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Personal info
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("first_name", "First name")}
            {field("last_name", "Last name")}
          </div>
          {field("phone_number", "Phone number", { mono: true })}
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Specializations
          </legend>
          {specializations.length === 0 ? (
            <p className="text-xs text-ink-faint">No specializations yet.</p>
          ) : (
            <div className="flex flex-col gap-2 rounded-md border border-line-strong px-3 py-2.5">
              {specializations.map((s) => (
                <label key={s.id} className="flex items-center gap-2 text-sm font-medium">
                  <input
                    type="checkbox"
                    checked={values.specializations.includes(s.id)}
                    onChange={(e) =>
                      setValues({
                        ...values,
                        specializations: e.target.checked
                          ? [...values.specializations, s.id]
                          : values.specializations.filter((id) => id !== s.id),
                      })
                    }
                    className="size-4 accent-accent"
                  />
                  {s.name}
                </label>
              ))}
            </div>
          )}
          {fieldErrors.specializations?.map((msg) => (
            <p key={msg} className="text-xs text-danger">
              {msg}
            </p>
          ))}
        </fieldset>

        <fieldset className="flex flex-col gap-2.5">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Status
          </legend>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={values.is_active}
              onChange={(e) => setValues({ ...values, is_active: e.target.checked })}
              className="size-4 accent-accent"
            />
            Active
          </label>

          <label className="flex items-center gap-2 text-sm font-medium">
            <input
              type="checkbox"
              checked={values.is_staff}
              onChange={(e) => setValues({ ...values, is_staff: e.target.checked })}
              className="size-4 accent-accent"
            />
            Staff access
          </label>
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
