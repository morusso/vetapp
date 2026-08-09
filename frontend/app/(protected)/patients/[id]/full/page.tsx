"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type PatientWithWeights, getPatientFull } from "@/lib/patients";
import { EditIcon } from "@/components/icons";

const SEX_LABELS: Record<string, string> = {
  male: "Male",
  female: "Female",
  unknown: "Unknown",
};

export default function PatientFullPage() {
  const { id } = useParams<{ id: string }>();
  const [patient, setPatient] = useState<PatientWithWeights | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPatientFull(Number(id))
      .then(setPatient)
      .catch(() => setError("Could not load this patient."));
  }, [id]);

  if (error) {
    return (
      <main className="flex flex-1 flex-col p-6">
        <p className="text-sm text-danger">{error}</p>
      </main>
    );
  }

  if (!patient) {
    return <main className="flex flex-1 flex-col p-6" />;
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="flex items-center gap-2 text-base font-semibold">
              {patient.name}
              {patient.is_deceased && (
                <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-ink-faint uppercase">
                  Deceased
                </span>
              )}
            </h2>
            <p className="text-xs text-ink-faint">Patient details</p>
          </div>
          <Link
            href={`/patients/${patient.id}`}
            className="flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-2"
          >
            <EditIcon className="size-3.5" />
            Edit
          </Link>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Identification
            </legend>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs text-ink-faint">Breed</div>
                <div>{patient.breed_name}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Sex</div>
                <div>{SEX_LABELS[patient.sex] ?? patient.sex}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Birth date</div>
                <div>{patient.birth_date ?? "—"}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Color</div>
                <div>{patient.color || "—"}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Microchip number</div>
                <div className="font-mono">{patient.microchip_number ?? "—"}</div>
              </div>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Owner
            </legend>
            <div className="text-sm">
              <Link href={`/clients/${patient.owner}`} className="text-accent hover:underline">
                {patient.owner_name}
              </Link>
            </div>
          </fieldset>

          <fieldset className="flex flex-col gap-2">
            <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Health
            </legend>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs text-ink-faint">Sterilized</div>
                <div>{patient.is_sterilized ? "Yes" : "No"}</div>
              </div>
              {patient.is_deceased && (
                <div>
                  <div className="text-xs text-ink-faint">Date of death</div>
                  <div>{patient.date_of_death ?? "—"}</div>
                </div>
              )}
            </div>
          </fieldset>

          {patient.note && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Notes
              </legend>
              <p className="text-sm whitespace-pre-wrap text-ink-muted">{patient.note}</p>
            </fieldset>
          )}
        </div>
      </div>

      <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
        <div className="border-b border-line px-6 py-4">
          <h2 className="text-base font-semibold">Weight history</h2>
          <p className="text-xs text-ink-faint">
            {patient.weight_records.length} recorded
          </p>
        </div>

        {patient.weight_records.length === 0 ? (
          <p className="px-6 py-6 text-center text-sm text-ink-faint">
            No weight entries yet.
          </p>
        ) : (
          <ul className="flex flex-col gap-1.5 px-6 py-5">
            {patient.weight_records.map((w) => (
              <li
                key={w.id}
                className="flex items-center justify-between rounded-md border border-line px-3 py-2 text-sm"
              >
                <span className="font-mono">
                  {w.weight_kg} kg <span className="text-ink-faint">({w.recorded_at})</span>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
