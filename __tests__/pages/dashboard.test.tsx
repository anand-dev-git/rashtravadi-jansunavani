import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

// Mock AuthGuard
jest.mock("@/components/auth-guard", () => {
  return function MockAuthGuard({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/dashboard",
}));

// Mock localStorage
Object.defineProperty(window, "localStorage", {
  value: {
    getItem: jest.fn(() => "test-token"),
    setItem: jest.fn(),
    removeItem: jest.fn(),
    clear: jest.fn(),
  },
  writable: true,
});

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          statusCounts: {
            "Under Review": 15,
            "Work in Progress": 8,
            Rejected: 3,
            "Wrong Department": 2,
            "Problem Solved": 12,
          },
          ageCounts: {
            "18-25": 5,
            "26-35": 12,
            "36-50": 18,
            "51-65": 8,
            "65+": 2,
            Other: 0,
          },
          departmentCounts: {
            "Water Supply": 15,
            "Garbage and Cleanliness": 10,
            "Property Tax": 8,
            "Police Department": 5,
          },
          totalTickets: 50,
          recentTickets: 10,
          resolvedTickets: 12,
          resolutionRate: "24.0",
        }),
    });
  });

  it("renders dashboard title", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
    });
  });

  it("renders status cards", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText("Under Review")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Work in Progress")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Rejected")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Wrong Department")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Problem Solved")[0]).toBeInTheDocument();
    });
  });

  it("displays correct counts for status cards", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText("15")[0]).toBeInTheDocument(); // Under Review
      expect(screen.getAllByText("8")[0]).toBeInTheDocument(); // Work in Progress
      expect(screen.getAllByText("3")[0]).toBeInTheDocument(); // Rejected
      expect(screen.getAllByText("2")[0]).toBeInTheDocument(); // Wrong Department
      expect(screen.getAllByText("12")[0]).toBeInTheDocument(); // Problem Solved
    });
  });

  it("renders age group section", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Tickets by Age Group")).toBeInTheDocument();
      expect(screen.getByText("18-25")).toBeInTheDocument();
      expect(screen.getByText("26-35")).toBeInTheDocument();
      expect(screen.getByText("36-50")).toBeInTheDocument();
      expect(screen.getByText("51-65")).toBeInTheDocument();
      expect(screen.getByText("65+")).toBeInTheDocument();
    });
  });

  it("renders department section", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Tickets by Department")).toBeInTheDocument();
      expect(screen.getAllByText("Water Supply")[0]).toBeInTheDocument();
      expect(
        screen.getAllByText("Garbage and Cleanliness")[0]
      ).toBeInTheDocument();
      expect(screen.getAllByText("Property Tax")[0]).toBeInTheDocument();
      expect(screen.getAllByText("Police Department")[0]).toBeInTheDocument();
    });
  });

  it("displays total tickets count", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("50")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
  });

  it("renders date range filter buttons", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("All Time")).toBeInTheDocument();
      expect(screen.getByText("Today")).toBeInTheDocument();
      expect(screen.getByText("2 Days")).toBeInTheDocument();
      expect(screen.getByText("5 Days")).toBeInTheDocument();
    });
  });

  it("shows current period label", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/Period:/)).toBeInTheDocument();
    });
  });

  it("handles API errors gracefully", async () => {
    (global.fetch as jest.Mock).mockRejectedValue(new Error("API Error"));

    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Error")).toBeInTheDocument();
      expect(screen.getByText("API Error")).toBeInTheDocument();
    });
  });
});
