import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import MessageBox from "@/app/conversations/[conversationId]/components/MessageBox";
import { FullMessageType } from "@/types";
import { User } from "@prisma/client";

const { mockUseSession } = vi.hoisted(() => ({
  mockUseSession: vi.fn(() => ({
    data: { user: { email: "me@example.com" } },
  })),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn(), back: vi.fn() }),
  useParams: () => ({ conversationId: "c1" }),
  usePathname: () => "/conversations/c1",
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    useSession: mockUseSession,
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
  name: "Current User",
  email: "me@example.com",
  emailVerified: true,
  image: "https://example.com/me.jpg",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
  conversationIds: ["c1"],
  seenMessageIds: [],
};

const otherUser: User = {
  id: "u-other",
  name: "Other User",
  email: "other@example.com",
  emailVerified: true,
  image: "https://example.com/other.jpg",
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
  conversationIds: ["c1"],
  seenMessageIds: [],
};

const thirdUser: User = {
  id: "u-third",
  name: "Third User",
  email: "third@example.com",
  emailVerified: true,
  image: null,
  createdAt: new Date("2025-01-01T00:00:00Z"),
  updatedAt: new Date("2025-01-01T00:00:00Z"),
  conversationIds: ["c1"],
  seenMessageIds: [],
};

const baseMessage: FullMessageType = {
  id: "msg-1",
  body: "Hello there!",
  image: null,
  createdAt: new Date("2026-01-01T12:00:00Z"),
  seenIds: [],
  conversationId: "c1",
  senderId: "u-other",
  sender: otherUser,
  seen: [],
};

describe("MessageBox", () => {
  it("renders text message body and sender name", () => {
    render(<MessageBox data={baseMessage} />);

    expect(screen.getByText("Hello there!")).toBeInTheDocument();
    expect(screen.getByText("Other User")).toBeInTheDocument();
  });

  it("applies incoming message styling when sent by another user", () => {
    const { container } = render(<MessageBox data={baseMessage} />);

    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).not.toContain("justify-end");

    const messageText = screen.getByText("Hello there!");
    const bubble = messageText.parentElement as HTMLElement;
    expect(bubble.className).toContain("bg-gray-100");
    expect(bubble.className).not.toContain("bg-red-700");
  });

  it("applies own message styling when sent by the current session user", () => {
    const ownMessage: FullMessageType = {
      ...baseMessage,
      senderId: "u-me",
      sender: currentUser,
    };

    const { container } = render(<MessageBox data={ownMessage} />);

    const rootDiv = container.firstChild as HTMLElement;
    expect(rootDiv.className).toContain("justify-end");

    const messageText = screen.getByText("Hello there!");
    const bubble = messageText.parentElement as HTMLElement;
    expect(bubble.className).toContain("bg-red-700");
    expect(bubble.className).toContain("text-white");
  });

  it("renders image message when data.image is present", () => {
    const imageMessage: FullMessageType = {
      ...baseMessage,
      body: null,
      image: "https://example.com/chat-pic.png",
    };

    render(<MessageBox data={imageMessage} />);

    expect(screen.queryByText("Hello there!")).not.toBeInTheDocument();

    const image = screen.getByAltText("Image");
    expect(image).toBeInTheDocument();
    expect(image).toHaveAttribute("src", "https://example.com/chat-pic.png");
  });

  it("opens image modal when clicking the image message and closes it", async () => {
    const imageMessage: FullMessageType = {
      ...baseMessage,
      body: null,
      image: "https://example.com/chat-pic.png",
    };

    render(<MessageBox data={imageMessage} />);

    const image = screen.getByAltText("Image");
    await userEvent.click(image);

    // ImageModal opens, rendering the modal close button and enlarged image
    expect(screen.getByRole("button")).toBeInTheDocument();

    // Close the modal
    await userEvent.click(screen.getByRole("button"));
  });

  it("displays seen list when isLast is true, message is own, and other users have seen it", () => {
    const ownMessageWithSeen: FullMessageType = {
      ...baseMessage,
      senderId: "u-me",
      sender: currentUser,
      seen: [currentUser, otherUser, thirdUser],
    };

    render(<MessageBox data={ownMessageWithSeen} isLast />);

    expect(
      screen.getByText("Seen by Other User, Third User")
    ).toBeInTheDocument();
  });

  it("does not display seen list when isLast is false", () => {
    const ownMessageWithSeen: FullMessageType = {
      ...baseMessage,
      senderId: "u-me",
      sender: currentUser,
      seen: [otherUser],
    };

    render(<MessageBox data={ownMessageWithSeen} isLast={false} />);

    expect(screen.queryByText(/Seen by/)).not.toBeInTheDocument();
  });

  it("does not display seen list when the message is not own", () => {
    const incomingMessageWithSeen: FullMessageType = {
      ...baseMessage,
      senderId: "u-other",
      sender: otherUser,
      seen: [currentUser],
    };

    render(<MessageBox data={incomingMessageWithSeen} isLast />);

    expect(screen.queryByText(/Seen by/)).not.toBeInTheDocument();
  });

  it("does not display seen list when seen users list only contains the sender", () => {
    const ownMessageSeenOnlyBySelf: FullMessageType = {
      ...baseMessage,
      senderId: "u-me",
      sender: currentUser,
      seen: [currentUser],
    };

    render(<MessageBox data={ownMessageSeenOnlyBySelf} isLast />);

    expect(screen.queryByText(/Seen by/)).not.toBeInTheDocument();
  });
});
