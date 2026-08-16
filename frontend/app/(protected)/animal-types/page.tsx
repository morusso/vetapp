"use client";

import Link from "next/link";
import { type AnimalType, deleteAnimalType, listAnimalTypes } from "@/lib/animals";
import { PlusIcon } from "@/components/icons";
import { dotColor } from "@/lib/colors";
import { stripHtml } from "@/components/RichTextViewer";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DeleteAction, EditAction } from "@/components/RowActions";

const columns: DataTableColumn<AnimalType>[] = [
  {
    header: "Name",
    cell: (animalType) => (
      <div className="flex items-center gap-2.5">
        <span className="size-2 flex-none rounded-full" style={{ backgroundColor: dotColor(animalType.id) }} />
        <span className="font-medium">{animalType.name}</span>
      </div>
    ),
  },
  {
    header: "Description",
    className: "text-ink-muted",
    cell: (animalType) =>
      (animalType.description && stripHtml(animalType.description)) || (
        <span className="text-ink-faint">—</span>
      ),
  },
];

export default function AnimalTypesPage() {
  const { page, error, load, handleDelete } = usePaginatedResource(listAnimalTypes, {
    loadErrorMessage: "Could not load animal types.",
    remove: {
      fn: deleteAnimalType,
      confirmMessage: "Delete this animal type?",
      errorMessage: "Could not delete this animal type. It may still be in use.",
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Animal types</h1>
          <p className="text-xs text-ink-faint">
            Species categories used across patient records
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/animal-types/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New animal type
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <DataTable
        page={page}
        columns={columns}
        keyField={(animalType) => animalType.id}
        emptyMessage="No animal types yet."
        onPageChange={load}
        actions={(animalType) => (
          <>
            <EditAction href={`/animal-types/${animalType.id}`} />
            <DeleteAction onClick={() => handleDelete(animalType.id)} />
          </>
        )}
      />
    </main>
  );
}
