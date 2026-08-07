"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { type AnimalType, getAnimalType, updateAnimalType } from "@/lib/animals";
import AnimalTypeForm from "../AnimalTypeForm";

export default function EditAnimalTypePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [animalType, setAnimalType] = useState<AnimalType | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    getAnimalType(Number(id))
      .then(setAnimalType)
      .catch(() => setError("Could not load this animal type."));
  }, [id]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">Edit animal type</h1>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {animalType && (
        <AnimalTypeForm
          initialValues={{
            name: animalType.name,
            description: animalType.description ?? "",
          }}
          submitLabel="Save"
          onSubmit={async (values) => {
            await updateAnimalType(Number(id), values);
            router.push("/animal-types");
          }}
        />
      )}
    </main>
  );
}
