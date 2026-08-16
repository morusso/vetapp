"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import { listAllMedicines, type Medicine } from "@/lib/medicines";
import {
  createPrescribedMedicine,
  deletePrescribedMedicine,
  listAllPrescribedMedicines,
  type PrescribedMedicine,
} from "@/lib/visits";
import { TrashIcon } from "@/components/icons";
import SearchableSelect from "@/components/SearchableSelect";

export default function PrescribedMedicines({ visitId }: { visitId: number }) {
  const [prescriptions, setPrescriptions] = useState<PrescribedMedicine[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicine, setMedicine] = useState("");
  const [quantity, setQuantity] = useState("");
  const [dosage, setDosage] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    try {
      setPrescriptions(await listAllPrescribedMedicines(visitId));
    } catch {
      setError("Could not load prescribed medicines.");
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setPrescriptions(await listAllPrescribedMedicines(visitId));
      } catch {
        setError("Could not load prescribed medicines.");
      }
    }
    init();
    listAllMedicines()
      .then(setMedicines)
      .catch(() => setError("Could not load medicines."));
  }, [visitId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createPrescribedMedicine({
        visit: visitId,
        medicine: Number(medicine),
        quantity,
        dosage,
      });
      setMedicine("");
      setQuantity("");
      setDosage("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this prescription.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Remove this medicine from the visit?")) return;
    try {
      await deletePrescribedMedicine(id);
      load();
    } catch {
      setError("Could not remove this prescription.");
    }
  }

  const inputClass =
    "rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold">Prescribed medicines</h2>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        {error && <p className="text-sm text-danger">{error}</p>}

        <ul className="flex flex-col gap-1.5">
          {prescriptions.map((p) => (
            <li
              key={p.id}
              className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm"
            >
              <span>
                <span className="font-medium">{p.medicine_name}</span>{" "}
                <span className="font-mono text-ink-muted">× {p.quantity}</span>
                {p.dosage && <span className="text-ink-faint"> — {p.dosage}</span>}
              </span>
              <button
                type="button"
                onClick={() => handleDelete(p.id)}
                title="Remove"
                className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-danger-soft hover:text-danger"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
          {prescriptions.length === 0 && (
            <p className="py-2 text-sm text-ink-faint">No medicines prescribed yet.</p>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="flex flex-col gap-2 border-t border-line pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="medicine" className="text-xs font-semibold text-ink-muted">
              Medicine
            </label>
            <SearchableSelect
              id="medicine"
              required
              value={medicine}
              onChange={setMedicine}
              placeholder="Select a medicine"
              className={inputClass}
              options={medicines.map((m) => ({ value: String(m.id), label: m.name }))}
            />
          </div>

          <div className="flex items-end gap-2">
            <div className="flex flex-col gap-1">
              <label htmlFor="quantity" className="text-xs font-semibold text-ink-muted">
                Quantity
              </label>
              <input
                id="quantity"
                type="number"
                step="0.01"
                min="0"
                required
                value={quantity}
                onChange={(e) => setQuantity(e.target.value)}
                className={`${inputClass} w-24`}
              />
            </div>
            <div className="flex flex-1 flex-col gap-1">
              <label htmlFor="dosage" className="text-xs font-semibold text-ink-muted">
                Dosage
              </label>
              <input
                id="dosage"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="e.g. 1 tablet twice a day"
                className={inputClass}
              />
            </div>
            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50"
            >
              Add
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
