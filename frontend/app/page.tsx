import Link from "next/link";

async function getHealth() {
  try {
    const res = await fetch(`${process.env.API_INTERNAL_URL}/api/health/`, {
      cache: "no-store",
    });
    if (!res.ok) return { status: "error" };
    return res.json();
  } catch {
    return { status: "unreachable" };
  }
}

export default async function Home() {
  const health = await getHealth();

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-2">
      <h1 className="text-2xl font-semibold">vetapp</h1>
      <p className="text-zinc-600 dark:text-zinc-400">
        Backend API status: {health.status}
      </p>
      <Link
        href="/login"
        className="rounded bg-zinc-900 px-4 py-2 font-medium text-white dark:bg-zinc-100 dark:text-zinc-900"
      >
        Zaloguj się
      </Link>
    </main>
  );
}
