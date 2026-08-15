"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { type ReactNode } from "react";
import { useAuth } from "@/lib/auth-context";
import NotificationBell from "@/components/NotificationBell";
import {
  AnimalsIcon,
  AnimalTypesIcon,
  ClientsIcon,
  DashboardIcon,
  LogoutIcon,
  MedicinesIcon,
  PasswordIcon,
  PatientsIcon,
  ServicesIcon,
  StockBatchesIcon,
  UsersIcon,
  VisitsIcon,
} from "@/components/icons";

const NAV_ITEMS = [
  { href: "/dashboard", label: "Dashboard", icon: DashboardIcon },
  { href: "/clients", label: "Clients", icon: ClientsIcon },
  { href: "/patients", label: "Patients", icon: PatientsIcon },
  { href: "/visits", label: "Visits", icon: VisitsIcon },
  { href: "/animals", label: "Animals", icon: AnimalsIcon },
  { href: "/animal-types", label: "Animal types", icon: AnimalTypesIcon },
  { href: "/medicines", label: "Medicines", icon: MedicinesIcon },
  { href: "/medicine-batches", label: "Stock batches", icon: StockBatchesIcon },
  { href: "/services", label: "Services", icon: ServicesIcon },
  { href: "/users", label: "Users", icon: UsersIcon },
];

export default function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { logout } = useAuth();

  const active = NAV_ITEMS.find(
    (item) => pathname === item.href || pathname.startsWith(`${item.href}/`)
  );
  const title = active?.label ?? "Change password";

  return (
    <div className="flex flex-1">
      <aside className="hidden w-56 flex-none flex-col gap-6 border-r border-line bg-surface-2 p-3 sm:flex">
        <div className="flex items-center gap-2 border-b border-line px-2 pb-3">
          <span className="flex size-6 items-center justify-center rounded-md bg-accent text-xs font-bold text-accent-ink">
            V
          </span>
          <span className="text-sm font-semibold tracking-tight">VetApp</span>
        </div>

        <nav className="flex flex-col gap-px">
          <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold tracking-wider text-ink-faint uppercase">
            Workspace
          </p>
          {NAV_ITEMS.map((item) => {
            const isActive = item === active;
            const ItemIcon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium ${
                  isActive
                    ? "bg-accent-soft text-accent-soft-ink font-semibold"
                    : "text-ink-muted hover:bg-surface-3 hover:text-ink"
                }`}
              >
                <ItemIcon />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <nav className="mt-auto flex flex-col gap-px">
          <p className="mb-1.5 px-2.5 text-[10.5px] font-semibold tracking-wider text-ink-faint uppercase">
            Account
          </p>
          <Link
            href="/change-password"
            className={`flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-sm font-medium ${
              pathname === "/change-password"
                ? "bg-accent-soft text-accent-soft-ink font-semibold"
                : "text-ink-muted hover:bg-surface-3 hover:text-ink"
            }`}
          >
            <PasswordIcon />
            Change password
          </Link>
          <button
            type="button"
            onClick={() => logout()}
            className="flex items-center gap-2.5 rounded-md px-2.5 py-1.5 text-left text-sm font-medium text-ink-muted hover:bg-surface-3 hover:text-ink"
          >
            <LogoutIcon />
            Log out
          </button>
        </nav>
      </aside>

      <div className="flex flex-1 flex-col">
        <header className="flex items-center justify-between border-b border-line px-6 py-3.5 text-xs text-ink-faint">
          <span>
            VetApp / <span className="ml-1 font-semibold text-ink-muted">{title}</span>
          </span>
          <NotificationBell />
        </header>
        <div className="flex flex-1 flex-col">{children}</div>
      </div>
    </div>
  );
}
