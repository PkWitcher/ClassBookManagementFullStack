// src/pages/Classes.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getClasses, createClass } from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import type { Class } from "../types/index";

export default function Classes() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const {
    data: classes,
    isLoading,
    error,
  } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  const { mutate: create, isPending } = useMutation({
    mutationFn: (newClass: { name: string; description: string }) =>
      createClass(newClass),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      setName("");
      setDescription("");
      setIsCreating(false);
      showSuccess("Class Created", "New class has been created successfully!");
    },
    onError: (error) => {
      showError(
        "Class Creation Failed",
        `Failed to create class: ${error.message}`
      );
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      showError("Validation Error", "Class name is required");
      return;
    }
    create({ name: name.trim(), description: description.trim() });
  };

  if (isLoading)
    return (
      <div className="no-scroll-container">
        <div className="content-area">
          <div className="box-container">
            <div className="box-header">
              <h1 style={{ margin: 0, color: "#2c3e50" }}>Loading...</h1>
            </div>
          </div>
        </div>
      </div>
    );

  if (error)
    return (
      <div className="no-scroll-container">
        <div className="content-area">
          <div className="box-container">
            <div className="box-header">
              <h1 style={{ margin: 0, color: "#2c3e50" }}>Error</h1>
            </div>
            <div className="box-content">
              <p>Error loading classes: {error.message}</p>
            </div>
          </div>
        </div>
      </div>
    );

  return (
    <div className="no-scroll-container">
      <div className="content-area">
        <div
          className="box-container"
          style={{
            border: "2px solid rgba(52, 152, 219, 0.6)",
          }}
        >
          <div className="box-header">
            <h1 style={{ margin: 0, color: "#2c3e50" }}>
              📚 Classes Management
            </h1>
          </div>

          <div className="box-content">
            {/* Admin-only Create Class Form */}
            {user?.role === "Admin" && (
              <div style={{ marginBottom: "2rem" }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    marginBottom: "1rem",
                  }}
                >
                  <h2 style={{ color: "#2c3e50", margin: 0 }}>
                    Create New Class
                  </h2>
                  <button
                    onClick={() => setIsCreating(!isCreating)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      border: "none",
                      background: isCreating ? "#e74c3c" : "#3498db",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {isCreating ? "Cancel" : "Add New Class"}
                  </button>
                </div>

                {isCreating && (
                  <form
                    onSubmit={handleSubmit}
                    style={{
                      padding: "1.5rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      background: "#f8f9fa",
                    }}
                  >
                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        Class Name:
                      </label>
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        style={{
                          width: "100%",
                          padding: "0.5rem",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                        }}
                        placeholder="Enter class name"
                      />
                    </div>
                    <div style={{ marginBottom: "1rem" }}>
                      <label
                        style={{
                          display: "block",
                          marginBottom: "0.5rem",
                          fontWeight: "bold",
                        }}
                      >
                        Description:
                      </label>
                      <textarea
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        style={{
                          width: "100%",
                          border: "1px solid #ddd",
                          borderRadius: "4px",
                          minHeight: "100px",
                          resize: "vertical",
                          padding: "0.5rem",
                        }}
                        placeholder="Enter class description"
                      />
                    </div>
                    <button
                      type="submit"
                      disabled={isPending}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "none",
                        background: isPending ? "#ccc" : "#27ae60",
                        color: "#fff",
                        cursor: isPending ? "not-allowed" : "pointer",
                        fontWeight: 500,
                      }}
                    >
                      {isPending ? "Creating..." : "Create Class"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Classes List */}
            <div>
              <h2 style={{ color: "#2c3e50", marginBottom: "1rem" }}>
                {user?.role === "Admin" ? "All Classes" : "Available Classes"}
              </h2>

              <div className="scrollable-content">
                {classes && classes.length > 0 ? (
                  <div className="classes-grid">
                    {classes.map((cls) => (
                      <div key={cls.id} className="class-card">
                        <h3
                          style={{
                            color: "#2c3e50",
                            margin: "0 0 0.5rem 0",
                            fontSize: "1.2rem",
                          }}
                        >
                          {cls.name}
                        </h3>
                        <p
                          style={{
                            color: "#6c757d",
                            margin: 0,
                            lineHeight: 1.5,
                            flex: 1,
                          }}
                        >
                          {cls.description || "No description available."}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div
                    style={{
                      textAlign: "center",
                      padding: "2rem",
                      color: "#6c757d",
                    }}
                  >
                    <p>No classes available.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
