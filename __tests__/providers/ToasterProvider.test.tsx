import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ToasterProvider from "@/providers/toaster-provider";

describe("ToasterProvider", () => {
  it("renders the toaster container", () => {
    const { container } = render(<ToasterProvider />);
    expect(container.querySelector("[data-rht-toaster]")).toBeInTheDocument();
  });
});
