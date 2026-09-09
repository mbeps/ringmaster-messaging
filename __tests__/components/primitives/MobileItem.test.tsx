import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MobileItem from "@/components/sidebar/MobileItem";

const Icon = ({ className }: { className?: string }) => (
  <svg data-testid="icon" className={className} />
);

describe("MobileItem", () => {
  it("renders link with href and icon", () => {
    render(<MobileItem href="/conversations" icon={Icon} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/conversations");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies active class when active", () => {
    render(<MobileItem href="/users" icon={Icon} active />);
    expect(screen.getByRole("link").className).toContain("bg-gray-100");
  });

  it("fires onClick on click", () => {
    const onClick = vi.fn();
    render(<MobileItem href="/users" icon={Icon} onClick={onClick} />);
    fireEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
