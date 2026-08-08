"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type Paginated, type User, listSpecializations, listUsers } from "@/lib/users";
import { ChevronLeftIcon, ChevronRightIcon, PlusIcon } from "@/components/icons";
import { dotColor } from "@/lib/colors";

export default function UsersPage() {
  const [page, setPage] = useState<Paginated<User> | null>(null);
  const [specializationNames, setSpecializationNames] = useState<Record<number, string>>({});
  const [error, setError] = useState<string | null>(null);

  async function load(url?: string) {
    setError(null);
    try {
      setPage(await listUsers(url));
    } catch {
      setError("Could not load users. You may not have permission to view this page.");
    }
  }

  useEffect(() => {
    async function init() {
      setError(null);
      try {
        setPage(await listUsers());
      } catch {
        setError("Could not load users. You may not have permission to view this page.");
      }
    }
    init();

    listSpecializations()
      .then((specializationPage) =>
        setSpecializationNames(
          Object.fromEntries(specializationPage.results.map((s) => [s.id, s.name]))
        )
      )
      .catch(() => {});
  }, []);

  return (
    <main className="flex flex-1 flex-col gap-5 p-6">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h1 className="text-lg font-semibold tracking-tight">Users</h1>
          <p className="text-xs text-ink-faint">
            Staff accounts with access to VetApp
            {page && (
              <>
                {" · "}
                <span className="font-medium text-ink-muted">{page.count}</span> total
              </>
            )}
          </p>
        </div>
        <Link
          href="/users/new"
          className="flex items-center gap-1.5 rounded-md bg-accent px-3.5 py-2 text-sm font-semibold text-accent-ink hover:brightness-105"
        >
          <PlusIcon className="size-3.5" />
          New user
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
                Email
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Phone
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Specializations
              </th>
              <th className="border-t border-b border-line bg-surface-2 px-3.5 py-2 text-left text-[11px] font-semibold tracking-wide text-ink-faint uppercase">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {page?.results.map((user) => (
              <tr key={user.id} className="group">
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                  <div className="flex items-center gap-2.5">
                    <span
                      className="size-2 flex-none rounded-full"
                      style={{ backgroundColor: dotColor(user.id) }}
                    />
                    <span className="font-medium">
                      {user.first_name || user.last_name
                        ? `${user.first_name} ${user.last_name}`.trim()
                        : <span className="text-ink-faint">—</span>}
                    </span>
                  </div>
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {user.email}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {user.phone_number || <span className="text-ink-faint">—</span>}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 text-ink-muted group-hover:bg-surface-2">
                  {user.specializations.length > 0
                    ? user.specializations.map((id) => specializationNames[id] ?? id).join(", ")
                    : <span className="text-ink-faint">—</span>}
                </td>
                <td className="border-b border-line px-3.5 py-2.5 group-hover:bg-surface-2">
                  <div className="flex gap-1.5">
                    {user.is_staff && (
                      <span className="rounded-full bg-accent-soft px-2 py-0.5 text-[11px] font-semibold text-accent-soft-ink">
                        Staff
                      </span>
                    )}
                    {!user.is_active && (
                      <span className="rounded-full bg-danger-soft px-2 py-0.5 text-[11px] font-semibold text-danger">
                        Inactive
                      </span>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {page && page.results.length === 0 && (
          <p className="px-3.5 py-6 text-center text-sm text-ink-faint">No users yet.</p>
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
