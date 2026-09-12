import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AuthProvider from "@/providers/auth-provider";

describe("AuthProvider", () => {
  it("renders children as a pass-through provider", () => {
    render(
      <AuthProvider>
        <p>hello</p>
      </AuthProvider>
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders multiple children without wrapping DOM elements", () => {
    const { container } = render(
      <AuthProvider>
        <p>one</p>
        <span>two</span>
      </AuthProvider>
    );
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
    expect(container.childNodes.length).toBe(2);
  });

  it("renders nothing when no children are provided", () => {
    const { container } = render(<AuthProvider>{null}</AuthProvider>);
    expect(container.textContent).toBe("");
  });
});
