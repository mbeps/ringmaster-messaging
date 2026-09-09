import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import Modal from "@/components/modals/Modal";

describe("Modal", () => {
  it("does not render children when closed", () => {
    render(
      <Modal isOpen={false} onClose={vi.fn()}>
        <p>modal body</p>
      </Modal>,
    );
    expect(screen.queryByText("modal body")).not.toBeInTheDocument();
  });

  it("renders children when open", () => {
    render(
      <Modal isOpen onClose={vi.fn()}>
        <p>modal body</p>
      </Modal>,
    );
    expect(screen.getByText("modal body")).toBeInTheDocument();
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(
      <Modal isOpen onClose={onClose}>
        <p>body</p>
      </Modal>,
    );
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
