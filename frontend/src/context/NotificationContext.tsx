import React, { createContext, useContext, useState, useCallback } from "react";
import type { ReactNode } from "react";
import Notification from "../components/Notification";

export interface NotificationData {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
}

interface NotificationContextType {
  notifications: NotificationData[];
  showNotification: (notification: Omit<NotificationData, "id">) => void;
  hideNotification: (id: string) => void;
  showSuccess: (title: string, message: string, duration?: number) => void;
  showError: (title: string, message: string, duration?: number) => void;
  showInfo: (title: string, message: string, duration?: number) => void;
  showWarning: (title: string, message: string, duration?: number) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined
);

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotification must be used within a NotificationProvider"
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
}

export const NotificationProvider: React.FC<NotificationProviderProps> = ({
  children,
}) => {
  const [notifications, setNotifications] = useState<NotificationData[]>([]);

  const showNotification = useCallback(
    (notification: Omit<NotificationData, "id">) => {
      const id = Math.random().toString(36).substr(2, 9);
      const newNotification: NotificationData = {
        ...notification,
        id,
      };

      setNotifications((prev) => [...prev, newNotification]);
    },
    []
  );

  const hideNotification = useCallback((id: string) => {
    setNotifications((prev) =>
      prev.filter((notification) => notification.id !== id)
    );
  }, []);

  const showSuccess = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification({ type: "success", title, message, duration });
    },
    [showNotification]
  );

  const showError = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification({ type: "error", title, message, duration });
    },
    [showNotification]
  );

  const showInfo = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification({ type: "info", title, message, duration });
    },
    [showNotification]
  );

  const showWarning = useCallback(
    (title: string, message: string, duration?: number) => {
      showNotification({ type: "warning", title, message, duration });
    },
    [showNotification]
  );

  const value: NotificationContextType = {
    notifications,
    showNotification,
    hideNotification,
    showSuccess,
    showError,
    showInfo,
    showWarning,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
      {/* Render notifications */}
      <div
        style={{
          position: "fixed",
          top: 0,
          right: 0,
          zIndex: 10000,
          padding: "16px",
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          pointerEvents: "none",
        }}
      >
        {notifications.map((notification) => (
          <div key={notification.id} style={{ pointerEvents: "auto" }}>
            <Notification {...notification} onClose={hideNotification} />
          </div>
        ))}
      </div>
    </NotificationContext.Provider>
  );
};
