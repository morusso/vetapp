"use client";

import { useEffect, useState, type FormEvent } from "react";
import { ApiError } from "@/lib/api";
import {
  createPatientWeight,
  deletePatientWeight,
  listAllPatientWeights,
  type PatientWeight,
} from "@/lib/patients";

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

  return (
    <div className="flex w-full max-w-sm flex-col gap-4">
      <h2 className="text-lg font-semibold">Weight history</h2>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2">
        {weights.map((w) => (
          <li
            key={w.id}
            className="flex items-center justify-between rounded border border-zinc-300 px-3 py-2 text-sm dark:border-zinc-700"
          >
            <span>
              {w.weight_kg} kg <span className="text-zinc-500">({w.recorded_at})</span>
            </span>
            <button
              type="button"
              onClick={() => handleDelete(w.id)}
              className="font-medium text-red-600 underline"
            >
              Delete
            </button>
          </li>
        ))}
        {weights.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No weight entries yet.</p>
        )}
      </ul>

      <form onSubmit={handleSubmit} className="flex items-end gap-2">
        <div className="flex flex-col gap-1">
          <label htmlFor="weight_kg" className="text-sm font-medium">
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
            className="w-24 rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="recorded_at" className="text-sm font-medium">
            Date
          </label>
          <input
            id="recorded_at"
            type="date"
            required
            value={recordedAt}
            onChange={(e) => setRecordedAt(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          Add
        </button>
      </form>
    </div>
  );
}
