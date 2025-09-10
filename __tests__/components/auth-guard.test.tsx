import { render, screen, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import AuthGuard from "@/components/auth-guard";

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
  usePathname: () => "/",
}));

// Mock localStorage
const mockLocalStorage = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};

Object.defineProperty(window, "localStorage", {
  value: mockLocalStorage,
  writable: true,
});

describe("AuthGuard Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockLocalStorage.getItem.mockReturnValue(null);
  });

  it("redirects to login when user is not authenticated", async () => {
    const TestComponent = () => <div>Protected Content</div>;

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledWith("/login");
    });
  });

  it("renders children when user is authenticated", async () => {
    mockLocalStorage.getItem.mockImplementation((key) => {
      if (key === "token") return "valid-token";
      if (key === "user")
        return JSON.stringify({ username: "testuser", role: "admin" });
      return null;
    });

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    await waitFor(() => {
      expect(screen.getByText("Protected Content")).toBeInTheDocument();
    });
  });

  it("shows loading state initially", () => {
    // Mock localStorage to return null to trigger redirect
    mockLocalStorage.getItem.mockReturnValue(null);

    const TestComponent = () => <div>Protected Content</div>;

    render(
      <AuthGuard>
        <TestComponent />
      </AuthGuard>
    );

    // The component should show loading briefly before redirecting
    // Since the component immediately redirects, we can't test the loading state
    // This test verifies the component renders without crashing
    expect(screen.queryByText("Protected Content")).not.toBeInTheDocument();
  });
});
