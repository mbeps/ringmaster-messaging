import { describe, expect, it, beforeEach, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock("@/actions/getCurrentUser", () => ({
  __esModule: true,
  default: vi.fn(),
}));

import getConversations from "@/actions/getConversations";
import getCurrentUser from "@/actions/getCurrentUser";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetCurrentUser = getCurrentUser as unknown as MockedFn;

describe("getConversations", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockedGetCurrentUser.mockReset();
  });

  it("returns an empty array when the user is missing", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const result = await getConversations();

    expect(result).toEqual([]);
    expect(mockPrisma.conversation.findMany).not.toHaveBeenCalled();
  });

  it("returns conversations when the user exists", async () => {
    const mockConversations = [{ id: "1" }];
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" });
    (mockPrisma.conversation.findMany as any).mockResolvedValue(
      mockConversations
    );

    const result = await getConversations();

    expect(result).toEqual(mockConversations);
    expect(mockPrisma.conversation.findMany).toHaveBeenCalledWith({
      orderBy: { lastMessageAt: "desc" },
      where: { userIds: { has: "user-1" } },
      include: {
        users: true,
        messages: {
          include: {
            sender: true,
            seen: true,
          },
        },
      },
    });
  });

  it("returns an empty array when prisma throws", async () => {
    mockedGetCurrentUser.mockResolvedValue({ id: "user-1" });
    (mockPrisma.conversation.findMany as any).mockRejectedValue(
      new Error("db")
    );

    const result = await getConversations();

    expect(result).toEqual([]);
  });
});
