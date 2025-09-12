import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdatePage from "@/app/update/page";

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
  usePathname: () => "/update",
}));

// Mock window.alert
global.alert = jest.fn();

describe("Update Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search form", () => {
    render(<UpdatePage />);

    expect(
      screen.getByPlaceholderText(/enter ticket number/i)
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /submit/i })).toBeInTheDocument();
  });

  it("shows validation error for empty ticket number", async () => {
    render(<UpdatePage />);

    const searchButton = screen.getByRole("button", { name: /submit/i });
    fireEvent.click(searchButton);

    // HTML5 validation prevents form submission, so fetch should not be called
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("searches for ticket with valid number", async () => {
    const mockTicketData = {
      ticketNumber: "JDW000001AP",
      name: "Test User",
      address: "Test Address",
      status: "Under Review",
      remarks: "Test remarks",
      memberName: "Test Member",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTicketData),
    });

    render(<UpdatePage />);

    const ticketInput = screen.getByPlaceholderText(/enter ticket number/i);
    const searchButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(ticketInput, { target: { value: "JDW000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/complaint-records/JDW000001AP",
        { cache: "no-store" }
      );
    });
  });

  it("displays ticket details after successful search", async () => {
    const mockTicketData = {
      ticketNumber: "JDW000001AP",
      name: "Test User",
      address: "Test Address",
      status: "Under Review",
      remarks: "Test remarks",
      memberName: "Test Member",
    };

    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve(mockTicketData),
    });

    render(<UpdatePage />);

    const ticketInput = screen.getByPlaceholderText(/enter ticket number/i);
    const searchButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(ticketInput, { target: { value: "JDW000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("Test Address")).toBeInTheDocument();
      expect(screen.getByText("Under Review")).toBeInTheDocument();
    });
  });

  it("shows error message when ticket not found", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      status: 404,
      ok: false,
    });

    render(<UpdatePage />);

    const ticketInput = screen.getByPlaceholderText(/enter ticket number/i);
    const searchButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(ticketInput, { target: { value: "JDW000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });
  });

  it("updates ticket when update form is submitted", async () => {
    const mockTicketData = {
      ticketNumber: "JDW000001AP",
      name: "Test User",
      address: "Test Address",
      status: "Under Review",
      remarks: "Test remarks",
      memberName: "Test Member",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTicketData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<UpdatePage />);

    // Search for ticket first
    const ticketInput = screen.getByPlaceholderText(/enter ticket number/i);
    const searchButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(ticketInput, { target: { value: "JDW000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Update the ticket
    const statusSelect = screen.getByLabelText(/status/i);
    const remarksInput = screen.getByLabelText(/remarks/i);
    const updateButton = screen.getByRole("button", { name: /update/i });

    fireEvent.change(statusSelect, { target: { value: "Problem Solved" } });
    fireEvent.change(remarksInput, { target: { value: "Updated remarks" } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/complaint-records/JDW000001AP",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Problem Solved",
            remarks: "Updated remarks",
            dbEmp: null,
            complaintSource: "Web",
          }),
        }
      );
    });
  });

  it("shows success message after successful update", async () => {
    const mockTicketData = {
      ticketNumber: "JDW000001AP",
      name: "Test User",
      address: "Test Address",
      status: "Under Review",
      remarks: "Test remarks",
      memberName: "Test Member",
    };

    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve(mockTicketData),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ success: true }),
      });

    render(<UpdatePage />);

    // Search for ticket first
    const ticketInput = screen.getByPlaceholderText(/enter ticket number/i);
    const searchButton = screen.getByRole("button", { name: /submit/i });

    fireEvent.change(ticketInput, { target: { value: "JDW000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Update the ticket
    const statusSelect = screen.getByLabelText(/status/i);
    const remarksInput = screen.getByLabelText(/remarks/i);
    const updateButton = screen.getByRole("button", { name: /update/i });

    fireEvent.change(statusSelect, { target: { value: "Problem Solved" } });
    fireEvent.change(remarksInput, { target: { value: "Updated remarks" } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(global.alert).toHaveBeenCalledWith("Ticket updated successfully!");
    });
  });
});
