"use client";

import { useCallback, useState, type FormEvent } from "react";

export type FieldErrors = Record<string, string[]>;

function isFieldError(err: unknown): err is { fieldErrors: FieldErrors } {
  return err instanceof Error && "fieldErrors" in err;
}

export function useForm<Values, Submitted = Values>({
  initialValues,
  onSubmit,
  prepareSubmit,
  validate,
}: {
  initialValues: Values;
  onSubmit: (values: Submitted) => Promise<void>;
  prepareSubmit?: (values: Values) => Submitted;
  validate?: (values: Values) => FieldErrors | null;
}) {
  const [values, setValues] = useState(initialValues);
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = useCallback(
    async (event: FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      setFieldErrors({});

      const validationErrors = validate?.(values);
      if (validationErrors) {
        setFieldErrors(validationErrors);
        return;
      }

      setIsSubmitting(true);
      try {
        await onSubmit((prepareSubmit ? prepareSubmit(values) : values) as Submitted);
      } catch (err) {
        setFieldErrors(
          isFieldError(err) ? err.fieldErrors : { detail: ["Could not connect to the server."] }
        );
      } finally {
        setIsSubmitting(false);
      }
    },
    [values, validate, prepareSubmit, onSubmit]
  );

  function errors(id: string) {
    return fieldErrors[id]?.map((msg) => (
      <p key={msg} className="text-xs text-danger">
        {msg}
      </p>
    ));
  }

  return { values, setValues, fieldErrors, setFieldErrors, isSubmitting, handleSubmit, errors };
}
