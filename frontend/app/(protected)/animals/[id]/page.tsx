"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type Animal, getAnimal, updateAnimal } from "@/lib/animals";
import AnimalForm from "../AnimalForm";

export default function EditAnimalPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [animal, setAnimal] = useState<Animal | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnimal(Number(id))
      .then(setAnimal)
      .catch(() => setError("Could not load this animal."));
  }, [id]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">Edit animal</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {animal && (
        <AnimalForm
          initialValues={{
            name: animal.name,
            animal_type: String(animal.animal_type),
            description: animal.description ?? "",
          }}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateAnimal(Number(id), values);
            router.push("/animals");
          }}
        />
      )}
    </main>
  );
}
