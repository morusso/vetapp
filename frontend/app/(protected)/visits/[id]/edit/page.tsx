"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Visit, getVisit, updateVisit } from "@/lib/visits";
import VisitForm, { toDatetimeLocal } from "../../VisitForm";

export default function EditVisitPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [visit, setVisit] = useState<Visit | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getVisit(Number(id))
      .then(setVisit)
      .catch(() => setError("Could not load this visit."));
  }, [id]);

  return (
    <main className="flex flex-1 justify-center p-6">
      {error && <p className="text-sm text-danger">{error}</p>}
      {visit && (
        <VisitForm
          title="Edit visit"
          initialValues={{
            patient: String(visit.patient),
            veterinarian: String(visit.veterinarian),
            visit_date: toDatetimeLocal(visit.visit_date),
            diagnosis: visit.diagnosis,
          }}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateVisit(Number(id), values);
            router.push(`/visits/${id}`);
          }}
        />
      )}
    </main>
  );
}
