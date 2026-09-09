import { render, screen, fireEvent } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Button from "@/components/Button";

describe("Button", () => {
  it("renders children", () => {
    render(<Button>Click me</Button>);
    expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
  });

  it("applies danger variant class", () => {
    render(<Button danger>Danger</Button>);
    expect(screen.getByRole("button").className).toContain("bg-rose-800");
  });

  it("applies secondary text color", () => {
    render(<Button secondary>Secondary</Button>);
    expect(screen.getByRole("button").className).toContain("text-gray-900");
  });

  it("fires onClick and respects disabled", () => {
    const onClick = vi.fn();
    const { rerender } = render(<Button onClick={onClick}>Go</Button>);
    fireEvent.click(screen.getByRole("button"));
    expect(onClick).toHaveBeenCalledTimes(1);

    rerender(<Button disabled>Go</Button>);
    expect(screen.getByRole("button")).toBeDisabled();
  });
});
