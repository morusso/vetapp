"use client";

import Link from "next/link";
import { type Visit, deleteVisit, listVisits } from "@/lib/visits";
import { PlusIcon } from "@/components/icons";
import { stripHtml } from "@/components/RichTextViewer";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DeleteAction, EditAction, ViewAction } from "@/components/RowActions";

const columns: DataTableColumn<Visit>[] = [
  {
    header: "Patient",
    className: "font-medium",
    cell: (visit) => visit.patient_name,
  },
  {
    header: "Veterinarian",
    className: "text-ink-muted",
    cell: (visit) => visit.veterinarian_name,
  },
  {
    header: "Date",
    className: "text-ink-muted",
    cell: (visit) => new Date(visit.visit_date).toLocaleString(),
  },
  {
    header: "Diagnosis",
    className: "text-ink-muted",
    cell: (visit) =>
      visit.diagnosis && stripHtml(visit.diagnosis) ? (
        <span className="line-clamp-1">{stripHtml(visit.diagnosis)}</span>
      ) : (
        <span className="text-ink-faint">—</span>
      ),
  },
];

export default function VisitsPage() {
  const { page, error, load, handleDelete } = usePaginatedResource(listVisits, {
    loadErrorMessage: "Could not load visits.",
    remove: {
      fn: deleteVisit,
      confirmMessage: "Delete this visit?",
      errorMessage: "Could not delete this visit.",
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Visits</h1>
          <p className="text-xs text-ink-faint">
            Clinical visit history
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/visits/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New visit
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <DataTable
        page={page}
        columns={columns}
        keyField={(visit) => visit.id}
        emptyMessage="No visits yet."
        onPageChange={load}
        actions={(visit) => (
          <>
            <ViewAction href={`/visits/${visit.id}`} />
            <EditAction href={`/visits/${visit.id}/edit`} />
            <DeleteAction onClick={() => handleDelete(visit.id)} />
          </>
        )}
      />
    </main>
  );
}
