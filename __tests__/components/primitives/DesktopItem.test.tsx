import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import DesktopItem from "@/components/sidebar/DesktopItem";

const Icon = ({ className }: { className?: string }) => (
  <svg data-testid="icon" className={className} />
);

describe("DesktopItem", () => {
  it("renders label and icon with href", () => {
    render(<DesktopItem label="Users" href="/users" icon={Icon} />);
    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", "/users");
    expect(screen.getByTestId("icon")).toBeInTheDocument();
  });

  it("applies active class when active", () => {
    render(<DesktopItem label="Users" href="/users" icon={Icon} active />);
    expect(screen.getByRole("link").className).toContain("bg-gray-100");
  });

  it("fires onClick on click", () => {
    const onClick = vi.fn();
    render(
      <DesktopItem label="Users" href="/users" icon={Icon} onClick={onClick} />
    );
    fireEvent.click(screen.getByRole("link"));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});
