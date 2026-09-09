import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import Avatar from "@/components/Avatar";
import type { User } from "@prisma/client";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

const user = {
  id: "1",
  name: "Test",
  email: "test@example.com",
  image: "/images/test.jpg",
} as unknown as User;

describe("Avatar", () => {
  it("renders the user image", () => {
    render(<Avatar user={user} />);
    const img = screen.getByRole("img");
    expect(img).toHaveAttribute("src", "/images/test.jpg");
  });

  it("falls back to placeholder when no image", () => {
    render(<Avatar user={{ ...user, image: null }} />);
    expect(screen.getByRole("img")).toHaveAttribute(
      "src",
      "/images/placeholder.jpg"
    );
  });

  it("hides status dot when user not active", () => {
    render(<Avatar user={user} />);
    expect(document.querySelector("span.bg-green-500")).toBeNull();
  });

  it("shows status dot when user is in active list", async () => {
    const useActiveList = (await import("@/hooks/useActiveList")).default;
    useActiveList.getState().set([user.email!]);
    render(<Avatar user={user} />);
    expect(document.querySelector("span.bg-green-500")).not.toBeNull();
  });
});
