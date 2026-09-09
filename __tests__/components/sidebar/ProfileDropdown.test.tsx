import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import ProfileDropdown from "@/components/sidebar/ProfileDropdown";
import { ROUTES } from "@/libs/routes";
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
  name: "John Doe",
  email: "john@example.com",
  image: "/images/john.jpg",
} as unknown as User;

describe("ProfileDropdown", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders avatar for current user", () => {
    render(<ProfileDropdown currentUser={currentUser} />);

    const img = screen.getByRole("img");
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute("src", "/images/john.jpg");
    expect(screen.getByRole("button")).toBeInTheDocument();
  });

  it("clicking dropdown button opens menu items (Profile, Logout)", async () => {
    render(<ProfileDropdown currentUser={currentUser} />);

    const button = screen.getByRole("button");
    expect(screen.queryByText("Profile")).not.toBeInTheDocument();
    expect(screen.queryByText("Logout")).not.toBeInTheDocument();

    await userEvent.click(button);

    expect(screen.getByText("Profile")).toBeInTheDocument();
    expect(screen.getByText("Logout")).toBeInTheDocument();
  });

  it("clicking Profile navigates to ROUTES.PROFILE via router.push", async () => {
    render(<ProfileDropdown currentUser={currentUser} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByText("Profile"));

    expect(push).toHaveBeenCalledTimes(1);
    expect(push).toHaveBeenCalledWith(ROUTES.PROFILE);
  });

  it("clicking Logout calls authClient.signOut() and redirects to ROUTES.AUTH", async () => {
    render(<ProfileDropdown currentUser={currentUser} />);

    await userEvent.click(screen.getByRole("button"));
    await userEvent.click(screen.getByText("Logout"));

    expect(signOut).toHaveBeenCalledTimes(1);
    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(ROUTES.AUTH);
    });
  });

  it("applies default left alignment classes", async () => {
    render(<ProfileDropdown currentUser={currentUser} />);

    await userEvent.click(screen.getByRole("button"));

    const menu = screen.getByRole("menu");
    expect(menu.className).toContain("left-0 origin-bottom-left");
    expect(menu.className).not.toContain("right-0 origin-bottom-right");
  });

  it("applies right alignment classes when align='right'", async () => {
    render(<ProfileDropdown currentUser={currentUser} align="right" />);

    await userEvent.click(screen.getByRole("button"));

    const menu = screen.getByRole("menu");
    expect(menu.className).toContain("right-0 origin-bottom-right");
    expect(menu.className).not.toContain("left-0 origin-bottom-left");
  });
});
