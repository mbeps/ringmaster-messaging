import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import AvatarGroup from "@/components/avatar-group";
import type { User } from "@/types/db";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

const makeUser = (id: string): User =>
  ({ id, image: `/img/${id}.jpg` }) as unknown as User;

describe("AvatarGroup", () => {
  it("renders at most 3 avatars", () => {
    render(<AvatarGroup users={[makeUser("1"), makeUser("2"), makeUser("3"), makeUser("4")]} />);
    expect(screen.getAllByRole("img")).toHaveLength(3);
  });

  it("renders nothing when no users", () => {
    const { container } = render(<AvatarGroup />);
    expect(container.querySelectorAll("img")).toHaveLength(0);
  });
});
