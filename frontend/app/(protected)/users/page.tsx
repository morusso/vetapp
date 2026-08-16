"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { type User, listSpecializations, listUsers } from "@/lib/users";
import { PlusIcon } from "@/components/icons";
import { dotColor } from "@/lib/colors";
import { usePaginatedResource } from "@/lib/hooks/usePaginatedResource";
import { DataTable, type DataTableColumn } from "@/components/DataTable";

export default function UsersPage() {
  const { page, error, load } = usePaginatedResource(listUsers, {
    loadErrorMessage: "Could not load users. You may not have permission to view this page.",
  });
  const [specializationNames, setSpecializationNames] = useState<Record<number, string>>({});

  useEffect(() => {
    listSpecializations()
      .then((specializationPage) =>
        setSpecializationNames(Object.fromEntries(specializationPage.results.map((s) => [s.id, s.name])))
      )
      .catch(() => {});
  }, []);

  const columns: DataTableColumn<User>[] = [
    {
      header: "Name",
      cell: (user) => (
        <div className="flex items-center gap-2.5">
          <span className="size-2 flex-none rounded-full" style={{ backgroundColor: dotColor(user.id) }} />
          <span className="font-medium">
            {user.first_name || user.last_name ? (
              `${user.first_name} ${user.last_name}`.trim()
            ) : (
              <span className="text-ink-faint">—</span>
            )}
          </span>
        </div>
      ),
    },
    {
      header: "Email",
      className: "text-ink-muted",
      cell: (user) => user.email,
    },
    {
      header: "Phone",
      className: "text-ink-muted",
      cell: (user) => user.phone_number || <span className="text-ink-faint">—</span>,
    },
    {
      header: "Specializations",
      className: "text-ink-muted",
      cell: (user) =>
        user.specializations.length > 0 ? (
          user.specializations.map((id) => specializationNames[id] ?? id).join(", ")
        ) : (
          <span className="text-ink-faint">—</span>
        ),
    },
    {
      header: "Status",
      cell: (user) => (
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
      ),
    },
  ];

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

      <DataTable
        page={page}
        columns={columns}
        keyField={(user) => user.id}
        emptyMessage="No users yet."
        onPageChange={load}
      />
    </main>
  );
}
