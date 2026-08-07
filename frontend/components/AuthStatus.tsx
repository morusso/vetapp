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
      <Link href="/animal-types" className="text-sm font-medium underline">
        Animal types
      </Link>
      <Link href="/animals" className="text-sm font-medium underline">
        Animals
      </Link>
      <Link href="/clients" className="text-sm font-medium underline">
        Clients
      </Link>
      <Link href="/patients" className="text-sm font-medium underline">
        Patients
      </Link>
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
