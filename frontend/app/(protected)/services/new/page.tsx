"use client";

import { useRouter } from "next/navigation";
import { createService } from "@/lib/services";
import ServiceForm from "../ServiceForm";

export default function NewServicePage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 justify-center p-6">
      <ServiceForm
        title="New service"
        initialValues={{
          name: "",
          description: "",
          price: "",
          tax_rate: "",
          duration_minutes: "",
          is_active: true,
        }}
        submitLabel="Create"
        onSubmit={async (values) => {
          await createService(values);
          router.push("/services");
        }}
      />
    </main>
  );
}
