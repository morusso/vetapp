"use client";

import { useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { ApiError } from "@/lib/api";
import { createMedicineBatch, listAllMedicines, type Medicine } from "@/lib/medicines";

export default function NewMedicineBatchPage() {
  const router = useRouter();
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [values, setValues] = useState({
    medicine: "",
    batch_number: "",
    quantity: "",
    purchase_price: "",
    sale_price: "",
    tax_rate: "",
    supplier: "",
    received_at: new Date().toISOString().slice(0, 10),
    expiry_date: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    listAllMedicines()
      .then(setMedicines)
      .catch(() =>
        setFieldErrors((prev) => ({ ...prev, detail: ["Could not load medicines."] }))
      );
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});
    setIsSubmitting(true);
    try {
      await createMedicineBatch({
        medicine: Number(values.medicine),
        batch_number: values.batch_number,
        quantity: values.quantity,
        purchase_price: values.purchase_price || null,
        sale_price: values.sale_price || null,
        tax_rate: values.tax_rate || null,
        supplier: values.supplier,
        received_at: values.received_at,
        expiry_date: values.expiry_date,
      });
      router.push("/medicine-batches");
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
    <main className="flex flex-1 justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm"
      >
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold">New stock batch</h2>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="medicine" className="text-xs font-semibold text-ink-muted">
              Medicine *
            </label>
            <select
              id="medicine"
              required
              value={values.medicine}
              onChange={(e) => setValues({ ...values, medicine: e.target.value })}
              className={inputClass}
            >
              <option value="" disabled>
                Select a medicine
              </option>
              {medicines.map((m) => (
                <option key={m.id} value={m.id}>
                  {m.name}
                </option>
              ))}
            </select>
            {errors("medicine")}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="batch_number" className="text-xs font-semibold text-ink-muted">
                Batch number *
              </label>
              <input
                id="batch_number"
                required
                value={values.batch_number}
                onChange={(e) => setValues({ ...values, batch_number: e.target.value })}
                className={`${inputClass} font-mono`}
              />
              {errors("batch_number")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="quantity" className="text-xs font-semibold text-ink-muted">
                Quantity *
              </label>
              <input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                required
                value={values.quantity}
                onChange={(e) => setValues({ ...values, quantity: e.target.value })}
                className={inputClass}
              />
              {errors("quantity")}
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="flex flex-col gap-1">
              <label htmlFor="purchase_price" className="text-xs font-semibold text-ink-muted">
                Purchase price
              </label>
              <input
                id="purchase_price"
                type="number"
                step="0.01"
                min="0"
                value={values.purchase_price}
                onChange={(e) => setValues({ ...values, purchase_price: e.target.value })}
                className={inputClass}
              />
              {errors("purchase_price")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="sale_price" className="text-xs font-semibold text-ink-muted">
                Sale price
              </label>
              <input
                id="sale_price"
                type="number"
                step="0.01"
                min="0"
                value={values.sale_price}
                onChange={(e) => setValues({ ...values, sale_price: e.target.value })}
                className={inputClass}
              />
              {errors("sale_price")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="tax_rate" className="text-xs font-semibold text-ink-muted">
                Tax rate (%)
              </label>
              <input
                id="tax_rate"
                type="number"
                step="0.01"
                min="0"
                value={values.tax_rate}
                onChange={(e) => setValues({ ...values, tax_rate: e.target.value })}
                className={inputClass}
              />
              {errors("tax_rate")}
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="supplier" className="text-xs font-semibold text-ink-muted">
              Supplier
            </label>
            <input
              id="supplier"
              value={values.supplier}
              onChange={(e) => setValues({ ...values, supplier: e.target.value })}
              className={inputClass}
            />
            {errors("supplier")}
          </div>

          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="received_at" className="text-xs font-semibold text-ink-muted">
                Received *
              </label>
              <input
                id="received_at"
                type="date"
                required
                value={values.received_at}
                onChange={(e) => setValues({ ...values, received_at: e.target.value })}
                className={inputClass}
              />
              {errors("received_at")}
            </div>

            <div className="flex flex-col gap-1">
              <label htmlFor="expiry_date" className="text-xs font-semibold text-ink-muted">
                Expires *
              </label>
              <input
                id="expiry_date"
                type="date"
                required
                value={values.expiry_date}
                onChange={(e) => setValues({ ...values, expiry_date: e.target.value })}
                className={inputClass}
              />
              {errors("expiry_date")}
            </div>
          </div>

          {fieldErrors.detail && <p className="text-sm text-danger">{fieldErrors.detail.join(" ")}</p>}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50"
          >
            {isSubmitting ? "Saving…" : "Create"}
          </button>
        </div>
      </form>
    </main>
  );
}
