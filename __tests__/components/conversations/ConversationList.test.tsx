import { describe, expect, it, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, act } from "@testing-library/react";
import ConversationList from "@/app/conversations/components/ConversationList";
import { FullConversationType } from "@/types";
import { User } from "@prisma/client";

const push = vi.fn();
const refresh = vi.fn();

let currentParams: { conversationId?: string } = {};

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push, refresh }),
  useParams: () => currentParams,
  usePathname: () => "/conversations",
}));

let currentSessionEmail: string | null | undefined = "me@example.com";

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: () => ({
      data: currentSessionEmail ? { user: { email: currentSessionEmail } } : null,
    }),
  },
}));

const pusherClientMock = vi.hoisted(() => ({
  subscribe: vi.fn(),
  unsubscribe: vi.fn(),
  bind: vi.fn(),
  unbind: vi.fn(),
}));

vi.mock("@/libs/pusher", () => ({
  pusherClient: pusherClientMock,
}));

vi.mock("@/components/modals/GroupChatModal", () => ({
  default: ({
    isOpen,
    onClose,
    users,
  }: {
    isOpen: boolean;
    onClose: () => void;
    users: User[];
  }) =>
    isOpen ? (
      <div data-testid="group-chat-modal" data-user-count={users?.length}>
        <span>Group Chat Modal</span>
        <button onClick={onClose}>Close Group Modal</button>
      </div>
    ) : null,
}));

vi.mock("@/app/conversations/components/ConversationBox", () => ({
  default: ({
    data,
    selected,
  }: {
    data: FullConversationType;
    selected?: boolean;
  }) => (
    <div
      data-testid={`conversation-box-${data.id}`}
      data-selected={selected ? "true" : "false"}
    >
      <span>{data.name || data.id}</span>
      {data.messages?.[data.messages.length - 1]?.body && (
        <span data-testid={`message-${data.id}`}>
          {data.messages[data.messages.length - 1].body}
        </span>
      )}
    </div>
  ),
}));

const makeUser = (id: string, name: string, email: string): User => ({
  id,
  name,
  email,
  emailVerified: null,
  image: null,
  hashedPassword: null,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  updatedAt: new Date("2026-01-01T00:00:00Z"),
});

const makeConversation = (
  id: string,
  name: string | null = null,
  messages: any[] = []
): FullConversationType => ({
  id,
  createdAt: new Date("2026-01-01T00:00:00Z"),
  lastMessageAt: new Date("2026-01-01T00:00:00Z"),
  name,
  isGroup: false,
  messagesIds: [],
  userIds: ["user-1"],
  users: [makeUser("user-1", "User 1", "user1@example.com")],
  messages,
});

