import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import ToasterContext from "@/context/ToasterContext";

describe("ToasterContext", () => {
  it("renders the toaster container", () => {
    const { container } = render(<ToasterContext />);
    expect(container.querySelector("[data-rht-toaster]")).toBeInTheDocument();
  });
});
