// src/utils/api.ts
import type { User, Class, Session, Booking } from "../types";

const API_URL = "https://classbookmanagementfullstack.onrender.com";
//const API_URL = "http://localhost:5000";

// Generic fetch wrapper
async function apiFetch<T>(
  endpoint: string,
  options?: RequestInit
): Promise<T> {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options?.headers,
    },
    // Only include credentials if backend uses cookies
    // credentials: 'include',
  });

  if (!res.ok) {
    const errorText = await res.text();
    try {
      const errorData = JSON.parse(errorText);
      if (errorData.error && errorData.error.message) {
        throw new Error(errorData.error.message);
      } else {
        throw new Error(`Request failed: ${res.status}`);
      }
    } catch (parseError) {
      // If JSON parsing fails, use the text as error message
      throw new Error(errorText || `Request failed: ${res.status}`);
    }
  }

  return res.json();
}

//
// ---------- AUTH ----------
//
export async function login(
  email: string,
  password: string
): Promise<{ token: string; user: User }> {
  return apiFetch("/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

export async function register(email: string, password: string): Promise<User> {
  return apiFetch("/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
}

//
// ---------- CLASSES ----------
//
export async function getClasses(): Promise<Class[]> {
  return apiFetch("/classes");
}

export async function createClass(newClass: {
  name: string;
  description: string;
}): Promise<Class> {
  return apiFetch("/classes", {
    method: "POST",
    body: JSON.stringify(newClass),
  });
}

//
// ---------- SESSIONS ----------
//
export async function getSessions(): Promise<Session[]> {
  return apiFetch("/sessions");
}

export async function createSession(newSession: {
  classId: string;
  dateTime: string;
  capacity: number;
}): Promise<Session> {
  return apiFetch("/sessions", {
    method: "POST",
    body: JSON.stringify(newSession),
  });
}

export async function bookSession(sessionId: string): Promise<Booking> {
  return apiFetch(`/sessions/${sessionId}/book`, {
    method: "POST",
  });
}

//
// ---------- BOOKINGS ----------
//
export async function getBookings(): Promise<Booking[]> {
  return apiFetch("/bookings");
}

export async function cancelBooking(
  bookingId: string
): Promise<{ success: boolean }> {
  return apiFetch(`/bookings/${bookingId}`, {
    method: "DELETE",
  });
}

//
// ---------- ALL BOOKINGS (ADMIN) ----------
//
export async function getAllBookings(): Promise<any[]> {
  return apiFetch("/bookings/all");
}

//
// ---------- AUDIT LOGS ----------
//
export async function getAuditLogs(): Promise<any[]> {
  return apiFetch("/audit-logs");
}
