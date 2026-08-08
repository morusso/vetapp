import Link from "next/link";
import {
  AnimalsIcon,
  AnimalTypesIcon,
  ClientsIcon,
  PatientsIcon,
  UsersIcon,
} from "@/components/icons";

const SHORTCUTS = [
  { href: "/clients", label: "Clients", description: "Registered pet owners", icon: ClientsIcon },
  { href: "/patients", label: "Patients", description: "Animals under care", icon: PatientsIcon },
  { href: "/animals", label: "Animals", description: "Breeds on file", icon: AnimalsIcon },
  { href: "/animal-types", label: "Animal types", description: "Species categories", icon: AnimalTypesIcon },
  { href: "/users", label: "Users", description: "Staff accounts", icon: UsersIcon },
];

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col gap-6 p-6">
      <div>
        <h1 className="text-lg font-semibold tracking-tight">Dashboard</h1>
        <p className="text-xs text-ink-faint">You are logged in.</p>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {SHORTCUTS.map((s) => (
          <Link
            key={s.href}
            href={s.href}
            className="flex flex-col gap-2.5 rounded-lg border border-line bg-surface p-4 hover:border-line-strong hover:bg-surface-2"
          >
            <s.icon className="size-5 text-accent" />
            <div>
              <p className="text-sm font-semibold">{s.label}</p>
              <p className="text-xs text-ink-faint">{s.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
