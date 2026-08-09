"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Medicine, getMedicine, updateMedicine } from "@/lib/medicines";
import MedicineForm from "../MedicineForm";

export default function EditMedicinePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [medicine, setMedicine] = useState<Medicine | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getMedicine(Number(id))
      .then(setMedicine)
      .catch(() => setError("Could not load this medicine."));
  }, [id]);

  return (
    <main className="flex flex-1 justify-center p-6">
      {error && <p className="text-sm text-danger">{error}</p>}
      {medicine && (
        <MedicineForm
          title="Edit medicine"
          initialValues={{
            name: medicine.name,
            manufacturer: medicine.manufacturer,
            active_substance: medicine.active_substance,
            form: medicine.form,
            strength: medicine.strength,
            unit: medicine.unit,
            description: medicine.description ?? "",
            withdrawal_period_days: medicine.withdrawal_period_days?.toString() ?? "",
            minimum_stock_level: medicine.minimum_stock_level ?? "",
            requires_prescription: medicine.requires_prescription,
            is_controlled_substance: medicine.is_controlled_substance,
          }}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateMedicine(Number(id), values);
            router.push("/medicines");
          }}
        />
      )}
    </main>
  );
}
