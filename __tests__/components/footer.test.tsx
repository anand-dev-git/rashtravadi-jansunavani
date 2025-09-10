import { render, screen } from "@testing-library/react";
import Footer from "@/components/footer";

describe("Footer Component", () => {
  it("renders the footer content", () => {
    render(<Footer />);

    expect(screen.getByText(/Rashtrawadi Jansunavani/)).toBeInTheDocument();
  });

  it("has correct CSS classes for styling", () => {
    render(<Footer />);

    const footer = screen.getByRole("contentinfo");
    expect(footer).toHaveClass("border-t", "border-gray-200", "bg-white/70");
  });

  it("displays the current year", () => {
    render(<Footer />);

    const currentYear = new Date().getFullYear();
    expect(
      screen.getByText(`© ${currentYear} Rashtrawadi Jansunavani`)
    ).toBeInTheDocument();
  });
});
