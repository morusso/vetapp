"use client";

import { useEffect, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth-context";
import { NotificationsProvider } from "@/lib/notifications";
import AppShell from "@/components/AppShell";
import NotificationToasts from "@/components/NotificationToasts";

export default function ProtectedLayout({ children }: { children: ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isLoading, isAuthenticated, router]);

  if (isLoading || !isAuthenticated) {
    return null;
  }

  return (
    <NotificationsProvider>
      <AppShell>{children}</AppShell>
      <NotificationToasts />
    </NotificationsProvider>
  );
}
