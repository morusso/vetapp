"use client";

import { useRouter } from "next/navigation";
import { createAnimal } from "@/lib/animals";
import AnimalForm from "../AnimalForm";

export default function NewAnimalPage() {
  const router = useRouter();

  return (
    <main className="flex flex-1 justify-center p-6">
      <AnimalForm
        title="New animal"
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
