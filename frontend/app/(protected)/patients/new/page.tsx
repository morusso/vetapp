"use client";

import { useRouter } from "next/navigation";
import { createPatient } from "@/lib/patients";
import PatientForm from "../PatientForm";

export default function NewPatientPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">New patient</h1>
      <PatientForm
        initialValues={{
          name: "",
          owner: "",
          breed: "",
          sex: "unknown",
          birth_date: "",
          color: "",
          microchip_number: "",
          note: "",
          is_sterilized: false,
          is_deceased: false,
          date_of_death: "",
        }}
        submitLabel="Create"
        onSubmit={async (values) => {
          await createPatient(values);
          router.push("/patients");
        }}
      />
    </main>
  );
}
