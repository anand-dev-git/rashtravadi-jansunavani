import { render, screen } from "@testing-library/react";
import Breadcrumb from "@/components/breadcrumb";

// Mock the usePathname hook
const mockUsePathname = jest.fn();
jest.mock("next/navigation", () => ({
  usePathname: () => mockUsePathname(),
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    prefetch: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    refresh: jest.fn(),
  }),
}));

describe("Breadcrumb Component", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("renders breadcrumb for dashboard page", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Breadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Dashboard")).toBeInTheDocument();
  });

  it("renders breadcrumb for register page", () => {
    mockUsePathname.mockReturnValue("/register");
    render(<Breadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Register")).toBeInTheDocument();
  });

  it("renders breadcrumb for update page", () => {
    mockUsePathname.mockReturnValue("/update");
    render(<Breadcrumb />);

    expect(screen.getByText("Home")).toBeInTheDocument();
    expect(screen.getByText("Update")).toBeInTheDocument();
  });

  it("has correct CSS classes for styling", () => {
    mockUsePathname.mockReturnValue("/dashboard");
    render(<Breadcrumb />);

    const breadcrumb = screen.getByRole("navigation");
    expect(breadcrumb).toHaveClass(
      "bg-white",
      "border-b",
      "border-gray-200",
      "w-full"
    );
  });
});
