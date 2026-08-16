"use client";

import Link from "next/link";
import { type Client, deleteClient, listClients } from "@/lib/clients";
import { PlusIcon } from "@/components/icons";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";
import { DeleteAction, EditAction, ViewAction } from "@/components/RowActions";

function initials(client: Client) {
  return `${client.first_name.charAt(0)}${client.last_name.charAt(0)}`.toUpperCase();
}

const columns: DataTableColumn<Client>[] = [
  {
    header: "Name",
    cell: (client) => (
      <div className="flex items-center gap-2.5">
        <span className="flex size-7 flex-none items-center justify-center rounded-full bg-accent-soft text-[11px] font-semibold text-accent-soft-ink">
          {initials(client)}
        </span>
        <span className="font-medium">
          {client.first_name} {client.last_name}
        </span>
      </div>
    ),
  },
  {
    header: "Contact",
    cell: (client) => (
      <>
        <div className="text-ink-muted">{client.email}</div>
        <div className="font-mono text-xs text-ink-faint">{client.phone_number}</div>
      </>
    ),
  },
  {
    header: "Address",
    cell: (client) => (
      <>
        <div className="text-ink-muted">{client.street}</div>
        <div className="text-xs text-ink-faint">
          {client.city}, {client.postal_code}
        </div>
      </>
    ),
  },
];

export default function ClientsPage() {
  const { page, error, load, handleDelete } = usePaginatedResource(listClients, {
    loadErrorMessage: "Could not load clients.",
    remove: {
      fn: deleteClient,
      confirmMessage: "Delete this client?",
      errorMessage: "Could not delete this client. They may still have patients.",
    },
  });

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Clients</h1>
          <p className="text-xs text-ink-faint">
            Registered pet owners
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/clients/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New client
        </Link>
      </div>

      {error && <p className="text-sm text-danger">{error}</p>}

      <DataTable
        page={page}
        columns={columns}
        keyField={(client) => client.id}
        emptyMessage="No clients yet."
        onPageChange={load}
        actions={(client) => (
          <>
            <ViewAction href={`/clients/${client.id}`} />
            <EditAction href={`/clients/${client.id}/edit`} />
            <DeleteAction onClick={() => handleDelete(client.id)} />
          </>
        )}
      />
    </main>
  );
}
