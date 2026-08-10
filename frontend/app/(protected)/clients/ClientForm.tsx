"use client";

import { useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import RichTextEditor from "@/components/RichTextEditor";

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

const PHONE_NUMBER_PATTERN = /^\+?[0-9\s-]{7,20}$/;
const PHONE_NUMBER_ERROR = "Enter a valid phone number (digits, spaces, - and leading + only).";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_ERROR = "Enter a valid email address.";

const POSTAL_CODE_PATTERN = /^[A-Za-z0-9]{2,4}[\s-]?[A-Za-z0-9]{2,4}$/;
const POSTAL_CODE_ERROR = "Enter a valid postal code.";

export default function ClientForm({
  initialValues,
  submitLabel,
  title,
  onSubmit,
}: {
  initialValues: ClientFormValues;
  submitLabel: string;
  title: string;
  onSubmit: (values: ClientFormValues) => Promise<void>;
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  function handleChange(id: keyof ClientFormValues, value: string) {
    setValues((prev) => ({ ...prev, [id]: value }));

    if (id === "phone_number") {
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (value && !PHONE_NUMBER_PATTERN.test(value)) {
          next.phone_number = [PHONE_NUMBER_ERROR];
        } else {
          delete next.phone_number;
        }
        return next;
      });
    }

    if (id === "email") {
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (value && !EMAIL_PATTERN.test(value)) {
          next.email = [EMAIL_ERROR];
        } else {
          delete next.email;
        }
        return next;
      });
    }

    if (id === "postal_code") {
      setFieldErrors((prev) => {
        const next = { ...prev };
        if (value && !POSTAL_CODE_PATTERN.test(value)) {
          next.postal_code = [POSTAL_CODE_ERROR];
        } else {
          delete next.postal_code;
        }
        return next;
      });
    }
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    if (values.email && !EMAIL_PATTERN.test(values.email)) {
      setFieldErrors({ email: [EMAIL_ERROR] });
      return;
    }

    if (values.phone_number && !PHONE_NUMBER_PATTERN.test(values.phone_number)) {
      setFieldErrors({ phone_number: [PHONE_NUMBER_ERROR] });
      return;
    }

    if (values.postal_code && !POSTAL_CODE_PATTERN.test(values.postal_code)) {
      setFieldErrors({ postal_code: [POSTAL_CODE_ERROR] });
      return;
    }

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
    options: {
      type?: string;
      required?: boolean;
      multiline?: boolean;
      mono?: boolean;
      pattern?: string;
      title?: string;
      placeholder?: string;
    } = {}
  ) {
    const {
      type = "text",
      required = false,
      multiline = false,
      mono = false,
      pattern,
      title,
      placeholder,
    } = options;
    const inputClass = `rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none ${mono ? "font-mono" : ""}`;
    return (
      <div className="flex flex-col gap-1">
        <label htmlFor={id} className="text-xs font-semibold text-ink-muted">
          {label}
          {required && " *"}
        </label>
        {multiline ? (
          <RichTextEditor
            id={id}
            value={values[id]}
            onChange={(html) => handleChange(id, html)}
            editorClassName="min-h-16"
          />
        ) : (
          <input
            id={id}
            type={type}
            required={required}
            pattern={pattern}
            title={title}
            placeholder={placeholder}
            value={values[id]}
            onChange={(e) => handleChange(id, e.target.value)}
            className={inputClass}
          />
        )}
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
            Basic info
          </legend>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("first_name", "First name", { required: true })}
            {field("last_name", "Last name", { required: true })}
          </div>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("email", "Email", {
              type: "email",
              required: true,
              pattern: EMAIL_PATTERN.source,
              title: EMAIL_ERROR,
            })}
            {field("phone_number", "Phone number", {
              type: "tel",
              required: true,
              mono: true,
              pattern: PHONE_NUMBER_PATTERN.source,
              title: "Digits, spaces, - and a leading + only (7-20 characters).",
              placeholder: "+48 123 456 789",
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Address
          </legend>
          {field("street", "Street", { required: true })}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {field("city", "City", { required: true })}
            {field("postal_code", "Postal code", {
              required: true,
              mono: true,
              pattern: POSTAL_CODE_PATTERN.source,
              title: POSTAL_CODE_ERROR,
              placeholder: "e.g. 00-950",
            })}
          </div>
        </fieldset>

        <fieldset className="flex flex-col gap-3">
          <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
            Notes
          </legend>
          {field("notes", "Internal notes", { multiline: true })}
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
