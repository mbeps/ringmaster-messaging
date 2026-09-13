import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockMessageRepository } = vi.hoisted(() => ({
  mockMessageRepository: {
    findForConversation: vi.fn(),
  },
}));

vi.mock("@/db/repositories/message-repository", () => ({
  messageRepository: mockMessageRepository,
}));

import getMessages from "@/actions/message/get-messages";

describe("getMessages", () => {
  beforeEach(() => {
    mockMessageRepository.findForConversation.mockReset();
  });

  it("returns the messages for a conversation", async () => {
    const mockMessages = [{ id: "message-1" }];
    mockMessageRepository.findForConversation.mockResolvedValue(mockMessages);

    const result = await getMessages("conversation-1");

    expect(result).toEqual(mockMessages);
    expect(mockMessageRepository.findForConversation).toHaveBeenCalledWith("conversation-1");
  });

  it("returns an empty array when repository throws", async () => {
    mockMessageRepository.findForConversation.mockRejectedValue(new Error("db"));

    const result = await getMessages("conversation-1");

    expect(result).toEqual([]);
  });

  it("returns an empty array when the conversation has no messages", async () => {
    mockMessageRepository.findForConversation.mockResolvedValue([]);

    const result = await getMessages("empty-conversation");

    expect(result).toEqual([]);
  });

  it("queries messages for the conversation", async () => {
    mockMessageRepository.findForConversation.mockResolvedValue([]);

    await getMessages("conversation-2");

    expect(mockMessageRepository.findForConversation).toHaveBeenCalledWith("conversation-2");
  });
});
