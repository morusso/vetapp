"use client";

import Link from "next/link";
import { type Service, deleteService, listServices } from "@/lib/services";
import { PlusIcon } from "@/components/icons";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DeleteAction, EditAction } from "@/components/RowActions";

const columns: DataTableColumn<Service>[] = [
  {
    header: "Name",
    cell: (service) => (
      <div className="flex items-center gap-2">
        <span className="font-medium">{service.name}</span>
        {!service.is_active && (
          <span className="rounded-full bg-surface-3 px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-ink-faint uppercase">
            Inactive
          </span>
        )}
      </div>
    ),
  },
  {
    header: "Price",
    className: "text-ink-muted",
    cell: (service) => service.price,
  },
  {
    header: "Duration",
    className: "text-ink-muted",
    cell: (service) =>
      service.duration_minutes ? `${service.duration_minutes} min` : <span className="text-ink-faint">—</span>,
  },
];

export default function ServicesPage() {
  const { page, error, load, handleDelete } = usePaginatedResource(listServices, {
    loadErrorMessage: "Could not load services.",
    remove: {
      fn: deleteService,
      confirmMessage: "Delete this service?",
      errorMessage: "Could not delete this service. It may still be used on visits.",
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Services</h1>
          <p className="text-xs text-ink-faint">
            Billable services offered at the clinic
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/services/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New service
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <DataTable
        page={page}
        columns={columns}
        keyField={(service) => service.id}
        emptyMessage="No services yet."
        onPageChange={load}
        actions={(service) => (
          <>
            <EditAction href={`/services/${service.id}`} />
            <DeleteAction onClick={() => handleDelete(service.id)} />
          </>
        )}
      />
    </main>
  );
}
