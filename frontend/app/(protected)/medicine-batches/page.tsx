"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Paginated } from "@/lib/api";
import { type MedicineBatch, deleteMedicineBatch, listMedicineBatches } from "@/lib/medicines";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon, TrashIcon } from "@/components/icons";

function isExpired(batch: MedicineBatch) {
  return batch.expiry_date < new Date().toISOString().slice(0, 10);
}

export default function MedicineBatchesPage() {
  const [page, setPage] = useState<Paginated<MedicineBatch> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(url?: string) {
    setError(null);
    try {
      setPage(await listMedicineBatches(url));
    } catch {
      setError("Could not load stock batches.");
    }
  }

  useEffect(() => {
    async function init() {
      setError(null);
      try {
        setPage(await listMedicineBatches());
      } catch {
        setError("Could not load stock batches.");
      }
    }
    init();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this stock batch?")) return;
    try {
      await deleteMedicineBatch(id);
      load();
    } catch {
      setError("Could not delete this stock batch.");
    }
  }

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

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Medicine
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Batch #
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Quantity
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Expiry
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Received
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Supplier
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2" />
            </tr>
          </thead>
          <tbody>
            {page?.results.map((batch) => (
              <tr key={batch.id} className="group">
                <td className="border-b border-line px-3.5 py-2.5 font-medium group-hover:bg-surface-2">
                  {batch.medicine_name}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 font-mono text-ink-muted group-hover:bg-surface-2">
                  {batch.batch_number}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {batch.quantity}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                  <div className="flex items-center gap-2">
                    <span className={isExpired(batch) ? "text-danger" : "text-ink-muted"}>
                      {batch.expiry_date}
                    </span>
                    {isExpired(batch) && (
                      <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[10.5px] font-semibold tracking-wide text-danger uppercase">
                        Expired
                      </span>
                    )}
                  </div>
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {batch.received_at}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {batch.supplier || <span className="text-ink-faint">—</span>}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => handleDelete(batch.id)}
                      title="Delete"
                      className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-danger-soft hover:text-danger"
                    >
                      <TrashIcon />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {page && page.results.length === 0 && (
          <p className="px-3.5 py-6 text-center text-sm text-ink-faint">No stock batches yet.</p>
        )}
      </div>

      {page && (page.previous || page.next) && (
        <div className="flex items-center justify-between text-xs text-ink-faint">
          <span className="font-mono">{page.results.length} of {page.count} shown</span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={!page.previous}
              onClick={() => load(page.previous!)}
              className="flex size-7 items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-2 disabled:opacity-40"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              disabled={!page.next}
              onClick={() => load(page.next!)}
              className="flex size-7 items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-2 disabled:opacity-40"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
