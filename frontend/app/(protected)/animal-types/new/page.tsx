"use client";

import { useRouter } from "next/navigation";
import { createAnimalType } from "@/lib/animals";
import AnimalTypeForm from "../AnimalTypeForm";

export default function NewAnimalTypePage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 justify-center p-6">
      <AnimalTypeForm
        title="New animal type"
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
