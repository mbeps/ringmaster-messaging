import { render } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import RootLoading from "@/app/loading";

describe("RootLoading", () => {
  it("renders the loading component", () => {
    const { container } = render(<RootLoading />);
    expect(container).toBeDefined();
  });
});
