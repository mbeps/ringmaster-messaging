import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import Header from "@/app/conversations/[conversationId]/components/Header";
import useActiveList from "@/hooks/useActiveList";
import { ROUTES } from "@/libs/routes";
import { Conversation, User } from "@prisma/client";

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ conversationId: "c1" }),
  usePathname: () => "/conversations/c1",
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: { user: { email: "me@example.com" } },
    }),
    signIn: { email: vi.fn(), social: vi.fn() },
  },
}));

vi.mock("next/image", () => ({
  default: ({ fill, ...props }: any) => (
    <img {...props} data-fill={fill ? "true" : undefined} />
  ),
}));

vi.mock("axios");

vi.mock("react-hot-toast", () => ({
  default: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }),
  toast: Object.assign(vi.fn(), { error: vi.fn(), success: vi.fn() }),
}));

const currentUser: User = {
  id: "u-me",
  name: "Me",
  email: "me@example.com",
  emailVerified: true,
  image: "https://example.com/me.jpg",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
  conversationIds: ["c1"],
  seenMessageIds: [],
};

const otherUser: User = {
  id: "u-alice",
  name: "Alice Smith",
  email: "alice@example.com",
  emailVerified: true,
  image: "https://example.com/alice.jpg",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
  conversationIds: ["c1"],
  seenMessageIds: [],
};

const thirdUser: User = {
  id: "u-bob",
  name: "Bob Jones",
  email: "bob@example.com",
  emailVerified: true,
  image: null,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
  conversationIds: ["c2"],
  seenMessageIds: [],
};

const directConversation: Conversation & { users: User[] } = {
  id: "c1",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  lastMessageAt: new Date("2025-01-01T00:00:00Z"),
  name: null,
  isGroup: false,
  messagesIds: [],
  userIds: ["u-me", "u-alice"],
  users: [currentUser, otherUser],
};

const groupConversation: Conversation & { users: User[] } = {
  id: "c2",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  lastMessageAt: new Date("2025-01-01T00:00:00Z"),
  name: "Project Alpha",
  isGroup: true,
  messagesIds: [],
  userIds: ["u-me", "u-alice", "u-bob"],
  users: [currentUser, otherUser, thirdUser],
};

describe("Header", () => {
  beforeEach(() => {
    useActiveList.getState().set([]);
  });

  it("renders other user name when conversation name is not specified", () => {
    render(<Header conversation={directConversation} />);

    expect(screen.getByText("Alice Smith")).toBeInTheDocument();
  });

  it("renders conversation name when conversation is named or a group", () => {
    render(<Header conversation={groupConversation} />);

    expect(screen.getByText("Project Alpha")).toBeInTheDocument();
  });

  it("displays 'Offline' status when other user is not active", () => {
    useActiveList.getState().set([]);
    render(<Header conversation={directConversation} />);

    expect(screen.getByText("Offline")).toBeInTheDocument();
  });

  it("displays 'Online' status when other user is in the active list", () => {
    useActiveList.getState().set(["alice@example.com"]);
    render(<Header conversation={directConversation} />);

    expect(screen.getByText("Online")).toBeInTheDocument();
  });

  it("displays member count for group conversations regardless of online status", () => {
    useActiveList.getState().set(["alice@example.com"]);
    render(<Header conversation={groupConversation} />);

    expect(screen.getByText("3 members")).toBeInTheDocument();
    expect(screen.queryByText("Online")).not.toBeInTheDocument();
  });

  it("renders back button link pointing to conversations route", () => {
    render(<Header conversation={directConversation} />);

    const link = screen.getByRole("link");
    expect(link).toHaveAttribute("href", ROUTES.CONVERSATIONS.path);
    expect(link.querySelector("svg")).toBeInTheDocument();
  });

  it("opens profile drawer when ellipsis button is clicked and allows closing it", async () => {
    render(<Header conversation={directConversation} />);

    expect(screen.queryByText("Close panel")).not.toBeInTheDocument();

    const ellipsis = document.querySelector(".justify-between > svg");
    expect(ellipsis).toBeInTheDocument();
    fireEvent.click(ellipsis!);

    expect(await screen.findByText("Close panel")).toBeInTheDocument();
    expect(screen.getByText("Delete")).toBeInTheDocument();

    // Close the drawer
    await userEvent.click(screen.getByText("Close panel"));

    await waitFor(() => {
      expect(screen.queryByText("Close panel")).not.toBeInTheDocument();
    });
  });
});
