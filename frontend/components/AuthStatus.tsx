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
        Log in
      </Link>
    );
  }

  return (
    <div className="flex items-center gap-4">
      <Link href="/change-password" className="text-sm font-medium underline">
        Change password
      </Link>
      <button
        type="button"
        onClick={() => logout()}
        className="text-sm font-medium underline"
      >
        Log out
      </button>
    </div>
  );
}
