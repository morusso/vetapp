"use client";

import Link from "next/link";
import { type Patient, deletePatient, listPatients } from "@/lib/patients";
import { PlusIcon } from "@/components/icons";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DeleteAction, EditAction, ViewAction } from "@/components/RowActions";

const columns: DataTableColumn<Patient>[] = [
  {
    header: "Name",
    cell: (patient) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{patient.name}</span>
        {patient.is_deceased && (
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-ink-faint uppercase">
            Deceased
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Breed",
    className: "text-ink-muted",
    cell: (patient) => patient.breed_name,
  },
  {
    header: "Owner",
    className: "text-ink-muted",
    cell: (patient) => patient.owner_name,
  },
];

export default function PatientsPage() {
  const { page, error, load, handleDelete } = usePaginatedResource(listPatients, {
    loadErrorMessage: "Could not load patients.",
    remove: {
      fn: deletePatient,
      confirmMessage: "Delete this patient?",
      errorMessage: "Could not delete this patient.",
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Patients</h1>
          <p className="text-xs text-ink-faint">
            Animals under care
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/patients/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New patient
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <DataTable
        page={page}
        columns={columns}
        keyField={(patient) => patient.id}
        emptyMessage="No patients yet."
        onPageChange={load}
        actions={(patient) => (
          <>
            <ViewAction href={`/patients/${patient.id}/full`} />
            <EditAction href={`/patients/${patient.id}`} />
            <DeleteAction onClick={() => handleDelete(patient.id)} />
          </>
        )}
      />
    </main>
  );
}
