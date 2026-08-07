"use client";

import { useRouter } from "next/navigation";
import { createAnimalType } from "@/lib/animals";
import AnimalTypeForm from "../AnimalTypeForm";

export default function NewAnimalTypePage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">New animal type</h1>
      <AnimalTypeForm
        initialValues={{ name: "", description: "" }}
        submitLabel="Create"
        onSubmit={async (values) => {
          await createAnimalType(values);
          router.push("/animal-types");
        }}
      />
    </main>
  );
}
