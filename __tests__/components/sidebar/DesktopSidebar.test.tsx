import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import DesktopSidebar from "@/components/sidebar/DesktopSidebar";
import { ROUTES } from "@/config/routes";
import type { User } from "@prisma/client";

const { push, refresh, signOut } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn().mockResolvedValue({}),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  usePathname: () => "/conversations",
  useParams: () => ({}),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut,
  },
}));

vi.mock("next/image", () => ({
  default: ({ fill, ...props }: Record<string, unknown>) => <img {...props} />,
}));

const currentUser = {
  id: "user-1",
  name: "Jane Doe",
  email: "jane@example.com",
  image: "/images/jane.jpg",
} as unknown as User;

describe("DesktopSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders navigation items", () => {
    render(<DesktopSidebar currentUser={currentUser} />);

    const chatLink = screen.getByRole("link", { name: "Chat" });
    const usersLink = screen.getByRole("link", { name: "Users" });

    expect(chatLink).toBeInTheDocument();
    expect(chatLink).toHaveAttribute("href", ROUTES.CONVERSATIONS.path);

    // Since pathname is /conversations, Chat link should have active styling
    const chatClasses = chatLink.className.split(/\s+/);
    const usersClasses = usersLink.className.split(/\s+/);

    expect(chatClasses).toContain("bg-gray-100");
    expect(chatClasses).toContain("text-black");
    expect(usersClasses).not.toContain("text-black");

    expect(usersLink).toBeInTheDocument();
    expect(usersLink).toHaveAttribute("href", ROUTES.USERS.path);
  });

  it("renders ProfileDropdown with currentUser", async () => {
    render(<DesktopSidebar currentUser={currentUser} />);

    const avatar = screen.getByRole("img");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("src", "/images/jane.jpg");

    // Clicking the avatar opens the ProfileDropdown
    const dropdownButton = screen.getByRole("button");
    await userEvent.click(dropdownButton);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });
});
