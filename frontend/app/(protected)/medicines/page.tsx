"use client";

import Link from "next/link";
import { type Medicine, deleteMedicine, listMedicines } from "@/lib/medicines";
import { PlusIcon } from "@/components/icons";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DeleteAction, EditAction } from "@/components/RowActions";

const columns: DataTableColumn<Medicine>[] = [
  {
    header: "Name",
    cell: (medicine) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{medicine.name}</span>
        {medicine.requires_prescription && (
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-ink-faint uppercase">
            Rx
          </span>
        )}
        {medicine.is_controlled_substance && (
          <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-danger uppercase">
            Controlled
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Manufacturer",
    className: "text-ink-muted",
    cell: (medicine) => medicine.manufacturer || <span className="text-ink-faint">—</span>,
  },
  {
    header: "Form",
    className: "text-ink-muted capitalize",
    cell: (medicine) => medicine.form,
  },
];

export default function MedicinesPage() {
  const { page, error, load, handleDelete } = usePaginatedResource(listMedicines, {
    loadErrorMessage: "Could not load medicines.",
    remove: {
      fn: deleteMedicine,
      confirmMessage: "Delete this medicine?",
      errorMessage: "Could not delete this medicine. It may still have stock batches.",
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Medicines</h1>
          <p className="text-xs text-ink-faint">
            Medicine knowledge base and stock levels
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/medicines/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New medicine
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <DataTable
        page={page}
        columns={columns}
        keyField={(medicine) => medicine.id}
        emptyMessage="No medicines yet."
        onPageChange={load}
        actions={(medicine) => (
          <>
            <EditAction href={`/medicines/${medicine.id}`} />
            <DeleteAction onClick={() => handleDelete(medicine.id)} />
          </>
        )}
      />
    </main>
  );
}
