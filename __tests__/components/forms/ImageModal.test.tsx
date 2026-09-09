import { describe, expect, it, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import ImageModal from "@/components/modals/ImageModal";

describe("ImageModal", () => {
  it("renders nothing when there is no image source", () => {
    const { container } = render(
      <ImageModal isOpen onClose={vi.fn()} src={null} />,
    );
    expect(container).toBeEmptyDOMElement();
  });

  it("does not render when closed", () => {
    render(<ImageModal isOpen={false} onClose={vi.fn()} src="/images/pic.jpg" />);
    expect(screen.queryByAltText("Image")).not.toBeInTheDocument();
  });

  it("renders the image when open with a source", () => {
    render(<ImageModal isOpen onClose={vi.fn()} src="/images/pic.jpg" />);
    expect(screen.getByAltText("Image")).toHaveAttribute(
      "src",
      expect.stringContaining("pic.jpg"),
    );
  });

  it("calls onClose when the close button is clicked", () => {
    const onClose = vi.fn();
    render(<ImageModal isOpen onClose={onClose} src="/images/pic.jpg" />);
    fireEvent.click(screen.getByRole("button"));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});
