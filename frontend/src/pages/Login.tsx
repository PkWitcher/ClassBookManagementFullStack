// src/pages/Login.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
// Background image moved to public folder for Vercel deployment
const bgImg = "/img3.jpg";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const { login } = useAuth();
  const { showSuccess, showError } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    try {
      await login(email, password);
      showSuccess(
        "Login Successful",
        "Welcome back! You have been logged in successfully."
      );
      navigate("/");
    } catch (err: any) {
      const errorMessage = "Invalid email or password. Please try again.";
      setError(errorMessage);
      showError("Login Failed", errorMessage);
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div
      className="no-scroll-container"
      style={{
        backgroundImage: `url(${bgImg})`,
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundSize: "cover",
        padding: "1rem",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          height: "100%",
          width: "100%",
        }}
      >
        <form
          onSubmit={handleSubmit}
          style={{
            width: "100%",
            maxWidth: "350px",
            background: "rgba(255, 255, 255, 0.9)",
            padding: "2rem",
            borderRadius: "12px",
            boxShadow: "0 4px 12px rgba(0,0,0,0.2)",
            display: "flex",
            flexDirection: "column",
            gap: "1rem",
          }}
        >
          <h2
            style={{
              textAlign: "center",
              marginBottom: "1rem",
              color: "#2c3e50",
              fontSize: "1.5rem",
            }}
          >
            Login
          </h2>

          {error && (
            <p
              style={{ color: "red", textAlign: "center", fontSize: "0.9rem" }}
            >
              {error}
            </p>
          )}

          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Email"
            required
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "1px solid #ccc",
              outline: "none",
              fontSize: "1rem",
              width: "100%",
              boxSizing: "border-box",
            }}
          />

          <div style={{ position: "relative" }}>
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Password"
              required
              style={{
                padding: "0.75rem",
                borderRadius: "8px",
                border: "1px solid #ccc",
                outline: "none",
                fontSize: "1rem",
                width: "100%",
                boxSizing: "border-box",
                paddingRight: "2.5rem",
              }}
            />
            <button
              type="button"
              onClick={togglePasswordVisibility}
              style={{
                position: "absolute",
                right: "0.5rem",
                top: "50%",
                transform: "translateY(-50%)",
                background: "none",
                border: "none",
                cursor: "pointer",
                fontSize: "1rem",
                color: "#666",
                padding: "0.25rem",
              }}
            >
              {showPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>

          <button
            type="submit"
            style={{
              padding: "0.75rem",
              borderRadius: "8px",
              border: "none",
              background: "#3498db",
              color: "#fff",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "500",
              transition: "background 0.2s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#2980b9";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#3498db";
            }}
          >
            Login
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <p style={{ margin: "0", fontSize: "0.9rem", color: "#666" }}>
              Don't have an account?{" "}
              <a
                href="/register"
                style={{
                  color: "#3498db",
                  textDecoration: "none",
                  fontWeight: "500",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.textDecoration = "underline";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.textDecoration = "none";
                }}
              >
                Register here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
