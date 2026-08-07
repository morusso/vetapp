"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Patient, getPatient, updatePatient } from "@/lib/patients";
import PatientForm from "../PatientForm";
import WeightHistory from "../WeightHistory";

export default function EditPatientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getPatient(Number(id))
      .then(setPatient)
      .catch(() => setError("Could not load this patient."));
  }, [id]);

  return (
    <main className="flex flex-1 flex-col items-center gap-10 p-8">
      <div className="flex flex-col items-center gap-6">
        <h1 className="text-2xl font-semibold">Edit patient</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        {patient && (
          <PatientForm
            initialValues={{
              name: patient.name,
              owner: String(patient.owner),
              breed: String(patient.breed),
              sex: patient.sex,
              birth_date: patient.birth_date ?? "",
              color: patient.color,
              microchip_number: patient.microchip_number ?? "",
              note: patient.note ?? "",
              is_sterilized: patient.is_sterilized,
              is_deceased: patient.is_deceased,
              date_of_death: patient.date_of_death ?? "",
            }}
            submitLabel="Save"
            onSubmit={async (values) => {
              await updatePatient(Number(id), values);
              router.push("/patients");
            }}
          />
        )}
      </div>

      {patient && <WeightHistory patientId={patient.id} />}
    </main>
  );
}
