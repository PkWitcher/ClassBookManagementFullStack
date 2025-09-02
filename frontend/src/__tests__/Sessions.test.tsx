import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter } from "react-router-dom";
import Sessions from "../pages/Sessions";
import * as api from "../utils/api";
import { AuthProvider } from "../context/AuthContext";

// Mock the API functions
vi.mock("../utils/api", () => ({
  getClasses: vi.fn(),
  getSessions: vi.fn(),
  createSession: vi.fn(),
  bookSession: vi.fn(),
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

const mockClasses = [
  { id: "1", name: "React Basics", description: "Learn React fundamentals" },
  {
    id: "2",
    name: "Node.js Advanced",
    description: "Advanced Node.js concepts",
  },
];

const mockSessions = [
  {
    id: "1",
    class: { name: "React Basics" },
    dateTime: "2024-12-31T10:00:00.000Z",
    capacity: 10,
    bookedSeats: 3,
    availableSeats: 7,
  },
  {
    id: "2",
    class: { name: "Node.js Advanced" },
    dateTime: "2024-12-31T14:00:00.000Z",
    capacity: 5,
    bookedSeats: 5,
    availableSeats: 0,
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

describe("Sessions Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (api.getClasses as any).mockResolvedValue(mockClasses);
    (api.getSessions as any).mockResolvedValue(mockSessions);
  });

  it("should render sessions list correctly", async () => {
    renderWithProviders(<Sessions />);

    // Wait for data to load
    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
      expect(screen.getByText("Node.js Advanced")).toBeInTheDocument();
    });

    // Check session details
    expect(screen.getByText("3/10")).toBeInTheDocument(); // Available seats
    expect(screen.getByText("5/5")).toBeInTheDocument(); // Full session
    expect(screen.getByText("Available")).toBeInTheDocument();
    expect(screen.getByText("Full")).toBeInTheDocument();
  });

  it("should render book button for available sessions", async () => {
    renderWithProviders(<Sessions />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Should have book button for available session
    const bookButtons = screen.getAllByText("Book");
    expect(bookButtons).toHaveLength(1); // Only one available session
  });

  it("should render full button for capacity reached sessions", async () => {
    renderWithProviders(<Sessions />);

    await waitFor(() => {
      expect(screen.getByText("Node.js Advanced")).toBeInTheDocument();
    });

    // Should have full button for capacity reached session
    const fullButtons = screen.getAllByText("Full");
    expect(fullButtons).toHaveLength(1);
  });

  it("should handle booking success", async () => {
    (api.bookSession as any).mockResolvedValue({ id: "booking-1" });

    renderWithProviders(<Sessions />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Click book button
    const bookButton = screen.getByText("Book");
    fireEvent.click(bookButton);

    // Wait for booking to complete
    await waitFor(() => {
      expect(api.bookSession).toHaveBeenCalledWith("1");
    });
  });

  it("should handle booking error", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    (api.bookSession as any).mockRejectedValue(new Error("Booking failed"));

    // Mock alert
    const alertSpy = vi.spyOn(window, "alert").mockImplementation(() => {});

    renderWithProviders(<Sessions />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Click book button
    const bookButton = screen.getByText("Book");
    fireEvent.click(bookButton);

    // Wait for error handling
    await waitFor(() => {
      expect(alertSpy).toHaveBeenCalledWith(
        "Failed to book session: Booking failed"
      );
    });

    consoleSpy.mockRestore();
    alertSpy.mockRestore();
  });

  it("should not show create session form for regular users", async () => {
    renderWithProviders(<Sessions />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Should not show admin-only create session form
    expect(screen.queryByText("Create New Session")).not.toBeInTheDocument();
    expect(screen.queryByText("Add New Session")).not.toBeInTheDocument();
  });

  it("should show create session form for admin users", async () => {
    // Mock admin user
    mockAuthContext.user = {
      id: "1",
      email: "admin@example.com",
      role: "Admin",
    };

    renderWithProviders(<Sessions />);

    await waitFor(() => {
      expect(screen.getByText("React Basics")).toBeInTheDocument();
    });

    // Should show admin create session form
    expect(screen.getByText("Create New Session")).toBeInTheDocument();
    expect(screen.getByText("Add New Session")).toBeInTheDocument();
  });

  it("should handle loading state", () => {
    (api.getSessions as any).mockImplementation(() => new Promise(() => {})); // Never resolves

    renderWithProviders(<Sessions />);

    expect(screen.getByText("Loading...")).toBeInTheDocument();
  });

  it("should handle error state", async () => {
    (api.getSessions as any).mockRejectedValue(
      new Error("Failed to fetch sessions")
    );

    renderWithProviders(<Sessions />);

    await waitFor(() => {
      expect(
        screen.getByText("Error loading sessions: Failed to fetch sessions")
      ).toBeInTheDocument();
    });
  });

  it("should show no sessions message when empty", async () => {
    (api.getSessions as any).mockResolvedValue([]);

    renderWithProviders(<Sessions />);

    await waitFor(() => {
      expect(screen.getByText("No sessions available.")).toBeInTheDocument();
    });
  });
});
