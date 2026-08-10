"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { API_URL, API_V1_URL, getAccessToken } from "./auth";
import { request, type Paginated } from "./api";

export type Notification = {
  id: number;
  event: string;
  payload: Record<string, unknown>;
  is_read: boolean;
  created_at: string;
  read_at: string | null;
};

type ToastNotification = Notification & { toastId: string };

type NotificationsContextValue = {
  notifications: Notification[];
  unreadCount: number;
  toasts: ToastNotification[];
  markRead: (id: number) => void;
  markAllRead: () => void;
  dismissToast: (toastId: string) => void;
};

const NotificationsContext = createContext<NotificationsContextValue | null>(null);

const NOTIFICATIONS_URL = `${API_V1_URL}/notifications/`;
const WS_URL = API_URL.replace(/^http/, "ws");
const AUTO_DISMISS_MS = 6000;
const MAX_RECONNECT_DELAY_MS = 30_000;

// Only ever mounted while the user is authenticated - app/(protected)/layout.tsx
// gates rendering on isAuthenticated, so connection setup/teardown here just
// follows this component's own mount/unmount lifecycle.
export function NotificationsProvider({ children }: { children: ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [toasts, setToasts] = useState<ToastNotification[]>([]);
  const socketRef = useRef<WebSocket | null>(null);
  const reconnectDelayRef = useRef(1000);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stoppedRef = useRef(false);

  const dismissToast = useCallback((toastId: string) => {
    setToasts((current) => current.filter((t) => t.toastId !== toastId));
  }, []);

  const addNotification = useCallback(
    (notification: Notification) => {
      setNotifications((current) => [notification, ...current]);
      setUnreadCount((current) => current + 1);

      const toastId = crypto.randomUUID();
      setToasts((current) => [...current, { ...notification, toastId }]);
      setTimeout(() => dismissToast(toastId), AUTO_DISMISS_MS);
    },
    [dismissToast]
  );

  const markRead = useCallback((id: number) => {
    let wasUnread = false;
    setNotifications((current) =>
      current.map((n) => {
        if (n.id !== id) return n;
        wasUnread = !n.is_read;
        return { ...n, is_read: true };
      })
    );
    setUnreadCount((current) => (wasUnread ? Math.max(current - 1, 0) : current));
    request(`${NOTIFICATIONS_URL}${id}/read/`, { method: "POST" }).catch(() => {});
  }, []);

  const markAllRead = useCallback(() => {
    setNotifications((current) => current.map((n) => ({ ...n, is_read: true })));
    setUnreadCount(0);
    request(`${NOTIFICATIONS_URL}read-all/`, { method: "POST" }).catch(() => {});
  }, []);

  // load the persisted history and unread count once, on mount
  useEffect(() => {
    request<Paginated<Notification>>(NOTIFICATIONS_URL)
      .then((page) => setNotifications(page.results))
      .catch(() => {});

    request<Paginated<Notification>>(`${NOTIFICATIONS_URL}?unread=true&page_size=1`)
      .then((page) => setUnreadCount(page.count))
      .catch(() => {});
  }, []);

  useEffect(() => {
    function connect() {
      // re-read the token on every (re)connect since it rotates independently
      const token = getAccessToken();
      if (!token) return;

      const socket = new WebSocket(`${WS_URL}/ws/notifications/?token=${token}`);
      socketRef.current = socket;

      socket.onopen = () => {
        reconnectDelayRef.current = 1000;
      };

      socket.onmessage = (message) => {
        try {
          addNotification(JSON.parse(message.data));
        } catch {
          return;
        }
      };

      socket.onclose = () => {
        if (stoppedRef.current) return;
        reconnectTimerRef.current = setTimeout(connect, reconnectDelayRef.current);
        reconnectDelayRef.current = Math.min(
          reconnectDelayRef.current * 2,
          MAX_RECONNECT_DELAY_MS
        );
      };
    }

    connect();

    return () => {
      stoppedRef.current = true;
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      socketRef.current?.close();
      socketRef.current = null;
    };
  }, [addNotification]);

  return (
    <NotificationsContext.Provider
      value={{ notifications, unreadCount, toasts, markRead, markAllRead, dismissToast }}
    >
      {children}
    </NotificationsContext.Provider>
  );
}

export function useNotifications(): NotificationsContextValue {
  const ctx = useContext(NotificationsContext);
  if (!ctx) {
    throw new Error("useNotifications must be used within a NotificationsProvider.");
  }
  return ctx;
}
