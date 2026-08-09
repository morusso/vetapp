"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Paginated } from "@/lib/api";
import { type Medicine, deleteMedicine, listMedicines } from "@/lib/medicines";
import { ChevronLeftIcon, ChevronRightIcon, EditIcon, PlusIcon, TrashIcon } from "@/components/icons";

export default function MedicinesPage() {
  const [page, setPage] = useState<Paginated<Medicine> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(url?: string) {
    setError(null);
    try {
      setPage(await listMedicines(url));
    } catch {
      setError("Could not load medicines.");
    }
  }

  useEffect(() => {
    async function init() {
      setError(null);
      try {
        setPage(await listMedicines());
      } catch {
        setError("Could not load medicines.");
      }
    }
    init();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this medicine?")) return;
    try {
      await deleteMedicine(id);
      load();
    } catch {
      setError("Could not delete this medicine. It may still have stock batches.");
    }
  }

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

      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Name
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Manufacturer
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Form
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2" />
            </tr>
          </thead>
          <tbody>
            {page?.results.map((medicine) => (
              <tr key={medicine.id} className="group">
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
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
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {medicine.manufacturer || <span className="text-ink-faint">—</span>}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted capitalize group-hover:bg-surface-2">
                  {medicine.form}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/medicines/${medicine.id}`}
                      title="Edit"
                      className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(medicine.id)}
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
          <p className="px-3.5 py-6 text-center text-sm text-ink-faint">No medicines yet.</p>
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
