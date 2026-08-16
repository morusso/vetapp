"use client";

import { useCallback, useEffect, useState } from "react";
import type { Paginated } from "@/lib/api";

type RemoveOptions = {
  fn: (id: number) => Promise<void>;
  confirmMessage: string;
  errorMessage: string;
};

type UsePaginatedResourceOptions = {
  loadErrorMessage: string;
  remove?: RemoveOptions;
};

export function usePaginatedResource<T>(
  list: (url?: string) => Promise<Paginated<T>>,
  options: UsePaginatedResourceOptions
) {
  const [page, setPage] = useState<Paginated<T> | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { loadErrorMessage, remove } = options;

  const load = useCallback(
    async (url?: string) => {
      setError(null);
      try {
        setPage(await list(url));
      } catch {
        setError(loadErrorMessage);
      }
    },
    [list, loadErrorMessage]
  );

  useEffect(() => {
    async function init() {
      await load();
    }
    init();
  }, [load]);

  const handleDelete = useCallback(
    async (id: number) => {
      if (!remove) return;
      if (!confirm(remove.confirmMessage)) return;
      try {
        await remove.fn(id);
        load();
      } catch {
        setError(remove.errorMessage);
      }
    },
    [load, remove]
  );

  return { page, error, load, handleDelete };
}
