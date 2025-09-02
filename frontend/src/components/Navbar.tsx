// src/components/Navbar.tsx
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { useState, useEffect } from "react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const { showSuccess } = useNotification();
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    showSuccess("Logged Out", "You have been successfully logged out.");
  };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Custom interactive link
  const InteractiveLink = ({ to, children, onClick }: any) => {
    const [hover, setHover] = useState(false);
    const [active, setActive] = useState(false);

    return (
      <Link
        to={to}
        onClick={onClick}
        style={{
          textDecoration: "none",
          color: hover ? "#1abc9c" : "#ecf0f1",
          fontWeight: 500,
          transform: active
            ? "scale(0.95)"
            : hover
            ? "scale(1.05)"
            : "scale(1)",
          transition: "all 0.2s ease-in-out",
        }}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => {
          setHover(false);
          setActive(false);
        }}
        onMouseDown={() => setActive(true)}
        onMouseUp={() => setActive(false)}
      >
        {children}
      </Link>
    );
  };

  return (
    <nav
      style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1rem 2rem",
        background: "#2c3e50",
        color: "#fff",
        boxShadow: "0 2px 8px rgba(0,0,0,0.15)",
        position: "fixed", // ✅ fixed position
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000, // ✅ ensures it stays above content
      }}
    >
      {/* Logo */}
      <div style={{ 
        fontSize: "1.5rem", 
        fontWeight: "bold", 
        display: "flex", 
        alignItems: "center", 
        gap: "0.5rem" 
      }}>
        <Link 
          to="/" 
          style={{ 
            textDecoration: "none", 
            color: "#ecf0f1",
            display: "flex",
            alignItems: "center",
            gap: "0.5rem"
          }}
        >
          <img 
            src="/favicon.svg" 
            alt="ClassBook Logo" 
            style={{ 
              width: "32px", 
              height: "32px",
              borderRadius: "4px"
            }} 
          />
          ClassBook
        </Link>
      </div>

      {/* Desktop Menu */}
      {!isMobile ? (
        <div style={{ display: "flex", gap: "1.5rem", alignItems: "center" }}>
          {!user ? (
            <>
              <InteractiveLink to="/login">Login</InteractiveLink>
              <InteractiveLink to="/register">Register</InteractiveLink>
            </>
          ) : (
            <>
              <InteractiveLink to="/dashboard">Dashboard</InteractiveLink>
              {user.role === "Admin" && (
                <>
                  <InteractiveLink to="/classes">Classes</InteractiveLink>
                  <InteractiveLink to="/sessions">Sessions</InteractiveLink>
                  <InteractiveLink to="/audit-logs">Audit Logs</InteractiveLink>
                </>
              )}
              <InteractiveLink to="/bookings"> Bookings</InteractiveLink>
              <button
                onClick={handleLogout}
                style={{
                  background: "#e74c3c",
                  border: "none",
                  padding: "0.5rem 1rem",
                  borderRadius: "6px",
                  color: "#fff",
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "all 0.2s ease-in-out",
                }}
                onMouseEnter={(e) =>
                  (e.currentTarget.style.background = "#c0392b")
                }
                onMouseLeave={(e) =>
                  (e.currentTarget.style.background = "#e74c3c")
                }
                onMouseDown={(e) =>
                  (e.currentTarget.style.transform = "scale(0.95)")
                }
                onMouseUp={(e) =>
                  (e.currentTarget.style.transform = "scale(1)")
                }
              >
                Logout
              </button>
            </>
          )}
        </div>
      ) : (
        // Mobile Hamburger
        <div>
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "transparent",
              border: "none",
              color: "#fff",
              fontSize: "1.5rem",
              cursor: "pointer",
            }}
          >
            ☰
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                top: "100%",
                right: 0,
                background: "#34495e",
                padding: "1rem",
                display: "flex",
                flexDirection: "column",
                gap: "1rem",
                minWidth: "180px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.2)",
              }}
            >
              {!user ? (
                <>
                  <InteractiveLink
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                  >
                    Login
                  </InteractiveLink>
                  <InteractiveLink
                    to="/register"
                    onClick={() => setMenuOpen(false)}
                  >
                    Register
                  </InteractiveLink>
                </>
              ) : (
                <>
                  <InteractiveLink
                    to="/dashboard"
                    onClick={() => setMenuOpen(false)}
                  >
                    Dashboard
                  </InteractiveLink>
                  {user.role === "Admin" && (
                    <>
                      <InteractiveLink
                        to="/classes"
                        onClick={() => setMenuOpen(false)}
                      >
                        Classes
                      </InteractiveLink>
                      <InteractiveLink
                        to="/sessions"
                        onClick={() => setMenuOpen(false)}
                      >
                        Sessions
                      </InteractiveLink>
                      <InteractiveLink
                        to="/audit-logs"
                        onClick={() => setMenuOpen(false)}
                      >
                        Audit Logs
                      </InteractiveLink>
                    </>
                  )}
                  <InteractiveLink
                    to="/bookings"
                    onClick={() => setMenuOpen(false)}
                  >
                    {user.role === "Admin" ? "All Bookings" : "All Bookings"}
                  </InteractiveLink>
                  <button
                    onClick={() => {
                      handleLogout();
                      setMenuOpen(false);
                    }}
                    style={{
                      background: "#e74c3c",
                      border: "none",
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 500,
                      transition: "all 0.2s ease-in-out",
                    }}
                    onMouseEnter={(e) =>
                      (e.currentTarget.style.background = "#c0392b")
                    }
                    onMouseLeave={(e) =>
                      (e.currentTarget.style.background = "#e74c3c")
                    }
                    onMouseDown={(e) =>
                      (e.currentTarget.style.transform = "scale(0.95)")
                    }
                    onMouseUp={(e) =>
                      (e.currentTarget.style.transform = "scale(1)")
                    }
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          )}
        </div>
      )}
    </nav>
  );
}
