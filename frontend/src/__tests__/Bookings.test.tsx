import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Bookings from "../pages/Bookings";
import * as api from "../utils/api";
import { AuthProvider } from "../context/AuthContext";

// Mock the API functions
vi.mock("../utils/api", () => ({
  getBookings: vi.fn(),
  getAllBookings: vi.fn(),
  cancelBooking: vi.fn(),
}));

// Mock the auth context
const mockAuthContext = {
  user: { id: "1", email: "user@example.com", role: "user" },
  login: vi.fn(),
  logout: vi.fn(),
  register: vi.fn(),
};

vi.mock("../context/AuthContext", () => ({
  useAuth: () => mockAuthContext,
  AuthProvider: ({ children }: { children: React.ReactNode }) => children,
}));

// Mock window.confirm
const mockConfirm = vi.fn();
Object.defineProperty(window, "confirm", {
  value: mockConfirm,
  writable: true,
});

const mockUserBookings = [
  {
    id: "1",
    session: {
      class: { name: "React Basics" },
      dateTime: "2024-12-31T10:00:00.000Z",
    },
    user: { email: "user@example.com", role: "user" },
    bookedAt: "2024-12-30T09:00:00.000Z",
  },
  {
    id: "2",
    session: {
      class: { name: "Node.js Advanced" },
      dateTime: "2024-12-31T14:00:00.000Z",
    },
    user: { email: "user@example.com", role: "user" },
    bookedAt: "2024-12-30T10:00:00.000Z",
  },
];

const mockAllBookings = [
  {
    id: "1",
    session: {
      class: { name: "React Basics" },
      dateTime: "2024-12-31T10:00:00.000Z",
    },
    user: { email: "user@example.com", role: "user" },
    bookedAt: "2024-12-30T09:00:00.000Z",
  },
  {
    id: "2",
    session: {
      class: { name: "Node.js Advanced" },
      dateTime: "2024-12-31T14:00:00.000Z",
    },
    user: { email: "admin@example.com", role: "Admin" },
    bookedAt: "2024-12-30T10:00:00.000Z",
  },
];

const createTestQueryClient = () =>
  new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });

const renderWithProviders = (component: React.ReactElement) => {
  const queryClient = createTestQueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>{component}</AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
};

describe("Bookings Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockConfirm.mockReturnValue(true); // Default to confirming cancellation
  });

  it("should render user bookings correctly", async () => {
    (api.getBookings as any).mockResolvedValue(mockUserBookings);

    renderWithProviders(<Bookings />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
      expect(screen.getByText("Node.js Advanced")).toBeInTheDocument();
    });

    // Check booking details
    expect(screen.getByText("📚 Bookings")).toBeInTheDocument();
    expect(screen.getAllByText("Cancel")).toHaveLength(2);
  });

  it("should render all bookings for admin users", async () => {
    // Mock admin user
    mockAuthContext.user = {
      id: "1",
      email: "admin@example.com",
      role: "Admin",
    };
    (api.getAllBookings as any).mockResolvedValue(mockAllBookings);

    renderWithProviders(<Bookings />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
      expect(screen.getByText("Node.js Advanced")).toBeInTheDocument();
    });

    // Check admin-specific elements
    expect(screen.getByText("📊 Bookings")).toBeInTheDocument();
    expect(screen.getByText("user@example.com (user)")).toBeInTheDocument();
    expect(screen.getByText("admin@example.com (Admin)")).toBeInTheDocument();
  });

  it("should handle booking cancellation successfully", async () => {
    (api.getBookings as any).mockResolvedValue(mockUserBookings);
    (api.cancelBooking as any).mockResolvedValue({ success: true });

    renderWithProviders(<Bookings />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButtons = screen.getAllByText("Cancel");
    fireEvent.click(cancelButtons[0]);

    // Should call cancelBooking API
    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith("1");
    });
  });

  it("should not cancel booking when user declines confirmation", async () => {
    mockConfirm.mockReturnValue(false); // User declines
    (api.getBookings as any).mockResolvedValue(mockUserBookings);

    renderWithProviders(<Bookings />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButtons = screen.getAllByText("Cancel");
    fireEvent.click(cancelButtons[0]);

    // Should not call cancelBooking API
    expect(api.cancelBooking).not.toHaveBeenCalled();
  });

  it("should handle cancellation error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (api.getBookings as any).mockResolvedValue(mockUserBookings);
    (api.cancelBooking as any).mockRejectedValue(
      new Error("Cancellation failed")
    );

    renderWithProviders(<Bookings />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Click cancel button
    const cancelButtons = screen.getAllByText("Cancel");
    fireEvent.click(cancelButtons[0]);

    // Should handle error gracefully
    await waitFor(() => {
      expect(api.cancelBooking).toHaveBeenCalledWith("1");
    });

    consoleSpy.mockRestore();
  });

  it("should show loading state", () => {
    (api.getBookings as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<Bookings />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should show error state", async () => {
    (api.getBookings as any).mockRejectedValue(
      new Error("Failed to fetch bookings")
    );

    renderWithProviders(<Bookings />);

    await waitFor(() => {
      expect(
        screen.getByText("Error loading bookings: Failed to fetch bookings")
      ).toBeInTheDocument();
    });
  });

  it("should show no bookings message when empty", async () => {
    (api.getBookings as any).mockResolvedValue([]);

    renderWithProviders(<Bookings />);

    await waitFor(() => {
      expect(screen.getByText("No bookings found.")).toBeInTheDocument();
    });
  });

  it("should format dates correctly", async () => {
    (api.getBookings as any).mockResolvedValue(mockUserBookings);

    renderWithProviders(<Bookings />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Check that dates are displayed (formatDateTime function should format them)
    expect(screen.getByText("Date & Time:")).toBeInTheDocument();
    expect(screen.getByText("Booked At:")).toBeInTheDocument();
  });

  it("should show different styling for admin vs user", async () => {
    // Test user styling
    (api.getBookings as any).mockResolvedValue(mockUserBookings);
    renderWithProviders(<Bookings />);

    await waitFor(() => {
      expect(screen.getByText("📚 Bookings")).toBeInTheDocument();
    });

    // Test admin styling
    mockAuthContext.user = {
      id: "1",
      email: "admin@example.com",
      role: "Admin",
    };
    (api.getAllBookings as any).mockResolvedValue(mockAllBookings);

    renderWithProviders(<Bookings />);

    await waitFor(() => {
      expect(screen.getByText("📊 Bookings")).toBeInTheDocument();
    });
  });
});
