"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Paginated } from "@/lib/api";
import { type Visit, deleteVisit, listVisits } from "@/lib/visits";
import { ChevronLeftIcon, ChevronRightIcon, EditIcon, EyeIcon, PlusIcon, TrashIcon } from "@/components/icons";

export default function VisitsPage() {
  const [page, setPage] = useState<Paginated<Visit> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(url?: string) {
    setError(null);
    try {
      setPage(await listVisits(url));
    } catch {
      setError("Could not load visits.");
    }
  }

  useEffect(() => {
    async function init() {
      setError(null);
      try {
        setPage(await listVisits());
      } catch {
        setError("Could not load visits.");
      }
    }
    init();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this visit?")) return;
    try {
      await deleteVisit(id);
      load();
    } catch {
      setError("Could not delete this visit.");
    }
  }

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

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Patient
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Veterinarian
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Date
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Diagnosis
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2" />
            </tr>
          </thead>
          <tbody>
            {page?.results.map((visit) => (
              <tr key={visit.id} className="group">
                <td className="border-b border-line px-3.5 py-2.5 font-medium group-hover:bg-surface-2">
                  {visit.patient_name}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {visit.veterinarian_name}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {new Date(visit.visit_date).toLocaleString()}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {visit.diagnosis ? (
                    <span className="line-clamp-1">{visit.diagnosis}</span>
                  ) : (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/visits/${visit.id}`}
                      title="View"
                      className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink"
                    >
                      <EyeIcon />
                    </Link>
                    <Link
                      href={`/visits/${visit.id}/edit`}
                      title="Edit"
                      className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(visit.id)}
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
          <p className="px-3.5 py-6 text-center text-sm text-ink-faint">No visits yet.</p>
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
