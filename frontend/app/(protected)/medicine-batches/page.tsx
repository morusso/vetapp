"use client";

import Link from "next/link";
import { type MedicineBatch, deleteMedicineBatch, listMedicineBatches } from "@/lib/medicines";
import { PlusIcon } from "@/components/icons";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DeleteAction } from "@/components/RowActions";

function isExpired(batch: MedicineBatch) {
  return batch.expiry_date < new Date().toISOString().slice(0, 10);
}

const columns: DataTableColumn<MedicineBatch>[] = [
  {
    header: "Medicine",
    className: "font-medium",
    cell: (batch) => batch.medicine_name,
  },
  {
    header: "Batch #",
    className: "font-mono text-ink-muted",
    cell: (batch) => batch.batch_number,
  },
  {
    header: "Quantity",
    className: "text-ink-muted",
    cell: (batch) => batch.quantity,
  },
  {
    header: "Purchase price",
    className: "text-ink-muted",
    cell: (batch) => batch.purchase_price ?? <span className="text-ink-faint">—</span>,
  },
  {
    header: "Sale price",
    className: "text-ink-muted",
    cell: (batch) => batch.sale_price ?? <span className="text-ink-faint">—</span>,
  },
  {
    header: "Tax rate",
    className: "text-ink-muted",
    cell: (batch) => (batch.tax_rate != null ? `${batch.tax_rate}%` : <span className="text-ink-faint">—</span>),
  },
  {
    header: "Expiry",
    cell: (batch) => (
      <div className="flex items-center gap-2">
        <span className={isExpired(batch) ? "text-danger" : "text-ink-muted"}>{batch.expiry_date}</span>
        {isExpired(batch) && (
          <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-danger uppercase">
            Expired
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Received",
    className: "text-ink-muted",
    cell: (batch) => batch.received_at,
  },
  {
    header: "Supplier",
    className: "text-ink-muted",
    cell: (batch) => batch.supplier || <span className="text-ink-faint">—</span>,
  },
];

export default function MedicineBatchesPage() {
  const { page, error, load, handleDelete } = usePaginatedResource(listMedicineBatches, {
    loadErrorMessage: "Could not load stock batches.",
    remove: {
      fn: deleteMedicineBatch,
      confirmMessage: "Delete this stock batch?",
      errorMessage: "Could not delete this stock batch.",
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Stock batches</h1>
          <p className="text-xs text-ink-faint">
            Medicine inventory by batch
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/medicine-batches/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New batch
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <DataTable
        page={page}
        columns={columns}
        keyField={(batch) => batch.id}
        emptyMessage="No stock batches yet."
        onPageChange={load}
        actions={(batch) => <DeleteAction onClick={() => handleDelete(batch.id)} />}
      />
    </main>
  );
}
