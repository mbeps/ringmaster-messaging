import { fireEvent, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { BsGithub } from "react-icons/bs";
import AuthSocialButton from "@/app/(site)/components/AuthSocialButtont";

describe("AuthSocialButton", () => {
  it("renders a button with the provided icon", () => {
    render(<AuthSocialButton icon={BsGithub} onClick={vi.fn()} />);

    const button = screen.getByRole("button");
    expect(button).toBeInTheDocument();
    expect(button.querySelector("svg")).toBeInTheDocument();
  });

  it("calls onClick handler when clicked with userEvent", async () => {
    const onClick = vi.fn();
    render(<AuthSocialButton icon={BsGithub} onClick={onClick} />);

    const button = screen.getByRole("button");
    await userEvent.click(button);

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("calls onClick handler on click event", () => {
    const onClick = vi.fn();
    render(<AuthSocialButton icon={BsGithub} onClick={onClick} />);

    fireEvent.click(screen.getByRole("button"));

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("renders custom icon component", () => {
    const CustomIcon = () => <span data-testid="custom-social-icon">Google</span>;
    render(<AuthSocialButton icon={CustomIcon} onClick={vi.fn()} />);

    expect(screen.getByTestId("custom-social-icon")).toBeInTheDocument();
  });
});
