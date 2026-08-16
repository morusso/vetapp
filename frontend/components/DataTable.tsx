import type { ReactNode } from "react";
import type { Paginated } from "@/lib/api";
import { ChevronLeftIcon, ChevronRightIcon } from "@/components/icons";

export type DataTableColumn<T> = {
  header: string;
  className?: string;
  cell: (item: T) => ReactNode;
};

type DataTableProps<T> = {
  page: Paginated<T> | null;
  columns: DataTableColumn<T>[];
  keyField: (item: T) => number | string;
  emptyMessage: string;
  onPageChange: (url: string) => void;
  actions?: (item: T) => ReactNode;
};

export function DataTable<T>({ page, columns, keyField, emptyMessage, onPageChange, actions }: DataTableProps<T>) {
  return (
    <>
      <div className="overflow-x-auto rounded-lg border border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column) => (
                <th
                  key={column.header}
                  className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase"
                >
                  {column.header}
                </th>
              ))}
              {actions && <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2" />}
            </tr>
          </thead>
          <tbody>
            {page?.results.map((item) => (
              <tr key={keyField(item)} className="group">
                {columns.map((column) => (
                  <td
                    key={column.header}
                    className={`border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2 ${column.className ?? ""}`}
                  >
                    {column.cell(item)}
                  </td>
                ))}
                {actions && (
                  <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                    <div className="flex justify-end gap-1">{actions(item)}</div>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
        {page && page.results.length === 0 && (
          <p className="px-3.5 py-6 text-center text-sm text-ink-faint">{emptyMessage}</p>
        )}
      </div>

      {page && (page.previous || page.next) && (
        <div className="flex items-center justify-between text-xs text-ink-faint">
          <span className="font-mono">
            {page.results.length} of {page.count} shown
          </span>
          <div className="flex gap-1.5">
            <button
              type="button"
              disabled={!page.previous}
              onClick={() => onPageChange(page.previous!)}
              className="flex size-7 items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-2 disabled:opacity-40"
            >
              <ChevronLeftIcon />
            </button>
            <button
              type="button"
              disabled={!page.next}
              onClick={() => onPageChange(page.next!)}
              className="flex size-7 items-center justify-center rounded-md border border-line text-ink-muted hover:bg-surface-2 disabled:opacity-40"
            >
              <ChevronRightIcon />
            </button>
          </div>
        </div>
      )}
    </>
  );
}
