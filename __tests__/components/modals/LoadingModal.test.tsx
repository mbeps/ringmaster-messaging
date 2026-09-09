import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import LoadingModal from "@/components/modals/LoadingModal";

describe("LoadingModal", () => {
  it("renders a spinner overlay", () => {
    const { container } = render(<LoadingModal />);
    expect(document.querySelector(".modal-backdrop")).toBeInTheDocument();
    expect(container.querySelector("span") || document.querySelector("span")).toBeInTheDocument();
  });

  it("does not render interactive buttons", () => {
    render(<LoadingModal />);
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
  });
});
