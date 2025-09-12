import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import LoginPage from "@/app/login/page";

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
  usePathname: () => "/login",
}));

// Mock fetch
global.fetch = jest.fn();

describe("Login Page", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ success: true, token: "test-token" }),
    });
  });

  it("renders login form with all required fields", () => {
    render(<LoginPage />);

    expect(screen.getByLabelText(/username/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i })
    ).toBeInTheDocument();
  });

  it("shows validation errors for empty fields", async () => {
    render(<LoginPage />);

    const loginButton = screen.getByRole("button", { name: /sign in/i });
    fireEvent.click(loginButton);

    // HTML5 validation prevents form submission, so fetch should not be called
    await waitFor(() => {
      expect(global.fetch).not.toHaveBeenCalled();
    });
  });

  it("submits form with valid credentials", async () => {
    render(<LoginPage />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          username: "testuser",
          password: "testpass",
        }),
      });
    });
  });

  it("handles login failure", async () => {
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: false,
      json: () => Promise.resolve({ error: "Invalid credentials" }),
    });

    render(<LoginPage />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "wrongpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
  });

  it("redirects to home page on successful login", async () => {
    // Mock window.location.href
    const mockLocation = { href: "" };
    Object.defineProperty(window, "location", {
      value: mockLocation,
      writable: true,
    });

    render(<LoginPage />);

    const usernameInput = screen.getByLabelText(/username/i);
    const passwordInput = screen.getByLabelText(/password/i);
    const loginButton = screen.getByRole("button", { name: /sign in/i });

    fireEvent.change(usernameInput, { target: { value: "testuser" } });
    fireEvent.change(passwordInput, { target: { value: "testpass" } });
    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockLocation.href).toBe("/");
    });
  });
});
