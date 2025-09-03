import { useEffect, useState } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "./context/AuthContext";
import { NotificationProvider } from "./context/NotificationContext";
import Navbar from "./components/Navbar";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Classes from "./pages/Classes";
import Sessions from "./pages/Sessions";
import Bookings from "./pages/Bookings";
import AuditLogs from "./pages/AuditLogs";
import Home from "./pages/Home";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminRoute from "./components/AdminRoute";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function AppWithSession() {
  const { logout, user, refreshToken } = useAuth();
  const [showRefreshModal, setShowRefreshModal] = useState(false);

  // Logout on tab/window close (not refresh)
  useEffect(() => {
    const handleUnload = (e: BeforeUnloadEvent) => {
      // Only send logout if NOT a refresh (best effort)
      if (!performance.getEntriesByType("navigation")[0]?.type.includes("reload")) {
        navigator.sendBeacon && navigator.sendBeacon("/api/logout");
        logout();
      }
    };
    window.addEventListener("unload", handleUnload);
    return () => window.removeEventListener("unload", handleUnload);
  }, [logout]);

  // Token/session refresh after 2 hours
  useEffect(() => {
    if (!user) return;
    const loginTime = Date.now();
    const timer = setTimeout(() => {
      setShowRefreshModal(true);
    }, 2 * 60 * 60 * 1000); // 2 hours

    return () => clearTimeout(timer);
  }, [user]);

  const handleRefreshToken = () => {
    refreshToken && refreshToken();
    setShowRefreshModal(false);
  };

  const handleLogout = () => {
    logout();
    setShowRefreshModal(false);
  };

  return (
    <>
      {showRefreshModal && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            width: "100vw",
            height: "100vh",
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 9999,
          }}
        >
          <div
            style={{
              background: "#fff",
              padding: "2rem",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
              textAlign: "center",
            }}
          >
            <h2>Session Expired</h2>
            <p>Your session is about to expire. Do you want to refresh your token?</p>
            <button
              style={{
                margin: "1rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                background: "#3498db",
                color: "#fff",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={handleRefreshToken}
            >
              Refresh Token
            </button>
            <button
              style={{
                margin: "1rem",
                padding: "0.75rem 1.5rem",
                borderRadius: "8px",
                border: "none",
                background: "#e74c3c",
                color: "#fff",
                fontWeight: "500",
                cursor: "pointer",
              }}
              onClick={handleLogout}
            >
              Logout
            </button>
          </div>
        </div>
      )}
      <Router>
        <Navbar />
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route element={<ProtectedRoute />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route element={<AdminRoute />}>
              <Route path="/classes" element={<Classes />} />
              <Route path="/sessions" element={<Sessions />} />
              <Route path="/audit-logs" element={<AuditLogs />} />
            </Route>
          </Route>
        </Routes>
      </Router>
    </>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <NotificationProvider>
          <AppWithSession />
        </NotificationProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
