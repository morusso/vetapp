import Link from "next/link";

export default function DashboardPage() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <h1 className="text-2xl font-semibold">Dashboard</h1>
        <p className="text-zinc-600 dark:text-zinc-400">You are logged in.</p>
      </div>

      <div className="flex gap-4">
        <Link
          href="/animal-types"
          className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
        >
          Animal types
        </Link>
        <Link
          href="/animals"
          className="rounded border border-zinc-300 px-4 py-2 text-sm font-medium dark:border-zinc-700"
        >
          Animals
        </Link>
      </div>
    </main>
  );
}
