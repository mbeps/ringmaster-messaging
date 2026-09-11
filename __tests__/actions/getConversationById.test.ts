import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { mockPrisma, resetPrismaMocks } from "../mocks/prisma";

vi.mock("@/libs/prismadb", () => ({
  __esModule: true,
  default: mockPrisma,
}));

vi.mock("@/actions/getCurrentUser", () => ({
  __esModule: true,
  default: vi.fn(),
}));

const { mockLog } = vi.hoisted(() => ({
  mockLog: {
    debug: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/lib/logger", () => ({
  getLogger: () => mockLog,
}));

import getConversationById from "@/actions/getConversationById";
import getCurrentUser from "@/actions/getCurrentUser";

type MockedFn = ReturnType<typeof vi.fn>;
const mockedGetCurrentUser = getCurrentUser as unknown as MockedFn;

describe("getConversationById", () => {
  beforeEach(() => {
    resetPrismaMocks();
    mockedGetCurrentUser.mockReset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("returns null when the user is not authenticated", async () => {
    mockedGetCurrentUser.mockResolvedValue(null);

    const result = await getConversationById("test-id");

    expect(result).toBeNull();
    expect(mockPrisma.conversation.findUnique).not.toHaveBeenCalled();
  });

  it("returns the conversation when the user is authenticated", async () => {
    const mockConversation = { id: "abc", users: [] };
    mockedGetCurrentUser.mockResolvedValue({ email: "user@test.com" });
    (mockPrisma.conversation.findUnique as any).mockResolvedValue(
      mockConversation
    );

    const result = await getConversationById("abc");

    expect(result).toEqual(mockConversation);
    expect(mockPrisma.conversation.findUnique).toHaveBeenCalledWith({
      where: { id: "abc" },
      include: { users: true },
    });
  });

  it("returns null and logs when prisma throws", async () => {
    mockedGetCurrentUser.mockResolvedValue({ email: "user@test.com" });
    (mockPrisma.conversation.findUnique as any).mockRejectedValue(
      new Error("db error")
    );

    const result = await getConversationById("abc");

    expect(result).toBeNull();
    expect(mockLog.error).toHaveBeenCalledWith(
      "Failed to fetch conversation by ID (id: {conversationId}): {error}",
      {
        conversationId: "abc",
        error: new Error("db error"),
      },
    );
  });
});
