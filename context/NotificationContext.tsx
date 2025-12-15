import React, { createContext, useContext, useMemo, useRef, useState } from "react";
import { webSocketClient } from "../core/utils/WebSocketClient"; 

export type AppNotification = {
  id?: number;
  title: string;
  body: string;
  createdAt?: string;
  read?: boolean;
  // 필요하면 targetId, type 등 추가
};

type Ctx = {
  notifications: AppNotification[];
  unreadCount: number;

  setNotificationScreenActive: (active: boolean) => void;
  startAlarmStream: (token: string, userId: number) => void;
  stopAlarmStream: () => void;
  markAllRead: () => void;
};

const NotificationContext = createContext<Ctx | null>(null);

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const isActiveRef = useRef(false);

  const setNotificationScreenActive = (active: boolean) => {
    isActiveRef.current = active;
  };

  const startAlarmStream = (token: string, userId: number) => {
    webSocketClient.connectAlarm(token, userId, (alarm: any) => {
      const next: AppNotification = {
        id: alarm.id,
        title: alarm.title ?? "알림",
        body: alarm.message ?? alarm.body ?? "",
        createdAt: alarm.createdAt,
        read: false,
      };

      setNotifications((prev) => [next, ...prev]);

      if (!isActiveRef.current) {
        setUnreadCount((c) => c + 1);
      }
    });
  };

  const stopAlarmStream = () => {
    webSocketClient.disconnectAlarm();
  };

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnreadCount(0);
  };

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      setNotificationScreenActive,
      startAlarmStream,
      stopAlarmStream,
      markAllRead,
    }),
    [notifications, unreadCount]
  );

  return <NotificationContext.Provider value={value}>{children}</NotificationContext.Provider>;
}

export function useNotifications() {
  const ctx = useContext(NotificationContext);
  if (!ctx) throw new Error("useNotifications must be used within NotificationProvider");
  return ctx;
}
