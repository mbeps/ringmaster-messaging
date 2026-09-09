import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { format } from "date-fns";
import ConversationBox from "@/app/conversations/components/ConversationBox";
import { FullConversationType } from "@/types";
import { User } from "@prisma/client";
import { ROUTES } from "@/libs/routes";

const push = vi.fn();
const refresh = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useParams: () => ({}),
  usePathname: () => "/conversations",
}));

const currentUserEmail = "me@example.com";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: {
        user: { email: currentUserEmail, name: "Current User" },
      },
    }),
  },
}));

vi.mock("@/components/Avatar", () => ({
  default: ({ user }: { user: User }) => (
    <div data-testid="avatar" data-user-name={user?.name}>
      Avatar: {user?.name}
    </div>
  ),
}));

vi.mock("@/components/AvatarGroup", () => ({
  default: ({ users }: { users: User[] }) => (
    <div data-testid="avatar-group" data-count={users?.length}>
      AvatarGroup: {users?.length} users
    </div>
  ),
}));

const currentUser: User = {
  id: "user-current",
  name: "Current User",
  email: currentUserEmail,
  emailVerified: null,
  image: null,
  hashedPassword: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const otherUser: User = {
  id: "user-other",
  name: "Alice Wonderland",
  email: "alice@example.com",
  emailVerified: null,
  image: "https://example.com/alice.png",
  hashedPassword: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const thirdUser: User = {
  id: "user-third",
  name: "Bob Builder",
  email: "bob@example.com",
  emailVerified: null,
  image: null,
  hashedPassword: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
};

const createMockConversation = (
  overrides: Partial<FullConversationType> = {}
): FullConversationType => ({
  id: "conv-1",
  createdAt: new Date("2026-01-01T00:00:00Z"),
  lastMessageAt: new Date("2026-01-01T00:00:00Z"),
  name: null,
  isGroup: false,
  messagesIds: [],
  userIds: [currentUser.id, otherUser.id],
  users: [currentUser, otherUser],
  messages: [],
  ...overrides,
});

describe("ConversationBox", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering details", () => {
    it("renders the other user's name for 1-on-1 conversations when name is null", () => {
      const data = createMockConversation({ name: null, isGroup: false });
      render(<ConversationBox data={data} />);

      expect(screen.getByText("Alice Wonderland")).toBeInTheDocument();
    });

    it("renders the explicit conversation name when provided (e.g. for a group chat)", () => {
      const data = createMockConversation({
        name: "Fun Circus Group",
        isGroup: true,
        users: [currentUser, otherUser, thirdUser],
      });
      render(<ConversationBox data={data} />);

      expect(screen.getByText("Fun Circus Group")).toBeInTheDocument();
    });

    it("renders 'No Conversation Yet' when there are no messages", () => {
      const data = createMockConversation({ messages: [] });
      render(<ConversationBox data={data} />);

      expect(screen.getByText("No Conversation Yet")).toBeInTheDocument();
    });

    it("renders the last message body text", () => {
      const data = createMockConversation({
        messages: [
          {
            id: "msg-1",
            body: "First message",
            image: null,
            createdAt: new Date("2026-09-09T10:00:00Z"),
            seenIds: [],
            seen: [],
            conversationId: "conv-1",
            senderId: otherUser.id,
            sender: otherUser,
          },
          {
            id: "msg-2",
            body: "Latest message content",
            image: null,
            createdAt: new Date("2026-09-09T11:00:00Z"),
            seenIds: [],
            seen: [],
            conversationId: "conv-1",
            senderId: otherUser.id,
            sender: otherUser,
          },
        ],
      });
      render(<ConversationBox data={data} />);

      expect(screen.getByText("Latest message content")).toBeInTheDocument();
      expect(screen.queryByText("First message")).not.toBeInTheDocument();
    });

    it("renders 'Image sent' when the last message is an image", () => {
      const data = createMockConversation({
        messages: [
          {
            id: "msg-1",
            body: null,
            image: "https://example.com/photo.png",
            createdAt: new Date("2026-09-09T12:00:00Z"),
            seenIds: [],
            seen: [],
            conversationId: "conv-1",
            senderId: otherUser.id,
            sender: otherUser,
          },
        ],
      });
      render(<ConversationBox data={data} />);

      expect(screen.getByText("Image sent")).toBeInTheDocument();
    });

    it("renders the formatted timestamp of the last message", () => {
      const messageDate = new Date("2026-09-09T14:35:00.000Z");
      const data = createMockConversation({
        messages: [
          {
            id: "msg-1",
            body: "Hello with timestamp",
            image: null,
            createdAt: messageDate,
            seenIds: [],
            seen: [],
            conversationId: "conv-1",
            senderId: otherUser.id,
            sender: otherUser,
          },
        ],
      });
      render(<ConversationBox data={data} />);

      const formattedTime = format(messageDate, "p");
      expect(screen.getByText(formattedTime)).toBeInTheDocument();
    });

    it("does not render a timestamp when messages array is empty", () => {
      const data = createMockConversation({ messages: [] });
      const { container } = render(<ConversationBox data={data} />);

      expect(container.querySelector(".text-gray-400")).toBeNull();
    });
  });

  describe("Navigation / Click redirection", () => {
    it("redirects to the conversation route on click via router.push", () => {
      const data = createMockConversation({ id: "conversation-42" });
      render(<ConversationBox data={data} />);

      const box = screen.getByText("Alice Wonderland").closest("div[class*='cursor-pointer']");
      expect(box).not.toBeNull();
      fireEvent.click(box!);

      expect(push).toHaveBeenCalledTimes(1);
      expect(push).toHaveBeenCalledWith(ROUTES.CONVERSATIONS.detail("conversation-42"));
    });
  });

  describe("Unseen vs Seen message visual indicator", () => {
    it("applies unread/unseen styles (text-black font-medium) when current user has not seen the last message", () => {
      const data = createMockConversation({
        messages: [
          {
            id: "msg-1",
            body: "Unread message",
            image: null,
            createdAt: new Date(),
            seenIds: [otherUser.id],
            seen: [otherUser],
            conversationId: "conv-1",
            senderId: otherUser.id,
            sender: otherUser,
          },
        ],
      });
      render(<ConversationBox data={data} />);

      const messageText = screen.getByText("Unread message");
      expect(messageText).toHaveClass("text-black");
      expect(messageText).toHaveClass("font-medium");
      expect(messageText).not.toHaveClass("text-gray-500");
    });

    it("applies seen styles (text-gray-500) when current user has seen the last message", () => {
      const data = createMockConversation({
        messages: [
          {
            id: "msg-1",
            body: "Read message",
            image: null,
            createdAt: new Date(),
            seenIds: [currentUser.id, otherUser.id],
            seen: [currentUser, otherUser],
            conversationId: "conv-1",
            senderId: otherUser.id,
            sender: otherUser,
          },
        ],
      });
      render(<ConversationBox data={data} />);

      const messageText = screen.getByText("Read message");
      expect(messageText).toHaveClass("text-gray-500");
      expect(messageText).not.toHaveClass("text-black");
    });
  });

  describe("Group chat avatar group vs 1-on-1 avatar", () => {
    it("renders single Avatar for 1-on-1 conversation", () => {
      const data = createMockConversation({ isGroup: false });
      render(<ConversationBox data={data} />);

      expect(screen.getByTestId("avatar")).toBeInTheDocument();
      expect(screen.getByTestId("avatar")).toHaveAttribute("data-user-name", "Alice Wonderland");
      expect(screen.queryByTestId("avatar-group")).not.toBeInTheDocument();
    });

    it("renders AvatarGroup for group chat", () => {
      const data = createMockConversation({
        name: "Dev Team",
        isGroup: true,
        users: [currentUser, otherUser, thirdUser],
      });
      render(<ConversationBox data={data} />);

      expect(screen.getByTestId("avatar-group")).toBeInTheDocument();
      expect(screen.getByTestId("avatar-group")).toHaveAttribute("data-count", "3");
      expect(screen.queryByTestId("avatar")).not.toBeInTheDocument();
    });
  });

  describe("Selected state styling", () => {
    it("applies bg-neutral-100 when selected is true", () => {
      const data = createMockConversation();
      render(<ConversationBox data={data} selected={true} />);

      const box = screen.getByText("Alice Wonderland").closest("div[class*='cursor-pointer']");
      expect(box).toHaveClass("bg-neutral-100");
      expect(box).not.toHaveClass("bg-white");
    });

    it("applies bg-white when selected is false or omitted", () => {
      const data = createMockConversation();
      render(<ConversationBox data={data} selected={false} />);

      const box = screen.getByText("Alice Wonderland").closest("div[class*='cursor-pointer']");
      expect(box).toHaveClass("bg-white");
      expect(box).not.toHaveClass("bg-neutral-100");
    });
  });
});
