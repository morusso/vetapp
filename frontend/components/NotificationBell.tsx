"use client";

import { useEffect, useRef, useState } from "react";
import { useNotifications, type Notification } from "@/lib/notifications";
import { BellIcon } from "@/components/icons";

export default function NotificationBell() {
  const { notifications, unreadCount, markRead, markAllRead } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    function handleClickOutside(event: MouseEvent) {
      if (!containerRef.current?.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen]);

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setIsOpen((open) => !open)}
        className="relative flex size-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-3 hover:text-ink"
        aria-label="Notifications"
      >
        <BellIcon />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent px-1 text-[10px] font-semibold text-accent-ink">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 top-10 z-50 w-80 rounded-md border border-line bg-surface-2 shadow-lg">
          <div className="flex items-center justify-between border-b border-line px-3 py-2">
            <p className="text-xs font-semibold text-ink-muted uppercase tracking-wider">
              Notifications
            </p>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAllRead()}
                className="text-xs font-medium text-accent hover:underline"
              >
                Mark all as read
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-3 py-6 text-center text-sm text-ink-faint">
                No notifications yet.
              </p>
            ) : (
              notifications.map((notification) => (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => markRead(notification.id)}
                  className="flex w-full flex-col gap-0.5 border-b border-line px-3 py-2.5 text-left last:border-b-0 hover:bg-surface-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <p
                      className={`text-sm ${notification.is_read ? "text-ink-muted" : "font-semibold text-ink"}`}
                    >
                      {describe(notification)}
                    </p>
                    {!notification.is_read && (
                      <span className="mt-1 size-1.5 shrink-0 rounded-full bg-accent" />
                    )}
                  </div>
                  <p className="text-[11px] text-ink-faint">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function describe(notification: Notification): string {
  const { payload, event } = notification;
  return typeof payload.message === "string" ? payload.message : event;
}
