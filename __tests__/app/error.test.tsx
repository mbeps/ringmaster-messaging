import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import RootError from "@/app/error";
import { ROUTES } from "@/config/routes";

describe("RootError", () => {
  it("renders error heading, description, and logs error to console", () => {
    const consoleErrorSpy = vi
      .spyOn(console, "error")
      .mockImplementation(() => {});
    const mockError = new Error("Test explosion");
    const mockReset = vi.fn();

    render(<RootError error={mockError} reset={mockReset} />);

    expect(screen.getByText("Error")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /something went wrong!/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/an unexpected error occurred/i),
    ).toBeInTheDocument();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      "Root application error:",
      mockError,
    );

    consoleErrorSpy.mockRestore();
  });

  it("triggers reset when clicking 'Try again'", () => {
    const mockError = new Error("Something broke");
    const mockReset = vi.fn();

    render(<RootError error={mockError} reset={mockReset} />);

    const tryAgainButton = screen.getByRole("button", { name: /try again/i });
    fireEvent.click(tryAgainButton);

    expect(mockReset).toHaveBeenCalledTimes(1);
  });

  it("renders a link to the home route", () => {
    const mockError = new Error("Fatal failure");
    const mockReset = vi.fn();

    render(<RootError error={mockError} reset={mockReset} />);

    const homeLink = screen.getByRole("link", { name: /go to home/i });
    expect(homeLink).toHaveAttribute("href", ROUTES.AUTH.path);
  });
});
