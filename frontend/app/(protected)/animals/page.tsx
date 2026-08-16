"use client";

import Link from "next/link";
import { type Animal, deleteAnimal, listAnimals } from "@/lib/animals";
import { PlusIcon } from "@/components/icons";
import { dotColor } from "@/lib/colors";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DeleteAction, EditAction } from "@/components/RowActions";

const columns: DataTableColumn<Animal>[] = [
  {
    header: "Name",
    cell: (animal) => (
      <div className="flex items-center gap-2.5">
        <span className="size-2 flex-none rounded-full" style={{ backgroundColor: dotColor(animal.animal_type) }} />
        <span className="font-medium">{animal.name}</span>
      </div>
    ),
  },
  {
    header: "Type",
    className: "text-ink-muted",
    cell: (animal) => animal.animal_type_name,
  },
];

export default function AnimalsPage() {
  const { page, error, load, handleDelete } = usePaginatedResource(listAnimals, {
    loadErrorMessage: "Could not load animals.",
    remove: {
      fn: deleteAnimal,
      confirmMessage: "Delete this animal?",
      errorMessage: "Could not delete this animal.",
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Animals</h1>
          <p className="text-xs text-ink-faint">
            Breeds available for patient records
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/animals/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New animal
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <DataTable
        page={page}
        columns={columns}
        keyField={(animal) => animal.id}
        emptyMessage="No animals yet."
        onPageChange={load}
        actions={(animal) => (
          <>
            <EditAction href={`/animals/${animal.id}`} />
            <DeleteAction onClick={() => handleDelete(animal.id)} />
          </>
        )}
      />
    </main>
  );
}
