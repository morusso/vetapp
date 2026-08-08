"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AuthStatus() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading || isAuthenticated) {
    return null;
  }

  return (
    <header className="flex justify-end p-4">
      <Link href="/login" className="text-sm font-medium underline">
        Log in
      </Link>
    </header>
  );
}
