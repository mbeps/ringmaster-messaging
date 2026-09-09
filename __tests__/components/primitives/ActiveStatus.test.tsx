import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import ActiveStatus from "@/components/ActiveStatus";

vi.mock("@/hooks/useActiveChannel", () => ({ default: vi.fn() }));

describe("ActiveStatus", () => {
  it("renders null without crashing", () => {
    const { container } = render(<ActiveStatus />);
    expect(container).toBeEmptyDOMElement();
  });
});
