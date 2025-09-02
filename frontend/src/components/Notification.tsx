import React, { useEffect, useState } from "react";

export interface NotificationProps {
  id: string;
  type: "success" | "error" | "info" | "warning";
  title: string;
  message: string;
  duration?: number;
  onClose: (id: string) => void;
}

const Notification: React.FC<NotificationProps> = ({
  id,
  type,
  title,
  message,
  duration = 5000,
  onClose,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const [isLeaving, setIsLeaving] = useState(false);

  useEffect(() => {
    // Show notification with animation
    const showTimer = setTimeout(() => setIsVisible(true), 100);

    // Auto-hide notification
    const hideTimer = setTimeout(() => {
      handleClose();
    }, duration);

    return () => {
      clearTimeout(showTimer);
      clearTimeout(hideTimer);
    };
  }, [duration]);

  const handleClose = () => {
    setIsLeaving(true);
    setTimeout(() => {
      onClose(id);
    }, 300); // Match animation duration
  };

  const getIcon = () => {
    switch (type) {
      case "success":
        return "✅";
      case "error":
        return "❌";
      case "warning":
        return "⚠️";
      case "info":
        return "ℹ️";
      default:
        return "ℹ️";
    }
  };

  const getStyles = () => {
    const baseStyles = {
      position: "fixed" as const,
      top: "16px",
      right: "16px",
      zIndex: 9999,
      maxWidth: "384px",
      width: "100%",
      backgroundColor: "white",
      borderRadius: "8px",
      boxShadow:
        "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
      borderLeft: "4px solid",
      padding: "16px",
      transform: isVisible && !isLeaving ? "translateX(0)" : "translateX(100%)",
      opacity: isVisible && !isLeaving ? 1 : 0,
      transition: "all 0.3s ease-in-out",
    };

    switch (type) {
      case "success":
        return { ...baseStyles, borderLeftColor: "#10b981" };
      case "error":
        return { ...baseStyles, borderLeftColor: "#ef4444" };
      case "warning":
        return { ...baseStyles, borderLeftColor: "#f59e0b" };
      case "info":
        return { ...baseStyles, borderLeftColor: "#3b82f6" };
      default:
        return { ...baseStyles, borderLeftColor: "#6b7280" };
    }
  };

  return (
    <div style={getStyles()}>
      <div style={{ display: "flex", alignItems: "flex-start" }}>
        <div style={{ flexShrink: 0, fontSize: "18px", marginRight: "12px" }}>
          {getIcon()}
        </div>
        <div style={{ flex: 1, minWidth: 0 }}>
          <h4
            style={{
              fontSize: "14px",
              fontWeight: "600",
              color: "#111827",
              margin: "0 0 4px 0",
            }}
          >
            {title}
          </h4>
          <p
            style={{
              fontSize: "14px",
              color: "#6b7280",
              margin: 0,
            }}
          >
            {message}
          </p>
        </div>
        <div style={{ flexShrink: 0, marginLeft: "16px" }}>
          <button
            onClick={handleClose}
            style={{
              display: "inline-flex",
              color: "#9ca3af",
              background: "none",
              border: "none",
              cursor: "pointer",
              padding: "4px",
              borderRadius: "4px",
              transition: "color 0.15s ease-in-out",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.color = "#6b7280";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.color = "#9ca3af";
            }}
          >
            <span
              style={{
                position: "absolute",
                width: "1px",
                height: "1px",
                padding: 0,
                margin: "-1px",
                overflow: "hidden",
                clip: "rect(0, 0, 0, 0)",
                whiteSpace: "nowrap",
                border: 0,
              }}
            >
              Close
            </span>
            <svg
              style={{ width: "20px", height: "20px" }}
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                clipRule="evenodd"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

export default Notification;
