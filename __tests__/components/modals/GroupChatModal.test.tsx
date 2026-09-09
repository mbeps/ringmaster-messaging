import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import toast from "react-hot-toast";
import GroupChatModal from "@/components/modals/GroupChatModal";
import { API_ROUTES } from "@/libs/routes";
import type { User } from "@prisma/client";

const { push, refresh, signOut } = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signOut: vi.fn().mockResolvedValue({}),
}));

vi.mock("axios");

vi.mock("react-hot-toast", () => {
  const t: any = vi.fn();
  t.error = vi.fn();
  t.success = vi.fn();
  return { default: t, toast: t };
});

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

vi.mock("@/components/inputs/Select", () => ({
  default: ({
    label,
    options,
    onChange,
    disabled,
  }: {
    label: string;
    options: { value: string; label: string }[];
    onChange: (val: any) => void;
    disabled?: boolean;
  }) => (
    <div>
      <label htmlFor="members-select-btn">{label}</label>
      <button
        id="members-select-btn"
        type="button"
        data-testid="members-select"
        disabled={disabled}
        onClick={() => onChange(options.slice(0, 2))}
      >
        Select Members
      </button>
    </div>
  ),
}));

const mockUsers = [
  { id: "user-1", name: "Alice", email: "alice@example.com" },
  { id: "user-2", name: "Bob", email: "bob@example.com" },
  { id: "user-3", name: "Charlie", email: "charlie@example.com" },
] as unknown as User[];

describe("GroupChatModal", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("does not render when closed (isOpen={false})", () => {
    render(<GroupChatModal isOpen={false} onClose={vi.fn()} users={mockUsers} />);

    expect(screen.queryByText("Create a group chat")).not.toBeInTheDocument();
  });

  it("renders name input, select members, cancel button, and create button when open", () => {
    render(<GroupChatModal isOpen onClose={vi.fn()} users={mockUsers} />);

    expect(screen.getByText("Create a group chat")).toBeInTheDocument();
    expect(screen.getByText("Create a chat with more than 2 people.")).toBeInTheDocument();
    expect(screen.getByLabelText("Name")).toBeInTheDocument();
    expect(screen.getByText("Members")).toBeInTheDocument();
    expect(screen.getByTestId("members-select")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Cancel" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Create" })).toBeInTheDocument();
  });

  it("calls onClose when Cancel button is clicked", async () => {
    const onClose = vi.fn();
    render(<GroupChatModal isOpen onClose={onClose} users={mockUsers} />);

    await userEvent.click(screen.getByRole("button", { name: "Cancel" }));
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("submits form and calls axios.post(API_ROUTES.CONVERSATIONS.path, data) on valid input", async () => {
    const axios = (await import("axios")).default;
    vi.mocked(axios.post).mockResolvedValueOnce({ data: {} });
    const onClose = vi.fn();

    render(<GroupChatModal isOpen onClose={onClose} users={mockUsers} />);

    await userEvent.type(screen.getByLabelText("Name"), "Engineering Team");
    await userEvent.click(screen.getByTestId("members-select"));

    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(axios.post).toHaveBeenCalledWith(
        API_ROUTES.CONVERSATIONS.path,
        expect.objectContaining({
          name: "Engineering Team",
          members: [{ value: "user-1" }, { value: "user-2" }],
          isGroup: true,
        }),
      );
    });

    await waitFor(() => {
      expect(refresh).toHaveBeenCalledTimes(1);
      expect(onClose).toHaveBeenCalledTimes(1);
    });
  });

  it("displays error toast when form submission fails", async () => {
    const axios = (await import("axios")).default;
    vi.mocked(axios.post).mockRejectedValueOnce(new Error("Network Error"));

    render(<GroupChatModal isOpen onClose={vi.fn()} users={mockUsers} />);

    await userEvent.type(screen.getByLabelText("Name"), "Design Team");
    await userEvent.click(screen.getByTestId("members-select"));

    await userEvent.click(screen.getByRole("button", { name: "Create" }));

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Something went wrong!");
    });
  });
});
