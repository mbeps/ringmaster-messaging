import { render, screen } from "@testing-library/react";
import { notFound } from "next/navigation";
import { describe, expect, it, vi } from "vitest";
import getConversationById from "@/actions/conversation/get-conversation-by-id";
import getMessages from "@/actions/message/get-messages";
import ConversationDetailPage from "@/app/conversations/[conversationId]/page";
import type { FullConversationType } from "@/types/conversation/full-conversation";

vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
}));

vi.mock("@/actions/conversation/get-conversation-by-id");
vi.mock("@/actions/message/get-messages");
vi.mock("@/app/conversations/[conversationId]/_components/header", () => ({
  default: () => <div data-testid="mock-header">Mock Header</div>,
}));
vi.mock("@/app/conversations/[conversationId]/_components/body", () => ({
  default: () => <div data-testid="mock-body">Mock Body</div>,
}));
vi.mock("@/app/conversations/[conversationId]/_components/form", () => ({
  default: () => <div data-testid="mock-form">Mock Form</div>,
}));

describe("ConversationDetailPage", () => {
  it("calls notFound when conversation does not exist", async () => {
    vi.mocked(getConversationById).mockResolvedValue(null);
    vi.mocked(getMessages).mockResolvedValue([]);

    const params = Promise.resolve({ conversationId: "non-existent-id" });
    const jsx = await ConversationDetailPage({ params });

    render(jsx ?? <div />);

    expect(notFound).toHaveBeenCalled();
  });

  it("renders header, body, and form when conversation exists", async () => {
    const mockConversation = {
      id: "c1",
      users: [],
    } as unknown as FullConversationType;

    vi.mocked(getConversationById).mockResolvedValue(mockConversation);
    vi.mocked(getMessages).mockResolvedValue([]);

    const params = Promise.resolve({ conversationId: "c1" });
    const jsx = await ConversationDetailPage({ params });

    render(jsx);

    expect(screen.getByTestId("mock-header")).toBeInTheDocument();
    expect(screen.getByTestId("mock-body")).toBeInTheDocument();
    expect(screen.getByTestId("mock-form")).toBeInTheDocument();
  });
});
