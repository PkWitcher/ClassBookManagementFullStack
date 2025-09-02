// src/pages/Sessions.tsx
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getClasses,
  getSessions,
  createSession,
  bookSession,
} from "../utils/api";
import { useAuth } from "../context/AuthContext";
import { useNotification } from "../context/NotificationContext";
import { formatDateTime } from "../utils/dateUtils";
import type { Class, Session } from "../types/index";

export default function Sessions() {
  const { user } = useAuth();
  const { showSuccess, showError } = useNotification();
  const [classId, setClassId] = useState("");
  const [dateTime, setDateTime] = useState("");
  const [capacity, setCapacity] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  const queryClient = useQueryClient();

  const { data: classes } = useQuery<Class[]>({
    queryKey: ["classes"],
    queryFn: getClasses,
  });

  const {
    data: sessions,
    isLoading,
    error,
  } = useQuery<Session[]>({
    queryKey: ["sessions"],
    queryFn: getSessions,
  });

  const { mutate: create, isPending: isCreatingSession } = useMutation({
    mutationFn: createSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      setClassId("");
      setDateTime("");
      setCapacity("");
      setIsCreating(false);
      showSuccess(
        "Session Created",
        "New session has been created successfully!"
      );
    },
    onError: (error) => {
      showError(
        "Session Creation Failed",
        `Failed to create session: ${error.message}`
      );
    },
  });

  const { mutate: book, isPending: isBooking } = useMutation({
    mutationFn: bookSession,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["sessions"] });
      queryClient.invalidateQueries({ queryKey: ["bookings"] });
      showSuccess(
        "Booking Successful",
        "You have successfully booked the session!"
      );
    },
    onError: (error) => {
      showError("Booking Failed", `Failed to book session: ${error.message}`);
    },
  });

  const handleCreateSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!classId || !dateTime || !capacity) {
      alert("All fields are required");
      return;
    }
    create({
      classId: classId, // Keep as string
      dateTime,
      capacity: Number(capacity),
    });
  };

  const handleBookSession = (sessionId: string) => {
    book(sessionId);
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
              <p>Error loading sessions: {error.message}</p>
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
            border: "2px solid rgba(231, 76, 60, 0.6)",
          }}
        >
          <div className="box-header">
            <h1 style={{ margin: 0, color: "#2c3e50" }}>
              📅 Sessions Management
            </h1>
          </div>

          <div className="box-content">
            {/* Admin-only Create Session Form */}
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
                    Create New Session
                  </h2>
                  <button
                    onClick={() => setIsCreating(!isCreating)}
                    style={{
                      padding: "0.5rem 1rem",
                      borderRadius: "6px",
                      border: "none",
                      background: isCreating ? "#e74c3c" : "#e67e22",
                      color: "#fff",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {isCreating ? "Cancel" : "Add New Session"}
                  </button>
                </div>

                {isCreating && (
                  <form
                    onSubmit={handleCreateSession}
                    style={{
                      padding: "1.5rem",
                      border: "1px solid #ddd",
                      borderRadius: "8px",
                      background: "#f8f9fa",
                    }}
                  >
                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns:
                          "repeat(auto-fit, minmax(200px, 1fr))",
                        gap: "1rem",
                        marginBottom: "1rem",
                      }}
                    >
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          Class:
                        </label>
                        <select
                          value={classId}
                          onChange={(e) => setClassId(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                          required
                        >
                          <option value="">Select a class</option>
                          {classes?.map((cls) => (
                            <option key={cls.id} value={cls.id}>
                              {cls.name}
                            </option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          Date & Time:
                        </label>
                        <input
                          type="datetime-local"
                          value={dateTime}
                          onChange={(e) => setDateTime(e.target.value)}
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                          required
                        />
                      </div>
                      <div>
                        <label
                          style={{
                            display: "block",
                            marginBottom: "0.5rem",
                            fontWeight: "bold",
                          }}
                        >
                          Capacity:
                        </label>
                        <input
                          type="number"
                          value={capacity}
                          onChange={(e) => setCapacity(e.target.value)}
                          min="1"
                          style={{
                            width: "100%",
                            padding: "0.5rem",
                            border: "1px solid #ddd",
                            borderRadius: "4px",
                          }}
                          required
                        />
                      </div>
                    </div>
                    <button
                      type="submit"
                      disabled={isCreatingSession}
                      style={{
                        padding: "0.5rem 1rem",
                        borderRadius: "6px",
                        border: "none",
                        background: isCreatingSession ? "#ccc" : "#e67e22",
                        color: "#fff",
                        cursor: isCreatingSession ? "not-allowed" : "pointer",
                        fontWeight: 500,
                      }}
                    >
                      {isCreatingSession ? "Creating..." : "Create Session"}
                    </button>
                  </form>
                )}
              </div>
            )}

            {/* Sessions List */}
            <div>
              <h2 style={{ color: "#2c3e50", marginBottom: "1rem" }}>
                {user?.role === "Admin" ? "All Sessions" : "Available Sessions"}
              </h2>

              <div className="scrollable-content">
                {sessions && sessions.length > 0 ? (
                  <div style={{ display: "grid", gap: "1rem" }}>
                    {sessions.map((session) => (
                      <div
                        key={session.id}
                        style={{
                          padding: "1.5rem",
                          border: "1px solid #e9ecef",
                          borderRadius: "8px",
                          background: "#f8f9fa",
                          transition: "all 0.2s ease-in-out",
                        }}
                      >
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "flex-start",
                          }}
                        >
                          <div style={{ flex: 1 }}>
                            <h3
                              style={{
                                color: "#2c3e50",
                                margin: "0 0 0.5rem 0",
                                fontSize: "1.2rem",
                              }}
                            >
                              {session.class.name}
                            </h3>

                            <div
                              style={{
                                display: "grid",
                                gridTemplateColumns:
                                  "repeat(auto-fit, minmax(200px, 1fr))",
                                gap: "1rem",
                              }}
                            >
                              <div>
                                <strong>Date & Time:</strong>
                                <br />
                                {formatDateTime(session.dateTime)}
                              </div>
                              <div>
                                <strong>Capacity:</strong>
                                <br />
                                {session.bookedSeats}/{session.capacity}
                              </div>
                              <div>
                                <strong>Status:</strong>
                                <br />
                                <span
                                  style={{
                                    padding: "0.25rem 0.5rem",
                                    borderRadius: "4px",
                                    fontSize: "0.8rem",
                                    background:
                                      session.bookedSeats >= session.capacity
                                        ? "#e74c3c"
                                        : "#27ae60",
                                    color: "#fff",
                                  }}
                                >
                                  {session.bookedSeats >= session.capacity
                                    ? "Full"
                                    : "Available"}
                                </span>
                              </div>
                            </div>
                          </div>

                          {user?.role !== "Admin" && (
                            <button
                              onClick={() => handleBookSession(session.id)}
                              disabled={
                                session.bookedSeats >= session.capacity ||
                                isBooking
                              }
                              style={{
                                padding: "0.5rem 1rem",
                                borderRadius: "6px",
                                border: "none",
                                cursor:
                                  session.bookedSeats >= session.capacity ||
                                  isBooking
                                    ? "not-allowed"
                                    : "pointer",
                                background:
                                  session.bookedSeats >= session.capacity ||
                                  isBooking
                                    ? "#ccc"
                                    : "#e67e22",
                                color: "#fff",
                                fontWeight: 500,
                                transition: "all 0.2s ease-in-out",
                                whiteSpace: "nowrap",
                              }}
                              onMouseEnter={(e) => {
                                if (
                                  !(
                                    session.bookedSeats >= session.capacity ||
                                    isBooking
                                  )
                                ) {
                                  e.currentTarget.style.background = "#d35400";
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (
                                  !(
                                    session.bookedSeats >= session.capacity ||
                                    isBooking
                                  )
                                ) {
                                  e.currentTarget.style.background = "#e67e22";
                                }
                              }}
                            >
                              {session.bookedSeats >= session.capacity
                                ? "Full"
                                : isBooking
                                ? "Booking..."
                                : "Book"}
                            </button>
                          )}
                        </div>
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
                    <p>No sessions available.</p>
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
