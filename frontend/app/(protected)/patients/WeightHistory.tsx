"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import {
  createPatientWeight,
  deletePatientWeight,
  listAllPatientWeights,
  type PatientWeight,
} from "@/lib/patients";
import { TrashIcon } from "@/components/icons";

export default function WeightHistory({ patientId }: { patientId: number }) {
  const [weights, setWeights] = useState<PatientWeight[]>([]);
  const [weightKg, setWeightKg] = useState("");
  const [recordedAt, setRecordedAt] = useState(() => new Date().toISOString().slice(0, 10));
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function load() {
    try {
      setWeights(await listAllPatientWeights(patientId));
    } catch {
      setError("Could not load weight history.");
    }
  }

  useEffect(() => {
    async function init() {
      try {
        setWeights(await listAllPatientWeights(patientId));
      } catch {
        setError("Could not load weight history.");
      }
    }
    init();
  }, [patientId]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);
    try {
      await createPatientWeight({ patient: patientId, weight_kg: weightKg, recorded_at: recordedAt });
      setWeightKg("");
      load();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Could not save this weight entry.");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleDelete(id: number) {
    if (!confirm("Delete this weight entry?")) return;
    try {
      await deletePatientWeight(id);
      load();
    } catch {
      setError("Could not delete this weight entry.");
    }
  }

  const inputClass =
    "rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
      <div className="border-b border-line px-6 py-4">
        <h2 className="text-base font-semibold">Weight history</h2>
      </div>

      <div className="flex flex-col gap-4 px-6 py-5">
        {error && <p className="text-sm text-danger">{error}</p>}

        <ul className="flex flex-col gap-1.5">
          {weights.map((w) => (
            <li
              key={w.id}
              className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm"
            >
              <span className="font-mono">
                {w.weight_kg} kg <span className="text-ink-faint">({w.recorded_at})</span>
              </span>
              <button
                type="button"
                onClick={() => handleDelete(w.id)}
                title="Delete"
                className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-danger-soft hover:text-danger"
              >
                <TrashIcon />
              </button>
            </li>
          ))}
          {weights.length === 0 && (
            <p className="py-2 text-sm text-ink-faint">No weight entries yet.</p>
          )}
        </ul>

        <form onSubmit={handleSubmit} className="flex items-end gap-2 border-t border-line pt-4">
          <div className="flex flex-col gap-1">
            <label htmlFor="weight_kg" className="text-xs font-semibold text-ink-muted">
              Weight (kg)
            </label>
            <input
              id="weight_kg"
              type="number"
              step="0.01"
              min="0"
              required
              value={weightKg}
              onChange={(e) => setWeightKg(e.target.value)}
              className={`${inputClass} w-24`}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor="recorded_at" className="text-xs font-semibold text-ink-muted">
              Date
            </label>
            <input
              id="recorded_at"
              type="date"
              required
              value={recordedAt}
              onChange={(e) => setRecordedAt(e.target.value)}
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
        </form>
      </div>
    </div>
  );
}
