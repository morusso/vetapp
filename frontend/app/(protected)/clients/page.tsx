"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Paginated } from "@/lib/api";
import { type Client, deleteClient, listClients } from "@/lib/clients";

export default function ClientsPage() {
  const [page, setPage] = useState<Paginated<Client> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(url?: string) {
    setError(null);
    try {
      setPage(await listClients(url));
    } catch {
      setError("Could not load clients.");
    }
  }

  useEffect(() => {
    async function init() {
      setError(null);
      try {
        setPage(await listClients());
      } catch {
        setError("Could not load clients.");
      }
    }
    init();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this client?")) return;
    try {
      await deleteClient(id);
      load();
    } catch {
      setError("Could not delete this client. They may still have patients.");
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-6 p-8">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold">Clients</h1>
        <Link
          href="/clients/new"
          className="rounded bg-zinc-900 px-4 py-2 text-sm font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
        >
          New client
        </Link>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}

      <ul className="flex flex-col gap-2">
        {page?.results.map((c) => (
          <li
            key={c.id}
            className="flex items-center justify-between rounded border border-zinc-300 px-4 py-2 dark:border-zinc-700"
          >
            <div>
              <p className="font-medium">
                {c.first_name} {c.last_name}
              </p>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {c.email} · {c.phone_number}
              </p>
            </div>
            <div className="flex items-center gap-4">
              <Link href={`/clients/${c.id}`} className="text-sm font-medium underline">
                Edit
              </Link>
              <button
                type="button"
                onClick={() => handleDelete(c.id)}
                className="text-sm font-medium text-red-600 underline"
              >
                Delete
              </button>
            </div>
          </li>
        ))}
        {page && page.results.length === 0 && (
          <p className="text-sm text-zinc-600 dark:text-zinc-400">No clients yet.</p>
        )}
      </ul>

      {page && (page.previous || page.next) && (
        <div className="flex justify-center gap-4">
          <button
            type="button"
            disabled={!page.previous}
            onClick={() => load(page.previous!)}
            className="text-sm font-medium underline disabled:opacity-50"
          >
            Previous
          </button>
          <button
            type="button"
            disabled={!page.next}
            onClick={() => load(page.next!)}
            className="text-sm font-medium underline disabled:opacity-50"
          >
            Next
          </button>
        </div>
      )}
    </main>
  );
}
