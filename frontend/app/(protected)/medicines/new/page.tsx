"use client";

import { useRouter } from "next/navigation";
import { createMedicine } from "@/lib/medicines";
import MedicineForm from "../MedicineForm";

export default function NewMedicinePage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 justify-center p-6">
      <MedicineForm
        title="New medicine"
        initialValues={{
          name: "",
          manufacturer: "",
          active_substance: "",
          form: "other",
          strength: "",
          unit: "",
          description: "",
          withdrawal_period_days: "",
          minimum_stock_level: "",
          requires_prescription: false,
          is_controlled_substance: false,
        }}
        submitLabel="Create"
        onSubmit={async (values) => {
          await createMedicine(values);
          router.push("/medicines");
        }}
      />
    </main>
  );
}
