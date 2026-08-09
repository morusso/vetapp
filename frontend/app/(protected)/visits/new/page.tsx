"use client";

import { useRouter } from "next/navigation";
import { createVisit } from "@/lib/visits";
import VisitForm from "../VisitForm";

export default function NewVisitPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 justify-center p-6">
      <VisitForm
        title="New visit"
        initialValues={{
          patient: "",
          veterinarian: "",
          visit_date: "",
          diagnosis: "",
        }}
        submitLabel="Create"
        onSubmit={async (values) => {
          const visit = await createVisit(values);
          router.push(`/visits/${visit.id}`);
        }}
      />
    </main>
  );
}
