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
    <main className="flex flex-1 justify-center p-6">
      {error && <p className="text-sm text-danger">{error}</p>}
      {animalType && (
        <AnimalTypeForm
          title="Edit animal type"
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
