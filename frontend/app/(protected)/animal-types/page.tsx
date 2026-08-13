"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  type AnimalType,
  type Paginated,
  deleteAnimalType,
  listAnimalTypes,
} from "@/lib/animals";
import { ChevronLeftIcon, ChevronRightIcon, EditIcon, PlusIcon, TrashIcon } from "@/components/icons";
import { dotColor } from "@/lib/colors";
import { stripHtml } from "@/components/RichTextViewer";

export default function AnimalTypesPage() {
  const [page, setPage] = useState<Paginated<AnimalType> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function load(url?: string) {
    setError(null);
    try {
      setPage(await listAnimalTypes(url));
    } catch {
      setError("Could not load animal types.");
    }
  }

  useEffect(() => {
    async function init() {
      setError(null);
      try {
        setPage(await listAnimalTypes());
      } catch {
        setError("Could not load animal types.");
      }
    }
    init();
  }, []);

  async function handleDelete(id: number) {
    if (!confirm("Delete this animal type?")) return;
    try {
      await deleteAnimalType(id);
      load();
    } catch {
      setError("Could not delete this animal type. It may still be in use.");
    }
  }

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Animal types</h1>
          <p className="text-xs text-ink-faint">
            Species categories used across patient records
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/animal-types/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New animal type
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
                Description
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2" />
            </tr>
          </thead>
          <tbody>
            {page?.results.map((animalType) => (
              <tr key={animalType.id} className="group">
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2 flex-none rounded-full"
                      style={{ backgroundColor: dotColor(animalType.id) }}
                    />
                    <span className="font-medium">{animalType.name}</span>
                  </div>
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {(animalType.description && stripHtml(animalType.description)) || (
                    <span className="text-ink-faint">—</span>
                  )}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                  <div className="flex justify-end gap-1">
                    <Link
                      href={`/animal-types/${animalType.id}`}
                      title="Edit"
                      className="flex size-7 items-center justify-center rounded-md text-ink-faint hover:bg-surface-3 hover:text-ink"
                    >
                      <EditIcon />
                    </Link>
                    <button
                      type="button"
                      onClick={() => handleDelete(animalType.id)}
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
          <p className="px-3.5 py-6 text-center text-sm text-ink-faint">No animal types yet.</p>
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
