// src/pages/Register.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
// Background image moved to public folder for Vercel deployment
const bgImg = "/bgImg.webp";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false); // <-- Added loading state
  const { register } = useAuth();
  const { showSuccess, showError, showInfo } = useNotification();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");
    setLoading(true); // <-- Start loading

    // Log what will be sent
    console.log("Registering with:", { email, password });

    try {
      await register(email, password);
      setSuccess("Registration successful! Redirecting to login...");
      showSuccess(
        "Registration Successful",
        "Your account has been created successfully! Redirecting to login..."
      );
      // Redirect to login page after 2 seconds
      setTimeout(() => {
        navigate("/login");
      }, 2000);
    } catch (err: any) {
      // Check if user already exists
      if (err?.message?.includes("User already exists")) {
        const errorMessage = "User already exists. Please login instead.";
        setError(errorMessage);
        showError("Registration Failed", errorMessage);
        showInfo(
          "Redirecting to Login",
          "You will be redirected to the login page."
        );
        // Redirect to login page after 2 seconds
        setTimeout(() => {
          navigate("/login");
        }, 2000);
      } else {
        const errorMessage =
          err?.message || "Registration failed. Please try again.";
        setError(errorMessage);
        showError("Registration Failed", errorMessage);
      }
    } finally {
      setLoading(false); // <-- Stop loading
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
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
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
            boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
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
            Register
          </h2>

          {error && (
            <p
              style={{ color: "red", textAlign: "center", fontSize: "0.9rem" }}
            >
              {error}
            </p>
          )}

          {success && (
            <p
              style={{
                color: "#27ae60",
                textAlign: "center",
                fontSize: "0.9rem",
              }}
            >
              {success}
            </p>
          )}

          {loading && (
            <p style={{ color: "#27ae60", textAlign: "center" }}>Loading...</p>
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
            disabled={loading}
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
              disabled={loading}
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
              disabled={loading}
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
              background: "#27ae60",
              color: "#fff",
              fontSize: "1rem",
              cursor: "pointer",
              fontWeight: "500",
              transition: "background 0.2s ease",
              opacity: loading ? 0.7 : 1,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "#1e8449";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "#27ae60";
            }}
            disabled={loading}
          >
            Register
          </button>

          <div style={{ textAlign: "center", marginTop: "1rem" }}>
            <p style={{ margin: "0", fontSize: "0.9rem", color: "#666" }}>
              Already have an account?{" "}
              <a
                href="/login"
                style={{
                  color: "#27ae60",
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
                Login here
              </a>
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
