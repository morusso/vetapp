"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams } from "next/navigation";
import { type Visit, getVisit } from "@/lib/visits";
import { EditIcon } from "@/components/icons";
import VisitNotes from "../VisitNotes";
import PrescribedMedicines from "../PrescribedMedicines";

export default function VisitDetailPage() {
  const { id } = useParams<{ id: string }>();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVisit(Number(id))
      .then(setVisit)
      .catch(() => setError("Could not load this visit."));
  }, [id]);

  if (error) {
    return (
      <main className="flex flex-1 flex-col p-6">
        <p className="text-sm text-danger">{error}</p>
      </main>
    );
  }

  if (!visit) {
    return <main className="flex flex-1 flex-col p-6" />;
  }

  return (
    <main className="flex flex-1 flex-col items-center gap-6 p-6">
      <div className="w-full max-w-xl rounded-lg border border-line bg-surface shadow-sm">
        <div className="flex items-center justify-between border-b border-line px-6 py-4">
          <div>
            <h2 className="text-base font-semibold">{visit.patient_name}</h2>
            <p className="text-xs text-ink-faint">Visit details</p>
          </div>
          <Link
            href={`/visits/${visit.id}/edit`}
            className="flex items-center gap-1.5 rounded-md border border-line-strong px-3 py-1.5 text-xs font-semibold text-ink-muted hover:bg-surface-2"
          >
            <EditIcon className="size-3.5" />
            Edit
          </Link>
        </div>

        <div className="flex flex-col gap-5 px-6 py-5">
          <fieldset className="flex flex-col gap-2">
            <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
              Overview
            </legend>
            <div className="grid grid-cols-1 gap-2 text-sm sm:grid-cols-2">
              <div>
                <div className="text-xs text-ink-faint">Patient</div>
                <div>{visit.patient_name}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Veterinarian</div>
                <div>{visit.veterinarian_name}</div>
              </div>
              <div>
                <div className="text-xs text-ink-faint">Date &amp; time</div>
                <div>{new Date(visit.visit_date).toLocaleString()}</div>
              </div>
            </div>
          </fieldset>

          {visit.diagnosis && (
            <fieldset className="flex flex-col gap-2">
              <legend className="mb-0.5 text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Diagnosis
              </legend>
              <p className="text-sm whitespace-pre-wrap text-ink-muted">{visit.diagnosis}</p>
            </fieldset>
          )}
        </div>
      </div>

      <VisitNotes visitId={visit.id} />
      <PrescribedMedicines visitId={visit.id} />
    </main>
  );
}
