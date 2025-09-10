import { render, screen, waitFor } from "@testing-library/react";
import DashboardPage from "@/app/dashboard/page";

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

describe("Dashboard Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () =>
        Promise.resolve({
          statusCounts: {
            Closed: 10,
            "Under Review": 15,
            "Work in Progress": 8,
            Rejected: 3,
            "Wrong Department": 2,
            "Problem Solved": 12,
          },
          ageGroupCounts: {
            "18-25": 5,
            "26-35": 12,
            "36-50": 18,
            "51-65": 8,
            "65+": 2,
          },
          departmentCounts: {
            "Water Supply": 15,
            "Garbage and Cleanliness": 10,
            "Property Tax": 8,
            "Police Department": 5,
          },
          totalTickets: 50,
        }),
    });
  });

  it("renders dashboard title", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders status cards", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Closed")).toBeInTheDocument();
      expect(screen.getByText("Under Review")).toBeInTheDocument();
      expect(screen.getByText("Work in Progress")).toBeInTheDocument();
      expect(screen.getByText("Rejected")).toBeInTheDocument();
      expect(screen.getByText("Wrong Department")).toBeInTheDocument();
      expect(screen.getByText("Problem Solved")).toBeInTheDocument();
    });
  });

  it("displays correct counts for status cards", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("10")).toBeInTheDocument(); // Closed
      expect(screen.getByText("15")).toBeInTheDocument(); // Under Review
      expect(screen.getByText("8")).toBeInTheDocument(); // Work in Progress
      expect(screen.getByText("3")).toBeInTheDocument(); // Rejected
      expect(screen.getByText("2")).toBeInTheDocument(); // Wrong Department
      expect(screen.getByText("12")).toBeInTheDocument(); // Problem Solved
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
      expect(screen.getByText("Department-wise Tickets")).toBeInTheDocument();
      expect(screen.getByText("Water Supply")).toBeInTheDocument();
      expect(screen.getByText("Garbage and Cleanliness")).toBeInTheDocument();
      expect(screen.getByText("Property Tax")).toBeInTheDocument();
      expect(screen.getByText("Police Department")).toBeInTheDocument();
    });
  });

  it("displays total tickets count", async () => {
    render(<DashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Total Tickets: 50")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    render(<DashboardPage />);

    expect(screen.getByText("Loading dashboard...")).toBeInTheDocument();
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
