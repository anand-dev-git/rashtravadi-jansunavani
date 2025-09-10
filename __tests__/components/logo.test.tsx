import { render, screen } from "@testing-library/react";
import Logo from "@/components/logo";

describe("Logo Component", () => {
  it("renders the logo image with correct attributes", () => {
    render(<Logo width={40} height={40} />);

    const logoImage = screen.getByRole("img");
    expect(logoImage).toBeInTheDocument();
    expect(logoImage).toHaveAttribute("src", "/logo.png");
    expect(logoImage).toHaveAttribute("alt", "Rashtrawadi Jansunavani logo");
    expect(logoImage).toHaveAttribute("width", "40");
    expect(logoImage).toHaveAttribute("height", "40");
  });

  it("has correct CSS classes", () => {
    render(<Logo width={40} height={40} />);

    const logoImage = screen.getByRole("img");
    expect(logoImage).toHaveClass("rounded-md");
  });
});
