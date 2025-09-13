import { render, screen } from "@testing-library/react";
import Header from "@/components/header";

// Mock the useRouter hook
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
  usePathname: () => "/",
}));

describe("Header Component", () => {
  beforeEach(() => {
    // Mock localStorage
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn(() => null),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it("renders the logo and title", () => {
    render(<Header />);

    expect(screen.getByRole("img")).toBeInTheDocument();
    expect(screen.getByText("JanSamwad")).toBeInTheDocument();
  });

  it("renders login button when user is not logged in", () => {
    render(<Header />);

    expect(screen.getByText("Login")).toBeInTheDocument();
  });

  it("renders user info and logout button when user is logged in", () => {
    // Mock logged in user
    Object.defineProperty(window, "localStorage", {
      value: {
        getItem: jest.fn((key) => {
          if (key === "user")
            return JSON.stringify({ username: "testuser", role: "admin" });
          if (key === "token") return "test-token";
          return null;
        }),
        setItem: jest.fn(),
        removeItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    render(<Header />);

    expect(screen.getByText(/testuser/)).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("has correct CSS classes for styling", () => {
    render(<Header />);

    const header = screen.getByRole("banner");
    expect(header).toHaveClass(
      "w-full",
      "border-b",
      "border-gray-200",
      "bg-pink-600/70",
      "backdrop-blur",
      "sticky",
      "top-0",
      "z-10"
    );
  });
});
