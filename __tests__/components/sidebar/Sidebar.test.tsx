import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import Sidebar from "@/components/sidebar/sidebar";
import type { User } from "@prisma/client";

const { getCurrentUser } = vi.hoisted(() => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/actions/user/get-current-user", () => ({
  default: getCurrentUser,
}));

vi.mock("@/components/sidebar/desktop-sidebar", () => ({
  default: ({ currentUser }: { currentUser: User }) => (
    <div data-testid="desktop-sidebar">Desktop: {currentUser?.name}</div>
  ),
}));

vi.mock("@/components/sidebar/mobile-footer", () => ({
  default: ({ currentUser }: { currentUser: User }) => (
    <div data-testid="mobile-footer">Mobile: {currentUser?.name}</div>
  ),
}));

const mockUser = {
  id: "user-1",
  name: "Alice Smith",
  email: "alice@example.com",
} as unknown as User;

describe("Sidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders desktop sidebar, mobile footer, and children", async () => {
    getCurrentUser.mockResolvedValueOnce(mockUser);

    const ui = await Sidebar({
      children: <div data-testid="child-content">Child Content</div>,
    });
    render(ui);

    expect(getCurrentUser).toHaveBeenCalledTimes(1);

    const desktopSidebar = screen.getByTestId("desktop-sidebar");
    expect(desktopSidebar).toBeInTheDocument();
    expect(desktopSidebar).toHaveTextContent("Desktop: Alice Smith");

    const mobileFooter = screen.getByTestId("mobile-footer");
    expect(mobileFooter).toBeInTheDocument();
    expect(mobileFooter).toHaveTextContent("Mobile: Alice Smith");

    const child = screen.getByTestId("child-content");
    expect(child).toBeInTheDocument();
    expect(screen.getByRole("main")).toContainElement(child);
    expect(screen.getByRole("main")).toHaveClass("lg:pl-20", "h-full");
  });
});
