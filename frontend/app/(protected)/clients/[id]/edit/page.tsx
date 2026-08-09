"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Client, getClient, updateClient } from "@/lib/clients";
import ClientForm from "../../ClientForm";

export default function EditClientPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [client, setClient] = useState<Client | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getClient(Number(id))
      .then(setClient)
      .catch(() => setError("Could not load this client."));
  }, [id]);

  return (
    <main className="flex flex-1 justify-center p-6">
      {error && <p className="text-sm text-danger">{error}</p>}
      {client && (
        <ClientForm
          title="Edit client"
          initialValues={{
            first_name: client.first_name,
            last_name: client.last_name,
            email: client.email,
            phone_number: client.phone_number,
            street: client.street,
            city: client.city,
            postal_code: client.postal_code,
            notes: client.notes ?? "",
          }}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateClient(Number(id), values);
            router.push(`/clients/${id}`);
          }}
        />
      )}
    </main>
  );
}
