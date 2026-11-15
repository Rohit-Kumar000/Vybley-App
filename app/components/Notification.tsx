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
import { CircleCheck, CircleX, Info, TriangleAlert, type LucideIcon } from "lucide-react";

type NotificationType = "success" | "error" | "warning" | "info";

interface NotificationContextType {
  showNotification: (message: string, type: NotificationType) => void;
}

interface NotificationData {
  message: string;
  type: NotificationType;
  id: number;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const STYLES: Record<NotificationType, { icon: LucideIcon; className: string }> = {
  success: { icon: CircleCheck, className: "alert-success" },
  error: { icon: CircleX, className: "alert-error" },
  warning: { icon: TriangleAlert, className: "alert-warning" },
  info: { icon: Info, className: "alert-info" },
};

export function NotificationProvider({ children }: { children: ReactNode }) {
  const [notification, setNotification] = useState<NotificationData | null>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const idRef = useRef(0);

  // Show one toast at a time; a new toast replaces the previous one.
  const showNotification = useCallback((message: string, type: NotificationType) => {
    if (timerRef.current) clearTimeout(timerRef.current);

    const id = ++idRef.current;
    setNotification({ message, type, id });

    timerRef.current = setTimeout(() => {
      setNotification((current) => (current?.id === id ? null : current));
      timerRef.current = null;
    }, 3500);
  }, []);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, []);

  const current = notification ? STYLES[notification.type] : null;

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}

      {notification && current && (
        <div className="toast toast-end toast-bottom z-100">
          <div
            role={notification.type === "error" ? "alert" : "status"}
            aria-live={notification.type === "error" ? "assertive" : "polite"}
            className={`alert alert-soft ${current.className} animate-toast-in shadow-2xl shadow-black/40`}
          >
            <current.icon className="h-5 w-5 shrink-0" />
            <span>{notification.message}</span>
          </div>
        </div>
      )}
    </NotificationContext.Provider>
  );
}

export function useNotification() {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error("useNotification must be used within a NotificationProvider");
  }

  return context;
}
