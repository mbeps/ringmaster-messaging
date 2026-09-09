import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import Select from "@/components/inputs/Select";

describe("Select", () => {
  it("renders the label", () => {
    render(
      <Select label="Members" options={[]} onChange={() => {}} />
    );
    expect(screen.getByText("Members")).toBeInTheDocument();
  });

  it("renders a disabled select when disabled", () => {
    const { container } = render(
      <Select label="Members" options={[]} onChange={() => {}} disabled />
    );
    expect(container.querySelector("input")).toBeDisabled();
    expect(container.querySelector('[aria-disabled="true"]')).not.toBeNull();
  });
});
