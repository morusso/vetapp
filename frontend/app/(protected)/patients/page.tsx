"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Paginated } from "@/lib/api";
import { type Patient, deletePatient, listPatients } from "@/lib/patients";

export default function PatientsPage() {
  const [page, setPage] = useState<Paginated<Patient> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(url?: string) {
    setError(null);
    try {
      setPage(await listPatients(url));
    } catch {
      setError("Could not load patients.");
    }
  }

  useEffect(() => {
    async function init() {
      setError(null);
      try {
        setPage(await listPatients());
      } catch {
        setError("Could not load patients.");
      }
    }
    init();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this patient?")) return;
    try {
      await deletePatient(id);
      load();
    } catch {
      setError("Could not delete this patient.");
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Patients</h1>
        <Link
          href="/patients/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New patient
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2">
        {page?.results.map((patient) => (
          <li
            key={patient.id}
            className="flex items-center justify-between rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
          >
            <div>
              <p className="font-medium">
                {patient.name}
                {patient.is_deceased && (
                  <span className="ml-2 text-xs font-normal text-zinc-500">Deceased</span>
                )}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {patient.breed_name} · Owner: {patient.owner_name}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/patients/${patient.id}`} className="text-sm font-medium underline">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(patient.id)}
                className="text-sm font-medium text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {page && page.results.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No patients yet.</p>
        )}
      </ul>

      {page && (page.previous || page.next) && (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            disabled={!page.previous}
            onClick={() => load(page.previous!)}
            className="text-sm font-medium underline disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!page.next}
            onClick={() => load(page.next!)}
            className="text-sm font-medium underline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
