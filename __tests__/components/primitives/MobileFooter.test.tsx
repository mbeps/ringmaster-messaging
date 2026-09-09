import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import MobileFooter from "@/components/sidebar/MobileFooter";
import type { User } from "@prisma/client";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => <img {...props} />,
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), refresh: vi.fn() }),
  usePathname: () => "/conversations",
  useParams: () => ({}),
}));

const currentUser = {
  id: "1",
  name: "Me",
  email: "me@example.com",
  image: null,
} as unknown as User;

describe("MobileFooter", () => {
  it("renders navigation items and profile avatar", () => {
    render(<MobileFooter currentUser={currentUser} />);
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
    expect(screen.getByRole("img")).toBeInTheDocument();
  });
});
