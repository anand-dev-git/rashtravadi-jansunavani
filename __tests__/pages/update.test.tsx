import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import UpdatePage from "@/app/update/page";

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

describe("Update Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders search form", () => {
    render(<UpdatePage />);

    expect(screen.getByLabelText(/ticket number/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /search/i })).toBeInTheDocument();
  });

  it("shows validation error for empty ticket number", async () => {
    render(<UpdatePage />);

    const searchButton = screen.getByRole("button", { name: /search/i });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Ticket number is required")).toBeInTheDocument();
    });
  });

  it("searches for ticket with valid number", async () => {
    const mockTicketData = {
      ticketNumber: "JD000001AP",
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

    const ticketInput = screen.getByLabelText(/ticket number/i);
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(ticketInput, { target: { value: "JD000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/complaint-records/JD000001AP"
      );
    });
  });

  it("displays ticket details after successful search", async () => {
    const mockTicketData = {
      ticketNumber: "JD000001AP",
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

    const ticketInput = screen.getByLabelText(/ticket number/i);
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(ticketInput, { target: { value: "JD000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
      expect(screen.getByText("Test Address")).toBeInTheDocument();
      expect(screen.getByText("Under Review")).toBeInTheDocument();
    });
  });

  it("shows error message when ticket not found", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Ticket not found" }),
    });

    render(<UpdatePage />);

    const ticketInput = screen.getByLabelText(/ticket number/i);
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(ticketInput, { target: { value: "JD000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Ticket not found")).toBeInTheDocument();
    });
  });

  it("updates ticket when update form is submitted", async () => {
    const mockTicketData = {
      ticketNumber: "JD000001AP",
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
    const ticketInput = screen.getByLabelText(/ticket number/i);
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(ticketInput, { target: { value: "JD000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Update the ticket
    const statusSelect = screen.getByLabelText(/status/i);
    const remarksInput = screen.getByLabelText(/remarks/i);
    const updateButton = screen.getByRole("button", { name: /update/i });

    fireEvent.change(statusSelect, { target: { value: "Closed" } });
    fireEvent.change(remarksInput, { target: { value: "Updated remarks" } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/complaint-records/JD000001AP",
        {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: "Closed",
            remarks: "Updated remarks",
            dbEmployeeName: "Test Member",
          }),
        }
      );
    });
  });

  it("shows success message after successful update", async () => {
    const mockTicketData = {
      ticketNumber: "JD000001AP",
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
    const ticketInput = screen.getByLabelText(/ticket number/i);
    const searchButton = screen.getByRole("button", { name: /search/i });

    fireEvent.change(ticketInput, { target: { value: "JD000001AP" } });
    fireEvent.click(searchButton);

    await waitFor(() => {
      expect(screen.getByText("Test User")).toBeInTheDocument();
    });

    // Update the ticket
    const statusSelect = screen.getByLabelText(/status/i);
    const remarksInput = screen.getByLabelText(/remarks/i);
    const updateButton = screen.getByRole("button", { name: /update/i });

    fireEvent.change(statusSelect, { target: { value: "Closed" } });
    fireEvent.change(remarksInput, { target: { value: "Updated remarks" } });
    fireEvent.click(updateButton);

    await waitFor(() => {
      expect(
        screen.getByText(/ticket updated successfully/i)
      ).toBeInTheDocument();
    });
  });
});
