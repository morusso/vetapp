"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Service, getService, updateService } from "@/lib/services";
import ServiceForm from "../ServiceForm";

export default function EditServicePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [service, setService] = useState<Service | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getService(Number(id))
      .then(setService)
      .catch(() => setError("Could not load this service."));
  }, [id]);

  return (
    <main className="flex flex-1 justify-center p-6">
      {error && <p className="text-sm text-danger">{error}</p>}
      {service && (
        <ServiceForm
          title="Edit service"
          initialValues={{
            name: service.name,
            description: service.description,
            price: service.price,
            tax_rate: service.tax_rate ?? "",
            duration_minutes: service.duration_minutes?.toString() ?? "",
            is_active: service.is_active,
          }}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateService(Number(id), values);
            router.push("/services");
          }}
        />
      )}
    </main>
  );
}
