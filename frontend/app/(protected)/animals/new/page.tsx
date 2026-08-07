"use client";

import { useRouter } from "next/navigation";
import { createAnimal } from "@/lib/animals";
import AnimalForm from "../AnimalForm";

export default function NewAnimalPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">New animal</h1>
      <AnimalForm
        initialValues={{ name: "", animal_type: "", description: "" }}
        submitLabel="Create"
        onSubmit={async (values) => {
          await createAnimal(values);
          router.push("/animals");
        }}
      />
    </main>
  );
}
