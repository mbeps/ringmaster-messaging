import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import EmptyState from "@/components/EmptyState";

describe("EmptyState", () => {
  it("renders the empty state message", () => {
    render(<EmptyState />);
    expect(
      screen.getByText("Select a chat or start a new conversation")
    ).toBeInTheDocument();
  });
});
