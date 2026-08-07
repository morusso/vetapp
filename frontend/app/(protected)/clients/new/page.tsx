"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/lib/clients";
import ClientForm from "../ClientForm";

export default function NewClientPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">New client</h1>
      <ClientForm
        initialValues={{
          first_name: "",
          last_name: "",
          email: "",
          phone_number: "",
          street: "",
          city: "",
          postal_code: "",
          notes: "",
        }}
        submitLabel="Create"
        onSubmit={async (values) => {
          await createClient(values);
          router.push("/clients");
        }}
      />
    </main>
  );
}
