import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Input from "@/components/inputs/Input";

describe("Input", () => {
  const defaultProps = {
    register: vi.fn(() => ({})) as any,
    errors: {},
  };

  it("renders a label and input", () => {
    render(<Input id="email" label="Email" {...defaultProps} />);
    expect(screen.getByLabelText("Email")).toBeInTheDocument();
  });

  it("passes disabled through", () => {
    render(<Input id="x" label="X" disabled {...defaultProps} />);
    expect(screen.getByLabelText("X")).toBeDisabled();
  });

  it("renders error message when present", () => {
    render(
      <Input
        id="email"
        label="Email"
        {...defaultProps}
        errors={{ email: { message: "Email is required", type: "required" } }}
      />
    );
    expect(screen.getByText("Email is required")).toBeInTheDocument();
  });
});
