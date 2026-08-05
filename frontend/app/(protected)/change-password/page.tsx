"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { changePassword, ChangePasswordError } from "@/lib/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newPasswordConfirm, setNewPasswordConfirm] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setFieldErrors({});

    if (newPassword !== newPasswordConfirm) {
      setFieldErrors({ new_password_confirm: ["Passwords do not match."] });
      return;
    }

    setIsSubmitting(true);
    try {
      await changePassword(oldPassword, newPassword);
      // the backend revokes all sessions on password change, so log out locally too
      await logout();
      router.push("/login");
    } catch (err) {
      setFieldErrors(
        err instanceof ChangePasswordError
          ? err.fieldErrors
          : { detail: ["Could not connect to the server."] }
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="flex flex-1 flex-col items-center justify-center gap-6">
      <h1 className="text-2xl font-semibold">Change password</h1>

      <form
        onSubmit={handleSubmit}
        className="flex w-full max-w-sm flex-col gap-4"
      >
        <div className="flex flex-col gap-1">
          <label htmlFor="old-password" className="text-sm font-medium">
            Current password
          </label>
          <input
            id="old-password"
            type="password"
            required
            autoComplete="current-password"
            value={oldPassword}
            onChange={(e) => setOldPassword(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {fieldErrors.old_password?.map((msg) => (
            <p key={msg} className="text-sm text-red-600">
              {msg}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="new-password" className="text-sm font-medium">
            New password
          </label>
          <input
            id="new-password"
            type="password"
            required
            autoComplete="new-password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {fieldErrors.new_password?.map((msg) => (
            <p key={msg} className="text-sm text-red-600">
              {msg}
            </p>
          ))}
        </div>

        <div className="flex flex-col gap-1">
          <label htmlFor="new-password-confirm" className="text-sm font-medium">
            Confirm new password
          </label>
          <input
            id="new-password-confirm"
            type="password"
            required
            autoComplete="new-password"
            value={newPasswordConfirm}
            onChange={(e) => setNewPasswordConfirm(e.target.value)}
            className="rounded border border-zinc-300 px-3 py-2 dark:border-zinc-700 dark:bg-zinc-900"
          />
          {fieldErrors.new_password_confirm?.map((msg) => (
            <p key={msg} className="text-sm text-red-600">
              {msg}
            </p>
          ))}
        </div>

        {fieldErrors.detail && (
          <p className="text-sm text-red-600">{fieldErrors.detail.join(" ")}</p>
        )}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded bg-zinc-900 px-4 py-2 font-medium text-white disabled:opacity-50 dark:bg-zinc-100 dark:text-zinc-900"
        >
          {isSubmitting ? "Changing…" : "Change password"}
        </button>
      </form>
    </main>
  );
}