describe("ConversationList", () => {
  let pusherHandlers: Record<string, (data: any) => void> = {};

  beforeEach(() => {
    vi.clearAllMocks();
    currentParams = {};
    currentSessionEmail = "me@example.com";
    pusherHandlers = {};

    pusherClientMock.bind.mockImplementation((event: string, handler: any) => {
      pusherHandlers[event] = handler;
    });
  });

  describe("Rendering list of conversations", () => {
    it("renders heading and list of conversations", () => {
      const initialItems = [
        makeConversation("conv-1", "Chat One"),
        makeConversation("conv-2", "Chat Two"),
      ];
      const users = [makeUser("user-1", "User 1", "u1@example.com")];

      render(<ConversationList initialItems={initialItems} users={users} />);

      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.getByTestId("conversation-box-conv-1")).toBeInTheDocument();
      expect(screen.getByTestId("conversation-box-conv-2")).toBeInTheDocument();
    });

    it("renders empty list when initialItems is empty", () => {
      render(<ConversationList initialItems={[]} users={[]} />);

      expect(screen.getByText("Messages")).toBeInTheDocument();
      expect(screen.queryByTestId(/conversation-box-/)).not.toBeInTheDocument();
    });

    it("passes selected=true to ConversationBox matching URL conversationId", () => {
      currentParams = { conversationId: "conv-2" };

      const initialItems = [
        makeConversation("conv-1", "Chat One"),
        makeConversation("conv-2", "Chat Two"),
      ];

      render(<ConversationList initialItems={initialItems} users={[]} />);

      expect(
        screen.getByTestId("conversation-box-conv-1")
      ).toHaveAttribute("data-selected", "false");
      expect(
        screen.getByTestId("conversation-box-conv-2")
      ).toHaveAttribute("data-selected", "true");
    });

    it("applies 'hidden' on mobile aside when a conversation is open", () => {
      currentParams = { conversationId: "conv-1" };
      const { container } = render(
        <ConversationList initialItems={[]} users={[]} />
      );

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("hidden");
    });

    it("applies 'block w-full left-0' on mobile aside when no conversation is open", () => {
      currentParams = {};
      const { container } = render(
        <ConversationList initialItems={[]} users={[]} />
      );

      const aside = container.querySelector("aside");
      expect(aside).toHaveClass("block");
      expect(aside).toHaveClass("w-full");
    });
  });

  describe("Group chat modal interaction", () => {
    it("opens group chat modal when clicking the plus icon button and closes on onClose", () => {
      const users = [
        makeUser("u1", "User 1", "u1@example.com"),
        makeUser("u2", "User 2", "u2@example.com"),
      ];

      const { container } = render(
        <ConversationList initialItems={[]} users={users} />
      );

      expect(screen.queryByTestId("group-chat-modal")).not.toBeInTheDocument();

      // Find plus icon container next to Messages title
      const plusButton = container.querySelector(".cursor-pointer");
      expect(plusButton).not.toBeNull();
      fireEvent.click(plusButton!);

      expect(screen.getByTestId("group-chat-modal")).toBeInTheDocument();
      expect(screen.getByTestId("group-chat-modal")).toHaveAttribute(
        "data-user-count",
        "2"
      );

      // Close modal
      fireEvent.click(screen.getByText("Close Group Modal"));
      expect(screen.queryByTestId("group-chat-modal")).not.toBeInTheDocument();
    });
  });

  describe("Realtime Pusher events", () => {
    it("subscribes to the user's email pusher channel and binds events", () => {
      render(<ConversationList initialItems={[]} users={[]} />);

      expect(pusherClientMock.subscribe).toHaveBeenCalledWith("me@example.com");
      expect(pusherClientMock.bind).toHaveBeenCalledWith(
        "conversation:update",
        expect.any(Function)
      );
      expect(pusherClientMock.bind).toHaveBeenCalledWith(
        "conversation:new",
        expect.any(Function)
      );
      expect(pusherClientMock.bind).toHaveBeenCalledWith(
        "conversation:remove",
        expect.any(Function)
      );
    });

    it("does not subscribe if user has no email in session", () => {
      currentSessionEmail = null;
      render(<ConversationList initialItems={[]} users={[]} />);

      expect(pusherClientMock.subscribe).not.toHaveBeenCalled();
      expect(pusherClientMock.bind).not.toHaveBeenCalled();
    });

    it("handles conversation:new by prepending new conversation to the list", () => {
      const initial = [makeConversation("conv-1", "First Chat")];
      render(<ConversationList initialItems={initial} users={[]} />);

      expect(screen.getByTestId("conversation-box-conv-1")).toBeInTheDocument();
      expect(screen.queryByTestId("conversation-box-conv-new")).not.toBeInTheDocument();

      const newConvo = makeConversation("conv-new", "Brand New Chat");

      act(() => {
        pusherHandlers["conversation:new"](newConvo);
      });

      expect(screen.getByTestId("conversation-box-conv-new")).toBeInTheDocument();
      // Ensure it appears in the DOM
      const allBoxes = screen.getAllByTestId(/conversation-box-/);
      expect(allBoxes[0]).toHaveAttribute("data-testid", "conversation-box-conv-new");
      expect(allBoxes[1]).toHaveAttribute("data-testid", "conversation-box-conv-1");
    });

    it("does not duplicate conversation on conversation:new if already in list", () => {
      const initial = [makeConversation("conv-1", "Existing Chat")];
      render(<ConversationList initialItems={initial} users={[]} />);

      const duplicateConvo = makeConversation("conv-1", "Duplicate Chat");

      act(() => {
        pusherHandlers["conversation:new"](duplicateConvo);
      });

      const allBoxes = screen.getAllByTestId("conversation-box-conv-1");
      expect(allBoxes).toHaveLength(1);
    });

    it("handles conversation:update by updating messages in the matching conversation", () => {
      const initial = [
        makeConversation("conv-1", "Chat One", [{ id: "m1", body: "Original Message" }]),
        makeConversation("conv-2", "Chat Two", [{ id: "m2", body: "Other Message" }]),
      ];
      render(<ConversationList initialItems={initial} users={[]} />);

      expect(screen.getByTestId("message-conv-1")).toHaveTextContent("Original Message");

      const updated = makeConversation("conv-1", "Chat One", [
        { id: "m1", body: "Original Message" },
        { id: "m3", body: "Updated Realtime Message" },
      ]);

      act(() => {
        pusherHandlers["conversation:update"](updated);
      });

      expect(screen.getByTestId("message-conv-1")).toHaveTextContent(
        "Updated Realtime Message"
      );
      // Other conversation remains unchanged
      expect(screen.getByTestId("message-conv-2")).toHaveTextContent("Other Message");
    });

    it("handles conversation:remove by removing the conversation from the list", () => {
      const initial = [
        makeConversation("conv-1", "Chat To Delete"),
        makeConversation("conv-2", "Chat To Keep"),
      ];
      render(<ConversationList initialItems={initial} users={[]} />);

      expect(screen.getByTestId("conversation-box-conv-1")).toBeInTheDocument();
      expect(screen.getByTestId("conversation-box-conv-2")).toBeInTheDocument();

      act(() => {
        pusherHandlers["conversation:remove"]({ id: "conv-1" } as FullConversationType);
      });

      expect(screen.queryByTestId("conversation-box-conv-1")).not.toBeInTheDocument();
      expect(screen.getByTestId("conversation-box-conv-2")).toBeInTheDocument();
    });
  });
});
