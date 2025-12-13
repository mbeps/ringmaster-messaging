import { beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: mockPrisma,
}));

import getMessages from "@/actions/getMessages";

describe("getMessages", () => {
  beforeEach(() => {
    resetPrismaMocks();
  });

  it("returns the messages for a conversation", async () => {
    const mockMessages = [{ id: "message-1" }];
    (mockPrisma.message.findMany as any).mockResolvedValue(mockMessages);

    const result = await getMessages("conversation-1");

    expect(result).toEqual(mockMessages);
    expect(mockPrisma.message.findMany).toHaveBeenCalledWith({
      where: { conversationId: "conversation-1" },
      include: { sender: true, seen: true },
      orderBy: { createdAt: "asc" },
    });
  });

  it("returns an empty array when prisma throws", async () => {
    (mockPrisma.message.findMany as any).mockRejectedValue(new Error("db"));

    const result = await getMessages("conversation-1");

    expect(result).toEqual([]);
  });
});
