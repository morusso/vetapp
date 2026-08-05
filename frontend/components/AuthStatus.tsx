"use client";

import Link from "next/link";
import { useAuth } from "@/lib/auth-context";

export default function AuthStatus() {
  const { isAuthenticated, isLoading, logout } = useAuth();

  if (isLoading) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <Link href="/login" className="text-sm font-medium underline">
        Zaloguj się
      </Link>
    );
  }

  return (
    <button
      type="button"
      onClick={() => logout()}
      className="text-sm font-medium underline"
    >
      Wyloguj się
    </button>
  );
}
