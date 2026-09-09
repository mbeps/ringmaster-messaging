import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import axios from "axios";
import UserBox from "@/app/users/components/UserBox";
import { User } from "@prisma/client";
import { API_ROUTES, ROUTES } from "@/libs/routes";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useParams: () => ({}),
  usePathname: () => "/users",
}));

vi.mock("axios");

vi.mock("@/components/Avatar", () => ({
  default: ({ user }: { user: User }) => (
    <div data-testid="avatar" data-user-id={user?.id}>
      Avatar: {user?.name}
    </div>
  ),
}));

vi.mock("@/components/modals/LoadingModal", () => ({
  default: () => <div data-testid="loading-modal">Loading...</div>,
}));

const mockUser: User = {
  id: "user-123",
  name: "Pennywise The Clown",
  email: "pennywise@derry.com",
  emailVerified: null,
  image: "https://derry.com/balloon.png",
  hashedPassword: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

describe("UserBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders user name and avatar", () => {
    render(<UserBox data={mockUser} />);

    expect(screen.getByText("Pennywise The Clown")).toBeInTheDocument();
    const avatar = screen.getByTestId("avatar");
    expect(avatar).toBeInTheDocument();
    expect(avatar).toHaveAttribute("data-user-id", "user-123");
    expect(screen.queryByTestId("loading-modal")).not.toBeInTheDocument();
  });

  it("clicking initiates conversation creation via axios.post and redirects via router.push", async () => {
    let resolvePost: (value: any) => void = () => {};
    const postPromise = new Promise((resolve) => {
      resolvePost = resolve;
    });

    vi.mocked(axios.post).mockReturnValueOnce(postPromise as any);

    render(<UserBox data={mockUser} />);

    const clickableBox = screen
      .getByText("Pennywise The Clown")
      .closest("div[class*='cursor-pointer']");
    expect(clickableBox).not.toBeNull();
    fireEvent.click(clickableBox!);

    // Displays loading modal while the request is in flight
    expect(screen.getByTestId("loading-modal")).toBeInTheDocument();
    expect(axios.post).toHaveBeenCalledTimes(1);
    expect(axios.post).toHaveBeenCalledWith(API_ROUTES.CONVERSATIONS.path, {
      userId: "user-123",
    });
    expect(push).not.toHaveBeenCalled();

    // Resolve API request
    resolvePost({ data: { id: "conv-created-456" } });

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith(
        ROUTES.CONVERSATIONS.detail("conv-created-456")
      );
    });

    // Loading modal dismissed after resolution
    await waitFor(() => {
      expect(screen.queryByTestId("loading-modal")).not.toBeInTheDocument();
    });
  });
});
