import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AuthContext from "@/context/AuthContext";

describe("AuthContext", () => {
  it("renders children as a pass-through provider", () => {
    render(
      <AuthContext>
        <p>hello</p>
      </AuthContext>
    );
    expect(screen.getByText("hello")).toBeInTheDocument();
  });

  it("renders multiple children without wrapping DOM elements", () => {
    const { container } = render(
      <AuthContext>
        <p>one</p>
        <span>two</span>
      </AuthContext>
    );
    expect(screen.getByText("one")).toBeInTheDocument();
    expect(screen.getByText("two")).toBeInTheDocument();
    expect(container.childNodes.length).toBe(2);
  });

  it("renders nothing when no children are provided", () => {
    const { container } = render(<AuthContext>{null}</AuthContext>);
    expect(container.textContent).toBe("");
  });
});
