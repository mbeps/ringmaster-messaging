import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MessageInput from "@/app/conversations/[conversationId]/components/MessageInput";

describe("MessageInput", () => {
  const defaultRegister = vi.fn(() => ({}));
  const defaultProps = {
    id: "message",
    register: defaultRegister as any,
    errors: {},
  };

  it("renders an input element with the given placeholder and id", () => {
    render(
      <MessageInput
        {...defaultProps}
        placeholder="Write a message"
      />
    );

    const input = screen.getByPlaceholderText("Write a message");
    expect(input).toBeInTheDocument();
    expect(input).toHaveAttribute("id", "message");
    expect(input).toHaveAttribute("autoComplete", "message");
  });

  it("calls register with the correct id and required: true when required is set", () => {
    const registerMock = vi.fn(() => ({}));
    render(
      <MessageInput
        {...defaultProps}
        id="test-input"
        required
        register={registerMock as any}
      />
    );

    expect(registerMock).toHaveBeenCalledWith("test-input", { required: true });
  });

  it("calls register with required: undefined when required is not passed", () => {
    const registerMock = vi.fn(() => ({}));
    render(
      <MessageInput
        {...defaultProps}
        id="optional-input"
        register={registerMock as any}
      />
    );

    expect(registerMock).toHaveBeenCalledWith("optional-input", {
      required: undefined,
    });
  });

  it("applies the specified type attribute", () => {
    render(
      <MessageInput
        {...defaultProps}
        id="password-input"
        type="password"
        placeholder="Enter password"
      />
    );

    const input = screen.getByPlaceholderText("Enter password");
    expect(input).toHaveAttribute("type", "password");
  });

  it("renders disabled input when register returns disabled", () => {
    const registerMock = vi.fn(() => ({
      disabled: true,
      name: "disabled-input",
    }));

    render(
      <MessageInput
        {...defaultProps}
        id="disabled-input"
        placeholder="Disabled input"
        register={registerMock as any}
      />
    );

    const input = screen.getByPlaceholderText("Disabled input");
    expect(input).toBeDisabled();
  });
});
