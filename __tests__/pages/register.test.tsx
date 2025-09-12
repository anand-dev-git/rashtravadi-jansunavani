import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import RegisterPage from "@/app/register/page";

// Mock Next.js router
const mockPush = jest.fn();
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/register",
}));

// Mock AuthGuard component to render children directly
jest.mock("@/components/auth-guard", () => {
  return function MockAuthGuard({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
  };
});

// Mock fetch
global.fetch = jest.fn();

// Mock PDF generation
jest.mock("@/lib/pdf-generator", () => ({
  generateTicketPDF: jest.fn(),
  generatePrintableHTML: jest.fn(() => "<html>Mock HTML</html>"),
}));

// Mock translation dictionary
jest.mock("@/lib/translation-dictionary", () => ({
  getEnglishProblems: () => [
    "Water Supply",
    "Garbage and Cleanliness",
    "Property Tax",
  ],
  normalizeProblemForStorage: (problem: string) => problem,
}));

describe("Register Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ticketNumber: "JDW000001AP" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ok: true }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ success: true, messageId: "test-message-id" }),
      });
  });

  it("renders all form fields", () => {
    render(<RegisterPage />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/address/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/contact number/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/gender/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^age$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^problem$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/problem description/i)).toBeInTheDocument();
  });

  it("shows validation errors for required fields", async () => {
    render(<RegisterPage />);

    const submitButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(submitButton);

    // HTML5 validation should prevent form submission
    // Check that the form doesn't submit (no API calls made)
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("submits form with valid data", async () => {
    render(<RegisterPage />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "Test Address" },
    });
    fireEvent.change(screen.getByLabelText(/contact number/i), {
      target: { value: "9108455178" },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: "male" },
    });
    fireEvent.change(screen.getByLabelText(/^age$/i), {
      target: { value: "26-35" },
    });
    fireEvent.change(screen.getByLabelText(/^problem$/i), {
      target: { value: "Water Supply" },
    });
    fireEvent.change(screen.getByLabelText(/problem description/i), {
      target: { value: "Test problem description" },
    });

    const submitButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/ticket-number", {
        cache: "no-store",
      });
    });
  });

  it("shows member fields when aware of member is yes", () => {
    render(<RegisterPage />);

    const yesRadio = screen.getByLabelText(/yes/i);
    fireEvent.click(yesRadio);

    expect(screen.getByLabelText(/party member name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/party member contact/i)).toBeInTheDocument();
  });

  it("hides member fields when aware of member is no", () => {
    render(<RegisterPage />);

    const noRadio = screen.getByLabelText(/no/i);
    fireEvent.click(noRadio);

    expect(
      screen.queryByLabelText(/party member name/i)
    ).not.toBeInTheDocument();
    expect(
      screen.queryByLabelText(/party member contact/i)
    ).not.toBeInTheDocument();
  });

  it("shows success message after successful registration", async () => {
    render(<RegisterPage />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "Test Address" },
    });
    fireEvent.change(screen.getByLabelText(/contact number/i), {
      target: { value: "9108455178" },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: "male" },
    });
    fireEvent.change(screen.getByLabelText(/^age$/i), {
      target: { value: "26-35" },
    });
    fireEvent.change(screen.getByLabelText(/^problem$/i), {
      target: { value: "Water Supply" },
    });
    fireEvent.change(screen.getByLabelText(/problem description/i), {
      target: { value: "Test problem description" },
    });

    const submitButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/registration successful/i)).toBeInTheDocument();
    });
  });

  it.skip("handles form submission errors", async () => {
    // Clear previous mocks and set up error scenario
    jest.clearAllMocks();
    (global.fetch as jest.Mock)
      .mockResolvedValueOnce({
        ok: true,
        json: () => Promise.resolve({ ticketNumber: "JDW000001AP" }),
      })
      .mockResolvedValueOnce({
        ok: true,
        json: () =>
          Promise.resolve({ pdfUrl: "https://s3.example.com/test.pdf" }),
      })
      .mockResolvedValueOnce({
        ok: false,
        status: 500,
        json: () => Promise.resolve({ error: "Database error" }),
      });

    render(<RegisterPage />);

    // Fill in required fields
    fireEvent.change(screen.getByLabelText(/name/i), {
      target: { value: "Test User" },
    });
    fireEvent.change(screen.getByLabelText(/address/i), {
      target: { value: "Test Address" },
    });
    fireEvent.change(screen.getByLabelText(/contact number/i), {
      target: { value: "9108455178" },
    });
    fireEvent.change(screen.getByLabelText(/gender/i), {
      target: { value: "male" },
    });
    fireEvent.change(screen.getByLabelText(/^age$/i), {
      target: { value: "26-35" },
    });
    fireEvent.change(screen.getByLabelText(/^problem$/i), {
      target: { value: "Water Supply" },
    });
    fireEvent.change(screen.getByLabelText(/problem description/i), {
      target: { value: "Test problem description" },
    });

    // Verify all fields are filled correctly
    expect(screen.getByLabelText(/name/i)).toHaveValue("Test User");
    expect(screen.getByLabelText(/address/i)).toHaveValue("Test Address");
    expect(screen.getByLabelText(/contact number/i)).toHaveValue("9108455178");
    expect(screen.getByLabelText(/gender/i)).toHaveValue("male");
    expect(screen.getByLabelText(/^age$/i)).toHaveValue("26-35");
    expect(screen.getByLabelText(/^problem$/i)).toHaveValue("Water Supply");
    expect(screen.getByLabelText(/problem description/i)).toHaveValue(
      "Test problem description"
    );

    const submitButton = screen.getByRole("button", { name: /create/i });
    fireEvent.click(submitButton);

    // Wait for the error to appear
    await waitFor(
      () => {
        // Check if fetch was called
        expect(global.fetch).toHaveBeenCalled();
        expect(screen.getByText("Create failed: 500")).toBeInTheDocument();
      },
      { timeout: 10000 }
    );
  }, 15000);
});
