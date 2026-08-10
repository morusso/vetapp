"use client";

import { useNotifications, type Notification } from "@/lib/notifications";

export default function NotificationToasts() {
  const { toasts, dismissToast } = useNotifications();

  if (toasts.length === 0) return null;

  return (
    <div className="fixed right-4 top-4 z-50 flex w-80 flex-col gap-2">
      {toasts.map((toast) => (
        <div
          key={toast.toastId}
          className="rounded-md border border-line bg-surface-2 p-3 text-sm shadow-lg"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="font-medium text-ink">{describe(toast)}</p>
            <button
              type="button"
              onClick={() => dismissToast(toast.toastId)}
              className="text-ink-faint hover:text-ink"
              aria-label="Dismiss notification"
            >
              &times;
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}

function describe(notification: Notification): string {
  const { payload, event } = notification;
  return typeof payload.message === "string" ? payload.message : event;
}
