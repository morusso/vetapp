"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { useForm } from "@/lib/hooks/useForm";
import { changePassword } from "@/lib/auth";

export default function ChangePasswordPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const { values, setValues, fieldErrors, isSubmitting, handleSubmit } = useForm({
    initialValues: { old_password: "", new_password: "", new_password_confirm: "" },
    onSubmit: async (v) => {
      await changePassword(v.old_password, v.new_password);
      // the backend revokes all sessions on password change, so log out locally too
      await logout();
      router.push("/login");
    },
    validate: (v) => {
      if (v.new_password !== v.new_password_confirm) {
        return { new_password_confirm: ["Passwords do not match."] };
      }
      return null;
    },
  });

  const inputClass =
    "rounded-md border border-line-strong bg-surface px-3 py-2 text-sm focus:border-accent focus:outline-none";

  return (
    <main className="flex flex-1 justify-center p-6">
      <form
        onSubmit={handleSubmit}
        className="w-full max-w-sm rounded-lg border border-line bg-surface shadow-sm"
      >
        <div className="border-b border-line px-6 py-4">
          <h1 className="text-base font-semibold">Change password</h1>
        </div>

        <div className="flex flex-col gap-4 px-6 py-5">
          <div className="flex flex-col gap-1">
            <label htmlFor="old-password" className="text-xs font-semibold text-ink-muted">
              Current password
            </label>
            <input
              id="old-password"
              type="password"
              required
              autoComplete="current-password"
              value={values.old_password}
              onChange={(e) => setValues({ ...values, old_password: e.target.value })}
              className={inputClass}
            />
            {fieldErrors.old_password?.map((msg) => (
              <p key={msg} className="text-xs text-danger">
                {msg}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="new-password" className="text-xs font-semibold text-ink-muted">
              New password
            </label>
            <input
              id="new-password"
              type="password"
              required
              autoComplete="new-password"
              value={values.new_password}
              onChange={(e) => setValues({ ...values, new_password: e.target.value })}
              className={inputClass}
            />
            {fieldErrors.new_password?.map((msg) => (
              <p key={msg} className="text-xs text-danger">
                {msg}
              </p>
            ))}
          </div>

          <div className="flex flex-col gap-1">
            <label htmlFor="new-password-confirm" className="text-xs font-semibold text-ink-muted">
              Confirm new password
            </label>
            <input
              id="new-password-confirm"
              type="password"
              required
              autoComplete="new-password"
              value={values.new_password_confirm}
              onChange={(e) => setValues({ ...values, new_password_confirm: e.target.value })}
              className={inputClass}
            />
            {fieldErrors.new_password_confirm?.map((msg) => (
              <p key={msg} className="text-xs text-danger">
                {msg}
              </p>
            ))}
          </div>

          {fieldErrors.detail && (
            <p className="text-sm text-danger">{fieldErrors.detail.join(" ")}</p>
          )}
        </div>

        <div className="flex justify-end gap-2 border-t border-line px-6 py-4">
          <button
            type="submit"
            disabled={isSubmitting}
            className="rounded-md bg-accent px-4 py-2 text-sm font-semibold text-accent-ink disabled:opacity-50"
          >
            {isSubmitting ? "Changing…" : "Change password"}
          </button>
        </div>
      </form>
    </main>
  );
}
